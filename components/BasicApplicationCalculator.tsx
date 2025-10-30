import React, { useMemo, useEffect } from 'react';
import type { FormData, NutrientNeeds, BasicFertilizerSelections, ComplexFertilizer } from '../types';
import { SIMPLE_FERTILIZERS, AMENDMENTS, AMENDMENT_EFFECTS } from '../constants';
import { StyledFormField } from './StyledFormField';

interface BasicApplicationCalculatorProps {
    needs: NutrientNeeds[];
    soilData: Partial<FormData>;
    selections: BasicFertilizerSelections;
    onSelectionsChange: (selections: BasicFertilizerSelections) => void;
    amendment: string;
    onAmendmentChange: (amendment: string) => void;
    complexFertilizer: ComplexFertilizer;
    onComplexFertilizerChange: (fertilizer: ComplexFertilizer) => void;
    readOnly?: boolean;
}

const DEFAULT_FERTILIZERS: Record<string, string> = {
    'P2O5': '19', // Суперфосфат
    'K2O': '60',  // Калій хлористий
    'CaO': '35',  // Сульфат кальцію (гіпс)
    'MgO': '16',  // Сульфат магнію
};

const ComplexFertilizerInput: React.FC<{ label: string, name: keyof Omit<ComplexFertilizer, 'rate' | 'enabled'>, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, disabled?: boolean }> = ({ label, name, value, onChange, disabled }) => (
    <div>
        <label htmlFor={`complex-${name}`} className="block text-sm font-medium text-gray-700 text-center" dangerouslySetInnerHTML={{ __html: label }} />
        <div className="mt-1 relative rounded-md shadow-sm">
            <input
                type="number"
                name={name}
                id={`complex-${name}`}
                value={value}
                onChange={onChange}
                className="w-full pl-2 pr-6 py-1.5 border border-gray-300 rounded-md text-center focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                placeholder="0"
                min="0"
                max="100"
                step="0.1"
                disabled={disabled}
                aria-label={`Відсоток ${label}`}
            />
            <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">%</span>
            </div>
        </div>
    </div>
);


export const BasicApplicationCalculator: React.FC<BasicApplicationCalculatorProps> = ({
    needs,
    soilData,
    selections,
    onSelectionsChange,
    amendment,
    onAmendmentChange,
    complexFertilizer,
    onComplexFertilizerChange,
    readOnly = false,
}) => {
    
    useEffect(() => {
        if (!readOnly) {
            const initialSelections: BasicFertilizerSelections = {};
            needs.forEach(need => {
                if (need.norm > 0 && DEFAULT_FERTILIZERS[need.element]) {
                    initialSelections[need.element] = {
                        selectedFertilizer: DEFAULT_FERTILIZERS[need.element],
                    };
                }
            });
            onSelectionsChange(initialSelections);
            onAmendmentChange('');
        }
    }, [needs, readOnly]);


    const { ph } = soilData;
    const needsAmendment = ph && parseFloat(ph) <= 6.8;

    const displayNeeds = useMemo<NutrientNeeds[]>(() => {
        if (!amendment || !needsAmendment || !soilData.ph) {
            return needs.map(need => need.element === 'Меліорант' ? { ...need, norm: 0 } : need);
        }

        const amendmentEffects = AMENDMENT_EFFECTS[amendment as keyof typeof AMENDMENT_EFFECTS];
        const numericPh = parseFloat(soilData.ph);

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
    }, [needs, amendment, needsAmendment, soilData.ph]);

    const elementsWithNeedCount = useMemo(() => {
        return needs.filter(n => n.element !== 'Меліорант' && n.norm > 0).length;
    }, [needs]);
    
     useEffect(() => {
        if (!complexFertilizer.enabled || readOnly) {
            return;
        }

        const needsMap: Record<string, number> = displayNeeds.reduce((acc, need) => {
            acc[need.element] = need.norm;
            return acc;
        }, {} as Record<string, number>);

        const complexFertilizerContent = {
            'P2O5': parseFloat(complexFertilizer.p2o5 || '0'),
            'K2O': parseFloat(complexFertilizer.k2o || '0'),
            'CaO': parseFloat(complexFertilizer.cao || '0'),
            'MgO': parseFloat(complexFertilizer.mg || '0'),
        };

        let maxRate = 0;

        // Find the element that requires the highest application rate
        for (const element in complexFertilizerContent) {
            const need = needsMap[element] || 0;
            const percentage = complexFertilizerContent[element as keyof typeof complexFertilizerContent];

            if (need > 0 && percentage > 0) {
                const requiredRate = (need / percentage) * 100;
                if (requiredRate > maxRate) {
                    maxRate = requiredRate;
                }
            }
        }

        const newRate = maxRate > 0 ? Math.round(maxRate).toString() : '';
        
        // Prevent re-rendering if the rate is the same.
        if (newRate !== complexFertilizer.rate) {
            onComplexFertilizerChange({ ...complexFertilizer, rate: newRate });
        }

    }, [
        complexFertilizer.enabled, 
        complexFertilizer.p2o5, 
        complexFertilizer.k2o, 
        complexFertilizer.cao, 
        complexFertilizer.mg, 
        displayNeeds, 
        readOnly, 
        complexFertilizer.rate,
        onComplexFertilizerChange
    ]);

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

    const finalNeeds = useMemo(() => {
        const rate = parseFloat(complexFertilizer.rate);
        if (!complexFertilizer.enabled || !rate || isNaN(rate) || rate <= 0) {
            return displayNeeds;
        }

        const supplied = {
            'P2O5': rate * (parseFloat(complexFertilizer.p2o5 || '0') / 100),
            'K2O': rate * (parseFloat(complexFertilizer.k2o || '0') / 100),
            'CaO': rate * (parseFloat(complexFertilizer.cao || '0') / 100),
            'MgO': rate * (parseFloat(complexFertilizer.mg || '0') / 100),
        };

        return displayNeeds.map(need => {
            if (need.element === 'Меліорант') return need;
            const suppliedAmount = supplied[need.element as keyof typeof supplied] || 0;
            return {
                ...need,
                norm: Math.round(Math.max(0, need.norm - suppliedAmount)),
            };
        });
    }, [displayNeeds, complexFertilizer]);


    const handleAmendmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const amendmentValue = e.target.value;
        onAmendmentChange(amendmentValue);

        const newSelections = { ...selections };
        delete newSelections['CaO'];
        delete newSelections['MgO'];
        onSelectionsChange(newSelections);
    };

    const handleFertilizerChange = (element: string, fertilizerValue: string) => {
        onSelectionsChange({
            ...selections,
            [element]: { selectedFertilizer: fertilizerValue }
        });
    };
    
    const getCalculatedNorm = (element: string, nutrientNorm: number) => {
        const selection = selections[element];
        if (!selection || !selection.selectedFertilizer) return 0;

        const percentage = parseFloat(selection.selectedFertilizer);
        if (isNaN(percentage) || percentage === 0 || nutrientNorm === 0) return 0;
        
        return Math.round((nutrientNorm / percentage) * 100);
    };


    const renderUnit = (element: string) => {
        return element === 'Меліорант' ? 'кг/га' : 'кг д.р./га';
    };

    const hasVisibleNeeds = finalNeeds.some(need => need.norm > 0) || needsAmendment;
    const amendmentRowData = finalNeeds.find(n => n.element === 'Меліорант');

    if (!hasVisibleNeeds && !complexFertilizer.enabled) {
        return (
             <div>
                <h3 className="text-xl font-semibold mb-4 text-gray-700 border-b pb-2">Основне внесення</h3>
                <p>Основне внесення не потрібне на основі розрахунків.</p>
            </div>
        );
    }
    
    const nutrientNeeds = finalNeeds.filter(need => need.element !== 'Меліорант' && need.norm > 0);
    const tableHeaderLabel = complexFertilizer.enabled ? 'Залишкова потреба' : 'Потреба';
    
    const handleNitroammophoskaClick = () => {
        onComplexFertilizerChange({
            ...complexFertilizer,
            n: '16',
            p2o5: '16',
            k2o: '16',
            cao: '',
            mg: '',
        });
    };

    return (
        <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-700 border-b pb-2">Основне внесення</h3>

            {elementsWithNeedCount >= 2 && (
                 <div className="mb-6 p-4 border border-blue-200 rounded-lg bg-blue-50">
                    <div className="relative flex items-start">
                        <div className="flex h-6 items-center">
                            <input
                            id="complex-toggle"
                            aria-describedby="complex-description"
                            name="complex-toggle"
                            type="checkbox"
                            checked={complexFertilizer.enabled}
                            onChange={handleToggleComplexFertilizer}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                            disabled={readOnly}
                            />
                        </div>
                        <div className="ml-3 text-sm leading-6">
                            <label htmlFor="complex-toggle" className="font-medium text-gray-900 cursor-pointer">
                                Додати комплексне осіннє добриво
                            </label>
                            <p id="complex-description" className="text-gray-500">
                                Внесіть склад для автоматичного розрахунку норми та перерахунку потреби.
                            </p>
                        </div>
                    </div>
                 </div>
            )}

            {complexFertilizer.enabled && (
                <div className="mb-8 p-4 border rounded-lg bg-gray-50 space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <h4 className="text-lg font-semibold text-gray-800">Склад та норма комплексного добрива</h4>
                        {!readOnly && (
                            <button
                                type="button"
                                onClick={handleNitroammophoskaClick}
                                className="bg-blue-100 text-blue-700 text-xs font-semibold px-4 py-1.5 rounded-full hover:bg-blue-200 transition-colors flex-shrink-0"
                                title="Заповнити поля даними Нітроамофоски (16-16-16)"
                            >
                                Нітроамофоска
                            </button>
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
                        <StyledFormField 
                            label="Норма внесення (розрахована)" 
                            name="rate" 
                            value={complexFertilizer.rate}
                            onChange={() => {}}
                            unit="кг/га"
                            disabled={true}
                        />
                    </div>
                </div>
            )}


            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
                {nutrientNeeds.map(need => {
                    const simpleFertilizersForElement = SIMPLE_FERTILIZERS[need.element as keyof typeof SIMPLE_FERTILIZERS] || [];
                    const calculatedNorm = getCalculatedNorm(need.element, need.norm);
                    return (
                        <div key={need.element} className="bg-gray-50 p-4 rounded-lg shadow">
                            <h4 className="font-bold text-lg text-gray-800">{need.element}</h4>
                            <div className="mt-2 space-y-2">
                                <p><span className="font-semibold">{tableHeaderLabel}:</span> {need.norm} {renderUnit(need.element)}</p>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Добриво:</label>
                                    <select
                                        value={selections[need.element]?.selectedFertilizer || ''}
                                        onChange={(e) => handleFertilizerChange(need.element, e.target.value)}
                                        className="w-full px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm disabled:bg-gray-100"
                                        disabled={readOnly}
                                        title="оберіть добриво"
                                    >
                                        <option value=""></option>
                                        {simpleFertilizersForElement.map(fert => (
                                            <option key={fert.label} value={fert.value}>{fert.label} ({fert.value}%)</option>
                                        ))}
                                    </select>
                                </div>
                                {calculatedNorm > 0 && (
                                     <p className="font-semibold text-blue-600">Норма внесення: {calculatedNorm} кг/га</p>
                                )}
                            </div>
                        </div>
                    );
                })}
                {needsAmendment && (
                    <div className="bg-blue-50 p-4 rounded-lg shadow">
                        <h4 className="font-bold text-lg text-gray-800">Меліорант</h4>
                        <div className="mt-2 space-y-2">
                            <p>
                                <span className="font-semibold">Потреба:</span> 
                                <span className="ml-2 font-bold">
                                {amendmentRowData && amendmentRowData.norm > 0 
                                   ? `${amendmentRowData.norm} ${renderUnit('Меліорант')}` 
                                   : 'Оберіть для розрахунку'}
                                </span>
                            </p>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Меліорант:</label>
                                 <select
                                    value={amendment}
                                    onChange={handleAmendmentChange}
                                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm disabled:bg-gray-100"
                                    disabled={readOnly}
                                    title="оберіть меліорант"
                                >
                                    <option value=""></option>
                                    {AMENDMENTS.map(amend => (
                                        <option key={amend.value} value={amend.value}>{amend.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto rounded-lg shadow-md border border-gray-200">
                <table className="min-w-full bg-white">
                    <thead className="bg-slate-100">
                        <tr>
                            <th className="py-3 px-6 text-left text-sm font-semibold uppercase text-slate-600 tracking-wider">Елемент</th>
                            <th className="py-3 px-6 text-left text-sm font-semibold uppercase text-slate-600 tracking-wider">{tableHeaderLabel}</th>
                            <th className="py-3 px-6 text-left text-sm font-semibold uppercase text-slate-600 tracking-wider">Добриво / Меліорант</th>
                            <th className="py-3 px-6 text-left text-sm font-semibold uppercase text-slate-600 tracking-wider">Норма внесення (фіз. вага)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {nutrientNeeds.map(need => {
                            const simpleFertilizersForElement = SIMPLE_FERTILIZERS[need.element as keyof typeof SIMPLE_FERTILIZERS] || [];
                            const calculatedNorm = getCalculatedNorm(need.element, need.norm);
                            return (
                                <tr key={need.element} className="hover:bg-sky-50 transition-colors">
                                    <td className="py-4 px-6 whitespace-nowrap font-medium text-gray-800">{need.element}</td>
                                    <td className="py-4 px-6 whitespace-nowrap text-gray-700">{need.norm} {renderUnit(need.element)}</td>
                                    <td className="py-4 px-6 whitespace-nowrap">
                                        <select
                                            value={selections[need.element]?.selectedFertilizer || ''}
                                            onChange={(e) => handleFertilizerChange(need.element, e.target.value)}
                                            className="w-full px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm disabled:bg-gray-100"
                                            disabled={readOnly}
                                            title="оберіть добриво"
                                        >
                                            <option value=""></option>
                                            {simpleFertilizersForElement.map(fert => (
                                                <option key={fert.label} value={fert.value}>{fert.label} ({fert.value}%)</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="py-4 px-6 whitespace-nowrap font-semibold text-blue-600">
                                        {calculatedNorm > 0 ? `${calculatedNorm} кг/га` : ''}
                                    </td>
                                </tr>
                            );
                        })}
                        {needsAmendment && (
                             <tr className="bg-sky-50/70 hover:bg-sky-100 transition-colors">
                                <td className="py-4 px-6 whitespace-nowrap font-medium text-gray-800">Меліорант</td>
                                <td className="py-4 px-6 whitespace-nowrap font-bold text-gray-700">
                                     {amendmentRowData && amendmentRowData.norm > 0 
                                        ? `${amendmentRowData.norm} ${renderUnit('Меліорант')}` 
                                        : 'Оберіть для розрахунку'
                                     }
                                </td>
                                <td className="py-4 px-6 whitespace-nowrap">
                                    <select
                                        value={amendment}
                                        onChange={handleAmendmentChange}
                                        className="w-full px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm disabled:bg-gray-100"
                                        disabled={readOnly}
                                        title="оберіть меліорант"
                                    >
                                        <option value=""></option>
                                        {AMENDMENTS.map(amend => (
                                            <option key={amend.value} value={amend.value}>{amend.label}</option>
                                        ))}
                                    </select>
                                </td>
                                 <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-700"></td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};