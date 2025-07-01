
import React from 'react';

const HoseIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="hoseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#48bb78" />
        <stop offset="100%" stopColor="#2f855a" />
      </linearGradient>
    </defs>
    <path d="M3 12 Q6 8 9 12 Q12 16 15 12 Q18 8 21 12" stroke="url(#hoseGrad)" strokeWidth="3" fill="none" strokeLinecap="round"/>
    <circle cx="3" cy="12" r="2" fill="#4a5568" stroke="#2d3748" strokeWidth="0.5"/>
    <circle cx="21" cy="12" r="1.5" fill="#e53e3e" stroke="#c53030" strokeWidth="0.5"/>
  </svg>
);

export default HoseIcon;
