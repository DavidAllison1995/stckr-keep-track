
import React from 'react';

const BedIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f8fafc" />
        <stop offset="100%" stopColor="#e2e8f0" />
      </linearGradient>
    </defs>
    <rect x="2" y="12" width="20" height="6" rx="1" fill="url(#bedGrad)" stroke="#cbd5e1" strokeWidth="1"/>
    <rect x="4" y="8" width="16" height="4" rx="2" fill="#7c3aed" stroke="#6d28d9" strokeWidth="0.5"/>
    <rect x="2" y="18" width="2" height="3" fill="#64748b"/>
    <rect x="20" y="18" width="2" height="3" fill="#64748b"/>
    <circle cx="7" cy="6" r="1.5" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1"/>
  </svg>
);

export default BedIcon;
