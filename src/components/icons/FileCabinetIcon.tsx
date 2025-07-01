
import React from 'react';

const FileCabinetIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="cabinetGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#a0aec0" />
        <stop offset="100%" stopColor="#718096" />
      </linearGradient>
    </defs>
    <path d="M6 2 L18 2 L18 22 L6 22 Z" fill="url(#cabinetGrad)" stroke="#4a5568" strokeWidth="0.5" rx="1"/>
    <path d="M6 12 L18 12" stroke="#4a5568" strokeWidth="1"/>
    <path d="M8 7 L16 7 L16 9 L8 9 Z" fill="#e2e8f0" stroke="#cbd5e0" strokeWidth="0.5"/>
    <path d="M8 15 L16 15 L16 17 L8 17 Z" fill="#e2e8f0" stroke="#cbd5e0" strokeWidth="0.5"/>
    <circle cx="14" cy="8" r="0.5" fill="#4a5568"/>
    <circle cx="14" cy="16" r="0.5" fill="#4a5568"/>
  </svg>
);

export default FileCabinetIcon;
