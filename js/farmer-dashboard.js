// Farmer Dashboard JavaScript
class FarmerDashboard {
    constructor() {
        // Check authentication
        if (!requireUserType('farmer')) {
            return;
        }

        this.products = this.loadProducts();
        this.orders = this.loadOrders();
        this.currentSection = 'products';
        
        this.initializeEventListeners();
        this.loadUserProfile();
        this.updateDashboardStats();
        this.loadProducts();
    }

    // Load products from localStorage
    loadProducts() {
        const allProducts = getFromStorage('products') || [];
        return allProducts.filter(p => p.farmerId === currentUser.id);
    }

    // Save products to localStorage
    saveProducts() {
        const allProducts = getFromStorage('products') || [];
        const otherProducts = allProducts.filter(p => p.farmerId !== currentUser.id);
        const updatedProducts = [...otherProducts, ...this.products];
        saveToStorage('products', updatedProducts);
    }

    // Load orders from localStorage
    loadOrders() {
        const allOrders = getFromStorage('orders') || [];
        return allOrders.filter(o => o.farmerId === currentUser.id);
    }

    // Initialize event listeners
    initializeEventListeners() {
        // Add product form
        const addProductForm = document.getElementById('addProductForm');
        if (addProductForm) {
            addProductForm.addEventListener('submit', (e) => this.handleAddProduct(e));
        }

        // Edit product form
        const editProductForm = document.getElementById('editProductForm');
        if (editProductForm) {
            editProductForm.addEventListener('submit', (e) => this.handleEditProduct(e));
        }

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
        const totalProducts = document.getElementById('totalProducts');
        const totalOrders = document.getElementById('totalOrders');
        const totalEarnings = document.getElementById('totalEarnings');

        if (totalProducts) {
            totalProducts.textContent = this.products.length;
        }

        if (totalOrders) {
            const activeOrders = this.orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled');
            totalOrders.textContent = activeOrders.length;
        }

        if (totalEarnings) {
            const earnings = this.orders
                .filter(o => o.status === 'delivered')
                .reduce((sum, order) => sum + order.totalAmount, 0);
            totalEarnings.textContent = formatCurrency(earnings);
        }
    }

    // Handle add product form submission
    handleAddProduct(event) {
        event.preventDefault();

        const formData = {
            name: document.getElementById('productName').value,
            category: document.getElementById('productCategory').value,
            grade: document.getElementById('productGrade').value,
            sellingType: document.getElementById('sellingType').value,
            totalQuantity: parseFloat(document.getElementById('totalQuantity').value),
            basePrice: parseFloat(document.getElementById('basePrice').value),
            description: document.getElementById('productDescription').value
        };

        // Get selected quantities for retail
        if (formData.sellingType === 'retail') {
            const quantityCheckboxes = document.querySelectorAll('#quantityOptions input[type="checkbox"]:checked');
            formData.availableQuantities = Array.from(quantityCheckboxes).map(cb => cb.value);
            
            if (formData.availableQuantities.length === 0) {
                showNotification('Please select at least one quantity option for retail selling', 'error');
                return;
            }
        }

        // Handle image upload
        const imageFile = document.getElementById('productImage').files[0];
        if (!imageFile) {
            showNotification('Please upload a product image', 'error');
            return;
        }

        // Validate form data
        if (!this.validateProductData(formData)) {
            return;
        }

        // Create product object
        const product = {
            id: generateId(),
            farmerId: currentUser.id,
            farmerName: currentUser.name,
            farmerLocation: currentUser.location,
            ...formData,
            image: URL.createObjectURL(imageFile), // In real app, upload to server
            finalPrice: this.calculateFinalPrice(formData.basePrice, formData.grade, formData.sellingType),
            createdAt: getCurrentDateTime(),
            isActive: true,
            remainingQuantity: formData.totalQuantity
        };

        // Add to products array
        this.products.push(product);
        this.saveProducts();

        showNotification('Product added successfully!', 'success');
        
        // Reset form and switch to products view
        document.getElementById('addProductForm').reset();
        document.getElementById('imagePreview').style.display = 'none';
        document.getElementById('quantityOptions').classList.add('hidden');
        
        this.updateDashboardStats();
        showSection('products');
        this.renderProducts();
    }

    // Validate product data
    validateProductData(data) {
        if (!data.name || data.name.trim().length < 2) {
            showNotification('Product name must be at least 2 characters', 'error');
            return false;
        }

        if (!data.category) {
            showNotification('Please select a category', 'error');
            return false;
        }

        if (!data.grade) {
            showNotification('Please select a grade', 'error');
            return false;
        }

        if (!data.sellingType) {
            showNotification('Please select selling type', 'error');
            return false;
        }

        if (data.totalQuantity <= 0) {
            showNotification('Total quantity must be greater than 0', 'error');
            return false;
        }

        if (data.basePrice <= 0) {
            showNotification('Base price must be greater than 0', 'error');
            return false;
        }

        return true;
    }

    // Calculate final price based on various factors
    calculateFinalPrice(basePrice, grade, sellingType) {
        let finalPrice = basePrice;

        // Grade adjustment
        if (grade === 'A') {
            finalPrice *= 1.2; // 20% premium for Grade A
        } else if (grade === 'B') {
            finalPrice *= 0.9; // 10% discount for Grade B
        }

        // Selling type adjustment
        if (sellingType === 'retail') {
            finalPrice *= 1.15; // 15% premium for retail
        }

        // Market demand factor (mock implementation)
        const demandFactor = Math.random() * 0.2 + 0.9; // 0.9 to 1.1
        finalPrice *= demandFactor;

        return Math.round(finalPrice * 100) / 100;
    }

    // Render products in the grid
    renderProducts() {
        const productsGrid = document.getElementById('productsGrid');
        if (!productsGrid) return;

        if (this.products.length === 0) {
            productsGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-seedling"></i>
                    <h3>No products listed yet</h3>
                    <p>Start by adding your first product</p>
                    <button class="btn-primary" onclick="showSection('add-product')">Add Product</button>
                </div>
            `;
            return;
        }

        const filteredProducts = this.getFilteredProducts();
        
        productsGrid.innerHTML = filteredProducts.map(product => `
            <div class="product-card">
                <div class="product-actions">
                    <button class="edit-btn" onclick="farmerDashboard.editProduct('${product.id}')" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="delete-btn" onclick="farmerDashboard.deleteProduct('${product.id}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}" style="width: 100%; height: 100%; object-fit: cover;">
                </div>
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <span class="product-grade grade-${product.grade.toLowerCase()}">Grade ${product.grade}</span>
                    <div class="product-price">${formatCurrency(product.finalPrice)}/kg</div>
                    <div class="product-quantity">Available: ${product.remainingQuantity}kg</div>
                    <div class="product-type">${product.sellingType === 'retail' ? 'Small Quantity' : 'Wholesale'}</div>
                    ${product.sellingType === 'retail' ? `
                        <div class="available-quantities">
                            <small>Quantities: ${product.availableQuantities.join(', ')}</small>
                        </div>
                    ` : ''}
                    <span class="product-status ${product.isActive ? 'status-active' : 'status-inactive'}">
                        ${product.isActive ? 'Active' : 'Inactive'}
                    </span>
                </div>
            </div>
        `).join('');
    }

    // Get filtered products based on current filters
    getFilteredProducts() {
        const categoryFilter = document.getElementById('categoryFilter')?.value || '';
        const gradeFilter = document.getElementById('gradeFilter')?.value || '';

        return this.products.filter(product => {
            if (categoryFilter && product.category !== categoryFilter) return false;
            if (gradeFilter && product.grade !== gradeFilter) return false;
            return true;
        });
    }

    // Edit product
    editProduct(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        // Populate edit form
        document.getElementById('editProductId').value = product.id;
        document.getElementById('editProductName').value = product.name;
        document.getElementById('editTotalQuantity').value = product.totalQuantity;
        document.getElementById('editBasePrice').value = product.basePrice;

        // Show edit modal
        document.getElementById('editProductModal').style.display = 'block';
    }

    // Handle edit product form submission
    handleEditProduct(event) {
        event.preventDefault();

        const productId = document.getElementById('editProductId').value;
        const productIndex = this.products.findIndex(p => p.id === productId);
        
        if (productIndex === -1) return;

        // Update product data
        this.products[productIndex] = {
            ...this.products[productIndex],
            name: document.getElementById('editProductName').value,
            totalQuantity: parseFloat(document.getElementById('editTotalQuantity').value),
            basePrice: parseFloat(document.getElementById('editBasePrice').value),
            finalPrice: this.calculateFinalPrice(
                parseFloat(document.getElementById('editBasePrice').value),
                this.products[productIndex].grade,
                this.products[productIndex].sellingType
            ),
            updatedAt: getCurrentDateTime()
        };

        this.saveProducts();
        showNotification('Product updated successfully!', 'success');
        closeModal('editProductModal');
        this.renderProducts();
    }

    // Delete product
    deleteProduct(productId) {
        if (confirm('Are you sure you want to delete this product?')) {
            this.products = this.products.filter(p => p.id !== productId);
            this.saveProducts();
            showNotification('Product deleted successfully!', 'success');
            this.updateDashboardStats();
            this.renderProducts();
        }
    }

    // Load and render orders
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
                    <p>Orders will appear here when customers place them</p>
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
                        <h4>Customer</h4>
                        <p>${order.customerName}</p>
                    </div>
                    <div class="order-detail">
                        <h4>Total Amount</h4>
                        <p>${formatCurrency(order.totalAmount)}</p>
                    </div>
                    <div class="order-detail">
                        <h4>Order Date</h4>
                        <p>${formatDate(order.createdAt)}</p>
                    </div>
                </div>
                <div class="order-items">
                    <h4>Items:</h4>
                    ${order.items.map(item => `
                        <div class="order-item">
                            ${item.productName} - ${item.quantity}${item.unit} (Grade ${item.grade})
                        </div>
                    `).join('')}
                </div>
                <div class="order-actions">
                    ${order.status === 'pending' ? `
                        <button class="btn-confirm" onclick="farmerDashboard.updateOrderStatus('${order.id}', 'confirmed')">
                            Confirm
                        </button>
                        <button class="btn-reject" onclick="farmerDashboard.updateOrderStatus('${order.id}', 'cancelled')">
                            Reject
                        </button>
                    ` : ''}
                    <button class="btn-view" onclick="farmerDashboard.viewOrderDetails('${order.id}')">
                        View Details
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Update order status
    updateOrderStatus(orderId, newStatus) {
        const orderIndex = this.orders.findIndex(o => o.id === orderId);
        if (orderIndex !== -1) {
            this.orders[orderIndex].status = newStatus;
            this.orders[orderIndex].updatedAt = getCurrentDateTime();
            
            // Update in global storage
            const allOrders = getFromStorage('orders') || [];
            const globalOrderIndex = allOrders.findIndex(o => o.id === orderId);
            if (globalOrderIndex !== -1) {
                allOrders[globalOrderIndex] = this.orders[orderIndex];
                saveToStorage('orders', allOrders);
            }

            showNotification(`Order ${newStatus} successfully!`, 'success');
            this.renderOrders();
            this.updateDashboardStats();
            this.renderSchedule();
        }
    }

    // View order details
    viewOrderDetails(orderId) {
        const order = this.orders.find(o => o.id === orderId);
        if (order) {
            // In a real app, this would open a detailed modal
            alert(`Order Details:\n\nOrder ID: ${order.id}\nCustomer: ${order.customerName}\nStatus: ${order.status}\nTotal: ${formatCurrency(order.totalAmount)}\nDate: ${formatDate(order.createdAt)}`);
        }
    }

    // Render delivery schedule
    renderSchedule() {
        const morningSchedule = document.getElementById('morningSchedule');
        const eveningSchedule = document.getElementById('eveningSchedule');

        if (!morningSchedule || !eveningSchedule) return;

        const confirmedOrders = this.orders.filter(o => o.status === 'confirmed');
        
        // Split orders into morning and evening shifts
        const morningOrders = confirmedOrders.filter((order, index) => index % 2 === 0);
        const eveningOrders = confirmedOrders.filter((order, index) => index % 2 === 1);

        // Render morning schedule
        if (morningOrders.length === 0) {
            morningSchedule.innerHTML = '<p class="empty-schedule">No deliveries scheduled</p>';
        } else {
            morningSchedule.innerHTML = morningOrders.map((order, index) => `
                <div class="schedule-item">
                    <div class="schedule-time">${6 + index}:00 AM - ${7 + index}:00 AM</div>
                    <div class="schedule-customer">${order.customerName}</div>
                    <div class="schedule-products">
                        ${order.items.map(item => `${item.productName} (${item.quantity}${item.unit})`).join(', ')}
                    </div>
                </div>
            `).join('');
        }

        // Render evening schedule
        if (eveningOrders.length === 0) {
            eveningSchedule.innerHTML = '<p class="empty-schedule">No deliveries scheduled</p>';
        } else {
            eveningSchedule.innerHTML = eveningOrders.map((order, index) => `
                <div class="schedule-item">
                    <div class="schedule-time">${2 + index}:00 PM - ${3 + index}:00 PM</div>
                    <div class="schedule-customer">${order.customerName}</div>
                    <div class="schedule-products">
                        ${order.items.map(item => `${item.productName} (${item.quantity}${item.unit})`).join(', ')}
                    </div>
                </div>
            `).join('');
        }
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

    // Load section-specific data
    switch (sectionName) {
        case 'products':
            farmerDashboard.renderProducts();
            break;
        case 'orders':
            farmerDashboard.renderOrders();
            break;
        case 'schedule':
            farmerDashboard.renderSchedule();
            break;
    }
}

function toggleQuantityOptions() {
    const sellingType = document.getElementById('sellingType').value;
    const quantityOptions = document.getElementById('quantityOptions');
    
    if (sellingType === 'retail') {
        quantityOptions.classList.remove('hidden');
    } else {
        quantityOptions.classList.add('hidden');
    }
}

function previewImage(input, previewId) {
    const preview = document.getElementById(previewId);
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.src = e.target.result;
            preview.classList.remove('hidden');
        };
        reader.readAsDataURL(input.files[0]);
    }
}

function filterProducts() {
    farmerDashboard.renderProducts();
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
    farmerDashboard.renderOrders(status);
}

// Initialize farmer dashboard
let farmerDashboard;
document.addEventListener('DOMContentLoaded', function() {
    farmerDashboard = new FarmerDashboard();
});
