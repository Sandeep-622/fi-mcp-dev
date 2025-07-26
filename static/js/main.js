// 👇 Store sessionId from URL to localStorage
const urlParams = new URLSearchParams(window.location.search);
const sessionId = urlParams.get('sessionId');

if (sessionId) {
    localStorage.setItem('sessionId', sessionId);

    // OPTIONAL: Automatically redirect to /login with sessionId
    // Comment this out if you don't want automatic redirection
    window.location.href = `/login?sessionId=${sessionId}`;
} else {
    console.warn('No sessionId found in URL');
}
document.addEventListener('DOMContentLoaded', function() {
    // Theme toggling
    const themeToggle = document.getElementById('themeToggle');
    const currentTheme = localStorage.getItem('theme') || 'light';
    
    // Set initial theme
    document.documentElement.setAttribute('data-theme', currentTheme);
    updateThemeIcon(currentTheme);
    
    themeToggle.addEventListener('click', function() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        updateThemeIcon(newTheme);
    });
    
    function updateThemeIcon(theme) {
        themeToggle.innerHTML = theme === 'light' ? '🌙' : '☀️';
    }
    
    // Handle form submission
    const promptForm = document.getElementById('promptForm');
    const responseContainer = document.getElementById('responseContainer');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const promptHistory = document.getElementById('promptHistory');
    
    // Tab functionality
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.getAttribute('data-target');
            
            // Remove active class from all tabs and contents
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to current tab and content
            tab.classList.add('active');
            document.getElementById(target).classList.add('active');
        });
    });
    
    // Phone number selection
    const phoneSelect = document.getElementById('phoneNumber');
    phoneSelect.addEventListener('change', function() {
        localStorage.setItem('selectedPhone', this.value);
    });
    
    // Restore selected phone number if available
    const savedPhone = localStorage.getItem('selectedPhone');
    if (savedPhone) {
        phoneSelect.value = savedPhone;
    }
    
    // Form submission
    promptForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const phoneNumber = document.getElementById('phoneNumber').value;
        const userPrompt = document.getElementById('userPrompt').value;
        
        if (!userPrompt.trim()) {
            alert('Please enter a prompt');
            return;
        }
        
        // Show loading indicator
        loadingIndicator.style.display = 'block';
        responseContainer.innerHTML = '';
        
        try {
            const response = await fetch('/api/query', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    phoneNumber: phoneNumber,
                    prompt: userPrompt
                })
            });
            
            if (!response.ok) {
                throw new Error(`Server responded with status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Display the response
            responseContainer.innerHTML = `
                <h3>AI Response:</h3>
                <div class="response-text">${data.response}</div>
            `;
            
            // Add to history
            addToHistory(userPrompt, data.response);
            
        } catch (error) {
            responseContainer.innerHTML = `
                <h3>Error:</h3>
                <div class="response-text">${error.message}</div>
            `;
        } finally {
            // Hide loading indicator
            loadingIndicator.style.display = 'none';
        }
    });
    
    // Function to add item to history
    function addToHistory(prompt, response) {
        // Get existing history or initialize empty array
        let history = JSON.parse(localStorage.getItem('promptHistory') || '[]');
        
        // Add new item to history
        history.unshift({
            id: Date.now(),
            prompt: prompt,
            response: response,
            timestamp: new Date().toLocaleString()
        });
        
        // Limit history to 20 items
        if (history.length > 20) {
            history = history.slice(0, 20);
        }
        
        // Save to local storage
        localStorage.setItem('promptHistory', JSON.stringify(history));
        
        // Update the history display
        displayHistory();
    }
    
    // Function to display history items
    function displayHistory() {
        const history = JSON.parse(localStorage.getItem('promptHistory') || '[]');
        
        if (history.length === 0) {
            promptHistory.innerHTML = '<p>No history yet</p>';
            return;
        }
        
        promptHistory.innerHTML = '';
        
        history.forEach(item => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.innerHTML = `
                <p><strong>${item.timestamp}</strong></p>
                <p>${item.prompt.substring(0, 50)}${item.prompt.length > 50 ? '...' : ''}</p>
            `;
            
            historyItem.addEventListener('click', function() {
                document.getElementById('userPrompt').value = item.prompt;
                responseContainer.innerHTML = `
                    <h3>AI Response:</h3>
                    <div class="response-text">${item.response}</div>
                `;
                
                // Switch to prompt tab
                tabs[0].click();
            });
            
            promptHistory.appendChild(historyItem);
        });
    }
    
    // Initialize history display
    displayHistory();
});
