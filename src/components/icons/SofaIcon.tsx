
import React from 'react';

const SofaIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="sofaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#6366f1" />
        <stop offset="100%" stopColor="#4f46e5" />
      </linearGradient>
    </defs>
    <path d="M3 14 L3 18 L5 18 L5 20 L19 20 L19 18 L21 18 L21 14 L19 14 L19 10 L5 10 L5 14 Z" fill="url(#sofaGrad)" stroke="#4338ca" strokeWidth="1"/>
    <rect x="2" y="12" width="2" height="6" rx="1" fill="#64748b"/>
    <rect x="20" y="12" width="2" height="6" rx="1" fill="#64748b"/>
    <rect x="7" y="8" width="10" height="4" rx="2" fill="#7c3aed"/>
  </svg>
);

export default SofaIcon;
