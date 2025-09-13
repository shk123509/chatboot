import React, { useState } from 'react';
import axios from 'axios';
import './ForgotPassword.css';

function ForgotPassword({ onBack }) {
  const [step, setStep] = useState('request'); // 'request', 'verify', 'reset', 'success'
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [passwordStrength, setPasswordStrength] = useState(0);

  const calculatePasswordStrength = (password) => {
    let score = 0;
    if (password.length >= 5) score += 1;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    return Math.min(score, 3);
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setNewPassword(value);
    setPasswordStrength(calculatePasswordStrength(value));
  };

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/forgot-password`,
        { email }
      );

      if (response.data.success) {
        setStep('verify');
        setMessage({ 
          type: 'success', 
          text: 'Password reset code sent to your email! Please check your inbox.' 
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to send reset code. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/verify-reset-code`,
        { email, code: verificationCode }
      );

      if (response.data.success) {
        setStep('reset');
        setMessage({ 
          type: 'success', 
          text: 'Code verified! Now create your new password.' 
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Invalid verification code. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      setLoading(false);
      return;
    }

    if (newPassword.length < 5) {
      setMessage({ type: 'error', text: 'Password must be at least 5 characters long' });
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/reset-password`,
        { 
          email, 
          code: verificationCode, 
          newPassword 
        }
      );

      if (response.data.success) {
        setStep('success');
        setMessage({ 
          type: 'success', 
          text: 'Password reset successfully! You can now login with your new password.' 
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to reset password. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/forgot-password`,
        { email }
      );

      if (response.data.success) {
        setMessage({ 
          type: 'success', 
          text: 'New verification code sent to your email!' 
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to resend code. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <div className="forgot-password-header">
          <button className="back-button" onClick={onBack}>
            ← Back to Settings
          </button>
          <h2 className="forgot-password-title">
            {step === 'request' && '🔑 Reset Password'}
            {step === 'verify' && '📧 Verify Code'}
            {step === 'reset' && '🆕 New Password'}
            {step === 'success' && '✅ Success'}
          </h2>
        </div>

        {message.text && (
          <div className={`message ${message.type}`}>
            <span className="message-icon">
              {message.type === 'success' ? '✅' : '❌'}
            </span>
            {message.text}
          </div>
        )}

        {step === 'request' && (
          <form onSubmit={handleRequestReset} className="forgot-password-form">
            <div className="step-info">
              <h3>Enter your email address</h3>
              <p>We'll send you a verification code to reset your password</p>
            </div>
            
            <div className="form-group">
              <label className="form-label">
                <span className="label-text">📧 Email Address</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input"
                  placeholder="Enter your registered email"
                  required
                />
              </label>
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? '⏳ Sending...' : '📤 Send Reset Code'}
            </button>
          </form>
        )}

        {step === 'verify' && (
          <form onSubmit={handleVerifyCode} className="forgot-password-form">
            <div className="step-info">
              <h3>Enter verification code</h3>
              <p>Check your email ({email}) for the 6-digit verification code</p>
            </div>
            
            <div className="form-group">
              <label className="form-label">
                <span className="label-text">🔢 Verification Code</span>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="form-input verification-input"
                  placeholder="Enter 6-digit code"
                  maxLength="6"
                  required
                />
              </label>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? '⏳ Verifying...' : '✅ Verify Code'}
              </button>
              
              <button 
                type="button" 
                className="btn-secondary" 
                onClick={handleResendCode}
                disabled={loading}
              >
                📤 Resend Code
              </button>
            </div>
          </form>
        )}

        {step === 'reset' && (
          <form onSubmit={handleResetPassword} className="forgot-password-form">
            <div className="step-info">
              <h3>Create new password</h3>
              <p>Choose a strong password for your account</p>
            </div>
            
            <div className="form-group">
              <label className="form-label">
                <span className="label-text">🆕 New Password</span>
                <input
                  type="password"
                  value={newPassword}
                  onChange={handlePasswordChange}
                  className="form-input"
                  placeholder="Enter new password (min 5 characters)"
                  required
                />
              </label>
              
              {newPassword && (
                <div className="password-strength">
                  <div className="strength-bars">
                    <div className={`strength-bar ${passwordStrength >= 1 ? 'active' : ''}`}></div>
                    <div className={`strength-bar ${passwordStrength >= 2 ? 'active' : ''}`}></div>
                    <div className={`strength-bar ${passwordStrength >= 3 ? 'active' : ''}`}></div>
                  </div>
                  <span className="strength-text">
                    {passwordStrength === 1 ? 'Weak' : passwordStrength === 2 ? 'Good' : passwordStrength >= 3 ? 'Strong' : 'Too Short'}
                  </span>
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">
                <span className="label-text">✅ Confirm Password</span>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="form-input"
                  placeholder="Confirm your new password"
                  required
                />
              </label>
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? '⏳ Resetting...' : '🔄 Reset Password'}
            </button>
          </form>
        )}

        {step === 'success' && (
          <div className="success-content">
            <div className="success-icon">🎉</div>
            <h3>Password Reset Successful!</h3>
            <p>Your password has been successfully reset. You can now login with your new password.</p>
            
            <div className="success-actions">
              <button 
                className="btn-primary" 
                onClick={() => window.location.href = '/login'}
              >
                🔑 Go to Login
              </button>
              <button className="btn-secondary" onClick={onBack}>
                ⚙️ Back to Settings
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;