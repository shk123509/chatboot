import React, { useState, useEffect } from 'react';
import './Contact.css';

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    category: 'general'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('');
  const [animationStarted, setAnimationStarted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationStarted(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('');

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: '',
          category: 'general'
        });
      } else {
        setSubmitStatus('error');
        console.error('Submit error:', result.message);
      }
    } catch (error) {
      setSubmitStatus('error');
      console.error('Network error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact-page">
      {/* Hero Section */}
      <div className="contact-hero">
        <div className="hero-content">
          <h1 className={`hero-title ${animationStarted ? 'animate-fadeInDown' : 'animate-hidden'}`}>
            <span className="text-gradient">Get In Touch</span>
          </h1>
          <p className={`hero-subtitle ${animationStarted ? 'animate-fadeInUp animate-delay-200' : 'animate-hidden'}`}>
            We're here to help farmers grow better. Reach out to us with your questions, suggestions, or feedback.
          </p>
          <div className={`hero-stats ${animationStarted ? 'animate-fadeInUp animate-delay-300' : 'animate-hidden'}`}>
            <div className="stat-card">
              <div className="stat-icon animate-bounce">📞</div>
              <div className="stat-number">24/7</div>
              <div className="stat-label">Support Available</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon animate-float">🌾</div>
              <div className="stat-number">10K+</div>
              <div className="stat-label">Farmers Helped</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon animate-pulse">⚡</div>
              <div className="stat-number">&lt; 2hrs</div>
              <div className="stat-label">Response Time</div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="contact-section">
        <div className="container">
          <div className="contact-grid">
            {/* Contact Information */}
            <div className={`contact-info ${animationStarted ? 'animate-fadeInLeft animate-delay-400' : 'animate-hidden'}`}>
              <div className="section-header">
                <h2>Contact Information</h2>
                <p>Connect with our team of agricultural experts</p>
              </div>

              <div className="contact-methods">
                <div className="contact-item">
                  <div className="contact-icon animate-bounce">
                    <span>📧</span>
                  </div>
                  <div className="contact-details">
                    <h4>Email Us</h4>
                    <p>support@farmassist.com</p>
                    <p>info@farmassist.com</p>
                  </div>
                </div>

                <div className="contact-item">
                  <div className="contact-icon animate-float">
                    <span>📱</span>
                  </div>
                  <div className="contact-details">
                    <h4>Call Us</h4>
                    <p>+92 300 1234567</p>
                    <p>+92 333 9876543</p>
                  </div>
                </div>

                <div className="contact-item">
                  <div className="contact-icon animate-pulse">
                    <span>📍</span>
                  </div>
                  <div className="contact-details">
                    <h4>Visit Us</h4>
                    <p>123 Agriculture Street</p>
                    <p>Lahore, Punjab, Pakistan</p>
                  </div>
                </div>

                <div className="contact-item">
                  <div className="contact-icon animate-glow">
                    <span>⏰</span>
                  </div>
                  <div className="contact-details">
                    <h4>Working Hours</h4>
                    <p>Monday - Friday: 8AM - 6PM</p>
                    <p>Saturday - Sunday: 9AM - 5PM</p>
                  </div>
                </div>
              </div>

              <div className="social-links">
                <h4>Follow Us</h4>
                <div className="social-icons">
                  <a href="#" className="social-link facebook">
                    <span>📘</span>
                  </a>
                  <a href="#" className="social-link twitter">
                    <span>🐦</span>
                  </a>
                  <a href="#" className="social-link instagram">
                    <span>📷</span>
                  </a>
                  <a href="#" className="social-link youtube">
                    <span>📺</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className={`contact-form-container ${animationStarted ? 'animate-fadeInRight animate-delay-500' : 'animate-hidden'}`}>
              <div className="form-header">
                <h2>Send us a Message</h2>
                <p>Fill out the form below and we'll get back to you as soon as possible</p>
              </div>

              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">Full Name *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="Your full name"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">Email Address *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="phone">Phone Number</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+92 300 1234567"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="category">Category</label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                    >
                      <option value="general">General Inquiry</option>
                      <option value="technical">Technical Support</option>
                      <option value="farming">Farming Questions</option>
                      <option value="feedback">Feedback</option>
                      <option value="partnership">Partnership</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="subject">Subject *</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    placeholder="Brief subject of your message"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="message">Message *</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="6"
                    placeholder="Please describe your question or message in detail..."
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className={`submit-btn ${isSubmitting ? 'submitting' : ''}`}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner"></span>
                      Sending...
                    </>
                  ) : (
                    <>
                      <span>📤</span>
                      Send Message
                    </>
                  )}
                </button>

                {submitStatus === 'success' && (
                  <div className="status-message success animate-fadeIn">
                    <span>✅</span>
                    Thank you! Your message has been sent successfully. We'll get back to you soon.
                  </div>
                )}

                {submitStatus === 'error' && (
                  <div className="status-message error animate-fadeIn">
                    <span>❌</span>
                    Sorry, there was an error sending your message. Please try again or contact us directly.
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className={`faq-section ${animationStarted ? 'animate-fadeInUp animate-delay-800' : 'animate-hidden'}`}>
        <div className="container">
          <div className="section-header">
            <h2>Frequently Asked Questions</h2>
            <p>Quick answers to common questions about FarmAssist</p>
          </div>

          <div className="faq-grid">
            <div className="faq-card">
              <div className="faq-icon animate-bounce">🤔</div>
              <h3>How does FarmAssist help farmers?</h3>
              <p>Our AI-powered platform provides crop disease detection, irrigation advice, fertilizer guidance, and personalized farming recommendations based on your specific conditions.</p>
            </div>

            <div className="faq-card">
              <div className="faq-icon animate-float">💰</div>
              <h3>Is FarmAssist free to use?</h3>
              <p>Yes! FarmAssist offers a comprehensive free tier with access to our AI chatbot, basic crop guidance, and weather information. Premium features are available for advanced users.</p>
            </div>

            <div className="faq-card">
              <div className="faq-icon animate-pulse">🌍</div>
              <h3>Which languages do you support?</h3>
              <p>FarmAssist supports English, Hindi, Punjabi, and Urdu to serve farmers across Pakistan and India with their preferred language.</p>
            </div>

            <div className="faq-card">
              <div className="faq-icon animate-glow">📱</div>
              <h3>Do you have a mobile app?</h3>
              <p>Currently, FarmAssist is available as a web application that works seamlessly on mobile browsers. A dedicated mobile app is coming soon!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact;
