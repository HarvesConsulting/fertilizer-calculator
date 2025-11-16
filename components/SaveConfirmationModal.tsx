import React, { useState, useEffect } from 'react';
import type { FormData } from '../types';
import { Language, t } from '../i18n';
import { CULTURES } from '../constants';

interface SaveConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (selectedIndices: number[]) => void;
    analyses: FormData[];
    recordedIndices: Set<number>;
    lang: Language;
}

export const SaveConfirmationModal: React.FC<SaveConfirmationModalProps> = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    analyses, 
    recordedIndices, 
    lang 
}) => {
    const [selected, setSelected] = useState<Set<number>>(new Set());

    useEffect(() => {
        if (isOpen) {
            setSelected(new Set(recordedIndices));
        }
    }, [isOpen, recordedIndices]);

    if (!isOpen) return null;

    const handleToggle = (index: number) => {
        setSelected(prev => {
            const newSet = new Set(prev);
            if (newSet.has(index)) {
                newSet.delete(index);
            } else {
                newSet.add(index);
            }
            return newSet;
        });
    };

    const handleSelectAll = () => {
        setSelected(new Set(recordedIndices));
    };

    const handleDeselectAll = () => {
        setSelected(new Set());
    };

    const handleConfirm = () => {
        onConfirm(Array.from(selected));
    };
    
    // FIX: Explicitly type `index` as `number` to fix type inference issue where it was being treated as `unknown`.
    const recordedAnalyses = Array.from(recordedIndices).map((index: number) => ({
        index,
        data: analyses[index]
    }));

    return (
        <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="save-modal-title"
        >
            <div 
                className="bg-white rounded-xl shadow-2xl p-6 md:p-8 w-full max-w-2xl transform transition-all"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4">
                    <h3 id="save-modal-title" className="text-2xl font-bold text-slate-800">{t('saveModalTitle', lang)}</h3>
                    <button 
                        onClick={onClose} 
                        className="p-2 rounded-full text-slate-500 hover:bg-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        aria-label={t('compatibilityModalClose', lang)}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <p className="text-slate-600 mb-6">{t('saveModalDesc', lang)}</p>

                <div className="flex justify-end gap-2 mb-4">
                     <button onClick={handleSelectAll} className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 px-3 py-1 rounded">{t('saveModalSelectAll', lang)}</button>
                     <button onClick={handleDeselectAll} className="text-sm font-semibold text-slate-600 hover:text-slate-800 px-3 py-1 rounded">{t('saveModalDeselectAll', lang)}</button>
                </div>
                
                <div className="max-h-80 overflow-y-auto space-y-2 pr-2 border rounded-lg p-3 bg-slate-50">
                    {recordedAnalyses.map(({ index, data }) => (
                        <label key={index} htmlFor={`analysis-checkbox-${index}`} className="flex items-center p-3 bg-white rounded-md shadow-sm cursor-pointer hover:bg-indigo-50 transition-colors">
                            <input 
                                id={`analysis-checkbox-${index}`}
                                type="checkbox"
                                checked={selected.has(index)}
                                onChange={() => handleToggle(index)}
                                className="h-5 w-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <div className="ml-4 flex-grow">
                                <p className="font-semibold text-slate-800">{data.fieldName || t('analysisTab', lang, { index: index + 1 })}</p>
                                <p className="text-sm text-slate-600">{CULTURES.find(c => c.key === data.culture)?.name[lang] || data.culture}</p>
                            </div>
                        </label>
                    ))}
                </div>

                 <div className="mt-8 flex flex-col-reverse sm:flex-row justify-end items-center gap-4">
                     <button
                        onClick={onClose}
                        className="w-full sm:w-auto bg-slate-200 text-slate-800 font-semibold py-3 px-6 rounded-lg hover:bg-slate-300 transition-colors"
                    >
                        {t('saveModalCancelButton', lang)}
                    </button>
                     <button
                        onClick={handleConfirm}
                        disabled={selected.size === 0}
                        className="w-full sm:w-auto bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors shadow-lg disabled:bg-indigo-300 disabled:cursor-not-allowed"
                    >
                        {t('saveModalConfirmButton', lang, { count: selected.size })}
                    </button>
                </div>
            </div>
        </div>
    );
};