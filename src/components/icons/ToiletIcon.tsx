
import React from 'react';

const ToiletIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="toiletGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f7fafc" />
        <stop offset="100%" stopColor="#e2e8f0" />
      </linearGradient>
    </defs>
    <path d="M8 4 L16 4 L16 8 L8 8 Z" fill="url(#toiletGrad)" stroke="#cbd5e0" strokeWidth="0.5" rx="1"/>
    <path d="M6 8 L18 8 L18 20 L6 20 Z" fill="url(#toiletGrad)" stroke="#cbd5e0" strokeWidth="0.5" rx="2"/>
    <ellipse cx="12" cy="14" rx="4" ry="3" fill="#4299e1" opacity="0.7"/>
    <circle cx="14" cy="6" r="1" fill="#cbd5e0"/>
    <path d="M6 20 L18 20" stroke="#a0aec0" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export default ToiletIcon;
