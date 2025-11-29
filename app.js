// Enhanced Temporary Email Application with Real Email Functionality
class TemporaryEmailService {
    constructor() {
        this.currentEmail = null;
        this.timerInterval = null;
        this.timeLeft = 600; // 10 minutes in seconds
        this.emails = [];
        this.emailCheckInterval = null;
        
        // Email domains for variety
        this.domains = [
            '@10minutemail.world',
            '@tempinbox.world', 
            '@quickmail.world',
            '@disposable.world',
            '@privacyguard.world',
            '@spamprotection.world',
            '@anonymousmail.world'
        ];
        
        // Initialize DOM elements
        this.initializeElements();
        
        // Start the application
        this.initialize();
    }
    
    initializeElements() {
        this.emailDisplay = document.getElementById('emailDisplay');
        this.timerElement = document.getElementById('timer');
        this.timeLeftElement = document.getElementById('timeLeft');
        this.inboxElement = document.getElementById('inbox');
        this.emailCountElement = document.getElementById('emailCount');
        this.notification = document.getElementById('notification');
    }
    
    initialize() {
        // Generate initial email
        this.generateNewEmail();
        
        // Start checking for emails periodically
        this.startEmailChecking();
        
        // Track page view for analytics
        this.trackEvent('page_view');
    }
    
    // Generate random email address
    generateEmail() {
        const prefixes = ['user', 'temp', 'anon', 'priv', 'secure', 'quick', 'fast', 'free', 'test', 'demo'];
        const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const randomNum = Math.floor(Math.random() * 10000);
        const randomDomain = this.domains[Math.floor(Math.random() * this.domains.length)];
        return `${randomPrefix}${randomNum}${randomDomain}`;
    }
    
    // Generate new email
    generateNewEmail() {
        this.currentEmail = this.generateEmail();
        this.timeLeft = 600; // Reset to 10 minutes
        this.emails = []; // Clear previous emails
        
        this.updateEmailDisplay();
        this.updateInbox();
        this.startTimer();
        this.showNotification('New temporary email address generated!');
        
        // Track generation for analytics
        this.trackEvent('email_generated');
        
        // Store email in session for persistence
        sessionStorage.setItem('currentEmail', this.currentEmail);
        sessionStorage.setItem('emailExpiry', Date.now() + (this.timeLeft * 1000));
    }
    
    // Copy email to clipboard
    async copyEmail() {
        if (!this.currentEmail) {
            this.generateNewEmail();
        }
        
        try {
            await navigator.clipboard.writeText(this.currentEmail);
            this.showNotification('Email address copied to clipboard!');
            this.trackEvent('email_copied');
        } catch (err) {
            // Fallback for older browsers
            this.fallbackCopyTextToClipboard(this.currentEmail);
        }
    }
    
    // Fallback copy method
    fallbackCopyTextToClipboard(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.top = '0';
        textArea.style.left = '0';
        textArea.style.position = 'fixed';
        
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
            this.showNotification('Email address copied to clipboard!');
        } catch (err) {
            this.showNotification('Failed to copy email address');
        }
        
        document.body.removeChild(textArea);
    }
    
    // Extend time by 10 minutes
    extendTime() {
        if (!this.currentEmail) {
            this.generateNewEmail();
            return;
        }
        
        this.timeLeft += 600; // Add 10 minutes
        this.updateTimerDisplay();
        this.showNotification('Time extended by 10 minutes!');
        
        // Update session storage
        sessionStorage.setItem('emailExpiry', Date.now() + (this.timeLeft * 1000));
        
        // Track extension
        this.trackEvent('time_extended');
    }
    
    // Start countdown timer
    startTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        
        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            this.updateTimerDisplay();
            
            if (this.timeLeft <= 0) {
                this.handleEmailExpiration();
            }
        }, 1000);
    }
    
    // Handle email expiration
    handleEmailExpiration() {
        clearInterval(this.timerInterval);
        this.emailDisplay.textContent = 'Email expired - generate new one';
        this.emailDisplay.style.color = 'var(--danger)';
        this.timerElement.className = 'timer expired';
        this.timeLeftElement.textContent = 'EXPIRED';
        
        // Clear session storage
        sessionStorage.removeItem('currentEmail');
        sessionStorage.removeItem('emailExpiry');
        
        // Track expiration
        this.trackEvent('email_expired');
        
        // Stop checking for emails
        if (this.emailCheckInterval) {
            clearInterval(this.emailCheckInterval);
        }
    }
    
    // Update timer display
    updateTimerDisplay() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        
        this.timeLeftElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // Update timer style based on time left
        if (this.timeLeft <= 60) {
            this.timerElement.className = 'timer expiring pulse';
        } else if (this.timeLeft <= 300) {
            this.timerElement.className = 'timer warning';
        } else {
            this.timerElement.className = 'timer';
        }
    }
    
    // Update email display
    updateEmailDisplay() {
        if (this.emailDisplay) {
            this.emailDisplay.textContent = this.currentEmail;
            this.emailDisplay.style.color = 'var(--primary)';
        }
    }
    
    // Update inbox display
    updateInbox() {
        if (!this.emailCountElement || !this.inboxElement) return;
        
        this.emailCountElement.textContent = `${this.emails.length} email${this.emails.length !== 1 ? 's' : ''}`;
        
        if (this.emails.length === 0) {
            this.inboxElement.innerHTML = `
                <div class="no-emails">
                    <p>📭 No emails received yet</p>
                    <p>Use your temporary email address for website registrations and verifications</p>
                </div>
            `;
        } else {
            this.inboxElement.innerHTML = this.emails.map((email, index) => `
                <div class="email-item" onclick="tempEmailService.viewEmail(${index})">
                    <div class="email-subject">${this.escapeHtml(email.subject)}</div>
                    <div class="email-from">From: ${this.escapeHtml(email.from)}</div>
                    <div class="email-preview">${this.escapeHtml(email.preview)}</div>
                    <div class="email-time">${this.formatTime(email.timestamp)}</div>
                </div>
            `).join('');
        }
    }
    
    // Escape HTML to prevent XSS
    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }
    
    // Format timestamp
    formatTime(timestamp) {
        const now = new Date();
        const emailTime = new Date(timestamp);
        const diffMinutes = Math.floor((now - emailTime) / (1000 * 60));
        
        if (diffMinutes < 1) return 'Just now';
        if (diffMinutes < 60) return `${diffMinutes}m ago`;
        
        const diffHours = Math.floor(diffMinutes / 60);
        if (diffHours < 24) return `${diffHours}h ago`;
        
        return emailTime.toLocaleDateString();
    }
    
    // Start checking for emails
    startEmailChecking() {
        // Check for real emails every 3 seconds
        this.emailCheckInterval = setInterval(() => {
            this.checkForNewEmails();
        }, 3000);
        
        // Show demo email after 15 seconds if no real emails received
        setTimeout(() => {
            if (this.emails.length === 0) {
                this.simulateEmail();
            }
        }, 15000);
    }
    
    // Check for new emails from backend API
    async checkForNewEmails() {
        if (!this.currentEmail || this.timeLeft <= 0) return;
        
        try {
            const response = await fetch(`gmail-setup.php?email=${encodeURIComponent(this.currentEmail)}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });
            
            if (response.ok) {
                const result = await response.json();
                const newEmails = result.emails || [];
                
                if (newEmails.length > 0) {
                    newEmails.forEach(email => {
                        // Check if email already exists
                        if (!this.emails.find(e => e.id === email.id)) {
                            this.emails.unshift({
                                id: email.id || Date.now() + Math.random(),
                                from: email.from || 'Unknown Sender',
                                subject: email.subject || 'No Subject',
                                preview: this.generatePreview(email.body),
                                content: email.body || 'No content available',
                                timestamp: new Date(email.timestamp || Date.now())
                            });
                        }
                    });
                    
                    this.updateInbox();
                    this.showNotification(`📧 ${newEmails.length} new email(s) received!`);
                    
                    // Reset timer when new email arrives
                    if (this.timeLeft < 300) {
                        this.timeLeft = 600;
                        this.updateTimerDisplay();
                    }
                    
                    this.trackEvent('real_email_received', { count: newEmails.length });
                }
            } else if (response.status === 404) {
                // Email address not found or no emails - this is normal
                console.log('No emails found for address');
            } else {
                console.warn('Email check failed:', response.status);
            }
        } catch (error) {
            console.error('Error checking for emails:', error);
            // Fallback to demo mode occasionally
            if (Math.random() < 0.05 && this.emails.length === 0) {
                this.simulateEmail();
            }
        }
    }
    
    // Generate email preview from content
    generatePreview(content) {
        if (!content) return 'No preview available';
        
        // Strip HTML tags and get first 100 characters
        const textContent = content.replace(/<[^>]*>/g, '').trim();
        return textContent.length > 100 ? textContent.substring(0, 100) + '...' : textContent;
    }
    
    // Demo email simulation (fallback when backend is not available)
    simulateEmail() {
        if (!this.currentEmail || this.emails.length >= 3 || this.timeLeft <= 0) return;
        
        const senders = [
            'noreply@example.com',
            'verification@service.com',
            'hello@newsletter.com',
            'security@platform.com',
            'support@website.com',
            'info@company.com',
            'accounts@social-media.com',
            'notifications@app-store.com'
        ];
        
        const subjects = [
            'Verify your email address',
            'Welcome to our service!',
            'Your account confirmation',
            'Password reset request',
            'Newsletter confirmation',
            'Download confirmation',
            'Trial access granted',
            'Security code verification',
            'Account activation required',
            'Complete your registration'
        ];
        
        const newEmail = {
            id: Date.now() + Math.random(),
            from: 'demo@10minutemail.world',
            subject: 'Demo Email - Connect backend for real emails',
            preview: 'This is a demonstration email. Real emails from your signups will appear here when you connect the backend API.',
            content: 'This is a demonstration email showing how the inbox works.\n\nTo receive real emails:\n1. Set up an email backend (Mailgun, SendGrid, etc.)\n2. Configure the API endpoint in the code\n3. Real emails will appear here automatically\n\nThis demo email will be replaced by actual emails once the backend is connected.',
            timestamp: new Date()
        };
        
        this.emails.unshift(newEmail);
        this.updateInbox();
        this.showNotification('📧 New email received!');
        
        // Reset timer when new email arrives (if less than 5 minutes left)
        if (this.timeLeft < 300) {
            this.timeLeft = 600;
            this.updateTimerDisplay();
        }
        
        // Track email received
        this.trackEvent('email_received');
    }
    
    // Generate realistic email content
    generateEmailContent() {
        const contents = [
            'Thank you for signing up! Please click the link below to verify your email address and complete your registration.\n\nVerification Link: https://example.com/verify?token=abc123\n\nIf you did not create this account, please ignore this email.',
            'Welcome to our platform! Your account has been created successfully. You can now access all our features and services.\n\nGet started: https://example.com/dashboard\n\nNeed help? Contact our support team.',
            'We received a request to reset your password. Click the link below to create a new password:\n\nReset Password: https://example.com/reset?token=xyz789\n\nThis link expires in 24 hours.',
            'Your download is ready! Click the link below to download your requested file:\n\nDownload Link: https://example.com/download/file123\n\nThis link is valid for 48 hours.',
            'Congratulations! Your free trial has been activated. You now have access to all premium features for the next 30 days.\n\nStart exploring: https://example.com/premium'
        ];
        
        return contents[Math.floor(Math.random() * contents.length)];
    }
    
    // View email content
    viewEmail(index) {
        if (index >= 0 && index < this.emails.length) {
            const email = this.emails[index];
            
            // Create modal or alert with email content
            const emailContent = `
From: ${email.from}
Subject: ${email.subject}
Time: ${this.formatTime(email.timestamp)}

${email.content}
            `;
            
            alert(emailContent);
            
            // Track email view
            this.trackEvent('email_viewed');
        }
    }
    
    // Show notification
    showNotification(message) {
        if (!this.notification) return;
        
        this.notification.textContent = message;
        this.notification.className = 'notification show';
        
        setTimeout(() => {
            this.notification.className = 'notification';
        }, 3000);
    }
    
    // Track events for analytics
    trackEvent(eventName, eventData = {}) {
        // Google Analytics tracking
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, eventData);
        }
        
        // Console log for debugging
        console.log(`Event: ${eventName}`, eventData);
    }
    
    // Restore session if available
    restoreSession() {
        const savedEmail = sessionStorage.getItem('currentEmail');
        const savedExpiry = sessionStorage.getItem('emailExpiry');
        
        if (savedEmail && savedExpiry) {
            const expiryTime = parseInt(savedExpiry);
            const currentTime = Date.now();
            
            if (currentTime < expiryTime) {
                this.currentEmail = savedEmail;
                this.timeLeft = Math.floor((expiryTime - currentTime) / 1000);
                this.updateEmailDisplay();
                this.startTimer();
                return true;
            } else {
                // Clear expired session
                sessionStorage.removeItem('currentEmail');
                sessionStorage.removeItem('emailExpiry');
            }
        }
        
        return false;
    }
    
    // Cleanup when page unloads
    cleanup() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        if (this.emailCheckInterval) {
            clearInterval(this.emailCheckInterval);
        }
    }
}

// Global functions for backward compatibility
let tempEmailService;

function generateNewEmail() {
    if (tempEmailService) {
        tempEmailService.generateNewEmail();
    }
}

function copyEmail() {
    if (tempEmailService) {
        tempEmailService.copyEmail();
    }
}

function extendTime() {
    if (tempEmailService) {
        tempEmailService.extendTime();
    }
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    tempEmailService = new TemporaryEmailService();
    
    // Try to restore previous session
    if (!tempEmailService.restoreSession()) {
        tempEmailService.generateNewEmail();
    }
    
    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        if (tempEmailService) {
            tempEmailService.cleanup();
        }
    });
    
    // Service Worker registration for offline functionality
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').catch(console.error);
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + G for generate new email
    if ((e.ctrlKey || e.metaKey) && e.key === 'g') {
        e.preventDefault();
        generateNewEmail();
    }
    
    // Ctrl/Cmd + C for copy email (when email display is focused)
    if ((e.ctrlKey || e.metaKey) && e.key === 'c' && document.activeElement.id === 'emailDisplay') {
        e.preventDefault();
        copyEmail();
    }
    
    // Ctrl/Cmd + E for extend time
    if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        extendTime();
    }
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TemporaryEmailService;
}