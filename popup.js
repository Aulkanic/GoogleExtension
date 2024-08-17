document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.local.get(['isPhishing'], (result) => {
        const isPhishing = result.isPhishing;

        if (isPhishing) {
            // Redirect to danger.html
            fetch(chrome.runtime.getURL('danger.html'))
                .then(response => response.text())
                .then(text => {
                    document.body.innerHTML = text;
                });
        } else {
            // Redirect to safe.html
            fetch(chrome.runtime.getURL('safe.html'))
                .then(response => response.text())
                .then(text => {
                    document.body.innerHTML = text;
                });
        }
    });
});
