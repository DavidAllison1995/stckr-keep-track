
import React from 'react';

const TvIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="tvGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#1e293b" />
        <stop offset="100%" stopColor="#0f172a" />
      </linearGradient>
    </defs>
    <rect x="2" y="6" width="20" height="12" rx="2" fill="url(#tvGrad)" stroke="#374151" strokeWidth="1"/>
    <rect x="4" y="8" width="16" height="8" rx="1" fill="#000000"/>
    <rect x="10" y="18" width="4" height="2" rx="1" fill="#64748b"/>
    <rect x="8" y="20" width="8" height="1" rx="0.5" fill="#64748b"/>
    <circle cx="20" cy="17" r="0.5" fill="#22c55e"/>
  </svg>
);

export default TvIcon;
