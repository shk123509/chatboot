import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './Chat.css';

function Chat({ user }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [animationStarted, setAnimationStarted] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    // Create a new chat session when component mounts
    createSession();
    const timer = setTimeout(() => {
      setAnimationStarted(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Scroll to bottom when new messages are added
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const createSession = async () => {
    try {
      const res = await axios.post('/api/chat/session');
      if (res.data.success) {
        setSessionId(res.data.session.sessionId);
      }
    } catch (err) {
      console.error('Failed to create session:', err);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || !sessionId || loading) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { 
      sender: 'user', 
      text: userMessage, 
      timestamp: new Date(),
      id: Date.now()
    }]);
    
    setLoading(true);
    setIsTyping(true);

    try {
      // Simulate typing delay for better UX
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const res = await axios.post('/api/chat/message', {
        sessionId,
        message: userMessage
      });
      
      if (res.data.success) {
        setMessages(prev => [...prev, { 
          sender: 'bot', 
          text: res.data.reply,
          timestamp: new Date(),
          id: Date.now() + 1
        }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { 
        sender: 'bot', 
        text: 'Sorry, I could not process your request. Please try again.',
        timestamp: new Date(),
        id: Date.now() + 1,
        isError: true
      }]);
    } finally {
      setLoading(false);
      setIsTyping(false);
    }
  };

  const handleQuickQuestion = (question) => {
    setInput(question);
    inputRef.current?.focus();
  };

  const quickQuestions = [
    { text: 'What is the problem with my wheat crop having yellow leaves?', icon: '🌾', category: 'Disease' },
    { text: 'When should I irrigate my wheat crop?', icon: '💧', category: 'Irrigation' },
    { text: 'What fertilizer should I use for wheat?', icon: '🌱', category: 'Fertilizer' },
    { text: 'How to control pests in rice crop?', icon: '🛡️', category: 'Pest Control' },
    { text: 'Best time to plant tomatoes?', icon: '🍅', category: 'Planting' },
    { text: 'What are the signs of plant disease?', icon: '🔍', category: 'Diagnosis' }
  ];

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div className="chat-page">
      <div className="chat-background">
        <div className="chat-particles"></div>
      </div>
      
      <div className={`chat-container card-modern ${animationStarted ? 'animate-fadeInUp' : 'animate-hidden'}`}>
        <div className={`chat-header ${animationStarted ? 'animate-fadeInDown animate-delay-200' : 'animate-hidden'}`}>
          <div className="header-content">
            <div className="bot-avatar animate-pulse">
              <span>🤖</span>
            </div>
            <div className="header-text">
              <h2 className="text-gradient">FarmAssist AI</h2>
              <p className="header-subtitle">
                {sessionId ? (
                  <><span className="status-indicator online"></span>Ready to help with farming questions</>
                ) : (
                  <><span className="status-indicator connecting"></span>Connecting...</>
                )}
              </p>
            </div>
            <div className="header-actions">
              <button className="action-btn hover-scale transition-all" title="New Chat">
                <span>🔄</span>
              </button>
            </div>
          </div>
        </div>

        <div className={`quick-questions ${animationStarted ? 'animate-fadeInLeft animate-delay-300' : 'animate-hidden'}`}>
          <h3>Quick Questions</h3>
          <div className="quick-btns">
            {quickQuestions.map((q, i) => (
              <button 
                key={i} 
                onClick={() => handleQuickQuestion(q.text)}
                className="quick-btn hover-lift transition-all"
                style={{ animationDelay: `${0.4 + (i * 0.1)}s` }}
              >
                <span className="quick-icon animate-bounce">{q.icon}</span>
                <div className="quick-content">
                  <span className="quick-category">{q.category}</span>
                  <span className="quick-text">{q.text}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className={`messages-container ${animationStarted ? 'animate-fadeIn animate-delay-400' : 'animate-hidden'}`}>
          {messages.length === 0 ? (
            <div className="welcome-message animate-fadeInUp">
              <div className="welcome-icon animate-bounce">
                <span>👋</span>
              </div>
              <h3>Hello {user?.name || 'there'}!</h3>
              <p>I'm your AI farming assistant. I can help you with:</p>
              <ul className="help-topics">
                <li><span>🌾</span> Crop diseases and treatment</li>
                <li><span>💧</span> Irrigation schedules</li>
                <li><span>🌱</span> Fertilizer recommendations</li>
                <li><span>🐛</span> Pest control methods</li>
                <li><span>🌤️</span> Weather-based advice</li>
              </ul>
              <p className="start-prompt">Ask me anything about farming! 👇</p>
            </div>
          ) : (
            <div className="messages-list">
              {messages.map((msg, i) => (
                <div 
                  key={msg.id} 
                  className={`message ${msg.sender} ${msg.isError ? 'error' : ''} animate-messageSlideIn`}
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <div className="message-avatar">
                    <span>{msg.sender === 'user' ? '👤' : '🤖'}</span>
                  </div>
                  <div className="message-content">
                    <div className="message-header">
                      <span className="sender-name">
                        {msg.sender === 'user' ? 'You' : 'FarmAssist'}
                      </span>
                      <span className="message-time">
                        {formatTime(msg.timestamp)}
                      </span>
                    </div>
                    <div className="message-bubble">
                      <p>{msg.text}</p>
                    </div>
                  </div>
                </div>
              ))}
              
              {(loading || isTyping) && (
                <div className="message bot typing-message animate-fadeIn">
                  <div className="message-avatar">
                    <span>🤖</span>
                  </div>
                  <div className="message-content">
                    <div className="message-header">
                      <span className="sender-name">FarmAssist</span>
                      <span className="message-time">now</span>
                    </div>
                    <div className="message-bubble typing-bubble">
                      <div className="typing-indicator">
                        <div className="typing-dot"></div>
                        <div className="typing-dot"></div>
                        <div className="typing-dot"></div>
                      </div>
                      <span className="typing-text">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <form 
          onSubmit={sendMessage} 
          className={`input-form ${animationStarted ? 'animate-slideInUp animate-delay-500' : 'animate-hidden'}`}
        >
          <div className="input-wrapper">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your farming question here... 🌱"
              disabled={loading || !sessionId}
              className="message-input input-focus transition-all"
            />
            <button 
              type="submit" 
              disabled={loading || !sessionId || !input.trim()}
              className="send-btn btn-animated hover-glow transition-all"
              title="Send Message"
            >
              {loading ? (
                <div className="spinner-modern"></div>
              ) : (
                <span>🚀</span>
              )}
            </button>
          </div>
          
          {input && (
            <div className="input-suggestions animate-fadeInUp">
              <span className="suggestion-label">💡 Tip:</span>
              <span>Be specific about your crop and location for better advice</span>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default Chat;