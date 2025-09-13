import React from 'react';

function DebugInfo({ user }) {
  const token = localStorage.getItem('token');
  const userData = localStorage.getItem('user');
  
  return (
    <div style={{
      position: 'fixed',
      top: '70px',
      right: '10px',
      background: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '15px',
      borderRadius: '8px',
      fontSize: '12px',
      maxWidth: '300px',
      zIndex: 9999,
      fontFamily: 'monospace'
    }}>
      <h4 style={{ margin: '0 0 10px 0', color: '#4caf50' }}>🐛 Debug Info</h4>
      <div><strong>Token exists:</strong> {!!token ? '✅' : '❌'}</div>
      <div><strong>User data exists:</strong> {!!userData ? '✅' : '❌'}</div>
      <div><strong>User prop:</strong> {!!user ? '✅' : '❌'}</div>
      {user && (
        <div>
          <strong>User name:</strong> {user.name || 'N/A'}
          <br />
          <strong>User email:</strong> {user.email || 'N/A'}
        </div>
      )}
      <div><strong>Current path:</strong> {window.location.pathname}</div>
    </div>
  );
}

export default DebugInfo;