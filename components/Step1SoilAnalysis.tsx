import React from 'react';
import type { FormData } from '../types';
import { StyledFormField } from './StyledFormField';
import { DropdownButton, DropdownAction } from './SaveButtonDropdown';

interface Step1Props {
    onNext: () => void;
    onBack: () => void;
    data: FormData;
    onDataChange: (newData: Partial<FormData>) => void;
}

const DataActionsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m12 0a2 2 0 100-4m0 4a2 2 0 110-4m-6 0a2 2 0 100-4m0 4a2 2 0 110-4" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a2 2 0 100-4m0 4a2 2 0 110-4" />
    </svg>
);


export const Step1SoilAnalysis: React.FC<Step1Props> = ({ onNext, onBack, data, onDataChange }) => {
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
            alert('Дані аналізу ґрунту збережено!');
        } catch (error) {
            console.error("Failed to save soil analysis data to localStorage", error);
            alert('Не вдалося зберегти дані.');
        }
    };
    
    const handleLoadData = () => {
        try {
            const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (savedData) {
                const parsedData = JSON.parse(savedData);
                if (parsedData && typeof parsedData === 'object' && !Array.isArray(parsedData)) {
                    onDataChange(parsedData);
                    alert('Збережені дані завантажено.');
                } else {
                     console.warn('Stored soil analysis data is not a valid object, removing.');
                     localStorage.removeItem(LOCAL_STORAGE_KEY);
                     alert('Збережені дані пошкоджено або мають неправильний формат.');
                }
            } else {
                alert('Збережені дані не знайдено.');
            }
        } catch (error) {
            console.error("Failed to load saved soil analysis data from localStorage", error);
            alert('Не вдалося завантажити дані.');
            localStorage.removeItem(LOCAL_STORAGE_KEY);
        }
    };

    const cecTooltip = "Ємність катіонного обміну (ЄКО) — це здатність ґрунту утримувати поживні речовини (катіони), такі як Кальцій, Магній та Калій, захищаючи їх від вимивання. Висока ЄКО означає, що ґрунт може зберігати більше поживних речовин.";
    
    const dataActions: DropdownAction[] = [
        {
            label: 'Завантажити збережені',
            onClick: handleLoadData,
            iconType: 'upload'
        },
        {
            label: `Запам'ятати введення`,
            onClick: handleSaveData,
            iconType: 'save'
        }
    ];

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <h2 className="text-2xl font-semibold text-slate-800 border-b pb-4 mb-6">Крок 1: Введіть дані аналізу ґрунту</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StyledFormField label="Нітратний азот" name="nitrogenAnalysis" value={data.nitrogenAnalysis} onChange={handleChange} unit="мг/кг" />
                <StyledFormField label="Фосфор (P₂O₅)" name="phosphorus" value={data.phosphorus} onChange={handleChange} unit="мг/кг" />
                <StyledFormField label="Калій (K₂O)" name="potassium" value={data.potassium} onChange={handleChange} unit="мг/кг" />
                <StyledFormField label="Кальцій (CaO)" name="calcium" value={data.calcium} onChange={handleChange} unit="мг/кг" />
                <StyledFormField label="Магній (MgO)" name="magnesium" value={data.magnesium} onChange={handleChange} unit="мг/кг" />
                <StyledFormField label="Кислотність (pH)" name="ph" value={data.ph} onChange={handleChange} unit="" step="0.1" max="14" />
                <StyledFormField 
                    label="Ємність катіонного обміну (ЄКО)" 
                    name="cec" 
                    value={data.cec} 
                    onChange={handleChange} 
                    unit="мг-екв/100г"
                    tooltipText={cecTooltip}
                />
            </div>

             <div className="flex justify-between items-center pt-8 border-t mt-8">
                <div className="flex items-center gap-4">
                     <button
                        type="button"
                        onClick={onBack}
                        className="bg-slate-300 text-slate-800 font-bold py-3 px-6 sm:px-10 rounded-lg hover:bg-slate-400 transition duration-300"
                    >
                        Назад
                    </button>
                    <DropdownButton actions={dataActions} buttonLabel="Дії з даними" buttonIcon={<DataActionsIcon />} />
                </div>
                <button
                    type="submit"
                    className="bg-indigo-600 text-white font-bold py-3 px-10 rounded-lg hover:bg-indigo-700 transition duration-300 shadow-lg text-lg"
                >
                    Далі
                </button>
            </div>
        </form>
    );
};
