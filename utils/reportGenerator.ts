import type { FormData, CalculationResults, CultureParams, ComplexFertilizer, SpringFertilizer, BasicFertilizerSelections } from '../types';
import { calculateFertigationPlan } from './fertigationCalculator';
import { AMENDMENTS, FERTIGATION_CULTURES, SIMPLE_FERTILIZERS, AMENDMENT_EFFECTS } from '../constants';

interface ReportData {
    formData: FormData;
    results: CalculationResults;
    calculationType: 'basic' | 'fertigation' | 'full';
    cultureParams: CultureParams;
    springFertilizer: SpringFertilizer;
    nitrogenFertilizer: string;
    complexFertilizer: ComplexFertilizer;
    basicFertilizers: BasicFertilizerSelections;
    selectedAmendment: string;
}

const pad = (str: string | number, length: number) => String(str).padEnd(length, ' ');

export const generateTxtReport = (data: ReportData): string => {
    const { formData, results, calculationType, cultureParams, springFertilizer, nitrogenFertilizer, complexFertilizer, basicFertilizers, selectedAmendment } = data;
    
    const fieldArea = parseFloat(formData.fieldArea || '1') || 1;
    
    let report = `==================================================\n`;
    report += `   ЗВІТ АГРОХІМІЧНОГО РОЗРАХУНКУ\n`;
    report += `==================================================\n\n`;

    report += `---------- ВХІДНІ ДАНІ ----------\n`;
    if (formData.fieldName) {
        report += `Назва поля: ${formData.fieldName}\n`;
    }
    report += `Культура: ${formData.culture}\n`;
    report += `Планована врожайність: ${formData.plannedYield} т/га\n`;
    report += `Площа поля: ${fieldArea} га\n\n`;
    
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
        
        let finalBasicNeeds = [...results.basic];

        if (complexFertilizer && complexFertilizer.enabled && parseFloat(complexFertilizer.rate) > 0) {
            const rate = parseFloat(complexFertilizer.rate);
            const totalComplex = (rate * fieldArea).toFixed(1);
            report += `Комплексне осіннє добриво:\n`;
            report += `  - Склад: N:${complexFertilizer.n}% P₂O₅:${complexFertilizer.p2o5}% K₂O:${complexFertilizer.k2o}% CaO:${complexFertilizer.cao}% MgO:${complexFertilizer.mg}%\n`;
            report += `  - Норма внесення: ${rate} кг/га (Всього: ${totalComplex} кг)\n\n`;
            
            const supplied = {
                'P2O5': rate * (parseFloat(complexFertilizer.p2o5 || '0') / 100),
                'K2O': rate * (parseFloat(complexFertilizer.k2o || '0') / 100),
                'CaO': rate * (parseFloat(complexFertilizer.cao || '0') / 100),
                'MgO': rate * (parseFloat(complexFertilizer.mg || '0') / 100),
            };
            finalBasicNeeds = finalBasicNeeds.map(need => {
                const suppliedAmount = supplied[need.element as keyof typeof supplied] || 0;
                return { ...need, norm: Math.round(Math.max(0, need.norm - suppliedAmount)) };
            });
        }
        
        const ph = parseFloat(formData.ph);
        const needsAmendment = ph <= 6.8;
        let amendmentRateKg = 0;

        if (needsAmendment && selectedAmendment) {
             const amendmentEffects = AMENDMENT_EFFECTS[selectedAmendment as keyof typeof AMENDMENT_EFFECTS];
             const amendmentRateTons = Math.round((7 - ph) * 5);
             amendmentRateKg = amendmentRateTons * 1000;
             const caFromAmendment = amendmentEffects.calcium * amendmentRateTons;
             const mgFromAmendment = amendmentEffects.magnesium * amendmentRateTons;

             finalBasicNeeds = finalBasicNeeds.map(need => {
                 if (need.element === 'CaO') return { ...need, norm: Math.round(Math.max(0, need.norm - caFromAmendment)) };
                 if (need.element === 'MgO') return { ...need, norm: Math.round(Math.max(0, need.norm - mgFromAmendment)) };
                 return need;
             });
        }

        report += `Потреба в елементах (після врахування комплексних добрив та меліоранта):\n`;
        finalBasicNeeds.forEach(need => {
            if (need.element !== 'Меліорант' && need.norm > 0) {
                const selection = basicFertilizers[need.element];
                let fertInfo = '';
                if(selection && selection.selectedFertilizer) {
                    const percentage = parseFloat(selection.selectedFertilizer);
                    const fertName = SIMPLE_FERTILIZERS[need.element as keyof typeof SIMPLE_FERTILIZERS]?.find(f => f.value.toString() === selection.selectedFertilizer)?.label || '';
                    if (percentage > 0) {
                        const physRate = (need.norm / percentage) * 100;
                        const totalPhys = (physRate * fieldArea).toFixed(1);
                        fertInfo = ` -> ${fertName} (${percentage}%): ${physRate.toFixed(1)} кг/га (Всього: ${totalPhys} кг)`;
                    }
                }
                report += `  - ${pad(need.element, 6)}: ${need.norm} кг д.р./га ${fertInfo}\n`;
            }
        });
        report += '\n';

        if (needsAmendment && selectedAmendment && amendmentRateKg > 0) {
             const amendLabel = AMENDMENTS.find(a => a.value === selectedAmendment)?.label || selectedAmendment;
             const totalAmend = (amendmentRateKg * fieldArea).toFixed(0);
             report += `Внесення меліоранта:\n`;
             report += `  - ${amendLabel}: ${amendmentRateKg} кг/га (Всього: ${totalAmend} кг)\n\n`;
        }
    }

    if (calculationType === 'fertigation' || calculationType === 'full') {
        report += `---------- 2. ПРОГРАМА ФЕРТИГАЦІЇ ----------\n\n`;
        
        const findCultureKey = (cultureName: string) => {
            return Object.keys(FERTIGATION_CULTURES).find(key => 
                FERTIGATION_CULTURES[key as keyof typeof FERTIGATION_CULTURES].startsWith(cultureName)
            );
        };
        const cultureKey = findCultureKey(results.culture);
        
        if (cultureKey) {
            const { weeklyPlan, totals, fertilizerRate } = calculateFertigationPlan({
                initialNeeds: results.fertigation, cultureKey, cultureParams, springFertilizer, nitrogenFertilizer,
            });

            if (springFertilizer.enabled && fertilizerRate && parseFloat(springFertilizer.k) > 0) {
                 const totalSpring = (fertilizerRate * fieldArea).toFixed(1);
                 report += `Весняне (стартове) добриво:\n`;
                 report += `  - Склад: N:${springFertilizer.n}% P:${springFertilizer.p}% K:${springFertilizer.k}% Ca:${springFertilizer.ca}% Mg:${springFertilizer.mg}%\n`;
                 report += `  - Розрахункова норма: ${fertilizerRate.toFixed(1)} кг/га (Всього: ${totalSpring} кг)\n\n`;
            }
            
            const nitrogenFertilizerName = nitrogenFertilizer === 'ammonium-nitrate' ? 'Аміачна селітра' : 'Карбамід';
            const headers = ['Тиждень', nitrogenFertilizerName, 'Ортофосф. к-та', 'Сульфат калію', 'Нітрат кальцію', 'Сульфат магнію'];
            const pads = [8, 18, 18, 16, 16, 16];

            report += `Потижневий план внесення добрив (фізична вага, кг/га):\n`;
            report += `(В дужках вказана загальна кількість на площу ${fieldArea} га)\n\n`;
            
            let headerLine = "|";
            let separatorLine = "|";
            headers.forEach((h, i) => {
                headerLine += ` ${pad(h, pads[i])}|`;
                separatorLine += `${'-'.repeat(pads[i] + 2)}|`;
            });
            report += `${separatorLine}\n${headerLine}\n${separatorLine}\n`;

            weeklyPlan.forEach(item => {
                if(item) {
                    const rowData = [
                        item.week,
                        `${item.nitrogen.toFixed(1)} (${(item.nitrogen * fieldArea).toFixed(1)})`,
                        `${item.phosphorus.toFixed(1)} (${(item.phosphorus * fieldArea).toFixed(1)})`,
                        `${item.potassium.toFixed(1)} (${(item.potassium * fieldArea).toFixed(1)})`,
                        `${item.calcium.toFixed(1)} (${(item.calcium * fieldArea).toFixed(1)})`,
                        `${item.magnesium.toFixed(1)} (${(item.magnesium * fieldArea).toFixed(1)})`,
                    ];
                    let rowLine = "|";
                    rowData.forEach((d, i) => {
                        rowLine += ` ${pad(d, pads[i])}|`;
                    });
                    report += `${rowLine}\n`;
                }
            });
            
            const totalRowData = [
                'РАЗОМ:',
                 `${totals.nitrogen.toFixed(1)} (${(totals.nitrogen * fieldArea).toFixed(1)})`,
                 `${totals.phosphorus.toFixed(1)} (${(totals.phosphorus * fieldArea).toFixed(1)})`,
                 `${totals.potassium.toFixed(1)} (${(totals.potassium * fieldArea).toFixed(1)})`,
                 `${totals.calcium.toFixed(1)} (${(totals.calcium * fieldArea).toFixed(1)})`,
                 `${totals.magnesium.toFixed(1)} (${(totals.magnesium * fieldArea).toFixed(1)})`,
            ];
            let totalLine = "|";
            totalRowData.forEach((d, i) => {
                totalLine += ` ${pad(d, pads[i])}|`;
            });

            report += `${separatorLine}\n${totalLine}\n${separatorLine}\n\n`;
        }
    }
    
    report += `\n==================================================\n`;
    report += `   Розрахунок носить рекомендаційний характер.\n`;
    report += `==================================================\n`;

    return report;
};