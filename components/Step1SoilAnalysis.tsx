
import React from 'react';
import type { FormData } from '../types';
import { StyledFormField } from './StyledFormField';
import { DropdownButton, DropdownAction } from './SaveButtonDropdown';
import { Language, t } from '../i18n';

interface Step1Props {
    onNext: () => void;
    onBack: () => void;
    data: FormData;
    onDataChange: (newData: Partial<FormData>) => void;
    lang: Language;
}

const DataActionsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m12 0a2 2 0 100-4m0 4a2 2 0 110-4m-6 0a2 2 0 100-4m0 4a2 2 0 110-4" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a2 2 0 100-4m0 4a2 2 0 110-4" />
    </svg>
);

const RememberIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
    </svg>
);


export const Step1SoilAnalysis: React.FC<Step1Props> = ({ onNext, onBack, data, onDataChange, lang }) => {
    const LOCAL_STORAGE_KEY = 'savedSoilAnalysisData';
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        onDataChange({ [name]: value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onNext();
    };

    const handleSaveData = () => {
        try {
            const dataToSave = {
                nitrogenAnalysis: data.nitrogenAnalysis,
                phosphorus: data.phosphorus,
                potassium: data.potassium,
                calcium: data.calcium,
                magnesium: data.magnesium,
                ph: data.ph,
                cec: data.cec,
            };
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToSave));
            alert(t('dataSavedSuccess', lang));
        } catch (error) {
            console.error("Failed to save soil analysis data to localStorage", error);
            alert(t('dataSaveError', lang));
        }
    };
    
    const handleLoadData = () => {
        try {
            const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (savedData) {
                const parsedData = JSON.parse(savedData);
                if (parsedData && typeof parsedData === 'object' && !Array.isArray(parsedData)) {
                    onDataChange(parsedData);
                    alert(t('dataLoadedSuccess', lang));
                } else {
                     console.warn('Stored soil analysis data is not a valid object, removing.');
                     localStorage.removeItem(LOCAL_STORAGE_KEY);
                     alert(t('dataLoadInvalid', lang));
                }
            } else {
                alert(t('dataNotFound', lang));
            }
        } catch (error) {
            console.error("Failed to load saved soil analysis data from localStorage", error);
            alert(t('dataLoadError', lang));
            localStorage.removeItem(LOCAL_STORAGE_KEY);
        }
    };

    const cecTooltip = t('cecTooltip', lang);
    
    const dataActions: DropdownAction[] = [
        {
            label: t('loadDataAction', lang),
            onClick: handleLoadData,
            iconType: 'upload'
        }
    ];

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <h2 className="text-2xl font-semibold text-slate-800 border-b pb-4 mb-6">{t('step1Title', lang)}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StyledFormField label={t('nitrogenAnalysisLabel', lang)} name="nitrogenAnalysis" value={data.nitrogenAnalysis} onChange={handleChange} unit="mg/kg" />
                <StyledFormField label={t('phosphorusLabel', lang)} name="phosphorus" value={data.phosphorus} onChange={handleChange} unit="mg/kg" />
                <StyledFormField label={t('potassiumLabel', lang)} name="potassium" value={data.potassium} onChange={handleChange} unit="mg/kg" />
                <StyledFormField label={t('calciumLabel', lang)} name="calcium" value={data.calcium} onChange={handleChange} unit="mg/kg" />
                <StyledFormField label={t('magnesiumLabel', lang)} name="magnesium" value={data.magnesium} onChange={handleChange} unit="mg/kg" />
                <StyledFormField label={t('phLabel', lang)} name="ph" value={data.ph} onChange={handleChange} unit="" step="0.1" max="14" />
                <StyledFormField 
                    label={t('cecLabel', lang)}
                    name="cec" 
                    value={data.cec} 
                    onChange={handleChange} 
                    unit="mg-eq/100g"
                    tooltipText={cecTooltip}
                />
            </div>

             <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-8 border-t mt-8">
                <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
                     <button
                        type="button"
                        onClick={onBack}
                        className="bg-slate-300 text-slate-800 font-bold py-3 px-6 rounded-lg hover:bg-slate-400 transition duration-300 w-full sm:w-auto"
                    >
                        {t('backButton', lang)}
                    </button>
                    <button
                        type="button"
                        onClick={handleSaveData}
                        className="flex items-center justify-center gap-2 bg-emerald-100 text-emerald-800 font-bold py-3 px-6 rounded-lg hover:bg-emerald-200 transition duration-300 w-full sm:w-auto shadow-sm"
                        title={t('saveDataAction', lang)}
                    >
                        <RememberIcon />
                        <span>{t('rememberAnalysis', lang)}</span>
                    </button>
                    <DropdownButton actions={dataActions} buttonLabel={t('dataActionsButton', lang)} buttonIcon={<DataActionsIcon />} />
                </div>
                <button
                    type="submit"
                    className="w-full sm:w-auto bg-indigo-600 text-white font-bold py-3 px-10 rounded-lg hover:bg-indigo-700 transition duration-300 shadow-lg text-lg"
                >
                    {t('nextButton', lang)}
                </button>
            </div>
        </form>
    );
};
