
import React from 'react';

const OfficeChairIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="chairGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#2d3748" />
        <stop offset="100%" stopColor="#1a202c" />
      </linearGradient>
    </defs>
    <path d="M8 4 L16 4 L16 12 L8 12 Z" fill="url(#chairGrad)" stroke="#4a5568" strokeWidth="0.5" rx="1"/>
    <path d="M6 8 L8 8 L8 12 L6 12 Z" fill="url(#chairGrad)" stroke="#4a5568" strokeWidth="0.5"/>
    <path d="M16 8 L18 8 L18 12 L16 12 Z" fill="url(#chairGrad)" stroke="#4a5568" strokeWidth="0.5"/>
    <path d="M12 12 L12 16" stroke="#718096" strokeWidth="2"/>
    <path d="M8 20 L16 20" stroke="#718096" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="9" cy="20" r="1" fill="#4a5568"/>
    <circle cx="15" cy="20" r="1" fill="#4a5568"/>
  </svg>
);

export default OfficeChairIcon;
