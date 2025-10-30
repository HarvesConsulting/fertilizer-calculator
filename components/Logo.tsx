import React from 'react';

export const Logo: React.FC<{ className?: string, title?: string }> = ({ className, title = "Логотип Harvest Consulting" }) => (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} role="img" aria-label={title}>
        <title>{title}</title>
        <circle cx="100" cy="100" r="100" fill="white"/>
        <circle cx="100" cy="100" r="92" stroke="#2E7D32" strokeWidth="12" fill="none" />
        
        <text x="100" y="88" fontFamily="Verdana, sans-serif" fontSize="19" fill="#2d3748" textAnchor="middle" fontWeight="600">Harvest</text>
        <line x1="65" y1="100" x2="135" y2="100" stroke="#388E3C" strokeWidth="2"/>
        <text x="100" y="122" fontFamily="Verdana, sans-serif" fontSize="19" fill="#2d3748" textAnchor="middle" fontWeight="600">Consulting</text>
    </svg>
);