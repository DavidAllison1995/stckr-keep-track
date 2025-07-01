
import React from 'react';

const MonitorIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="monitorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#2d3748" />
        <stop offset="100%" stopColor="#1a202c" />
      </linearGradient>
    </defs>
    <path d="M3 5 L21 5 L21 17 L3 17 Z" fill="url(#monitorGrad)" stroke="#4a5568" strokeWidth="0.5" rx="1"/>
    <path d="M4 6 L20 6 L20 16 L4 16 Z" fill="#4299e1" stroke="#2b6cb0" strokeWidth="0.5"/>
    <path d="M10 17 L14 17 L13 19 L11 19 Z" fill="#718096"/>
    <path d="M8 19 L16 19" stroke="#a0aec0" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export default MonitorIcon;
