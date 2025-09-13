import { useState, useEffect } from 'react';
import axios from 'axios';
import './Profile.css';

function Profile({ user, setUser }) {
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [animationStarted, setAnimationStarted] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    farmingType: [],
    primaryCrops: [],
    farmSize: 0,
    experienceLevel: 'beginner',
    state: '',
    district: '',
    village: '',
    bio: '',
    language: 'english',
    emailNotifications: true,
    smsNotifications: false
  });

  useEffect(() => {
    setTimeout(() => setAnimationStarted(true), 100);
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.profile?.phone || '',
        farmingType: user.profile?.farmingType || [],
        primaryCrops: user.profile?.primaryCrops || [],
        farmSize: user.profile?.farmSize || 0,
        experienceLevel: user.profile?.experienceLevel || 'beginner',
        state: user.profile?.location?.state || '',
        district: user.profile?.location?.district || '',
        village: user.profile?.location?.village || '',
        bio: user.profile?.bio || '',
        language: user.preferences?.language || 'english',
        emailNotifications: user.preferences?.notifications?.email ?? true,
        smsNotifications: user.preferences?.notifications?.sms ?? false
      });
    }
  }, [user]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (status) setStatus('');
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setStatus('');
    setLoading(true);
    
    const payload = {
      name: formData.name,
      profile: {
        phone: formData.phone,
        farmingType: formData.farmingType,
        primaryCrops: formData.primaryCrops,
        farmSize: Number(formData.farmSize) || 0,
        experienceLevel: formData.experienceLevel,
        location: {
          state: formData.state,
          district: formData.district,
          village: formData.village,
        },
        bio: formData.bio
      },
      preferences: {
        language: formData.language,
        notifications: {
          email: formData.emailNotifications,
          sms: formData.smsNotifications
        }
      }
    };

    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/updateprofile`, payload, {
        headers: { 'auth-token': token }
      });
      
      if (res.data.success) {
        setUser(res.data.user);
        setStatus('Profile updated successfully! 🎉');
      }
    } catch (err) {
      console.error('Profile update error:', err);
      setStatus('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const farmingTypes = [
    { value: 'crop_farming', label: '🌾 Crop Farming', desc: 'Growing grains, vegetables, fruits' },
    { value: 'livestock', label: '🐄 Livestock', desc: 'Cattle, poultry, dairy farming' },
    { value: 'mixed_farming', label: '🌱 Mixed Farming', desc: 'Combination of crops and livestock' },
    { value: 'organic_farming', label: '🌿 Organic Farming', desc: 'Chemical-free, sustainable farming' },
    { value: 'commercial_farming', label: '🏭 Commercial Farming', desc: 'Large-scale production for market' }
  ];

  const commonCrops = [
    '🌾 Rice', '🌾 Wheat', '🌽 Corn', '🥔 Potato', '🧅 Onion', '🥕 Carrot',
    '🍅 Tomato', '🥒 Cucumber', '🌶️ Chili', '🥬 Cabbage', '🌿 Mint', '🌿 Coriander',
    '🍃 Sugarcane', '☕ Cotton', '🥜 Groundnut', '🌻 Sunflower', '🫘 Soybean', '🌿 Turmeric'
  ];

  const experienceLevels = [
    { value: 'beginner', label: '🌱 Beginner', desc: '0-2 years of farming experience' },
    { value: 'intermediate', label: '🌿 Intermediate', desc: '3-7 years of farming experience' },
    { value: 'experienced', label: '🌳 Experienced', desc: '8-15 years of farming experience' },
    { value: 'expert', label: '🏆 Expert', desc: '15+ years of farming experience' }
  ];

  const toggleCrop = (crop) => {
    const crops = formData.primaryCrops.includes(crop)
      ? formData.primaryCrops.filter(c => c !== crop)
      : [...formData.primaryCrops, crop];
    handleInputChange('primaryCrops', crops);
  };

  const toggleFarmingType = (type) => {
    const types = formData.farmingType.includes(type)
      ? formData.farmingType.filter(t => t !== type)
      : [...formData.farmingType, type];
    handleInputChange('farmingType', types);
  };

  return (
    <div className="profile-page">
      <div className="profile-background">
        <div className="profile-shapes">
          <div className="shape shape-1 animate-float"></div>
          <div className="shape shape-2 animate-float animate-delay-200"></div>
          <div className="shape shape-3 animate-float animate-delay-400"></div>
        </div>
      </div>

      <div className={`profile-container ${animationStarted ? 'animate-fadeInUp' : 'animate-hidden'}`}>
        {/* Header */}
        <div className={`profile-header ${animationStarted ? 'animate-fadeInDown animate-delay-200' : 'animate-hidden'}`}>
          <div className="profile-avatar-large">
            <span className="avatar-text">
              {user?.name ? user.name.charAt(0).toUpperCase() : '👤'}
            </span>
            <div className="online-badge">Active</div>
          </div>
          <div className="profile-info">
            <h1>{user?.name || 'Farmer Profile'}</h1>
            <p className="profile-email">{user?.email}</p>
            <div className="profile-badges">
              <span className="badge badge-primary">🌾 Farmer</span>
              <span className="badge badge-success">{formData.experienceLevel}</span>
              {formData.farmSize > 0 && (
                <span className="badge badge-info">{formData.farmSize} acres</span>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className={`profile-tabs ${animationStarted ? 'animate-fadeInUp animate-delay-300' : 'animate-hidden'}`}>
          <button 
            className={`tab-btn ${activeTab === 'personal' ? 'active' : ''}`}
            onClick={() => setActiveTab('personal')}
          >
            <span>👤</span> Personal Info
          </button>
          <button 
            className={`tab-btn ${activeTab === 'farming' ? 'active' : ''}`}
            onClick={() => setActiveTab('farming')}
          >
            <span>🌾</span> Farming Details
          </button>
          <button 
            className={`tab-btn ${activeTab === 'preferences' ? 'active' : ''}`}
            onClick={() => setActiveTab('preferences')}
          >
            <span>⚙️</span> Preferences
          </button>
        </div>

        {/* Form */}
        <form 
          onSubmit={onSubmit} 
          className={`profile-form ${animationStarted ? 'animate-fadeInUp animate-delay-400' : 'animate-hidden'}`}
        >
          {/* Personal Information Tab */}
          {activeTab === 'personal' && (
            <div className="tab-content">
              <h2>👤 Personal Information</h2>
              
              <div className="form-grid">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="form-input"
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="form-input"
                    placeholder="Enter your phone number"
                  />
                </div>

                <div className="form-group full-width">
                  <label>Location</label>
                  <div className="location-grid">
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      className="form-input"
                      placeholder="State"
                    />
                    <input
                      type="text"
                      value={formData.district}
                      onChange={(e) => handleInputChange('district', e.target.value)}
                      className="form-input"
                      placeholder="District"
                    />
                    <input
                      type="text"
                      value={formData.village}
                      onChange={(e) => handleInputChange('village', e.target.value)}
                      className="form-input"
                      placeholder="Village/City"
                    />
                  </div>
                </div>

                <div className="form-group full-width">
                  <label>About Yourself</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    className="form-textarea"
                    placeholder="Tell us about yourself and your farming journey..."
                    rows="4"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Farming Details Tab */}
          {activeTab === 'farming' && (
            <div className="tab-content">
              <h2>🌾 Farming Details</h2>
              
              <div className="form-group">
                <label>Experience Level</label>
                <div className="experience-grid">
                  {experienceLevels.map((level) => (
                    <div 
                      key={level.value}
                      className={`experience-card ${formData.experienceLevel === level.value ? 'selected' : ''}`}
                      onClick={() => handleInputChange('experienceLevel', level.value)}
                    >
                      <div className="experience-label">{level.label}</div>
                      <div className="experience-desc">{level.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Farm Size (in acres)</label>
                <input
                  type="number"
                  value={formData.farmSize}
                  onChange={(e) => handleInputChange('farmSize', e.target.value)}
                  className="form-input"
                  placeholder="Enter your farm size"
                  min="0"
                  step="0.1"
                />
              </div>

              <div className="form-group">
                <label>Farming Types</label>
                <div className="farming-types-grid">
                  {farmingTypes.map((type) => (
                    <div 
                      key={type.value}
                      className={`farming-type-card ${
                        formData.farmingType.includes(type.value) ? 'selected' : ''
                      }`}
                      onClick={() => toggleFarmingType(type.value)}
                    >
                      <div className="type-label">{type.label}</div>
                      <div className="type-desc">{type.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Primary Crops</label>
                <div className="crops-grid">
                  {commonCrops.map((crop) => (
                    <div 
                      key={crop}
                      className={`crop-chip ${
                        formData.primaryCrops.includes(crop) ? 'selected' : ''
                      }`}
                      onClick={() => toggleCrop(crop)}
                    >
                      {crop}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <div className="tab-content">
              <h2>⚙️ Preferences</h2>
              
              <div className="form-grid">
                <div className="form-group">
                  <label>Preferred Language</label>
                  <select
                    value={formData.language}
                    onChange={(e) => handleInputChange('language', e.target.value)}
                    className="form-select"
                  >
                    <option value="english">🇬🇧 English</option>
                    <option value="hindi">🇮🇳 हिंदी (Hindi)</option>
                    <option value="punjabi">🇮🇳 ਪੰਜਾਬੀ (Punjabi)</option>
                    <option value="urdu">🇵🇰 اردو (Urdu)</option>
                  </select>
                </div>

                <div className="form-group full-width">
                  <label>Notification Preferences</label>
                  <div className="notification-options">
                    <div className="notification-item">
                      <div className="notification-info">
                        <span className="notification-icon">📧</span>
                        <div>
                          <div className="notification-title">Email Notifications</div>
                          <div className="notification-desc">Receive updates via email</div>
                        </div>
                      </div>
                      <label className="toggle">
                        <input
                          type="checkbox"
                          checked={formData.emailNotifications}
                          onChange={(e) => handleInputChange('emailNotifications', e.target.checked)}
                        />
                        <span className="slider"></span>
                      </label>
                    </div>

                    <div className="notification-item">
                      <div className="notification-info">
                        <span className="notification-icon">📱</span>
                        <div>
                          <div className="notification-title">SMS Notifications</div>
                          <div className="notification-desc">Receive updates via SMS</div>
                        </div>
                      </div>
                      <label className="toggle">
                        <input
                          type="checkbox"
                          checked={formData.smsNotifications}
                          onChange={(e) => handleInputChange('smsNotifications', e.target.checked)}
                        />
                        <span className="slider"></span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Status and Submit */}
          {status && (
            <div className={`status-message ${status.includes('successfully') ? 'success' : 'error'}`}>
              {status}
            </div>
          )}

          <div className="form-actions">
            <button 
              type="submit" 
              disabled={loading}
              className="submit-btn"
            >
              {loading ? (
                <>
                  <div className="spinner"></div>
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <span>💾</span>
                  <span>Save Profile</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Profile;
