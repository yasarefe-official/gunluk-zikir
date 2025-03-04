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
        
        // Also reset custom zikirs
        const customZikirs = JSON.parse(localStorage.getItem('customZikirs') || '[]');
        if (customZikirs.length > 0) {
            customZikirs.forEach(zikir => {
                zikir.count = 0;
            });
            localStorage.setItem('customZikirs', JSON.stringify(customZikirs));
            renderCustomZikirs();
        }
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
    
    // Clean Arabic text - remove verse numbers
    document.querySelectorAll('.arabic').forEach(element => {
        element.innerHTML = element.innerHTML.replace(/\.\s/g, ''); // Replace period + space with just space
    });
    
    // Custom Zikir Functionality
    const newZikirBtn = document.getElementById('new-zikir-btn');
    const customZikirsTab = document.getElementById('custom') || createCustomZikirsTab();
    const modal = createModal();
    const zikirFullscreen = createZikirFullscreen();
    
    if (document.body) {
        document.body.appendChild(modal);
        document.body.appendChild(zikirFullscreen);
    }
    
    // New Zikir button click handler
    newZikirBtn.addEventListener('click', () => {
        modal.style.display = 'block';
        if (document.getElementById('zikir-form')) {
            document.getElementById('zikir-form').reset();
        }
    });
    
    // Close modal on X click or outside click
    const closeModalBtn = document.querySelector('.close-modal');
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }
    
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    // Save new zikir
    document.getElementById('zikir-form').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const zikirName = document.getElementById('zikir-name').value;
        const zikirArabic = document.getElementById('zikir-arabic').value;
        const zikirOkunus = document.getElementById('zikir-okunus').value;
        const zikirAnlam = document.getElementById('zikir-anlam').value;
        const zikirTarget = document.getElementById('zikir-target').value;
        
        if (!zikirName || !zikirTarget) {
            alert('Lütfen en az zikir adını ve hedef sayısını girin.');
            return;
        }
        
        // Save to localStorage
        const customZikirs = JSON.parse(localStorage.getItem('customZikirs') || '[]');
        const newZikir = {
            id: Date.now(),
            name: zikirName,
            arabic: zikirArabic,
            okunus: zikirOkunus,
            anlam: zikirAnlam,
            target: parseInt(zikirTarget),
            count: 0
        };
        
        customZikirs.push(newZikir);
        localStorage.setItem('customZikirs', JSON.stringify(customZikirs));
        
        // Update UI
        renderCustomZikirs();
        
        // Close modal
        modal.style.display = 'none';
        
        // Switch to custom tab
        document.querySelector('[data-tab="custom"]').click();
    });
    
    // Cancel new zikir
    const cancelZikirBtn = document.querySelector('.cancel-zikir');
    if (cancelZikirBtn) {
        cancelZikirBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }
    
    // Initial render of custom zikirs
    renderCustomZikirs();
    
    // Functions for custom zikir feature
    function createCustomZikirsTab() {
        const tabContent = document.createElement('div');
        tabContent.id = 'custom';
        tabContent.className = 'tab-content';
        
        const heading = document.createElement('h2');
        heading.textContent = 'ÖZEL ZİKİRLERİM';
        tabContent.appendChild(heading);
        
        document.querySelector('main').appendChild(tabContent);
        
        // Add tab button if it doesn't exist
        if (!document.querySelector('[data-tab="custom"]')) {
            const tabButton = document.createElement('button');
            tabButton.className = 'tab-button';
            tabButton.setAttribute('data-tab', 'custom');
            tabButton.textContent = 'Özel Zikirlerim';
            
            document.querySelector('.tab-container').insertBefore(
                tabButton, 
                document.getElementById('new-zikir-btn')
            );
            
            // Add event listener
            tabButton.addEventListener('click', () => {
                document.querySelectorAll('.tab-button').forEach(btn => {
                    btn.classList.remove('active');
                });
                tabButton.classList.add('active');
                
                document.querySelectorAll('.tab-content').forEach(content => {
                    content.classList.remove('active');
                });
                tabContent.classList.add('active');
            });
        }
        
        return tabContent;
    }
    
    function createModal() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <h2>Yeni Zikir Ekle</h2>
                <form id="zikir-form">
                    <div class="form-group">
                        <label for="zikir-name">Zikir Adı *</label>
                        <input type="text" id="zikir-name" required>
                    </div>
                    <div class="form-group">
                        <label for="zikir-arabic">Arapça Metin</label>
                        <textarea id="zikir-arabic"></textarea>
                    </div>
                    <div class="form-group">
                        <label for="zikir-okunus">Okunuşu</label>
                        <textarea id="zikir-okunus"></textarea>
                    </div>
                    <div class="form-group">
                        <label for="zikir-anlam">Anlamı</label>
                        <textarea id="zikir-anlam"></textarea>
                    </div>
                    <div class="form-group">
                        <label for="zikir-target">Hedef Sayı *</label>
                        <input type="number" id="zikir-target" min="1" value="33" required>
                    </div>
                    <div class="form-buttons">
                        <button type="button" class="cancel-zikir">İptal</button>
                        <button type="submit" class="save-zikir">Kaydet</button>
                    </div>
                </form>
            </div>
        `;
        return modal;
    }
    
    function createZikirFullscreen() {
        const fullscreen = document.createElement('div');
        fullscreen.className = 'zikir-fullscreen';
        fullscreen.innerHTML = `
            <div class="fullscreen-header">
                <h2 class="fullscreen-title"></h2>
                <button class="close-fullscreen">&times;</button>
            </div>
            <div class="fullscreen-content">
                <div class="fullscreen-arabic"></div>
                <div class="fullscreen-counter">0</div>
                <div class="fullscreen-progress">
                    <div class="progress-bar"></div>
                </div>
            </div>
        `;
        
        // Close button handler
        fullscreen.querySelector('.close-fullscreen').addEventListener('click', () => {
            fullscreen.style.display = 'none';
            // Save current count back to main list
            const zikirId = parseInt(fullscreen.getAttribute('data-zikir-id'));
            const currentCount = parseInt(fullscreen.querySelector('.fullscreen-counter').textContent);
            
            saveCustomZikirCount(zikirId, currentCount);
            renderCustomZikirs();
        });
        
        // Click anywhere to increment counter
        fullscreen.addEventListener('click', (e) => {
            // Only increment if not clicking on close button
            if (e.target.className !== 'close-fullscreen' && !e.target.closest('.fullscreen-header')) {
                const counterEl = fullscreen.querySelector('.fullscreen-counter');
                const progressBar = fullscreen.querySelector('.progress-bar');
                const zikirId = parseInt(fullscreen.getAttribute('data-zikir-id'));
                const zikirTarget = parseInt(fullscreen.getAttribute('data-zikir-target'));
                
                let count = parseInt(counterEl.textContent);
                if (count < zikirTarget) {
                    count++;
                    counterEl.textContent = count;
                    
                    // Update progress bar
                    const progress = (count / zikirTarget) * 100;
                    progressBar.style.width = `${progress}%`;
                    
                    // Save progress
                    saveCustomZikirCount(zikirId, count);
                }
            }
        });
        
        return fullscreen;
    }
    
    function renderCustomZikirs() {
        const customZikirs = JSON.parse(localStorage.getItem('customZikirs') || '[]');
        const tabContent = document.getElementById('custom');
        
        // Clear existing content except the heading
        const heading = tabContent.querySelector('h2');
        tabContent.innerHTML = '';
        tabContent.appendChild(heading);
        
        if (customZikirs.length === 0) {
            const emptyState = document.createElement('div');
            emptyState.className = 'empty-state';
            emptyState.innerHTML = `
                <div class="empty-state-icon">✚</div>
                <p>Henüz özel zikir eklemediniz.</p>
                <p>"+ Yeni Zikir" butonuna tıklayarak kendi zikirlerinizi ekleyebilirsiniz.</p>
            `;
            tabContent.appendChild(emptyState);
            return;
        }
        
        customZikirs.forEach(zikir => {
            const zikirItem = document.createElement('div');
            zikirItem.className = 'zikir-item custom-zikir-item';
            zikirItem.dataset.id = zikir.id;
            
            if (zikir.count >= zikir.target) {
                zikirItem.classList.add('completed');
            }
            
            let html = `<h3>${zikir.name}</h3>`;
            
            if (zikir.arabic) {
                html += `<div class="arabic">${zikir.arabic}</div>`;
            }
            
            if (zikir.okunus) {
                html += `
                    <div class="okunusu">
                        <span class="okunusu-title">Okunuşu:</span> ${zikir.okunus}
                    </div>
                `;
            }
            
            if (zikir.anlam) {
                html += `<div class="anlam">${zikir.anlam}</div>`;
            }
            
            html += `
                <button class="counter-button ${zikir.count >= zikir.target ? 'completed' : ''}" data-count="${zikir.target}">
                    <span class="count">${zikir.count}</span>
                    <span class="target">/${zikir.target}</span>
                </button>
                <button class="delete-zikir">×</button>
            `;
            
            zikirItem.innerHTML = html;
            tabContent.appendChild(zikirItem);
            
            // Counter button handler
            zikirItem.querySelector('.counter-button').addEventListener('click', () => {
                openZikirFullscreen(zikir);
            });
            
            // Delete button handler
            zikirItem.querySelector('.delete-zikir').addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm('Bu zikiri silmek istediğinizden emin misiniz?')) {
                    deleteCustomZikir(zikir.id);
                    renderCustomZikirs();
                }
            });
        });
    }
    
    function openZikirFullscreen(zikir) {
        const fullscreen = document.querySelector('.zikir-fullscreen');
        fullscreen.setAttribute('data-zikir-id', zikir.id);
        fullscreen.setAttribute('data-zikir-target', zikir.target);
        
        fullscreen.querySelector('.fullscreen-title').textContent = zikir.name;
        fullscreen.querySelector('.fullscreen-arabic').textContent = zikir.arabic || '';
        fullscreen.querySelector('.fullscreen-counter').textContent = zikir.count;
        
        // Set progress bar
        const progress = (zikir.count / zikir.target) * 100;
        fullscreen.querySelector('.progress-bar').style.width = `${progress}%`;
        
        fullscreen.style.display = 'block';
    }
    
    function saveCustomZikirCount(zikirId, count) {
        const customZikirs = JSON.parse(localStorage.getItem('customZikirs') || '[]');
        const index = customZikirs.findIndex(z => z.id === zikirId);
        
        if (index !== -1) {
            customZikirs[index].count = count;
            localStorage.setItem('customZikirs', JSON.stringify(customZikirs));
        }
    }
    
    function deleteCustomZikir(zikirId) {
        const customZikirs = JSON.parse(localStorage.getItem('customZikirs') || '[]');
        const updatedZikirs = customZikirs.filter(z => z.id !== zikirId);
        localStorage.setItem('customZikirs', JSON.stringify(updatedZikirs));
    }
});