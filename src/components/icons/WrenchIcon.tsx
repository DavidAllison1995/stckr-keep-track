
import React from 'react';

const WrenchIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="wrenchGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#a0aec0" />
        <stop offset="100%" stopColor="#718096" />
      </linearGradient>
    </defs>
    <path d="M3 19 L10 12 L12 10 L14 8 L16 6 L18 4 L20 6 L18 8 L16 10 L14 12 L12 14 L5 21 L3 19 Z" 
          fill="url(#wrenchGrad)" stroke="#4a5568" strokeWidth="0.5"/>
    <path d="M12 10 L14 8 L16 10 L14 12 Z" fill="#e2e8f0"/>
    <circle cx="4" cy="20" r="1.5" fill="#4a5568"/>
  </svg>
);

export default WrenchIcon;
