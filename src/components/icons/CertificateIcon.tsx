
import React from 'react';

const CertificateIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="certGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f7fafc" />
        <stop offset="100%" stopColor="#e2e8f0" />
      </linearGradient>
    </defs>
    <path d="M4 3 L20 3 L20 21 L4 21 Z" fill="url(#certGrad)" stroke="#cbd5e0" strokeWidth="0.5"/>
    <circle cx="12" cy="8" r="2" fill="#ffd700" stroke="#e6c200" strokeWidth="0.5"/>
    <path d="M6 12 L18 12" stroke="#718096" strokeWidth="1"/>
    <path d="M6 14 L18 14" stroke="#718096" strokeWidth="0.5"/>
    <path d="M6 16 L15 16" stroke="#718096" strokeWidth="0.5"/>
    <path d="M16 18 L12 16 L16 14 L18 16 Z" fill="#e53e3e" stroke="#c53030" strokeWidth="0.5"/>
  </svg>
);

export default CertificateIcon;
