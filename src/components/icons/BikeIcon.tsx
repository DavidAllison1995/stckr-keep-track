
import React from 'react';

const BikeIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bikeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#3b82f6" />
        <stop offset="100%" stopColor="#1d4ed8" />
      </linearGradient>
    </defs>
    <circle cx="6" cy="18" r="3" fill="none" stroke="url(#bikeGrad)" strokeWidth="2"/>
    <circle cx="18" cy="18" r="3" fill="none" stroke="url(#bikeGrad)" strokeWidth="2"/>
    <path d="M12 6 L9 15 L15 15 L12 6 Z" fill="none" stroke="#64748b" strokeWidth="2" strokeLinejoin="round"/>
    <path d="M6 18 L9 15" stroke="#64748b" strokeWidth="2"/>
    <path d="M18 18 L15 15" stroke="#64748b" strokeWidth="2"/>
    <circle cx="12" cy="6" r="1" fill="#64748b"/>
    <path d="M10 8 L8 8" stroke="#64748b" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export default BikeIcon;
