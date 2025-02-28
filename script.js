document.addEventListener('DOMContentLoaded', function() {
    // Tab switching
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            tabButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            button.classList.add('active');
            
            // Hide all tab contents
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Show the selected tab content
            const tabId = button.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });
    
    // Counter functionality - improved
    const counterButtons = document.querySelectorAll('.counter-button');
    
    counterButtons.forEach(button => {
        // Get button ID more reliably
        const parentItem = button.closest('.zikir-item');
        const buttonId = parentItem.querySelector('h3').textContent.trim();
        const savedCount = localStorage.getItem(buttonId);
        const countElement = button.querySelector('.count');
        const targetCount = parseInt(button.getAttribute('data-count'));
        
        // Load saved count from localStorage if available
        if (savedCount) {
            countElement.textContent = savedCount;
            
            // Mark as completed if count reached target
            if (parseInt(savedCount) >= targetCount) {
                button.classList.add('completed');
                parentItem.classList.add('completed');
            }
        }
        
        // Improved click event handler
        button.addEventListener('click', function(e) {
            e.preventDefault(); // Prevent any default behavior
            
            const currentCount = parseInt(countElement.textContent);
            
            // Increment count if not at target
            if (currentCount < targetCount) {
                const newCount = currentCount + 1;
                countElement.textContent = newCount;
                
                // Save to localStorage with date
                localStorage.setItem(buttonId, newCount);
                
                // Check if target reached
                if (newCount >= targetCount) {
                    button.classList.add('completed');
                    parentItem.classList.add('completed');
                    
                    // Add animation when completed
                    parentItem.style.transition = 'background-color 0.5s ease';
                }
            }
        });
    });
    
    // Check if we need to reset counters (new day)
    checkDailyReset();
    
    // Reset all counters
    const resetButton = document.getElementById('reset-all');
    
    resetButton.addEventListener('click', () => {
        if (confirm('Tüm sayaçları sıfırlamak istediğinizden emin misiniz?')) {
            resetAllCounters();
        }
    });
    
    // Function to reset all counters
    function resetAllCounters() {
        counterButtons.forEach(button => {
            button.querySelector('.count').textContent = '0';
            button.classList.remove('completed');
            
            const parentItem = button.closest('.zikir-item');
            parentItem.classList.remove('completed');
            
            const buttonId = parentItem.querySelector('h3').textContent.trim();
            localStorage.removeItem(buttonId);
        });
        
        // Update the last reset date to today
        localStorage.setItem('lastResetDate', getCurrentDateString());
    }
    
    // Add long-press functionality for mobile (improved)
    counterButtons.forEach(button => {
        let pressTimer;
        let isLongPress = false;
        
        button.addEventListener('touchstart', function(e) {
            isLongPress = false;
            pressTimer = window.setTimeout(function() {
                isLongPress = true;
                resetSingleCounter(button);
            }, 800);
        });
        
        button.addEventListener('touchend', function(e) {
            clearTimeout(pressTimer);
            if (isLongPress) {
                e.preventDefault(); // Prevent click if this was a long press
            }
        });
        
        button.addEventListener('touchcancel', function(e) {
            clearTimeout(pressTimer);
        });
        
        // Handle mouse events for desktop
        button.addEventListener('mousedown', function(e) {
            isLongPress = false;
            pressTimer = window.setTimeout(function() {
                isLongPress = true;
                resetSingleCounter(button);
            }, 800);
        });
        
        button.addEventListener('mouseup', function(e) {
            clearTimeout(pressTimer);
            if (isLongPress) {
                e.preventDefault(); // Prevent click if this was a long press
            }
        });
        
        button.addEventListener('mouseleave', function(e) {
            clearTimeout(pressTimer);
        });
    });
    
    function resetSingleCounter(button) {
        const countElement = button.querySelector('.count');
        countElement.textContent = '0';
        button.classList.remove('completed');
        
        const parentItem = button.closest('.zikir-item');
        parentItem.classList.remove('completed');
        
        const buttonId = parentItem.querySelector('h3').textContent.trim();
        localStorage.removeItem(buttonId);
        
        // Visual feedback for reset
        button.classList.add('reset-flash');
        setTimeout(() => {
            button.classList.remove('reset-flash');
        }, 300);
    }
    
    // Theme toggle functionality
    const themeToggle = document.getElementById('theme-toggle');
    const moonIcon = document.getElementById('moon-icon');
    const sunIcon = document.getElementById('sun-icon');
    
    // Check for saved theme preference or use preferred color scheme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.body.classList.add('dark-mode');
        moonIcon.style.display = 'none';
        sunIcon.style.display = 'block';
    } else {
        sunIcon.style.display = 'none';
    }
    
    // Toggle theme
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        
        // Update localStorage and icons based on current mode
        if (document.body.classList.contains('dark-mode')) {
            localStorage.setItem('theme', 'dark');
            moonIcon.style.display = 'none';
            sunIcon.style.display = 'block';
        } else {
            localStorage.setItem('theme', 'light');
            moonIcon.style.display = 'block';
            sunIcon.style.display = 'none';
        }
    });
    
    // Daily reset functions
    function getCurrentDateString() {
        const now = new Date();
        return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
    }
    
    function checkDailyReset() {
        const today = getCurrentDateString();
        const lastResetDate = localStorage.getItem('lastResetDate');
        
        // If it's a new day (or first time), reset all counters
        if (!lastResetDate || lastResetDate !== today) {
            resetAllCounters();
            
            // Show reset notification
            showResetNotification();
        }
    }
    
    function showResetNotification() {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'reset-notification';
        notification.innerHTML = 'Yeni gün başladı. Tüm zikirler sıfırlandı. <span class="close-notification">×</span>';
        
        // Add to document
        document.body.appendChild(notification);
        
        // Show with animation
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        // Auto hide after 5 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 500);
        }, 5000);
        
        // Add close button functionality
        notification.querySelector('.close-notification').addEventListener('click', () => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 500);
        });
    }
});