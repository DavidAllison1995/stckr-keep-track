
import React from 'react';

const PlantIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="plantGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#22c55e" />
        <stop offset="100%" stopColor="#16a34a" />
      </linearGradient>
    </defs>
    <path d="M12 15 Q8 10 10 6 Q12 8 12 12 Q12 8 14 6 Q16 10 12 15" fill="url(#plantGrad)" stroke="#15803d" strokeWidth="0.5"/>
    <rect x="11" y="15" width="2" height="3" fill="#92400e"/>
    <ellipse cx="12" cy="20" rx="4" ry="2" fill="#a3a3a3" stroke="#737373" strokeWidth="1"/>
    <ellipse cx="12" cy="19.5" rx="3" ry="1.5" fill="#d4d4d8"/>
  </svg>
);

export default PlantIcon;
