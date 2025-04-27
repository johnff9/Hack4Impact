// background.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getDomainData') {
        const domain = request.domain.toLowerCase();
        fetch(chrome.runtime.getURL('data.json'))
            .then(response => response.json())
            .then(data => {
                const domainData = data.domains.find(item => item.domain.toLowerCase() === domain) || {
                    credibility: 'unknown',
                    aiMisuse: false,
                    incidents: []
                };
                sendResponse({ result: domainData });
            })
            .catch(error => {
                console.error('Error fetching data.json:', error);
                sendResponse({ result: { credibility: 'unknown', aiMisuse: false, incidents: [] } });
            });
        return true;
    }
});