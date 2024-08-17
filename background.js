const fetchThreatData = async () => {
    const urlsToBlock = [];
  
    const openPhishResponse = await fetch('https://openphish.com/feed.txt');
    const openPhishData = await openPhishResponse.text();
    console.log(openPhishData)
  
    urlsToBlock.push(...openPhishData.split('\n').filter(url => url));
  
    // Here you can add similar fetch calls to URLScan.io and Hybrid AnalysisupdateBlockingRules(urlsToBlock);
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
  
  setInterval(fetchThreatData, 3600000);
  