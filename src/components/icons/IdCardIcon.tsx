
import React from 'react';

const IdCardIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f7fafc" />
        <stop offset="100%" stopColor="#e2e8f0" />
      </linearGradient>
    </defs>
    <path d="M2 6 L22 6 L22 18 L2 18 Z" fill="url(#cardGrad)" stroke="#cbd5e0" strokeWidth="0.5" rx="2"/>
    <circle cx="7" cy="11" r="2" fill="#4299e1" stroke="#2b6cb0" strokeWidth="0.5"/>
    <path d="M12 9 L19 9" stroke="#718096" strokeWidth="1" strokeLinecap="round"/>
    <path d="M12 11 L17 11" stroke="#718096" strokeWidth="1" strokeLinecap="round"/>
    <path d="M12 13 L19 13" stroke="#718096" strokeWidth="1" strokeLinecap="round"/>
    <path d="M4 15 L10 15" stroke="#a0aec0" strokeWidth="1" strokeLinecap="round"/>
  </svg>
);

export default IdCardIcon;
