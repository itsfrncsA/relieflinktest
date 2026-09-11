import React, { useState, useEffect, Suspense } from 'react';
import './App.css';
import './index.css';
import Home from './pages/Home/Home';

// Lazy-loaded pages — only fetched when the user navigates to them
// Dashboard alone pulls in recharts + 19 sub-components (~166 KiB unused on Home)
const Download = React.lazy(() => import('./pages/Download/Download'));
const Login = React.lazy(() => import('./pages/Login/Login'));
const Dashboard = React.lazy(() => import('./pages/Dashboard/Dashboard'));

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

  const loadingFallback = (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#f8fafc' }}>
      <div style={{ width: '36px', height: '36px', border: '3px solid #e2e8f0', borderTop: '3px solid #2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );

  return (
    <div className="app-container">
      {!user ? (
        showAdminLogin || showLogin ? (
          <Suspense fallback={loadingFallback}>
            <Login
              onLogin={handleLogin}
              onBack={handleBackToHome}
            />
          </Suspense>
        ) : showDownload ? (
          <Suspense fallback={loadingFallback}>
            <Download
              onNavigateHome={handleBackToHome}
              onNavigateLogin={handleNavigateAdminLogin}
            />
          </Suspense>
        ) : (
          <Home
            onNavigateDownload={handleNavigateDownload}
            onNavigateLogin={handleNavigateAdminLogin}
          />
        )
      ) : (
        <Suspense fallback={loadingFallback}>
          <Dashboard user={user} onLogout={handleLogout} />
        </Suspense>
      )}
    </div>
  );
}

export default App;