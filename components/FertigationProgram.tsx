import React, { useEffect, useState, useMemo } from 'react';
import { FERTIGATION_SCHEDULES } from './FertigationSchedules';
import { FERTIGATION_CULTURES } from '../constants';
import type { NutrientNeeds, CultureParams, SpringFertilizer, FormData } from '../types';
import { calculateFertigationPlan } from '../utils/fertigationCalculator';
import { FertigationChart } from './FertigationChart';
import { Tooltip } from './Tooltip';
import { InfoIcon } from './InfoIcon';
import { CompatibilityModal } from './CompatibilityModal';
import { Language, t } from '../i18n';

interface FertigationProgramProps {
    initialNeeds: NutrientNeeds[];
    culture: string;
    cultureParams: CultureParams;
    formData: Partial<FormData>;
    springFertilizer: SpringFertilizer;
    setSpringFertilizer: React.Dispatch<React.SetStateAction<SpringFertilizer>>;
    nitrogenFertilizer: string;
    setNitrogenFertilizer: React.Dispatch<React.SetStateAction<string>>;
    springFertilizerRate: number | null;
    setSpringFertilizerRate: (rate: number | null) => void;
    readOnly?: boolean;
    lang: Language;
    isGroupMode?: boolean;
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
    formData,
    springFertilizer,
    setSpringFertilizer,
    nitrogenFertilizer,
    setNitrogenFertilizer,
    springFertilizerRate,
    setSpringFertilizerRate,
    readOnly = false,
    lang,
    isGroupMode = false,
}) => {
    const [isCompatibilityModalOpen, setIsCompatibilityModalOpen] = useState(false);
    const [isRateManuallySet, setIsRateManuallySet] = useState(false);
    
    useEffect(() => {
        if (!readOnly && !isGroupMode) {
            setSpringFertilizer({ n: '', p: '', k: '', ca: '', mg: '', enabled: false });
            setNitrogenFertilizer('ammonium-nitrate');
            setSpringFertilizerRate(null);
            setIsRateManuallySet(false);
        }
    }, [initialNeeds, setSpringFertilizer, setNitrogenFertilizer, setSpringFertilizerRate, readOnly, isGroupMode]);

    const findCultureKey = (cultureName: string) => {
        return Object.keys(FERTIGATION_CULTURES).find(key => 
            FERTIGATION_CULTURES[key as keyof typeof FERTIGATION_CULTURES].startsWith(cultureName)
        );
    };

    const cultureKey = findCultureKey(culture);
    const area = parseFloat(formData.fieldArea || '1') || 1;
    
    const calculatedRate = useMemo(() => {
        const kPercentage = parseFloat(springFertilizer.k);
        const initialKNeed = initialNeeds.find(n => n.element === 'K2O')?.norm ?? 0;
        if (springFertilizer.enabled && kPercentage && kPercentage > 0 && initialKNeed > 0) {
            const rate = (initialKNeed * 0.5 / kPercentage) * 100;
            return Math.round(rate);
        }
        return null;
    }, [springFertilizer.enabled, springFertilizer.k, initialNeeds]);
    
    useEffect(() => {
        if (!readOnly && !isRateManuallySet) {
            setSpringFertilizerRate(calculatedRate);
        }
    }, [calculatedRate, readOnly, isRateManuallySet, setSpringFertilizerRate]);


    const planData = useMemo(() => {
        if (!cultureKey) {
            return {
                weeklyPlan: [],
                totals: { nitrogen: 0, phosphorus: 0, potassium: 0, calcium: 0, magnesium: 0 },
            };
        }
        
        const rateToUse = springFertilizerRate ?? calculatedRate;

        const newPlanData = calculateFertigationPlan({
            initialNeeds, cultureKey, cultureParams, springFertilizer, nitrogenFertilizer,
            manualRate: rateToUse
        });
        
        return {
            weeklyPlan: newPlanData.weeklyPlan,
            totals: newPlanData.totals,
        }

    }, [initialNeeds, cultureKey, cultureParams, springFertilizer, nitrogenFertilizer, springFertilizerRate, calculatedRate]);
    
    const { weeklyPlan, totals } = planData;
    
    const handleToggleSpringFertilizer = (e: React.ChangeEvent<HTMLInputElement>) => {
        const isEnabled = e.target.checked;
        setSpringFertilizer(prev => {
             if (isEnabled) {
                return { ...prev, enabled: true };
            }
            return { n: '', p: '', k: '', ca: '', mg: '', enabled: false };
        });
        setIsRateManuallySet(false);
    };
    
    const handleFertilizerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setSpringFertilizer(prev => ({ ...prev, [name]: value }));
        setIsRateManuallySet(false);
    };

    const handleYaraMilaClick = () => {
        setSpringFertilizer({
            enabled: true,
            n: '11', p: '11', k: '21', ca: '0', mg: '2.6',
        });
        setIsRateManuallySet(false);
    };
    
    const handleRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSpringFertilizerRate(value === '' ? null : parseFloat(value));
        setIsRateManuallySet(true);
    };

    const handleAutoCalculateRate = () => {
        setSpringFertilizerRate(calculatedRate);
        setIsRateManuallySet(false);
    };


    if (!cultureKey || !FERTIGATION_SCHEDULES[cultureKey]) {
        return (
            <div>
                <h3 className="text-xl font-semibold mb-4 text-slate-700 border-b pb-2">{t('fertigationProgramHeader', lang)}</h3>
                <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4" role="alert">
                    <p className="font-bold">{t('noScheduleWarningTitle', lang)}</p>
                    <p>{t('noScheduleWarningText', lang, { culture: culture })}</p>
                </div>
            </div>
        );
    }

    if (initialNeeds.every(need => need.norm === 0)) {
         return (
            <div>
                <h3 className="text-xl font-semibold mb-4 text-slate-700 border-b pb-2">{t('fertigationProgramHeader', lang)}</h3>
                <p>{t('fertigationNotNeeded', lang)}</p>
            </div>
        );
    }

    const nitrogenFertilizerName = nitrogenFertilizer === 'ammonium-nitrate' ? t('ammoniumNitrate', lang) : t('urea', lang);
    const chartLabels = [nitrogenFertilizerName, 'Ортофосфорна к-та', 'Сульфат калію', 'Нітрат кальцію', 'Сульфат магнію'];
    if (lang === 'en') {
        chartLabels[1] = 'Orthophosphoric acid';
        chartLabels[2] = 'Potassium sulfate';
        chartLabels[3] = 'Calcium nitrate';
        chartLabels[4] = 'Magnesium sulfate';
    }

    const rateTooltipText = t('springFertilizerRateTooltip', lang);

    return (
        <div>
            <h3 className="text-xl font-semibold mb-4 text-slate-700 border-b pb-2">{t('fertigationProgramHeader', lang)}</h3>
            
             <div className="mb-6 p-4 border border-indigo-200 rounded-lg bg-indigo-50">
                <div className="relative flex items-start">
                    <div className="flex h-6 items-center">
                        <input id="spring-fert-toggle" aria-describedby="spring-fert-description" name="spring-fert-toggle" type="checkbox" checked={springFertilizer.enabled} onChange={handleToggleSpringFertilizer} className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600" disabled={readOnly} />
                    </div>
                    <div className="ml-3 text-sm leading-6">
                        <label htmlFor="spring-fert-toggle" className="font-medium text-slate-900 cursor-pointer">
                            {t('addSpringFertilizer', lang)}
                        </label>
                        <p id="spring-fert-description" className="text-slate-500">
                            {t('addSpringFertilizerDesc', lang)}
                        </p>
                    </div>
                </div>
            </div>

            {springFertilizer.enabled && (
                <div className="mb-8 p-4 border rounded-lg bg-slate-50 space-y-4">
                     <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <h4 className="text-lg font-semibold text-slate-800">{t('springFertilizerHeader', lang)}</h4>
                        {!readOnly && (
                            <button type="button" onClick={handleYaraMilaClick} className="bg-indigo-100 text-indigo-700 text-xs font-semibold px-4 py-1.5 rounded-full hover:bg-indigo-200 transition-colors flex-shrink-0" title="Заповнити поля даними YaraMila CROPCARE 11-11-21">
                                {t('yaraMilaButton', lang)}
                            </button>
                        )}
                     </div>

                     <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                         <NutrientInput label={`${t('nitrogenAnalysisLabel', lang)} (N)`} name="n" value={springFertilizer.n} onChange={handleFertilizerChange} disabled={readOnly} />
                         <NutrientInput label={`${t('phosphorusLabel', lang)} (P₂O₅)`} name="p" value={springFertilizer.p} onChange={handleFertilizerChange} disabled={readOnly} />
                         <NutrientInput label={`${t('potassiumLabel', lang)} (K₂O)`} name="k" value={springFertilizer.k} onChange={handleFertilizerChange} disabled={readOnly} />
                         <NutrientInput label={`${t('calciumLabel', lang)} (CaO)`} name="ca" value={springFertilizer.ca} onChange={handleFertilizerChange} disabled={readOnly} />
                         <NutrientInput label={`${t('magnesiumLabel', lang)} (MgO)`} name="mg" value={springFertilizer.mg} onChange={handleFertilizerChange} disabled={readOnly} />
                     </div>
                     <div className="pt-2">
                         <div className="bg-indigo-100/60 p-3 rounded-lg">
                            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                                 <label htmlFor="manual-rate" className="font-medium text-slate-800 flex items-center gap-1.5">
                                     {t('applicationRate', lang)}
                                     <Tooltip text={rateTooltipText}><InfoIcon className="h-4 w-4" /></Tooltip>
                                 </label>
                                 <div className="flex items-center gap-2">
                                     {!readOnly && (
                                         <button 
                                             type="button" 
                                             onClick={handleAutoCalculateRate} 
                                             className="bg-indigo-200 text-indigo-800 text-xs font-semibold px-3 py-1.5 rounded-md hover:bg-indigo-300 transition"
                                             title={t('autoCalculateTooltip', lang)}
                                         >
                                             {t('autoCalculateButton', lang)}
                                         </button>
                                     )}
                                     <div className="relative">
                                         <input
                                            type="number"
                                            id="manual-rate"
                                            value={springFertilizerRate ?? ''}
                                            onChange={handleRateChange}
                                            disabled={readOnly}
                                            className="w-32 text-right font-bold text-lg text-indigo-700 bg-white/50 border border-indigo-200 rounded-md py-1.5 pl-3 pr-14 focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:bg-slate-100 disabled:text-slate-500"
                                            placeholder={calculatedRate?.toString() || '0'}
                                            min="0"
                                            step="1"
                                         />
                                         <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">kg/ha</span>
                                     </div>
                                 </div>
                            </div>
                             {(springFertilizerRate ?? 0) > 0 && <p className="text-sm text-slate-600 mt-2 text-right font-medium">{t('totalForArea', lang)} <span className="font-bold text-indigo-700">{(springFertilizerRate! * area).toFixed(1)} kg</span></p>}
                         </div>
                     </div>
                </div>
            )}

            <div className="mb-8 p-4 border rounded-lg bg-slate-50 space-y-4">
                <h4 className="text-lg font-semibold text-slate-800">{t('nitrogenFertilizerChoiceHeader', lang)}</h4>
                 <div>
                    <label htmlFor="nitrogen-fertilizer" className="block text-sm font-medium text-slate-700">{t('nitrogenFertilizerLabel', lang)}</label>
                    <select id="nitrogen-fertilizer" value={nitrogenFertilizer} onChange={(e) => setNitrogenFertilizer(e.target.value)} className="mt-1 block w-full md:w-1/3 pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md disabled:bg-slate-100" disabled={readOnly}>
                        <option value="ammonium-nitrate">{t('ammoniumNitrate', lang)}</option>
                        <option value="urea">{t('urea', lang)}</option>
                    </select>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                 <h4 className="text-lg font-semibold text-slate-800">{t('weeklyPlanHeader', lang)}</h4>
                 <button type="button" onClick={() => setIsCompatibilityModalOpen(true)} className="flex-shrink-0 flex items-center gap-2 bg-white text-indigo-700 border-2 border-indigo-200 font-semibold py-2 px-4 rounded-lg hover:bg-indigo-50 hover:border-indigo-300 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 text-sm">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                     <span>{t('compatibilityTableButton', lang)}</span>
                 </button>
            </div>


            {weeklyPlan && weeklyPlan.length > 0 ? (
                <FertigationChart data={weeklyPlan} labels={chartLabels} fieldArea={area} lang={lang} sowingDate={formData.sowingDate} />
            ) : (
                <div className="text-center py-8 bg-slate-50 rounded-lg">
                    <p className="text-slate-600">Немає даних для побудови графіка.</p>
                </div>
            )}

            <div className="mt-8">
                 <h4 className="text-lg font-semibold mb-4 text-slate-800">{t('totalForSeasonHeader', lang)}</h4>
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
                            <p className="text-2xl font-bold text-slate-800 mt-1">{item.value.toFixed(1)} <span className="text-base font-medium text-slate-500">kg/ha</span></p>
                            <p className="text-sm font-semibold text-indigo-700">{t('totalLabel', lang)} {(item.value * area).toFixed(1)} kg</p>
                        </div>
                     ))}
                 </div>
            </div>
            <CompatibilityModal isOpen={isCompatibilityModalOpen} onClose={() => setIsCompatibilityModalOpen(false)} nitrogenFertilizerName={nitrogenFertilizerName} lang={lang} />
        </div>
    );
};