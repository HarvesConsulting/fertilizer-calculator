import React, { useState, useCallback } from 'react';
import type { FormData } from '../types';
import { CULTURES } from '../constants';

interface Step2Props {
    onBack: () => void;
    onCalculate: (data: Partial<FormData>) => void;
    data: FormData;
}

const FormField: React.FC<{ label: string; name: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; unit: string; step?: string }> = 
    ({ label, name, value, onChange, unit, step = "1" }) => (
    <div className="flex flex-col">
        <label htmlFor={name} className="mb-1 font-medium text-gray-700">{label}</label>
        <div className="relative">
            <input
                id={name}
                name={name}
                type="number"
                value={value}
                onChange={onChange}
                step={step}
                min="0"
                className="w-full pl-3 pr-12 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
            />
            <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500">{unit}</span>
        </div>
    </div>
);

const SelectField: React.FC<{ label: string; name: string; value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; options: {value: string; label:string}[]; placeholder: string; disabled?: boolean; }> =
    ({ label, name, value, onChange, options, placeholder, disabled = false }) => (
    <div className="flex flex-col">
        <label htmlFor={name} className="mb-1 font-medium text-gray-700">{label}</label>
        <select
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            disabled={disabled}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
        >
            <option value="">{placeholder}</option>
            {options.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
            ))}
        </select>
    </div>
);

export const Step2CropYield: React.FC<Step2Props> = ({ onBack, onCalculate, data }) => {
    const [formData, setFormData] = useState({
        culture: data.culture,
        plannedYield: data.plannedYield,
    });
    const [error, setError] = useState<string | null>(null);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!formData.culture || formData.plannedYield.trim() === '' || isNaN(parseFloat(formData.plannedYield))) {
            setError('Будь ласка, заповніть всі поля.');
            return;
        }
        
        onCalculate(formData);
    };
    
    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <h2 className="text-2xl font-semibold text-gray-800 border-b pb-4 mb-6">Крок 2: Культура та врожайність</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SelectField
                    label="Оберіть культуру"
                    name="culture"
                    value={formData.culture}
                    onChange={handleChange}
                    options={CULTURES.map(c => ({value: c, label: c}))}
                    placeholder="- Виберіть культуру -"
                />
                <FormField
                    label="Планована врожайність"
                    name="plannedYield"
                    value={formData.plannedYield}
                    onChange={handleChange}
                    unit="т/га"
                />
            </div>

            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">{error}</div>}

            <div className="flex justify-between items-center pt-4">
                 <button
                    type="button"
                    onClick={onBack}
                    className="bg-gray-300 text-gray-800 font-bold py-3 px-10 rounded-lg hover:bg-gray-400 transition duration-300"
                >
                    Назад
                </button>
                <button
                    type="submit"
                    className="bg-blue-600 text-white font-bold py-3 px-10 rounded-lg hover:bg-blue-700 transition duration-300 shadow-lg text-lg"
                >
                    Розрахувати
                </button>
            </div>
        </form>
    );
};
