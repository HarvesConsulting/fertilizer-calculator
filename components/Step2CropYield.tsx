import React, { useState } from 'react';
import type { FormData } from '../types';
import { CULTURES } from '../constants';
import { StyledFormField } from './StyledFormField';
import { StyledSelectField } from './StyledSelectField';

interface Step2Props {
    onBack: () => void;
    onCalculate: (data: Partial<FormData>) => void;
    data: FormData;
}

export const Step2CropYield: React.FC<Step2Props> = ({ onBack, onCalculate, data }) => {
    const [formData, setFormData] = useState(data);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onCalculate(formData);
    };
    
    const cultureOptions = CULTURES.map(c => ({ value: c, label: c }));

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <h2 className="text-2xl font-semibold text-slate-800 border-b pb-4 mb-6">Крок 2: Оберіть культуру та врожайність</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <StyledSelectField
                    label="Культура"
                    name="culture"
                    value={formData.culture}
                    onChange={handleChange}
                    options={cultureOptions}
                    placeholder="Оберіть культуру"
                />
                <StyledFormField
                    label="Планована врожайність"
                    name="plannedYield"
                    value={formData.plannedYield}
                    onChange={handleChange}
                    unit="т/га"
                />
            </div>
            <div className="flex justify-between items-center pt-4">
                <button
                    type="button"
                    onClick={onBack}
                    className="bg-slate-300 text-slate-800 font-bold py-3 px-10 rounded-lg hover:bg-slate-400 transition duration-300"
                >
                    Назад
                </button>
                <button
                    type="submit"
                    className="bg-indigo-600 text-white font-bold py-3 px-10 rounded-lg hover:bg-indigo-700 transition duration-300 shadow-lg text-lg"
                >
                    Розрахувати
                </button>
            </div>
        </form>
    );
};