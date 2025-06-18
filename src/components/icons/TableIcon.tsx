
import React from 'react';

const TableIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="tableGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fbbf24" />
        <stop offset="100%" stopColor="#f59e0b" />
      </linearGradient>
    </defs>
    <rect x="3" y="8" width="18" height="2" rx="1" fill="url(#tableGrad)" stroke="#d97706" strokeWidth="1"/>
    <rect x="5" y="10" width="2" height="8" fill="#64748b"/>
    <rect x="17" y="10" width="2" height="8" fill="#64748b"/>
    <rect x="4" y="18" width="4" height="1" rx="0.5" fill="#64748b"/>
    <rect x="16" y="18" width="4" height="1" rx="0.5" fill="#64748b"/>
  </svg>
);

export default TableIcon;
