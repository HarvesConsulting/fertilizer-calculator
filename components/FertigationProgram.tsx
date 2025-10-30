import React, { useEffect, useMemo } from 'react';
import { FERTIGATION_SCHEDULES } from './FertigationSchedules';
import { FERTIGATION_CULTURES } from '../constants';
import type { NutrientNeeds, CultureParams, SpringFertilizer } from '../types';
import { calculateFertigationPlan } from '../utils/fertigationCalculator';
import { FertigationChart } from './FertigationChart';

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
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
        <div className="mt-1 relative rounded-md shadow-sm">
            <input
                type="number"
                name={name}
                id={name}
                value={value}
                onChange={onChange}
                className="w-full pl-3 pr-8 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                placeholder="0"
                min="0"
                step="0.1"
                disabled={disabled}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">%</span>
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
                <h3 className="text-xl font-semibold mb-4 text-gray-700 border-b pb-2">Програма фертигації</h3>
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
                <h3 className="text-xl font-semibold mb-4 text-gray-700 border-b pb-2">Програма фертигації</h3>
                <p>Фертигація не потрібна на основі розрахунків.</p>
            </div>
        );
    }

    const nitrogenFertilizerName = nitrogenFertilizer === 'ammonium-nitrate' ? 'Аміачна селітра' : 'Карбамід';
    const chartLabels = [nitrogenFertilizerName, 'Ортофосфорна к-та', 'Сульфат калію', 'Нітрат кальцію', 'Сульфат магнію'];

    return (
        <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-700 border-b pb-2">Програма фертигації</h3>
            
             <div className="mb-6 p-4 border border-blue-200 rounded-lg bg-blue-50">
                <div className="relative flex items-start">
                    <div className="flex h-6 items-center">
                        <input
                            id="spring-fert-toggle"
                            aria-describedby="spring-fert-description"
                            name="spring-fert-toggle"
                            type="checkbox"
                            checked={springFertilizer.enabled}
                            onChange={handleToggleSpringFertilizer}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                            disabled={readOnly}
                        />
                    </div>
                    <div className="ml-3 text-sm leading-6">
                        <label htmlFor="spring-fert-toggle" className="font-medium text-gray-900 cursor-pointer">
                            Розрахувати комплексне стартове добриво
                        </label>
                        <p id="spring-fert-description" className="text-gray-500">
                            Внесіть склад для розрахунку норми весняного добрива.
                        </p>
                    </div>
                </div>
            </div>

            {springFertilizer.enabled && (
                <div className="mb-8 p-4 border rounded-lg bg-gray-50 space-y-4">
                     <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <h4 className="text-lg font-semibold text-gray-800">Склад та норма стартового добрива</h4>
                        {!readOnly && (
                            <button
                                type="button"
                                onClick={handleYaraMilaClick}
                                className="bg-blue-100 text-blue-700 text-xs font-semibold px-4 py-1.5 rounded-full hover:bg-blue-200 transition-colors flex-shrink-0"
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
                        <div className="bg-blue-100 text-blue-800 p-3 rounded-lg mt-4">
                            <p className="font-semibold">Розрахункова норма внесення добрива: <span className="text-lg">{fertilizerRate.toFixed(1)} кг/га</span></p>
                        </div>
                     )}
                </div>
            )}

            <div className="mb-8 p-4 border rounded-lg bg-gray-50 space-y-4">
                <h4 className="text-lg font-semibold text-gray-800">Вибір азотного добрива для фертигації</h4>
                 <div>
                    <label htmlFor="nitrogen-fertilizer" className="block text-sm font-medium text-gray-700">Азотне добриво</label>
                    <select 
                        id="nitrogen-fertilizer" 
                        value={nitrogenFertilizer}
                        onChange={(e) => setNitrogenFertilizer(e.target.value)}
                        className="mt-1 block w-full md:w-1/3 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md disabled:bg-gray-100"
                        disabled={readOnly}
                    >
                        <option value="ammonium-nitrate">Аміачна селітра</option>
                        <option value="urea">Карбамід</option>
                    </select>
                </div>
            </div>

            <h4 className="text-lg font-semibold mb-4 text-gray-800">Потижневий план внесення добрив (фізична вага, кг/га)</h4>

            {weeklyPlan && weeklyPlan.length > 0 ? (
                <FertigationChart data={weeklyPlan} labels={chartLabels} />
            ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-600">Немає даних для побудови графіка.</p>
                </div>
            )}

            <div className="mt-8">
                 <h4 className="text-lg font-semibold mb-3 text-gray-800">Загальна кількість за сезон, кг/га</h4>
                 <div className="bg-gray-800 text-white p-6 rounded-lg shadow-lg">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 text-center">
                        <div>
                            <div className="text-sm text-gray-300 truncate" title={chartLabels[0]}>{chartLabels[0]}</div>
                            <div className="text-2xl font-bold text-blue-400">{totals.nitrogen.toFixed(1)}</div>
                        </div>
                         <div>
                            <div className="text-sm text-gray-300 truncate" title={chartLabels[1]}>{chartLabels[1]}</div>
                            <div className="text-2xl font-bold text-emerald-400">{totals.phosphorus.toFixed(1)}</div>
                        </div>
                         <div>
                            <div className="text-sm text-gray-300 truncate" title={chartLabels[2]}>{chartLabels[2]}</div>
                            <div className="text-2xl font-bold text-amber-400">{totals.potassium.toFixed(1)}</div>
                        </div>
                        <div>
                            <div className="text-sm text-gray-300 truncate" title={chartLabels[3]}>{chartLabels[3]}</div>
                            <div className="text-2xl font-bold text-violet-400">{totals.calcium.toFixed(1)}</div>
                        </div>
                        <div>
                            <div className="text-sm text-gray-300 truncate" title={chartLabels[4]}>{chartLabels[4]}</div>
                            <div className="text-2xl font-bold text-pink-400">{totals.magnesium.toFixed(1)}</div>
                        </div>
                    </div>
                 </div>
            </div>
        </div>
    );
};