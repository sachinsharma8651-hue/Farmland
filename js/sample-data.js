// Sample Data Initialization
function initializeSampleData() {
    // Check if sample data already exists
    if (localStorage.getItem('sampleDataInitialized')) {
        return;
    }

    // Sample users
    const sampleUsers = [
        // Farmers
        {
            id: 'farmer1',
            userType: 'farmer',
            name: 'Rajesh Kumar',
            email: 'rajesh@farm.com',
            phone: '9876543210',
            address: 'Village Khetpura, Haryana',
            password: 'farmer123',
            location: { latitude: 28.7041, longitude: 77.1025 },
            createdAt: '2024-01-15T10:00:00Z',
            isActive: true
        },
        {
            id: 'farmer2',
            userType: 'farmer',
            name: 'Priya Sharma',
            email: 'priya@farm.com',
            phone: '9876543211',
            address: 'Village Greenfields, Punjab',
            password: 'farmer123',
            location: { latitude: 28.6139, longitude: 77.2090 },
            createdAt: '2024-01-16T10:00:00Z',
            isActive: true
        },
        {
            id: 'farmer3',
            userType: 'farmer',
            name: 'Amit Singh',
            email: 'amit@farm.com',
            phone: '9876543212',
            address: 'Village Organic Valley, Uttar Pradesh',
            password: 'farmer123',
            location: { latitude: 28.5355, longitude: 77.3910 },
            createdAt: '2024-01-17T10:00:00Z',
            isActive: true
        },
        // Consumers
        {
            id: 'consumer1',
            userType: 'consumer',
            name: 'Anita Verma',
            email: 'anita@consumer.com',
            phone: '9876543220',
            address: 'Sector 15, Gurgaon, Haryana',
            password: 'consumer123',
            location: { latitude: 28.4595, longitude: 77.0266 },
            createdAt: '2024-01-18T10:00:00Z',
            isActive: true
        },
        {
            id: 'consumer2',
            userType: 'consumer',
            name: 'Rohit Gupta',
            email: 'rohit@consumer.com',
            phone: '9876543221',
            address: 'Connaught Place, New Delhi',
            password: 'consumer123',
            location: { latitude: 28.6315, longitude: 77.2167 },
            createdAt: '2024-01-19T10:00:00Z',
            isActive: true
        },
        // Wholesalers
        {
            id: 'wholesaler1',
            userType: 'wholesaler',
            name: 'Fresh Mart Distributors',
            email: 'contact@freshmart.com',
            phone: '9876543230',
            address: 'Azadpur Mandi, Delhi',
            password: 'wholesaler123',
            location: { latitude: 28.7041, longitude: 77.1025 },
            businessType: 'distributor',
            monthlyVolume: 50000,
            createdAt: '2024-01-20T10:00:00Z',
            isActive: true
        }
    ];

    // Sample products
    const sampleProducts = [
        {
            id: 'product1',
            farmerId: 'farmer1',
            farmerName: 'Rajesh Kumar',
            farmerLocation: { latitude: 28.7041, longitude: 77.1025 },
            name: 'Fresh Tomatoes',
            category: 'vegetables',
            grade: 'A',
            sellingType: 'retail',
            totalQuantity: 500,
            remainingQuantity: 450,
            basePrice: 30,
            finalPrice: 36,
            description: 'Fresh, juicy tomatoes grown organically',
            availableQuantities: ['250g', '500g', '1kg', '2kg'],
            image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZmY2b2I2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmaWxsPSJ3aGl0ZSI+VG9tYXRvZXM8L3RleHQ+PC9zdmc+',
            createdAt: '2024-01-21T10:00:00Z',
            isActive: true
        },
        {
            id: 'product2',
            farmerId: 'farmer1',
            farmerName: 'Rajesh Kumar',
            farmerLocation: { latitude: 28.7041, longitude: 77.1025 },
            name: 'Organic Onions',
            category: 'vegetables',
            grade: 'A',
            sellingType: 'wholesale',
            totalQuantity: 1000,
            remainingQuantity: 800,
            basePrice: 25,
            finalPrice: 30,
            description: 'Premium quality organic onions',
            image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZmZkNzAwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmaWxsPSJ3aGl0ZSI+T25pb25zPC90ZXh0Pjwvc3ZnPg==',
            createdAt: '2024-01-21T11:00:00Z',
            isActive: true
        },
        {
            id: 'product3',
            farmerId: 'farmer2',
            farmerName: 'Priya Sharma',
            farmerLocation: { latitude: 28.6139, longitude: 77.2090 },
            name: 'Sweet Mangoes',
            category: 'fruits',
            grade: 'A',
            sellingType: 'retail',
            totalQuantity: 300,
            remainingQuantity: 250,
            basePrice: 80,
            finalPrice: 110,
            description: 'Sweet and juicy Alphonso mangoes',
            availableQuantities: ['500g', '1kg', '2kg'],
            image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZmZiMzAwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmaWxsPSJ3aGl0ZSI+TWFuZ29lczwvdGV4dD48L3N2Zz4=',
            createdAt: '2024-01-21T12:00:00Z',
            isActive: true
        },
        {
            id: 'product4',
            farmerId: 'farmer2',
            farmerName: 'Priya Sharma',
            farmerLocation: { latitude: 28.6139, longitude: 77.2090 },
            name: 'Fresh Carrots',
            category: 'vegetables',
            grade: 'B',
            sellingType: 'retail',
            totalQuantity: 200,
            remainingQuantity: 180,
            basePrice: 35,
            finalPrice: 36,
            description: 'Crunchy and nutritious carrots',
            availableQuantities: ['250g', '500g', '1kg'],
            image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZmY4YzAwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmaWxsPSJ3aGl0ZSI+Q2Fycm90czwvdGV4dD48L3N2Zz4=',
            createdAt: '2024-01-21T13:00:00Z',
            isActive: true
        },
        {
            id: 'product5',
            farmerId: 'farmer3',
            farmerName: 'Amit Singh',
            farmerLocation: { latitude: 28.5355, longitude: 77.3910 },
            name: 'Organic Potatoes',
            category: 'vegetables',
            grade: 'A',
            sellingType: 'wholesale',
            totalQuantity: 2000,
            remainingQuantity: 1500,
            basePrice: 20,
            finalPrice: 24,
            description: 'High-quality organic potatoes',
            image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjOGI0NTEzIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmaWxsPSJ3aGl0ZSI+UG90YXRvZXM8L3RleHQ+PC9zdmc+',
            createdAt: '2024-01-21T14:00:00Z',
            isActive: true
        },
        {
            id: 'product6',
            farmerId: 'farmer3',
            farmerName: 'Amit Singh',
            farmerLocation: { latitude: 28.5355, longitude: 77.3910 },
            name: 'Fresh Apples',
            category: 'fruits',
            grade: 'A',
            sellingType: 'retail',
            totalQuantity: 400,
            remainingQuantity: 350,
            basePrice: 120,
            finalPrice: 150,
            description: 'Crisp and sweet red apples',
            availableQuantities: ['500g', '1kg', '2kg'],
            image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZmYwMDAwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmaWxsPSJ3aGl0ZSI+QXBwbGVzPC90ZXh0Pjwvc3ZnPg==',
            createdAt: '2024-01-21T15:00:00Z',
            isActive: true
        }
    ];

    // Sample orders
    const sampleOrders = [
        {
            id: 'order1',
            customerId: 'consumer1',
            customerName: 'Anita Verma',
            customerPhone: '9876543220',
            farmerId: 'farmer1',
            farmerName: 'Rajesh Kumar',
            items: [
                {
                    productId: 'product1',
                    productName: 'Fresh Tomatoes',
                    quantity: 2,
                    unit: '1kg',
                    price: 36,
                    grade: 'A'
                }
            ],
            subtotal: 72,
            deliveryFee: 50,
            totalAmount: 122,
            deliveryAddress: 'Sector 15, Gurgaon, Haryana',
            deliveryTime: 'morning',
            paymentMethod: 'cod',
            orderNotes: 'Please deliver fresh tomatoes',
            status: 'confirmed',
            createdAt: '2024-01-22T10:00:00Z'
        },
        {
            id: 'order2',
            customerId: 'wholesaler1',
            customerName: 'Fresh Mart Distributors',
            customerPhone: '9876543230',
            farmerId: 'farmer3',
            farmerName: 'Amit Singh',
            items: [
                {
                    productId: 'product5',
                    productName: 'Organic Potatoes',
                    quantity: 500,
                    unit: 'kg',
                    price: 21.6,
                    grade: 'A'
                }
            ],
            totalAmount: 10800,
            deliveryAddress: 'Azadpur Mandi, Delhi',
            deliveryDate: '2024-01-25',
            paymentTerms: 'credit-15',
            orderNotes: 'Bulk order for distribution',
            orderType: 'bulk',
            status: 'pending',
            createdAt: '2024-01-22T11:00:00Z'
        }
    ];

    // Save sample data to localStorage
    localStorage.setItem('users', JSON.stringify(sampleUsers));
    localStorage.setItem('products', JSON.stringify(sampleProducts));
    localStorage.setItem('orders', JSON.stringify(sampleOrders));
    
    // Mark sample data as initialized
    localStorage.setItem('sampleDataInitialized', 'true');
    
    console.log('Sample data initialized successfully!');
}

// Initialize sample data when the script loads
document.addEventListener('DOMContentLoaded', function() {
    initializeSampleData();
});
