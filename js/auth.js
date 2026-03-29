// Authentication system
class AuthSystem {
    constructor() {
        this.users = this.loadUsers();
        this.initializeEventListeners();
    }

    // Load users from localStorage
    loadUsers() {
        return getFromStorage('users') || [];
    }

    // Save users to localStorage
    saveUsers() {
        saveToStorage('users', this.users);
    }

    // Initialize event listeners
    initializeEventListeners() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Register form
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }
    }

    // Handle login
    handleLogin(event) {
        event.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const userType = document.getElementById('loginUserType').value;

        // Validate inputs
        if (!email || !password || !userType) {
            showNotification('Please fill in all fields', 'error');
            return;
        }

        if (!isValidEmail(email)) {
            showNotification('Please enter a valid email address', 'error');
            return;
        }

        // Find user
        const user = this.users.find(u => 
            u.email === email && 
            u.password === password && 
            u.userType === userType
        );

        if (user) {
            // Login successful
            currentUser = { ...user };
            delete currentUser.password; // Don't store password in session
            
            saveToStorage('currentUser', currentUser);
            showNotification('Login successful!', 'success');
            
            // Close modal and redirect
            closeModal('loginModal');
            setTimeout(() => {
                redirectToDashboard();
            }, 1000);
        } else {
            showNotification('Invalid credentials or user type', 'error');
        }
    }

    // Handle registration
    handleRegister(event) {
        event.preventDefault();
        
        const formData = {
            userType: document.getElementById('registerUserType').value,
            name: document.getElementById('registerName').value,
            email: document.getElementById('registerEmail').value,
            phone: document.getElementById('registerPhone').value,
            address: document.getElementById('registerAddress').value,
            password: document.getElementById('registerPassword').value
        };

        // Validate inputs
        if (!this.validateRegistrationData(formData)) {
            return;
        }

        // Check if user already exists
        if (this.users.find(u => u.email === formData.email)) {
            showNotification('User with this email already exists', 'error');
            return;
        }

        // Check if location is obtained
        if (!userLocation) {
            showNotification('Please allow location access to continue', 'error');
            return;
        }

        // Create new user
        const newUser = {
            id: generateId(),
            ...formData,
            location: userLocation,
            createdAt: getCurrentDateTime(),
            isActive: true
        };

        // Add user to array and save
        this.users.push(newUser);
        this.saveUsers();

        showNotification('Registration successful! Please login.', 'success');
        
        // Close modal and show login
        closeModal('registerModal');
        setTimeout(() => {
            showLoginModal();
        }, 1000);

        // Reset form
        document.getElementById('registerForm').reset();
        document.getElementById('locationStatus').innerHTML = '';
        userLocation = null;
    }

    // Validate registration data
    validateRegistrationData(data) {
        // Check required fields
        const requiredFields = ['userType', 'name', 'email', 'phone', 'address', 'password'];
        for (let field of requiredFields) {
            if (!data[field] || data[field].trim() === '') {
                showNotification(`Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`, 'error');
                return false;
            }
        }

        // Validate email
        if (!isValidEmail(data.email)) {
            showNotification('Please enter a valid email address', 'error');
            return false;
        }

        // Validate phone
        if (!isValidPhone(data.phone)) {
            showNotification('Please enter a valid 10-digit phone number', 'error');
            return false;
        }

        // Validate password
        if (data.password.length < 6) {
            showNotification('Password must be at least 6 characters long', 'error');
            return false;
        }

        // Validate name
        if (data.name.length < 2) {
            showNotification('Name must be at least 2 characters long', 'error');
            return false;
        }

        // Validate address
        if (data.address.length < 10) {
            showNotification('Please provide a complete address', 'error');
            return false;
        }

        return true;
    }

    // Get current user
    getCurrentUser() {
        return currentUser;
    }

    // Check if user is logged in
    isLoggedIn() {
        return currentUser !== null;
    }

    // Get user by ID
    getUserById(userId) {
        return this.users.find(u => u.id === userId);
    }

    // Update user profile
    updateUserProfile(userId, updateData) {
        const userIndex = this.users.findIndex(u => u.id === userId);
        if (userIndex !== -1) {
            // Don't allow updating sensitive fields
            const allowedFields = ['name', 'phone', 'address', 'location'];
            const filteredData = {};
            
            for (let field of allowedFields) {
                if (updateData[field] !== undefined) {
                    filteredData[field] = updateData[field];
                }
            }

            this.users[userIndex] = { ...this.users[userIndex], ...filteredData };
            this.saveUsers();

            // Update current user if it's the same user
            if (currentUser && currentUser.id === userId) {
                currentUser = { ...currentUser, ...filteredData };
                saveToStorage('currentUser', currentUser);
            }

            return true;
        }
        return false;
    }

    // Change password
    changePassword(userId, currentPassword, newPassword) {
        const user = this.users.find(u => u.id === userId);
        if (user && user.password === currentPassword) {
            if (newPassword.length < 6) {
                showNotification('New password must be at least 6 characters long', 'error');
                return false;
            }
            
            user.password = newPassword;
            this.saveUsers();
            showNotification('Password changed successfully', 'success');
            return true;
        } else {
            showNotification('Current password is incorrect', 'error');
            return false;
        }
    }

    // Get users by type
    getUsersByType(userType) {
        return this.users.filter(u => u.userType === userType && u.isActive);
    }

    // Get nearby users
    getNearbyUsers(userType, maxDistance = 50) {
        if (!userLocation) return [];
        
        return this.getUsersByType(userType).filter(user => {
            if (!user.location) return false;
            
            const distance = calculateDistance(
                userLocation.latitude,
                userLocation.longitude,
                user.location.latitude,
                user.location.longitude
            );
            
            return distance <= maxDistance;
        }).map(user => ({
            ...user,
            distance: calculateDistance(
                userLocation.latitude,
                userLocation.longitude,
                user.location.latitude,
                user.location.longitude
            )
        })).sort((a, b) => a.distance - b.distance);
    }

    // Deactivate user account
    deactivateUser(userId) {
        const userIndex = this.users.findIndex(u => u.id === userId);
        if (userIndex !== -1) {
            this.users[userIndex].isActive = false;
            this.saveUsers();
            return true;
        }
        return false;
    }

    // Reactivate user account
    reactivateUser(userId) {
        const userIndex = this.users.findIndex(u => u.id === userId);
        if (userIndex !== -1) {
            this.users[userIndex].isActive = true;
            this.saveUsers();
            return true;
        }
        return false;
    }
}

// Initialize authentication system
const authSystem = new AuthSystem();

// Helper functions for authentication
function requireAuth() {
    if (!authSystem.isLoggedIn()) {
        window.location.href = 'index.html';
        return false;
    }
    return true;
}

function requireUserType(requiredType) {
    if (!requireAuth()) return false;
    
    if (currentUser.userType !== requiredType) {
        showNotification('Access denied. Invalid user type.', 'error');
        setTimeout(() => {
            redirectToDashboard();
        }, 2000);
        return false;
    }
    return true;
}

// Auto-logout after inactivity (30 minutes)
let inactivityTimer;
const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes

function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    if (authSystem.isLoggedIn()) {
        inactivityTimer = setTimeout(() => {
            showNotification('Session expired due to inactivity', 'info');
            logout();
        }, INACTIVITY_TIMEOUT);
    }
}

// Track user activity
document.addEventListener('click', resetInactivityTimer);
document.addEventListener('keypress', resetInactivityTimer);
document.addEventListener('scroll', resetInactivityTimer);

// Initialize inactivity timer on page load
if (authSystem.isLoggedIn()) {
    resetInactivityTimer();
}
