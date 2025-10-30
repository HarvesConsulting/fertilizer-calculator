import type { FormData, CalculationResults, CultureParams, NutrientNeeds, ComplexFertilizer } from '../types';
import { calculateFertigationPlan } from './fertigationCalculator';
import { AMENDMENT_EFFECTS, FERTIGATION_CULTURES } from '../constants';

interface ReportData {
    formData: FormData;
    results: CalculationResults;
    calculationType: 'basic' | 'fertigation' | 'full';
    cultureParams: CultureParams;
    springFertilizer: { n: string; p: string; k: string; ca: string; mg: string; };
    nitrogenFertilizer: string;
    complexFertilizer: ComplexFertilizer;
}

const pad = (str: string | number, length: number) => String(str).padEnd(length, ' ');

export const generateTxtReport = (data: ReportData): string => {
    const { formData, results, calculationType, cultureParams, springFertilizer, nitrogenFertilizer, complexFertilizer } = data;
    
    let report = `==================================================\n`;
    report += `   ЗВІТ АГРОХІМІЧНОГО РОЗРАХУНКУ\n`;
    report += `==================================================\n\n`;

    report += `---------- ВХІДНІ ДАНІ ----------\n`;
    report += `Культура: ${formData.culture}\n`;
    report += `Планована врожайність: ${formData.plannedYield} т/га\n\n`;
    
    report += `Аналіз ґрунту:\n`;
    report += `  - Нітратний азот: ${formData.nitrogenAnalysis} мг/кг\n`;
    report += `  - Фосфор (P₂O₅): ${formData.phosphorus} мг/кг\n`;
    report += `  - Калій (K₂O): ${formData.potassium} мг/кг\n`;
    report += `  - Кальцій (CaO): ${formData.calcium} мг/кг\n`;
    report += `  - Магній (MgO): ${formData.magnesium} мг/кг\n`;
    report += `  - Кислотність (pH): ${formData.ph}\n`;
    report += `  - ЄКО: ${formData.cec} мг-екв/100г\n\n`;
    
    if (calculationType === 'basic' || calculationType === 'full') {
        report += `---------- 1. ОСНОВНЕ ВНЕСЕННЯ ----------\n\n`;

        if (complexFertilizer && complexFertilizer.enabled && parseFloat(complexFertilizer.rate) > 0) {
            report += `Комплексне осіннє добриво:\n`;
            report += `  - Склад: N:${complexFertilizer.n}% P₂O₅:${complexFertilizer.p2o5}% K₂O:${complexFertilizer.k2o}% CaO:${complexFertilizer.cao}% MgO:${complexFertilizer.mg}%\n`;
            report += `  - Норма внесення: ${complexFertilizer.rate} кг/га\n\n`;
            report += `Розрахунок потреби нижче враховує внесення цього добрива.\n\n`;
        }
        
        const ph = parseFloat(formData.ph);
        const needsAmendment = ph <= 6.8;
        
        results.basic.forEach(need => {
            if (need.element !== 'Меліорант') {
                report += `${pad(need.element, 10)}: ${need.norm} кг д.р./га\n`;
            }
        });

        if (needsAmendment) {
             const amendmentRateTons = Math.round((7 - ph) * 5);
             report += `\nНорма внесення меліоранта (орієнтовно): ${amendmentRateTons * 1000} кг/га (${amendmentRateTons} т/га)\n`;
             report += `(Розрахунок потреби CaO та MgO вище вже враховує ефект від меліоранта, якщо він був обраний у таблиці)\n`;
        }
        report += `\n`;
    }

    if (calculationType === 'fertigation' || calculationType === 'full') {
        report += `---------- 2. ПРОГРАМА ФЕРТИГАЦІЇ ----------\n\n`;
        
        report += `Початкова потреба (д.р./га):\n`;
        results.fertigation.forEach(need => {
             if (need.norm > 0) {
                report += `  - ${pad(need.element, 5)}: ${need.norm}\n`;
            }
        });
        report += `\n`;

        const findCultureKey = (cultureName: string) => {
            return Object.keys(FERTIGATION_CULTURES).find(key => 
                FERTIGATION_CULTURES[key as keyof typeof FERTIGATION_CULTURES].startsWith(cultureName)
            );
        };
        const cultureKey = findCultureKey(results.culture);
        
        if (cultureKey) {
            const { weeklyPlan, totals, fertilizerRate } = calculateFertigationPlan({
                initialNeeds: results.fertigation,
                cultureKey,
                cultureParams,
                springFertilizer,
                nitrogenFertilizer,
            });

            const kPercentage = parseFloat(springFertilizer.k);
            if (fertilizerRate && kPercentage > 0) {
                 report += `Весняне (стартове) добриво:\n`;
                 report += `  - Склад: N:${springFertilizer.n}% P:${springFertilizer.p}% K:${springFertilizer.k}% Ca:${springFertilizer.ca}% Mg:${springFertilizer.mg}%\n`;
                 report += `  - Розрахункова норма внесення: ${fertilizerRate.toFixed(1)} кг/га\n\n`;
            }
            
            const nitrogenFertilizerName = nitrogenFertilizer === 'ammonium-nitrate' ? 'Аміачна селітра' : 'Карбамід';
            
            report += `Потижневий план внесення добрив (фізична вага, кг/га):\n`;
            report += `--------------------------------------------------------------------------------------------------\n`;
            report += `| ${pad('Тиждень', 8)}| ${pad(nitrogenFertilizerName, 18)}| ${pad('Ортофосфорна к-та', 20)}| ${pad('Сульфат калію', 16)}| ${pad('Нітрат кальцію', 16)}| ${pad('Сульфат магнію', 16)}|\n`;
            report += `--------------------------------------------------------------------------------------------------\n`;

            weeklyPlan.forEach(item => {
                if(item) {
                     report += `| ${pad(item.week, 8)}| ${pad(item.nitrogen.toFixed(1), 18)}| ${pad(item.phosphorus.toFixed(1), 20)}| ${pad(item.potassium.toFixed(1), 16)}| ${pad(item.calcium.toFixed(1), 16)}| ${pad(item.magnesium.toFixed(1), 16)}|\n`;
                }
            });
            report += `--------------------------------------------------------------------------------------------------\n`;
            report += `| ${pad('РАЗОМ:', 8)}| ${pad(totals.nitrogen.toFixed(1), 18)}| ${pad(totals.phosphorus.toFixed(1), 20)}| ${pad(totals.potassium.toFixed(1), 16)}| ${pad(totals.calcium.toFixed(1), 16)}| ${pad(totals.magnesium.toFixed(1), 16)}|\n`;
            report += `--------------------------------------------------------------------------------------------------\n\n`;
        }
    }
    
    report += `\n==================================================\n`;
    report += `   Розрахунок носить рекомендаційний характер.\n`;
    report += `==================================================\n`;

    return report;
};