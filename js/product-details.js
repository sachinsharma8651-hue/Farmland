// Product Details Page JavaScript

// Product data structure
const productData = {
    carrots: {
        name: 'Fresh Organic Carrots',
        category: 'Vegetables',
        visual: '🥕',
        description: 'Premium quality organic carrots grown with sustainable farming practices. Rich in beta-carotene, vitamins, and minerals. Perfect for cooking, juicing, or eating raw.',
        farmer: {
            name: 'Green Valley Farm',
            location: 'Punjab, India'
        },
        grades: {
            'grade-a': { price: 45, label: 'Grade A' },
            'grade-b': { price: 35, label: 'Grade B' }
        },
        rating: 4.8,
        reviews: 127
    },
    peppers: {
        name: 'Fresh Bell Peppers',
        category: 'Vegetables',
        visual: '🌶️',
        description: 'Crisp and colorful bell peppers packed with vitamin C and antioxidants. Perfect for salads, stir-fries, and grilling.',
        farmer: {
            name: 'Sunshine Farms',
            location: 'Maharashtra, India'
        },
        grades: {
            'grade-a': { price: 65, label: 'Grade A' },
            'grade-b': { price: 50, label: 'Grade B' }
        },
        rating: 4.6,
        reviews: 89
    },
    spinach: {
        name: 'Fresh Spinach Leaves',
        category: 'Vegetables',
        visual: '🥬',
        description: 'Tender, fresh spinach leaves rich in iron, vitamins, and minerals. Ideal for salads, smoothies, and cooking.',
        farmer: {
            name: 'Organic Greens Co.',
            location: 'Karnataka, India'
        },
        grades: {
            'grade-a': { price: 30, label: 'Grade A' },
            'grade-b': { price: 25, label: 'Grade B' }
        },
        rating: 4.9,
        reviews: 156
    },
    tomatoes: {
        name: 'Fresh Tomatoes',
        category: 'Vegetables',
        visual: '🍅',
        description: 'Juicy, vine-ripened tomatoes bursting with flavor. Perfect for cooking, salads, and sauces.',
        farmer: {
            name: 'Red Valley Farm',
            location: 'Himachal Pradesh, India'
        },
        grades: {
            'grade-a': { price: 40, label: 'Grade A' },
            'grade-b': { price: 32, label: 'Grade B' }
        },
        rating: 4.7,
        reviews: 203
    },
    apples: {
        name: 'Red Apples',
        category: 'Fruits',
        visual: '🍎',
        description: 'Sweet and crunchy red apples packed with fiber and vitamins. Perfect for snacking, baking, or making fresh juice.',
        farmer: {
            name: 'Mountain Orchards',
            location: 'Himachal Pradesh, India'
        },
        grades: {
            'grade-a': { price: 130, label: 'Grade A' },
            'grade-b': { price: 110, label: 'Grade B' }
        },
        rating: 4.8,
        reviews: 145
    },
    lemons: {
        name: 'Fresh Lemons',
        category: 'Fruits',
        visual: '🍋',
        description: 'Juicy, vitamin-rich lemons with high citric acid content. Excellent for cooking, drinks, and natural remedies.',
        farmer: {
            name: 'Citrus Grove Farm',
            location: 'Andhra Pradesh, India'
        },
        grades: {
            'grade-a': { price: 85, label: 'Grade A' },
            'grade-b': { price: 70, label: 'Grade B' }
        },
        rating: 4.5,
        reviews: 98
    },
    bananas: {
        name: 'Bananas',
        category: 'Fruits',
        visual: '🍌',
        description: 'Ripe, sweet bananas rich in potassium and natural sugars. Great for energy, smoothies, and healthy snacking.',
        farmer: {
            name: 'Tropical Fruit Co.',
            location: 'Kerala, India'
        },
        grades: {
            'grade-a': { price: 55, label: 'Grade A' },
            'grade-b': { price: 45, label: 'Grade B' }
        },
        rating: 4.6,
        reviews: 187
    }
};

// Current product state
let currentProduct = 'carrots';
let selectedGrade = 'grade-a';
let selectedQuantity = '1kg';

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    // Get product from URL parameter or default to carrots
    const urlParams = new URLSearchParams(window.location.search);
    const productParam = urlParams.get('product');
    if (productParam && productData[productParam]) {
        currentProduct = productParam;
    }
    
    loadProductData();
    updateCartDisplay();
    
    // Add smooth scroll behavior
    document.documentElement.style.scrollBehavior = 'smooth';
});

// Load product data into the page
function loadProductData() {
    const product = productData[currentProduct];
    if (!product) return;
    
    // Update basic product info
    document.getElementById('productTitle').textContent = product.name;
    document.getElementById('productCategory').textContent = product.name;
    document.getElementById('productDescription').textContent = product.description;
    document.getElementById('productVisual').textContent = product.visual;
    
    // Update farmer info
    document.getElementById('farmerName').textContent = product.farmer.name;
    document.getElementById('farmerLocation').textContent = product.farmer.location;
    
    // Update rating
    const ratingText = document.querySelector('.rating-text');
    if (ratingText) {
        ratingText.textContent = `${product.rating} (${product.reviews} reviews)`;
    }
    
    // Update grade cards with current product prices
    updateGradePrices();
    
    // Update quantity prices
    updateQuantityPrices();
    
    // Set initial selections
    selectDetailedGrade(selectedGrade, product.grades[selectedGrade].price);
    selectDetailedQuantity(selectedQuantity);
}

// Update grade prices for current product
function updateGradePrices() {
    const product = productData[currentProduct];
    if (!product) return;
    
    const gradeACard = document.querySelector('[data-grade="grade-a"]');
    const gradeBCard = document.querySelector('[data-grade="grade-b"]');
    
    if (gradeACard) {
        const priceElement = gradeACard.querySelector('.grade-price');
        if (priceElement) {
            priceElement.textContent = `₹${product.grades['grade-a'].price}/kg`;
        }
        gradeACard.setAttribute('data-price', product.grades['grade-a'].price);
    }
    
    if (gradeBCard) {
        const priceElement = gradeBCard.querySelector('.grade-price');
        if (priceElement) {
            priceElement.textContent = `₹${product.grades['grade-b'].price}/kg`;
        }
        gradeBCard.setAttribute('data-price', product.grades['grade-b'].price);
    }
}

// Update quantity prices based on selected grade
function updateQuantityPrices() {
    const product = productData[currentProduct];
    if (!product) return;
    
    const currentPrice = product.grades[selectedGrade].price;
    
    // Update quantity price displays
    const price250g = document.getElementById('price250g');
    const price500g = document.getElementById('price500g');
    const price1kg = document.getElementById('price1kg');
    
    if (price250g) price250g.textContent = `₹${(currentPrice * 0.25).toFixed(2)}`;
    if (price500g) price500g.textContent = `₹${(currentPrice * 0.5).toFixed(2)}`;
    if (price1kg) price1kg.textContent = `₹${currentPrice.toFixed(2)}`;
}

// Select grade in detailed view
function selectDetailedGrade(grade, price) {
    // Remove active class from all grade cards
    document.querySelectorAll('.grade-card').forEach(card => {
        card.classList.remove('active');
    });
    
    // Add active class to selected grade
    const selectedCard = document.querySelector(`[data-grade="${grade}"]`);
    if (selectedCard) {
        selectedCard.classList.add('active');
        selectedGrade = grade;
        
        // Update quantity prices with new grade
        updateQuantityPrices();
        
        // Update current price display
        updateCurrentPrice();
        
        // Add selection animation
        selectedCard.style.transform = 'scale(1.02)';
        setTimeout(() => {
            selectedCard.style.transform = '';
        }, 200);
    }
}

// Select quantity in detailed view
function selectDetailedQuantity(quantity) {
    // Remove active class from all quantity cards
    document.querySelectorAll('.quantity-card').forEach(card => {
        card.classList.remove('active');
    });
    
    // Add active class to selected quantity
    const selectedCard = document.querySelector(`[data-quantity="${quantity}"]`);
    if (selectedCard) {
        selectedCard.classList.add('active');
        selectedQuantity = quantity;
        
        // Update current price display
        updateCurrentPrice();
        
        // Add selection animation
        selectedCard.style.transform = 'scale(1.05)';
        setTimeout(() => {
            selectedCard.style.transform = '';
        }, 200);
    }
}

// Update current price display
function updateCurrentPrice() {
    const product = productData[currentProduct];
    if (!product) return;
    
    const basePrice = product.grades[selectedGrade].price;
    let multiplier = 1;
    
    switch (selectedQuantity) {
        case '250g':
            multiplier = 0.25;
            break;
        case '500g':
            multiplier = 0.5;
            break;
        case '1kg':
            multiplier = 1;
            break;
    }
    
    const finalPrice = (basePrice * multiplier).toFixed(2);
    
    const currentPriceElement = document.getElementById('currentPrice');
    const pricePerKgElement = document.getElementById('pricePerKg');
    
    if (currentPriceElement) {
        currentPriceElement.textContent = `₹${finalPrice}`;
        
        // Add price update animation
        currentPriceElement.style.transform = 'scale(1.1)';
        currentPriceElement.style.color = '#ff6b35';
        setTimeout(() => {
            currentPriceElement.style.transform = '';
            currentPriceElement.style.color = '';
        }, 300);
    }
    
    if (pricePerKgElement) {
        pricePerKgElement.textContent = `₹${basePrice}/kg`;
    }
}

// Change product view (main, farm, harvest)
function changeProductView(view) {
    const productVisual = document.getElementById('productVisual');
    const thumbnails = document.querySelectorAll('.thumbnail');
    
    // Remove active class from all thumbnails
    thumbnails.forEach(thumb => thumb.classList.remove('active'));
    
    // Add active class to selected thumbnail
    const selectedThumb = document.querySelector(`[onclick="changeProductView('${view}')"]`);
    if (selectedThumb) {
        selectedThumb.classList.add('active');
    }
    
    // Update main image based on view
    switch (view) {
        case 'main':
            productVisual.textContent = productData[currentProduct].visual;
            productVisual.parentElement.style.background = 'linear-gradient(135deg, #ff8c42, #ffa726)';
            break;
        case 'farm':
            productVisual.innerHTML = '<i class="fas fa-tractor"></i>';
            productVisual.parentElement.style.background = 'linear-gradient(135deg, #4caf50, #45a049)';
            break;
        case 'harvest':
            productVisual.innerHTML = '<i class="fas fa-seedling"></i>';
            productVisual.parentElement.style.background = 'linear-gradient(135deg, #8bc34a, #689f38)';
            break;
    }
    
    // Add transition animation
    productVisual.style.transform = 'scale(0.8) rotate(10deg)';
    setTimeout(() => {
        productVisual.style.transform = '';
    }, 300);
}

// Switch tabs
function switchTab(tabName) {
    // Remove active class from all tab buttons and panels
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));
    
    // Add active class to selected tab button and panel
    const selectedBtn = document.querySelector(`[onclick="switchTab('${tabName}')"]`);
    const selectedPanel = document.getElementById(`${tabName}Tab`);
    
    if (selectedBtn) selectedBtn.classList.add('active');
    if (selectedPanel) selectedPanel.classList.add('active');
}

// Add to cart from details page
function addToCartFromDetails() {
    const product = productData[currentProduct];
    if (!product) return;
    
    const grade = selectedGrade;
    const quantity = selectedQuantity;
    const basePrice = product.grades[grade].price;
    
    // Convert quantity to kg for calculation
    let quantityInKg;
    switch (quantity) {
        case '250g':
            quantityInKg = 0.25;
            break;
        case '500g':
            quantityInKg = 0.5;
            break;
        case '1kg':
            quantityInKg = 1;
            break;
        default:
            quantityInKg = 1;
    }
    
    // Create cart item
    const cartItem = {
        id: `${currentProduct}-${grade}-${quantity}`,
        name: product.name,
        grade: product.grades[grade].label,
        quantity: quantity,
        quantityInKg: quantityInKg,
        price: basePrice,
        total: (basePrice * quantityInKg).toFixed(2),
        visual: product.visual
    };
    
    // Get existing cart or create new one
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Check if item already exists in cart
    const existingItemIndex = cart.findIndex(item => item.id === cartItem.id);
    
    if (existingItemIndex > -1) {
        // Update existing item quantity
        const existingItem = cart[existingItemIndex];
        const newQuantityInKg = existingItem.quantityInKg + quantityInKg;
        
        // Determine new quantity display
        if (newQuantityInKg === 0.25) {
            existingItem.quantity = '250g';
        } else if (newQuantityInKg === 0.5) {
            existingItem.quantity = '500g';
        } else if (newQuantityInKg === 0.75) {
            existingItem.quantity = '750g';
        } else if (newQuantityInKg >= 1) {
            existingItem.quantity = `${newQuantityInKg}kg`;
        }
        
        existingItem.quantityInKg = newQuantityInKg;
        existingItem.total = (basePrice * newQuantityInKg).toFixed(2);
    } else {
        // Add new item to cart
        cart.push(cartItem);
    }
    
    // Save cart to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Update cart display
    updateCartDisplay();
    
    // Show success animation
    showAddToCartAnimation();
}

// Show add to cart animation
function showAddToCartAnimation() {
    const addButton = document.querySelector('.btn-add-to-cart');
    const originalText = addButton.innerHTML;
    
    // Change button to success state
    addButton.innerHTML = '<i class="fas fa-check"></i> Added!';
    addButton.style.background = 'linear-gradient(135deg, #4caf50, #45a049)';
    addButton.style.transform = 'scale(1.05)';
    
    // Reset button after animation
    setTimeout(() => {
        addButton.innerHTML = originalText;
        addButton.style.background = '';
        addButton.style.transform = '';
    }, 2000);
    
    // Show cart notification
    showCartNotification(`${productData[currentProduct].name} added to cart!`);
}

// Buy now function
function buyNow() {
    addToCartFromDetails();
    
    // Simulate redirect to checkout
    setTimeout(() => {
        alert('Redirecting to checkout...\n\nIn a real application, this would take you to the payment page.');
    }, 500);
}

// Load different product
function loadProduct(productKey) {
    if (productData[productKey]) {
        currentProduct = productKey;
        selectedGrade = 'grade-a'; // Reset to default grade
        selectedQuantity = '1kg'; // Reset to default quantity
        
        // Update URL without page reload
        const newUrl = `${window.location.pathname}?product=${productKey}`;
        window.history.pushState({ product: productKey }, '', newUrl);
        
        // Reload product data
        loadProductData();
        
        // Scroll to top smoothly
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Add page transition animation
        document.querySelector('.product-details-container').style.opacity = '0.7';
        setTimeout(() => {
            document.querySelector('.product-details-container').style.opacity = '';
        }, 300);
    }
}

// Handle browser back/forward buttons
window.addEventListener('popstate', function(event) {
    if (event.state && event.state.product) {
        currentProduct = event.state.product;
        loadProductData();
    }
});

// Smooth scroll for mobile
function smoothScrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Add intersection observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for scroll animations
document.addEventListener('DOMContentLoaded', function() {
    const animatedElements = document.querySelectorAll('.detail-card, .nutrition-item, .review-item, .related-item');
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// Add keyboard navigation
document.addEventListener('keydown', function(event) {
    switch(event.key) {
        case '1':
            selectDetailedQuantity('250g');
            break;
        case '2':
            selectDetailedQuantity('500g');
            break;
        case '3':
            selectDetailedQuantity('1kg');
            break;
        case 'a':
        case 'A':
            selectDetailedGrade('grade-a', productData[currentProduct].grades['grade-a'].price);
            break;
        case 'b':
        case 'B':
            selectDetailedGrade('grade-b', productData[currentProduct].grades['grade-b'].price);
            break;
        case 'Enter':
            if (event.target.tagName !== 'INPUT' && event.target.tagName !== 'TEXTAREA') {
                addToCartFromDetails();
                event.preventDefault();
            }
            break;
    }
});

// Add touch gestures for mobile
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener('touchstart', function(event) {
    touchStartX = event.changedTouches[0].screenX;
});

document.addEventListener('touchend', function(event) {
    touchEndX = event.changedTouches[0].screenX;
    handleSwipe();
});

function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;
    
    if (Math.abs(diff) > swipeThreshold) {
        const productKeys = Object.keys(productData);
        const currentIndex = productKeys.indexOf(currentProduct);
        
        if (diff > 0 && currentIndex < productKeys.length - 1) {
            // Swipe left - next product
            loadProduct(productKeys[currentIndex + 1]);
        } else if (diff < 0 && currentIndex > 0) {
            // Swipe right - previous product
            loadProduct(productKeys[currentIndex - 1]);
        }
    }
}
