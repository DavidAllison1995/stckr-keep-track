
import React from 'react';

const StorageBoxIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="storageGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#d69e2e" />
        <stop offset="100%" stopColor="#b7791f" />
      </linearGradient>
    </defs>
    <path d="M4 6 L20 6 L20 20 L4 20 Z" fill="url(#storageGrad)" stroke="#975a16" strokeWidth="0.5" rx="1"/>
    <path d="M4 10 L20 10" stroke="#975a16" strokeWidth="1"/>
    <path d="M4 14 L20 14" stroke="#975a16" strokeWidth="1"/>
    <circle cx="18" cy="8" r="1" fill="#2d3748"/>
    <circle cx="18" cy="12" r="1" fill="#2d3748"/>
    <circle cx="18" cy="16" r="1" fill="#2d3748"/>
    <path d="M6 8 L14 8" stroke="#975a16" strokeWidth="0.5"/>
    <path d="M6 12 L14 12" stroke="#975a16" strokeWidth="0.5"/>
    <path d="M6 16 L14 16" stroke="#975a16" strokeWidth="0.5"/>
  </svg>
);

export default StorageBoxIcon;
