import React, { useState } from 'react';
import { Language, t } from '../i18n';

interface Step3Props {
    onBack: () => void;
    onSelect: (type: 'basic' | 'fertigation' | 'full') => void;
    lang: Language;
}

const ChoiceButton: React.FC<{ onClick: () => void; title: string; description: string; isSelected: boolean; }> = ({ onClick, title, description, isSelected }) => (
    <button
        onClick={onClick}
        className={`group w-full text-left p-6 border rounded-lg transition duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            isSelected 
                ? 'bg-emerald-50 border-emerald-500 ring-emerald-400' 
                : 'border-slate-200 hover:bg-emerald-50 hover:border-emerald-500 focus:bg-emerald-50 focus:border-emerald-500 focus:ring-emerald-400'
        }`}
    >
        <h3 className={`text-xl font-bold transition-colors ${isSelected ? 'text-emerald-800' : 'text-slate-800 group-hover:text-emerald-800'}`}>{title}</h3>
        <p className={`mt-2 transition-colors ${isSelected ? 'text-emerald-700' : 'text-slate-600 group-hover:text-emerald-700'}`}>{description}</p>
    </button>
);


export const Step3CalculationChoice: React.FC<Step3Props> = ({ onBack, onSelect, lang }) => {
    const [selected, setSelected] = useState<'basic' | 'fertigation' | 'full' | null>(null);

    const handleSelect = (type: 'basic' | 'fertigation' | 'full') => {
        setSelected(type);
        setTimeout(() => {
            onSelect(type);
        }, 300);
    };

    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-semibold text-slate-800 border-b pb-4 mb-6">{t('step3Title', lang)}</h2>
            <div className="space-y-4">
                <ChoiceButton 
                    onClick={() => handleSelect('basic')} 
                    title={t('basicApplicationTitle', lang)}
                    description={t('basicApplicationDesc', lang)}
                    isSelected={selected === 'basic'}
                />
                <ChoiceButton 
                    onClick={() => handleSelect('fertigation')} 
                    title={t('fertigationProgramTitle', lang)}
                    description={t('fertigationProgramDesc', lang)}
                    isSelected={selected === 'fertigation'}
                />
                 <ChoiceButton 
                    onClick={() => handleSelect('full')} 
                    title={t('fullProgramTitle', lang)}
                    description={t('fullProgramDesc', lang)}
                    isSelected={selected === 'full'}
                />
            </div>
            <div className="flex justify-start items-center pt-4">
                 <button
                    type="button"
                    onClick={onBack}
                    className="bg-slate-300 text-slate-800 font-bold py-3 px-10 rounded-lg hover:bg-slate-400 transition duration-300"
                >
                    {t('backButton', lang)}
                </button>
            </div>
        </div>
    );
};