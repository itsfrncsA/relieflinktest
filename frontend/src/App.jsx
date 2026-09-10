import React, { useState, useEffect } from 'react';
import './App.css';
import './index.css';
import Home from './pages/Home/Home';
import Download from './pages/Download/Download';
import Login from './pages/Login/Login';
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
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showDownload, setShowDownload] = useState(false);

  useEffect(() => {
    const handleRoute = () => {
      const path = window.location.pathname;
      if (path === '/admin-login' || path === '/admin-register' || path === '/login') {
        setShowAdminLogin(true);
        setShowDownload(false);
        if (path === '/admin-register') {
          window.history.replaceState({}, '', '/admin-login');
        }
      } else if (path === '/download') {
        setShowDownload(true);
        setShowAdminLogin(false);
      } else {
        setShowAdminLogin(false);
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
    setShowAdminLogin(false);
    window.history.pushState({}, '', '/download');
    window.scrollTo(0, 0);
  };

  const handleNavigateAdminLogin = () => {
    setShowAdminLogin(true);
    setShowDownload(false);
    setShowLogin(false);
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
    setShowAdminLogin(false);
    setShowDownload(false);
    window.history.pushState({}, '', '/');
  };

  const handleBackToHome = (hash = '') => {
    const cleanHash = typeof hash === 'string' ? hash : '';
    setShowLogin(false);
    setShowAdminLogin(false);
    setShowDownload(false);
    window.history.pushState({}, '', '/' + (cleanHash || ''));
    if (cleanHash) {
      setTimeout(() => {
        const id = cleanHash.replace('#', '');
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
        showAdminLogin || showLogin ? (
          <Login
            onLogin={handleLogin}
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