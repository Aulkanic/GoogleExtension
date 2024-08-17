// Listen for messages from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'showNotification') {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icon.png',
        title: request.title,
        message: request.message,
        priority: 2
      });
    }
});
