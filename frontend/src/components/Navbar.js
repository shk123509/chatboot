import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import './Navbar.css';

function Navbar({ user, onLogout }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const profileRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // Debug: Log user state
  useEffect(() => {
    console.log('🐛 Navbar Debug - User state:', user);
    console.log('🐛 Navbar Debug - User exists:', !!user);
    console.log('🐛 Navbar Debug - Current path:', location.pathname);
  }, [user, location.pathname]);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsProfileOpen(false);
  }, [location]);

  const toggleProfile = () => setIsProfileOpen(!isProfileOpen);
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const handleLogout = () => {
    setIsProfileOpen(false);
    onLogout();
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={`navbar ${isScrolled ? 'navbar-scrolled' : ''}`}>
      <div className="nav-container">
        {/* Logo */}
        <Link to="/" className="nav-logo animate-pulse">
          <span className="logo-icon">🌾</span>
          <span className="logo-text">
            <span className="logo-primary">Farm</span>
            <span className="logo-secondary">Assist</span>
          </span>
        </Link>

        {/* Left Navigation */}
        <ul className="nav-menu nav-left">
          {user && (
            <li className="nav-item">
              <Link 
                to="/" 
                className={`nav-link ${isActive('/') ? 'active' : ''}`}
              >
                <span className="nav-icon">🏠</span>
                <span>Home</span>
              </Link>
            </li>
          )}
          <li className="nav-item">
            <Link 
              to="/about" 
              className={`nav-link ${isActive('/about') ? 'active' : ''}`}
            >
              <span className="nav-icon">ℹ️</span>
              <span>About</span>
            </Link>
          </li>
          <li className="nav-item">
            <Link 
              to="/contact" 
              className={`nav-link ${isActive('/contact') ? 'active' : ''}`}
            >
              <span className="nav-icon">📞</span>
              <span>Contact</span>
            </Link>
          </li>
          {user && (
            <li className="nav-item">
              <Link 
                to="/crops" 
                className={`nav-link ${isActive('/crops') ? 'active' : ''}`}
              >
                <span className="nav-icon">🌱</span>
                <span>Crops</span>
              </Link>
            </li>
          )}
        </ul>

        {/* Right Navigation */}
        <ul className="nav-menu nav-right">
          {user ? (
            <>
              <li className="nav-item">
                <Link 
                  to="/dashboard" 
                  className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
                >
                  <span className="nav-icon">📊</span>
                  <span>Dashboard</span>
                </Link>
              </li>
              <li className="nav-item">
                <Link 
                  to="/chat" 
                  className={`nav-link ${isActive('/chat') ? 'active' : ''}`}
                >
                  <span className="nav-icon">💬</span>
                  <span>Chat</span>
                </Link>
              </li>
              
              {/* Profile Dropdown */}
              <li className="nav-item profile-dropdown" ref={profileRef}>
                <button 
                  className="profile-toggle" 
                  onClick={toggleProfile}
                  aria-expanded={isProfileOpen}
                >
                  <div className="profile-avatar">
                    <span className="avatar-text">
                      {user.name ? user.name.charAt(0).toUpperCase() : '👤'}
                    </span>
                    <div className="online-indicator"></div>
                  </div>
                  <div className="profile-info">
                    <span className="profile-name">{user.name}</span>
                    <span className="profile-role">Farmer</span>
                  </div>
                  <span className={`dropdown-arrow ${isProfileOpen ? 'open' : ''}`}>▼</span>
                </button>
                
                <div className={`profile-menu ${isProfileOpen ? 'show' : ''}`}>
                  <div className="profile-header">
                    <div className="profile-avatar large">
                      <span className="avatar-text">
                        {user.name ? user.name.charAt(0).toUpperCase() : '👤'}
                      </span>
                    </div>
                    <div className="profile-details">
                      <h4>{user.name}</h4>
                      <p>{user.email}</p>
                      <span className="badge">Active Farmer</span>
                    </div>
                  </div>
                  
                  <div className="profile-links">
                    <Link to="/profile" className="profile-link">
                      <span className="link-icon">👤</span>
                      <span>My Profile</span>
                    </Link>
                    <Link to="/dashboard" className="profile-link">
                      <span className="link-icon">📊</span>
                      <span>Dashboard</span>
                    </Link>
                    <Link to="/settings" className="profile-link">
                      <span className="link-icon">⚙️</span>
                      <span>Settings</span>
                    </Link>
                    <div className="profile-divider"></div>
                    <button onClick={handleLogout} className="profile-link logout">
                      <span className="link-icon">🚪</span>
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </li>
            </>
          ) : (
            <>
              <li className="nav-item">
                <Link to="/login" className="nav-link login-btn">
                  <span className="nav-icon">🔑</span>
                  <span>Login</span>
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/signup" className="nav-link signup-btn">
                  <span className="nav-icon">🚀</span>
                  <span>Sign Up</span>
                </Link>
              </li>
            </>
          )}
        </ul>

        {/* Mobile Menu Button */}
        <button 
          className={`mobile-menu-btn ${isMobileMenuOpen ? 'open' : ''}`}
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Mobile Menu */}
        <div 
          ref={mobileMenuRef}
          className={`mobile-menu ${isMobileMenuOpen ? 'show' : ''}`}
        >
          <div className="mobile-menu-header">
            {user ? (
              <div className="mobile-user-info">
                <div className="profile-avatar">
                  <span className="avatar-text">
                    {user.name ? user.name.charAt(0).toUpperCase() : '👤'}
                  </span>
                </div>
                <div>
                  <h4>{user.name}</h4>
                  <p>{user.email}</p>
                </div>
              </div>
            ) : (
              <div className="mobile-guest-info">
                <h4>Welcome to FarmAssist</h4>
                <p>Please login to access all features</p>
              </div>
            )}
          </div>
          
          <ul className="mobile-nav-links">
            {user && <li><Link to="/" className={isActive('/') ? 'active' : ''}><span>🏠</span> Home</Link></li>}
            {user && <li><Link to="/crops" className={isActive('/crops') ? 'active' : ''}><span>🌱</span> Crops</Link></li>}
            <li><Link to="/about" className={isActive('/about') ? 'active' : ''}><span>ℹ️</span> About</Link></li>
            <li><Link to="/contact" className={isActive('/contact') ? 'active' : ''}><span>📞</span> Contact</Link></li>
            
            {user ? (
              <>
                <li><Link to="/dashboard" className={isActive('/dashboard') ? 'active' : ''}><span>📊</span> Dashboard</Link></li>
                <li><Link to="/chat" className={isActive('/chat') ? 'active' : ''}><span>💬</span> Chat</Link></li>
                <li><Link to="/profile" className={isActive('/profile') ? 'active' : ''}><span>👤</span> Profile</Link></li>
                <li><Link to="/settings" className={isActive('/settings') ? 'active' : ''}><span>⚙️</span> Settings</Link></li>
                <li className="mobile-divider"></li>
                <li><button onClick={handleLogout} className="mobile-logout"><span>🚪</span> Sign Out</button></li>
              </>
            ) : (
              <>
                <li><Link to="/login" className="mobile-login"><span>🔑</span> Login</Link></li>
                <li><Link to="/signup" className="mobile-signup"><span>🚀</span> Sign Up</Link></li>
              </>
            )}
          </ul>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && <div className="mobile-menu-overlay" onClick={() => setIsMobileMenuOpen(false)}></div>}
      </div>
    </nav>
  );
}

export default Navbar;