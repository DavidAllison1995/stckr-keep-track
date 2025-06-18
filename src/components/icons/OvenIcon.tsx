
import React from 'react';

const OvenIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="ovenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f8fafc" />
        <stop offset="100%" stopColor="#e2e8f0" />
      </linearGradient>
    </defs>
    <rect x="4" y="6" width="16" height="12" rx="2" fill="url(#ovenGrad)" stroke="#cbd5e1" strokeWidth="1"/>
    <rect x="6" y="9" width="12" height="7" rx="1" fill="#1e293b" stroke="#475569" strokeWidth="0.5"/>
    <circle cx="7" cy="7.5" r="0.5" fill="#64748b"/>
    <circle cx="9" cy="7.5" r="0.5" fill="#64748b"/>
    <circle cx="11" cy="7.5" r="0.5" fill="#64748b"/>
    <circle cx="13" cy="7.5" r="0.5" fill="#64748b"/>
    <rect x="16.5" y="14" width="1" height="2" rx="0.5" fill="#64748b"/>
  </svg>
);

export default OvenIcon;
