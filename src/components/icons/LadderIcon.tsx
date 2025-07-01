
import React from 'react';

const LadderIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="ladderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffd700" />
        <stop offset="100%" stopColor="#ff8c00" />
      </linearGradient>
    </defs>
    <path d="M7 2 L7 22" stroke="url(#ladderGrad)" strokeWidth="2" strokeLinecap="round"/>
    <path d="M17 2 L17 22" stroke="url(#ladderGrad)" strokeWidth="2" strokeLinecap="round"/>
    <path d="M7 6 L17 6" stroke="#e68900" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M7 10 L17 10" stroke="#e68900" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M7 14 L17 14" stroke="#e68900" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M7 18 L17 18" stroke="#e68900" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

export default LadderIcon;
