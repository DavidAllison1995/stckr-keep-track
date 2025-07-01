
import React from 'react';

const DrillIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="drillGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffcc02" />
        <stop offset="100%" stopColor="#ff9500" />
      </linearGradient>
    </defs>
    <path d="M3 10 L15 10 L15 14 L3 14 Z" fill="url(#drillGrad)" stroke="#e68900" strokeWidth="0.5" rx="2"/>
    <path d="M15 11 L19 11 L19 13 L15 13 Z" fill="#2d3748" rx="1"/>
    <circle cx="6" cy="12" r="1" fill="#fff" opacity="0.8"/>
    <circle cx="9" cy="12" r="1" fill="#fff" opacity="0.8"/>
    <circle cx="12" cy="12" r="1" fill="#fff" opacity="0.8"/>
    <path d="M19 11.5 L21 10.5 L21 13.5 L19 12.5 Z" fill="#718096"/>
  </svg>
);

export default DrillIcon;
