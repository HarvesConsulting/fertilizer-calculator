import React, { useEffect, useMemo } from 'react';
import { FERTIGATION_SCHEDULES } from './FertigationSchedules';
import { FERTIGATION_CULTURES } from '../constants';
import type { NutrientNeeds, CultureParams } from '../types';
import { calculateFertigationPlan } from '../utils/fertigationCalculator';

interface FertigationProgramProps {
    initialNeeds: NutrientNeeds[];
    culture: string;
    cultureParams: CultureParams;
    springFertilizer: { n: string; p: string; k: string; ca: string; mg: string; };
    setSpringFertilizer: React.Dispatch<React.SetStateAction<{ n: string; p: string; k: string; ca: string; mg: string; }>>;
    nitrogenFertilizer: string;
    setNitrogenFertilizer: React.Dispatch<React.SetStateAction<string>>;
    readOnly?: boolean;
}

const NutrientInput: React.FC<{ label: string; name: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; disabled?: boolean; }> = ({ label, name, value, onChange, disabled }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
        <div className="mt-1 relative rounded-md shadow-sm">
            <input
                type="number"
                name={name}
                id={name}
                value={value}
                onChange={onChange}
                className="w-full pl-3 pr-8 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 dark:bg-gray-600 dark:border-gray-500 dark:text-white dark:disabled:bg-gray-500"
                placeholder="0"
                min="0"
                step="0.1"
                disabled={disabled}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500 dark:text-gray-400 sm:text-sm">%</span>
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
            setSpringFertilizer({ n: '', p: '', k: '', ca: '', mg: '' });
            setNitrogenFertilizer('ammonium-nitrate');
        }
    }, [initialNeeds, setSpringFertilizer, setNitrogenFertilizer, readOnly]);


    const handleFertilizerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setSpringFertilizer(prev => ({ ...prev, [name]: value }));
    };
    
    const handleYaraMilaClick = () => {
        setSpringFertilizer({
            n: '11',
            p: '11',
            k: '21',
            ca: '0',
            mg: '2.6',
        });
    };

    const findCultureKey = (cultureName: string) => {
        return Object.keys(FERTIGATION_CULTURES).find(key => 
            FERTIGATION_CULTURES[key as keyof typeof FERTIGATION_CULTURES].startsWith(cultureName)
        );
    };

    const cultureKey = findCultureKey(culture);
    
    const { weeklyPlan, totals, fertilizerRate } = useMemo(() => {
        if (!cultureKey) {
             return { weeklyPlan: [], totals: {}, fertilizerRate: null };
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
                <h3 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300 border-b dark:border-gray-700 pb-2">Програма фертигації</h3>
                <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 dark:bg-yellow-900/50 dark:border-yellow-700 dark:text-yellow-300 p-4" role="alert">
                    <p className="font-bold">Увага</p>
                    <p>Для культури "{culture}" не знайдено типового графіка фертигації.</p>
                </div>
            </div>
        );
    }

    if (initialNeeds.every(need => need.norm === 0)) {
         return (
            <div>
                <h3 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300 border-b dark:border-gray-700 pb-2">Програма фертигації</h3>
                <p className="dark:text-gray-400">Фертигація не потрібна на основі розрахунків.</p>
            </div>
        );
    }

    const nitrogenFertilizerName = nitrogenFertilizer === 'ammonium-nitrate' ? 'Аміачна селітра' : 'Карбамід';
    const tableHeaders = [nitrogenFertilizerName, 'Ортофосфорна к-та', 'Сульфат калію', 'Нітрат кальцію', 'Сульфат магнію'];

    return (
        <div>
             <h3 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300 border-b dark:border-gray-700 pb-2">Програма фертигації</h3>
            
            <div className="mb-8 p-4 border rounded-lg bg-gray-50 dark:bg-gray-700/50 dark:border-gray-700 space-y-4">
                 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">1. Розрахунок весняного (стартового) добрива</h4>
                    {!readOnly && (
                        <button
                            type="button"
                            onClick={handleYaraMilaClick}
                            className="bg-blue-100 text-blue-700 dark:bg-blue-900/70 dark:text-blue-300 dark:hover:bg-blue-800/70 text-xs font-semibold px-4 py-1.5 rounded-full hover:bg-blue-200 transition-colors flex-shrink-0"
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
                    <div className="bg-blue-100 text-blue-800 dark:bg-blue-900/70 dark:text-blue-200 p-3 rounded-lg mt-4">
                        <p className="font-semibold">Розрахункова норма внесення добрива: <span className="text-lg">{fertilizerRate.toFixed(1)} кг/га</span></p>
                    </div>
                 )}
            </div>

            <div className="mb-8 p-4 border rounded-lg bg-gray-50 dark:bg-gray-700/50 dark:border-gray-700 space-y-4">
                <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">2. Вибір азотного добрива для фертигації</h4>
                 <div>
                    <label htmlFor="nitrogen-fertilizer" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Азотне добриво</label>
                    <select 
                        id="nitrogen-fertilizer" 
                        value={nitrogenFertilizer}
                        onChange={(e) => setNitrogenFertilizer(e.target.value)}
                        className="mt-1 block w-full md:w-1/3 pl-3 pr-10 py-2 text-base border-gray-300 dark:bg-gray-600 dark:border-gray-500 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md disabled:bg-gray-100 dark:disabled:bg-gray-500"
                        disabled={readOnly}
                    >
                        <option value="ammonium-nitrate">Аміачна селітра</option>
                        <option value="urea">Карбамід</option>
                    </select>
                </div>
            </div>

            <h4 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">3. Потижневий план внесення добрив (фізична вага)</h4>
            
            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
                {weeklyPlan.map(item => item && (
                    <div key={item.week} className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg shadow">
                        <h5 className="font-bold text-lg text-blue-600 dark:text-blue-400">Тиждень {item.week}</h5>
                        <div className="mt-2 space-y-1 text-sm dark:text-gray-300">
                            <p><span className="font-semibold">{tableHeaders[0]}:</span> {item.nitrogen.toFixed(1)} кг/га</p>
                            <p><span className="font-semibold">{tableHeaders[1]}:</span> {item.phosphorus.toFixed(1)} кг/га</p>
                            <p><span className="font-semibold">{tableHeaders[2]}:</span> {item.potassium.toFixed(1)} кг/га</p>
                            <p><span className="font-semibold">{tableHeaders[3]}:</span> {item.calcium.toFixed(1)} кг/га</p>
                            <p><span className="font-semibold">{tableHeaders[4]}:</span> {item.magnesium.toFixed(1)} кг/га</p>
                        </div>
                    </div>
                ))}
                 <div className="bg-gray-800 dark:bg-gray-900 text-white p-4 rounded-lg shadow mt-4">
                    <h5 className="font-bold text-lg">Загальна кількість, кг/га</h5>
                    <div className="mt-2 space-y-1 text-sm">
                        <p><span className="font-semibold">{tableHeaders[0]}:</span> {totals.nitrogen.toFixed(1)}</p>
                        <p><span className="font-semibold">{tableHeaders[1]}:</span> {totals.phosphorus.toFixed(1)}</p>
                        <p><span className="font-semibold">{tableHeaders[2]}:</span> {totals.potassium.toFixed(1)}</p>
                        <p><span className="font-semibold">{tableHeaders[3]}:</span> {totals.calcium.toFixed(1)}</p>
                        <p><span className="font-semibold">{tableHeaders[4]}:</span> {totals.magnesium.toFixed(1)}</p>
                    </div>
                </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    <thead className="bg-gray-100 dark:bg-gray-900">
                        <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">Тиждень</th>
                            {tableHeaders.map(header => (
                                <th key={header} className="px-4 py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">{header}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {weeklyPlan.map(item => item && (
                            <tr key={item.week}>
                                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{item.week}</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{item.nitrogen.toFixed(1)}</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{item.phosphorus.toFixed(1)}</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{item.potassium.toFixed(1)}</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{item.calcium.toFixed(1)}</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{item.magnesium.toFixed(1)}</td>
                            </tr>
                        ))}
                    </tbody>
                     <tfoot className="border-t-2 border-gray-300 dark:border-gray-600">
                        <tr className="font-bold bg-gray-100 dark:bg-gray-900">
                            <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200">Загальна кількість, кг/га</td>
                            <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200">{totals.nitrogen.toFixed(1)}</td>
                            <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200">{totals.phosphorus.toFixed(1)}</td>
                            <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200">{totals.potassium.toFixed(1)}</td>
                            <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200">{totals.calcium.toFixed(1)}</td>
                            <td className="px-4 py-2 text-sm text-gray-800 dark:text-gray-200">{totals.magnesium.toFixed(1)}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
};
