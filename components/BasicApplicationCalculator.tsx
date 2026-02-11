
import React, { useMemo, useEffect } from 'react';
import type { FormData, NutrientNeeds, BasicFertilizerSelections, ComplexFertilizer } from '../types';
import { SIMPLE_FERTILIZERS, AMENDMENTS, AMENDMENT_EFFECTS } from '../constants';
import { StyledFormField } from './StyledFormField';
import { Tooltip } from './Tooltip';
import { InfoIcon } from './InfoIcon';
import { Language, t } from '../i18n';

interface BasicApplicationCalculatorProps {
    needs: NutrientNeeds[];
    formData: Partial<FormData>;
    selections: BasicFertilizerSelections;
    onSelectionsChange: (selections: BasicFertilizerSelections) => void;
    amendment: string;
    onAmendmentChange: (amendment: string) => void;
    complexFertilizer: ComplexFertilizer;
    onComplexFertilizerChange: (fertilizer: ComplexFertilizer) => void;
    readOnly?: boolean;
    lang: Language;
}

const DEFAULT_FERTILIZERS: Record<string, string> = {
    'P2O5': '19', // Суперфосфат
    'K2O': '60',  // Калій хлористий
    'CaO': '35',  // Сульфат кальцію (гіпс)
    'MgO': '16',  // Сульфат магнію
};

const ComplexFertilizerInput: React.FC<{ label: string, name: keyof Omit<ComplexFertilizer, 'rate' | 'enabled'>, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, disabled?: boolean }> = ({ label, name, value, onChange, disabled }) => (
    <div>
        <label htmlFor={`complex-${name}`} className="block text-sm font-medium text-slate-700 text-center" dangerouslySetInnerHTML={{ __html: label }} />
        <div className="mt-1 relative rounded-md shadow-sm">
            <input
                type="number"
                name={name}
                id={`complex-${name}`}
                value={value}
                onChange={onChange}
                className="w-full pl-2 pr-6 py-1.5 border border-slate-300 rounded-md text-center focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-slate-100"
                placeholder="0"
                min="0"
                max="100"
                step="0.1"
                disabled={disabled}
                aria-label={`Відсоток ${label}`}
            />
            <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
                <span className="text-slate-500 sm:text-sm">%</span>
            </div>
        </div>
    </div>
);


export const BasicApplicationCalculator: React.FC<BasicApplicationCalculatorProps> = ({
    needs,
    formData,
    selections,
    onSelectionsChange,
    amendment,
    onAmendmentChange,
    complexFertilizer,
    onComplexFertilizerChange,
    readOnly = false,
    lang
}) => {
    
    useEffect(() => {
        if (!readOnly) {
            const initialSelections: BasicFertilizerSelections = {};
            needs.forEach(need => {
                if (need.norm > 0 && DEFAULT_FERTILIZERS[need.element] && !selections[need.element]) {
                    initialSelections[need.element] = {
                        selectedFertilizer: DEFAULT_FERTILIZERS[need.element],
                    };
                }
            });
            if (Object.keys(initialSelections).length > 0) {
                onSelectionsChange({ ...selections, ...initialSelections });
            }
        }
    }, [needs, readOnly]);

    const fieldArea = parseFloat(formData.fieldArea || '1') || 1;
    const ph = formData.ph;
    const needsAmendment = ph && parseFloat(ph) <= 6.8;

    const displayNeeds = useMemo<NutrientNeeds[]>(() => {
        if (!amendment || !needsAmendment || !formData.ph) {
            return needs.map(need => need.element === 'Меліорант' ? { ...need, norm: 0 } : need);
        }
        const amendmentEffects = AMENDMENT_EFFECTS[amendment as keyof typeof AMENDMENT_EFFECTS];
        const numericPh = parseFloat(formData.ph);
        const initialCaNeed = needs.find(n => n.element === 'CaO')?.norm ?? 0;
        const initialMgNeed = needs.find(n => n.element === 'MgO')?.norm ?? 0;
        const amendmentRateTons = Math.round((7 - numericPh) * 5);
        const amendmentRateKg = amendmentRateTons * 1000;
        const calciumFromAmendment = amendmentEffects.calcium * amendmentRateTons;
        const magnesiumFromAmendment = amendmentEffects.magnesium * amendmentRateTons;
        const newCalciumRate = Math.round(Math.max(0, initialCaNeed - calciumFromAmendment));
        const newMagnesiumRate = Math.round(Math.max(0, initialMgNeed - magnesiumFromAmendment));
        return needs.map(need => {
            if (need.element === 'Меліорант') return { ...need, norm: amendmentRateKg };
            if (need.element === 'CaO') return { ...need, norm: newCalciumRate };
            if (need.element === 'MgO') return { ...need, norm: newMagnesiumRate };
            return need;
        });
    }, [needs, amendment, needsAmendment, formData.ph]);

    // Check if there are any nutrient needs (except amendment) to decide whether to show complex fertilizer option
    const hasNutrientNeeds = useMemo(() => {
        return needs.some(n => n.element !== 'Меліорант' && n.norm > 0);
    }, [needs]);
    
    useEffect(() => {
        if (!complexFertilizer.enabled) return;
        const complexContent = {
            'P2O5': parseFloat(complexFertilizer.p2o5 || '0'),
            'K2O': parseFloat(complexFertilizer.k2o || '0'),
            'CaO': parseFloat(complexFertilizer.cao || '0'),
            'MgO': parseFloat(complexFertilizer.mg || '0'),
        };
        let maxRate = 0;
        displayNeeds.forEach(need => {
            const percentage = complexContent[need.element as keyof typeof complexContent];
            if (need.norm > 0 && percentage > 0) {
                const requiredRate = (need.norm / percentage) * 100;
                if (requiredRate > maxRate) maxRate = requiredRate;
            }
        });
        const newRate = maxRate > 0 ? Math.round(maxRate).toString() : '';
        if (newRate !== complexFertilizer.rate) {
            onComplexFertilizerChange({ ...complexFertilizer, rate: newRate });
        }
    }, [complexFertilizer.enabled, complexFertilizer.p2o5, complexFertilizer.k2o, complexFertilizer.cao, complexFertilizer.mg, displayNeeds]);

    const handleToggleComplexFertilizer = (e: React.ChangeEvent<HTMLInputElement>) => {
        const isEnabled = e.target.checked;
        if (isEnabled) {
            onComplexFertilizerChange({ ...complexFertilizer, enabled: true });
        } else {
            onComplexFertilizerChange({ n: '', p2o5: '', k2o: '', cao: '', mg: '', rate: '', enabled: false });
        }
    };

    const handleComplexFertilizerInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        onComplexFertilizerChange({ ...complexFertilizer, [name]: value });
    };

    const handleNitroammophoskaClick = () => {
        onComplexFertilizerChange({
            ...complexFertilizer,
            n: '16', p2o5: '16', k2o: '16', cao: '', mg: '',
            enabled: true,
        });
    };

    const handleChickenManureClick = () => {
        onComplexFertilizerChange({
            ...complexFertilizer,
            n: '2', p2o5: '2', k2o: '1', cao: '2.4', mg: '0.2',
            enabled: true,
        });
    };

    const handleDiammophoskaClick = () => {
        onComplexFertilizerChange({
            ...complexFertilizer,
            n: '9', p2o5: '25', k2o: '25', cao: '', mg: '',
            enabled: true,
        });
    };

    const finalNeeds = useMemo(() => {
        const rate = parseFloat(complexFertilizer.rate);
        if (!complexFertilizer.enabled || !rate || isNaN(rate) || rate <= 0) return displayNeeds;
        const supplied = {
            'P2O5': rate * (parseFloat(complexFertilizer.p2o5 || '0') / 100),
            'K2O': rate * (parseFloat(complexFertilizer.k2o || '0') / 100),
            'CaO': rate * (parseFloat(complexFertilizer.cao || '0') / 100),
            'MgO': rate * (parseFloat(complexFertilizer.mg || '0') / 100),
        };
        return displayNeeds.map(need => {
            if (need.element === 'Меліорант') return need;
            const suppliedAmount = supplied[need.element as keyof typeof supplied] || 0;
            return { ...need, norm: Math.round(Math.max(0, need.norm - suppliedAmount)) };
        });
    }, [displayNeeds, complexFertilizer]);

    const handleAmendmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onAmendmentChange(e.target.value);
    };

    const handleFertilizerChange = (element: string, fertilizerValue: string) => {
        onSelectionsChange({ ...selections, [element]: { selectedFertilizer: fertilizerValue } });
    };
    
    const getCalculatedNorm = (element: string, nutrientNorm: number) => {
        const selection = selections[element];
        if (!selection || !selection.selectedFertilizer) return 0;
        const percentage = parseFloat(selection.selectedFertilizer);
        if (isNaN(percentage) || percentage === 0 || nutrientNorm === 0) return 0;
        return Math.round((nutrientNorm / percentage) * 100);
    };

    const nutrientNeeds = finalNeeds.filter(need => need.element !== 'Меліорант' && need.norm > 0);
    const complexFertilizerTotal = (parseFloat(complexFertilizer.rate) || 0) * fieldArea;

    return (
        <div>
            <h3 className="text-xl font-semibold mb-4 text-slate-700 border-b pb-2">{t('basicApplicationHeader', lang)}</h3>
            
            {/* Always show the complex fertilizer option if there is any nutrient need */}
            {hasNutrientNeeds && (
                 <div className="mb-6 p-4 border border-indigo-200 rounded-lg bg-indigo-50">
                    <div className="relative flex items-start">
                        <div className="flex h-6 items-center">
                            <input id="complex-toggle" type="checkbox" checked={complexFertilizer.enabled} onChange={handleToggleComplexFertilizer} className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600" disabled={readOnly} />
                        </div>
                        <div className="ml-3 text-sm leading-6">
                            <label htmlFor="complex-toggle" className="font-medium text-slate-900 cursor-pointer">{t('addComplexFertilizer', lang)}</label>
                            <p className="text-slate-500">{t('addComplexFertilizerDesc', lang)}</p>
                        </div>
                    </div>
                 </div>
            )}
            
            {complexFertilizer.enabled && (
                <div className="mb-8 p-4 border rounded-lg bg-slate-50 space-y-4 shadow-inner">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <h4 className="text-lg font-semibold text-slate-800">{t('complexFertilizerHeader', lang)}</h4>
                        {!readOnly && (
                            <div className="flex flex-wrap gap-2">
                                <button type="button" onClick={handleNitroammophoskaClick} className="bg-indigo-100 text-indigo-700 text-xs font-semibold px-4 py-1.5 rounded-full hover:bg-indigo-200 transition-colors shadow-sm">{t('nitroammophoskaButton', lang)}</button>
                                <button type="button" onClick={handleChickenManureClick} className="bg-amber-100 text-amber-700 text-xs font-semibold px-4 py-1.5 rounded-full hover:bg-amber-200 transition-colors shadow-sm">{t('chickenManureButton', lang)}</button>
                                <button type="button" onClick={handleDiammophoskaClick} className="bg-orange-100 text-orange-700 text-xs font-semibold px-4 py-1.5 rounded-full hover:bg-orange-200 transition-colors shadow-sm">{t('diammophoskaButton', lang)}</button>
                            </div>
                        )}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                       <ComplexFertilizerInput label="N" name="n" value={complexFertilizer.n} onChange={handleComplexFertilizerInputChange} disabled={readOnly} />
                       <ComplexFertilizerInput label="P₂O₅" name="p2o5" value={complexFertilizer.p2o5} onChange={handleComplexFertilizerInputChange} disabled={readOnly} />
                       <ComplexFertilizerInput label="K₂O" name="k2o" value={complexFertilizer.k2o} onChange={handleComplexFertilizerInputChange} disabled={readOnly} />
                       <ComplexFertilizerInput label="CaO" name="cao" value={complexFertilizer.cao} onChange={handleComplexFertilizerInputChange} disabled={readOnly} />
                       <ComplexFertilizerInput label="MgO" name="mg" value={complexFertilizer.mg} onChange={handleComplexFertilizerInputChange} disabled={readOnly} />
                    </div>
                     <div className="pt-2">
                        <StyledFormField label={t('complexFertilizerRateLabel', lang)} name="rate" value={complexFertilizer.rate} onChange={() => {}} unit="kg/ha" disabled={true} />
                        {complexFertilizerTotal > 0 && <p className="text-sm text-slate-600 mt-1 text-right font-medium">{t('totalForArea', lang)} <span className="font-bold text-indigo-700">{complexFertilizerTotal.toFixed(1)} kg</span></p>}
                    </div>
                </div>
            )}
            <div className="overflow-x-auto rounded-lg shadow-md border border-slate-200">
                <table className="min-w-full bg-white">
                    <thead className="bg-slate-100">
                        <tr>
                            <th className="py-3 px-6 text-left text-sm font-semibold uppercase text-slate-600">{t('element', lang)}</th>
                            <th className="py-3 px-6 text-left text-sm font-semibold uppercase text-slate-600">{complexFertilizer.enabled ? t('remainingNeed', lang) : t('need', lang)}</th>
                            <th className="py-3 px-6 text-left text-sm font-semibold uppercase text-slate-600">{t('fertilizerLabel', lang)}</th>
                            <th className="py-3 px-6 text-left text-sm font-semibold uppercase text-slate-600">{t('applicationRate', lang)}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {nutrientNeeds.map(need => {
                            const calculatedNorm = getCalculatedNorm(need.element, need.norm);
                            return (
                                <tr key={need.element} className="hover:bg-indigo-50">
                                    <td className="py-4 px-6 whitespace-nowrap font-medium text-slate-800">{need.element}</td>
                                    <td className="py-4 px-6 whitespace-nowrap text-slate-700">{need.norm} kg/ha</td>
                                    <td className="py-4 px-6 whitespace-nowrap">
                                        <select value={selections[need.element]?.selectedFertilizer || ''} onChange={(e) => handleFertilizerChange(need.element, e.target.value)} className="w-full px-3 py-1.5 border border-slate-300 rounded-md text-sm disabled:bg-slate-100" disabled={readOnly}>
                                            <option value=""></option>
                                            {(SIMPLE_FERTILIZERS[need.element] || []).map(fert => <option key={fert.value} value={fert.value}>{fert.label[lang]} ({fert.value}%)</option>)}
                                        </select>
                                    </td>
                                    <td className="py-4 px-6 whitespace-nowrap font-semibold text-indigo-600">
                                        {calculatedNorm > 0 && <div><p>{calculatedNorm} kg/ha</p><p className="text-xs text-slate-600">({(calculatedNorm * fieldArea).toFixed(1)} kg)</p></div>}
                                    </td>
                                </tr>
                            );
                        })}
                        {needsAmendment && (
                             <tr className="bg-indigo-50/70">
                                <td className="py-4 px-6 whitespace-nowrap font-medium text-slate-800 flex items-center gap-1.5">{t('amendmentLabel', lang)} <Tooltip text={t('amendmentTooltip', lang)}><InfoIcon className="h-4 w-4" /></Tooltip></td>
                                <td className="py-4 px-6 whitespace-nowrap font-bold text-slate-700">{Math.round((7 - parseFloat(ph)) * 5) * 1000} kg/ha</td>
                                <td className="py-4 px-6 whitespace-nowrap">
                                    <select value={amendment} onChange={handleAmendmentChange} className="w-full px-3 py-1.5 border border-slate-300 rounded-md text-sm disabled:bg-slate-100" disabled={readOnly}>
                                        <option value=""></option>
                                        {AMENDMENTS.map(amend => <option key={amend.value} value={amend.value}>{amend.label[lang]}</option>)}
                                    </select>
                                </td>
                                 <td className="py-4 px-6 whitespace-nowrap text-sm text-indigo-600 font-semibold">{amendment && `${(Math.round((7 - parseFloat(ph)) * 5) * 1000 * fieldArea).toFixed(0)} kg`}</td>
                            </tr>
                        )}
                        {nutrientNeeds.length === 0 && !needsAmendment && (
                             <tr>
                                <td colSpan={4} className="py-10 text-center text-slate-500 italic">
                                    {t('basicApplicationNotNeeded', lang)}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
