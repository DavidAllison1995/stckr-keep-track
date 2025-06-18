
import React from 'react';

const FridgeIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="fridgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f8fafc" />
        <stop offset="100%" stopColor="#e2e8f0" />
      </linearGradient>
    </defs>
    <rect x="6" y="2" width="12" height="20" rx="2" fill="url(#fridgeGrad)" stroke="#cbd5e1" strokeWidth="1"/>
    <rect x="6" y="2" width="12" height="8" rx="2" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="0.5"/>
    <circle cx="16" cy="6" r="0.8" fill="#64748b"/>
    <circle cx="16" cy="14" r="0.8" fill="#64748b"/>
    <line x1="6" y1="10" x2="18" y2="10" stroke="#cbd5e1" strokeWidth="1"/>
  </svg>
);

export default FridgeIcon;
