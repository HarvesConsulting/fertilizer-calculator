import React, { useState, useEffect, useRef } from 'react';

export interface DropdownAction {
    label: string;
    onClick: () => void;
    iconType?: 'txt' | 'json' | 'upload' | 'save';
}

interface DropdownButtonProps {
    actions: DropdownAction[];
    buttonLabel: string;
    buttonIcon: React.ReactNode;
}

const TxtIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

const JsonIcon = () => (
     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
);

const UploadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);

const SaveIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
    </svg>
);

const ICONS: Record<string, React.ReactNode> = {
    'txt': <TxtIcon />,
    'json': <JsonIcon />,
    'upload': <UploadIcon />,
    'save': <SaveIcon />,
};

export const DropdownButton: React.FC<DropdownButtonProps> = ({ actions, buttonLabel, buttonIcon }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const menuId = 'save-options-menu';

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleActionClick = (onClick: () => void) => {
        onClick();
        setIsOpen(false);
    };

    if (actions.length === 0) return null;

    return (
        <div className="relative inline-block text-left" ref={dropdownRef}>
            <div>
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full sm:w-auto inline-flex justify-center items-center gap-2 bg-white text-slate-700 font-semibold py-3 px-4 rounded-lg hover:bg-slate-100 transition-colors duration-300 border border-slate-300 shadow-sm"
                    id="save-menu-button"
                    aria-haspopup="true"
                    aria-expanded={isOpen}
                    aria-controls={isOpen ? menuId : undefined}
                >
                    {buttonIcon}
                    <span className="hidden sm:inline">{buttonLabel}</span>
                    <svg className="-mr-1 ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.23 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>

            {isOpen && (
                <div
                    className="absolute left-0 sm:right-0 sm:left-auto z-10 mt-2 w-64 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                    id={menuId}
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="save-menu-button"
                >
                    <div className="py-1" role="none">
                        {actions.map((action, index) => (
                            <button
                                key={index}
                                onClick={() => handleActionClick(action.onClick)}
                                className="w-full text-left text-slate-700 block px-4 py-3 text-sm hover:bg-slate-100 flex items-center"
                                role="menuitem"
                            >
                                {action.iconType && ICONS[action.iconType]}
                                {action.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
