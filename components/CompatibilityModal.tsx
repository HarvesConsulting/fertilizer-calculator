import React from 'react';

interface CompatibilityModalProps {
    isOpen: boolean;
    onClose: () => void;
    nitrogenFertilizerName: string;
}

const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
);

const XIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);


export const CompatibilityModal: React.FC<CompatibilityModalProps> = ({ isOpen, onClose, nitrogenFertilizerName }) => {
    if (!isOpen) return null;

    const fertilizers = [
        nitrogenFertilizerName,
        'Ортофосфорна к-та',
        'Сульфат калію',
        'Нітрат кальцію',
        'Сульфат магнію'
    ];

    // Key is the fertilizer, value is an array of incompatible fertilizers
    const compatibilityMap: Record<string, string[]> = {
        'Нітрат кальцію': ['Ортофосфорна к-та', 'Сульфат калію', 'Сульфат магнію'],
        'Ортофосфорна к-та': ['Нітрат кальцію'],
        'Сульфат калію': ['Нітрат кальцію'],
        'Сульфат магнію': ['Нітрат кальцію'],
    };

    const areIncompatible = (fert1: string, fert2: string): boolean => {
        return compatibilityMap[fert1]?.includes(fert2) || compatibilityMap[fert2]?.includes(fert1);
    };

    return (
        <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="compatibility-modal-title"
        >
            <div 
                className="bg-white rounded-xl shadow-2xl p-6 md:p-8 w-full max-w-4xl transform transition-all"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-6">
                    <h3 id="compatibility-modal-title" className="text-2xl font-bold text-slate-800">Таблиця сумісності добрив</h3>
                    <button 
                        onClick={onClose} 
                        className="p-2 rounded-full text-slate-500 hover:bg-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        aria-label="Закрити модальне вікно"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <p className="text-sm text-slate-600 mb-6">
                    Таблиця показує можливість змішування добрив в одному баковому розчині. Несумісні добрива слід вносити окремо, щоб уникнути випадання осаду та засмічення системи краплинного зрошення.
                </p>

                <div className="overflow-x-auto rounded-lg border border-slate-200">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-100">
                            <tr>
                                <th className="sticky left-0 bg-slate-100 p-2 md:p-3 z-20"></th>
                                {fertilizers.map(fert => (
                                    <th key={fert} className="p-2 md:p-3 text-xs md:text-sm font-semibold text-slate-600 tracking-wider align-bottom transform -rotate-45 h-32" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)'}}>
                                        <div className="whitespace-nowrap">{fert}</div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {fertilizers.map((rowFert) => (
                                <tr key={rowFert} className="group hover:bg-indigo-50/50">
                                    <td className="sticky left-0 bg-white group-hover:bg-indigo-50/50 p-2 md:p-3 text-sm font-semibold text-slate-700 whitespace-nowrap z-10">
                                        {rowFert}
                                    </td>
                                    {fertilizers.map((colFert) => {
                                        const incompatible = areIncompatible(rowFert, colFert);
                                        return (
                                            <td key={colFert} className="p-2 md:p-3 text-center">
                                                <div className="flex justify-center items-center">
                                                    {incompatible ? <XIcon /> : <CheckIcon />}
                                                </div>
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                 <div className="mt-6 flex justify-end">
                     <button
                        onClick={onClose}
                        className="bg-indigo-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-indigo-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        Зрозуміло
                    </button>
                </div>
            </div>
        </div>
    );
};
