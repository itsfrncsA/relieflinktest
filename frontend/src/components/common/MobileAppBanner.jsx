import React from 'react';
import './MobileAppBanner.css';

const MobileAppBanner = () => {
  return (
    <div className="mobile-app-banner">
      <div className="mobile-app-content">
        <div className="mobile-app-icon-section">
          <svg style={{ width: '28px', height: '28px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </div>
        <div className="mobile-app-text-section">
          <h3 className="mobile-app-title">Download ReliefLink Mobile App</h3>
          <p className="mobile-app-description">Manage donations on-the-go with our mobile app</p>
          <div className="mobile-app-buttons">
            <button className="mobile-app-btn app-store-btn">
              App Store
            </button>
            <button className="mobile-app-btn play-store-btn">
              Play Store
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileAppBanner;
