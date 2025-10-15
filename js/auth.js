// Authentication System
class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        this.checkExistingSession();
        this.setupEventListeners();
        this.setupTabSwitching();
    }

    checkExistingSession() {
        const userData = localStorage.getItem('currentUser');
        const token = localStorage.getItem('authToken');
        
        if (userData && token) {
            this.currentUser = JSON.parse(userData);
            // Redirect to dashboard if already logged in
            if (window.location.pathname.includes('organizer-login.html')) {
                window.location.href = 'organizer-dashboard.html';
            }
        }
    }

    setupEventListeners() {
        // Login form
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Registration form
        document.getElementById('registerForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegistration();
        });

        // Password toggle
        document.getElementById('toggleLoginPassword').addEventListener('click', () => {
            this.togglePassword('loginPassword', 'toggleLoginPassword');
        });

        document.getElementById('toggleRegisterPassword').addEventListener('click', () => {
            this.togglePassword('registerPassword', 'toggleRegisterPassword');
        });

        document.getElementById('toggleConfirmPassword').addEventListener('click', () => {
            this.togglePassword('registerConfirmPassword', 'toggleConfirmPassword');
        });

        // Password strength
        document.getElementById('registerPassword').addEventListener('input', (e) => {
            this.checkPasswordStrength(e.target.value);
        });

        // Forgot password
        document.querySelector('.forgot-password').addEventListener('click', (e) => {
            e.preventDefault();
            this.openForgotPasswordModal();
        });

        // Modal close
        document.querySelector('.modal-close').addEventListener('click', () => {
            this.closeForgotPasswordModal();
        });

        // Google sign in
        document.querySelector('.google-button').addEventListener('click', () => {
            this.handleGoogleSignIn();
        });
    }

    setupTabSwitching() {
        const tabs = document.querySelectorAll('.auth-tab');
        const forms = document.querySelectorAll('.auth-form');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetTab = tab.getAttribute('data-tab');
                
                // Update active tab
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                // Show corresponding form
                forms.forEach(form => {
                    form.classList.remove('active');
                    if (form.id === `${targetTab}Form`) {
                        form.classList.add('active');
                    }
                });
            });
        });
    }

    async handleLogin() {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const rememberMe = document.getElementById('rememberMe').checked;

        // Basic validation
        if (!this.validateEmail(email)) {
            this.showError('loginForm', 'Please enter a valid email address');
            return;
        }

        if (password.length < 6) {
            this.showError('loginForm', 'Password must be at least 6 characters');
            return;
        }

        // Show loading state
        const submitButton = document.querySelector('#loginForm .auth-button');
        const originalText = submitButton.textContent;
        submitButton.textContent = 'Signing in...';
        submitButton.disabled = true;

        try {
            // Simulate API call
            await this.simulateAPICall(1000);
            
            const user = this.authenticateUser(email, password);
            
            if (user) {
                this.loginUser(user, rememberMe);
                this.showSuccess('loginForm', 'Login successful! Redirecting...');
                
                // Redirect to dashboard
                setTimeout(() => {
                    window.location.href = 'organizer-dashboard.html';
                }, 1500);
            } else {
                this.showError('loginForm', 'Invalid email or password');
            }
        } catch (error) {
            this.showError('loginForm', 'Login failed. Please try again.');
        } finally {
            submitButton.textContent = originalText;
            submitButton.disabled = false;
        }
    }

    async handleRegistration() {
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('registerConfirmPassword').value;
        const orgType = document.getElementById('organizationType').value;
        const acceptTerms = document.getElementById('acceptTerms').checked;

        // Validation
        if (!name.trim()) {
            this.showError('registerForm', 'Please enter your organization name');
            return;
        }

        if (!this.validateEmail(email)) {
            this.showError('registerForm', 'Please enter a valid email address');
            return;
        }

        if (password.length < 6) {
            this.showError('registerForm', 'Password must be at least 6 characters');
            return;
        }

        if (password !== confirmPassword) {
            this.showError('registerForm', 'Passwords do not match');
            return;
        }

        if (!orgType) {
            this.showError('registerForm', 'Please select organization type');
            return;
        }

        if (!acceptTerms) {
            this.showError('registerForm', 'Please accept the terms and conditions');
            return;
        }

        // Show loading state
        const submitButton = document.querySelector('#registerForm .auth-button');
        const originalText = submitButton.textContent;
        submitButton.textContent = 'Creating Account...';
        submitButton.disabled = true;

        try {
            // Simulate API call
            await this.simulateAPICall(1500);
            
            const user = this.registerUser({
                name,
                email,
                password,
                orgType
            });
            
            this.loginUser(user, true);
            this.showSuccess('registerForm', 'Account created successfully! Redirecting...');
            
            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = 'organizer-dashboard.html';
            }, 1500);
        } catch (error) {
            this.showError('registerForm', 'Registration failed. Please try again.');
        } finally {
            submitButton.textContent = originalText;
            submitButton.disabled = false;
        }
    }

    authenticateUser(email, password) {
        // In a real app, this would be an API call
        const users = this.getStoredUsers();
        return users.find(user => user.email === email && user.password === password);
    }

    registerUser(userData) {
        const users = this.getStoredUsers();
        
        // Check if user already exists
        if (users.find(user => user.email === userData.email)) {
            throw new Error('User already exists');
        }
        
        const newUser = {
            id: Date.now(),
            name: userData.name,
            email: userData.email,
            password: userData.password, // In real app, this would be hashed
            orgType: userData.orgType,
            createdAt: new Date().toISOString(),
            events: []
        };
        
        users.push(newUser);
        localStorage.setItem('organizerUsers', JSON.stringify(users));
        
        return newUser;
    }

    getStoredUsers() {
        return JSON.parse(localStorage.getItem('organizerUsers') || '[]');
    }

    loginUser(user, rememberMe) {
        // Create auth token (in real app, this would come from server)
        const authToken = btoa(JSON.stringify({
            userId: user.id,
            email: user.email,
            exp: Date.now() + (rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000) // 30 days or 1 day
        }));
        
        // Store user session
        localStorage.setItem('authToken', authToken);
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        this.currentUser = user;
    }

    logout() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        this.currentUser = null;
        window.location.href = 'organizer-login.html';
    }

    togglePassword(inputId, toggleId) {
        const input = document.getElementById(inputId);
        const toggle = document.getElementById(toggleId);
        
        if (input.type === 'password') {
            input.type = 'text';
            toggle.textContent = '🙈';
        } else {
            input.type = 'password';
            toggle.textContent = '👁️';
        }
    }

    checkPasswordStrength(password) {
        const strengthBar = document.querySelector('.strength-bar');
        const strengthText = document.querySelector('.strength-text');
        
        let strength = 0;
        let feedback = '';
        
        if (password.length >= 8) strength += 25;
        if (/[A-Z]/.test(password)) strength += 25;
        if (/[0-9]/.test(password)) strength += 25;
        if (/[^A-Za-z0-9]/.test(password)) strength += 25;
        
        strengthBar.style.width = strength + '%';
        
        if (strength < 25) {
            strengthBar.style.background = '#e74c3c';
            feedback = 'Very Weak';
        } else if (strength < 50) {
            strengthBar.style.background = '#e67e22';
            feedback = 'Weak';
        } else if (strength < 75) {
            strengthBar.style.background = '#f1c40f';
            feedback = 'Good';
        } else {
            strengthBar.style.background = '#2ecc71';
            feedback = 'Strong';
        }
        
        strengthText.textContent = feedback;
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    showError(formId, message) {
        this.showMessage(formId, message, 'error');
    }

    showSuccess(formId, message) {
        this.showMessage(formId, message, 'success');
    }

    showMessage(formId, message, type) {
        const form = document.getElementById(formId);
        
        // Remove existing messages
        const existingMessage = form.querySelector('.auth-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        // Create new message
        const messageDiv = document.createElement('div');
        messageDiv.className = `auth-message ${type}`;
        messageDiv.textContent = message;
        messageDiv.style.cssText = `
            padding: 12px;
            border-radius: 8px;
            margin-bottom: 1rem;
            text-align: center;
            font-weight: 500;
            ${type === 'error' ? 'background: #fee; color: #c0392b; border: 1px solid #f5b7b1;' : 'background: #efc; color: #27ae60; border: 1px solid #a9dfbf;'}
        `;
        
        form.insertBefore(messageDiv, form.firstChild);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }

    openForgotPasswordModal() {
        document.getElementById('forgotPasswordModal').classList.remove('hidden');
    }

    closeForgotPasswordModal() {
        document.getElementById('forgotPasswordModal').classList.add('hidden');
    }

    handleGoogleSignIn() {
        // Simulate Google OAuth flow
        this.showMessage('loginForm', 'Redirecting to Google...', 'success');
        
        // In real app, this would redirect to Google OAuth
        setTimeout(() => {
            this.showError('loginForm', 'Google sign-in is not implemented in this demo');
        }, 1000);
    }

    simulateAPICall(duration) {
        return new Promise(resolve => setTimeout(resolve, duration));
    }

    // Utility method to check if user is authenticated
    isAuthenticated() {
        return this.currentUser !== null;
    }

    // Utility method to get current user
    getCurrentUser() {
        return this.currentUser;
    }
}

// Initialize auth system
const authSystem = new AuthSystem();

// Export for use in other files
window.authSystem = authSystem;

// Sample data initialization
function initializeSampleUsers() {
    const existingUsers = JSON.parse(localStorage.getItem('organizerUsers') || '[]');
    
    if (existingUsers.length === 0) {
        const sampleUsers = [
            {
                id: 1,
                name: "City Arts Council",
                email: "arts@citycouncil.gov",
                password: "password123", // In real app, never store plain passwords
                orgType: "nonprofit",
                createdAt: new Date().toISOString(),
                events: [1] // Event IDs that this organizer owns
            },
            {
                id: 2,
                name: "Tech Community Group",
                email: "events@techcommunity.org",
                password: "password123",
                orgType: "community",
                createdAt: new Date().toISOString(),
                events: [2]
            }
        ];
        
        localStorage.setItem('organizerUsers', JSON.stringify(sampleUsers));
    }
}

// Initialize sample data when the page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeSampleUsers();
});
