// Global variables
let currentUser = null;
let userLocation = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already logged in
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        redirectToDashboard();
    }
    
    // Initialize event listeners
    initializeEventListeners();
    
    // Initialize product filters
    initializeProductFilters();
});

// Initialize event listeners
function initializeEventListeners() {
    // Modal event listeners
    window.onclick = function(event) {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    };
}

// Modal functions
function showLoginModal() {
    document.getElementById('loginModal').style.display = 'block';
}

function showRegisterModal() {
    document.getElementById('registerModal').style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Smooth scrolling function
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
}

// Location functions
function getLocation() {
    const statusElement = document.getElementById('locationStatus');
    
    if (navigator.geolocation) {
        statusElement.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Getting location...';
        statusElement.className = 'text-info';
        
        navigator.geolocation.getCurrentPosition(
            function(position) {
                userLocation = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                };
                statusElement.innerHTML = '<i class="fas fa-check"></i> Location obtained successfully!';
                statusElement.className = 'text-success';
            },
            function(error) {
                let errorMessage = 'Error getting location: ';
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage += 'Permission denied';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage += 'Position unavailable';
                        break;
                    case error.TIMEOUT:
                        errorMessage += 'Request timeout';
                        break;
                    default:
                        errorMessage += 'Unknown error';
                        break;
                }
                statusElement.innerHTML = '<i class="fas fa-times"></i> ' + errorMessage;
                statusElement.className = 'text-danger';
            }
        );
    } else {
        statusElement.innerHTML = '<i class="fas fa-times"></i> Geolocation not supported';
        statusElement.className = 'text-danger';
    }
}

// Redirect to appropriate dashboard
function redirectToDashboard() {
    if (!currentUser) return;
    
    const userType = currentUser.userType;
    let dashboardFile = '';
    
    switch(userType) {
        case 'farmer':
            dashboardFile = 'farmer-dashboard.html';
            break;
        case 'consumer':
            dashboardFile = 'consumer-dashboard.html';
            break;
        case 'wholesaler':
            dashboardFile = 'wholesaler-dashboard.html';
            break;
        default:
            console.error('Unknown user type:', userType);
            return;
    }
    
    window.location.href = dashboardFile;
}

// Logout function
function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

// Utility functions
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'times' : 'info'}"></i>
        <span>${message}</span>
        <button onclick="this.parentElement.remove()" class="notification-close">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
    }).format(amount);
}

// Calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in kilometers
    return distance;
}

// Generate unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Get current date and time
function getCurrentDateTime() {
    return new Date().toISOString();
}

// Format date for display
function formatDate(dateString) {
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-IN', options);
}

// Validate email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Validate phone number (Indian format)
function isValidPhone(phone) {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone.replace(/\D/g, ''));
}

// Local storage helpers
function saveToStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error('Error saving to localStorage:', error);
        return false;
    }
}

function getFromStorage(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Error reading from localStorage:', error);
        return null;
    }
}

// Image handling functions
function handleImageUpload(inputElement, previewElement) {
    const file = inputElement.files[0];
    if (file) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
            showNotification('Please select a valid image file', 'error');
            return false;
        }
        
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            showNotification('Image size should be less than 5MB', 'error');
            return false;
        }
        
        // Create preview
        const reader = new FileReader();
        reader.onload = function(e) {
            if (previewElement) {
                previewElement.src = e.target.result;
                previewElement.style.display = 'block';
            }
        };
        reader.readAsDataURL(file);
        
        return true;
    }
    return false;
}

// Price calculation based on mandi rates and demand
function calculatePrice(basePrice, grade, quantity, demandFactor = 1) {
    let price = basePrice;
    
    // Grade adjustment
    if (grade === 'A') {
        price *= 1.2; // 20% premium for Grade A
    } else if (grade === 'B') {
        price *= 0.9; // 10% discount for Grade B
    }
    
    // Small quantity premium
    if (quantity <= 2) {
        price *= 1.15; // 15% premium for small quantities
    }
    
    // Demand factor
    price *= demandFactor;
    
    return Math.round(price * 100) / 100; // Round to 2 decimal places
}

// Mock mandi price data (in real app, this would come from API)
const mandiPrices = {
    'tomato': 25,
    'onion': 30,
    'potato': 20,
    'carrot': 35,
    'cabbage': 15,
    'cauliflower': 40,
    'apple': 120,
    'banana': 50,
    'orange': 80,
    'mango': 100,
    'grapes': 150,
    'pomegranate': 200
};

// Get mandi price for a product
function getMandiPrice(productName) {
    return mandiPrices[productName.toLowerCase()] || 50; // Default price if not found
}

// Search and filter functions
function filterProducts(products, filters) {
    return products.filter(product => {
        // Filter by category
        if (filters.category && product.category !== filters.category) {
            return false;
        }
        
        // Filter by grade
        if (filters.grade && product.grade !== filters.grade) {
            return false;
        }
        
        // Filter by price range
        if (filters.minPrice && product.price < filters.minPrice) {
            return false;
        }
        if (filters.maxPrice && product.price > filters.maxPrice) {
            return false;
        }
        
        // Filter by location (distance)
        if (filters.maxDistance && userLocation && product.farmerLocation) {
            const distance = calculateDistance(
                userLocation.latitude,
                userLocation.longitude,
                product.farmerLocation.latitude,
                product.farmerLocation.longitude
            );
            if (distance > filters.maxDistance) {
                return false;
            }
        }
        
        return true;
    });
}

// Sort products
function sortProducts(products, sortBy) {
    return products.sort((a, b) => {
        switch (sortBy) {
            case 'price-low':
                return a.price - b.price;
            case 'price-high':
                return b.price - a.price;
            case 'name':
                return a.name.localeCompare(b.name);
            case 'grade':
                return a.grade.localeCompare(b.grade);
            case 'distance':
                if (userLocation && a.farmerLocation && b.farmerLocation) {
                    const distanceA = calculateDistance(
                        userLocation.latitude,
                        userLocation.longitude,
                        a.farmerLocation.latitude,
                        a.farmerLocation.longitude
                    );
                    const distanceB = calculateDistance(
                        userLocation.latitude,
                        userLocation.longitude,
                        b.farmerLocation.latitude,
                        b.farmerLocation.longitude
                    );
                    return distanceA - distanceB;
                }
                return 0;
            default:
                return 0;
        }
    });
}

// Demo account functionality
function fillDemoAccount(userType) {
    const demoAccounts = {
        farmer: {
            email: 'rajesh@farm.com',
            password: 'farmer123',
            userType: 'farmer'
        },
        consumer: {
            email: 'anita@consumer.com',
            password: 'consumer123',
            userType: 'consumer'
        },
        wholesaler: {
            email: 'contact@freshmart.com',
            password: 'wholesaler123',
            userType: 'wholesaler'
        }
    };

    const account = demoAccounts[userType];
    if (account) {
        document.getElementById('loginEmail').value = account.email;
        document.getElementById('loginPassword').value = account.password;
        document.getElementById('loginUserType').value = account.userType;
        
        // Add visual feedback
        showNotification(`Demo ${userType} account loaded!`, 'success');
    }
}

// Enhanced modal animations
function showLoginModal() {
    const modal = document.getElementById('loginModal');
    modal.style.display = 'block';
    // Trigger animation
    setTimeout(() => {
        modal.querySelector('.modal-content').style.animation = 'modalSlideIn 0.4s ease-out';
    }, 10);
}

function showRegisterModal() {
    const modal = document.getElementById('registerModal');
    modal.style.display = 'block';
    // Trigger animation
    setTimeout(() => {
        modal.querySelector('.modal-content').style.animation = 'modalSlideIn 0.4s ease-out';
    }, 10);
}

// Cart functionality
let cart = [];
let cartTotal = 0;

function toggleCart() {
    const cartDropdown = document.getElementById('cartDropdown');
    cartDropdown.classList.toggle('active');
}

// Quantity selector functionality
function selectQuantity(button, quantity) {
    // Remove active class from all buttons in the same group
    const quantityOptions = button.parentElement;
    quantityOptions.querySelectorAll('.quantity-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Add active class to clicked button
    button.classList.add('active');
}

function getSelectedQuantity(button) {
    const productCard = button.closest('.product-card');
    const activeQuantityBtn = productCard.querySelector('.quantity-btn.active');
    return activeQuantityBtn ? activeQuantityBtn.textContent : '1kg';
}

// Grade selection functionality
function selectGrade(button, grade, price) {
    // Remove active class from all grade buttons in the same product card
    const gradeOptions = button.parentElement;
    gradeOptions.querySelectorAll('.grade-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Add active class to clicked button
    button.classList.add('active');
}

function getSelectedGrade(button) {
    const productCard = button.closest('.product-card');
    const activeGradeBtn = productCard.querySelector('.grade-btn.active');
    return {
        grade: activeGradeBtn ? activeGradeBtn.getAttribute('data-grade') : 'grade-a',
        price: activeGradeBtn ? parseFloat(activeGradeBtn.getAttribute('data-price')) : 0
    };
}

function addToCartWithSelection(button, productId, productName) {
    const quantity = getSelectedQuantity(button);
    const gradeInfo = getSelectedGrade(button);
    
    addToCart(productId, gradeInfo.grade, gradeInfo.price, quantity);
}

// Login modal functionality
let currentLoginStep = 1;

function selectLoginUserType(type) {
    // Remove selected class from all login type cards
    document.querySelectorAll('.login-type-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // Add selected class to clicked card
    event.target.closest('.login-type-card').classList.add('selected');
    
    // Set the selected user type
    document.getElementById('selectedLoginUserType').value = type;
    
    // Move to next step after a short delay
    setTimeout(() => {
        nextLoginStep();
    }, 500);
}

function nextLoginStep() {
    if (currentLoginStep === 1) {
        // Move from step 1 to step 2
        document.getElementById('loginStep1').classList.remove('active');
        document.getElementById('loginStep2').classList.add('active');
        
        // Update step indicators
        document.getElementById('loginStep1Indicator').classList.remove('active');
        document.getElementById('loginStep1Indicator').classList.add('completed');
        document.getElementById('loginStep2Indicator').classList.add('active');
        document.querySelector('.step-line').classList.add('completed');
        
        currentLoginStep = 2;
    }
}

function prevLoginStep() {
    if (currentLoginStep === 2) {
        // Move from step 2 to step 1
        document.getElementById('loginStep2').classList.remove('active');
        document.getElementById('loginStep1').classList.add('active');
        
        // Update step indicators
        document.getElementById('loginStep2Indicator').classList.remove('active');
        document.getElementById('loginStep1Indicator').classList.remove('completed');
        document.getElementById('loginStep1Indicator').classList.add('active');
        document.querySelector('.step-line').classList.remove('completed');
        
        // Reset user type selection
        document.querySelectorAll('.login-type-card').forEach(card => {
            card.classList.remove('selected');
        });
        document.getElementById('selectedLoginUserType').value = '';
        
        currentLoginStep = 1;
    }
}

// Reset login modal when opened
function showLoginModal() {
    // Reset to step 1
    currentLoginStep = 1;
    
    // Reset step visibility
    document.getElementById('loginStep1').classList.add('active');
    document.getElementById('loginStep2').classList.remove('active');
    
    // Reset step indicators
    document.getElementById('loginStep1Indicator').classList.add('active');
    document.getElementById('loginStep1Indicator').classList.remove('completed');
    document.getElementById('loginStep2Indicator').classList.remove('active');
    document.querySelector('.step-line').classList.remove('completed');
    
    // Reset selections
    document.querySelectorAll('.login-type-card').forEach(card => {
        card.classList.remove('selected');
    });
    document.getElementById('selectedLoginUserType').value = '';
    
    // Show modal
    const modal = document.getElementById('loginModal');
    modal.style.display = 'block';
    
    // Trigger animation
    setTimeout(() => {
        modal.querySelector('.modal-content').style.animation = 'modalSlideIn 0.4s ease-out';
    }, 10);
}

// Registration modal functionality
let currentStep = 1;

function selectUserType(type) {
    // Remove selected class from all cards
    document.querySelectorAll('.user-type-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // Add selected class to clicked card
    event.target.closest('.user-type-card').classList.add('selected');
    
    // Set the selected user type
    document.getElementById('selectedUserType').value = type;
    
    // Show the registration form
    setTimeout(() => {
        document.querySelector('.user-type-selection').style.display = 'none';
        document.querySelector('.register-form-redesigned').style.display = 'block';
    }, 300);
}

function nextStep() {
    const step1 = document.getElementById('step1');
    const step2 = document.getElementById('step2');
    
    // Validate step 1 fields
    const requiredFields = step1.querySelectorAll('input[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            field.focus();
            isValid = false;
            return false;
        }
    });
    
    if (isValid) {
        step1.classList.remove('active');
        step2.classList.add('active');
        currentStep = 2;
    }
}

function prevStep() {
    const step1 = document.getElementById('step1');
    const step2 = document.getElementById('step2');
    
    step2.classList.remove('active');
    step1.classList.add('active');
    currentStep = 1;
}

function addToCart(productId, grade, price, quantity) {
    const productNames = {
        'carrots': 'Fresh Carrots',
        'peppers': 'Bell Peppers',
        'spinach': 'Spinach',
        'apples': 'Red Apples',
        'lemons': 'Fresh Lemons',
        'bananas': 'Bananas'
    };

    const productEmojis = {
        'carrots': '🥕',
        'peppers': '🌶️',
        'spinach': '🥬',
        'apples': '🍎',
        'lemons': '🍋',
        'bananas': '🍌'
    };

    // Convert quantity to weight in kg for calculation
    const quantityInKg = quantity === '250g' ? 0.25 : quantity === '500g' ? 0.5 : 1;
    
    const existingItem = cart.find(item => item.id === productId && item.grade === grade && item.quantityType === quantity);
    
    if (existingItem) {
        existingItem.quantity += quantityInKg;
    } else {
        cart.push({
            id: productId,
            name: productNames[productId],
            emoji: productEmojis[productId],
            grade: grade,
            price: price,
            quantity: quantityInKg,
            quantityType: quantity
        });
    }
    
    updateCartDisplay();
    showCartNotification();
}

function updateCartDisplay() {
    const cartItems = document.getElementById('cartItems');
    const cartCount = document.getElementById('cartCount');
    const cartTotalElement = document.getElementById('cartTotal');
    
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <p>Your cart is empty</p>
                <small>Add some fresh produce to get started!</small>
            </div>
        `;
        cartCount.textContent = '0';
        cartTotalElement.textContent = '0';
        return;
    }

    let itemsHTML = '';
    let total = 0;
    let itemCount = 0;

    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        itemCount += item.quantity;

        itemsHTML += `
            <div class="cart-item">
                <div class="cart-item-image" style="background: linear-gradient(135deg, #f0f8f0, #e8f5e8);">
                    ${item.emoji}
                </div>
                <div class="cart-item-details">
                    <div class="cart-item-name">${item.name} (${item.grade.toUpperCase()})</div>
                    <div class="cart-item-price">₹${item.price}/kg</div>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn" onclick="updateQuantity(${index}, -1)">-</button>
                        <span>${item.quantityType || (item.quantity + 'kg')}</span>
                        <button class="quantity-btn" onclick="updateQuantity(${index}, 1)">+</button>
                    </div>
                </div>
            </div>
        `;
    });

    cartItems.innerHTML = itemsHTML;
    cartCount.textContent = itemCount;
    cartTotalElement.textContent = total.toFixed(2);
}

function updateQuantity(index, change) {
    cart[index].quantity += change;
    
    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }
    
    updateCartDisplay();
}

function showCartNotification() {
    // Simple notification - you could enhance this
    const cartIcon = document.querySelector('.cart-icon');
    cartIcon.style.transform = 'scale(1.2)';
    setTimeout(() => {
        cartIcon.style.transform = 'scale(1)';
    }, 200);
}

function checkout() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    
    alert('Checkout functionality would be implemented here. Total: ₹' + document.getElementById('cartTotal').textContent);
}

// Bidding functionality
let currentBiddingProduct = null;

function openBidding(productId, productName, price) {
    currentBiddingProduct = { id: productId, name: productName, price: price };
    
    const productEmojis = {
        'carrots': '🥕',
        'peppers': '🌶️',
        'spinach': '🥬',
        'apples': '🍎',
        'lemons': '🍋',
        'bananas': '🍌'
    };

    const productSummary = document.getElementById('biddingProductSummary');
    productSummary.innerHTML = `
        <div class="product-summary-image" style="background: linear-gradient(135deg, #f0f8f0, #e8f5e8);">
            ${productEmojis[productId]}
        </div>
        <div class="product-summary-details">
            <h4>${productName}</h4>
            <p>Fresh, quality produce available for bulk orders</p>
        </div>
    `;

    document.getElementById('currentPrice').textContent = `₹${price}/kg`;
    
    // Add event listeners for real-time calculation
    const quantityInput = document.getElementById('bidQuantity');
    const priceInput = document.getElementById('bidPrice');
    
    quantityInput.addEventListener('input', updateBidSummary);
    priceInput.addEventListener('input', updateBidSummary);
    
    document.getElementById('biddingModal').style.display = 'block';
}

function updateBidSummary() {
    const quantity = parseFloat(document.getElementById('bidQuantity').value) || 0;
    const bidPrice = parseFloat(document.getElementById('bidPrice').value) || 0;
    const total = quantity * bidPrice;

    document.getElementById('summaryQuantity').textContent = `${quantity} kg`;
    document.getElementById('summaryBidPrice').textContent = `₹${bidPrice}/kg`;
    document.getElementById('summaryTotal').textContent = `₹${total.toFixed(2)}`;
}

function submitBid() {
    const quantity = parseFloat(document.getElementById('bidQuantity').value);
    const bidPrice = parseFloat(document.getElementById('bidPrice').value);
    const message = document.getElementById('bidMessage').value;

    if (!quantity || quantity < 50) {
        alert('Minimum quantity is 50kg for bulk orders');
        return;
    }

    if (!bidPrice || bidPrice <= 0) {
        alert('Please enter a valid bid price');
        return;
    }

    // Simulate bid submission
    alert(`Bid submitted successfully!\n\nProduct: ${currentBiddingProduct.name}\nQuantity: ${quantity}kg\nYour Bid: ₹${bidPrice}/kg\nTotal: ₹${(quantity * bidPrice).toFixed(2)}\n\nThe farmer will review your bid and respond soon.`);
    
    closeModal('biddingModal');
    
    // Clear form
    document.getElementById('bidQuantity').value = '';
    document.getElementById('bidPrice').value = '';
    document.getElementById('bidMessage').value = '';
    updateBidSummary();
}

// Product filtering functionality
function initializeProductFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const productCards = document.querySelectorAll('.product-card');

    if (filterButtons.length === 0 || productCards.length === 0) {
        return; // Exit if elements don't exist on this page
    }

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            button.classList.add('active');

            const category = button.getAttribute('data-category');
            
            productCards.forEach(card => {
                const cardCategory = card.getAttribute('data-category');
                
                if (category === 'all' || cardCategory === category) {
                    card.classList.remove('hidden');
                    card.classList.add('visible');
                } else {
                    card.classList.remove('visible');
                    card.classList.add('hidden');
                }
            });
        });
    });

    // Initialize all products as visible
    productCards.forEach(card => {
        card.classList.add('visible');
    });
}

// Open product details page
function openProductDetails(productKey) {
    // Prevent event bubbling from child elements
    if (event) {
        event.stopPropagation();
    }
    
    // Open product details page with the selected product
    window.location.href = `product-details.html?product=${productKey}`;
}

// Enhanced demo login functionality
function loginWithDemo(userType) {
    // Prevent event bubbling
    if (event) {
        event.stopPropagation();
    }
    
    // Demo credentials
    const demoCredentials = {
        farmer: {
            email: 'farmer@demo.com',
            password: 'demo123',
            name: 'Demo Farmer',
            dashboard: 'farmer-dashboard.html'
        },
        consumer: {
            email: 'consumer@demo.com',
            password: 'demo123',
            name: 'Demo Consumer',
            dashboard: 'consumer-dashboard.html'
        },
        wholesaler: {
            email: 'wholesaler@demo.com',
            password: 'demo123',
            name: 'Demo Wholesaler',
            dashboard: 'wholesaler-dashboard.html'
        }
    };
    
    const credentials = demoCredentials[userType];
    if (!credentials) return;
    
    // Show loading animation on the clicked demo card
    const demoCard = document.querySelector(`.${userType}-demo`);
    if (demoCard) {
        const button = demoCard.querySelector('.btn-demo-login');
        const originalText = button.innerHTML;
        
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
        button.style.pointerEvents = 'none';
        
        // Simulate login process
        setTimeout(() => {
            // Store user session
            const userSession = {
                userType: userType,
                email: credentials.email,
                name: credentials.name,
                loginTime: new Date().toISOString(),
                isDemo: true
            };
            
            localStorage.setItem('userSession', JSON.stringify(userSession));
            localStorage.setItem('isLoggedIn', 'true');
            
            // Show success message
            button.innerHTML = '<i class="fas fa-check"></i> Success!';
            button.style.background = 'linear-gradient(135deg, #4caf50, #45a049)';
            
            // Close modal and redirect
            setTimeout(() => {
                closeModal('loginModal');
                
                // Show welcome notification
                showLoginNotification(credentials.name, userType);
                
                // Redirect to appropriate dashboard
                setTimeout(() => {
                    window.location.href = credentials.dashboard;
                }, 1500);
            }, 1000);
        }, 1500);
    }
}

// Show login notification
function showLoginNotification(name, userType) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'login-notification';
    notification.innerHTML = `
        <div class="notification-content">
            <div class="notification-icon">
                ${userType === 'farmer' ? '🌾' : userType === 'consumer' ? '🛒' : '🏭'}
            </div>
            <div class="notification-text">
                <h4>Welcome back, ${name}!</h4>
                <p>Redirecting to your ${userType} dashboard...</p>
            </div>
        </div>
    `;
    
    // Add notification styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #4caf50, #45a049);
        color: white;
        padding: 20px;
        border-radius: 15px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        z-index: 10000;
        animation: slideInRight 0.5s ease-out;
        max-width: 350px;
    `;
    
    // Add to document
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.5s ease-out';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 500);
    }, 3000);
}

// Add notification animations to document head
if (!document.querySelector('#notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
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
            gap: 15px;
        }
        
        .notification-icon {
            font-size: 2rem;
            background: rgba(255,255,255,0.2);
            border-radius: 50%;
            width: 50px;
            height: 50px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .notification-text h4 {
            margin: 0 0 5px 0;
            font-size: 1.1rem;
        }
        
        .notification-text p {
            margin: 0;
            font-size: 0.9rem;
            opacity: 0.9;
        }
    `;
    document.head.appendChild(style);
}
