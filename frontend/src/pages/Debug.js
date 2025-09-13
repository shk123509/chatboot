import React from 'react';
import './Debug.css';

function Debug({ user }) {
  const token = localStorage.getItem('token');
  const userData = localStorage.getItem('user');
  
  const debugData = [
    {
      label: 'Authentication Status',
      items: [
        { key: 'Token exists', value: !!token ? '✅ Yes' : '❌ No', status: !!token },
        { key: 'User data exists', value: !!userData ? '✅ Yes' : '❌ No', status: !!userData },
        { key: 'User prop passed', value: !!user ? '✅ Yes' : '❌ No', status: !!user },
      ]
    },
    {
      label: 'User Information',
      items: user ? [
        { key: 'User Name', value: user.name || 'N/A', status: true },
        { key: 'User Email', value: user.email || 'N/A', status: true },
        { key: 'User ID', value: user.id || user._id || 'N/A', status: true },
      ] : [
        { key: 'User Data', value: 'Not authenticated', status: false }
      ]
    },
    {
      label: 'Navigation & State',
      items: [
        { key: 'Current Path', value: window.location.pathname, status: true },
        { key: 'Local Storage Keys', value: Object.keys(localStorage).join(', ') || 'None', status: true },
        { key: 'Session Active', value: !!token && !!user ? '✅ Yes' : '❌ No', status: !!token && !!user },
      ]
    },
    {
      label: 'API Configuration',
      items: [
        { key: 'Base URL', value: process.env.REACT_APP_API_URL || 'http://localhost:5000', status: true },
        { key: 'Environment', value: process.env.NODE_ENV || 'development', status: true },
        { key: 'Build Time', value: new Date().toLocaleString(), status: true },
      ]
    }
  ];

  return (
    <div className="debug-page">
      <div className="debug-container">
        <div className="debug-header">
          <h1 className="debug-title">
            <span className="debug-icon">🐛</span>
            Debug Information
          </h1>
          <p className="debug-subtitle">
            System status and configuration details for developers
          </p>
        </div>

        <div className="debug-grid">
          {debugData.map((section, index) => (
            <div key={index} className="debug-section">
              <h3 className="section-title">{section.label}</h3>
              <div className="debug-items">
                {section.items.map((item, itemIndex) => (
                  <div key={itemIndex} className={`debug-item ${item.status ? 'success' : 'error'}`}>
                    <div className="debug-key">{item.key}</div>
                    <div className="debug-value">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="debug-actions">
          <button 
            onClick={() => window.location.reload()} 
            className="debug-btn refresh-btn"
          >
            🔄 Refresh Page
          </button>
          <button 
            onClick={() => localStorage.clear()} 
            className="debug-btn clear-btn"
          >
            🗑️ Clear Storage
          </button>
          <button 
            onClick={() => console.log({ user, token, userData })} 
            className="debug-btn log-btn"
          >
            📝 Log to Console
          </button>
        </div>

        <div className="debug-footer">
          <p>
            <strong>Note:</strong> This debug page is for development purposes only. 
            It should not be accessible in production.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Debug;