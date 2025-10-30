import React, { useEffect, useMemo, useState } from 'react';
import { FERTIGATION_SCHEDULES } from './FertigationSchedules';
import { FERTIGATION_CULTURES } from '../constants';
import type { NutrientNeeds, CultureParams, SpringFertilizer } from '../types';
import { calculateFertigationPlan } from '../utils/fertigationCalculator';
import { FertigationChart } from './FertigationChart';
import { Tooltip } from './Tooltip';
import { InfoIcon } from './InfoIcon';
import { CompatibilityModal } from './CompatibilityModal';

interface FertigationProgramProps {
    initialNeeds: NutrientNeeds[];
    culture: string;
    cultureParams: CultureParams;
    springFertilizer: SpringFertilizer;
    setSpringFertilizer: React.Dispatch<React.SetStateAction<SpringFertilizer>>;
    nitrogenFertilizer: string;
    setNitrogenFertilizer: React.Dispatch<React.SetStateAction<string>>;
    readOnly?: boolean;
}

const NutrientInput: React.FC<{ label: string; name: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; disabled?: boolean; }> = ({ label, name, value, onChange, disabled }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-slate-700">{label}</label>
        <div className="mt-1 relative rounded-md shadow-sm">
            <input
                type="number"
                name={name}
                id={name}
                value={value}
                onChange={onChange}
                className="w-full pl-3 pr-8 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-slate-100"
                placeholder="0"
                min="0"
                step="0.1"
                disabled={disabled}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-slate-500 sm:text-sm">%</span>
            </div>
        </div>
    </div>
);


export const FertigationProgram: React.FC<FertigationProgramProps> = ({ 
    initialNeeds, 
    culture,
    cultureParams,
    springFertilizer,
    setSpringFertilizer,
    nitrogenFertilizer,
    setNitrogenFertilizer,
    readOnly = false,
}) => {
    const [isCompatibilityModalOpen, setIsCompatibilityModalOpen] = useState(false);
    
    useEffect(() => {
        if (!readOnly) {
            setSpringFertilizer({ n: '', p: '', k: '', ca: '', mg: '', enabled: false });
            setNitrogenFertilizer('ammonium-nitrate');
        }
    }, [initialNeeds, setSpringFertilizer, setNitrogenFertilizer, readOnly]);


    const handleFertilizerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setSpringFertilizer(prev => ({ ...prev, [name]: value }));
    };

    const handleToggleSpringFertilizer = (e: React.ChangeEvent<HTMLInputElement>) => {
        const isEnabled = e.target.checked;
        if (isEnabled) {
            setSpringFertilizer(prev => ({ ...prev, enabled: true }));
        } else {
            setSpringFertilizer({ n: '', p: '', k: '', ca: '', mg: '', enabled: false });
        }
    };
    
    const handleYaraMilaClick = () => {
        setSpringFertilizer(prev => ({
            ...prev,
            n: '11',
            p: '11',
            k: '21',
            ca: '0',
            mg: '2.6',
        }));
    };

    const findCultureKey = (cultureName: string) => {
        return Object.keys(FERTIGATION_CULTURES).find(key => 
            FERTIGATION_CULTURES[key as keyof typeof FERTIGATION_CULTURES].startsWith(cultureName)
        );
    };

    const cultureKey = findCultureKey(culture);
    
    const { weeklyPlan, totals, fertilizerRate } = useMemo(() => {
        if (!cultureKey) {
             return { weeklyPlan: [], totals: { nitrogen: 0, phosphorus: 0, potassium: 0, calcium: 0, magnesium: 0 }, fertilizerRate: null };
        }
        return calculateFertigationPlan({
            initialNeeds,
            cultureKey,
            cultureParams,
            springFertilizer,
            nitrogenFertilizer
        });

    }, [initialNeeds, cultureKey, cultureParams, springFertilizer, nitrogenFertilizer]);


    if (!cultureKey || !FERTIGATION_SCHEDULES[cultureKey]) {
        return (
            <div>
                <h3 className="text-xl font-semibold mb-4 text-slate-700 border-b pb-2">Програма фертигації</h3>
                <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4" role="alert">
                    <p className="font-bold">Увага</p>
                    <p>Для культури "{culture}" не знайдено типового графіка фертигації.</p>
                </div>
            </div>
        );
    }

    if (initialNeeds.every(need => need.norm === 0)) {
         return (
            <div>
                <h3 className="text-xl font-semibold mb-4 text-slate-700 border-b pb-2">Програма фертигації</h3>
                <p>Фертигація не потрібна на основі розрахунків.</p>
            </div>
        );
    }

    const nitrogenFertilizerName = nitrogenFertilizer === 'ammonium-nitrate' ? 'Аміачна селітра' : 'Карбамід';
    const chartLabels = [nitrogenFertilizerName, 'Ортофосфорна к-та', 'Сульфат калію', 'Нітрат кальцію', 'Сульфат магнію'];
    const rateTooltipText = "Норма розраховується автоматично для покриття 50% потреби в калії (K₂O) на початкових етапах росту, що є ключовим для розвитку кореневої системи та загальної стійкості рослини.";

    return (
        <div>
            <h3 className="text-xl font-semibold mb-4 text-slate-700 border-b pb-2">Програма фертигації</h3>
            
             <div className="mb-6 p-4 border border-indigo-200 rounded-lg bg-indigo-50">
                <div className="relative flex items-start">
                    <div className="flex h-6 items-center">
                        <input
                            id="spring-fert-toggle"
                            aria-describedby="spring-fert-description"
                            name="spring-fert-toggle"
                            type="checkbox"
                            checked={springFertilizer.enabled}
                            onChange={handleToggleSpringFertilizer}
                            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
                            disabled={readOnly}
                        />
                    </div>
                    <div className="ml-3 text-sm leading-6">
                        <label htmlFor="spring-fert-toggle" className="font-medium text-slate-900 cursor-pointer">
                            Розрахувати комплексне стартове добриво
                        </label>
                        <p id="spring-fert-description" className="text-slate-500">
                            Внесіть склад для розрахунку норми весняного добрива.
                        </p>
                    </div>
                </div>
            </div>

            {springFertilizer.enabled && (
                <div className="mb-8 p-4 border rounded-lg bg-slate-50 space-y-4">
                     <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <h4 className="text-lg font-semibold text-slate-800">Склад та норма стартового добрива</h4>
                        {!readOnly && (
                            <button
                                type="button"
                                onClick={handleYaraMilaClick}
                                className="bg-indigo-100 text-indigo-700 text-xs font-semibold px-4 py-1.5 rounded-full hover:bg-indigo-200 transition-colors flex-shrink-0"
                                title="Заповнити поля даними YaraMila CROPCARE 11-11-21"
                            >
                                YaraMila CROPCARE
                            </button>
                        )}
                     </div>

                     <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                         <NutrientInput label="Азот (N)" name="n" value={springFertilizer.n} onChange={handleFertilizerChange} disabled={readOnly} />
                         <NutrientInput label="Фосфор (P₂O₅)" name="p" value={springFertilizer.p} onChange={handleFertilizerChange} disabled={readOnly} />
                         <NutrientInput label="Калій (K₂O)" name="k" value={springFertilizer.k} onChange={handleFertilizerChange} disabled={readOnly} />
                         <NutrientInput label="Кальцій (CaO)" name="ca" value={springFertilizer.ca} onChange={handleFertilizerChange} disabled={readOnly} />
                         <NutrientInput label="Магній (MgO)" name="mg" value={springFertilizer.mg} onChange={handleFertilizerChange} disabled={readOnly} />
                     </div>
                     {fertilizerRate !== null && (
                        <div className="bg-indigo-100 text-indigo-800 p-3 rounded-lg mt-4 flex items-center gap-2">
                            <p className="font-semibold">Розрахункова норма внесення добрива: <span className="text-lg">{fertilizerRate.toFixed(1)} кг/га</span></p>
                            <Tooltip text={rateTooltipText}>
                                <InfoIcon className="h-5 w-5 text-indigo-600/80" />
                            </Tooltip>
                        </div>
                     )}
                </div>
            )}

            <div className="mb-8 p-4 border rounded-lg bg-slate-50 space-y-4">
                <h4 className="text-lg font-semibold text-slate-800">Вибір азотного добрива для фертигації</h4>
                 <div>
                    <label htmlFor="nitrogen-fertilizer" className="block text-sm font-medium text-slate-700">Азотне добриво</label>
                    <select 
                        id="nitrogen-fertilizer" 
                        value={nitrogenFertilizer}
                        onChange={(e) => setNitrogenFertilizer(e.target.value)}
                        className="mt-1 block w-full md:w-1/3 pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md disabled:bg-slate-100"
                        disabled={readOnly}
                    >
                        <option value="ammonium-nitrate">Аміачна селітра</option>
                        <option value="urea">Карбамід</option>
                    </select>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                 <h4 className="text-lg font-semibold text-slate-800">Потижневий план внесення добрив (фізична вага, кг/га)</h4>
                 <button 
                    type="button"
                    onClick={() => setIsCompatibilityModalOpen(true)}
                    className="flex-shrink-0 flex items-center gap-2 bg-white text-indigo-700 border-2 border-indigo-200 font-semibold py-2 px-4 rounded-lg hover:bg-indigo-50 hover:border-indigo-300 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 text-sm"
                 >
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                     </svg>
                     <span>Таблиця сумісності</span>
                 </button>
            </div>


            {weeklyPlan && weeklyPlan.length > 0 ? (
                <FertigationChart data={weeklyPlan} labels={chartLabels} />
            ) : (
                <div className="text-center py-8 bg-slate-50 rounded-lg">
                    <p className="text-slate-600">Немає даних для побудови графіка.</p>
                </div>
            )}

            <div className="mt-8">
                 <h4 className="text-lg font-semibold mb-4 text-slate-800">Загальна кількість за сезон, кг/га</h4>
                 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                     {[
                         { label: chartLabels[0], value: totals.nitrogen, color: 'border-indigo-500' },
                         { label: chartLabels[1], value: totals.phosphorus, color: 'border-emerald-500' },
                         { label: chartLabels[2], value: totals.potassium, color: 'border-amber-500' },
                         { label: chartLabels[3], value: totals.calcium, color: 'border-sky-500' },
                         { label: chartLabels[4], value: totals.magnesium, color: 'border-rose-500' },
                     ].map(item => (
                        <div key={item.label} className={`bg-slate-50 p-4 rounded-lg shadow-sm border-t-4 ${item.color}`}>
                            <p className="text-sm text-slate-600 truncate" title={item.label}>{item.label}</p>
                            <p className="text-2xl font-bold text-slate-800 mt-1">{item.value.toFixed(1)}</p>
                        </div>
                     ))}
                 </div>
            </div>
            <CompatibilityModal 
                isOpen={isCompatibilityModalOpen}
                onClose={() => setIsCompatibilityModalOpen(false)}
                nitrogenFertilizerName={nitrogenFertilizerName}
            />
        </div>
    );
};