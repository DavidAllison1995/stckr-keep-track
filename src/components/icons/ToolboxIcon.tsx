
import React from 'react';

const ToolboxIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="toolboxGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ef4444" />
        <stop offset="100%" stopColor="#dc2626" />
      </linearGradient>
    </defs>
    <rect x="4" y="10" width="16" height="8" rx="1" fill="url(#toolboxGrad)" stroke="#b91c1c" strokeWidth="1"/>
    <rect x="8" y="7" width="8" height="3" rx="1" fill="#64748b"/>
    <rect x="9" y="8" width="6" height="1" fill="#94a3b8"/>
    <circle cx="7" cy="14" r="0.5" fill="#fbbf24"/>
    <circle cx="17" cy="14" r="0.5" fill="#fbbf24"/>
    <rect x="11" y="12" width="2" height="4" fill="#64748b"/>
  </svg>
);

export default ToolboxIcon;
