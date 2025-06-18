
import React from 'react';

const LampIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="lampGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fef3c7" />
        <stop offset="100%" stopColor="#f59e0b" />
      </linearGradient>
    </defs>
    <path d="M8 8 L16 8 L14 14 L10 14 Z" fill="url(#lampGrad)" stroke="#d97706" strokeWidth="1"/>
    <rect x="11" y="14" width="2" height="6" fill="#64748b"/>
    <rect x="9" y="20" width="6" height="1" rx="0.5" fill="#64748b"/>
    <circle cx="12" cy="11" r="1" fill="#fbbf24"/>
    <path d="M12 3 L12 7" stroke="#64748b" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export default LampIcon;
