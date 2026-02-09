'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * WalkthroughTooltip - A non-intrusive side tooltip for guided walkthroughs
 * @param {string} storageKey - LocalStorage key to track if tooltip was dismissed
 * @param {string} title - Tooltip heading
 * @param {string} message - Main tooltip content
 * @param {string} position - 'right' | 'left' | 'bottom' (default: 'right')
 */
export default function WalkthroughTooltip({ 
  storageKey, 
  title, 
  message, 
  position = 'right',
  style = {} 
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already dismissed this tooltip
    const dismissed = localStorage.getItem(storageKey);
    if (!dismissed) {
      // Show after a brief delay for better UX
      const timer = setTimeout(() => setIsVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, [storageKey]);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem(storageKey, 'true');
  };

  if (!isVisible) return null;

  const positionStyles = {
    right: {
      position: 'fixed',
      right: '24px',
      top: '50%',
      transform: 'translateY(-50%)',
      maxWidth: '340px'
    },
    left: {
      position: 'fixed',
      left: '24px',
      top: '50%',
      transform: 'translateY(-50%)',
      maxWidth: '340px'
    },
    bottom: {
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      maxWidth: '400px'
    }
  };

  return (
    <div
      style={{
        ...positionStyles[position],
        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.95), rgba(236, 72, 153, 0.95))',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '16px',
        padding: '20px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 24px rgba(139, 92, 246, 0.4)',
        zIndex: 1000,
        animation: 'slideIn 0.4s ease-out',
        ...style
      }}
    >
      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-50%) translateX(${position === 'right' ? '20px' : position === 'left' ? '-20px' : '0'});
          }
          to {
            opacity: 1;
            transform: translateY(-50%) translateX(0);
          }
        }
      `}</style>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <h3 style={{
          margin: 0,
          color: '#fff',
          fontSize: '16px',
          fontWeight: '700',
          letterSpacing: '0.3px'
        }}>
          {title}
        </h3>
        <button
          onClick={handleDismiss}
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '6px',
            padding: '4px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
          }}
          title="Skip walkthrough"
        >
          <X size={16} color="#fff" />
        </button>
      </div>

      <p style={{
        margin: '0 0 16px 0',
        color: 'rgba(255, 255, 255, 0.95)',
        fontSize: '14px',
        lineHeight: '1.6',
        whiteSpace: 'pre-line'
      }}>
        {message}
      </p>

      <button
        onClick={handleDismiss}
        style={{
          width: '100%',
          padding: '10px',
          background: 'rgba(255, 255, 255, 0.15)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          borderRadius: '8px',
          color: '#fff',
          fontWeight: '600',
          fontSize: '14px',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
          e.currentTarget.style.transform = 'translateY(-1px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        Got it, skip walkthrough
      </button>
    </div>
  );
}
