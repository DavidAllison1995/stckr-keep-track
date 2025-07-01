
import React from 'react';

const MotorbikeIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bikeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#4299e1" />
        <stop offset="100%" stopColor="#2b6cb0" />
      </linearGradient>
    </defs>
    <circle cx="6" cy="17" r="3" fill="#2d3748" stroke="#1a202c" strokeWidth="0.5"/>
    <circle cx="18" cy="17" r="3" fill="#2d3748" stroke="#1a202c" strokeWidth="0.5"/>
    <path d="M6 17 L12 10 L18 17" stroke="url(#bikeGrad)" strokeWidth="2" fill="none"/>
    <path d="M10 8 L14 8 L16 12 L8 12 Z" fill="url(#bikeGrad)" stroke="#2563eb" strokeWidth="0.5"/>
    <circle cx="6" cy="17" r="1.5" fill="#4a5568"/>
    <circle cx="18" cy="17" r="1.5" fill="#4a5568"/>
  </svg>
);

export default MotorbikeIcon;
