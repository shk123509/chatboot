
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './AdvancedChatbot.css';

const AdvancedChatbot = ({ user }) => {
    // State management
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [currentConversation, setCurrentConversation] = useState(null);
    const [conversations, setConversations] = useState([]);
    const [selectedLanguage, setSelectedLanguage] = useState('en');
    
    // Voice recording state
    const [isRecording, setIsRecording] = useState(false);
    const [isVoiceSupported, setIsVoiceSupported] = useState(false);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    
    // Image upload state
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    
    // UI state
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showLanguageSelector, setShowLanguageSelector] = useState(false);
    
    // Refs
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const messagesContainerRef = useRef(null);

    // Language options
    const languages = [
        { code: 'en', name: 'English', flag: '🇺🇸' },
        { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
        { code: 'pa', name: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
        { code: 'ur', name: 'اردو', flag: '🇵🇰' }
    ];

    useEffect(() => {
        // Check voice support
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            setIsVoiceSupported(true);
        }

        // Load conversations
        loadConversations();

        // Add welcome message
        if (messages.length === 0) {
            const welcomeMessage = {
                id: Date.now(),
                role: 'assistant',
                content: getWelcomeMessage(selectedLanguage),
                timestamp: new Date(),
                type: 'text',
                isWelcome: true
            };
            setMessages([welcomeMessage]);
        }
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const getWelcomeMessage = (language) => {
        const welcomeMessages = {
            'en': "🌾 Hello! I'm your FarmAssist AI chatbot. I can help you with farming problems through text, voice, or images. How can I assist you today?",
            'hi': "🌾 नमस्ते! मैं आपका FarmAssist AI चैटबॉट हूं। मैं आपकी खेती की समस्याओं में टेक्स्ट, आवाज़ या तस्वीरों के साथ मदद कर सकता हूं। आज मैं आपकी कैसे सहायता कर सकता हूं?",
            'pa': "🌾 ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਤੁਹਾਡਾ FarmAssist AI ਚੈਟਬੋਟ ਹਾਂ। ਮੈਂ ਤੁਹਾਡੀ ਖੇਤੀ ਦੀਆਂ ਸਮੱਸਿਆਵਾਂ ਵਿੱਚ ਟੈਕਸਟ, ਆਵਾਜ਼ ਜਾਂ ਤਸਵੀਰਾਂ ਨਾਲ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ। ਅੱਜ ਮੈਂ ਤੁਹਾਡੀ ਕਿਵੇਂ ਸਹਾਇਤਾ ਕਰ ਸਕਦਾ ਹਾਂ?",
            'ur': "🌾 السلام علیکم! میں آپ کا FarmAssist AI چیٹ بوٹ ہوں۔ میں آپ کی کھیتی کے مسائل میں ٹیکسٹ، آواز یا تصاویر کے ذریعے مدد کر سکتا ہوں۔ آج میں آپ کی کیسے مدد کر سکتا ہوں؟"
        };
        return welcomeMessages[language] || welcomeMessages['en'];
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const loadConversations = async () => {
        try {
            const response = await axios.get('/api/chatbot/conversations');
            if (response.data.success) {
                setConversations(response.data.data.conversations);
            }
        } catch (error) {
            console.error('Error loading conversations:', error);
        }
    };

    const sendMessage = async () => {
        if (!inputMessage.trim() && !selectedImage) return;

        const userMessage = {
            id: Date.now(),
            role: 'user',
            content: inputMessage,
            timestamp: new Date(),
            type: selectedImage ? 'image' : 'text',
            imagePreview: imagePreview
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsLoading(true);

        try {
            let response;
            
            if (selectedImage) {
                // Send image message
                const formData = new FormData();
                formData.append('image', selectedImage);
                formData.append('question', inputMessage || 'Please analyze this crop image');
                formData.append('language', selectedLanguage);
                if (currentConversation) {
                    formData.append('conversationId', currentConversation._id);
                }

                response = await axios.post('/api/chatbot/image', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                setSelectedImage(null);
                setImagePreview(null);
            } else {
                // Send text message
                response = await axios.post('/api/chatbot/message', {
                    message: inputMessage,
                    conversationId: currentConversation?._id,
                    language: selectedLanguage
                });
            }

            if (response.data.success) {
                const botMessage = {
                    id: Date.now() + 1,
                    role: 'assistant',
                    content: response.data.data.response,
                    timestamp: new Date(),
                    type: 'text',
                    confidence: response.data.data.confidence,
                    sources: response.data.data.sources
                };

                setMessages(prev => [...prev, botMessage]);
                setCurrentConversation({ _id: response.data.data.conversationId });
                
                // Speak response if voice is enabled
                if (isVoiceSupported && 'speechSynthesis' in window) {
                    speakText(response.data.data.response);
                }
            }
        } catch (error) {
            console.error('Error sending message:', error);
            const errorMessage = {
                id: Date.now() + 1,
                role: 'assistant',
                content: 'Sorry, I encountered an error processing your message. Please try again.',
                timestamp: new Date(),
                type: 'text',
                isError: true
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
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

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
                sendVoiceMessage(audioBlob);
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (error) {
            console.error('Error starting voice recording:', error);
        }
    };

    const stopVoiceRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const sendVoiceMessage = async (audioBlob) => {
        const userMessage = {
            id: Date.now(),
            role: 'user',
            content: '🎤 Voice message',
            timestamp: new Date(),
            type: 'voice'
        };

        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);

        try {
            const formData = new FormData();
            formData.append('audio', audioBlob, 'voice-message.wav');
            formData.append('language', selectedLanguage);
            if (currentConversation) {
                formData.append('conversationId', currentConversation._id);
            }

            const response = await axios.post('/api/chatbot/voice', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data.success) {
                // Update user message with transcription
                setMessages(prev => prev.map(msg => 
                    msg.id === userMessage.id 
                        ? { ...msg, content: `🎤 "${response.data.data.transcription}"` }
                        : msg
                ));

                // Add bot response
                const botMessage = {
                    id: Date.now() + 1,
                    role: 'assistant',
                    content: response.data.data.response,
                    timestamp: new Date(),
                    type: 'voice_response',
                    audioUrl: response.data.data.audioResponse,
                    confidence: response.data.data.confidence
                };

                setMessages(prev => [...prev, botMessage]);
                setCurrentConversation({ _id: response.data.data.conversationId });
            }
        } catch (error) {
            console.error('Error sending voice message:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const speakText = (text) => {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = selectedLanguage === 'hi' ? 'hi-IN' : 
                            selectedLanguage === 'pa' ? 'pa-IN' : 
                            selectedLanguage === 'ur' ? 'ur-PK' : 'en-US';
            utterance.rate = 0.8;
            utterance.pitch = 1;
            window.speechSynthesis.speak(utterance);
        }
    };

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onload = (e) => setImagePreview(e.target.result);
            reader.readAsDataURL(file);
        }
    };

    const removeImagePreview = () => {
        setSelectedImage(null);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const loadConversation = async (conversationId) => {
        try {
            const response = await axios.get(`/api/chatbot/conversation/${conversationId}`);
            if (response.data.success) {
                const conversation = response.data.data;
                setCurrentConversation(conversation);
                setMessages(conversation.messages);
                setSidebarOpen(false);
            }
        } catch (error) {
            console.error('Error loading conversation:', error);
        }
    };

    const startNewConversation = () => {
        setCurrentConversation(null);
        setMessages([{
            id: Date.now(),
            role: 'assistant',
            content: getWelcomeMessage(selectedLanguage),
            timestamp: new Date(),
            type: 'text',
            isWelcome: true
        }]);
        setSidebarOpen(false);
    };

    const formatMessage = (content) => {
        return content.split('\n').map((line, index) => {
            if (line.startsWith('**') && line.endsWith('**')) {
                return <div key={index} className="message-heading">{line.slice(2, -2)}</div>;
            }
            return <div key={index} className="message-line">{line}</div>;
        });
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className="advanced-chatbot">
            {/* Header */}
            <div className="chatbot-header">
                <div className="header-left">
                    <button 
                        className="sidebar-toggle"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                    >
                        <span className="hamburger-icon">☰</span>
                    </button>
                    <div className="chatbot-title">
                        <span className="title-icon">🤖</span>
                        <span className="title-text">FarmAssist AI Chatbot</span>
                    </div>
                </div>
                
                <div className="header-right">
                    <div className="language-selector">
                        <button 
                            className="language-toggle"
                            onClick={() => setShowLanguageSelector(!showLanguageSelector)}
                        >
                            {languages.find(lang => lang.code === selectedLanguage)?.flag} 
                            {languages.find(lang => lang.code === selectedLanguage)?.name}
                        </button>
                        {showLanguageSelector && (
                            <div className="language-dropdown">
                                {languages.map(language => (
                                    <button
                                        key={language.code}
                                        className={`language-option ${selectedLanguage === language.code ? 'active' : ''}`}
                                        onClick={() => {
                                            setSelectedLanguage(language.code);
                                            setShowLanguageSelector(false);
                                        }}
                                    >
                                        {language.flag} {language.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="chatbot-main">
                {/* Sidebar */}
                {sidebarOpen && (
                    <div className="chatbot-sidebar">
                        <div className="sidebar-header">
                            <h3>Chat History</h3>
                            <button className="new-chat-btn" onClick={startNewConversation}>
                                + New Chat
                            </button>
                        </div>
                        <div className="conversation-list">
                            {conversations.map(conversation => (
                                <div 
                                    key={conversation._id}
                                    className={`conversation-item ${currentConversation?._id === conversation._id ? 'active' : ''}`}
                                    onClick={() => loadConversation(conversation._id)}
                                >
                                    <div className="conversation-title">{conversation.title}</div>
                                    <div className="conversation-preview">{conversation.lastMessage}</div>
                                    <div className="conversation-date">
                                        {new Date(conversation.updatedAt).toLocaleDateString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Chat Container */}
                <div className="chat-container">
                    {/* Messages */}
                    <div className="messages-container" ref={messagesContainerRef}>
                        {messages.map(message => (
                            <div 
                                key={message.id} 
                                className={`message ${message.role} ${message.isWelcome ? 'welcome' : ''} ${message.isError ? 'error' : ''}`}
                            >
                                <div className="message-avatar">
                                    {message.role === 'user' ? '👤' : '🤖'}
                                </div>
                                <div className="message-content">
                                    <div className="message-text">
                                        {message.type === 'image' && message.imagePreview && (
                                            <img 
                                                src={message.imagePreview} 
                                                alt="User uploaded" 
                                                className="message-image"
                                            />
                                        )}
                                        {formatMessage(message.content)}
                                    </div>
                                    {message.confidence && (
                                        <div className="message-confidence">
                                            Confidence: {(message.confidence * 100).toFixed(1)}%
                                        </div>
                                    )}
                                    {message.audioUrl && (
                                        <div className="message-audio">
                                            <audio controls>
                                                <source src={message.audioUrl} type="audio/mpeg" />
                                                Your browser does not support audio playback.
                                            </audio>
                                        </div>
                                    )}
                                    {message.sources && message.sources.length > 0 && (
                                        <div className="message-sources">
                                            <div className="sources-header">📚 Sources:</div>
                                            {message.sources.slice(0, 2).map((source, index) => (
                                                <div key={index} className="source-item">
                                                    <span className="source-category">{source.category}</span>
                                                    <span className="source-relevance">{((source.confidence || source.similarity || 0.7) * 100).toFixed(1)}%</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <div className="message-timestamp">
                                        {new Date(message.timestamp).toLocaleTimeString()}
                                    </div>
                                </div>
                            </div>
                        ))}
                        
                        {isLoading && (
                            <div className="message assistant">
                                <div className="message-avatar">🤖</div>
                                <div className="message-content">
                                    <div className="typing-indicator">
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="input-area">
                        {imagePreview && (
                            <div className="image-preview-container">
                                <img src={imagePreview} alt="Preview" className="image-preview" />
                                <button className="remove-image" onClick={removeImagePreview}>
                                    ×
                                </button>
                            </div>
                        )}
                        
                        <div className="input-container">
                            <div className="input-actions">
                                <button 
                                    className="action-btn image-btn"
                                    onClick={() => fileInputRef.current?.click()}
                                    title="Upload Image"
                                >
                                    📷
                                </button>
                                
                                {isVoiceSupported && (
                                    <button 
                                        className={`action-btn voice-btn ${isRecording ? 'recording' : ''}`}
                                        onMouseDown={startVoiceRecording}
                                        onMouseUp={stopVoiceRecording}
                                        onMouseLeave={stopVoiceRecording}
                                        title={isRecording ? "Release to send" : "Hold to record voice message"}
                                    >
                                        {isRecording ? '🔴' : '🎤'}
                                    </button>
                                )}
                            </div>
                            
                            <textarea
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder={
                                    selectedLanguage === 'hi' ? 'अपना सवाल यहाँ लिखें...' :
                                    selectedLanguage === 'pa' ? 'ਆਪਣਾ ਸਵਾਲ ਇੱਥੇ ਲਿਖੋ...' :
                                    selectedLanguage === 'ur' ? 'اپنا سوال یہاں لکھیں...' :
                                    'Ask your farming question here...'
                                }
                                className="message-input"
                                rows={1}
                                disabled={isLoading}
                            />
                            
                            <button 
                                className="send-btn"
                                onClick={sendMessage}
                                disabled={isLoading || (!inputMessage.trim() && !selectedImage)}
                                title="Send message"
                            >
                                {isLoading ? '⏳' : '🚀'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Hidden file input */}
            <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
            />
        </div>
    );
};

export default AdvancedChatbot;