
import React from 'react';

const ScooterIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="scooterGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#48bb78" />
        <stop offset="100%" stopColor="#2f855a" />
      </linearGradient>
    </defs>
    <circle cx="5" cy="18" r="2.5" fill="#2d3748" stroke="#1a202c" strokeWidth="0.5"/>
    <circle cx="19" cy="18" r="2.5" fill="#2d3748" stroke="#1a202c" strokeWidth="0.5"/>
    <path d="M5 18 L12 12 L19 18" stroke="url(#scooterGrad)" strokeWidth="2" fill="none"/>
    <path d="M12 6 L14 6 L16 10 L10 10 Z" fill="url(#scooterGrad)" stroke="#276749" strokeWidth="0.5"/>
    <path d="M12 6 L12 2" stroke="#4a5568" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="5" cy="18" r="1" fill="#4a5568"/>
    <circle cx="19" cy="18" r="1" fill="#4a5568"/>
  </svg>
);

export default ScooterIcon;
