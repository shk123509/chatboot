import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Login.css';

function Login({ onLogin }) {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [animationStarted, setAnimationStarted] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationStarted(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    
    setError('');
    setLoading(true);
    
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/login`, formData);
      if (res.data.success) {
        // Store token and user data
        localStorage.setItem('token', res.data.authtoken);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        
        // Call onLogin with user data and token
        onLogin(res.data.user, res.data.authtoken);
      } else {
        setError(res.data.message || 'Invalid credentials');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-background">
        <div className="login-shapes">
          <div className="shape shape-1 animate-float"></div>
          <div className="shape shape-2 animate-float animate-delay-200"></div>
          <div className="shape shape-3 animate-float animate-delay-400"></div>
        </div>
      </div>
      
      <div className={`login-container ${animationStarted ? 'animate-fadeInUp' : 'animate-hidden'}`}>
        <div className="login-card card-modern">
          <div className={`login-header ${animationStarted ? 'animate-fadeInDown animate-delay-200' : 'animate-hidden'}`}>
            <div className="login-icon animate-bounce">
              <span>🔐</span>
            </div>
            <h1 className="login-title text-gradient">Welcome Back!</h1>
            <p className="login-subtitle">Sign in to continue to FarmAssist</p>
          </div>

          <form onSubmit={onSubmit} className={`login-form ${animationStarted ? 'animate-fadeInUp animate-delay-300' : 'animate-hidden'}`}>
            <div className="input-group">
              <div className={`input-wrapper ${focusedField === 'email' ? 'focused' : ''} ${formData.email ? 'has-value' : ''}`}>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  className="input-field input-focus transition-all"
                  required
                />
                <label className="input-label transition-all">📧 Email Address</label>
                <div className="input-underline"></div>
              </div>
            </div>

            <div className="input-group">
              <div className={`input-wrapper ${focusedField === 'password' ? 'focused' : ''} ${formData.password ? 'has-value' : ''}`}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  className="input-field input-focus transition-all"
                  required
                />
                <label className="input-label transition-all">🔒 Password</label>
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex="-1"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
                <div className="input-underline"></div>
              </div>
            </div>

            {error && (
              <div className="error-message animate-fadeInLeft">
                <span>⚠️</span>
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading || !formData.email || !formData.password}
              className="login-btn btn-animated hover-glow transition-all"
            >
              {loading ? (
                <>
                  <div className="spinner-modern"></div>
                  <span className="loading-dots">Signing In</span>
                </>
              ) : (
                <>
                  <span>✨</span>
                  Sign In
                </>
              )}
            </button>
          </form>

          <div className={`login-footer ${animationStarted ? 'animate-fadeInUp animate-delay-500' : 'animate-hidden'}`}>
            <div className="divider">
              <span>New to FarmAssist?</span>
            </div>
            
            <Link 
              to="/signup" 
              className="signup-link btn-animated hover-scale transition-all"
            >
              <span>🚀</span>
              Create Account
            </Link>

            <div className="social-login">
              <p>Quick Login Options</p>
              <div className="social-buttons">
                <button className="social-btn google-btn hover-lift transition-all">
                  <span>📱</span>
                  Demo Login
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
