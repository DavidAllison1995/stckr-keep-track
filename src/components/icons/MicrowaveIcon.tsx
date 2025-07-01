
import React from 'react';

const MicrowaveIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="microwaveGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#e2e8f0" />
        <stop offset="100%" stopColor="#cbd5e0" />
      </linearGradient>
    </defs>
    <path d="M2 6 L22 6 L22 18 L2 18 Z" fill="url(#microwaveGrad)" stroke="#a0aec0" strokeWidth="0.5" rx="2"/>
    <path d="M4 8 L16 8 L16 16 L4 16 Z" fill="#2d3748" stroke="#1a202c" strokeWidth="0.5" rx="1"/>
    <circle cx="19" cy="10" r="1" fill="#4299e1"/>
    <circle cx="19" cy="14" r="1" fill="#48bb78"/>
    <path d="M18 19 L20 21" stroke="#718096" strokeWidth="1" strokeLinecap="round"/>
  </svg>
);

export default MicrowaveIcon;
