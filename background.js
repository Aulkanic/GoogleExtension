let urlsToBlock = [];

const fetchThreatData = async () => {
  try {
    const response = await fetch("https://mailer-sender.vercel.app/openphish");
    if (!response.ok) throw new Error("Failed to fetch OpenPhish data");
    const data = await response.text();
    const list = data.split("\n").filter((url) => url.trim() !== "");
    urlsToBlock.push(...list)
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

const checkURL = (url) => {
  return urlsToBlock.some(phishingUrl => url.includes(phishingUrl.trim()));
};

chrome.webNavigation.onCompleted.addListener(async (details) => {
  if (details.url && !isInternalPage(details.url)) {
    const isPhishing = checkURL(details.url);
    if (isPhishing) {
      // Send a message to the content script to display a warning
      chrome.tabs.sendMessage(details.tabId, { 
        action: "showWarning", 
        message: "Warning: This site is flagged as dangerous!" 
      });

      // Apply blocking rules after a slight delay to ensure the message is displayed
      setTimeout(() => {
        updateBlockingRules(urlsToBlock);
      }, 3000); // Adjust the delay as needed
    } else{
      chrome.tabs.sendMessage(details.tabId, { 
        action: "showSafe", 
      });
    }
  }
}, { url: [{ urlMatches: 'http://*/*' }, { urlMatches: 'https://*/*' }] });

const isInternalPage = (url) => {
  return url.startsWith('chrome://') || url.startsWith('about:') || url.startsWith('file://');
};

chrome.runtime.onMessage.addListener((message) => {
  if (message.action === 'blockSite') {
    console.log('run')
    fetchThreatData(); // Refresh threat data and update blocking rules
  }
});
// fetchThreatData();
