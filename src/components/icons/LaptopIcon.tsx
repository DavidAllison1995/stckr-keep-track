
import React from 'react';

const LaptopIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="laptopGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f1f5f9" />
        <stop offset="100%" stopColor="#cbd5e1" />
      </linearGradient>
    </defs>
    <path d="M2 18 L22 18 L20 16 L4 16 Z" fill="#64748b"/>
    <rect x="5" y="6" width="14" height="10" rx="2" fill="url(#laptopGrad)" stroke="#94a3b8" strokeWidth="1"/>
    <rect x="7" y="8" width="10" height="6" rx="1" fill="#1e293b"/>
    <rect x="11" y="19" width="2" height="0.5" rx="0.25" fill="#94a3b8"/>
    <circle cx="12" cy="17.5" r="0.3" fill="#94a3b8"/>
  </svg>
);

export default LaptopIcon;
