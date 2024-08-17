const fetchThreatData = async () => {
  const urlsToBlock = ['http://localhost:5173/'];

  try {
    const openPhishResponse = await fetch('https://mailer-sender.vercel.app/openphish');
    if (!openPhishResponse.ok) throw new Error('Failed to fetch OpenPhish data');
    const openPhishData = await openPhishResponse.text();
    urlsToBlock.push(...openPhishData.split('\n').filter(url => url.trim() !== ''));
    updateBlockingRules(urlsToBlock);

  } catch (error) {
    console.error('Error fetching threat data:', error);
  }
};

const updateBlockingRules = (urls) => {
  const rules = urls.map((url, index) => ({
    id: index + 1,
    priority: 1,
    action: { type: "block" },
    condition: { urlFilter: url, resourceTypes: ["main_frame"] }
  }));

  chrome.declarativeNetRequest.updateDynamicRules({
    addRules: rules,
    removeRuleIds: rules.map(rule => rule.id)
  });
};

// Fetch threat data initially
fetchThreatData();

// Listen for tab updates and check the URL
chrome.webNavigation.onCompleted.addListener((details) => {
  chrome.tabs.get(details.tabId, (tab) => {
    if (tab.url) {
      checkURL(tab.url, details.tabId);
    }
  });
}, { url: [{ urlMatches: '.*' }] });

const checkURL = async (url, tabId) => {
  try {
    const response = await fetch('https://mailer-sender.vercel.app/openphish');
    const data = await response.text();
    const phishingUrls = data.split('\n').filter(line => line.trim() !== '');

    if (phishingUrls.some(phishingUrl => url.includes(phishingUrl))) {
      chrome.windows.create({
        url: 'popup.html',
        type: 'popup',
        width: 400,
        height: 300,
        focused: true
      });
    }
  } catch (error) {
    console.error('Error checking URL:', error);
  }
};
