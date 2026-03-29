// Wholesaler Dashboard JavaScript
class WholesalerDashboard {
    constructor() {
        // Check authentication
        if (!requireUserType('wholesaler')) {
            return;
        }

        this.products = this.loadAllProducts();
        this.orders = this.loadOrders();
        this.visits = this.loadVisits();
        this.partnerFarms = this.loadPartnerFarms();
        this.currentSection = 'browse';
        this.viewMode = 'online'; // 'online' or 'visit'
        
        this.initializeEventListeners();
        this.loadUserProfile();
        this.updateDashboardStats();
        this.renderProducts();
    }

    // Load all products from localStorage
    loadAllProducts() {
        const allProducts = getFromStorage('products') || [];
        // Filter for wholesale products or products with sufficient quantity
        return allProducts.filter(p => 
            p.isActive && 
            p.remainingQuantity >= 100 && // Minimum 100kg for wholesale
            (p.sellingType === 'wholesale' || p.remainingQuantity >= 500)
        );
    }

    // Load user's orders
    loadOrders() {
        const allOrders = getFromStorage('orders') || [];
        return allOrders.filter(o => o.customerId === currentUser.id);
    }

    // Load user's farm visits
    loadVisits() {
        return getFromStorage(`visits_${currentUser.id}`) || [];
    }

    // Save visits to localStorage
    saveVisits() {
        saveToStorage(`visits_${currentUser.id}`, this.visits);
    }

    // Load partner farms
    loadPartnerFarms() {
        return getFromStorage(`partners_${currentUser.id}`) || [];
    }

    // Save partner farms
    savePartnerFarms() {
        saveToStorage(`partners_${currentUser.id}`, this.partnerFarms);
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

        // Bulk order form
        const bulkOrderForm = document.getElementById('bulkOrderForm');
        if (bulkOrderForm) {
            bulkOrderForm.addEventListener('submit', (e) => this.handleBulkOrder(e));
        }

        // Farm visit form
        const farmVisitForm = document.getElementById('farmVisitForm');
        if (farmVisitForm) {
            farmVisitForm.addEventListener('submit', (e) => this.handleFarmVisit(e));
        }

        // Order quantity change listener
        const orderQuantity = document.getElementById('orderQuantity');
        if (orderQuantity) {
            orderQuantity.addEventListener('input', () => this.updateOrderTotal());
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
        const businessType = document.getElementById('businessType');
        const monthlyVolume = document.getElementById('monthlyVolume');

        if (profileName) profileName.value = currentUser.name || '';
        if (profileEmail) profileEmail.value = currentUser.email || '';
        if (profilePhone) profilePhone.value = currentUser.phone || '';
        if (profileAddress) profileAddress.value = currentUser.address || '';
        if (businessType) businessType.value = currentUser.businessType || 'distributor';
        if (monthlyVolume) monthlyVolume.value = currentUser.monthlyVolume || '';
    }

    // Update dashboard statistics
    updateDashboardStats() {
        const totalOrders = document.getElementById('totalOrders');
        const totalSpent = document.getElementById('totalSpent');
        const partnerFarms = document.getElementById('partnerFarms');

        if (totalOrders) {
            totalOrders.textContent = this.orders.length;
        }

        if (totalSpent) {
            const spent = this.orders
                .filter(o => o.status === 'delivered')
                .reduce((sum, order) => sum + order.totalAmount, 0);
            totalSpent.textContent = formatCurrency(spent);
        }

        if (partnerFarms) {
            partnerFarms.textContent = this.partnerFarms.length;
        }
    }

    // Set view mode (online or visit)
    setViewMode(mode) {
        this.viewMode = mode;
        
        // Update view buttons
        const viewButtons = document.querySelectorAll('.view-btn');
        viewButtons.forEach(btn => btn.classList.remove('active'));
        
        const activeButton = document.querySelector(`[onclick="setViewMode('${mode}')"]`);
        if (activeButton) {
            activeButton.classList.add('active');
        }

        this.renderProducts();
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
                    <h3>No wholesale products found</h3>
                    <p>Try adjusting your filters or check back later</p>
                </div>
            `;
            return;
        }

        productsGrid.innerHTML = filteredProducts.map(product => {
            const distance = this.calculateDistanceToProduct(product);
            
            return `
                <div class="wholesale-product-card">
                    <div class="wholesale-product-header">
                        <img src="${product.image}" alt="${product.name}" class="wholesale-product-image">
                        <div class="wholesale-badge">WHOLESALE</div>
                    </div>
                    <div class="wholesale-product-info">
                        <h3 class="wholesale-product-title">${product.name}</h3>
                        <div class="wholesale-farmer-info">
                            <i class="fas fa-user"></i>
                            <span>${product.farmerName}</span>
                        </div>
                        <div class="wholesale-product-details">
                            <div class="wholesale-detail-item">
                                <span class="wholesale-detail-label">Grade</span>
                                <span class="wholesale-detail-value">Grade ${product.grade}</span>
                            </div>
                            <div class="wholesale-detail-item">
                                <span class="wholesale-detail-label">Available</span>
                                <span class="wholesale-detail-value">${product.remainingQuantity}kg</span>
                            </div>
                            <div class="wholesale-detail-item">
                                <span class="wholesale-detail-label">Category</span>
                                <span class="wholesale-detail-value">${product.category}</span>
                            </div>
                            ${distance ? `
                                <div class="wholesale-detail-item">
                                    <span class="wholesale-detail-label">Distance</span>
                                    <span class="wholesale-detail-value">${distance.toFixed(1)}km</span>
                                </div>
                            ` : ''}
                        </div>
                        <div class="wholesale-price">${formatCurrency(product.finalPrice * 0.9)}/kg</div>
                        <div class="wholesale-actions">
                            ${this.viewMode === 'online' ? `
                                <button class="btn-bulk-order" onclick="wholesalerDashboard.showBulkOrderModal('${product.id}')">
                                    <i class="fas fa-shopping-cart"></i> Bulk Order
                                </button>
                            ` : `
                                <button class="btn-visit-farm" onclick="wholesalerDashboard.showFarmVisitModal('${product.farmerId}')">
                                    <i class="fas fa-map-marker-alt"></i> Visit Farm
                                </button>
                            `}
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
        let filtered = [...this.products];

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

        // Quantity filter
        const quantityFilter = document.getElementById('quantityFilter')?.value || '';
        if (quantityFilter) {
            const minQuantity = parseInt(quantityFilter);
            filtered = filtered.filter(p => p.remainingQuantity >= minQuantity);
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
                case 'quantity-high':
                    return b.remainingQuantity - a.remainingQuantity;
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

    // Show bulk order modal
    showBulkOrderModal(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        // Populate product summary
        const productSummary = document.getElementById('productSummary');
        productSummary.innerHTML = `
            <div class="product-summary-header">
                <div class="product-summary-image">
                    <img src="${product.image}" alt="${product.name}">
                </div>
                <div class="product-summary-info">
                    <h3>${product.name}</h3>
                    <div class="product-summary-farmer">by ${product.farmerName}</div>
                    <div class="product-summary-details">
                        <span>Grade ${product.grade}</span>
                        <span>Available: ${product.remainingQuantity}kg</span>
                        <span>Price: ${formatCurrency(product.finalPrice * 0.9)}/kg</span>
                    </div>
                </div>
            </div>
        `;

        // Set product ID and populate delivery address
        document.getElementById('bulkProductId').value = productId;
        document.getElementById('deliveryAddress').value = currentUser.address || '';
        
        // Set minimum date to tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        document.getElementById('deliveryDate').min = tomorrow.toISOString().split('T')[0];

        document.getElementById('bulkOrderModal').style.display = 'block';
    }

    // Update order total
    updateOrderTotal() {
        const productId = document.getElementById('bulkProductId').value;
        const quantity = parseInt(document.getElementById('orderQuantity').value) || 0;
        
        const product = this.products.find(p => p.id === productId);
        if (!product || quantity < 100) {
            document.getElementById('estimatedTotal').textContent = '₹0';
            return;
        }

        const pricePerKg = product.finalPrice * 0.9; // 10% wholesale discount
        const total = pricePerKg * quantity;
        
        document.getElementById('estimatedTotal').textContent = formatCurrency(total);
    }

    // Handle bulk order
    handleBulkOrder(event) {
        event.preventDefault();

        const productId = document.getElementById('bulkProductId').value;
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        const orderData = {
            quantity: parseInt(document.getElementById('orderQuantity').value),
            deliveryDate: document.getElementById('deliveryDate').value,
            deliveryAddress: document.getElementById('deliveryAddress').value,
            paymentTerms: document.getElementById('paymentTerms').value,
            orderNotes: document.getElementById('orderNotes').value
        };

        // Validate order data
        if (!this.validateBulkOrder(orderData, product)) {
            return;
        }

        // Calculate total
        const pricePerKg = product.finalPrice * 0.9;
        const totalAmount = pricePerKg * orderData.quantity;

        // Create order
        const order = {
            id: generateId(),
            customerId: currentUser.id,
            customerName: currentUser.name,
            customerPhone: currentUser.phone,
            farmerId: product.farmerId,
            farmerName: product.farmerName,
            items: [{
                productId: product.id,
                productName: product.name,
                quantity: orderData.quantity,
                unit: 'kg',
                price: pricePerKg,
                grade: product.grade
            }],
            totalAmount: totalAmount,
            deliveryAddress: orderData.deliveryAddress,
            deliveryDate: orderData.deliveryDate,
            paymentTerms: orderData.paymentTerms,
            orderNotes: orderData.orderNotes,
            orderType: 'bulk',
            status: 'pending',
            createdAt: getCurrentDateTime()
        };

        // Save order
        const allOrders = getFromStorage('orders') || [];
        allOrders.push(order);
        saveToStorage('orders', allOrders);

        // Update local orders
        this.orders = this.loadOrders();
        this.updateDashboardStats();

        showNotification('Bulk order placed successfully!', 'success');
        closeModal('bulkOrderModal');
        showSection('orders');
        this.renderOrders();
    }

    // Validate bulk order
    validateBulkOrder(orderData, product) {
        if (orderData.quantity < 100) {
            showNotification('Minimum order quantity is 100kg', 'error');
            return false;
        }

        if (orderData.quantity > product.remainingQuantity) {
            showNotification(`Only ${product.remainingQuantity}kg available`, 'error');
            return false;
        }

        if (!orderData.deliveryDate) {
            showNotification('Please select a delivery date', 'error');
            return false;
        }

        if (!orderData.deliveryAddress.trim()) {
            showNotification('Please provide a delivery address', 'error');
            return false;
        }

        if (!orderData.paymentTerms) {
            showNotification('Please select payment terms', 'error');
            return false;
        }

        return true;
    }

    // Show farm visit modal
    showFarmVisitModal(farmerId) {
        const farmer = authSystem.getUserById(farmerId);
        if (!farmer) return;

        // Populate farm summary
        const farmSummary = document.getElementById('farmSummary');
        const farmerProducts = this.products.filter(p => p.farmerId === farmerId);
        
        farmSummary.innerHTML = `
            <h3>${farmer.name}'s Farm</h3>
            <div class="farm-summary-details">
                <div>
                    <strong>Location:</strong> ${farmer.address}
                </div>
                <div>
                    <strong>Products:</strong> ${farmerProducts.length} items
                </div>
                <div>
                    <strong>Total Available:</strong> ${farmerProducts.reduce((sum, p) => sum + p.remainingQuantity, 0)}kg
                </div>
                <div>
                    <strong>Contact:</strong> ${farmer.phone}
                </div>
            </div>
        `;

        document.getElementById('visitFarmerId').value = farmerId;
        
        // Set minimum date to tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        document.getElementById('visitDate').min = tomorrow.toISOString().split('T')[0];

        document.getElementById('farmVisitModal').style.display = 'block';
    }

    // Handle farm visit scheduling
    handleFarmVisit(event) {
        event.preventDefault();

        const farmerId = document.getElementById('visitFarmerId').value;
        const farmer = authSystem.getUserById(farmerId);
        if (!farmer) return;

        const visitData = {
            farmerId: farmerId,
            farmerName: farmer.name,
            farmerAddress: farmer.address,
            farmerPhone: farmer.phone,
            visitDate: document.getElementById('visitDate').value,
            visitTime: document.getElementById('visitTime').value,
            visitPurpose: document.getElementById('visitPurpose').value,
            expectedQuantity: parseInt(document.getElementById('expectedQuantity').value) || 0,
            visitNotes: document.getElementById('visitNotes').value
        };

        // Validate visit data
        if (!visitData.visitDate || !visitData.visitTime || !visitData.visitPurpose) {
            showNotification('Please fill in all required fields', 'error');
            return;
        }

        // Create visit
        const visit = {
            id: generateId(),
            ...visitData,
            status: 'scheduled',
            createdAt: getCurrentDateTime()
        };

        // Save visit
        this.visits.push(visit);
        this.saveVisits();

        showNotification('Farm visit scheduled successfully!', 'success');
        closeModal('farmVisitModal');
        showSection('visits');
        this.renderVisits();
    }

    // Show nearby farms
    showNearbyFarms() {
        if (!currentUser.location) {
            showNotification('Location access required to find nearby farms', 'error');
            return;
        }

        const nearbyFarmers = authSystem.getNearbyUsers('farmer', 100);
        const nearbyFarmsGrid = document.getElementById('nearbyFarmsGrid');
        
        if (nearbyFarmers.length === 0) {
            nearbyFarmsGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-map-marker-alt"></i>
                    <h3>No nearby farms found</h3>
                    <p>Try expanding your search radius</p>
                </div>
            `;
        } else {
            nearbyFarmsGrid.innerHTML = nearbyFarmers.map(farmer => {
                const isPartner = this.partnerFarms.some(p => p.farmerId === farmer.id);
                const farmerProducts = this.products.filter(p => p.farmerId === farmer.id);
                
                return `
                    <div class="farm-card">
                        <div class="farm-header">
                            <div>
                                <div class="farm-name">${farmer.name}</div>
                                <div class="farm-location">
                                    <i class="fas fa-map-marker-alt"></i>
                                    ${farmer.distance.toFixed(1)}km away
                                </div>
                            </div>
                            <span class="partnership-status ${isPartner ? 'status-partner' : 'status-potential'}">
                                ${isPartner ? 'Partner' : 'Potential'}
                            </span>
                        </div>
                        <div class="farm-stats">
                            <div class="farm-stat">
                                <div class="farm-stat-value">${farmerProducts.length}</div>
                                <div class="farm-stat-label">Products</div>
                            </div>
                            <div class="farm-stat">
                                <div class="farm-stat-value">${farmerProducts.reduce((sum, p) => sum + p.remainingQuantity, 0)}</div>
                                <div class="farm-stat-label">Total kg</div>
                            </div>
                        </div>
                        <div class="farm-products">
                            <h4>Available Products:</h4>
                            <div class="product-tags">
                                ${farmerProducts.slice(0, 3).map(p => `
                                    <span class="product-tag">${p.name}</span>
                                `).join('')}
                                ${farmerProducts.length > 3 ? `<span class="product-tag">+${farmerProducts.length - 3} more</span>` : ''}
                            </div>
                        </div>
                        <div class="farm-actions">
                            ${!isPartner ? `
                                <button class="btn-partner" onclick="wholesalerDashboard.addPartnerFarm('${farmer.id}')">
                                    Add Partner
                                </button>
                            ` : ''}
                            <button class="btn-contact" onclick="wholesalerDashboard.contactFarmer('${farmer.id}')">
                                Contact
                            </button>
                        </div>
                    </div>
                `;
            }).join('');
        }

        document.getElementById('nearbyFarmsModal').style.display = 'block';
    }

    // Add partner farm
    addPartnerFarm(farmerId) {
        const farmer = authSystem.getUserById(farmerId);
        if (!farmer) return;

        const partnership = {
            farmerId: farmerId,
            farmerName: farmer.name,
            farmerAddress: farmer.address,
            farmerPhone: farmer.phone,
            addedAt: getCurrentDateTime()
        };

        this.partnerFarms.push(partnership);
        this.savePartnerFarms();
        this.updateDashboardStats();

        showNotification(`${farmer.name} added as partner farm!`, 'success');
        this.showNearbyFarms(); // Refresh the modal
    }

    // Contact farmer
    contactFarmer(farmerId) {
        const farmer = authSystem.getUserById(farmerId);
        if (farmer) {
            alert(`Contact ${farmer.name}:\nPhone: ${farmer.phone}\nEmail: ${farmer.email}`);
        }
    }

    // Render partner farms
    renderPartnerFarms() {
        const partnerFarmsGrid = document.getElementById('partnerFarmsGrid');
        if (!partnerFarmsGrid) return;

        if (this.partnerFarms.length === 0) {
            partnerFarmsGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-handshake"></i>
                    <h3>No partner farms yet</h3>
                    <p>Find and add partner farms to build long-term relationships</p>
                    <button class="btn-primary" onclick="wholesalerDashboard.showNearbyFarms()">Find Partners</button>
                </div>
            `;
            return;
        }

        partnerFarmsGrid.innerHTML = this.partnerFarms.map(partner => {
            const farmerProducts = this.products.filter(p => p.farmerId === partner.farmerId);
            
            return `
                <div class="farm-card">
                    <div class="farm-header">
                        <div>
                            <div class="farm-name">${partner.farmerName}</div>
                            <div class="farm-location">
                                <i class="fas fa-map-marker-alt"></i>
                                ${partner.farmerAddress}
                            </div>
                        </div>
                        <span class="partnership-status status-partner">Partner</span>
                    </div>
                    <div class="farm-stats">
                        <div class="farm-stat">
                            <div class="farm-stat-value">${farmerProducts.length}</div>
                            <div class="farm-stat-label">Products</div>
                        </div>
                        <div class="farm-stat">
                            <div class="farm-stat-value">${farmerProducts.reduce((sum, p) => sum + p.remainingQuantity, 0)}</div>
                            <div class="farm-stat-label">Total kg</div>
                        </div>
                    </div>
                    <div class="farm-products">
                        <h4>Available Products:</h4>
                        <div class="product-tags">
                            ${farmerProducts.slice(0, 3).map(p => `
                                <span class="product-tag">${p.name}</span>
                            `).join('')}
                            ${farmerProducts.length > 3 ? `<span class="product-tag">+${farmerProducts.length - 3} more</span>` : ''}
                        </div>
                    </div>
                    <div class="farm-actions">
                        <button class="btn-contact" onclick="wholesalerDashboard.contactFarmer('${partner.farmerId}')">
                            Contact
                        </button>
                        <button class="btn-visit-farm" onclick="wholesalerDashboard.showFarmVisitModal('${partner.farmerId}')">
                            Schedule Visit
                        </button>
                    </div>
                </div>
            `;
        }).join('');
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
                    <i class="fas fa-shopping-bag"></i>
                    <h3>No orders found</h3>
                    <p>Your bulk orders will appear here</p>
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
                        <h4>Farmer</h4>
                        <p>${order.farmerName}</p>
                    </div>
                    <div class="order-detail">
                        <h4>Total Amount</h4>
                        <p>${formatCurrency(order.totalAmount)}</p>
                    </div>
                    <div class="order-detail">
                        <h4>Delivery Date</h4>
                        <p>${formatDate(order.deliveryDate)}</p>
                    </div>
                    <div class="order-detail">
                        <h4>Payment Terms</h4>
                        <p>${order.paymentTerms}</p>
                    </div>
                </div>
                <div class="order-items">
                    <h4>Items:</h4>
                    ${order.items.map(item => `
                        <div class="order-item">
                            ${item.productName} - ${item.quantity}kg (Grade ${item.grade}) - ${formatCurrency(item.price * item.quantity)}
                        </div>
                    `).join('')}
                </div>
                <div class="order-actions">
                    <button class="btn-view" onclick="wholesalerDashboard.viewOrderDetails('${order.id}')">
                        View Details
                    </button>
                    ${order.status === 'pending' ? `
                        <button class="btn-reject" onclick="wholesalerDashboard.cancelOrder('${order.id}')">
                            Cancel Order
                        </button>
                    ` : ''}
                </div>
            </div>
        `).join('');
    }

    // Render visits
    renderVisits() {
        const visitsContainer = document.getElementById('visitsContainer');
        if (!visitsContainer) return;

        if (this.visits.length === 0) {
            visitsContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-calendar"></i>
                    <h3>No farm visits scheduled</h3>
                    <p>Schedule visits to inspect products and build relationships</p>
                    <button class="btn-primary" onclick="wholesalerDashboard.showNearbyFarms()">Find Farms</button>
                </div>
            `;
            return;
        }

        visitsContainer.innerHTML = this.visits.map(visit => `
            <div class="visit-card">
                <div class="visit-header">
                    <span class="visit-farm">${visit.farmerName}</span>
                    <span class="visit-status status-${visit.status}">${visit.status.toUpperCase()}</span>
                </div>
                <div class="visit-details">
                    <div class="visit-detail">
                        <span class="visit-detail-label">Date</span>
                        <span class="visit-detail-value">${formatDate(visit.visitDate)}</span>
                    </div>
                    <div class="visit-detail">
                        <span class="visit-detail-label">Time</span>
                        <span class="visit-detail-value">${visit.visitTime}</span>
                    </div>
                    <div class="visit-detail">
                        <span class="visit-detail-label">Purpose</span>
                        <span class="visit-detail-value">${visit.visitPurpose}</span>
                    </div>
                    <div class="visit-detail">
                        <span class="visit-detail-label">Expected Quantity</span>
                        <span class="visit-detail-value">${visit.expectedQuantity}kg</span>
                    </div>
                </div>
                ${visit.visitNotes ? `
                    <div class="visit-notes">
                        <strong>Notes:</strong> ${visit.visitNotes}
                    </div>
                ` : ''}
                <div class="visit-actions">
                    ${visit.status === 'scheduled' ? `
                        <button class="btn-reschedule" onclick="wholesalerDashboard.rescheduleVisit('${visit.id}')">
                            Reschedule
                        </button>
                        <button class="btn-cancel-visit" onclick="wholesalerDashboard.cancelVisit('${visit.id}')">
                            Cancel
                        </button>
                    ` : ''}
                    <button class="btn-contact" onclick="wholesalerDashboard.contactFarmer('${visit.farmerId}')">
                        Contact Farmer
                    </button>
                </div>
            </div>
        `).join('');
    }

    // View order details
    viewOrderDetails(orderId) {
        const order = this.orders.find(o => o.id === orderId);
        if (order) {
            alert(`Order Details:\n\nOrder ID: ${order.id}\nFarmer: ${order.farmerName}\nStatus: ${order.status}\nTotal: ${formatCurrency(order.totalAmount)}\nDelivery Date: ${formatDate(order.deliveryDate)}\nPayment Terms: ${order.paymentTerms}`);
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

    // Reschedule visit
    rescheduleVisit(visitId) {
        // In a real app, this would open a reschedule modal
        alert('Reschedule functionality would be implemented here');
    }

    // Cancel visit
    cancelVisit(visitId) {
        if (confirm('Are you sure you want to cancel this visit?')) {
            const visitIndex = this.visits.findIndex(v => v.id === visitId);
            if (visitIndex !== -1) {
                this.visits[visitIndex].status = 'cancelled';
                this.saveVisits();
                showNotification('Visit cancelled successfully', 'success');
                this.renderVisits();
            }
        }
    }

    // Handle profile update
    handleUpdateProfile(event) {
        event.preventDefault();

        const updateData = {
            name: document.getElementById('profileName').value,
            phone: document.getElementById('profilePhone').value,
            address: document.getElementById('profileAddress').value,
            businessType: document.getElementById('businessType').value,
            monthlyVolume: document.getElementById('monthlyVolume').value
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
    wholesalerDashboard.currentSection = sectionName;

    // Load section-specific data
    switch (sectionName) {
        case 'browse':
            wholesalerDashboard.renderProducts();
            break;
        case 'farms':
            wholesalerDashboard.renderPartnerFarms();
            break;
        case 'orders':
            wholesalerDashboard.renderOrders();
            break;
        case 'visits':
            wholesalerDashboard.renderVisits();
            break;
    }
}

function setViewMode(mode) {
    wholesalerDashboard.setViewMode(mode);
}

function filterProducts() {
    wholesalerDashboard.renderProducts();
}

function sortProducts() {
    wholesalerDashboard.renderProducts();
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
    wholesalerDashboard.renderOrders(status);
}

function showNearbyFarms() {
    wholesalerDashboard.showNearbyFarms();
}

function scheduleNewVisit() {
    wholesalerDashboard.showNearbyFarms();
}

// Initialize wholesaler dashboard
let wholesalerDashboard;
document.addEventListener('DOMContentLoaded', function() {
    wholesalerDashboard = new WholesalerDashboard();
});
