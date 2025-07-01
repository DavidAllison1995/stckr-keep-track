
import React from 'react';

const WaterHeaterIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="heaterGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#e2e8f0" />
        <stop offset="100%" stopColor="#cbd5e0" />
      </linearGradient>
    </defs>
    <path d="M6 4 L18 4 L18 20 L6 20 Z" fill="url(#heaterGrad)" stroke="#a0aec0" strokeWidth="0.5" rx="2"/>
    <circle cx="12" cy="8" r="1" fill="#e53e3e"/>
    <circle cx="12" cy="12" r="1" fill="#ffd700"/>
    <circle cx="12" cy="16" r="1" fill="#48bb78"/>
    <path d="M8 6 L16 6" stroke="#718096" strokeWidth="1"/>
    <path d="M8 18 L16 18" stroke="#718096" strokeWidth="1"/>
    <path d="M12 2 L12 4" stroke="#4a5568" strokeWidth="2" strokeLinecap="round"/>
    <path d="M18 10 L20 10" stroke="#4a5568" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export default WaterHeaterIcon;
