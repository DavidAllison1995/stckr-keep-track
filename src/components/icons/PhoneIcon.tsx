
import React from 'react';

const PhoneIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="phoneGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#1e293b" />
        <stop offset="100%" stopColor="#0f172a" />
      </linearGradient>
    </defs>
    <rect x="7" y="2" width="10" height="20" rx="3" fill="url(#phoneGrad)" stroke="#374151" strokeWidth="1"/>
    <rect x="8" y="4" width="8" height="14" rx="1" fill="#000000"/>
    <circle cx="12" cy="20" r="1" fill="#64748b"/>
    <rect x="10" y="2.5" width="4" height="0.8" rx="0.4" fill="#64748b"/>
  </svg>
);

export default PhoneIcon;
