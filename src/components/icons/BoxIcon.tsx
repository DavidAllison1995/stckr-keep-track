
import React from 'react';

const BoxIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="boxGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f8fafc" />
        <stop offset="100%" stopColor="#e2e8f0" />
      </linearGradient>
    </defs>
    <rect x="4" y="6" width="16" height="12" rx="1" fill="url(#boxGrad)" stroke="#cbd5e1" strokeWidth="1"/>
    <path d="M4 10 L12 6 L20 10" stroke="#94a3b8" strokeWidth="1" fill="none"/>
    <line x1="12" y1="6" x2="12" y2="18" stroke="#94a3b8" strokeWidth="1"/>
    <path d="M4 6 L12 2 L20 6" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="1"/>
  </svg>
);

export default BoxIcon;
