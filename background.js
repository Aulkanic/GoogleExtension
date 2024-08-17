const fetchThreatData = async () => {
  const urlsToBlock = [];

  try {
      // Fetch from OpenPhish
      const openPhishResponse = await fetch('https://openphish.com/feed.txt');
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


