let urlsToBlock = ['https://www.youtube.com/'];

const fetchThreatData = async () => {
  try {
    console.log('Fetching threat data...');
    const response = await fetch("https://mailer-sender.vercel.app/openphish");
    if (!response.ok) throw new Error("Failed to fetch OpenPhish data");
    const data = await response.text();
    console.log('Data extracted');
    const list = data.split("\n").filter(url => url.trim() !== "");
    urlsToBlock.push(...list);
    updateBlockingRules(urlsToBlock);
  } catch (error) {
    console.error("Error fetching threat data:", error);
  }
};

const updateBlockingRules = (urls) => {
  console.log('Updating blocking rules...');
  const validUrls = urls.filter(url => url.trim() !== "" && isValidUrl(url));
  console.log("Valid URLs:", validUrls);
  
  const rules = validUrls.map((url, index) => ({
    id: index + 1,
    priority: 1,
    action: { type: "block" },
    condition: { urlFilter: url, resourceTypes: ["main_frame"] },
  }));
  
  console.log("Blocking Rules:", rules);

  chrome.declarativeNetRequest.updateDynamicRules({
    addRules: rules,
    removeRuleIds: rules.map(rule => rule.id),
  }, () => {
    if (chrome.runtime.lastError) {
      console.error("Error updating rules:", chrome.runtime.lastError);
    } else {
      console.log("Rules updated successfully.");
    }
  });
};



const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch (_) {
    return false;
  }
};

const checkURL = (url) => {
  const match = urlsToBlock.some(phishingUrl => url.includes(phishingUrl.trim()));
  console.log(`Checking URL: ${url}, Match found: ${match}`);
  return match;
};

chrome.webNavigation.onCompleted.addListener((details) => {
  if (details.frameId === 0) { // Check for the main frame
    if (details.url && !isInternalPage(details.url)) {
      const isPhishing = checkURL(details.url);
      if (isPhishing) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs.length > 0) {
            const tabId = tabs[0].id;
            chrome.scripting.executeScript({
              target: { tabId: tabId, allFrames: false },
              files: ["content.js"]
            }, () => {
              console.log("Injected content.js into", details.url);
              if (chrome.runtime.lastError) {
                console.error("Failed to inject script:", chrome.runtime.lastError.message);
                if (chrome.runtime.lastError.message.includes("Frame with ID 0 is showing error page")) {
                  console.log("Opening a new tab with warning content.");
                  chrome.tabs.update(tabId, {
                    url: chrome.runtime.getURL("popup.html")
                  });
                }
              } else {
                chrome.tabs.sendMessage(tabId, {
                  action: "showWarning",
                  message: "Warning: This site is flagged as dangerous!",
                });
              }

            });
          }
        });
      } else {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs.length > 0) {
            const tabId = tabs[0].id;
            chrome.tabs.sendMessage(tabId, {
              action: "showSafe",
            });
          }
        });
      }
    }
  }
}, { url: [{ urlMatches: 'http://*/*' }, { urlMatches: 'https://*/*' }] });


chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.url) {
    console.log("URL updated to:", changeInfo.url);

    const isPhishing = checkURL(changeInfo.url);
    const action = isPhishing ? "showWarning" : "showSafe";
    const message = isPhishing ? { action, message: "Warning: This site is flagged as dangerous!" } : { action };

    chrome.scripting.executeScript({
      target: { tabId: tabId, allFrames: false },
      files: ["content.js"]
    }, () => {
      console.log("Injected content.js into", changeInfo.url);
      if (chrome.runtime.lastError) {
        console.error("Failed to inject script:", chrome.runtime.lastError.message);
        if (chrome.runtime.lastError.message.includes("Frame with ID 0 is showing error page")) {
          console.log("Opening a new tab with warning content.");
          chrome.tabs.update(tabId, {
            url: chrome.runtime.getURL("popup.html")
          });
        }
      } else {
        chrome.tabs.sendMessage(tabId, message);
      }
    });
  }
});

const isInternalPage = (url) => url.startsWith('chrome://') || url.startsWith('about:') || url.startsWith('file://');

chrome.runtime.onMessage.addListener((message) => {
  console.log("Received message:", message);
  if (message.action === 'blockSite') {
    fetchThreatData();
  }
});

fetchThreatData();