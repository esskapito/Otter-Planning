import React from 'react';

export const OtterLogo: React.FC<{ className?: string }> = ({ className = "w-10 h-10" }) => (
  <svg 
    viewBox="0 0 100 100" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
  >
    {/* Background Circle with Gradient */}
    <defs>
      <linearGradient id="otterGrad" x1="0" y1="0" x2="100" y2="100">
        <stop offset="0%" stopColor="#818cf8" />
        <stop offset="100%" stopColor="#4f46e5" />
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="48" fill="url(#otterGrad)" />
    
    {/* Ears */}
    <circle cx="22" cy="35" r="8" fill="#312e81" fillOpacity="0.2" />
    <circle cx="78" cy="35" r="8" fill="#312e81" fillOpacity="0.2" />
    
    {/* Head */}
    <path 
      d="M20 55 C20 35, 80 35, 80 55 C80 80, 20 80, 20 55" 
      fill="#e0e7ff" 
    />
    
    {/* Eyes */}
    <circle cx="35" cy="52" r="4" fill="#1e1b4b" />
    <circle cx="65" cy="52" r="4" fill="#1e1b4b" />
    
    {/* Snout */}
    <ellipse cx="50" cy="62" rx="12" ry="8" fill="#c7d2fe" />
    <path 
      d="M44 60 Q50 66 56 60 L50 65 Z" 
      fill="#1e1b4b" 
    />
    
    {/* Whiskers */}
    <path d="M25 62 L15 60 M25 65 L15 66 M75 62 L85 60 M75 65 L85 66" stroke="#1e1b4b" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
  </svg>
);