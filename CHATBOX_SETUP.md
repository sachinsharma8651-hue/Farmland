# 🤖 Chatbox Setup Guide

Your Farmer 2 Consumer website now includes an intelligent chatbox that can work with AI APIs or provide comprehensive fallback responses.

## 🌟 Features

### ✨ **Smart Chatbox**
- **Floating Chat Button**: Animated button with notification badge
- **Modern UI**: Gradient design matching your color scheme
- **Typing Indicator**: Shows when assistant is responding
- **Quick Questions**: Pre-defined buttons for common queries
- **Responsive Design**: Works perfectly on all devices

### 🧠 **AI Integration**
- **Multiple API Support**: OpenAI, Google Gemini, Anthropic Claude, Local APIs
- **Fallback System**: 50+ pre-written responses when API is unavailable
- **Smart Responses**: Context-aware answers about your platform
- **Configurable**: Easy setup through configuration file

### 💬 **Comprehensive Responses**
The chatbox can answer questions about:
- **Delivery Process**: Same-day delivery, time slots, locations
- **Product Information**: Grades, pricing, quality assurance
- **User Guidance**: How to buy, sell, register, order
- **Platform Features**: Wholesale options, payment methods
- **Technical Support**: Contact information, troubleshooting

## 🚀 Quick Start

### **Option 1: Use Fallback Mode (No API Required)**
The chatbox works immediately with 50+ pre-written responses covering all common questions. No setup needed!

### **Option 2: Enable AI API**
1. **Choose Your API Provider**
2. **Get API Key**
3. **Configure Settings**
4. **Test & Deploy**

## 🔧 API Configuration

### **Step 1: Choose Your API**

#### **OpenAI (Recommended)**
- **Cost**: ~$0.002 per 1K tokens
- **Quality**: Excellent
- **Setup**: Easy
- **Get Key**: [OpenAI Platform](https://platform.openai.com/api-keys)

#### **Google Gemini**
- **Cost**: Free tier available
- **Quality**: Very Good
- **Setup**: Easy
- **Get Key**: [Google AI Studio](https://makersuite.google.com/app/apikey)

#### **Anthropic Claude**
- **Cost**: ~$0.003 per 1K tokens
- **Quality**: Excellent
- **Setup**: Medium
- **Get Key**: [Anthropic Console](https://console.anthropic.com/)

#### **Local API (Advanced)**
- **Cost**: Free (your hardware)
- **Quality**: Varies
- **Setup**: Complex
- **Options**: Ollama, LocalAI, etc.

### **Step 2: Configure API**

Edit `js/chatbox-config.js`:

```javascript
const CHATBOX_CONFIG = {
    // For OpenAI
    apiProvider: 'openai',
    apiKey: 'your-openai-api-key-here',
    apiEndpoint: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-3.5-turbo',
    
    // Or for Google Gemini
    // apiProvider: 'gemini',
    // apiKey: 'your-gemini-api-key-here',
    // apiEndpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
    
    // Settings
    maxTokens: 150,
    temperature: 0.7,
    typingDelay: 1000
};
```

### **Step 3: Test Configuration**

1. **Open your website**
2. **Click the chat button** (bottom-right corner)
3. **Ask a question** like "How does delivery work?"
4. **Check browser console** for any API errors

## 📝 Pre-written Responses

The chatbox includes comprehensive responses for:

### **🚚 Delivery & Logistics**
- Same-day delivery process
- Time slots (Morning/Evening)
- Location-based matching
- Delivery fees and policies

### **⭐ Products & Quality**
- Grade A vs Grade B explanation
- Quality assurance process
- Organic produce availability
- Product photography

### **👥 User Types & Registration**
- Farmer partnership process
- Consumer ordering guide
- Wholesaler bulk options
- Registration requirements

### **💳 Payments & Pricing**
- Payment methods (COD, UPI, Cards)
- Pricing structure
- Wholesale discounts
- Credit terms

### **🛠️ Technical Support**
- Platform usage help
- Mobile compatibility
- Browser requirements
- Contact information

## 🎨 Customization

### **Colors & Styling**
The chatbox automatically uses your website's color scheme:
- **Primary**: `#ABB900` (Lime Green)
- **Secondary**: `#83B7DE` (Sky Blue)
- **Accent**: `#DAE039` (Yellow)

### **Quick Questions**
Customize in `chatbox-config.js`:
```javascript
quickQuestions: [
    { text: "🚚 Delivery Info", question: "How does delivery work?" },
    { text: "🌾 Become Farmer", question: "How to join as farmer?" },
    // Add your own questions
]
```

### **Welcome Message**
```javascript
welcomeMessage: "👋 Hello! I'm your custom assistant..."
```

## 🔒 Security & Privacy

### **API Key Security**
- **Never commit API keys** to version control
- **Use environment variables** in production
- **Rotate keys regularly**
- **Monitor usage** to prevent abuse

### **Data Privacy**
- **No chat history stored** on server
- **Local storage only** for session
- **No personal data** sent to AI APIs
- **GDPR compliant** design

## 🚀 Deployment Options

### **Static Hosting (Current)**
- Works with GitHub Pages, Netlify, Vercel
- Client-side API calls
- Simple deployment

### **Server-side (Recommended for Production)**
```javascript
// Example: Proxy API calls through your server
apiEndpoint: '/api/chat', // Your server endpoint
```

Benefits:
- **Hide API keys**
- **Rate limiting**
- **Usage analytics**
- **Better security**

## 📊 Analytics & Monitoring

### **Track Usage**
```javascript
// Add to chatbox.js
analytics.track('chat_message_sent', {
    message_type: 'user_question',
    response_type: api_used ? 'api' : 'fallback'
});
```

### **Monitor API Costs**
- **OpenAI**: Check usage dashboard
- **Gemini**: Monitor quotas
- **Set billing alerts**

## 🐛 Troubleshooting

### **Common Issues**

#### **Chatbox Not Appearing**
- Check browser console for errors
- Ensure all script files are loaded
- Verify CSS files are included

#### **API Not Working**
- Check API key validity
- Verify endpoint URLs
- Check browser network tab
- Ensure CORS is configured

#### **Fallback Responses Only**
- Check `apiProvider` setting
- Verify API key format
- Test API endpoint manually

### **Debug Mode**
Add to console:
```javascript
// Enable debug logging
window.chatbox.config.debug = true;
```

## 🔄 Updates & Maintenance

### **Regular Tasks**
- **Monitor API usage** and costs
- **Update fallback responses** based on user questions
- **Review chat logs** for improvement opportunities
- **Test API connectivity** regularly

### **Adding New Responses**
Edit `loadFallbackResponses()` in `chatbox.js`:
```javascript
'new_keyword': "Your helpful response here! 😊",
```

## 📞 Support

### **Need Help?**
- **Check browser console** for error messages
- **Test with fallback mode** first
- **Verify API credentials**
- **Review configuration settings**

### **Feature Requests**
The chatbox is designed to be easily extensible:
- **Custom styling**
- **Additional APIs**
- **New response types**
- **Integration features**

---

## 🎉 **Ready to Chat!**

Your intelligent chatbox is now ready to help your users 24/7! Whether using AI APIs or fallback responses, it provides comprehensive support for your Farmer 2 Consumer platform.

**Test it now**: Click the chat button on your website! 💬
