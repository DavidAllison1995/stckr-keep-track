
import React from 'react';

const PrinterIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="printerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#e2e8f0" />
        <stop offset="100%" stopColor="#cbd5e0" />
      </linearGradient>
    </defs>
    <path d="M6 2 L18 2 L18 6 L6 6 Z" fill="url(#printerGrad)" stroke="#a0aec0" strokeWidth="0.5"/>
    <path d="M4 6 L20 6 L20 16 L4 16 Z" fill="url(#printerGrad)" stroke="#a0aec0" strokeWidth="0.5" rx="1"/>
    <path d="M6 12 L18 12 L18 22 L6 22 Z" fill="#f7fafc" stroke="#cbd5e0" strokeWidth="0.5"/>
    <circle cx="17" cy="9" r="1" fill="#48bb78"/>
    <path d="M8 4 L16 4" stroke="#718096" strokeWidth="1"/>
    <path d="M8 14 L16 14" stroke="#718096" strokeWidth="0.5"/>
    <path d="M8 16 L14 16" stroke="#718096" strokeWidth="0.5"/>
    <path d="M8 18 L12 18" stroke="#718096" strokeWidth="0.5"/>
  </svg>
);

export default PrinterIcon;
