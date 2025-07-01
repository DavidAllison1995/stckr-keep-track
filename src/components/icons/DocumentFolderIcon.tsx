
import React from 'react';

const DocumentFolderIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="folderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffd700" />
        <stop offset="100%" stopColor="#ff8c00" />
      </linearGradient>
    </defs>
    <path d="M3 6 L10 6 L12 4 L21 4 L21 20 L3 20 Z" fill="url(#folderGrad)" stroke="#e68900" strokeWidth="0.5"/>
    <path d="M3 8 L21 8" stroke="#e68900" strokeWidth="0.5"/>
    <path d="M6 11 L9 11 L9 17 L6 17 Z" fill="#fff" stroke="#cbd5e0" strokeWidth="0.5"/>
    <path d="M10 11 L13 11 L13 17 L10 17 Z" fill="#fff" stroke="#cbd5e0" strokeWidth="0.5"/>
    <path d="M14 11 L17 11 L17 17 L14 17 Z" fill="#fff" stroke="#cbd5e0" strokeWidth="0.5"/>
  </svg>
);

export default DocumentFolderIcon;
