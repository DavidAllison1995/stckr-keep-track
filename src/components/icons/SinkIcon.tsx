
import React from 'react';

const SinkIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="sinkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f7fafc" />
        <stop offset="100%" stopColor="#e2e8f0" />
      </linearGradient>
    </defs>
    <path d="M4 12 L20 12 L18 20 L6 20 Z" fill="url(#sinkGrad)" stroke="#cbd5e0" strokeWidth="0.5"/>
    <ellipse cx="12" cy="16" rx="6" ry="2" fill="#4299e1" opacity="0.6"/>
    <circle cx="12" cy="16" r="1" fill="#2d3748"/>
    <path d="M10 4 L10 12" stroke="#a0aec0" strokeWidth="2"/>
    <path d="M8 4 L12 4" stroke="#a0aec0" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="9" cy="4" r="1" fill="#4299e1"/>
  </svg>
);

export default SinkIcon;
