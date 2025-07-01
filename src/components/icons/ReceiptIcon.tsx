
import React from 'react';

const ReceiptIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="receiptGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f7fafc" />
        <stop offset="100%" stopColor="#e2e8f0" />
      </linearGradient>
    </defs>
    <path d="M6 2 L18 2 L18 22 L15 20 L12 22 L9 20 L6 22 Z" fill="url(#receiptGrad)" stroke="#cbd5e0" strokeWidth="0.5"/>
    <path d="M8 6 L16 6" stroke="#718096" strokeWidth="1"/>
    <path d="M8 8 L14 8" stroke="#718096" strokeWidth="0.5"/>
    <path d="M8 10 L16 10" stroke="#718096" strokeWidth="0.5"/>
    <path d="M8 12 L12 12" stroke="#718096" strokeWidth="0.5"/>
    <path d="M14 14 L16 14" stroke="#48bb78" strokeWidth="2"/>
  </svg>
);

export default ReceiptIcon;
