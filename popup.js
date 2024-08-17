document.getElementById('update').addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'updateThreatData' });
    alert('Threat data is being updated.');
  });
  