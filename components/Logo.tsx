import React from 'react';

export const Logo: React.FC<{ className?: string, title?: string }> = ({ className, title = "Логотип Harvest Counsulting" }) => (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} role="img" aria-label={title}>
        <title>{title}</title>
        <path d="M 50, 25 A 75,75 0 1 1 25,100" stroke="#2E7D32" strokeWidth="14" strokeLinecap="round" />
        <path d="M 150,175 A 75,75 0 1 1 175,100" stroke="#66BB6A" strokeWidth="10" strokeLinecap="round" />

        <text x="100" y="88" fontFamily="Verdana, sans-serif" fontSize="19" fill="#2d3748" textAnchor="middle" fontWeight="600">Harvest</text>
        <line x1="65" y1="100" x2="135" y2="100" stroke="#388E3C" strokeWidth="2"/>
        <text x="100" y="122" fontFamily="Verdana, sans-serif" fontSize="19" fill="#2d3748" textAnchor="middle" fontWeight="600">Counsulting</text>
    </svg>
);
