import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Signup.css';

function Signup({ onLogin }) {
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [animationStarted, setAnimationStarted] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [strengthScore, setStrengthScore] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationStarted(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const validateField = (name, value) => {
    const newErrors = { ...errors };
    
    switch (name) {
      case 'name':
        if (!value || value.trim().length < 3) {
          newErrors.name = 'Name must be at least 3 characters';
        } else {
          delete newErrors.name;
        }
        break;
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value || !emailRegex.test(value)) {
          newErrors.email = 'Please enter a valid email address';
        } else {
          delete newErrors.email;
        }
        break;
      case 'password':
        if (!value || value.length < 5) {
          newErrors.password = 'Password must be at least 5 characters';
        } else {
          delete newErrors.password;
        }
        // Check confirm password when password changes
        if (formData.confirmPassword && value !== formData.confirmPassword) {
          newErrors.confirmPassword = 'Passwords do not match';
        } else if (formData.confirmPassword && value === formData.confirmPassword) {
          delete newErrors.confirmPassword;
        }
        break;
      case 'confirmPassword':
        if (!value) {
          newErrors.confirmPassword = 'Please confirm your password';
        } else if (value !== formData.password) {
          newErrors.confirmPassword = 'Passwords do not match';
        } else {
          delete newErrors.confirmPassword;
        }
        break;
      default:
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculatePasswordStrength = (password) => {
    let score = 0;
    if (password.length >= 5) score += 1;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    return Math.min(score, 3);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'password') {
      setStrengthScore(calculatePasswordStrength(value));
    }
    
    // Add typing indicator
    setIsTyping(true);
    setTimeout(() => setIsTyping(false), 500);
    
    validateField(name, value);
  };

  const nextStep = () => {
    if (currentStep === 1 && formData.name && formData.email && !errors.name && !errors.email) {
      setCurrentStep(2);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    
    // Clear previous errors
    setErrors({});
    
    // Final validation for required fields
    const requiredFields = ['name', 'email', 'password', 'confirmPassword'];
    let validationErrors = {};
    let isValid = true;
    
    // Check if all required fields are filled and valid
    requiredFields.forEach(field => {
      if (!formData[field] || formData[field].trim() === '') {
        validationErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
        isValid = false;
      } else {
        // Run field validation
        const fieldValid = validateField(field, formData[field]);
        if (!fieldValid) {
          isValid = false;
        }
      }
    });
    
    // Specific validation checks
    if (formData.name && formData.name.trim().length < 3) {
      validationErrors.name = 'Name must be at least 3 characters';
      isValid = false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      validationErrors.email = 'Please enter a valid email address';
      isValid = false;
    }
    
    if (formData.password && formData.password.length < 5) {
      validationErrors.password = 'Password must be at least 5 characters';
      isValid = false;
    }
    
    if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) {
      validationErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }
    
    if (!isValid) {
      setErrors(validationErrors);
      console.log('Validation failed:', validationErrors);
      return;
    }
    
    setLoading(true);
    
    try {
      console.log('Submitting signup data:', {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: '***hidden***'
      });
      
      const res = await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/createuser`, {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password
      });
      
      console.log('Signup response:', res.data);
      
      if (res.data.success) {
        setSuccess(true);
        setTimeout(() => {
          // Store token and user data
          localStorage.setItem('token', res.data.authtoken);
          localStorage.setItem('user', JSON.stringify(res.data.user));
          
          // Call onLogin with proper user data
          onLogin(res.data.user, res.data.authtoken);
        }, 2000);
      } else {
        setErrors({ general: res.data.message || 'Signup failed' });
      }
    } catch (err) {
      console.error('Signup error:', err);
      if (err.response && err.response.data) {
        console.log('Error response:', err.response.data);
        if (err.response.data.errors && Array.isArray(err.response.data.errors)) {
          // Handle validation errors from backend
          const backendErrors = {};
          err.response.data.errors.forEach(error => {
            if (error.path) {
              backendErrors[error.path] = error.msg;
            }
          });
          setErrors({ ...backendErrors, general: err.response.data.message });
        } else {
          setErrors({ general: err.response.data.message || 'Signup failed. Please try again.' });
        }
      } else {
        setErrors({ general: 'Network error. Please check your connection and try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="signup-page">
        <div className="signup-background">
          <div className="signup-shapes">
            <div className="shape shape-1 animate-float"></div>
            <div className="shape shape-2 animate-float animate-delay-200"></div>
            <div className="shape shape-3 animate-float animate-delay-400"></div>
          </div>
        </div>
        
        <div className="signup-container animate-scaleIn">
          <div className="success-card card-modern">
            <div className="success-icon animate-bounce">
              <span>✨</span>
            </div>
            <h1 className="success-title text-gradient">🎉 Welcome to FarmAssist!</h1>
            <p className="success-message">Your account has been created successfully! We're excited to have you on board.</p>
            <div className="success-loader animate-pulse">
              <div className="spinner-modern"></div>
              <span>Setting up your dashboard...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="signup-page">
      <div className="signup-background">
        <div className="signup-shapes">
          <div className="shape shape-1 animate-float"></div>
          <div className="shape shape-2 animate-float animate-delay-200"></div>
          <div className="shape shape-3 animate-float animate-delay-400"></div>
        </div>
      </div>
      
      <div className={`signup-container ${animationStarted ? 'animate-fadeInUp' : 'animate-hidden'}`}>
        <div className="signup-card card-modern">
          <div className={`signup-header ${animationStarted ? 'animate-fadeInDown animate-delay-200' : 'animate-hidden'}`}>
            <div className="signup-icon animate-bounce">
              <span>{currentStep === 1 ? '👋' : '🔒'}</span>
            </div>
            <h1 className="signup-title text-gradient">Join FarmAssist</h1>
            <p className="signup-subtitle">Start your smart farming journey today</p>
            
            <div className="step-indicator">
              <div className={`step ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
                <span>{currentStep > 1 ? '✓' : '1'}</span>
                <label>Basic Info</label>
              </div>
              <div className="step-line"></div>
              <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>
                <span>2</span>
                <label>Security</label>
              </div>
            </div>
          </div>

          <form onSubmit={onSubmit} className={`signup-form ${animationStarted ? 'animate-fadeInUp animate-delay-300' : 'animate-hidden'}`}>
            {currentStep === 1 && (
              <div className="form-step animate-slideInRight">
                <div className="input-group">
                  <div className={`input-wrapper ${focusedField === 'name' ? 'focused' : ''} ${formData.name ? 'has-value' : ''} ${errors.name ? 'error' : ''}`}>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      onFocus={() => setFocusedField('name')}
                      onBlur={() => setFocusedField(null)}
                      className="input-field input-focus transition-all"
                      required
                    />
                    <label className="input-label transition-all">👤 Full Name</label>
                    <div className="input-underline"></div>
                  </div>
                  {errors.name && <div className="field-error animate-fadeInLeft">{errors.name}</div>}
                </div>

                <div className="input-group">
                  <div className={`input-wrapper ${focusedField === 'email' ? 'focused' : ''} ${formData.email ? 'has-value' : ''} ${errors.email ? 'error' : ''}`}>
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
                  {errors.email && <div className="field-error animate-fadeInLeft">{errors.email}</div>}
                </div>

                <button 
                  type="button"
                  onClick={nextStep}
                  disabled={!formData.name || !formData.email || errors.name || errors.email}
                  className="step-btn btn-animated hover-glow transition-all"
                >
                  <span>➡️</span>
                  Continue
                </button>
              </div>
            )}

            {currentStep === 2 && (
              <div className="form-step animate-slideInLeft">
                <div className="input-group">
                  <div className={`input-wrapper ${focusedField === 'password' ? 'focused' : ''} ${formData.password ? 'has-value' : ''} ${errors.password ? 'error' : ''}`}>
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
                  {errors.password && <div className="field-error animate-fadeInLeft">{errors.password}</div>}
                  <div className="password-strength">
                    <div className="strength-indicators">
                      <div className={`strength-bar ${strengthScore >= 1 ? 'active' : ''}`}></div>
                      <div className={`strength-bar ${strengthScore >= 2 ? 'active' : ''}`}></div>
                      <div className={`strength-bar ${strengthScore >= 3 ? 'active' : ''}`}></div>
                    </div>
                    <span className="strength-text">
                      {formData.password.length === 0 ? 'Enter password' :
                       strengthScore === 1 ? 'Weak' :
                       strengthScore === 2 ? 'Good' :
                       strengthScore >= 3 ? 'Strong' : 'Too short'}
                    </span>
                  </div>
                </div>

                <div className="input-group">
                  <div className={`input-wrapper ${focusedField === 'confirmPassword' ? 'focused' : ''} ${formData.confirmPassword ? 'has-value' : ''} ${errors.confirmPassword ? 'error' : ''}`}>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      onFocus={() => setFocusedField('confirmPassword')}
                      onBlur={() => setFocusedField(null)}
                      className="input-field input-focus transition-all"
                      required
                    />
                    <label className="input-label transition-all">🔍 Confirm Password</label>
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      tabIndex="-1"
                    >
                      {showConfirmPassword ? '🙈' : '👁️'}
                    </button>
                    <div className="input-underline"></div>
                  </div>
                  {errors.confirmPassword && <div className="field-error animate-fadeInLeft">{errors.confirmPassword}</div>}
                  {formData.confirmPassword && (
                    <div className="password-match">
                      {formData.password === formData.confirmPassword ? (
                        <span className="match-success">✅ Passwords match</span>
                      ) : (
                        <span className="match-error">❌ Passwords don't match</span>
                      )}
                    </div>
                  )}
                </div>

                {errors.general && (
                  <div className="error-message animate-fadeInLeft">
                    <span>⚠️</span>
                    {errors.general}
                  </div>
                )}

                <div className="step-buttons">
                  <button 
                    type="button"
                    onClick={prevStep}
                    className="back-btn btn-animated hover-scale transition-all"
                  >
                    <span>⬅️</span>
                    Back
                  </button>
                  
                  <button 
                    type="submit" 
                    disabled={loading || !formData.password || !formData.confirmPassword || Object.keys(errors).length > 0}
                    className="signup-btn btn-animated hover-glow transition-all"
                  >
                    {loading ? (
                      <>
                        <div className="spinner-modern"></div>
                        <span className="loading-dots">Creating Account</span>
                      </>
                    ) : (
                      <>
                        <span>✨</span>
                        Create Account
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>

          <div className={`signup-footer ${animationStarted ? 'animate-fadeInUp animate-delay-500' : 'animate-hidden'}`}>
            <div className="divider">
              <span>Already have an account?</span>
            </div>
            
            <Link 
              to="/login" 
              className="login-link btn-animated hover-scale transition-all"
            >
              <span>🔑</span>
              Sign In
            </Link>

            <div className="terms">
              <p>By creating an account, you agree to our Terms of Service and Privacy Policy</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;
