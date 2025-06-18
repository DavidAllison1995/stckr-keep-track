
import React from 'react';

const BookIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bookGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#3b82f6" />
        <stop offset="100%" stopColor="#1d4ed8" />
      </linearGradient>
    </defs>
    <rect x="5" y="3" width="14" height="18" rx="1" fill="url(#bookGrad)" stroke="#1e40af" strokeWidth="1"/>
    <rect x="6" y="4" width="12" height="16" rx="0.5" fill="#f8fafc"/>
    <line x1="8" y1="7" x2="16" y2="7" stroke="#cbd5e1" strokeWidth="1"/>
    <line x1="8" y1="9" x2="16" y2="9" stroke="#cbd5e1" strokeWidth="1"/>
    <line x1="8" y1="11" x2="14" y2="11" stroke="#cbd5e1" strokeWidth="1"/>
    <rect x="4" y="4" width="1" height="16" fill="#1e40af"/>
  </svg>
);

export default BookIcon;
