
import React from 'react';

const CaravanIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="caravanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#e2e8f0" />
        <stop offset="100%" stopColor="#cbd5e0" />
      </linearGradient>
    </defs>
    <path d="M2 8 L18 8 L20 12 L20 16 L2 16 Z" fill="url(#caravanGrad)" stroke="#a0aec0" strokeWidth="0.5" rx="2"/>
    <path d="M4 10 L8 10 L8 14 L4 14 Z" fill="#4299e1" stroke="#2b6cb0" strokeWidth="0.5" rx="0.5"/>
    <path d="M10 10 L14 10 L14 14 L10 14 Z" fill="#4299e1" stroke="#2b6cb0" strokeWidth="0.5" rx="0.5"/>
    <circle cx="6" cy="18" r="2" fill="#2d3748" stroke="#1a202c" strokeWidth="0.5"/>
    <circle cx="16" cy="18" r="2" fill="#2d3748" stroke="#1a202c" strokeWidth="0.5"/>
    <path d="M20 12 L22 12" stroke="#4a5568" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export default CaravanIcon;
