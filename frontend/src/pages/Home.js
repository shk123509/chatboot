import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import './Home.css';

function Home({ user }) {
  const [animationStarted, setAnimationStarted] = useState(false);

  useEffect(() => {
    // Trigger animations after component mounts
    const timer = setTimeout(() => {
      setAnimationStarted(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="home-page">
      <div className="hero-section">
        <h1 className={`hero-title ${animationStarted ? 'animate-fadeInDown' : 'animate-hidden'}`}>
          <span className="text-gradient">Welcome to FarmAssist</span>
        </h1>
        <p className={`hero-subtitle ${animationStarted ? 'animate-fadeInUp animate-delay-200' : 'animate-hidden'}`}>
          Smart Farming Solutions with AI-Powered Assistance
        </p>
        <div className="hero-features">
          <div className={`feature-card card-modern hover-lift ${animationStarted ? 'animate-fadeInUp animate-delay-300' : 'animate-hidden'}`}>
            <span className="feature-icon animate-bounce">🌾</span>
            <h3>Crop Disease Detection</h3>
            <p>Identify crop diseases early using AI-powered analysis</p>
          </div>
          <div className={`feature-card card-modern hover-lift ${animationStarted ? 'animate-fadeInUp animate-delay-400' : 'animate-hidden'}`}>
            <span className="feature-icon animate-float">💧</span>
            <h3>Irrigation Advice</h3>
            <p>Get optimal irrigation schedules for your crops</p>
          </div>
          <div className={`feature-card card-modern hover-lift ${animationStarted ? 'animate-fadeInUp animate-delay-500' : 'animate-hidden'}`}>
            <span className="feature-icon animate-pulse">🌱</span>
            <h3>Fertilizer Guidance</h3>
            <p>Learn about the right fertilizers and their application</p>
          </div>
          <div className={`feature-card card-modern hover-lift ${animationStarted ? 'animate-fadeInUp animate-delay-600' : 'animate-hidden'}`}>
            <span className="feature-icon animate-glow">🤖</span>
            <h3>AI Chatbot</h3>
            <p>Get instant answers to your farming questions</p>
          </div>
        </div>
        {user ? (
          <div className={`cta-buttons ${animationStarted ? 'animate-fadeInUp animate-delay-700' : 'animate-hidden'}`}>
            <Link to="/simple-chatbot" className="btn btn-primary btn-animated hover-glow transition-all">
              <span>🤖</span> AI Farm Assistant
            </Link>
            <Link to="/chat" className="btn btn-secondary btn-animated hover-scale transition-all">
              <span>💬</span> Basic Chat
            </Link>
            <Link to="/about" className="btn btn-secondary btn-animated hover-scale transition-all">
              <span>ℹ️</span> Learn More
            </Link>
          </div>
        ) : (
          <div className={`cta-buttons ${animationStarted ? 'animate-fadeInUp animate-delay-700' : 'animate-hidden'}`}>
            <Link to="/signup" className="btn btn-primary btn-animated hover-glow transition-all">
              <span>✨</span> Get Started
            </Link>
            <Link to="/login" className="btn btn-secondary btn-animated hover-scale transition-all">
              <span>🔑</span> Login
            </Link>
          </div>
        )}
      </div>
      
      <div className="info-section">
        <h2 className={`section-title ${animationStarted ? 'animate-fadeInUp animate-delay-800' : 'animate-hidden'}`}>
          How FarmAssist Helps You
        </h2>
        <div className="info-grid">
          <div className={`info-item card-modern hover-lift ${animationStarted ? 'animate-fadeInLeft animate-delay-900' : 'animate-hidden'}`}>
            <div className="info-icon animate-bounce">📱</div>
            <h3>Easy to Use</h3>
            <p>Simple interface designed for farmers with basic tech knowledge</p>
            <div className="info-overlay">
              <div className="overlay-content">
                <span>✨</span>
                <h4>User-Friendly</h4>
                <p>Designed for farmers of all tech levels</p>
              </div>
            </div>
          </div>
          <div className={`info-item card-modern hover-lift ${animationStarted ? 'animate-fadeInLeft animate-delay-1000' : 'animate-hidden'}`}>
            <div className="info-icon animate-float">🌍</div>
            <h3>Local Language Support</h3>
            <p>Available in English, Hindi, Punjabi, and Urdu</p>
            <div className="info-overlay">
              <div className="overlay-content">
                <span>🗣️</span>
                <h4>Multilingual</h4>
                <p>Communication in your preferred language</p>
              </div>
            </div>
          </div>
          <div className={`info-item card-modern hover-lift ${animationStarted ? 'animate-fadeInRight animate-delay-900' : 'animate-hidden'}`}>
            <div className="info-icon animate-pulse">📊</div>
            <h3>Data-Driven Insights</h3>
            <p>ML models trained on real farming data for accurate advice</p>
            <div className="info-overlay">
              <div className="overlay-content">
                <span>🧠</span>
                <h4>Smart Analytics</h4>
                <p>AI-powered recommendations for better yields</p>
              </div>
            </div>
          </div>
          <div className={`info-item card-modern hover-lift ${animationStarted ? 'animate-fadeInRight animate-delay-1000' : 'animate-hidden'}`}>
            <div className="info-icon animate-glow">🌦️</div>
            <h3>Weather Integration</h3>
            <p>Get weather-based recommendations for your crops</p>
            <div className="info-overlay">
              <div className="overlay-content">
                <span>⛈️</span>
                <h4>Weather Smart</h4>
                <p>Real-time weather-based farming advice</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;