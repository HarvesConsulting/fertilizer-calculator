import type { FormData, CalculationResults, NutrientNeeds } from '../types';
import { CULTURE_PARAMS } from '../constants';

export const calculateNutrientNeeds = (formData: FormData): CalculationResults | null => {
    const numericData = Object.entries(formData)
        .filter(([key]) => !['culture', 'amendment', 'fieldName', 'sowingDate'].includes(key))
        .reduce((acc, [key, value]) => ({ ...acc, [key]: parseFloat(value as string) }), {} as Record<string, number>);

    const params = CULTURE_PARAMS[formData.culture];
    if (!params) return null;

    // --- 1. Basic Application Logic (Основне внесення) ---
    
    // Phosphorus: Step-based logic dependent on soil content
    let phosphorusRate = 0;
    if (numericData.phosphorus > 30) phosphorusRate = 50;
    else if (numericData.phosphorus > 20) phosphorusRate = 100;
    else if (numericData.phosphorus > 10) phosphorusRate = 150;
    else if (numericData.phosphorus >= 5) phosphorusRate = 200;
    else phosphorusRate = 250;

    // Potassium, Calcium, Magnesium: Formula based on CEC (ЄКО)
    const potassiumNeed = Math.max(0, (110 + 2.5 * numericData.cec) - numericData.potassium);
    const calciumRate = Math.max(0, (130 * numericData.cec) - numericData.calcium);
    const magnesiumRate = Math.max(0, (8 * numericData.cec) - numericData.magnesium);

    const basicNeeds: NutrientNeeds[] = [
        { element: 'P2O5', norm: phosphorusRate },
        { element: 'K2O', norm: potassiumNeed },
        { element: 'CaO', norm: calciumRate },
        { element: 'MgO', norm: magnesiumRate },
        { element: 'Меліорант', norm: 0 },
    ];

    // --- 2. Fertigation Logic (Фертигація) ---

    // Nitrogen: Based on yield factor minus soil nitrogen reserve
    const nitrogenRate = (params.nitrogenFactor * numericData.plannedYield) - (numericData.nitrogenAnalysis * 3);
    
    // Water soluble Phosphorus: 20% of basic need
    const waterSolublePhosphorusRate = Math.max(0, phosphorusRate * 0.2);
    
    // Potassium for fertigation: Lookup table based on soil content ranges defined in constants.ts
    const kRange = params.potassiumRanges.find(r => numericData.potassium >= r.min && numericData.potassium <= r.max);
    const solublePotassiumNeed = kRange ? kRange.value : 0;
    
    // Calcium & Magnesium for fertigation: Ratio relative to soluble Potassium
    const solubleCalciumNeed = solublePotassiumNeed * params.calciumFactor;
    const solubleMagnesiumNeed = solublePotassiumNeed * params.magnesiumFactor;
    
    const fertigationNeeds: NutrientNeeds[] = [
        { element: 'N', norm: Math.max(0, nitrogenRate) },
        { element: 'P2O5', norm: waterSolublePhosphorusRate },
        { element: 'K2O', norm: solublePotassiumNeed },
        { element: 'CaO', norm: solubleCalciumNeed },
        { element: 'MgO', norm: solubleMagnesiumNeed },
    ];

    return {
        culture: formData.culture,
        basic: basicNeeds.map(n => ({...n, norm: Math.round(n.norm)})),
        fertigation: fertigationNeeds.map(n => ({...n, norm: Math.round(n.norm)})),
    };
};