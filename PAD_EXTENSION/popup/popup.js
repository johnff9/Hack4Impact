// popup/popup.js
document.addEventListener('DOMContentLoaded', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const url = new URL(tabs[0].url);
        const domain = url.hostname.replace(/^www\./, '');
        chrome.runtime.sendMessage({ action: 'getDomainData', domain: domain }, (response) => {
            const result = response.result || { credibility: 'unknown', aiMisuse: false, incidents: [] };
            const credibility = result.credibility;
            const aiMisuse = result.aiMisuse;
            const incidents = result.incidents;

            // Set credibility display with classes for grey shades
            const credibilityElement = document.getElementById('credibility');
            credibilityElement.textContent = `Credibility: ${credibility.charAt(0).toUpperCase() + credibility.slice(1)}`;
            credibilityElement.className = ''; // Clear any existing classes
            if (credibility === 'high') {
                credibilityElement.classList.add('high'); // Light grey
            } else if (credibility === 'medium') {
                credibilityElement.classList.add('medium'); // Medium grey
            } else if (credibility === 'low') {
                credibilityElement.classList.add('low'); // White on darkest grey
            }

            // Set AI misuse display
            document.getElementById('ai-misuse').textContent = `AI Misuse Detected: ${aiMisuse ? 'Yes' : 'No'}`;

            // Display up to 3 recent incidents, sorted by year (descending)
            const incidentsElement = document.getElementById('incidents');
            if (incidents.length === 0) {
                incidentsElement.innerHTML = '<li>No known misinformation incidents.</li>';
            } else {
                incidentsElement.innerHTML = incidents
                    .sort((a, b) => b.year - a.year)
                    .slice(0, 3)
                    .map(incident => `<li>${incident.year}: ${incident.description}</li>`)
                    .join('');
            }
        });
    });
});