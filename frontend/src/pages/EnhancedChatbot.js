import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './EnhancedChatbot.css';

const EnhancedChatbot = ({ user }) => {
    // State management
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState('en');
    const [isRecording, setIsRecording] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    
    // Refs
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

    // Language options
    const languages = [
        { code: 'en', name: 'English', flag: '🇺🇸' },
        { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
        { code: 'pa', name: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
        { code: 'ur', name: 'اردو', flag: '🇵🇰' }
    ];

    useEffect(() => {
        // Setup axios with token
        const token = localStorage.getItem('token');
        if (token) {
            axios.defaults.headers.common['auth-token'] = token;
        }

        // Add welcome message
        const welcomeMessage = {
            id: Date.now(),
            role: 'assistant',
            content: getWelcomeMessage(selectedLanguage),
            timestamp: new Date(),
            type: 'text'
        };
        setMessages([welcomeMessage]);
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const getWelcomeMessage = (language) => {
        const welcomeMessages = {
            'en': "🌾 Welcome to FarmAssist AI! I can help you with:\n• Crop disease detection (send photos)\n• Farming advice\n• Weather-based recommendations\n• Voice assistance\n\nHow can I help you today?",
            'hi': "🌾 FarmAssist AI में आपका स्वागत है! मैं आपकी मदद कर सकता हूं:\n• फसल रोग की पहचान (फोटो भेजें)\n• खेती की सलाह\n• मौसम आधारित सिफारिशें\n• आवाज सहायता\n\nआज मैं आपकी कैसे मदद कर सकता हूं?",
            'pa': "🌾 FarmAssist AI ਵਿੱਚ ਤੁਹਾਡਾ ਸਵਾਗਤ ਹੈ! ਮੈਂ ਤੁਹਾਡੀ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ:\n• ਫਸਲ ਦੀ ਬਿਮਾਰੀ ਦੀ ਪਛਾਣ (ਫੋਟੋ ਭੇਜੋ)\n• ਖੇਤੀ ਦੀ ਸਲਾਹ\n• ਮੌਸਮ ਆਧਾਰਿਤ ਸਿਫਾਰਸ਼ਾਂ\n• ਆਵਾਜ਼ ਸਹਾਇਤਾ\n\nਅੱਜ ਮੈਂ ਤੁਹਾਡੀ ਕਿਵੇਂ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ?",
            'ur': "🌾 FarmAssist AI میں خوش آمدید! میں آپ کی مدد کر سکتا ہوں:\n• فصل کی بیماری کی شناخت (تصویر بھیجیں)\n• کھیتی کی مشورہ\n• موسم کی بنیاد پر سفارشات\n• آواز کی مدد\n\nآج میں آپ کی کیسے مدد کر سکتا ہوں?"
        };
        return welcomeMessages[language] || welcomeMessages['en'];
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const sendMessage = async (messageText = inputMessage, imageFile = selectedImage) => {
        if (!messageText.trim() && !imageFile) return;

        // Add user message
        const userMessage = {
            id: Date.now(),
            role: 'user',
            content: messageText,
            timestamp: new Date(),
            type: imageFile ? 'image' : 'text',
            image: imagePreview
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setSelectedImage(null);
        setImagePreview(null);
        setIsLoading(true);

        try {
            let response;
            
            if (imageFile) {
                // Send to image analysis endpoint if there's an image
                const formData = new FormData();
                formData.append('image', imageFile);
                formData.append('question', messageText);
                formData.append('language', selectedLanguage);
                
                response = await axios.post('/api/chatbot/image', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    }
                });
            } else {
                // Send to regular message endpoint for text-only
                response = await axios.post('/api/chatbot/message', {
                    message: messageText,
                    language: selectedLanguage
                });
            }

            if (response.data.success) {
                const botMessage = {
                    id: Date.now() + 1,
                    role: 'assistant',
                    content: response.data.data.response,
                    timestamp: new Date(),
                    type: 'text'
                };
                setMessages(prev => [...prev, botMessage]);
            }
        } catch (error) {
            console.error('Error:', error);
            
            // Fallback response for testing
            const responses = {
                'en': [
                    "Based on your query, I recommend checking soil moisture levels and ensuring proper drainage for your crops.",
                    "For optimal growth, consider using organic fertilizers and implementing crop rotation techniques.",
                    "Monitor weather patterns closely and adjust irrigation schedules accordingly.",
                    "Regular pest inspection can help prevent major crop damage."
                ],
                'hi': [
                    "आपकी क्वेरी के आधार पर, मैं मिट्टी की नमी के स्तर की जांच करने और आपकी फसलों के लिए उचित जल निकासी सुनिश्चित करने की सलाह देता हूं।",
                    "इष्टतम विकास के लिए, जैविक उर्वरकों का उपयोग करने और फसल रोटेशन तकनीकों को लागू करने पर विचार करें।",
                    "मौसम के पैटर्न की बारीकी से निगरानी करें और तदनुसार सिंचाई कार्यक्रम को समायोजित करें।"
                ],
                'pa': [
                    "ਤੁਹਾਡੀ ਪੁੱਛਗਿੱਛ ਦੇ ਆਧਾਰ 'ਤੇ, ਮੈਂ ਮਿੱਟੀ ਦੀ ਨਮੀ ਦੇ ਪੱਧਰ ਦੀ ਜਾਂਚ ਕਰਨ ਅਤੇ ਤੁਹਾਡੀਆਂ ਫਸਲਾਂ ਲਈ ਸਹੀ ਨਿਕਾਸੀ ਯਕੀਨੀ ਬਣਾਉਣ ਦੀ ਸਿਫਾਰਸ਼ ਕਰਦਾ ਹਾਂ।",
                    "ਵਧੀਆ ਵਿਕਾਸ ਲਈ, ਜੈਵਿਕ ਖਾਦਾਂ ਦੀ ਵਰਤੋਂ ਕਰਨ ਅਤੇ ਫਸਲ ਰੋਟੇਸ਼ਨ ਤਕਨੀਕਾਂ ਨੂੰ ਲਾਗੂ ਕਰਨ 'ਤੇ ਵਿਚਾਰ ਕਰੋ।"
                ],
                'ur': [
                    "آپ کی پوچھ گچھ کی بنیاد پر، میں مٹی کی نمی کی سطح کی جانچ کرنے اور آپ کی فصلوں کے لیے مناسب نکاسی کو یقینی بنانے کی سفارش کرتا ہوں۔",
                    "بہترین نشوونما کے لیے، نامیاتی کھادوں کا استعمال کرنے اور فصل کی گردش کی تکنیکوں کو نافذ کرنے پر غور کریں۔"
                ]
            };
            
            const langResponses = responses[selectedLanguage] || responses['en'];
            const randomResponse = langResponses[Math.floor(Math.random() * langResponses.length)];
            
            const botMessage = {
                id: Date.now() + 1,
                role: 'assistant',
                content: randomResponse,
                timestamp: new Date(),
                type: 'text'
            };
            setMessages(prev => [...prev, botMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const startVoiceRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data);
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
                // Here you would normally send to speech-to-text API
                // For now, we'll just send a message
                sendMessage("🎤 Voice message received");
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (error) {
            console.error('Error accessing microphone:', error);
            alert('Please allow microphone access to use voice input');
        }
    };

    const stopVoiceRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const removeImage = () => {
        setSelectedImage(null);
        setImagePreview(null);
    };

    return (
        <div className="enhanced-chatbot">
            {/* Header */}
            <div className="chatbot-header">
                <div className="header-content">
                    <div className="header-title">
                        <span className="bot-avatar">🤖</span>
                        <div className="title-info">
                            <h2>FarmAssist AI</h2>
                            <span className="status-indicator">
                                <span className="status-dot"></span>
                                Online & Ready to Help
                            </span>
                        </div>
                    </div>
                    
                    <div className="header-controls">
                        <select 
                            className="language-select"
                            value={selectedLanguage}
                            onChange={(e) => setSelectedLanguage(e.target.value)}
                        >
                            {languages.map(lang => (
                                <option key={lang.code} value={lang.code}>
                                    {lang.flag} {lang.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Messages Container */}
            <div className="messages-area">
                <div className="messages-list">
                    {messages.map(message => (
                        <div 
                            key={message.id} 
                            className={`message-bubble ${message.role}`}
                        >
                            {message.role === 'assistant' && (
                                <div className="message-avatar">🤖</div>
                            )}
                            <div className="message-content">
                                {message.image && (
                                    <img src={message.image} alt="Uploaded" className="message-image" />
                                )}
                                <div className="message-text">{message.content}</div>
                                <div className="message-time">
                                    {new Date(message.timestamp).toLocaleTimeString()}
                                </div>
                            </div>
                            {message.role === 'user' && (
                                <div className="message-avatar">👤</div>
                            )}
                        </div>
                    ))}
                    
                    {isLoading && (
                        <div className="message-bubble assistant">
                            <div className="message-avatar">🤖</div>
                            <div className="message-content">
                                <div className="typing-dots">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Area */}
            <div className="input-section">
                {imagePreview && (
                    <div className="image-preview">
                        <img src={imagePreview} alt="Preview" />
                        <button className="remove-image" onClick={removeImage}>✕</button>
                    </div>
                )}
                
                <div className="input-controls">
                    <button 
                        className="control-btn"
                        onClick={() => fileInputRef.current?.click()}
                        title="Upload Image"
                    >
                        📷
                    </button>
                    
                    <button 
                        className={`control-btn ${isRecording ? 'recording' : ''}`}
                        onMouseDown={startVoiceRecording}
                        onMouseUp={stopVoiceRecording}
                        onTouchStart={startVoiceRecording}
                        onTouchEnd={stopVoiceRecording}
                        title="Hold to Record"
                    >
                        {isRecording ? '🔴' : '🎤'}
                    </button>
                    
                    <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={
                            selectedLanguage === 'hi' ? 'अपना सवाल टाइप करें...' :
                            selectedLanguage === 'pa' ? 'ਆਪਣਾ ਸਵਾਲ ਟਾਈਪ ਕਰੋ...' :
                            selectedLanguage === 'ur' ? 'اپنا سوال ٹائپ کریں...' :
                            'Type your question...'
                        }
                        className="message-input"
                        disabled={isLoading}
                    />
                    
                    <button 
                        className="send-button"
                        onClick={() => sendMessage()}
                        disabled={isLoading || (!inputMessage.trim() && !selectedImage)}
                    >
                        ➤
                    </button>
                </div>
                
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    style={{ display: 'none' }}
                />
            </div>
        </div>
    );
};

export default EnhancedChatbot;