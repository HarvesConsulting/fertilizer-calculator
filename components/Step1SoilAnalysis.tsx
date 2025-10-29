import React, { useState } from 'react';
import type { FormData } from '../types';
import { StyledFormField } from './StyledFormField';

interface Step1Props {
    onNext: (data: Partial<FormData>) => void;
    data: FormData;
}

export const Step1SoilAnalysis: React.FC<Step1Props> = ({ onNext, data }) => {
    const [formData, setFormData] = useState(data);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onNext(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <h2 className="text-2xl font-semibold text-gray-800 border-b pb-4 mb-6">Крок 1: Введіть дані аналізу ґрунту</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StyledFormField label="Нітратний азот" name="nitrogenAnalysis" value={formData.nitrogenAnalysis} onChange={handleChange} unit="мг/кг" />
                <StyledFormField label="Фосфор (P₂O₅)" name="phosphorus" value={formData.phosphorus} onChange={handleChange} unit="мг/кг" />
                <StyledFormField label="Калій (K₂O)" name="potassium" value={formData.potassium} onChange={handleChange} unit="мг/кг" />
                <StyledFormField label="Кальцій (CaO)" name="calcium" value={formData.calcium} onChange={handleChange} unit="мг/кг" />
                <StyledFormField label="Магній (MgO)" name="magnesium" value={formData.magnesium} onChange={handleChange} unit="мг/кг" />
                <StyledFormField label="Кислотність (pH)" name="ph" value={formData.ph} onChange={handleChange} unit="" step="0.1" max="14" />
                <StyledFormField label="Ємність катіонного обміну (ЄКО)" name="cec" value={formData.cec} onChange={handleChange} unit="мг-екв/100г" />
            </div>
            <div className="flex justify-end items-center pt-4">
                <button
                    type="submit"
                    className="bg-blue-600 text-white font-bold py-3 px-10 rounded-lg hover:bg-blue-700 transition duration-300 shadow-lg text-lg"
                >
                    Далі
                </button>
            </div>
        </form>
    );
};
