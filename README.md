# FarmAssist - Agricultural AI Chatbot 🌾

A smart agricultural assistant powered by AI that helps farmers with crop management, disease identification, and farming best practices.

## 🚀 Quick Setup

### 1. Install Dependencies
```bash
cd Backend
npm install
```

### 2. Configure API Keys
1. Open `Backend/.env` file
2. Get a free Gemini API key from: https://makersuite.google.com/app/apikey
3. Replace `your_actual_gemini_api_key_here` with your real API key:
```
GEMINI_API_KEY=AIzaSyBuwMwLHlCWTqPaMvNsR6P2H1PZW5b8JBg
```

### 3. Start the Server
```bash
cd Backend
npm start
# or for development:
npm run dev
```

### 4. Access the Application
- Main App: http://localhost:5000
- Enhanced Chatbot: http://localhost:5000/enhanced_chatbot.html

## ✨ New Features

### 🔧 Recent Fixes Applied:

1. **✅ API Key Error Fixed**
   - Better error handling for invalid/missing API keys
   - Fallback responses when AI services are unavailable
   - Clear instructions for API key setup

2. **✅ Spell Check & Auto-Correction**
   - Automatically corrects common farming term misspellings
   - Supports Hindi/Urdu transliterations (khet → field, fasal → crop)
   - Shows spelling corrections to users
   - Fuzzy matching for similar words

3. **✅ UI Layout Fixed**
   - Fixed chatbot overlapping with navbar
   - Responsive design improvements
   - Better mobile experience
   - Fixed header with navigation

4. **✅ Better Error Handling**
   - Specific error messages for different issues
   - Graceful fallbacks when services are down
   - User-friendly error notifications

## 🔧 Troubleshooting

### Problem: "API key not valid" Error
**Solution:**
1. Get a new API key from https://makersuite.google.com/app/apikey
2. Update the `GEMINI_API_KEY` in your `.env` file
3. Restart the server

### Problem: Chatbot gives basic responses only
**Reason:** API key is missing or invalid, but the app still works with built-in responses
**Solution:** Follow the API key setup steps above

### Problem: Spelling corrections not working
**Check:** The spell checker works automatically, but only for farming-related terms
**Note:** It supports corrections like:
- `fertlizer` → `fertilizer`
- `pestiside` → `pesticide`
- `khet` → `field` (Hindi)
- `fasal` → `crop` (Hindi)

### Problem: UI overlap issues
**Solution:** Clear browser cache and refresh the page

## 🌟 Features

- **Smart Farming Assistance**: Get advice on crops, diseases, fertilizers
- **Image Analysis**: Upload crop images for disease identification
- **Voice Messages**: Voice input support (with authentication)
- **Multi-language**: Basic support for Hindi/Urdu terms
- **Spell Correction**: Auto-corrects farming terminology
- **Responsive Design**: Works on desktop and mobile
- **User Authentication**: Save conversation history

## 📱 Usage Examples

### Basic Queries (Work without API key):
- "How to treat wheat disease?"
- "Best fertilizer for tomatoes?"
- "Irrigation tips for rice?"

### Advanced Features (Require API key):
- Image analysis of crop diseases
- Voice message processing
- Detailed AI-powered responses
- Conversation history

## 🔑 API Key Sources

1. **Gemini AI**: https://makersuite.google.com/app/apikey (Free tier available)
2. **Alternative**: The app works with basic responses even without API keys

## 🚨 Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| 500 Error repeatedly | Invalid API key | Update `.env` with valid key |
| Basic responses only | No API key configured | Add API key for advanced features |
| Spelling not corrected | Not farming terms | Only corrects agricultural vocabulary |
| UI overlapping | Browser cache | Clear cache and refresh |
| Voice not working | No authentication | Login first to use voice features |

## 📞 Support

If you continue facing issues:
1. Check the browser console for detailed errors
2. Verify your API key is valid and has quota
3. Ensure all npm dependencies are installed
4. Restart the server after making changes

## 🎯 Tips for Best Experience

1. **Use farming-related terms** for better spell correction
2. **Login** to access advanced features like image analysis
3. **Clear and specific questions** work best
4. **Mobile users**: Use landscape mode for better experience

---

**Note**: The application now gracefully handles API failures and provides useful responses even when the AI service is unavailable. Your users won't see 500 errors anymore! 🎉