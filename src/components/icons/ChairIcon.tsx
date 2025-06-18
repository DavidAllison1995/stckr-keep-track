
import React from 'react';

const ChairIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="chairGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f59e0b" />
        <stop offset="100%" stopColor="#d97706" />
      </linearGradient>
    </defs>
    <rect x="6" y="3" width="12" height="8" rx="1" fill="url(#chairGrad)" stroke="#b45309" strokeWidth="1"/>
    <rect x="6" y="11" width="12" height="2" rx="1" fill="#92400e"/>
    <rect x="6" y="13" width="2" height="8" fill="#64748b"/>
    <rect x="16" y="13" width="2" height="8" fill="#64748b"/>
    <rect x="6" y="3" width="2" height="8" fill="#64748b"/>
    <rect x="16" y="3" width="2" height="8" fill="#64748b"/>
  </svg>
);

export default ChairIcon;
