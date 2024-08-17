document.getElementById('updateBlacklist').addEventListener('click', () => {
  chrome.runtime.sendMessage({ action: 'updateBlacklist' }, (response) => {
      if (response.success) {
          alert('Blacklist updated successfully!');
      } else {
          alert('Failed to update blacklist.');
      }
  });
});
