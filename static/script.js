document.addEventListener('DOMContentLoaded', function() {
    // Mobile Navigation
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
        
        // Close menu when clicking on a link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
            });
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
            }
        });
    }
    
    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    let lastScrollTop = 0;
    
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > 100) {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.boxShadow = 'none';
        }
        
        lastScrollTop = scrollTop;
    });
    
    // Form handling
    const form = document.getElementById('cropForm');
    const loading = document.getElementById('loading');
    const results = document.getElementById('results');

    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Show loading
            loading.style.display = 'flex';
            results.style.display = 'none';
            document.body.style.overflow = 'hidden';
            
            // Collect form data
            const formData = new FormData(form);
            const data = {};
            formData.forEach((value, key) => {
                data[key] = parseFloat(value);
            });
            
            try {
                // Send request to Flask backend
                const response = await fetch('/predict', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data)
                });
                
                const result = await response.json();
                
                // Hide loading
                loading.style.display = 'none';
                document.body.style.overflow = 'auto';
                
                if (result.success) {
                    // Show success result
                    document.getElementById('cropName').textContent = result.crop;
                    document.getElementById('cropDetails').innerHTML = `
                        <div class="result-details">
                            <div class="detail-item">
                                <i class="fas fa-thermometer-half"></i>
                                <strong>Temperature:</strong> ${result.temperature}°C
                            </div>
                            <div class="detail-item">
                                <i class="fas fa-vial"></i>
                                <strong>pH Level:</strong> ${result.ph}
                            </div>
                        </div>
                        <div class="recommendation-note">
                            <i class="fas fa-lightbulb"></i>
                            This recommendation is based on your soil and climate conditions. 
                            Consider consulting with local agricultural experts and reviewing 
                            market conditions before making final planting decisions.
                        </div>
                    `;
                    
                    results.style.display = 'block';
                    results.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    
                    // Add success animation
                    results.classList.add('fade-in-up');
                } else {
                    // Show error
                    showNotification('Error: ' + result.error, 'error');
                }
                
            } catch (error) {
                loading.style.display = 'none';
                document.body.style.overflow = 'auto';
                showNotification('An error occurred while processing your request. Please try again.', 'error');
                console.error('Error:', error);
            }
        });
    }
    
    // Input validation and formatting
    const inputs = document.querySelectorAll('input[type="number"]');
    inputs.forEach(input => {
        // Add focus effects
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.classList.remove('focused');
            
            // Validation
            if (this.value < 0) {
                this.value = 0;
            }
            
            // Special validation for humidity
            if (this.name === 'humidity' && this.value > 100) {
                this.value = 100;
                showNotification('Humidity cannot exceed 100%', 'warning');
            }
            
            // Special validation for pH
            if (this.name === 'ph' && this.value > 14) {
                this.value = 14;
                showNotification('pH cannot exceed 14', 'warning');
            }
            
            // Format numbers
            if (this.value && !isNaN(this.value)) {
                this.value = parseFloat(this.value).toFixed(1);
            }
        });
        
        // Real-time validation
        input.addEventListener('input', function() {
            const value = parseFloat(this.value);
            const inputGroup = this.parentElement;
            
            // Remove previous validation classes
            inputGroup.classList.remove('valid', 'invalid');
            
            if (this.value && !isNaN(value) && value >= 0) {
                inputGroup.classList.add('valid');
            } else if (this.value) {
                inputGroup.classList.add('invalid');
            }
        });
    });
    
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offsetTop = target.offsetTop - 80; // Account for fixed navbar
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    document.querySelectorAll('.feature-card, .stat-card, .step-card, .tech-card').forEach(el => {
        observer.observe(el);
    });
    
    // Parallax effect for hero background
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const heroBackground = document.querySelector('.hero-bg');
        if (heroBackground) {
            const speed = scrolled * 0.5;
            heroBackground.style.transform = `translateY(${speed}px)`;
        }
    });
    
    // Form progress indicator
    const formInputs = document.querySelectorAll('#cropForm input[required]');
    const progressBar = createProgressBar();
    
    function createProgressBar() {
        const progressContainer = document.createElement('div');
        progressContainer.className = 'form-progress';
        progressContainer.innerHTML = `
            <div class="progress-bar">
                <div class="progress-fill"></div>
            </div>
            <span class="progress-text">0% Complete</span>
        `;
        
        const formHeader = document.querySelector('.form-header');
        if (formHeader) {
            formHeader.appendChild(progressContainer);
        }
        
        return progressContainer;
    }
    
    function updateProgress() {
        const filledInputs = Array.from(formInputs).filter(input => input.value.trim() !== '');
        const progress = (filledInputs.length / formInputs.length) * 100;
        
        const progressFill = document.querySelector('.progress-fill');
        const progressText = document.querySelector('.progress-text');
        
        if (progressFill && progressText) {
            progressFill.style.width = `${progress}%`;
            progressText.textContent = `${Math.round(progress)}% Complete`;
        }
    }
    
    // Update progress on input change
    formInputs.forEach(input => {
        input.addEventListener('input', updateProgress);
    });
    
    // Initialize progress
    updateProgress();
});

// Utility Functions
function scrollToForm() {
    const form = document.getElementById('prediction-form');
    if (form) {
        form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function resetForm() {
    const form = document.getElementById('cropForm');
    const results = document.getElementById('results');
    
    if (form) {
        form.reset();
        
        // Remove validation classes
        document.querySelectorAll('.input-group').forEach(group => {
            group.classList.remove('valid', 'invalid', 'focused');
        });
        
        // Update progress
        const progressFill = document.querySelector('.progress-fill');
        const progressText = document.querySelector('.progress-text');
        
        if (progressFill && progressText) {
            progressFill.style.width = '0%';
            progressText.textContent = '0% Complete';
        }
    }
    
    if (results) {
        results.style.display = 'none';
    }
    
    // Scroll back to form
    scrollToForm();
}

function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 90px;
        right: 20px;
        background: ${getNotificationColor(type)};
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        max-width: 400px;
        animation: slideInRight 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

function getNotificationIcon(type) {
    const icons = {
        'success': 'check-circle',
        'error': 'exclamation-circle',
        'warning': 'exclamation-triangle',
        'info': 'info-circle'
    };
    return icons[type] || 'info-circle';
}

function getNotificationColor(type) {
    const colors = {
        'success': '#4caf50',
        'error': '#f44336',
        'warning': '#ff9800',
        'info': '#2196f3'
    };
    return colors[type] || '#2196f3';
}

// Add CSS for notifications and other dynamic styles
const dynamicStyles = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .notification-close {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        padding: 0;
        margin-left: auto;
        opacity: 0.8;
        transition: opacity 0.3s ease;
    }
    
    .notification-close:hover {
        opacity: 1;
    }
    
    .form-progress {
        margin-top: 20px;
        text-align: center;
    }
    
    .progress-bar {
        width: 100%;
        height: 6px;
        background: #e0e0e0;
        border-radius: 3px;
        overflow: hidden;
        margin-bottom: 10px;
    }
    
    .progress-fill {
        height: 100%;
        background: linear-gradient(135deg, #4caf50, #2e7d32);
        width: 0%;
        transition: width 0.3s ease;
        border-radius: 3px;
    }
    
    .progress-text {
        font-size: 14px;
        color: #666;
        font-weight: 500;
    }
    
    .input-group.focused label {
        color: #4caf50;
    }
    
    .input-group.valid input {
        border-color: #4caf50;
        background: #f8fff8;
    }
    
    .input-group.invalid input {
        border-color: #f44336;
        background: #fff8f8;
    }
    
    .result-details {
        display: flex;
        justify-content: center;
        gap: 30px;
        margin-bottom: 20px;
        flex-wrap: wrap;
    }
    
    .detail-item {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 1rem;
        color: #555;
    }
    
    .detail-item i {
        color: #4caf50;
        font-size: 18px;
    }
    
    .recommendation-note {
        background: #f0f8f0;
        padding: 20px;
        border-radius: 10px;
        border-left: 4px solid #4caf50;
        margin-top: 20px;
        line-height: 1.6;
    }
    
    .recommendation-note i {
        color: #4caf50;
        margin-right: 8px;
    }
    
    @media (max-width: 768px) {
        .result-details {
            flex-direction: column;
            gap: 15px;
        }
        
        .detail-item {
            justify-content: center;
        }
        
        .notification {
            right: 10px !important;
            left: 10px !important;
            max-width: none !important;
        }
    }
`;

// Inject dynamic styles
const styleSheet = document.createElement('style');
styleSheet.textContent = dynamicStyles;
document.head.appendChild(styleSheet);