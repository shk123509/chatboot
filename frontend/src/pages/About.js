import { useState, useEffect } from 'react';
import './About.css';

function About() {
  const [animationStarted, setAnimationStarted] = useState(false);
  const [activeSection, setActiveSection] = useState('mission');

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationStarted(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const teamMembers = [
    {
      id: 1,
      name: 'Dr. Rajesh Kumar',
      role: 'Agricultural Expert & Founder',
      expertise: 'Crop Science, Sustainable Farming',
      experience: '15+ years',
      image: '👨‍🌾',
      bio: 'Leading agricultural scientist with expertise in modern farming techniques and crop optimization.',
      achievements: ['PhD in Agricultural Science', 'Published 50+ research papers', 'International farming consultant']
    },
    {
      id: 2,
      name: 'Priya Sharma',
      role: 'AI/ML Lead',
      expertise: 'Machine Learning, Data Analytics',
      experience: '8+ years',
      image: '👩‍💻',
      bio: 'AI specialist focused on developing intelligent farming solutions and predictive analytics.',
      achievements: ['MSc Computer Science', 'AI research publications', 'Tech innovation awards']
    },
    {
      id: 3,
      name: 'Amit Singh',
      role: 'Full Stack Developer',
      expertise: 'Web Development, Mobile Apps',
      experience: '6+ years',
      image: '👨‍💻',
      bio: 'Expert developer creating user-friendly applications to bridge technology and agriculture.',
      achievements: ['BTech Computer Science', 'Open source contributor', 'Mobile app specialist']
    },
    {
      id: 4,
      name: 'Sarah Johnson',
      role: 'UX/UI Designer',
      expertise: 'User Experience, Design Systems',
      experience: '5+ years',
      image: '👩‍🎨',
      bio: 'Design expert passionate about creating intuitive interfaces for farmers worldwide.',
      achievements: ['Design certification', 'Award-winning interfaces', 'Accessibility advocate']
    }
  ];

  const features = [
    {
      icon: '🤖',
      title: 'AI-Powered Assistance',
      description: 'Advanced machine learning algorithms provide personalized farming recommendations',
      color: 'from-blue-500 to-purple-600'
    },
    {
      icon: '🌱',
      title: 'Crop Management',
      description: 'Comprehensive tools for tracking, monitoring, and optimizing your crops',
      color: 'from-green-500 to-emerald-600'
    },
    {
      icon: '📊',
      title: 'Data Analytics',
      description: 'Real-time insights and analytics to make informed farming decisions',
      color: 'from-orange-500 to-red-600'
    },
    {
      icon: '🌍',
      title: 'Sustainable Practices',
      description: 'Promote eco-friendly farming methods for a better tomorrow',
      color: 'from-teal-500 to-cyan-600'
    }
  ];

  const stats = [
    { number: '10,000+', label: 'Active Farmers', icon: '👨‍🌾' },
    { number: '500+', label: 'Crops Supported', icon: '🌾' },
    { number: '95%', label: 'Success Rate', icon: '📈' },
    { number: '24/7', label: 'AI Support', icon: '🤖' }
  ];

  const handleSectionClick = (section) => {
    setActiveSection(section);
  };

  return (
    <div className="about-page">
      <div className="about-background">
        <div className="floating-shapes">
          <div className="shape shape-1 animate-float"></div>
          <div className="shape shape-2 animate-float animate-delay-200"></div>
          <div className="shape shape-3 animate-float animate-delay-400"></div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="hero-section">
        <div className={`hero-content ${animationStarted ? 'animate-fadeInUp' : 'animate-hidden'}`}>
          <h1 className="hero-title">
            <span className="text-gradient">About FarmAssist</span>
          </h1>
          <p className={`hero-subtitle ${animationStarted ? 'animate-fadeInUp animate-delay-200' : 'animate-hidden'}`}>
            Revolutionizing agriculture through AI-powered solutions and sustainable farming practices
          </p>
          <div className={`hero-stats ${animationStarted ? 'animate-fadeInUp animate-delay-300' : 'animate-hidden'}`}>
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className="stat-card hover-lift transition-all"
                style={{ animationDelay: `${0.4 + (index * 0.1)}s` }}
              >
                <div className="stat-icon animate-bounce">{stat.icon}</div>
                <div className="stat-number">{stat.number}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="content-section">
        <div className="container">
          <div className={`section-header ${animationStarted ? 'animate-fadeInUp animate-delay-500' : 'animate-hidden'}`}>
            <h2 className="section-title">Our Story</h2>
            <div className="section-tabs">
              <button 
                className={`tab-btn ${activeSection === 'mission' ? 'active' : ''}`}
                onClick={() => handleSectionClick('mission')}
              >
                <span>🎯</span> Mission
              </button>
              <button 
                className={`tab-btn ${activeSection === 'vision' ? 'active' : ''}`}
                onClick={() => handleSectionClick('vision')}
              >
                <span>🌟</span> Vision
              </button>
              <button 
                className={`tab-btn ${activeSection === 'values' ? 'active' : ''}`}
                onClick={() => handleSectionClick('values')}
              >
                <span>💎</span> Values
              </button>
            </div>
          </div>

          <div className="tab-content">
            {activeSection === 'mission' && (
              <div className="mission-content animate-fadeIn">
                <div className="content-grid">
                  <div className="content-text">
                    <h3>Our Mission</h3>
                    <p>
                      To empower farmers worldwide with cutting-edge AI technology, making sustainable 
                      and profitable farming accessible to everyone, regardless of their location or 
                      experience level.
                    </p>
                    <ul className="mission-points">
                      <li><span>🌱</span> Democratize access to agricultural knowledge</li>
                      <li><span>🤝</span> Bridge the gap between technology and farming</li>
                      <li><span>📈</span> Increase crop yields while reducing environmental impact</li>
                      <li><span>🌍</span> Support sustainable farming practices globally</li>
                    </ul>
                  </div>
                  <div className="content-visual">
                    <div className="mission-graphic animate-pulse">
                      <span>🎯</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'vision' && (
              <div className="vision-content animate-fadeIn">
                <div className="content-grid">
                  <div className="content-visual">
                    <div className="vision-graphic animate-glow">
                      <span>🌟</span>
                    </div>
                  </div>
                  <div className="content-text">
                    <h3>Our Vision</h3>
                    <p>
                      To create a world where every farmer has access to intelligent, sustainable 
                      farming solutions that ensure food security for future generations while 
                      protecting our planet's resources.
                    </p>
                    <div className="vision-goals">
                      <div className="goal-item">
                        <span className="goal-icon">🏆</span>
                        <div>
                          <h4>Global Leadership</h4>
                          <p>Become the world's most trusted AI farming platform</p>
                        </div>
                      </div>
                      <div className="goal-item">
                        <span className="goal-icon">🔬</span>
                        <div>
                          <h4>Innovation Hub</h4>
                          <p>Continuous research and development in agricultural technology</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'values' && (
              <div className="values-content animate-fadeIn">
                <h3>Our Core Values</h3>
                <div className="values-grid">
                  <div className="value-card hover-lift">
                    <div className="value-icon">🌱</div>
                    <h4>Sustainability</h4>
                    <p>Committed to eco-friendly practices that protect our environment</p>
                  </div>
                  <div className="value-card hover-lift">
                    <div className="value-icon">🤝</div>
                    <h4>Accessibility</h4>
                    <p>Making advanced farming technology available to farmers everywhere</p>
                  </div>
                  <div className="value-card hover-lift">
                    <div className="value-icon">🔬</div>
                    <h4>Innovation</h4>
                    <p>Continuously pushing the boundaries of agricultural technology</p>
                  </div>
                  <div className="value-card hover-lift">
                    <div className="value-icon">💚</div>
                    <h4>Empathy</h4>
                    <p>Understanding and addressing the real challenges farmers face</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className={`section-header ${animationStarted ? 'animate-fadeInUp animate-delay-600' : 'animate-hidden'}`}>
            <h2 className="section-title">What Makes Us Different</h2>
            <p className="section-subtitle">Advanced technology meets traditional farming wisdom</p>
          </div>

          <div className="features-grid">
            {features.map((feature, index) => (
              <div 
                key={index}
                className={`feature-card card-modern hover-lift ${animationStarted ? 'animate-scaleIn' : 'animate-hidden'}`}
                style={{ animationDelay: `${0.7 + (index * 0.1)}s` }}
              >
                <div className="feature-icon animate-bounce">{feature.icon}</div>
                <h4 className="feature-title">{feature.title}</h4>
                <p className="feature-description">{feature.description}</p>
                <div className="feature-accent"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="gallery-section">
        <div className="container">
          <div className={`section-header ${animationStarted ? 'animate-fadeInUp animate-delay-700' : 'animate-hidden'}`}>
            <h2 className="section-title">Our Journey in Pictures</h2>
            <p className="section-subtitle">Moments that showcase our commitment to transforming agriculture</p>
          </div>

          <div className="gallery-grid">
            <div className={`gallery-item large ${animationStarted ? 'animate-scaleIn animate-delay-800' : 'animate-hidden'}`}>
              <div className="gallery-image">
                <div className="image-placeholder">
                  <span className="image-icon">🌾</span>
                  <p>Modern Farming Techniques</p>
                </div>
                <div className="gallery-overlay">
                  <h4>Smart Agriculture</h4>
                  <p>Implementing AI-driven solutions in real farm environments</p>
                </div>
              </div>
            </div>
            
            <div className={`gallery-item ${animationStarted ? 'animate-scaleIn animate-delay-900' : 'animate-hidden'}`}>
              <div className="gallery-image">
                <div className="image-placeholder">
                  <span className="image-icon">👩‍🌾</span>
                  <p>Farmer Training</p>
                </div>
                <div className="gallery-overlay">
                  <h4>Education</h4>
                  <p>Training farmers on sustainable practices</p>
                </div>
              </div>
            </div>
            
            <div className={`gallery-item ${animationStarted ? 'animate-scaleIn animate-delay-1000' : 'animate-hidden'}`}>
              <div className="gallery-image">
                <div className="image-placeholder">
                  <span className="image-icon">🚁</span>
                  <p>Drone Technology</p>
                </div>
                <div className="gallery-overlay">
                  <h4>Innovation</h4>
                  <p>Using drones for crop monitoring and analysis</p>
                </div>
              </div>
            </div>
            
            <div className={`gallery-item ${animationStarted ? 'animate-scaleIn animate-delay-1100' : 'animate-hidden'}`}>
              <div className="gallery-image">
                <div className="image-placeholder">
                  <span className="image-icon">📱</span>
                  <p>Mobile App Demo</p>
                </div>
                <div className="gallery-overlay">
                  <h4>Technology</h4>
                  <p>Demonstrating our mobile solutions to farmers</p>
                </div>
              </div>
            </div>
            
            <div className={`gallery-item tall ${animationStarted ? 'animate-scaleIn animate-delay-1200' : 'animate-hidden'}`}>
              <div className="gallery-image">
                <div className="image-placeholder">
                  <span className="image-icon">🌱</span>
                  <p>Sustainable Growth</p>
                </div>
                <div className="gallery-overlay">
                  <h4>Sustainability</h4>
                  <p>Promoting eco-friendly farming methods worldwide</p>
                </div>
              </div>
            </div>
            
            <div className={`gallery-item ${animationStarted ? 'animate-scaleIn animate-delay-1300' : 'animate-hidden'}`}>
              <div className="gallery-image">
                <div className="image-placeholder">
                  <span className="image-icon">🤝</span>
                  <p>Community Impact</p>
                </div>
                <div className="gallery-overlay">
                  <h4>Partnership</h4>
                  <p>Building strong relationships with farming communities</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="team-section">
        <div className="container">
          <div className={`section-header ${animationStarted ? 'animate-fadeInUp animate-delay-1400' : 'animate-hidden'}`}>
            <h2 className="section-title">Meet Our Expert Team</h2>
            <p className="section-subtitle">Passionate professionals dedicated to transforming agriculture</p>
          </div>

          <div className="team-grid">
            {teamMembers.map((member, index) => (
              <div 
                key={member.id}
                className={`team-card card-modern hover-lift ${animationStarted ? 'animate-fadeInUp' : 'animate-hidden'}`}
                style={{ animationDelay: `${1.5 + (index * 0.15)}s` }}
              >
                <div className="team-avatar">
                  <span className="avatar-emoji animate-pulse">{member.image}</span>
                  <div className="avatar-ring"></div>
                </div>
                
                <div className="team-info">
                  <h4 className="team-name">{member.name}</h4>
                  <p className="team-role">{member.role}</p>
                  <div className="team-expertise">
                    <span className="expertise-tag">{member.expertise}</span>
                    <span className="experience-tag">{member.experience}</span>
                  </div>
                  <p className="team-bio">{member.bio}</p>
                  
                  <div className="team-achievements">
                    {member.achievements.map((achievement, idx) => (
                      <span key={idx} className="achievement-badge">
                        {achievement}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="cta-section">
        <div className={`cta-content ${animationStarted ? 'animate-fadeInUp animate-delay-2000' : 'animate-hidden'}`}>
          <h2 className="cta-title">
            Ready to Transform Your Farming?
          </h2>
          <p className="cta-subtitle">
            Join thousands of farmers who are already using FarmAssist to grow better, smarter, and more sustainably.
          </p>
          <div className="cta-buttons">
            <a href="/signup" className="cta-btn primary btn-animated hover-glow">
              <span>🚀</span> Get Started Today
            </a>
            <a href="/contact" className="cta-btn secondary btn-animated hover-scale">
              <span>💬</span> Talk to Our Experts
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

export default About;
