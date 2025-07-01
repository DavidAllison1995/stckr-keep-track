
import React from 'react';

const BookshelfIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="shelfGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#d69e2e" />
        <stop offset="100%" stopColor="#b7791f" />
      </linearGradient>
    </defs>
    <path d="M3 3 L21 3 L21 21 L3 21 Z" fill="url(#shelfGrad)" stroke="#975a16" strokeWidth="0.5"/>
    <path d="M3 9 L21 9" stroke="#975a16" strokeWidth="1"/>
    <path d="M3 15 L21 15" stroke="#975a16" strokeWidth="1"/>
    <path d="M5 5 L7 5 L7 7 L5 7 Z" fill="#e53e3e"/>
    <path d="M8 5 L10 5 L10 7 L8 7 Z" fill="#4299e1"/>
    <path d="M11 5 L13 5 L13 7 L11 7 Z" fill="#48bb78"/>
    <path d="M5 11 L9 11 L9 13 L5 13 Z" fill="#9f7aea"/>
    <path d="M10 11 L12 11 L12 13 L10 13 Z" fill="#ed8936"/>
    <path d="M5 17 L8 17 L8 19 L5 19 Z" fill="#38b2ac"/>
    <path d="M9 17 L11 17 L11 19 L9 19 Z" fill="#f56565"/>
  </svg>
);

export default BookshelfIcon;
