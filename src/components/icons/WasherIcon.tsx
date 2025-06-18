
import React from 'react';

const WasherIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="washerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f8fafc" />
        <stop offset="100%" stopColor="#e2e8f0" />
      </linearGradient>
    </defs>
    <rect x="4" y="2" width="16" height="20" rx="2" fill="url(#washerGrad)" stroke="#cbd5e1" strokeWidth="1"/>
    <circle cx="12" cy="14" r="6" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1"/>
    <circle cx="12" cy="14" r="3" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="0.5"/>
    <circle cx="8" cy="5" r="0.8" fill="#64748b"/>
    <circle cx="11" cy="5" r="0.8" fill="#22c55e"/>
    <rect x="14" y="4" width="4" height="2" rx="1" fill="#64748b"/>
  </svg>
);

export default WasherIcon;
