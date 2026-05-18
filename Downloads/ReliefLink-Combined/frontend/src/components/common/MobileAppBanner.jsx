import React from 'react';
import './MobileAppBanner.css';

const MobileAppBanner = () => {
  return (
    <div className="mobile-app-banner">
      <div className="mobile-app-content">
        <div className="mobile-app-icon-section">
          <span className="mobile-app-icon">📱</span>
        </div>
        <div className="mobile-app-text-section">
          <h3 className="mobile-app-title">Download ReliefLink Mobile App</h3>
          <p className="mobile-app-description">Manage donations on-the-go with our mobile app</p>
          <div className="mobile-app-buttons">
            <button className="mobile-app-btn app-store-btn">
              <span className="mobile-app-button-icon">🍎</span> App Store
            </button>
            <button className="mobile-app-btn play-store-btn">
              <span className="mobile-app-button-icon">🤖</span> Play Store
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileAppBanner;
