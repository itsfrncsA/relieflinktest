import React from 'react';

const NotFound = ({ onBackToHome }) => {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f8fafc',
      padding: '24px',
      textAlign: 'center',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        maxWidth: '480px',
        width: '100%',
        backgroundColor: '#ffffff',
        borderRadius: '24px',
        padding: '40px 32px',
        boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.05), 0 8px 10px -6px rgba(15, 23, 42, 0.05)',
        border: '1px solid #e2e8f0'
      }}>
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          backgroundColor: '#eff6ff',
          color: '#2563eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px auto',
          fontSize: '32px'
        }}>
          🔍
        </div>

        <h1 style={{
          fontSize: '56px',
          fontWeight: '900',
          color: '#1e293b',
          margin: '0 0 8px 0',
          lineHeight: '1'
        }}>
          404
        </h1>

        <h2 style={{
          fontSize: '20px',
          fontWeight: '800',
          color: '#0f172a',
          margin: '0 0 12px 0'
        }}>
          Page Not Found
        </h2>

        <p style={{
          fontSize: '14px',
          color: '#64748b',
          lineHeight: '1.6',
          margin: '0 0 28px 0'
        }}>
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>

        <button
          onClick={onBackToHome ? () => onBackToHome('') : () => { window.location.href = '/'; }}
          style={{
            width: '100%',
            padding: '14px 24px',
            backgroundColor: '#2563eb',
            color: '#ffffff',
            border: 'none',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '700',
            cursor: 'pointer',
            transition: 'background-color 0.2s ease',
            boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)'
          }}
          onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#1d4ed8'; }}
          onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#2563eb'; }}
        >
          Return to Home
        </button>
      </div>

      <p style={{
        marginTop: '24px',
        fontSize: '12px',
        color: '#94a3b8'
      }}>
        ReliefLink • Sto. Domingo Parish Disaster Relief & Management
      </p>
    </div>
  );
};

export default NotFound;
