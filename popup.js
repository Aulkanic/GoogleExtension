document.addEventListener('DOMContentLoaded', () => {
    // Query the current active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentTab = tabs[0];
  
      // Retrieve the phishing status from storage
      chrome.storage.local.get(['isPhishing'], (result) => {
        const isPhishing = result.isPhishing;
         console.log(result)
        if (isPhishing) {
          document.getElementById('dangerOkButton').addEventListener('click', () => {
            window.close();
          });
        } else {
          document.getElementById('safeOkButton').addEventListener('click', () => {
            window.close();
          });
        }
      });
    });
  });
  