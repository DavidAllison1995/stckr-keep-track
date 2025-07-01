
import React from 'react';

const AirConditionerIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="acGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f7fafc" />
        <stop offset="100%" stopColor="#e2e8f0" />
      </linearGradient>
    </defs>
    <path d="M3 4 L21 4 L21 12 L3 12 Z" fill="url(#acGrad)" stroke="#cbd5e0" strokeWidth="0.5" rx="1"/>
    <path d="M5 6 L19 6 L19 10 L5 10 Z" fill="#2d3748" stroke="#1a202c" strokeWidth="0.5"/>
    <path d="M6 14 Q8 16 10 14 Q12 12 14 14 Q16 16 18 14" stroke="#4299e1" strokeWidth="1.5" fill="none"/>
    <circle cx="17" cy="8" r="1" fill="#48bb78"/>
    <path d="M7 8 L11 8" stroke="#4a5568" strokeWidth="0.5"/>
    <path d="M7 9 L9 9" stroke="#4a5568" strokeWidth="0.5"/>
  </svg>
);

export default AirConditionerIcon;
