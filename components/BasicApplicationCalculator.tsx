import React, { useMemo, useEffect } from 'react';
import type { FormData, NutrientNeeds, BasicFertilizerSelections } from '../types';
import { SIMPLE_FERTILIZERS, AMENDMENTS, AMENDMENT_EFFECTS } from '../constants';

interface BasicApplicationCalculatorProps {
    needs: NutrientNeeds[];
    soilData: Partial<FormData>;
    selections: BasicFertilizerSelections;
    onSelectionsChange: (selections: BasicFertilizerSelections) => void;
    amendment: string;
    onAmendmentChange: (amendment: string) => void;
    readOnly?: boolean;
}

export const BasicApplicationCalculator: React.FC<BasicApplicationCalculatorProps> = ({
    needs,
    soilData,
    selections,
    onSelectionsChange,
    amendment,
    onAmendmentChange,
    readOnly = false,
}) => {
    
    useEffect(() => {
        if (!readOnly) {
            onSelectionsChange({});
            onAmendmentChange('');
        }
    }, [needs]);


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

    const hasVisibleNeeds = displayNeeds.some(need => need.norm > 0) || needsAmendment;
    const amendmentRowData = displayNeeds.find(n => n.element === 'Меліорант');

    if (!hasVisibleNeeds) {
        return (
             <div>
                <h3 className="text-xl font-semibold mb-4 text-gray-700 border-b pb-2">Основне внесення</h3>
                <p>Основне внесення не потрібне на основі розрахунків.</p>
            </div>
        );
    }
    
    const nutrientNeeds = displayNeeds.filter(need => need.element !== 'Меліорант' && need.norm > 0);

    return (
        <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-700 border-b pb-2">Основне внесення</h3>
            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
                {nutrientNeeds.map(need => {
                    const simpleFertilizersForElement = SIMPLE_FERTILIZERS[need.element as keyof typeof SIMPLE_FERTILIZERS] || [];
                    const calculatedNorm = getCalculatedNorm(need.element, need.norm);
                    return (
                        <div key={need.element} className="bg-gray-50 p-4 rounded-lg shadow">
                            <h4 className="font-bold text-lg text-gray-800">{need.element}</h4>
                            <div className="mt-2 space-y-2">
                                <p><span className="font-semibold">Потреба:</span> {need.norm} {renderUnit(need.element)}</p>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Добриво:</label>
                                    <select
                                        value={selections[need.element]?.selectedFertilizer || ''}
                                        onChange={(e) => handleFertilizerChange(need.element, e.target.value)}
                                        className="w-full px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm disabled:bg-gray-100"
                                        disabled={readOnly}
                                        title="Оберіть добриво для розрахунку норми"
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
                                    title="Оберіть меліорант для розрахунку норми"
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
            <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Елемент</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Потреба</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Добриво / Меліорант</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Норма внесення (фіз. вага)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {nutrientNeeds.map(need => {
                            const simpleFertilizersForElement = SIMPLE_FERTILIZERS[need.element as keyof typeof SIMPLE_FERTILIZERS] || [];
                             const calculatedNorm = getCalculatedNorm(need.element, need.norm);
                            return (
                                <tr key={need.element}>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{need.element}</td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{need.norm} {renderUnit(need.element)}</td>
                                    <td className="px-4 py-2 whitespace-nowrap">
                                        <select
                                            value={selections[need.element]?.selectedFertilizer || ''}
                                            onChange={(e) => handleFertilizerChange(need.element, e.target.value)}
                                            className="w-full px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm disabled:bg-gray-100"
                                            disabled={readOnly}
                                            title="Оберіть добриво для розрахунку норми"
                                        >
                                            <option value=""></option>
                                            {simpleFertilizersForElement.map(fert => (
                                                <option key={fert.label} value={fert.value}>{fert.label} ({fert.value}%)</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700 font-semibold">
                                        {calculatedNorm > 0 ? `${calculatedNorm} кг/га` : ''}
                                    </td>
                                </tr>
                            );
                        })}
                        {needsAmendment && (
                             <tr className="bg-blue-50">
                                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">Меліорант</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700 font-bold">
                                     {amendmentRowData && amendmentRowData.norm > 0 
                                        ? `${amendmentRowData.norm} ${renderUnit('Меліорант')}` 
                                        : 'Оберіть для розрахунку'
                                     }
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap">
                                    <select
                                        value={amendment}
                                        onChange={handleAmendmentChange}
                                        className="w-full px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm disabled:bg-gray-100"
                                        disabled={readOnly}
                                        title="Оберіть меліорант для розрахунку норми"
                                    >
                                        <option value=""></option>
                                        {AMENDMENTS.map(amend => (
                                            <option key={amend.value} value={amend.value}>{amend.label}</option>
                                        ))}
                                    </select>
                                </td>
                                 <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700"></td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};