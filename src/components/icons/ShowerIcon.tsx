
import React from 'react';

const ShowerIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="showerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#a0aec0" />
        <stop offset="100%" stopColor="#718096" />
      </linearGradient>
    </defs>
    <circle cx="12" cy="6" r="3" fill="url(#showerGrad)" stroke="#4a5568" strokeWidth="0.5"/>
    <path d="M12 9 L12 21" stroke="#4a5568" strokeWidth="2"/>
    <circle cx="10" cy="12" r="0.5" fill="#4299e1"/>
    <circle cx="12" cy="13" r="0.5" fill="#4299e1"/>
    <circle cx="14" cy="12" r="0.5" fill="#4299e1"/>
    <circle cx="11" cy="15" r="0.5" fill="#4299e1"/>
    <circle cx="13" cy="16" r="0.5" fill="#4299e1"/>
    <circle cx="10" cy="18" r="0.5" fill="#4299e1"/>
    <circle cx="14" cy="17" r="0.5" fill="#4299e1"/>
    <circle cx="12" cy="19" r="0.5" fill="#4299e1"/>
  </svg>
);

export default ShowerIcon;
