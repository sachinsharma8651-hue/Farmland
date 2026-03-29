# Farmer 2 Consumer - Fresh from Farm to Home

A comprehensive web platform that connects farmers, consumers, and wholesalers for fresh produce delivery. Built with HTML, CSS, and JavaScript, featuring modern UI/UX and complete functionality for all user types.

## 🌟 Features

### For Farmers
- **Product Management**: List fruits and vegetables with real-time photos
- **Dual Selling Options**: Wholesale and small quantity (250g, 500g, 1kg, 2kg)
- **Grade Classification**: Grade A (big size, shiny) and Grade B (small size, less shiny)
- **Smart Pricing**: Auto-pricing based on mandi rates and market demand
- **Order Management**: View and manage customer orders
- **Delivery Scheduling**: Two-shift system (morning and evening)
- **Photo Upload**: Real-time product photography

### For Consumers
- **Product Browsing**: Search and filter by category, grade, price, and distance
- **Shopping Cart**: Add products with quantity selection
- **Order Placement**: Easy checkout with delivery preferences
- **Location-based**: Find nearest farmers for fastest delivery
- **Favorites**: Save preferred products
- **Order Tracking**: Monitor order status and history

### For Wholesalers
- **Bulk Ordering**: Minimum 100kg orders with wholesale pricing
- **Farm Partnerships**: Build relationships with local farmers
- **Farm Visits**: Schedule visits for quality inspection
- **Flexible Payment**: Multiple payment terms (advance, COD, credit)
- **Location Matching**: Find nearby farms for bulk purchases

### System Features
- **Authentication**: Secure login/registration for all user types
- **Location Services**: GPS-based farmer-customer matching
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Real-time Updates**: Live inventory and order status
- **Same-day Delivery**: Fresh produce delivered within hours

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Local web server (optional, for better experience)

### Installation

1. **Clone or Download**
   ```bash
   git clone <repository-url>
   # or download and extract the ZIP file
   ```

2. **Navigate to Project Directory**
   ```bash
   cd farmland
   ```

3. **Open in Browser**
   - Open `index.html` directly in your browser, or
   - Use a local server:
     ```bash
     # Using Python
     python -m http.server 8000
     
     # Using Node.js
     npx serve .
     
     # Using PHP
     php -S localhost:8000
     ```

4. **Access the Application**
   - Direct: `file:///path/to/farmland/index.html`
   - Server: `http://localhost:8000`

## 🎯 Demo Accounts

The application comes with pre-loaded sample data for testing:

### Farmers
- **Email**: `rajesh@farm.com` | **Password**: `farmer123`
- **Email**: `priya@farm.com` | **Password**: `farmer123`
- **Email**: `amit@farm.com` | **Password**: `farmer123`

### Consumers
- **Email**: `anita@consumer.com` | **Password**: `consumer123`
- **Email**: `rohit@consumer.com` | **Password**: `consumer123`

### Wholesalers
- **Email**: `contact@freshmart.com` | **Password**: `wholesaler123`

## 📱 User Guide

### Registration Process
1. Click "Register" on the homepage
2. Select user type (Farmer/Consumer/Wholesaler)
3. Fill in personal details
4. Allow location access for better matching
5. Complete registration and login

### For Farmers
1. **Add Products**: Go to "Add Product" section
2. **Upload Photos**: Use camera or file upload
3. **Set Pricing**: System auto-adjusts based on market rates
4. **Manage Orders**: View and confirm customer orders
5. **Schedule Deliveries**: Organize morning/evening shifts

### For Consumers
1. **Browse Products**: Use filters to find desired items
2. **Add to Cart**: Select quantities and add products
3. **Checkout**: Choose delivery time and payment method
4. **Track Orders**: Monitor order status in "My Orders"

### For Wholesalers
1. **Browse Wholesale**: View bulk-available products
2. **Place Orders**: Minimum 100kg with wholesale pricing
3. **Schedule Visits**: Plan farm visits for inspection
4. **Manage Partners**: Build relationships with farmers

## 🛠️ Technical Architecture

### Frontend
- **HTML5**: Semantic markup and structure
- **CSS3**: Modern styling with Flexbox/Grid
- **JavaScript ES6+**: Dynamic functionality and interactions
- **Responsive Design**: Mobile-first approach

### Data Storage
- **LocalStorage**: Client-side data persistence
- **JSON**: Structured data format
- **Session Management**: User authentication state

### Key Components
- **Authentication System**: Login/registration with validation
- **Product Management**: CRUD operations for products
- **Order Processing**: End-to-end order workflow
- **Location Services**: GPS-based matching
- **Image Handling**: File upload and preview

## 📁 Project Structure

```
farmland/
├── index.html              # Main landing page
├── farmer-dashboard.html   # Farmer interface
├── consumer-dashboard.html # Consumer interface
├── wholesaler-dashboard.html # Wholesaler interface
├── styles/
│   ├── main.css           # Global styles
│   ├── dashboard.css      # Dashboard components
│   ├── consumer.css       # Consumer-specific styles
│   └── wholesaler.css     # Wholesaler-specific styles
├── js/
│   ├── main.js            # Core functionality
│   ├── auth.js            # Authentication system
│   ├── farmer-dashboard.js # Farmer features
│   ├── consumer-dashboard.js # Consumer features
│   ├── wholesaler-dashboard.js # Wholesaler features
│   └── sample-data.js     # Demo data initialization
└── README.md              # Documentation
```

## 🎨 Design Features

### Color Scheme
- **Primary Green**: #4CAF50 (agriculture theme)
- **Secondary Green**: #2c5530 (darker accent)
- **Background**: #f8f9fa (clean, light)
- **Text**: #333 (readable contrast)

### Typography
- **Font Family**: Segoe UI, system fonts
- **Responsive Sizing**: Scales with device
- **Clear Hierarchy**: Proper heading structure

### UI Components
- **Cards**: Product and order displays
- **Modals**: Forms and detailed views
- **Buttons**: Consistent styling and states
- **Forms**: Validation and user feedback

## 🔧 Customization

### Adding New Features
1. **New User Type**: Extend authentication system
2. **Additional Products**: Modify product schema
3. **Payment Integration**: Add payment gateway
4. **Real-time Chat**: Implement messaging system

### Styling Changes
1. **Colors**: Update CSS custom properties
2. **Layout**: Modify grid/flexbox structures
3. **Components**: Extend existing component styles
4. **Responsive**: Adjust media queries

### Data Integration
1. **Backend API**: Replace localStorage with server calls
2. **Database**: Implement proper data persistence
3. **Real-time Updates**: Add WebSocket support
4. **File Upload**: Implement server-side image handling

## 🚀 Deployment

### Static Hosting
- **GitHub Pages**: Free hosting for static sites
- **Netlify**: Continuous deployment from Git
- **Vercel**: Fast global CDN deployment
- **Firebase Hosting**: Google's hosting platform

### Server Deployment
1. Upload files to web server
2. Configure proper MIME types
3. Enable HTTPS for location services
4. Set up domain and DNS

## 🔒 Security Considerations

### Current Implementation
- Client-side validation and storage
- Basic authentication system
- Input sanitization for forms

### Production Recommendations
- Server-side authentication
- HTTPS encryption
- Input validation and sanitization
- Rate limiting and CSRF protection
- Secure file upload handling

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support and questions:
- Create an issue in the repository
- Contact: [your-email@example.com]
- Documentation: See README.md

## 🙏 Acknowledgments

- Font Awesome for icons
- Modern CSS techniques and best practices
- Responsive design principles
- Agricultural industry insights

---

**Farmer 2 Consumer** - Bridging the gap between farm and table with technology! 🌱🚚🏠