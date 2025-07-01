
import React from 'react';

const ScrewdriverIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="screwdriverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#4299e1" />
        <stop offset="100%" stopColor="#2b6cb0" />
      </linearGradient>
    </defs>
    <path d="M4 4 L8 8 L16 16 L20 20" stroke="url(#screwdriverGrad)" strokeWidth="3" strokeLinecap="round"/>
    <path d="M2 2 L6 6 L8 4 L4 0 Z" fill="#ffd700" stroke="#e6c200" strokeWidth="0.5"/>
    <circle cx="18" cy="18" r="2" fill="#e53e3e" stroke="#c53030" strokeWidth="0.5"/>
  </svg>
);

export default ScrewdriverIcon;
