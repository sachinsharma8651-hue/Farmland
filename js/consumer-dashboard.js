// Consumer Dashboard JavaScript
class ConsumerDashboard {
    constructor() {
        // Check authentication
        if (!requireUserType('consumer')) {
            return;
        }

        this.products = this.loadAllProducts();
        this.cart = this.loadCart();
        this.orders = this.loadOrders();
        this.favorites = this.loadFavorites();
        this.currentSection = 'browse';
        
        this.initializeEventListeners();
        this.loadUserProfile();
        this.updateDashboardStats();
        this.updateCartUI();
        this.renderProducts();
    }

    // Load all products from localStorage
    loadAllProducts() {
        return getFromStorage('products') || [];
    }

    // Load user's cart
    loadCart() {
        return getFromStorage(`cart_${currentUser.id}`) || [];
    }

    // Save cart to localStorage
    saveCart() {
        saveToStorage(`cart_${currentUser.id}`, this.cart);
        this.updateCartUI();
    }

    // Load user's orders
    loadOrders() {
        const allOrders = getFromStorage('orders') || [];
        return allOrders.filter(o => o.customerId === currentUser.id);
    }

    // Load user's favorites
    loadFavorites() {
        return getFromStorage(`favorites_${currentUser.id}`) || [];
    }

    // Save favorites to localStorage
    saveFavorites() {
        saveToStorage(`favorites_${currentUser.id}`, this.favorites);
    }

    // Initialize event listeners
    initializeEventListeners() {
        // Profile form
        const profileForm = document.getElementById('profileForm');
        if (profileForm) {
            profileForm.addEventListener('submit', (e) => this.handleUpdateProfile(e));
        }

        // Password form
        const passwordForm = document.getElementById('passwordForm');
        if (passwordForm) {
            passwordForm.addEventListener('submit', (e) => this.handleChangePassword(e));
        }

        // Checkout form
        const checkoutForm = document.getElementById('checkoutForm');
        if (checkoutForm) {
            checkoutForm.addEventListener('submit', (e) => this.handleCheckout(e));
        }
    }

    // Load user profile data
    loadUserProfile() {
        const welcomeMessage = document.getElementById('welcomeMessage');
        if (welcomeMessage) {
            welcomeMessage.textContent = `Welcome, ${currentUser.name}!`;
        }

        // Load profile form data
        const profileName = document.getElementById('profileName');
        const profileEmail = document.getElementById('profileEmail');
        const profilePhone = document.getElementById('profilePhone');
        const profileAddress = document.getElementById('profileAddress');

        if (profileName) profileName.value = currentUser.name || '';
        if (profileEmail) profileEmail.value = currentUser.email || '';
        if (profilePhone) profilePhone.value = currentUser.phone || '';
        if (profileAddress) profileAddress.value = currentUser.address || '';
    }

    // Update dashboard statistics
    updateDashboardStats() {
        const totalOrders = document.getElementById('totalOrders');
        const totalSpent = document.getElementById('totalSpent');
        const nearbyFarmers = document.getElementById('nearbyFarmers');

        if (totalOrders) {
            totalOrders.textContent = this.orders.length;
        }

        if (totalSpent) {
            const spent = this.orders
                .filter(o => o.status === 'delivered')
                .reduce((sum, order) => sum + order.totalAmount, 0);
            totalSpent.textContent = formatCurrency(spent);
        }

        if (nearbyFarmers && currentUser.location) {
            const farmers = authSystem.getNearbyUsers('farmer', 50);
            nearbyFarmers.textContent = farmers.length;
        }
    }

    // Update cart UI elements
    updateCartUI() {
        const cartCount = document.getElementById('cartCount');
        const navCartCount = document.getElementById('navCartCount');
        const count = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        
        if (cartCount) cartCount.textContent = count;
        if (navCartCount) navCartCount.textContent = count;
    }

    // Render products in the grid
    renderProducts() {
        const productsGrid = document.getElementById('productsGrid');
        if (!productsGrid) return;

        const filteredProducts = this.getFilteredProducts();
        
        if (filteredProducts.length === 0) {
            productsGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <h3>No products found</h3>
                    <p>Try adjusting your filters or search terms</p>
                </div>
            `;
            return;
        }

        productsGrid.innerHTML = filteredProducts.map(product => {
            const distance = this.calculateDistanceToProduct(product);
            const isFavorite = this.favorites.includes(product.id);
            
            return `
                <div class="product-card" onclick="consumerDashboard.showProductDetails('${product.id}')">
                    <div class="product-image">
                        <img src="${product.image}" alt="${product.name}" style="width: 100%; height: 100%; object-fit: cover;">
                    </div>
                    <div class="product-info">
                        <h3>${product.name}</h3>
                        <div class="product-farmer">
                            <i class="fas fa-user"></i> ${product.farmerName}
                        </div>
                        <span class="product-grade grade-${product.grade.toLowerCase()}">Grade ${product.grade}</span>
                        <div class="product-price">${formatCurrency(product.finalPrice)}/kg</div>
                        <div class="product-quantity">Available: ${product.remainingQuantity}kg</div>
                        ${distance ? `
                            <div class="product-distance">
                                <i class="fas fa-map-marker-alt"></i> ${distance.toFixed(1)}km away
                            </div>
                        ` : ''}
                        <div class="product-actions-consumer">
                            <button class="btn-add-cart" onclick="event.stopPropagation(); consumerDashboard.addToCart('${product.id}')">
                                <i class="fas fa-cart-plus"></i> Add to Cart
                            </button>
                            <button class="btn-favorite ${isFavorite ? 'active' : ''}" 
                                    onclick="event.stopPropagation(); consumerDashboard.toggleFavorite('${product.id}')">
                                <i class="fas fa-heart"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Calculate distance to product
    calculateDistanceToProduct(product) {
        if (!currentUser.location || !product.farmerLocation) return null;
        
        return calculateDistance(
            currentUser.location.latitude,
            currentUser.location.longitude,
            product.farmerLocation.latitude,
            product.farmerLocation.longitude
        );
    }

    // Get filtered products
    getFilteredProducts() {
        let filtered = this.products.filter(p => p.isActive && p.remainingQuantity > 0);

        // Search filter
        const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
        if (searchTerm) {
            filtered = filtered.filter(p => 
                p.name.toLowerCase().includes(searchTerm) ||
                p.farmerName.toLowerCase().includes(searchTerm) ||
                p.category.toLowerCase().includes(searchTerm)
            );
        }

        // Category filter
        const categoryFilter = document.getElementById('categoryFilter')?.value || '';
        if (categoryFilter) {
            filtered = filtered.filter(p => p.category === categoryFilter);
        }

        // Grade filter
        const gradeFilter = document.getElementById('gradeFilter')?.value || '';
        if (gradeFilter) {
            filtered = filtered.filter(p => p.grade === gradeFilter);
        }

        // Price filter
        const priceFilter = document.getElementById('priceFilter')?.value || '';
        if (priceFilter) {
            const [min, max] = priceFilter.split('-').map(p => p.replace('+', ''));
            filtered = filtered.filter(p => {
                if (max) {
                    return p.finalPrice >= parseInt(min) && p.finalPrice <= parseInt(max);
                } else {
                    return p.finalPrice >= parseInt(min);
                }
            });
        }

        // Distance filter
        const distanceFilter = document.getElementById('distanceFilter')?.value || '';
        if (distanceFilter && currentUser.location) {
            const maxDistance = parseInt(distanceFilter);
            filtered = filtered.filter(p => {
                const distance = this.calculateDistanceToProduct(p);
                return distance && distance <= maxDistance;
            });
        }

        // Sort products
        const sortBy = document.getElementById('sortBy')?.value || '';
        if (sortBy) {
            filtered = this.sortProducts(filtered, sortBy);
        }

        return filtered;
    }

    // Sort products
    sortProducts(products, sortBy) {
        return products.sort((a, b) => {
            switch (sortBy) {
                case 'price-low':
                    return a.finalPrice - b.finalPrice;
                case 'price-high':
                    return b.finalPrice - a.finalPrice;
                case 'grade':
                    return a.grade.localeCompare(b.grade);
                case 'distance':
                    if (currentUser.location) {
                        const distanceA = this.calculateDistanceToProduct(a) || Infinity;
                        const distanceB = this.calculateDistanceToProduct(b) || Infinity;
                        return distanceA - distanceB;
                    }
                    return 0;
                default:
                    return 0;
            }
        });
    }

    // Show product details modal
    showProductDetails(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        const distance = this.calculateDistanceToProduct(product);
        const isFavorite = this.favorites.includes(product.id);

        const productDetails = document.getElementById('productDetails');
        productDetails.innerHTML = `
            <div class="product-modal-header">
                <div class="product-modal-image">
                    <img src="${product.image}" alt="${product.name}">
                </div>
                <div class="product-modal-info">
                    <h2 class="product-modal-title">${product.name}</h2>
                    <div class="product-modal-farmer">
                        <i class="fas fa-user"></i> ${product.farmerName}
                    </div>
                    <div class="product-modal-price">${formatCurrency(product.finalPrice)}/kg</div>
                    <div class="product-modal-details">
                        <div class="detail-item">
                            <span class="detail-label">Category:</span>
                            <span>${product.category}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Grade:</span>
                            <span>Grade ${product.grade}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Available:</span>
                            <span>${product.remainingQuantity}kg</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Selling Type:</span>
                            <span>${product.sellingType === 'retail' ? 'Small Quantity' : 'Wholesale'}</span>
                        </div>
                        ${distance ? `
                            <div class="detail-item">
                                <span class="detail-label">Distance:</span>
                                <span>${distance.toFixed(1)}km away</span>
                            </div>
                        ` : ''}
                        ${product.availableQuantities ? `
                            <div class="detail-item">
                                <span class="detail-label">Quantities:</span>
                                <span>${product.availableQuantities.join(', ')}</span>
                            </div>
                        ` : ''}
                    </div>
                    ${product.description ? `
                        <div class="product-modal-description">
                            <h4>Description:</h4>
                            <p>${product.description}</p>
                        </div>
                    ` : ''}
                    <div class="product-modal-actions">
                        ${product.sellingType === 'retail' ? `
                            <div class="quantity-selector">
                                <label>Quantity:</label>
                                <select id="modalQuantitySelect">
                                    ${product.availableQuantities.map(qty => `
                                        <option value="${qty}">${qty}</option>
                                    `).join('')}
                                </select>
                            </div>
                        ` : ''}
                        <button class="btn-primary" onclick="consumerDashboard.addToCartFromModal('${product.id}')">
                            <i class="fas fa-cart-plus"></i> Add to Cart
                        </button>
                        <button class="btn-favorite ${isFavorite ? 'active' : ''}" 
                                onclick="consumerDashboard.toggleFavorite('${product.id}')">
                            <i class="fas fa-heart"></i> ${isFavorite ? 'Remove from' : 'Add to'} Favorites
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('productModal').style.display = 'block';
    }

    // Add product to cart
    addToCart(productId, quantity = '1kg') {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        // Check if product is already in cart
        const existingItem = this.cart.find(item => item.productId === productId && item.quantity === quantity);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push({
                id: generateId(),
                productId: product.id,
                productName: product.name,
                farmerName: product.farmerName,
                farmerId: product.farmerId,
                image: product.image,
                price: product.finalPrice,
                grade: product.grade,
                unit: quantity,
                quantity: 1,
                addedAt: getCurrentDateTime()
            });
        }

        this.saveCart();
        showNotification(`${product.name} added to cart!`, 'success');
    }

    // Add to cart from modal
    addToCartFromModal(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        let quantity = '1kg';
        if (product.sellingType === 'retail') {
            const quantitySelect = document.getElementById('modalQuantitySelect');
            quantity = quantitySelect ? quantitySelect.value : product.availableQuantities[0];
        }

        this.addToCart(productId, quantity);
        closeModal('productModal');
    }

    // Toggle favorite
    toggleFavorite(productId) {
        const index = this.favorites.indexOf(productId);
        if (index > -1) {
            this.favorites.splice(index, 1);
            showNotification('Removed from favorites', 'info');
        } else {
            this.favorites.push(productId);
            showNotification('Added to favorites', 'success');
        }
        
        this.saveFavorites();
        
        // Update UI if we're on the current page
        if (this.currentSection === 'browse') {
            this.renderProducts();
        } else if (this.currentSection === 'favorites') {
            this.renderFavorites();
        }
    }

    // Render cart items
    renderCart() {
        const cartItems = document.getElementById('cartItems');
        const cartSummary = document.getElementById('cartSummary');
        
        if (!cartItems) return;

        if (this.cart.length === 0) {
            cartItems.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-shopping-cart"></i>
                    <h3>Your cart is empty</h3>
                    <p>Add some fresh products to get started</p>
                    <button class="btn-primary" onclick="showSection('browse')">Browse Products</button>
                </div>
            `;
            cartSummary.classList.add('hidden');
            return;
        }

        cartItems.innerHTML = this.cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-image">
                    <img src="${item.image}" alt="${item.productName}">
                </div>
                <div class="cart-item-details">
                    <div class="cart-item-name">${item.productName}</div>
                    <div class="cart-item-farmer">by ${item.farmerName}</div>
                    <span class="cart-item-grade grade-${item.grade.toLowerCase()}">Grade ${item.grade}</span>
                </div>
                <div class="cart-item-controls">
                    <div class="quantity-controls">
                        <button class="quantity-btn" onclick="consumerDashboard.updateCartQuantity('${item.id}', -1)">
                            <i class="fas fa-minus"></i>
                        </button>
                        <span class="quantity-display">${item.quantity} × ${item.unit}</span>
                        <button class="quantity-btn" onclick="consumerDashboard.updateCartQuantity('${item.id}', 1)">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                    <div class="cart-item-price">${formatCurrency(item.price * item.quantity)}</div>
                    <button class="remove-item" onclick="consumerDashboard.removeFromCart('${item.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');

        // Update cart summary
        this.updateCartSummary();
        cartSummary.classList.remove('hidden');
    }

    // Update cart summary
    updateCartSummary() {
        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const deliveryFee = 50; // Fixed delivery fee
        const total = subtotal + deliveryFee;

        const cartSubtotal = document.getElementById('cartSubtotal');
        const cartTotal = document.getElementById('cartTotal');
        const checkoutSubtotal = document.getElementById('checkoutSubtotal');
        const checkoutTotal = document.getElementById('checkoutTotal');

        if (cartSubtotal) cartSubtotal.textContent = formatCurrency(subtotal);
        if (cartTotal) cartTotal.textContent = formatCurrency(total);
        if (checkoutSubtotal) checkoutSubtotal.textContent = formatCurrency(subtotal);
        if (checkoutTotal) checkoutTotal.textContent = formatCurrency(total);
    }

    // Update cart item quantity
    updateCartQuantity(itemId, change) {
        const item = this.cart.find(i => i.id === itemId);
        if (!item) return;

        item.quantity += change;
        
        if (item.quantity <= 0) {
            this.removeFromCart(itemId);
        } else {
            this.saveCart();
            this.renderCart();
        }
    }

    // Remove item from cart
    removeFromCart(itemId) {
        this.cart = this.cart.filter(item => item.id !== itemId);
        this.saveCart();
        this.renderCart();
        showNotification('Item removed from cart', 'info');
    }

    // Clear entire cart
    clearCart() {
        if (confirm('Are you sure you want to clear your cart?')) {
            this.cart = [];
            this.saveCart();
            this.renderCart();
            showNotification('Cart cleared', 'info');
        }
    }

    // Proceed to checkout
    proceedToCheckout() {
        if (this.cart.length === 0) {
            showNotification('Your cart is empty', 'error');
            return;
        }

        // Populate delivery address
        const deliveryAddress = document.getElementById('deliveryAddress');
        if (deliveryAddress) {
            deliveryAddress.value = currentUser.address || '';
        }

        this.updateCartSummary();
        document.getElementById('checkoutModal').style.display = 'block';
    }

    // Handle checkout
    handleCheckout(event) {
        event.preventDefault();

        const orderData = {
            deliveryAddress: document.getElementById('deliveryAddress').value,
            deliveryTime: document.getElementById('deliveryTime').value,
            paymentMethod: document.getElementById('paymentMethod').value,
            orderNotes: document.getElementById('orderNotes').value
        };

        // Validate checkout data
        if (!orderData.deliveryAddress || !orderData.deliveryTime || !orderData.paymentMethod) {
            showNotification('Please fill in all required fields', 'error');
            return;
        }

        // Create order
        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const deliveryFee = 50;
        const total = subtotal + deliveryFee;

        const order = {
            id: generateId(),
            customerId: currentUser.id,
            customerName: currentUser.name,
            customerPhone: currentUser.phone,
            items: this.cart.map(item => ({
                productId: item.productId,
                productName: item.productName,
                farmerId: item.farmerId,
                farmerName: item.farmerName,
                quantity: item.quantity,
                unit: item.unit,
                price: item.price,
                grade: item.grade
            })),
            subtotal: subtotal,
            deliveryFee: deliveryFee,
            totalAmount: total,
            deliveryAddress: orderData.deliveryAddress,
            deliveryTime: orderData.deliveryTime,
            paymentMethod: orderData.paymentMethod,
            orderNotes: orderData.orderNotes,
            status: 'pending',
            createdAt: getCurrentDateTime()
        };

        // Save order
        const allOrders = getFromStorage('orders') || [];
        allOrders.push(order);
        saveToStorage('orders', allOrders);

        // Clear cart
        this.cart = [];
        this.saveCart();

        // Update orders list
        this.orders = this.loadOrders();
        this.updateDashboardStats();

        showNotification('Order placed successfully!', 'success');
        closeModal('checkoutModal');
        showSection('orders');
        this.renderOrders();
    }

    // Render orders
    renderOrders(filter = 'all') {
        const ordersContainer = document.getElementById('ordersContainer');
        if (!ordersContainer) return;

        let filteredOrders = this.orders;
        if (filter !== 'all') {
            filteredOrders = this.orders.filter(order => order.status === filter);
        }

        if (filteredOrders.length === 0) {
            ordersContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-receipt"></i>
                    <h3>No orders found</h3>
                    <p>Your orders will appear here after you place them</p>
                </div>
            `;
            return;
        }

        ordersContainer.innerHTML = filteredOrders.map(order => `
            <div class="order-card">
                <div class="order-header">
                    <span class="order-id">Order #${order.id.substr(-8)}</span>
                    <span class="order-status status-${order.status}">${order.status.toUpperCase()}</span>
                </div>
                <div class="order-details">
                    <div class="order-detail">
                        <h4>Total Amount</h4>
                        <p>${formatCurrency(order.totalAmount)}</p>
                    </div>
                    <div class="order-detail">
                        <h4>Order Date</h4>
                        <p>${formatDate(order.createdAt)}</p>
                    </div>
                    <div class="order-detail">
                        <h4>Delivery Time</h4>
                        <p>${order.deliveryTime === 'morning' ? 'Morning (6 AM - 12 PM)' : 'Evening (2 PM - 8 PM)'}</p>
                    </div>
                </div>
                <div class="order-items">
                    <h4>Items:</h4>
                    ${order.items.map(item => `
                        <div class="order-item">
                            ${item.productName} - ${item.quantity} × ${item.unit} (Grade ${item.grade}) - ${formatCurrency(item.price * item.quantity)}
                        </div>
                    `).join('')}
                </div>
                <div class="order-actions">
                    <button class="btn-view" onclick="consumerDashboard.viewOrderDetails('${order.id}')">
                        View Details
                    </button>
                    ${order.status === 'pending' ? `
                        <button class="btn-reject" onclick="consumerDashboard.cancelOrder('${order.id}')">
                            Cancel Order
                        </button>
                    ` : ''}
                </div>
            </div>
        `).join('');
    }

    // View order details
    viewOrderDetails(orderId) {
        const order = this.orders.find(o => o.id === orderId);
        if (order) {
            alert(`Order Details:\n\nOrder ID: ${order.id}\nStatus: ${order.status}\nTotal: ${formatCurrency(order.totalAmount)}\nDelivery Address: ${order.deliveryAddress}\nPayment Method: ${order.paymentMethod}\nDate: ${formatDate(order.createdAt)}`);
        }
    }

    // Cancel order
    cancelOrder(orderId) {
        if (confirm('Are you sure you want to cancel this order?')) {
            const orderIndex = this.orders.findIndex(o => o.id === orderId);
            if (orderIndex !== -1) {
                this.orders[orderIndex].status = 'cancelled';
                
                // Update in global storage
                const allOrders = getFromStorage('orders') || [];
                const globalOrderIndex = allOrders.findIndex(o => o.id === orderId);
                if (globalOrderIndex !== -1) {
                    allOrders[globalOrderIndex] = this.orders[orderIndex];
                    saveToStorage('orders', allOrders);
                }

                showNotification('Order cancelled successfully', 'success');
                this.renderOrders();
            }
        }
    }

    // Render favorites
    renderFavorites() {
        const favoritesGrid = document.getElementById('favoritesGrid');
        if (!favoritesGrid) return;

        const favoriteProducts = this.products.filter(p => this.favorites.includes(p.id));

        if (favoriteProducts.length === 0) {
            favoritesGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-heart"></i>
                    <h3>No favorites yet</h3>
                    <p>Add products to your favorites to see them here</p>
                    <button class="btn-primary" onclick="showSection('browse')">Browse Products</button>
                </div>
            `;
            return;
        }

        favoritesGrid.innerHTML = favoriteProducts.map(product => {
            const distance = this.calculateDistanceToProduct(product);
            
            return `
                <div class="product-card" onclick="consumerDashboard.showProductDetails('${product.id}')">
                    <div class="product-image">
                        <img src="${product.image}" alt="${product.name}" style="width: 100%; height: 100%; object-fit: cover;">
                    </div>
                    <div class="product-info">
                        <h3>${product.name}</h3>
                        <div class="product-farmer">
                            <i class="fas fa-user"></i> ${product.farmerName}
                        </div>
                        <span class="product-grade grade-${product.grade.toLowerCase()}">Grade ${product.grade}</span>
                        <div class="product-price">${formatCurrency(product.finalPrice)}/kg</div>
                        <div class="product-quantity">Available: ${product.remainingQuantity}kg</div>
                        ${distance ? `
                            <div class="product-distance">
                                <i class="fas fa-map-marker-alt"></i> ${distance.toFixed(1)}km away
                            </div>
                        ` : ''}
                        <div class="product-actions-consumer">
                            <button class="btn-add-cart" onclick="event.stopPropagation(); consumerDashboard.addToCart('${product.id}')">
                                <i class="fas fa-cart-plus"></i> Add to Cart
                            </button>
                            <button class="btn-favorite active" onclick="event.stopPropagation(); consumerDashboard.toggleFavorite('${product.id}')">
                                <i class="fas fa-heart"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Handle profile update
    handleUpdateProfile(event) {
        event.preventDefault();

        const updateData = {
            name: document.getElementById('profileName').value,
            phone: document.getElementById('profilePhone').value,
            address: document.getElementById('profileAddress').value
        };

        if (authSystem.updateUserProfile(currentUser.id, updateData)) {
            showNotification('Profile updated successfully!', 'success');
        } else {
            showNotification('Failed to update profile', 'error');
        }
    }

    // Handle password change
    handleChangePassword(event) {
        event.preventDefault();

        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (newPassword !== confirmPassword) {
            showNotification('New passwords do not match', 'error');
            return;
        }

        if (authSystem.changePassword(currentUser.id, currentPassword, newPassword)) {
            document.getElementById('passwordForm').reset();
        }
    }
}

// Global functions for dashboard navigation
function showSection(sectionName) {
    // Hide all sections
    const sections = document.querySelectorAll('.dashboard-content');
    sections.forEach(section => section.classList.add('hidden'));

    // Show selected section
    const targetSection = document.getElementById(`${sectionName}-section`);
    if (targetSection) {
        targetSection.classList.remove('hidden');
    }

    // Update navigation
    const navButtons = document.querySelectorAll('.dashboard-nav button');
    navButtons.forEach(btn => btn.classList.remove('active'));
    
    const activeButton = document.querySelector(`[onclick="showSection('${sectionName}')"]`);
    if (activeButton) {
        activeButton.classList.add('active');
    }

    // Update current section
    consumerDashboard.currentSection = sectionName;

    // Load section-specific data
    switch (sectionName) {
        case 'browse':
            consumerDashboard.renderProducts();
            break;
        case 'cart':
            consumerDashboard.renderCart();
            break;
        case 'orders':
            consumerDashboard.renderOrders();
            break;
        case 'favorites':
            consumerDashboard.renderFavorites();
            break;
    }
}

function searchProducts() {
    consumerDashboard.renderProducts();
}

function filterProducts() {
    consumerDashboard.renderProducts();
}

function sortProducts() {
    consumerDashboard.renderProducts();
}

function filterOrders(status) {
    // Update filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => btn.classList.remove('active'));
    
    const activeButton = document.querySelector(`[onclick="filterOrders('${status}')"]`);
    if (activeButton) {
        activeButton.classList.add('active');
    }

    // Render filtered orders
    consumerDashboard.renderOrders(status);
}

// Initialize consumer dashboard
let consumerDashboard;
document.addEventListener('DOMContentLoaded', function() {
    consumerDashboard = new ConsumerDashboard();
});
