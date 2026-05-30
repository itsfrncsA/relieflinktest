import React, { useState, useEffect } from 'react';
import './App.css';
import './index.css';
import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import AdminRegister from './pages/AdminRegister/AdminRegister';
import Dashboard from './pages/Dashboard/Dashboard';

function App() {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      const savedToken = localStorage.getItem('token');
      if (!savedUser || savedUser === 'undefined' || !savedToken) {
        return null;
      }
      return JSON.parse(savedUser);
    } catch (error) {
      console.error('Error loading user from localStorage:', error);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      return null;
    }
  });

  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showAdminRegister, setShowAdminRegister] = useState(false);

  useEffect(() => {
    if (window.location.pathname === '/admin-login') {
      setShowAdminLogin(true);
    } else if (window.location.pathname === '/admin-register') {
      setShowAdminRegister(true);
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    setShowLogin(false);
    setShowRegister(false);
    setShowAdminLogin(false);
    setShowAdminRegister(false);
    window.history.pushState({}, '', '/');
  };

  const handleRegister = (userData) => {
    setUser(userData);
    setShowLogin(false);
    setShowRegister(false);
    setShowAdminLogin(false);
    setShowAdminRegister(false);
    window.history.pushState({}, '', '/');
  };

  const handleBackToHome = () => {
    setShowLogin(false);
    setShowRegister(false);
    setShowAdminLogin(false);
    setShowAdminRegister(false);
    window.history.pushState({}, '', '/');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <div className="app-container">
      {!user ? (
        showAdminLogin ? (
          <Login
            onLogin={handleLogin}
            onBack={handleBackToHome}
          />
        ) : showAdminRegister ? (
          <AdminRegister
            onRegister={handleRegister}
            onBack={handleBackToHome}
          />
        ) : showLogin ? (
          <Login
            onLogin={handleLogin}
            onBack={handleBackToHome}
          />
        ) : showRegister ? (
          <Register
            onRegister={handleRegister}
            onBack={handleBackToHome}
          />
        ) : (
          <Home />
        )
      ) : (
        <Dashboard user={user} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;