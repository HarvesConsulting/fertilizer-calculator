import React, { useState, useEffect } from 'react';
import type { FormData } from '../types';
import { StyledFormField } from './StyledFormField';

interface Step1Props {
    onNext: (data: Partial<FormData>) => void;
    data: FormData;
}

export const Step1SoilAnalysis: React.FC<Step1Props> = ({ onNext, data }) => {
    const LOCAL_STORAGE_KEY = 'savedSoilAnalysisData';
    const [formData, setFormData] = useState(data);

    // Load data from localStorage on component mount
    useEffect(() => {
        try {
            const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (savedData) {
                const parsedData = JSON.parse(savedData);
                if (parsedData && typeof parsedData === 'object' && !Array.isArray(parsedData)) {
                    // Only update fields relevant to this step, preserving others
                    setFormData(prev => ({ ...prev, ...parsedData }));
                } else {
                     console.warn('Stored soil analysis data is not a valid object, removing.');
                     localStorage.removeItem(LOCAL_STORAGE_KEY);
                }
            }
        } catch (error) {
            console.error("Failed to load saved soil analysis data from localStorage", error);
            // If parsing fails, remove the corrupted item
            localStorage.removeItem(LOCAL_STORAGE_KEY);
        }
    }, []); // Empty array means run only once on mount


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onNext(formData);
    };

    // Save data to localStorage
    const handleSaveData = () => {
        try {
            const dataToSave = {
                nitrogenAnalysis: formData.nitrogenAnalysis,
                phosphorus: formData.phosphorus,
                potassium: formData.potassium,
                calcium: formData.calcium,
                magnesium: formData.magnesium,
                ph: formData.ph,
                cec: formData.cec,
            };
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToSave));
            alert('Дані аналізу ґрунту збережено!');
        } catch (error) {
            console.error("Failed to save soil analysis data to localStorage", error);
            alert('Не вдалося зберегти дані.');
        }
    };

    const cecTooltip = "Ємність катіонного обміну (ЄКО) — це здатність ґрунту утримувати поживні речовини (катіони), такі як Кальцій, Магній та Калій, захищаючи їх від вимивання. Висока ЄКО означає, що ґрунт може зберігати більше поживних речовин.";

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <h2 className="text-2xl font-semibold text-slate-800 border-b pb-4 mb-6">Крок 1: Введіть дані аналізу ґрунту</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StyledFormField label="Нітратний азот" name="nitrogenAnalysis" value={formData.nitrogenAnalysis} onChange={handleChange} unit="мг/кг" />
                <StyledFormField label="Фосфор (P₂O₅)" name="phosphorus" value={formData.phosphorus} onChange={handleChange} unit="мг/кг" />
                <StyledFormField label="Калій (K₂O)" name="potassium" value={formData.potassium} onChange={handleChange} unit="мг/кг" />
                <StyledFormField label="Кальцій (CaO)" name="calcium" value={formData.calcium} onChange={handleChange} unit="мг/кг" />
                <StyledFormField label="Магній (MgO)" name="magnesium" value={formData.magnesium} onChange={handleChange} unit="мг/кг" />
                <StyledFormField label="Кислотність (pH)" name="ph" value={formData.ph} onChange={handleChange} unit="" step="0.1" max="14" />
                <StyledFormField 
                    label="Ємність катіонного обміну (ЄКО)" 
                    name="cec" 
                    value={formData.cec} 
                    onChange={handleChange} 
                    unit="мг-екв/100г"
                    tooltipText={cecTooltip}
                />
            </div>
            <div className="flex flex-col-reverse sm:flex-row justify-end items-center pt-4 gap-4">
                 <button
                    type="button"
                    onClick={handleSaveData}
                    className="w-full sm:w-auto bg-slate-200 text-slate-800 font-bold py-3 px-6 rounded-lg hover:bg-slate-300 transition duration-300"
                >
                    Запам'ятати введення
                </button>
                <button
                    type="submit"
                    className="w-full sm:w-auto bg-indigo-600 text-white font-bold py-3 px-10 rounded-lg hover:bg-indigo-700 transition duration-300 shadow-lg text-lg"
                >
                    Далі
                </button>
            </div>
        </form>
    );
};
