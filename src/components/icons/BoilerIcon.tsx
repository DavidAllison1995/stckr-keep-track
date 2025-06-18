
import React from 'react';

const BoilerIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="boilerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f8fafc" />
        <stop offset="100%" stopColor="#e2e8f0" />
      </linearGradient>
    </defs>
    <rect x="6" y="4" width="12" height="16" rx="2" fill="url(#boilerGrad)" stroke="#cbd5e1" strokeWidth="1"/>
    <rect x="8" y="6" width="8" height="3" rx="1" fill="#64748b"/>
    <circle cx="10" cy="12" r="1" fill="#ef4444"/>
    <circle cx="14" cy="12" r="1" fill="#22c55e"/>
    <rect x="8" y="15" width="8" height="1" rx="0.5" fill="#94a3b8"/>
    <rect x="8" y="17" width="8" height="1" rx="0.5" fill="#94a3b8"/>
    <rect x="18" y="8" width="2" height="8" rx="1" fill="#64748b"/>
  </svg>
);

export default BoilerIcon;
