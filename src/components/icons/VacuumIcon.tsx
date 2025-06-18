
import React from 'react';

const VacuumIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="vacuumGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f8fafc" />
        <stop offset="100%" stopColor="#e2e8f0" />
      </linearGradient>
    </defs>
    <circle cx="8" cy="16" r="5" fill="url(#vacuumGrad)" stroke="#cbd5e1" strokeWidth="1"/>
    <rect x="12" y="8" width="2" height="8" rx="1" fill="#64748b"/>
    <rect x="13" y="4" width="6" height="2" rx="1" fill="#64748b"/>
    <circle cx="8" cy="16" r="2" fill="#94a3b8"/>
    <circle cx="8" cy="16" r="0.8" fill="#475569"/>
    <circle cx="8" cy="22" r="1" fill="#374151"/>
    <circle cx="13" cy="22" r="1" fill="#374151"/>
  </svg>
);

export default VacuumIcon;
