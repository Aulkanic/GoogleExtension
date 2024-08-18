let urlsToBlock = ['https://www.youtube.com/'];

const fetchThreatData = async () => {
  try {
    console.log('fetching')
    const response = await fetch("https://mailer-sender.vercel.app/openphish");
    if (!response.ok) throw new Error("Failed to fetch OpenPhish data");
    const data = await response.text();
    console.log('extrac')
    const list = data.split("\n").filter((url) => url.trim() !== "");
    urlsToBlock.push(...list)
    updateBlockingRules(urlsToBlock);
  } catch (error) {
    console.error("Error fetching threat data:", error);
  }
};

const updateBlockingRules = (urls) => {
  console.log('here')
  const validUrls = urls.filter(url => url.trim() !== "" && isValidUrl(url));
  const rules = validUrls.map((url, index) => ({
    id: index + 1,
    priority: 1,
    action: { type: "block" },
    condition: { urlFilter: url, resourceTypes: ["main_frame"] },
  }));
  chrome.declarativeNetRequest.updateDynamicRules({
    addRules: rules,
    removeRuleIds: rules.map((rule) => rule.id),
  });
};

const checkURL = (url) => {
  return urlsToBlock.some(phishingUrl => {
    console.log('hello')
    console.log(phishingUrl.trim() === url)
    return url.includes(phishingUrl.trim())
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

chrome.webNavigation.onCompleted.addListener(async (details) => {
  if (details.url && !isInternalPage(details.url)) {
   
    const isPhishing = checkURL(details.url);
    if (isPhishing) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length > 0) {
          const tabId = tabs[0].id;
          chrome.scripting.executeScript({
            target: { tabId: tabId },
            func: () => { console.log("Content script is ready") }
          });
          chrome.tabs.sendMessage(tabs[0].id, {
            action: "showWarning",
            message: "Warning: This site is flagged as dangerous!",
          }, (response) => {
            console.log(response)
            if (chrome.runtime.lastError) {
              console.error("Message failed: ", chrome.runtime.lastError.message);
            } else {
              console.log("Message sent successfully:", response);
            }
          });
        }
      });
    } else{
      chrome.tabs.sendMessage(details.tabId, { 
        action: "showSafe", 
      });
    }
  }
}, { url: [{ urlMatches: 'http://*/*' }, { urlMatches: 'https://*/*' }] });

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  console.log("Tab updated:", tabId);
  console.log("Change info:", changeInfo);
  console.log("Tab details:", tab);

  if (changeInfo.url) {
    console.log("URL updated to:", changeInfo.url);

    const isPhishing = checkURL(changeInfo.url);
    console.log("Is phishing URL:", isPhishing);

    if (isPhishing) {
      console.log("Sending warning message to content script for tab:", tabId);
      chrome.tabs.sendMessage(tabId, { 
        action: "showWarning", 
        message: "Warning: This site is flagged as dangerous!" 
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.error("Message failed:", chrome.runtime.lastError.message);
        } else {
          console.log("Warning message sent successfully.");
        }
      });
    } else {
      console.log("Sending safe message to content script for tab:", tabId);
      chrome.tabs.sendMessage(tabId, { 
        action: "showSafe"
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.error("Message failed:", chrome.runtime.lastError.message);
        } else {
          console.log("Safe message sent successfully.");
        }
      });
    }
  }
});

const isInternalPage = (url) => {
  return url.startsWith('chrome://') || url.startsWith('about:') || url.startsWith('file://');
};

chrome.runtime.onMessage.addListener((message) => {
  console.log("Received message:", message);
  if (message.action === 'blockSite') {
    console.log('run')
    fetchThreatData();
  }
});
fetchThreatData();


