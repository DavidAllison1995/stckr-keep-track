
import React from 'react';

const LawnMowerIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="mowerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#e53e3e" />
        <stop offset="100%" stopColor="#c53030" />
      </linearGradient>
    </defs>
    <path d="M4 10 L20 10 L18 16 L6 16 Z" fill="url(#mowerGrad)" stroke="#9b2c2c" strokeWidth="0.5" rx="2"/>
    <path d="M8 6 L16 6 L18 10 L6 10 Z" fill="#fc8181" stroke="#e53e3e" strokeWidth="0.5"/>
    <circle cx="7" cy="18" r="2" fill="#2d3748" stroke="#1a202c" strokeWidth="0.5"/>
    <circle cx="17" cy="18" r="2" fill="#2d3748" stroke="#1a202c" strokeWidth="0.5"/>
    <path d="M12 6 L12 2" stroke="#4a5568" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export default LawnMowerIcon;
