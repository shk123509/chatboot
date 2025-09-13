import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ForgotPassword from '../components/ForgotPassword';
import './Settings.css';

function Settings({ user }) {
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.profile?.phone || '',
    bio: user?.profile?.bio || '',
    farmSize: user?.profile?.farmSize || '',
    location: {
      state: user?.profile?.location?.state || '',
      district: user?.profile?.location?.district || '',
      village: user?.profile?.location?.village || ''
    },
    preferences: {
      language: user?.preferences?.language || 'english',
      notifications: {
        email: user?.preferences?.notifications?.email || true,
        sms: user?.preferences?.notifications?.sms || false
      }
    }
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [passwordStrength, setPasswordStrength] = useState(0);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.profile?.phone || '',
        bio: user.profile?.bio || '',
        farmSize: user.profile?.farmSize || '',
        location: {
          state: user.profile?.location?.state || '',
          district: user.profile?.location?.district || '',
          village: user.profile?.location?.village || ''
        },
        preferences: {
          language: user.preferences?.language || 'english',
          notifications: {
            email: user.preferences?.notifications?.email || true,
            sms: user.preferences?.notifications?.sms || false
          }
        }
      });
    }
  }, [user]);

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
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('location.')) {
      const locationField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          [locationField]: value
        }
      }));
    } else if (name.startsWith('preferences.notifications.')) {
      const notificationField = name.split('.')[2];
      setFormData(prev => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          notifications: {
            ...prev.preferences.notifications,
            [notificationField]: checked
          }
        }
      }));
    } else if (name.startsWith('preferences.')) {
      const prefField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          [prefField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'newPassword') {
      setPasswordStrength(calculatePasswordStrength(value));
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/updateprofile`,
        {
          name: formData.name,
          profile: {
            phone: formData.phone,
            bio: formData.bio,
            farmSize: parseInt(formData.farmSize) || 0,
            location: formData.location
          },
          preferences: formData.preferences
        },
        {
          headers: { 'auth-token': token }
        }
      );

      if (response.data.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        // Update user data in localStorage
        const updatedUser = response.data.user;
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        // Trigger a page refresh to update user state
        setTimeout(() => window.location.reload(), 1500);
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Failed to update profile' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      setLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 5) {
      setMessage({ type: 'error', text: 'Password must be at least 5 characters long' });
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/changepassword`,
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        },
        {
          headers: { 'auth-token': token }
        }
      );

      if (response.data.success) {
        setMessage({ type: 'success', text: 'Password updated successfully!' });
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setPasswordStrength(0);
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Failed to update password' 
      });
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: '👤 Profile', icon: '👤' },
    { id: 'password', label: '🔒 Security', icon: '🔒' },
    { id: 'preferences', label: '⚙️ Preferences', icon: '⚙️' },
    { id: 'farm', label: '🚜 Farm Details', icon: '🚜' }
  ];

  return (
    <div className="settings-page">
      <div className="settings-container">
        <div className="settings-header">
          <h1 className="settings-title">⚙️ Account Settings</h1>
          <p className="settings-subtitle">Manage your profile, security, and preferences</p>
        </div>

        {message.text && (
          <div className={`message ${message.type}`}>
            <span className="message-icon">
              {message.type === 'success' ? '✅' : '❌'}
            </span>
            {message.text}
          </div>
        )}

        <div className="settings-content">
          <div className="settings-sidebar">
            <div className="settings-tabs">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <span className="tab-icon">{tab.icon}</span>
                  <span className="tab-label">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="settings-main">
            {activeTab === 'profile' && (
              <div className="settings-section">
                <h2 className="section-title">👤 Profile Information</h2>
                <form onSubmit={handleProfileUpdate} className="settings-form">
                  <div className="form-group">
                    <label className="form-label">
                      <span className="label-text">👤 Full Name</span>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="form-input"
                        required
                      />
                    </label>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <span className="label-text">📧 Email Address</span>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        className="form-input"
                        disabled
                        title="Email cannot be changed"
                      />
                    </label>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <span className="label-text">📱 Phone Number</span>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="Enter your phone number"
                      />
                    </label>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <span className="label-text">📝 Bio</span>
                      <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        className="form-textarea"
                        placeholder="Tell us about yourself and your farming experience..."
                        rows="4"
                      />
                    </label>
                  </div>

                  <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? '⏳ Updating...' : '💾 Save Changes'}
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'password' && (
              <div className="settings-section">
                <h2 className="section-title">🔒 Password & Security</h2>
                
                <form onSubmit={handlePasswordUpdate} className="settings-form">
                  <div className="form-group">
                    <label className="form-label">
                      <span className="label-text">🔐 Current Password</span>
                      <input
                        type="password"
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        className="form-input"
                        required
                        placeholder="Enter your current password"
                      />
                    </label>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <span className="label-text">🆕 New Password</span>
                      <input
                        type="password"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        className="form-input"
                        required
                        placeholder="Enter new password (min 5 characters)"
                      />
                    </label>
                    
                    {passwordData.newPassword && (
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
                      <span className="label-text">✅ Confirm New Password</span>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        className="form-input"
                        required
                        placeholder="Confirm your new password"
                      />
                    </label>
                  </div>

                  <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? '⏳ Updating...' : '🔄 Change Password'}
                  </button>
                </form>

                <div className="forgot-password-section">
                  <h3>🤔 Forgot Your Password?</h3>
                  <p>If you can't remember your current password, you can reset it using your email.</p>
                  <button 
                    type="button" 
                    className="btn-secondary"
                    onClick={() => setActiveTab('forgot-password')}
                  >
                    🔑 Reset Password
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'preferences' && (
              <div className="settings-section">
                <h2 className="section-title">⚙️ Preferences</h2>
                
                <form onSubmit={handleProfileUpdate} className="settings-form">
                  <div className="form-group">
                    <label className="form-label">
                      <span className="label-text">🌍 Language</span>
                      <select
                        name="preferences.language"
                        value={formData.preferences.language}
                        onChange={handleInputChange}
                        className="form-select"
                      >
                        <option value="english">English</option>
                        <option value="hindi">हिंदी (Hindi)</option>
                        <option value="punjabi">ਪੰਜਾਬੀ (Punjabi)</option>
                        <option value="urdu">اردو (Urdu)</option>
                      </select>
                    </label>
                  </div>

                  <div className="form-group">
                    <span className="label-text">🔔 Notification Preferences</span>
                    <div className="checkbox-group">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          name="preferences.notifications.email"
                          checked={formData.preferences.notifications.email}
                          onChange={handleInputChange}
                          className="checkbox-input"
                        />
                        <span className="checkbox-custom"></span>
                        <span className="checkbox-text">📧 Email Notifications</span>
                      </label>
                      
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          name="preferences.notifications.sms"
                          checked={formData.preferences.notifications.sms}
                          onChange={handleInputChange}
                          className="checkbox-input"
                        />
                        <span className="checkbox-custom"></span>
                        <span className="checkbox-text">📱 SMS Notifications</span>
                      </label>
                    </div>
                  </div>

                  <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? '⏳ Saving...' : '💾 Save Preferences'}
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'forgot-password' && (
              <ForgotPassword onBack={() => setActiveTab('password')} />
            )}

            {activeTab === 'farm' && (
              <div className="settings-section">
                <h2 className="section-title">🚜 Farm Details</h2>
                
                <form onSubmit={handleProfileUpdate} className="settings-form">
                  <div className="form-group">
                    <label className="form-label">
                      <span className="label-text">📏 Farm Size (in acres)</span>
                      <input
                        type="number"
                        name="farmSize"
                        value={formData.farmSize}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="Enter farm size in acres"
                        min="0"
                        step="0.1"
                      />
                    </label>
                  </div>

                  <div className="location-group">
                    <span className="label-text">📍 Farm Location</span>
                    <div className="location-inputs">
                      <input
                        type="text"
                        name="location.state"
                        value={formData.location.state}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="State"
                      />
                      <input
                        type="text"
                        name="location.district"
                        value={formData.location.district}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="District"
                      />
                      <input
                        type="text"
                        name="location.village"
                        value={formData.location.village}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="Village/City"
                      />
                    </div>
                  </div>

                  <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? '⏳ Updating...' : '💾 Save Farm Details'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;