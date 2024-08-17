const fetchThreatData = async () => {
  const urlsToBlock = ["https://mailer-sender.vercel.app/openphish"];

  try {
    const openPhishResponse = await fetch(
      "https://mailer-sender.vercel.app/openphish"
    );
    if (!openPhishResponse.ok)
      throw new Error("Failed to fetch OpenPhish data");
    const openPhishData = await openPhishResponse.text();
    urlsToBlock.push(
      ...openPhishData.split("\n").filter((url) => url.trim() !== "")
    );
    updateBlockingRules(urlsToBlock);
  } catch (error) {
    console.error("Error fetching threat data:", error);
  }
};

const updateBlockingRules = (urls) => {
  const rules = urls.map((url, index) => ({
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

// Fetch threat data initially
fetchThreatData();


const checkURL = async (url, tabId) => {
  try {
      if (url.startsWith('chrome://') || url.startsWith('about:') || url.startsWith('file://')) {
          console.log('Ignoring non-web URL:', url);
          return;
      }

      console.log('Checking URL:', url);
      const response = await fetch('https://mailer-sender.vercel.app/openphish');
      if (!response.ok) throw new Error('Failed to fetch phishing data');
      const data = await response.text();
      const phishingUrls = data.split('\n').filter(line => line.trim() !== '');

      const isPhishing = phishingUrls.some(phishingUrl => url.includes(phishingUrl.trim()));
      console.log('Is this a phishing site?', isPhishing);
      chrome.storage.local.set({ isPhishing, phishingUrl: url }, () => {
        console.log('Phishing status and URL stored.');
    });
    if (isPhishing) {
      console.log('Updating blocking rules with detected phishing URL:', url);
      updateBlockingRules([url]); // Add the detected URL to the blocking rules
    }

  } catch (error) {
      console.error('Error checking URL:', error);
  }
};

chrome.webNavigation.onCompleted.addListener((details) => {
  chrome.tabs.get(details.tabId, (tab) => {
      if (tab.url && !isInternalPage(tab.url)) {
          checkURL(tab.url, details.tabId);
      }
  });
}, { url: [{ urlMatches: 'http://*/*' }, { urlMatches: 'https://*/*' }] });

const isInternalPage = (url) => {
  return url.startsWith('chrome://') || url.startsWith('about:') || url.startsWith('file://');
};