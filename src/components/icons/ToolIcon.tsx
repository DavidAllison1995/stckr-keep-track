
import React from 'react';

const ToolIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="toolGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fbbf24" />
        <stop offset="100%" stopColor="#f59e0b" />
      </linearGradient>
    </defs>
    <path d="M3 8 L8 3 L10 5 L12 3 L21 12 L19 14 L17 12 L5 10 Z" fill="url(#toolGrad)" stroke="#d97706" strokeWidth="1"/>
    <circle cx="7" cy="6" r="1" fill="#92400e"/>
    <path d="M14 16 L20 22 L22 20 L16 14" stroke="#64748b" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="18" cy="18" r="1" fill="#374151"/>
  </svg>
);

export default ToolIcon;
