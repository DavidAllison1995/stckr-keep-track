
import React from 'react';

const PassportIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="passportGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#2c5aa0" />
        <stop offset="100%" stopColor="#1e3a8a" />
      </linearGradient>
    </defs>
    <path d="M6 2 L18 2 L18 22 L6 22 Z" fill="url(#passportGrad)" stroke="#1e40af" strokeWidth="0.5" rx="1"/>
    <circle cx="12" cy="8" r="2" fill="#ffd700" stroke="#e6c200" strokeWidth="0.5"/>
    <path d="M8 12 L16 12" stroke="#cbd5e0" strokeWidth="1"/>
    <path d="M8 14 L14 14" stroke="#cbd5e0" strokeWidth="0.5"/>
    <path d="M8 16 L16 16" stroke="#cbd5e0" strokeWidth="0.5"/>
    <path d="M8 18 L12 18" stroke="#cbd5e0" strokeWidth="0.5"/>
    <circle cx="15" cy="5" r="1" fill="#ffd700"/>
  </svg>
);

export default PassportIcon;
