import { FERTIGATION_SCHEDULES } from '../components/FertigationSchedules';
import type { NutrientNeeds, CultureParams, SpringFertilizer } from '../types';

interface FertigationPlanInputs {
    initialNeeds: NutrientNeeds[];
    cultureKey: string;
    cultureParams: CultureParams;
    springFertilizer: SpringFertilizer;
    nitrogenFertilizer: string;
}

export const calculateFertigationPlan = ({
    initialNeeds,
    cultureKey,
    cultureParams,
    springFertilizer,
    nitrogenFertilizer
}: FertigationPlanInputs) => {

    const { calciumFactor, magnesiumFactor } = cultureParams;

    const kPercentage = parseFloat(springFertilizer.k);
    const initialKNeed = initialNeeds.find(n => n.element === 'K2O')?.norm ?? 0;
    
    let fertilizerRate: number | null = null;
    let adjustedNeeds: NutrientNeeds[] = [...initialNeeds];

    if (springFertilizer.enabled && kPercentage && kPercentage > 0 && initialKNeed > 0) {
        const rate = (initialKNeed * 0.5 / kPercentage) * 100;
        fertilizerRate = rate;

        const nSupplied = rate * (parseFloat(springFertilizer.n || '0') / 100);
        const pSupplied = rate * (parseFloat(springFertilizer.p || '0') / 100);
        const kSupplied = rate * (parseFloat(springFertilizer.k || '0') / 100);
        const caSupplied = rate * (parseFloat(springFertilizer.ca || '0') / 100);
        const mgSupplied = rate * (parseFloat(springFertilizer.mg || '0') / 100);
        
        const adjustedKNorm = Math.max(0, initialKNeed - kSupplied);
        const recalculatedCaNorm = adjustedKNorm * calciumFactor;
        const recalculatedMgNorm = adjustedKNorm * magnesiumFactor;
        
        const finalCaNorm = Math.max(0, recalculatedCaNorm - caSupplied);
        const finalMgNorm = Math.max(0, recalculatedMgNorm - mgSupplied);


        adjustedNeeds = initialNeeds.map(need => {
            if (need.element === 'N') return { ...need, norm: Math.max(0, need.norm - nSupplied) };
            if (need.element === 'P2O5') return { ...need, norm: Math.max(0, need.norm - pSupplied) };
            if (need.element === 'K2O') return { ...need, norm: adjustedKNorm };
            if (need.element === 'CaO') return { ...need, norm: Math.max(0, finalCaNorm) };
            if (need.element === 'MgO') return { ...need, norm: Math.max(0, finalMgNorm) };
            return need;
        });

    }

    const schedule = FERTIGATION_SCHEDULES[cultureKey];
    if (!schedule) {
         return { weeklyPlan: [], totals: { nitrogen: 0, phosphorus: 0, potassium: 0, calcium: 0, magnesium: 0 }, fertilizerRate, adjustedNeeds };
    }

    const adjustedTotalsActive = adjustedNeeds.reduce((acc, curr) => {
        if (curr.element === 'N') acc.N = curr.norm;
        if (curr.element === 'P2O5') acc.P = curr.norm;
        if (curr.element === 'K2O') acc.K = curr.norm;
        if (curr.element === 'CaO') acc.Ca = curr.norm;
        if (curr.element === 'MgO') acc.Mg = curr.norm;
        return acc;
    }, { N: 0, P: 0, K: 0, Ca: 0, Mg: 0 });

    const totalPotassiumSulfate = adjustedTotalsActive.K > 0 ? (adjustedTotalsActive.K / 52) * 100 : 0;
    const totalCalciumNitrate = adjustedTotalsActive.Ca > 0 ? (adjustedTotalsActive.Ca / 26) * 100 : 0;
    const totalMagnesiumSulfate = adjustedTotalsActive.Mg > 0 ? (adjustedTotalsActive.Mg / 16) * 100 : 0;
    const totalPhosphoricAcid = adjustedTotalsActive.P > 0 ? (adjustedTotalsActive.P / 68) * 100 : 0;

    const nitrogenFromCalciumNitrate = totalCalciumNitrate * 0.15;
    const remainingNitrogenNeed = adjustedTotalsActive.N - nitrogenFromCalciumNitrate;

    let totalNitrogenFertilizer = 0;
    if (remainingNitrogenNeed > 0) {
        const nitrogenContent = nitrogenFertilizer === 'ammonium-nitrate' ? 34 : 46;
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

    return { weeklyPlan, totals, fertilizerRate, adjustedNeeds };
};