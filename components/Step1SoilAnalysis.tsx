import React, { useState, useCallback } from 'react';
import type { FormData } from '../types';

interface Step1Props {
    onNext: (data: Partial<FormData>) => void;
    data: FormData;
}

const FormField: React.FC<{ label: string; name: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; unit: string; type?: string; step?: string; min?: string; max?: string }> = 
    ({ label, name, value, onChange, unit, type = 'number', step = "0.1", min = "0" }) => (
    <div className="flex flex-col">
        <label htmlFor={name} className="mb-1 font-medium text-gray-700">{label}</label>
        <div className="relative">
            <input
                id={name}
                name={name}
                type={type}
                value={value}
                onChange={onChange}
                min={min}
                step={step}
                className="w-full pl-3 pr-16 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
            />
            <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500">{unit}</span>
        </div>
    </div>
);


export const Step1SoilAnalysis: React.FC<Step1Props> = ({ onNext, data }) => {
    const [formData, setFormData] = useState({
        nitrogenAnalysis: data.nitrogenAnalysis,
        phosphorus: data.phosphorus,
        potassium: data.potassium,
        calcium: data.calcium,
        magnesium: data.magnesium,
        ph: data.ph,
        cec: data.cec,
    });
    const [error, setError] = useState<string | null>(null);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        for (const value of Object.values(formData)) {
            // FIX: Explicitly convert `value` to a string before using string methods or passing to functions expecting a string.
            // TypeScript infers `value` as `unknown` from `Object.values`, so conversion is necessary.
            if (String(value).trim() === '' || isNaN(parseFloat(String(value)))) {
                setError('Будь ласка, заповніть всі поля коректними числовими значеннями.');
                return;
            }
        }
        onNext(formData);
    };

    return (
         <form onSubmit={handleSubmit} className="space-y-8">
             <h2 className="text-2xl font-semibold text-gray-800 border-b pb-4 mb-6">Крок 1: Аналіз ґрунту</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <FormField label="Нітратний азот" name="nitrogenAnalysis" value={formData.nitrogenAnalysis} onChange={handleChange} unit="мг/кг" step="1"/>
                <FormField label="Фосфор (P₂O₅)" name="phosphorus" value={formData.phosphorus} onChange={handleChange} unit="мг/кг" step="1"/>
                <FormField label="Калій (K₂O)" name="potassium" value={formData.potassium} onChange={handleChange} unit="мг/кг" step="1"/>
                <FormField label="Кальцій (CaO)" name="calcium" value={formData.calcium} onChange={handleChange} unit="мг/кг" step="1"/>
                <FormField label="Магній (MgO)" name="magnesium" value={formData.magnesium} onChange={handleChange} unit="мг/кг" step="1"/>
                <FormField label="Кислотність (pH)" name="ph" value={formData.ph} onChange={handleChange} unit="" min="1" max="14"/>
                <FormField label="ЄКО" name="cec" value={formData.cec} onChange={handleChange} unit="мг-екв/100г"/>
             </div>

             {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">{error}</div>}

             <div className="text-center pt-4">
                <button
                    type="submit"
                    className="w-full md:w-auto bg-blue-600 text-white font-bold py-3 px-10 rounded-lg hover:bg-blue-700 transition duration-300 shadow-lg text-lg"
                >
                    Далі
                </button>
            </div>
        </form>
    );
};