import './App.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';

// Import pages and components
import Navbar from './components/Navbar';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import CropSearch from './pages/CropSearch';
import Debug from './pages/Debug';
import Settings from './pages/Settings';
import AdvancedChatbot from './pages/AdvancedChatbot';
import SimpleChatbot from './pages/SimpleChatbot';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in (has auth token)
    const token = localStorage.getItem('token'); // Changed from 'authToken' to 'token'
    const userData = localStorage.getItem('user');
    
    console.log('🐛 App Debug - Token from localStorage:', !!token);
    console.log('🐛 App Debug - UserData from localStorage:', !!userData);
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        console.log('🐛 App Debug - Parsed user:', parsedUser);
        setUser(parsedUser);
        // Set up axios defaults
        axios.defaults.headers.common['auth-token'] = token;
        axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    } else {
      console.log('🐛 App Debug - No token or user data found, user will be null');
    }
    setLoading(false);
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await axios.post('/api/auth/getuser');
      if (response.data) {
        setUser(response.data);
        localStorage.setItem('user', JSON.stringify(response.data));
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  const handleLogin = (userData, token) => {
    console.log('🐛 App Debug - handleLogin called with:', { userData, token: !!token });
    localStorage.setItem('token', token); // Changed from 'authToken' to 'token'
    localStorage.setItem('user', JSON.stringify(userData));
    axios.defaults.headers.common['auth-token'] = token;
    axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    setUser(userData);
    console.log('🐛 App Debug - User state updated to:', userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token'); // Changed from 'authToken' to 'token'
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['auth-token'];
    setUser(null);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading FarmAssist...</p>
      </div>
    );
  }

  return (
    <div className="App">
      <Navbar user={user} onLogout={handleLogout} />
      <main className="main-content">
        <Routes>
          <Route path="/" element={
            user ? <Home user={user} /> : <Navigate to="/about" />
          } />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={
            user ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />
          } />
          <Route path="/signup" element={
            user ? <Navigate to="/dashboard" /> : <Signup onLogin={handleLogin} />
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute user={user}>
              <Dashboard user={user} />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute user={user}>
              <Profile user={user} setUser={setUser} />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute user={user}>
              <Settings user={user} />
            </ProtectedRoute>
          } />
          <Route path="/chat" element={
            <ProtectedRoute user={user}>
              <Chat user={user} />
            </ProtectedRoute>
          } />
          <Route path="/advanced-chatbot" element={
            <ProtectedRoute user={user}>
              <AdvancedChatbot user={user} />
            </ProtectedRoute>
          } />
          <Route path="/simple-chatbot" element={
            <ProtectedRoute user={user}>
              <SimpleChatbot user={user} />
            </ProtectedRoute>
          } />
          <Route path="/crops" element={
            user ? <CropSearch /> : <Navigate to="/about" />
          } />
          <Route path="/debug" element={<Debug user={user} />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
