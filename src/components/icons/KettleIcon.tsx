
import React from 'react';

const KettleIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="kettleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#a0aec0" />
        <stop offset="100%" stopColor="#718096" />
      </linearGradient>
    </defs>
    <path d="M6 8 L6 18 L18 18 L18 12 L16 8 Z" fill="url(#kettleGrad)" stroke="#4a5568" strokeWidth="0.5"/>
    <path d="M8 6 L14 6 L16 8 L6 8 Z" fill="#e2e8f0" stroke="#cbd5e0" strokeWidth="0.5"/>
    <path d="M18 12 L20 10 Q22 10 22 12 Q22 14 20 14 L18 12" fill="#4a5568"/>
    <circle cx="12" cy="13" r="2" fill="#4299e1" opacity="0.7"/>
    <path d="M4 18 L20 18" stroke="#2d3748" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export default KettleIcon;
