import React, { useState, useEffect } from 'react';
import './App.css';
import './index.css';
import Home from './pages/Home/Home';
import Download from './pages/Download/Download';
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
      const parsedUser = JSON.parse(savedUser);
      // Prevent mobile app users from accessing web app
      if (parsedUser.role === 'user') {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        return null;
      }
      return parsedUser;
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
  const [showDownload, setShowDownload] = useState(false);

  useEffect(() => {
    const handleRoute = () => {
      const path = window.location.pathname;
      if (path === '/admin-login') {
        setShowAdminLogin(true);
        setShowDownload(false);
      } else if (path === '/admin-register') {
        setShowAdminRegister(true);
        setShowDownload(false);
      } else if (path === '/download') {
        setShowDownload(true);
        setShowAdminLogin(false);
        setShowAdminRegister(false);
      } else {
        setShowAdminLogin(false);
        setShowAdminRegister(false);
        setShowDownload(false);
      }
    };

    handleRoute();
    window.addEventListener('popstate', handleRoute);
    return () => window.removeEventListener('popstate', handleRoute);
  }, []);

  const handleNavigateDownload = () => {
    setShowDownload(true);
    setShowLogin(false);
    setShowRegister(false);
    setShowAdminLogin(false);
    setShowAdminRegister(false);
    window.history.pushState({}, '', '/download');
    window.scrollTo(0, 0);
  };

  const handleNavigateAdminLogin = () => {
    setShowAdminLogin(true);
    setShowDownload(false);
    setShowLogin(false);
    setShowRegister(false);
    setShowAdminRegister(false);
    window.history.pushState({}, '', '/admin-login');
  };

  const handleLogin = (userData) => {
    // Prevent mobile app users from accessing web dashboard
    if (userData.role === 'user') {
      alert('Mobile app users cannot access the web dashboard. Please use the mobile app.');
      return;
    }
    setUser(userData);
    setShowLogin(false);
    setShowRegister(false);
    setShowAdminLogin(false);
    setShowAdminRegister(false);
    setShowDownload(false);
    window.history.pushState({}, '', '/');
  };

  const handleRegister = (userData) => {
    // Prevent mobile app users from accessing web dashboard
    if (userData.role === 'user') {
      alert('Mobile app users cannot access the web dashboard. Please use the mobile app.');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return;
    }
    setUser(userData);
    setShowLogin(false);
    setShowRegister(false);
    setShowAdminLogin(false);
    setShowAdminRegister(false);
    setShowDownload(false);
    window.history.pushState({}, '', '/');
  };

  const handleBackToHome = (hash = '') => {
    setShowLogin(false);
    setShowRegister(false);
    setShowAdminLogin(false);
    setShowAdminRegister(false);
    setShowDownload(false);
    window.history.pushState({}, '', '/' + (hash || ''));
    if (hash) {
      setTimeout(() => {
        const id = hash.replace('#', '');
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 80);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
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
        ) : showDownload ? (
          <Download
            onNavigateHome={handleBackToHome}
            onNavigateLogin={handleNavigateAdminLogin}
          />
        ) : (
          <Home
            onNavigateDownload={handleNavigateDownload}
            onNavigateLogin={handleNavigateAdminLogin}
          />
        )
      ) : (
        <Dashboard user={user} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;