import React from 'react';
import type { FormData } from '../types';
import { CULTURES } from '../constants';
import { StyledFormField } from './StyledFormField';
import { StyledSelectField } from './StyledSelectField';

interface Step2Props {
    onBack: () => void;
    onCalculate: () => void;
    data: FormData;
    onDataChange: (newData: Partial<FormData>) => void;
    isGroupMode: boolean;
    isCalculationDisabled: boolean;
}

export const Step2CropYield: React.FC<Step2Props> = ({ onBack, onCalculate, data, onDataChange, isGroupMode, isCalculationDisabled }) => {

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        onDataChange({ [name]: value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onCalculate();
    };
    
    const cultureOptions = CULTURES.map(c => ({ value: c, label: c }));

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <h2 className="text-2xl font-semibold text-slate-800 border-b pb-4 mb-6">Крок 2: Оберіть культуру, врожайність та площу</h2>
            <div className="space-y-6">
                <StyledFormField
                    label="Назва поля"
                    name="fieldName"
                    value={data.fieldName || ''}
                    onChange={handleChange}
                    unit=""
                    type="text"
                    required={false}
                />
                <StyledSelectField
                    label="Культура"
                    name="culture"
                    value={data.culture}
                    onChange={handleChange}
                    options={cultureOptions}
                    placeholder="Оберіть культуру"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <StyledFormField
                        label="Планована врожайність"
                        name="plannedYield"
                        value={data.plannedYield}
                        onChange={handleChange}
                        unit="т/га"
                    />
                     <StyledFormField
                        label="Площа поля"
                        name="fieldArea"
                        value={data.fieldArea}
                        onChange={handleChange}
                        unit="га"
                    />
                </div>
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
                    className="bg-indigo-600 text-white font-bold py-3 px-10 rounded-lg hover:bg-indigo-700 transition duration-300 shadow-lg text-lg disabled:bg-indigo-300 disabled:cursor-not-allowed"
                    disabled={isGroupMode ? isCalculationDisabled : (!data.culture || !data.plannedYield)}
                    title={isGroupMode && isCalculationDisabled ? 'Заповніть культуру та врожайність для всіх аналізів' : ''}
                >
                    {isGroupMode ? 'Розрахувати все' : 'Розрахувати'}
                </button>
            </div>
        </form>
    );
};