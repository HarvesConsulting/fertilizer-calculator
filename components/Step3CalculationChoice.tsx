import React from 'react';

interface Step3Props {
    onBack: () => void;
    onSelect: (type: 'basic' | 'fertigation' | 'full') => void;
}

const ChoiceButton: React.FC<{ onClick: () => void; title: string; description: string; }> = ({ onClick, title, description }) => (
    <button
        onClick={onClick}
        className="w-full text-left p-6 border rounded-lg hover:bg-gray-50 hover:border-blue-500 transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
        <h3 className="text-xl font-bold text-gray-800">{title}</h3>
        <p className="mt-2 text-gray-600">{description}</p>
    </button>
);


export const Step3CalculationChoice: React.FC<Step3Props> = ({ onBack, onSelect }) => {
    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-semibold text-gray-800 border-b pb-4 mb-6">Крок 3: Вибір розрахунку</h2>
            <div className="space-y-4">
                <ChoiceButton 
                    onClick={() => onSelect('basic')} 
                    title="Основне внесення"
                    description="Розрахунок потреби в добривах для основного внесення."
                />
                <ChoiceButton 
                    onClick={() => onSelect('fertigation')} 
                    title="Програма фертигації"
                    description="Детальний потижневий план внесення добрив через краплинне зрошення."
                />
                 <ChoiceButton 
                    onClick={() => onSelect('full')} 
                    title="Комплексна програма"
                    description="Показати основне внесення та програму фертигації разом."
                />
            </div>
            <div className="flex justify-start items-center pt-4">
                 <button
                    type="button"
                    onClick={onBack}
                    className="bg-gray-300 text-gray-800 font-bold py-3 px-10 rounded-lg hover:bg-gray-400 transition duration-300"
                >
                    Назад
                </button>
            </div>
        </div>
    );
};