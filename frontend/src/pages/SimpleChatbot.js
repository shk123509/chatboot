import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './AdvancedChatbot.css';

const SimpleChatbot = ({ user }) => {
    // State management
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [currentConversation, setCurrentConversation] = useState(null);
    const [conversations, setConversations] = useState([]);
    const [selectedLanguage, setSelectedLanguage] = useState('en');
    
    // UI state
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showLanguageSelector, setShowLanguageSelector] = useState(false);
    
    // File upload state
    const [selectedFile, setSelectedFile] = useState(null);
    const [showFilePreview, setShowFilePreview] = useState(false);
    
    // Voice recording state
    const [isRecording, setIsRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [audioChunks, setAudioChunks] = useState([]);
    const [recordingTime, setRecordingTime] = useState(0);
    
    // Refs
    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const fileInputRef = useRef(null);
    const recordingTimerRef = useRef(null);

    // Language options
    const languages = [
        { code: 'en', name: 'English', flag: '🇺🇸' },
        { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
        { code: 'pa', name: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
        { code: 'ur', name: 'اردو', flag: '🇵🇰' }
    ];

    useEffect(() => {
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
            'en': "🌾 Hello! I'm your FarmAssist AI chatbot. Ask me any farming questions and I'll help you with solutions. How can I assist you today?",
            'hi': "🌾 नमस्ते! मैं आपका FarmAssist AI चैटबॉट हूं। मुझसे कोई भी खेती का सवाल पूछें और मैं आपकी मदद करूंगा। आज मैं आपकी कैसे सहायता कर सकता हूं?",
            'pa': "🌾 ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਤੁਹਾਡਾ FarmAssist AI ਚੈਟਬੋਟ ਹਾਂ। ਮੈਨੂੰ ਕੋਈ ਵੀ ਖੇਤੀ ਦਾ ਸਵਾਲ ਪੁੱਛੋ ਅਤੇ ਮੈਂ ਤੁਹਾਡੀ ਮਦਦ ਕਰਾਂਗਾ। ਅੱਜ ਮੈਂ ਤੁਹਾਡੀ ਕਿਵੇਂ ਸਹਾਇਤਾ ਕਰ ਸਕਦਾ ਹਾਂ?",
            'ur': "🌾 السلام علیکم! میں آپ کا FarmAssist AI چیٹ بوٹ ہوں۔ مجھ سے کوئی بھی کھیتی کا سوال پوچھیں اور میں آپ کی مدد کروں گا۔ آج میں آپ کی کیسے مدد کر سکتا ہوں؟"
        };
        return welcomeMessages[language] || welcomeMessages['en'];
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const loadConversations = async () => {
        try {
            const authToken = localStorage.getItem('token');
            if (!authToken) {
                // If not authenticated, use empty array
                setConversations([]);
                return;
            }
            
            const response = await axios.get('/api/chatbot/conversations', {
                headers: { 'auth-token': authToken }
            });
            
            if (response.data.success && response.data.data && response.data.data.conversations) {
                setConversations(response.data.data.conversations);
            } else {
                setConversations([]);
            }
        } catch (error) {
            console.error('Error loading conversations:', error);
            setConversations([]); // Set empty array on error
        }
    };

    const sendMessage = async () => {
        // If there's a selected file, send image message instead
        if (selectedFile) {
            await sendImageMessage();
            return;
        }
        
        if (!inputMessage.trim()) return;

        const userMessage = {
            id: Date.now(),
            role: 'user',
            content: inputMessage,
            timestamp: new Date(),
            type: 'text'
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsLoading(true);

        try {
            const authToken = localStorage.getItem('token');
            const headers = { 'Content-Type': 'application/json' };
            if (authToken) {
                headers['auth-token'] = authToken;
            }
            
            const response = await axios.post('/api/chatbot/message', {
                message: inputMessage,
                conversationId: currentConversation?._id,
                language: selectedLanguage
            }, { headers });

            if (response.data.success) {
                console.log('✅ Received bot response:', response.data.data);
                const botMessage = {
                    id: Date.now() + 1,
                    role: 'assistant',
                    content: response.data.data.response,
                    timestamp: new Date(),
                    type: 'text',
                    confidence: response.data.data.confidence,
                    sources: response.data.data.sources
                };

                console.log('🤖 Adding bot message to state:', botMessage);
                setMessages(prev => {
                    const newMessages = [...prev, botMessage];
                    console.log('📝 New messages state:', newMessages);
                    return newMessages;
                });
                setCurrentConversation({ _id: response.data.data.conversationId });
                
                // Reload conversations list
                loadConversations();
            } else {
                console.error('❌ Response not successful:', response.data);
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

    const loadConversation = async (conversationId) => {
        try {
            const authToken = localStorage.getItem('token');
            const headers = {};
            if (authToken) {
                headers['auth-token'] = authToken;
            }
            
            const response = await axios.get(`/api/chatbot/conversation/${conversationId}`, { headers });
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
    
    // File upload functions
    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                alert('File size must be less than 10MB');
                return;
            }
            setSelectedFile(file);
            setShowFilePreview(true);
        }
    };
    
    const removeFile = () => {
        setSelectedFile(null);
        setShowFilePreview(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };
    
    const sendImageMessage = async () => {
        if (!selectedFile) return;
        
        const formData = new FormData();
        formData.append('image', selectedFile);
        formData.append('question', inputMessage || 'Please analyze this crop image');
        if (currentConversation?._id) {
            formData.append('conversationId', currentConversation._id);
        }
        
        const userMessage = {
            id: Date.now(),
            role: 'user',
            content: inputMessage || 'Please analyze this crop image',
            timestamp: new Date(),
            type: 'image',
            imageFile: selectedFile
        };
        
        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        removeFile();
        setIsLoading(true);
        
        try {
            const authToken = localStorage.getItem('token');
            const response = await axios.post('/api/chatbot/image', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'auth-token': authToken
                }
            });
            
            if (response.data.success) {
                const botMessage = {
                    id: Date.now() + 1,
                    role: 'assistant',
                    content: response.data.data.response,
                    timestamp: new Date(),
                    type: 'image_analysis',
                    confidence: response.data.data.confidence,
                    imageAnalysis: response.data.data.imageAnalysis
                };
                
                setMessages(prev => [...prev, botMessage]);
                setCurrentConversation({ _id: response.data.data.conversationId });
                loadConversations();
            }
        } catch (error) {
            console.error('Error sending image:', error);
            const errorMessage = {
                id: Date.now() + 1,
                role: 'assistant',
                content: 'Sorry, I couldn\'t analyze the image. Please try again.',
                timestamp: new Date(),
                type: 'text',
                isError: true
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };
    
    // Voice recording functions
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            const chunks = [];
            
            recorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunks.push(event.data);
                }
            };
            
            recorder.onstop = () => {
                const audioBlob = new Blob(chunks, { type: 'audio/wav' });
                sendVoiceMessage(audioBlob);
                stream.getTracks().forEach(track => track.stop());
            };
            
            recorder.start();
            setMediaRecorder(recorder);
            setAudioChunks(chunks);
            setIsRecording(true);
            setRecordingTime(0);
            
            // Start timer
            recordingTimerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
            
        } catch (error) {
            console.error('Error accessing microphone:', error);
            alert('Could not access microphone. Please check permissions.');
        }
    };
    
    const stopRecording = () => {
        if (mediaRecorder && mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
        }
        setIsRecording(false);
        if (recordingTimerRef.current) {
            clearInterval(recordingTimerRef.current);
        }
    };
    
    const sendVoiceMessage = async (audioBlob) => {
        const formData = new FormData();
        formData.append('audio', audioBlob, 'voice-message.wav');
        if (currentConversation?._id) {
            formData.append('conversationId', currentConversation._id);
        }
        
        const userMessage = {
            id: Date.now(),
            role: 'user',
            content: '🎤 Voice message sent',
            timestamp: new Date(),
            type: 'voice'
        };
        
        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);
        
        try {
            const authToken = localStorage.getItem('token');
            const response = await axios.post('/api/chatbot/voice', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'auth-token': authToken
                }
            });
            
            if (response.data.success) {
                const botMessage = {
                    id: Date.now() + 1,
                    role: 'assistant',
                    content: `📝 Transcription: "${response.data.data.transcription}"\n\n${response.data.data.response}`,
                    timestamp: new Date(),
                    type: 'voice_response'
                };
                
                setMessages(prev => [...prev, botMessage]);
                setCurrentConversation({ _id: response.data.data.conversationId });
                loadConversations();
            }
        } catch (error) {
            console.error('Error sending voice message:', error);
            const errorMessage = {
                id: Date.now() + 1,
                role: 'assistant',
                content: 'Sorry, I couldn\'t process the voice message. Please try again.',
                timestamp: new Date(),
                type: 'text',
                isError: true
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
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
                        {console.log('🖥️ Rendering messages:', messages)}
                        {messages.map(message => (
                            <div 
                                key={message.id || message._id} 
                                className={`message ${message.role} ${message.isWelcome ? 'welcome' : ''} ${message.isError ? 'error' : ''}`}
                            >
                                <div className="message-avatar">
                                    {message.role === 'user' ? '👤' : '🤖'}
                                </div>
                                <div className="message-content">
                                    {message.imageFile && (
                                        <div className="message-image">
                                            <img 
                                                src={URL.createObjectURL(message.imageFile)} 
                                                alt="Uploaded crop" 
                                                style={{ maxWidth: '200px', maxHeight: '200px', borderRadius: '8px', marginBottom: '10px' }}
                                            />
                                        </div>
                                    )}
                                    <div className="message-text">
                                        {formatMessage(message.content)}
                                    </div>
                                    {message.confidence && (
                                        <div className="message-confidence">
                                            Confidence: {(message.confidence * 100).toFixed(1)}%
                                        </div>
                                    )}
                                    {message.sources && message.sources.length > 0 && (
                                        <div className="message-sources">
                                            <div className="sources-header">📚 Sources:</div>
                                            {message.sources.slice(0, 2).map((source, index) => (
                                                <div key={index} className="source-item">
                                                    <span className="source-category">{source.category}</span>
                                                    <span className="source-relevance">{(source.similarity * 100).toFixed(1)}%</span>
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
                        {/* File Preview */}
                        {showFilePreview && selectedFile && (
                            <div className="file-preview" style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '10px',
                                backgroundColor: '#f0f0f0',
                                borderRadius: '8px',
                                marginBottom: '10px'
                            }}>
                                <img 
                                    src={URL.createObjectURL(selectedFile)} 
                                    alt="Preview" 
                                    style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px', marginRight: '10px' }}
                                />
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{selectedFile.name}</div>
                                    <div style={{ fontSize: '12px', color: '#666' }}>
                                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                    </div>
                                </div>
                                <button 
                                    onClick={removeFile}
                                    style={{
                                        background: '#ff4444',
                                        color: 'white',
                                        border: 'none',
                                        padding: '5px 10px',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    ✕
                                </button>
                            </div>
                        )}
                        
                        {/* Voice Recording Indicator */}
                        {isRecording && (
                            <div className="voice-recording" style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '10px',
                                backgroundColor: '#ffe6e6',
                                borderRadius: '8px',
                                marginBottom: '10px',
                                border: '2px solid #ff4444'
                            }}>
                                <div style={{
                                    width: '12px',
                                    height: '12px',
                                    backgroundColor: '#ff4444',
                                    borderRadius: '50%',
                                    marginRight: '10px',
                                    animation: 'pulse 1.5s infinite'
                                }}></div>
                                <div style={{ flex: 1, fontWeight: 'bold' }}>
                                    Recording: {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
                                </div>
                                <button 
                                    onClick={stopRecording}
                                    style={{
                                        background: '#ff4444',
                                        color: 'white',
                                        border: 'none',
                                        padding: '5px 15px',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Stop
                                </button>
                            </div>
                        )}
                        
                        {/* Action Buttons */}
                        <div className="input-actions" style={{
                            display: 'flex',
                            gap: '10px',
                            marginBottom: '10px'
                        }}>
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                style={{
                                    background: '#4CAF50',
                                    color: 'white',
                                    border: 'none',
                                    padding: '8px 16px',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '14px'
                                }}
                                disabled={isLoading}
                            >
                                📷 Upload Image
                            </button>
                            
                            <button 
                                onClick={isRecording ? stopRecording : startRecording}
                                style={{
                                    background: isRecording ? '#ff4444' : '#2196F3',
                                    color: 'white',
                                    border: 'none',
                                    padding: '8px 16px',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '14px'
                                }}
                                disabled={isLoading}
                            >
                                {isRecording ? '⏹️ Stop Recording' : '🎤 Voice Message'}
                            </button>
                            
                            {selectedFile && (
                                <button 
                                    onClick={sendImageMessage}
                                    style={{
                                        background: '#FF9800',
                                        color: 'white',
                                        border: 'none',
                                        padding: '8px 16px',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontSize: '14px'
                                    }}
                                    disabled={isLoading}
                                >
                                    🔍 Analyze Image
                                </button>
                            )}
                        </div>
                        
                        <div className="input-container">
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
                                disabled={isLoading || !inputMessage.trim()}
                            >
                                {isLoading ? '⏳' : '🚀'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Hidden File Input */}
            <input 
                type="file" 
                ref={fileInputRef}
                accept="image/*" 
                style={{ display: 'none' }} 
                onChange={handleFileSelect} 
            />
        </div>
    );
};

export default SimpleChatbot;
