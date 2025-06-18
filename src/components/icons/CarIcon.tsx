
import React from 'react';

const CarIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="carGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ef4444" />
        <stop offset="100%" stopColor="#dc2626" />
      </linearGradient>
    </defs>
    <path d="M3 16 L3 18 L5 18 L5 19 L7 19 L7 18 L17 18 L17 19 L19 19 L19 18 L21 18 L21 16 L21 12 L19 8 L5 8 L3 12 Z" fill="url(#carGrad)" stroke="#b91c1c" strokeWidth="1"/>
    <rect x="6" y="9" width="4" height="2" rx="1" fill="#1e293b"/>
    <rect x="14" y="9" width="4" height="2" rx="1" fill="#1e293b"/>
    <circle cx="7" cy="16" r="1.5" fill="#1e293b"/>
    <circle cx="17" cy="16" r="1.5" fill="#1e293b"/>
    <circle cx="7" cy="16" r="0.8" fill="#64748b"/>
    <circle cx="17" cy="16" r="0.8" fill="#64748b"/>
  </svg>
);

export default CarIcon;
