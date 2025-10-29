import React from 'react';

export const Logo: React.FC<{ className?: string, title?: string }> = ({ className, title = "Логотип калькулятора" }) => (
    <svg viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} role="img">
        <title>{title}</title>
        <path d="M256 424C164.736 424 88 347.264 88 256C88 164.736 164.736 88 256 88C347.264 88 424 164.736 424 256C424 347.264 347.264 424 256 424Z" fill="url(#paint0_linear_9_2)"/>
        <path d="M256 360V256C256 256 256 200 312 200" stroke="white" strokeWidth="32" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M256 304C256 304 216 288 208 248" stroke="white" strokeWidth="32" strokeLinecap="round" strokeLinejoin="round"/>
        <defs>
        <linearGradient id="paint0_linear_9_2" x1="88" y1="88" x2="424" y2="424" gradientUnits="userSpaceOnUse">
        <stop stopColor="#22C55E"/>
        <stop offset="1" stopColor="#16A34A"/>
        </linearGradient>
        </defs>
    </svg>
);
