
import React from 'react';

const DesktopIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="desktopGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#2d3748" />
        <stop offset="100%" stopColor="#1a202c" />
      </linearGradient>
    </defs>
    <path d="M2 4 L22 4 L22 16 L2 16 Z" fill="url(#desktopGrad)" stroke="#4a5568" strokeWidth="0.5" rx="1"/>
    <path d="M3 5 L21 5 L21 15 L3 15 Z" fill="#4299e1" stroke="#2b6cb0" strokeWidth="0.5"/>
    <path d="M10 16 L14 16 L14 18 L10 18 Z" fill="#718096"/>
    <path d="M8 18 L16 18 L16 20 L8 20 Z" fill="#a0aec0" stroke="#718096" strokeWidth="0.5" rx="1"/>
    <circle cx="12" cy="19" r="0.5" fill="#4a5568"/>
  </svg>
);

export default DesktopIcon;
