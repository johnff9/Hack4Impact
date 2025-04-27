// popup/popup.js
document.addEventListener('DOMContentLoaded', () => {
    // Existing functionality: Display credibility, AI misuse, and incidents
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const url = new URL(tabs[0].url);
        const domain = url.hostname.replace(/^www\./, '');
        chrome.runtime.sendMessage({ action: 'getDomainData', domain: domain }, (response) => {
            const result = response.result || { credibility: 'unknown', aiMisuse: false, incidents: [] };
            const credibility = result.credibility;
            const aiMisuse = result.aiMisuse;
            const incidents = result.incidents;

            const credibilityElement = document.getElementById('credibility');
            credibilityElement.textContent = `Credibility: ${credibility.charAt(0).toUpperCase() + credibility.slice(1)}`;
            if (credibility === 'high') {
                credibilityElement.style.color = 'green';
            } else if (credibility === 'medium') {
                credibilityElement.style.color = 'yellow';
            } else if (credibility === 'low') {
                credibilityElement.style.color = 'red';
            } else {
                credibilityElement.style.color = 'gray';
            }

            document.getElementById('ai-misuse').textContent = `AI Misuse Detected: ${aiMisuse ? 'Yes' : 'No'}`;

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

    // New functionality: Deepfake image analyzer with file upload
    const analyzeBtn = document.getElementById('analyze-btn');
    const imageFileInput = document.getElementById('image-file');
    const resultElement = document.getElementById('deepfake-result');

    analyzeBtn.addEventListener('click', async () => {
        const file = imageFileInput.files[0];
        if (!file) {
            resultElement.textContent = 'Please select an image file.';
            return;
        }

        // Validate file type and size
        const allowedTypes = ['image/jpeg', 'image/png'];
        const maxSize = 2 * 1024 * 1024; // 2 MB (lowered to be safe)
        if (!allowedTypes.includes(file.type)) {
            resultElement.textContent = 'Only JPEG or PNG images are allowed.';
            return;
        }
        if (file.size > maxSize) {
            resultElement.textContent = 'File size must be less than 2 MB.';
            return;
        }

        resultElement.textContent = 'Analyzing...';

        try {
            // Prepare form data for API request
            const formData = new FormData();
            formData.append('media', file);
            formData.append('models', 'deepfake');
            formData.append('api_user', '224625548'); // Updated with provided user
            formData.append('api_secret', '9ywobsfHtoE6YmWjwX4jB4t7YWR477WD'); // Updated with provided key

            const response = await fetch('https://api.sightengine.com/1.0/check.json', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            if (data.status !== 'success') {
                throw new Error(data.error || 'API request failed');
            }

            const deepfakeScore = data.type.deepfake;
            if (deepfakeScore > 0.7) {
                resultElement.textContent = `High likelihood of deepfake (Score: ${(deepfakeScore * 100).toFixed(2)}%)`;
                resultElement.style.color = 'red';
            } else if (deepfakeScore > 0.3) {
                resultElement.textContent = `Possible deepfake (Score: ${(deepfakeScore * 100).toFixed(2)}%)`;
                resultElement.style.color = 'yellow';
            } else {
                resultElement.textContent = `Likely authentic (Score: ${(deepfakeScore * 100).toFixed(2)}%)`;
                resultElement.style.color = 'green';
            }
        } catch (error) {
            if (error.message.includes('HTTP error')) {
                resultElement.textContent = 'Network error. Please check your connection.';
            } else if (error.message.includes('Invalid API credentials')) {
                resultElement.textContent = 'Invalid API keys. Please check your SightEngine credentials.';
            } else if (error.message.includes('Rate limit exceeded')) {
                resultElement.textContent = 'API rate limit exceeded. Please try again later.';
            } else if (error.message.includes('Invalid media')) {
                resultElement.textContent = 'Invalid image file. Please upload a valid JPEG/PNG.';
            } else {
                resultElement.textContent = `Error analyzing image: ${error.message}`;
            }
            resultElement.style.color = 'gray';
            console.error('Deepfake detection error:', error);
        }
    });
});