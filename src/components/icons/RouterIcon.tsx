
import React from 'react';

const RouterIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="routerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#2d3748" />
        <stop offset="100%" stopColor="#1a202c" />
      </linearGradient>
    </defs>
    <path d="M3 12 L21 12 L21 20 L3 20 Z" fill="url(#routerGrad)" stroke="#4a5568" strokeWidth="0.5" rx="1"/>
    <circle cx="6" cy="16" r="1" fill="#48bb78"/>
    <circle cx="9" cy="16" r="1" fill="#4299e1"/>
    <circle cx="12" cy="16" r="1" fill="#ffd700"/>
    <path d="M15 8 L15 12" stroke="#4a5568" strokeWidth="1"/>
    <path d="M17 6 L17 12" stroke="#4a5568" strokeWidth="1"/>
    <path d="M19 4 L19 12" stroke="#4a5568" strokeWidth="1"/>
    <circle cx="15" cy="8" r="0.5" fill="#e53e3e"/>
    <circle cx="17" cy="6" r="0.5" fill="#e53e3e"/>
    <circle cx="19" cy="4" r="0.5" fill="#e53e3e"/>
  </svg>
);

export default RouterIcon;
