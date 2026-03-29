// Chatbox functionality with API integration and fallback responses
class Chatbox {
    constructor() {
        this.isOpen = false;
        this.messages = [];
        this.isTyping = false;
        
        // Load configuration
        this.config = window.CHATBOX_CONFIG || {};
        this.apiIntegration = new window.APIIntegration(this.config);
        
        this.init();
        this.loadFallbackResponses();
    }

    init() {
        this.createChatboxHTML();
        this.attachEventListeners();
        this.addWelcomeMessage();
    }

    createChatboxHTML() {
        const chatboxHTML = `
            <div id="chatbox-container" class="chatbox-container">
                <div id="chatbox-toggle" class="chatbox-toggle">
                    <i class="fas fa-comments"></i>
                    <span class="chat-notification">1</span>
                </div>
                
                <div id="chatbox" class="chatbox">
                    <div class="chatbox-header">
                        <div class="chat-header-info">
                            <div class="chat-avatar">
                                <i class="fas fa-seedling"></i>
                            </div>
                            <div class="chat-details">
                                <h4>Farm Assistant</h4>
                                <span class="chat-status">Online</span>
                            </div>
                        </div>
                        <button id="chatbox-close" class="chatbox-close">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div id="chatbox-messages" class="chatbox-messages">
                        <!-- Messages will be added here -->
                    </div>
                    
                    <div class="chatbox-quick-questions">
                        <div class="quick-questions-title">Quick Questions:</div>
                        <div class="quick-questions-list">
                            <button class="quick-question" data-question="How does the delivery work?">
                                🚚 Delivery Process
                            </button>
                            <button class="quick-question" data-question="What are the product grades?">
                                ⭐ Product Grades
                            </button>
                            <button class="quick-question" data-question="How to become a farmer partner?">
                                🌾 Join as Farmer
                            </button>
                            <button class="quick-question" data-question="What payment methods do you accept?">
                                💳 Payment Options
                            </button>
                        </div>
                    </div>
                    
                    <div class="chatbox-input-container">
                        <div class="chatbox-input-wrapper">
                            <input type="text" id="chatbox-input" placeholder="Type your message..." maxlength="500">
                            <button id="chatbox-send" class="chatbox-send">
                                <i class="fas fa-paper-plane"></i>
                            </button>
                        </div>
                        <div class="chatbox-typing" id="chatbox-typing" style="display: none;">
                            <span>Farm Assistant is typing</span>
                            <div class="typing-dots">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', chatboxHTML);
    }

    attachEventListeners() {
        const toggle = document.getElementById('chatbox-toggle');
        const close = document.getElementById('chatbox-close');
        const input = document.getElementById('chatbox-input');
        const send = document.getElementById('chatbox-send');
        const quickQuestions = document.querySelectorAll('.quick-question');

        toggle.addEventListener('click', () => this.toggleChatbox());
        close.addEventListener('click', () => this.closeChatbox());
        send.addEventListener('click', () => this.sendMessage());
        
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Handle mobile keyboard
        input.addEventListener('focus', () => {
            console.log('Input focused');
            // Scroll chatbox into view on mobile
            if (window.innerWidth <= 768) {
                setTimeout(() => {
                    const chatbox = document.getElementById('chatbox');
                    if (chatbox) {
                        chatbox.scrollIntoView({ behavior: 'smooth', block: 'end' });
                    }
                }, 300);
            }
        });

        // Auto-resize input on mobile
        input.addEventListener('input', (e) => {
            console.log('Input value:', e.target.value);
            
            // Auto-scroll to bottom when typing
            const messagesContainer = document.getElementById('chatbox-messages');
            if (messagesContainer) {
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }
        });

        quickQuestions.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const question = e.target.getAttribute('data-question');
                this.sendMessage(question);
            });
        });
    }

    toggleChatbox() {
        const chatbox = document.getElementById('chatbox');
        const notification = document.querySelector('.chat-notification');
        
        if (this.isOpen) {
            this.closeChatbox();
        } else {
            chatbox.classList.add('chatbox-open');
            this.isOpen = true;
            notification.style.display = 'none';
            
            // Focus input
            setTimeout(() => {
                document.getElementById('chatbox-input').focus();
            }, 300);
        }
    }

    closeChatbox() {
        const chatbox = document.getElementById('chatbox');
        chatbox.classList.remove('chatbox-open');
        this.isOpen = false;
    }

    addWelcomeMessage() {
        const welcomeMessage = {
            text: this.config.welcomeMessage || "👋 Hello! I'm your Farm Assistant. I can help you with questions about our platform, delivery, products, and more. How can I assist you today?",
            sender: 'bot',
            timestamp: new Date()
        };
        
        this.messages.push(welcomeMessage);
        this.displayMessage(welcomeMessage);
    }

    async sendMessage(predefinedMessage = null) {
        const input = document.getElementById('chatbox-input');
        const messageText = predefinedMessage || input.value.trim();
        
        if (!messageText) return;

        // Clear input
        if (!predefinedMessage) {
            input.value = '';
        }

        // Add user message
        const userMessage = {
            text: messageText,
            sender: 'user',
            timestamp: new Date()
        };
        
        this.messages.push(userMessage);
        this.displayMessage(userMessage);

        // Show typing indicator
        this.showTyping();

        // Get response
        try {
            let response;
            if (this.config.apiProvider === 'fallback') {
                throw new Error('Using fallback mode');
            } else {
                response = await this.apiIntegration.callAPI(messageText);
            }
            
            // Add delay for better UX
            setTimeout(() => {
                this.hideTyping();
                
                const botMessage = {
                    text: response,
                    sender: 'bot',
                    timestamp: new Date()
                };
                
                this.messages.push(botMessage);
                this.displayMessage(botMessage);
            }, this.config.typingDelay || 1000);
            
        } catch (error) {
            // Add delay even for fallback responses
            setTimeout(() => {
                this.hideTyping();
                console.log('Using fallback response:', error.message);
                
                // Fallback response
                const fallbackResponse = this.getFallbackResponse(messageText);
                const botMessage = {
                    text: fallbackResponse,
                    sender: 'bot',
                    timestamp: new Date()
                };
                
                this.messages.push(botMessage);
                this.displayMessage(botMessage);
            }, this.config.typingDelay || 1000);
        }
    }


    loadFallbackResponses() {
        this.fallbackResponses = {
            // Greetings
            'hello': "Hello! Welcome to Farmer 2 Consumer! 🌾 I'm here to help you with any questions about our fresh produce delivery platform.",
            'hi': "Hi there! 👋 How can I assist you with our farm-to-table service today?",
            'hey': "Hey! Great to see you here! How can I help you get the freshest produce delivered to your door?",
            
            // Delivery questions
            'delivery': "🚚 **Our Delivery Service:**\n\n• Same-day delivery from local farms\n• Two time slots: Morning (6AM-12PM) & Evening (2PM-8PM)\n• Location-based matching for fastest delivery\n• ₹50 delivery fee\n• Fresh produce delivered within hours of harvest!",
            'shipping': "We offer same-day delivery! 📦 Your fresh produce is delivered within hours of being harvested. Choose morning or evening delivery slots when placing your order.",
            'fast': "Yes! We specialize in same-day delivery. 🚀 Our farmers prepare your order and deliver it the same day to ensure maximum freshness.",
            
            // Product questions
            'grades': "⭐ **Product Grades:**\n\n**Grade A:** Large size, shiny appearance, premium quality\n**Grade B:** Smaller size, less shiny, still fresh and nutritious\n\nBoth grades are fresh and healthy - Grade A is just more visually appealing!",
            'quality': "🌟 We guarantee 100% fresh, quality produce! All products are harvested fresh and delivered the same day. Our farmers follow strict quality standards.",
            'organic': "🌱 Many of our farmers offer organic produce! Look for the organic label when browsing products. We connect you directly with local organic farmers.",
            
            // Farmer questions
            'farmer': "🌾 **Become a Farmer Partner:**\n\n• List your fresh produce\n• Set your own prices (system suggests based on market rates)\n• Choose wholesale or retail selling\n• Get fair payments\n• Reach more customers\n\nRegister as a farmer to get started!",
            'sell': "Want to sell your produce? 📈 Join as a farmer! You can list products, set grades, choose quantities, and reach customers directly. Fair pricing guaranteed!",
            'partner': "Partnership is easy! 🤝 Register as a farmer, upload product photos, set your selling preferences, and start connecting with customers and wholesalers.",
            
            // Consumer questions
            'buy': "🛒 **How to Buy:**\n\n1. Browse fresh products by location\n2. Filter by grade, price, distance\n3. Add to cart with preferred quantities\n4. Choose delivery time\n5. Place order & get same-day delivery!",
            'order': "Ordering is simple! 📱 Browse products → Add to cart → Choose delivery time → Pay → Get fresh produce delivered the same day!",
            'cart': "Add products to your cart, select quantities (250g, 500g, 1kg, 2kg), choose delivery time, and checkout. Easy as that! 🛍️",
            
            // Payment questions
            'payment': "💳 **Payment Options:**\n\n• Cash on Delivery (COD)\n• UPI Payments\n• Credit/Debit Cards\n• For wholesalers: Credit terms available (15-30 days)",
            'pay': "We accept COD, UPI, and card payments! 💰 Wholesalers can also get credit terms. Choose what's convenient for you.",
            'money': "Secure payment options available! We support all major payment methods including cash on delivery for your convenience.",
            
            // Wholesaler questions
            'wholesale': "🏭 **Wholesale Features:**\n\n• Minimum 100kg orders\n• 10% discount on bulk purchases\n• Direct farm visits for quality check\n• Flexible payment terms\n• Partner with multiple farms",
            'bulk': "Bulk orders start from 100kg with wholesale pricing! 📦 You can order online or schedule farm visits for larger quantities.",
            'business': "Perfect for businesses! 🏢 Get wholesale rates, flexible payment terms, and direct farmer partnerships. Register as a wholesaler to start.",
            
            // Location questions
            'location': "📍 We use GPS to connect you with the nearest farmers for fastest delivery! Allow location access for the best experience.",
            'near': "We'll show you farmers and products near your location! 🗺️ This ensures quick delivery and supports your local farming community.",
            'area': "We're expanding to cover more areas! Currently serving major cities with plans to reach rural areas soon. 🌍",
            
            // Technical questions
            'app': "Our web platform works on all devices! 📱💻 No app download needed - just visit our website from any browser.",
            'mobile': "Yes! Our website is fully mobile-responsive. Use it on your phone, tablet, or computer - same great experience! 📲",
            'browser': "Works on all modern browsers - Chrome, Firefox, Safari, Edge. For best experience, allow location access! 🌐",
            
            // Pricing questions
            'price': "💰 **Fair Pricing:**\n\n• Prices based on mandi rates + market demand\n• Farmers get fair compensation\n• Consumers get competitive rates\n• Wholesale discounts available\n• No hidden fees!",
            'cost': "Transparent pricing! Product cost + ₹50 delivery fee. Wholesale orders get special rates. No hidden charges ever! 💯",
            'cheap': "We offer competitive prices while ensuring farmers get fair compensation! 🤝 Quality fresh produce at reasonable rates.",
            
            // Support questions
            'help': "🆘 **Need Help?**\n\n• Use this chat for quick questions\n• Call: +91 98765 43210\n• Email: support@farmer2consumer.com\n• 24/7 customer support available!",
            'support': "We're here to help! 💪 24/7 support available through chat, phone, or email. What specific issue can I assist with?",
            'contact': "📞 **Contact Us:**\n\nPhone: +91 98765 43210\nEmail: support@farmer2consumer.com\nAddress: 123 Farm Street, Agriculture City\n\nOr just ask me here!",
            
            // Default responses
            'default': [
                "I'd be happy to help! 😊 Could you please be more specific about what you'd like to know?",
                "That's a great question! 🤔 Can you provide more details so I can give you the best answer?",
                "I'm here to help with questions about our platform! 🌾 What would you like to know about our fresh produce delivery service?",
                "Let me help you with that! 💚 Could you rephrase your question or ask about delivery, products, farmers, or ordering?",
                "I want to give you the most helpful answer! 🎯 Try asking about delivery times, product grades, how to order, or becoming a farmer partner."
            ]
        };
    }

    getFallbackResponse(message) {
        const lowerMessage = message.toLowerCase();
        
        // Check for keyword matches
        for (const [keyword, response] of Object.entries(this.fallbackResponses)) {
            if (keyword !== 'default' && lowerMessage.includes(keyword)) {
                return response;
            }
        }
        
        // Return random default response
        const defaultResponses = this.fallbackResponses.default;
        return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
    }

    displayMessage(message) {
        const messagesContainer = document.getElementById('chatbox-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${message.sender}-message`;
        
        const time = message.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        messageDiv.innerHTML = `
            <div class="message-content">
                ${message.sender === 'bot' ? '<div class="message-avatar"><i class="fas fa-seedling"></i></div>' : ''}
                <div class="message-text">${this.formatMessage(message.text)}</div>
            </div>
            <div class="message-time">${time}</div>
        `;
        
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        // Animate message appearance
        setTimeout(() => {
            messageDiv.classList.add('message-appear');
        }, 50);
    }

    formatMessage(text) {
        // Convert markdown-style formatting to HTML
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>');
    }

    showTyping() {
        const typing = document.getElementById('chatbox-typing');
        typing.style.display = 'flex';
        this.isTyping = true;
        
        // Scroll to bottom
        const messagesContainer = document.getElementById('chatbox-messages');
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    hideTyping() {
        const typing = document.getElementById('chatbox-typing');
        typing.style.display = 'none';
        this.isTyping = false;
    }

    // Public method to show notification
    showNotification() {
        const notification = document.querySelector('.chat-notification');
        if (notification && !this.isOpen) {
            notification.style.display = 'block';
        }
    }
}

// Initialize chatbox when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.chatbox = new Chatbox();
    
    // Show notification after 5 seconds if user hasn't opened chat
    setTimeout(() => {
        if (!window.chatbox.isOpen) {
            window.chatbox.showNotification();
        }
    }, 5000);
});
