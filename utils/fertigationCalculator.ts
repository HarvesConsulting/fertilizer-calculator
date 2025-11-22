
import { FERTIGATION_SCHEDULES } from '../components/FertigationSchedules';
import type { NutrientNeeds, CultureParams, SpringFertilizer } from '../types';

// Fertilizer content percentages for fertigation
const FERTILIZER_CONTENTS = {
    NITROGEN_IN_AMMONIUM_NITRATE: 34, // N
    NITROGEN_IN_UREA: 46,             // N
    P2O5_IN_PHOSPHORIC_ACID: 68,      // P2O5 (approximate for commercial grade)
    K2O_IN_POTASSIUM_SULFATE: 52,     // K2O
    CAO_IN_CALCIUM_NITRATE: 26,       // CaO
    MGO_IN_MAGNESIUM_SULFATE: 16,     // MgO
    NITROGEN_IN_CALCIUM_NITRATE_PERCENT: 0.15 // 15.5% N typically, using 0.15 for calculation ratio relative to CaO weight if needed, but here logic is different
};

// Nitrogen content in Calcium Nitrate relative to total weight is approx 15.5%
// But in our logic we calculate N supplied based on Calcium Nitrate amount determined by CaO need.
// Calcium Nitrate (15.5-0-0 + 26.5 CaO).
// Ratio N/CaO = 15.5 / 26.5 ≈ 0.58. 
// The previous code used `totalCalciumNitrate * 0.15`. Let's verify.
// If we have 100kg Calcium Nitrate -> 26kg CaO and 15.5kg N.
// Code was: `const nitrogenFromCalciumNitrate = totalCalciumNitrate * 0.15;` 
// This assumes 15% Nitrogen in Calcium Nitrate.

interface FertigationPlanInputs {
    initialNeeds: NutrientNeeds[];
    cultureKey: string;
    cultureParams: CultureParams;
    springFertilizer: SpringFertilizer;
    nitrogenFertilizer: string;
    manualRate: number | null;
}

export const calculateFertigationPlan = ({
    initialNeeds,
    cultureKey,
    cultureParams,
    springFertilizer,
    nitrogenFertilizer,
    manualRate,
}: FertigationPlanInputs) => {

    const { calciumFactor, magnesiumFactor } = cultureParams;
    const initialKNeed = initialNeeds.find(n => n.element === 'K2O')?.norm ?? 0;
    
    let adjustedNeeds: NutrientNeeds[] = [...initialNeeds];
    const rateToUse = typeof manualRate === 'number' ? manualRate : 0;
    
    if (springFertilizer.enabled && rateToUse > 0) {
        const kSupplied = rateToUse * (parseFloat(springFertilizer.k || '0') / 100);
        const caSupplied = rateToUse * (parseFloat(springFertilizer.ca || '0') / 100);
        const mgSupplied = rateToUse * (parseFloat(springFertilizer.mg || '0') / 100);
        
        const adjustedKNorm = Math.max(0, initialKNeed - kSupplied);
        const recalculatedCaNorm = adjustedKNorm * calciumFactor;
        const recalculatedMgNorm = adjustedKNorm * magnesiumFactor;
        
        const finalCaNorm = Math.max(0, recalculatedCaNorm - caSupplied);
        const finalMgNorm = Math.max(0, recalculatedMgNorm - mgSupplied);


        adjustedNeeds = initialNeeds.map(need => {
            if (need.element === 'K2O') return { ...need, norm: adjustedKNorm };
            if (need.element === 'CaO') return { ...need, norm: Math.max(0, finalCaNorm) };
            if (need.element === 'MgO') return { ...need, norm: Math.max(0, finalMgNorm) };
            return need;
        });
    }

    const schedule = FERTIGATION_SCHEDULES[cultureKey];
    if (!schedule) {
         return { weeklyPlan: [], totals: { nitrogen: 0, phosphorus: 0, potassium: 0, calcium: 0, magnesium: 0 }, adjustedNeeds };
    }

    const adjustedTotalsActive = adjustedNeeds.reduce((acc, curr) => {
        if (curr.element === 'N') acc.N = curr.norm;
        if (curr.element === 'P2O5') acc.P = curr.norm;
        if (curr.element === 'K2O') acc.K = curr.norm;
        if (curr.element === 'CaO') acc.Ca = curr.norm;
        if (curr.element === 'MgO') acc.Mg = curr.norm;
        return acc;
    }, { N: 0, P: 0, K: 0, Ca: 0, Mg: 0 });

    const totalPotassiumSulfate = adjustedTotalsActive.K > 0 
        ? (adjustedTotalsActive.K / FERTILIZER_CONTENTS.K2O_IN_POTASSIUM_SULFATE) * 100 
        : 0;
        
    const totalCalciumNitrate = adjustedTotalsActive.Ca > 0 
        ? (adjustedTotalsActive.Ca / FERTILIZER_CONTENTS.CAO_IN_CALCIUM_NITRATE) * 100 
        : 0;
        
    const totalMagnesiumSulfate = adjustedTotalsActive.Mg > 0 
        ? (adjustedTotalsActive.Mg / FERTILIZER_CONTENTS.MGO_IN_MAGNESIUM_SULFATE) * 100 
        : 0;
        
    const totalPhosphoricAcid = adjustedTotalsActive.P > 0 
        ? (adjustedTotalsActive.P / FERTILIZER_CONTENTS.P2O5_IN_PHOSPHORIC_ACID) * 100 
        : 0;

    // Calculate Nitrogen supplied by Calcium Nitrate (typically ~15.5% N)
    const nitrogenFromCalciumNitrate = totalCalciumNitrate * 0.155;
    
    const remainingNitrogenNeed = adjustedTotalsActive.N - nitrogenFromCalciumNitrate;

    let totalNitrogenFertilizer = 0;
    if (remainingNitrogenNeed > 0) {
        const nitrogenContent = nitrogenFertilizer === 'ammonium-nitrate' 
            ? FERTILIZER_CONTENTS.NITROGEN_IN_AMMONIUM_NITRATE 
            : FERTILIZER_CONTENTS.NITROGEN_IN_UREA;
        totalNitrogenFertilizer = (remainingNitrogenNeed / nitrogenContent) * 100;
    }
    
    const weeklyPlan = schedule.distribution.map((dist, index) => {
        if (index >= schedule.weeks.length) return null;
        const weekData = {
            week: schedule.weeks[index],
            nitrogen: totalNitrogenFertilizer * dist.N,
            phosphorus: totalPhosphoricAcid * dist.P,
            potassium: totalPotassiumSulfate * dist.K,
            calcium: totalCalciumNitrate * dist.Ca,
            magnesium: totalMagnesiumSulfate * dist.Mg,
        };
        const hasValues = Object.values(weekData).slice(1).some(v => v > 0.01);
        return hasValues ? weekData : null;
    }).filter(Boolean);

    const totals = {
        nitrogen: totalNitrogenFertilizer,
        phosphorus: totalPhosphoricAcid,
        potassium: totalPotassiumSulfate,
        calcium: totalCalciumNitrate,
        magnesium: totalMagnesiumSulfate,
    };

    return { weeklyPlan, totals, adjustedNeeds };
};
