import type { FormData, CalculationResults, CultureParams, ComplexFertilizer, SpringFertilizer, BasicFertilizerSelections } from '../types';
import { calculateFertigationPlan } from './fertigationCalculator';
import { AMENDMENTS, FERTIGATION_CULTURES, SIMPLE_FERTILIZERS, AMENDMENT_EFFECTS, CULTURES } from '../constants';
import { Language, t, TranslationKey } from '../i18n';

declare const XLSX: any;

export interface ReportData {
    formData: FormData;
    results: CalculationResults;
    calculationType: 'basic' | 'fertigation' | 'full';
    cultureParams: CultureParams;
    springFertilizer: SpringFertilizer;
    nitrogenFertilizer: string;
    complexFertilizer: ComplexFertilizer;
    basicFertilizers: BasicFertilizerSelections;
    selectedAmendment: string;
    springFertilizerRate: number | null;
    lang: Language;
}

const pad = (str: string | number, length: number) => String(str).padEnd(length, ' ');

const getWeekDateRangeText = (sowingDateStr: string, week: number): string => {
    if (!sowingDateStr) return '';
    try {
        const sowingDate = new Date(sowingDateStr);
        if (isNaN(sowingDate.getTime())) return '';
        
        const startDate = new Date(sowingDate);
        startDate.setDate(startDate.getDate() + (week - 1) * 7);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 6);

        const formatOptions: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit' };
        
        return `${startDate.toLocaleDateString('default', formatOptions)}-${endDate.toLocaleDateString('default', formatOptions)}`;
    } catch(e) {
        return '';
    }
}

const reportStrings = {
  en: {
    reportTitle: "AGROCHEMICAL CALCULATION REPORT",
    inputData: "INPUT DATA",
    fieldName: "Field Name",
    culture: "Crop",
    sowingDate: "Sowing Date",
    plannedYield: "Planned Yield",
    fieldArea: "Field Area",
    soilAnalysis: "Soil Analysis",
    nitrogen: "Nitrate Nitrogen",
    phosphorus: "Phosphorus (P₂O₅)",
    potassium: "Potassium (K₂O)",
    calcium: "Calcium (CaO)",
    magnesium: "Magnesium (MgO)",
    ph: "Acidity (pH)",
    cec: "CEC",
    basicApplication: "1. BASIC APPLICATION",
    complexFertilizer: "Complex Autumn Fertilizer",
    composition: "Composition",
    applicationRate: "Application Rate",
    total: "Total",
    needsAfterComplex: "Nutrient needs (after complex fertilizers and amendments):",
    physRate: "phys. rate",
    amendmentApplication: "Amendment Application",
    fertigationProgram: "2. FERTIGATION PROGRAM",
    springFertilizer: "Spring (Starter) Fertilizer",
    calculatedRate: "Application Rate",
    weeklyPlan: "Weekly Fertilizer Application Plan (physical weight, kg/ha):",
    totalOnArea: `(Total for area of {fieldArea} ha)`,
    week: "Week",
    ammoniumNitrate: "Ammonium Nitrate",
    urea: "Urea",
    phosphoricAcid: "Orthophos. Acid",
    potassiumSulfate: "Potassium Sulf.",
    calciumNitrate: "Calcium Nitrate",
    magnesiumSulfate: "Magnesium Sulf.",
    totalHeader: "TOTAL:",
    disclaimer: "The calculation is for recommendation purposes only.",
  },
  uk: {
    reportTitle: "ЗВІТ АГРОХІМІЧНОГО РОЗРАХУНКУ",
    inputData: "ВХІДНІ ДАНІ",
    fieldName: "Назва поля",
    culture: "Культура",
    sowingDate: "Дата посіву",
    plannedYield: "Планована врожайність",
    fieldArea: "Площа поля",
    soilAnalysis: "Аналіз ґрунту",
    nitrogen: "Нітратний азот",
    phosphorus: "Фосфор (P₂O₅)",
    potassium: "Калій (K₂O)",
    calcium: "Кальцій (CaO)",
    magnesium: "Магній (MgO)",
    ph: "Кислотність (pH)",
    cec: "ЄКО",
    basicApplication: "1. ОСНОВНЕ ВНЕСЕННЯ",
    complexFertilizer: "Комплексне осіннє добриво",
    composition: "Склад",
    applicationRate: "Норма внесення",
    total: "Всього",
    needsAfterComplex: "Потреба в елементах (після врахування комплексних добрив та меліоранта):",
    physRate: "фіз. вага",
    amendmentApplication: "Внесення меліоранта",
    fertigationProgram: "2. ПРОГРАМА ФЕРТИГАЦІЇ",
    springFertilizer: "Весняне (стартове) добриво",
    calculatedRate: "Норма внесення",
    weeklyPlan: "Потижневий план внесення добрив (фізична вага, кг/га):",
    totalOnArea: `(В дужках вказана загальна кількість на площу {fieldArea} га)`,
    week: "Тиждень",
    ammoniumNitrate: "Аміачна селітра",
    urea: "Карбамід",
    phosphoricAcid: "Ортофосф. к-та",
    potassiumSulfate: "Сульфат калію",
    calciumNitrate: "Нітрат кальцію",
    magnesiumSulfate: "Сульфат магнію",
    totalHeader: "РАЗОМ:",
    disclaimer: "Розрахунок носить рекомендаційний характер.",
  },
};


export const generateTxtReport = (data: ReportData): string => {
    const { formData, results, calculationType, cultureParams, springFertilizer, nitrogenFertilizer, complexFertilizer, basicFertilizers, selectedAmendment, springFertilizerRate, lang } = data;
    
    const s = reportStrings[lang];
    const fieldArea = parseFloat(formData.fieldArea || '1') || 1;
    const cultureName = CULTURES.find(c => c.key === formData.culture)?.name[lang] || formData.culture;
    
    let report = `==================================================\n`;
    report += `   ${s.reportTitle}\n`;
    report += `==================================================\n\n`;

    report += `---------- ${s.inputData} ----------\n`;
    if (formData.fieldName) {
        report += `${s.fieldName}: ${formData.fieldName}\n`;
    }
    report += `${s.culture}: ${cultureName}\n`;
    if (formData.sowingDate) {
        report += `${s.sowingDate}: ${new Date(formData.sowingDate).toLocaleDateString(lang === 'uk' ? 'uk-UA' : 'en-CA')}\n`;
    }
    report += `${s.plannedYield}: ${formData.plannedYield} t/ha\n`;
    report += `${s.fieldArea}: ${fieldArea} ha\n\n`;
    
    report += `${s.soilAnalysis}:\n`;
    report += `  - ${s.nitrogen}: ${formData.nitrogenAnalysis} mg/kg\n`;
    report += `  - ${s.phosphorus}: ${formData.phosphorus} mg/kg\n`;
    report += `  - ${s.potassium}: ${formData.potassium} mg/kg\n`;
    report += `  - ${s.calcium}: ${formData.calcium} mg/kg\n`;
    report += `  - ${s.magnesium}: ${formData.magnesium} mg/kg\n`;
    report += `  - ${s.ph}: ${formData.ph}\n`;
    report += `  - ${s.cec}: ${formData.cec} mg-eq/100g\n\n`;
    
    if (calculationType === 'basic' || calculationType === 'full') {
        report += `---------- ${s.basicApplication} ----------\n\n`;
        
        let finalBasicNeeds = [...results.basic];

        if (complexFertilizer && complexFertilizer.enabled && parseFloat(complexFertilizer.rate) > 0) {
            const rate = parseFloat(complexFertilizer.rate);
            const totalComplex = (rate * fieldArea).toFixed(1);
            report += `${s.complexFertilizer}:\n`;
            report += `  - ${s.composition}: N:${complexFertilizer.n}% P₂O₅:${complexFertilizer.p2o5}% K₂O:${complexFertilizer.k2o}% CaO:${complexFertilizer.cao}% MgO:${complexFertilizer.mg}%\n`;
            report += `  - ${s.applicationRate}: ${rate} kg/ha (${s.total}: ${totalComplex} kg)\n\n`;
            
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

        report += `${s.needsAfterComplex}:\n`;
        finalBasicNeeds.forEach(need => {
            if (need.element !== 'Меліорант' && need.norm > 0) {
                const selection = basicFertilizers[need.element];
                let fertInfo = '';
                if(selection && selection.selectedFertilizer) {
                    const percentage = parseFloat(selection.selectedFertilizer);
                    const fertName = SIMPLE_FERTILIZERS[need.element as keyof typeof SIMPLE_FERTILIZERS]?.find(f => f.value.toString() === selection.selectedFertilizer)?.label[lang] || '';
                    if (percentage > 0) {
                        const physRate = (need.norm / percentage) * 100;
                        const totalPhys = (physRate * fieldArea).toFixed(1);
                        fertInfo = ` -> ${fertName} (${percentage}%): ${physRate.toFixed(1)} kg/ha (${s.total}: ${totalPhys} kg)`;
                    }
                }
                report += `  - ${pad(need.element, 6)}: ${need.norm} kg a.i./ha ${fertInfo}\n`;
            }
        });
        report += '\n';

        if (needsAmendment && selectedAmendment && amendmentRateKg > 0) {
             const amendLabel = AMENDMENTS.find(a => a.value === selectedAmendment)?.label[lang] || selectedAmendment;
             const totalAmend = (amendmentRateKg * fieldArea).toFixed(0);
             report += `${s.amendmentApplication}:\n`;
             report += `  - ${amendLabel}: ${amendmentRateKg} kg/ha (${s.total}: ${totalAmend} kg)\n\n`;
        }
    }

    if (calculationType === 'fertigation' || calculationType === 'full') {
        report += `---------- ${s.fertigationProgram} ----------\n\n`;
        
        const findCultureKey = (cultureName: string) => {
            return Object.keys(FERTIGATION_CULTURES).find(key => 
                FERTIGATION_CULTURES[key as keyof typeof FERTIGATION_CULTURES].startsWith(cultureName)
            );
        };
        const cultureKey = findCultureKey(results.culture);
        
        if (cultureKey) {
            const { weeklyPlan, totals } = calculateFertigationPlan({
                initialNeeds: results.fertigation, cultureKey, cultureParams, springFertilizer, nitrogenFertilizer, manualRate: springFertilizerRate
            });

            if (springFertilizer.enabled && springFertilizerRate && springFertilizerRate > 0) {
                 const totalSpring = (springFertilizerRate * fieldArea).toFixed(1);
                 report += `${s.springFertilizer}:\n`;
                 report += `  - ${s.composition}: N:${springFertilizer.n}% P:${springFertilizer.p}% K:${springFertilizer.k}% Ca:${springFertilizer.ca}% Mg:${springFertilizer.mg}%\n`;
                 report += `  - ${s.calculatedRate}: ${springFertilizerRate.toFixed(1)} kg/ha (${s.total}: ${totalSpring} kg)\n\n`;
            }
            
            const nitrogenFertilizerName = nitrogenFertilizer === 'ammonium-nitrate' ? s.ammoniumNitrate : s.urea;
            const headers = [s.week, nitrogenFertilizerName, s.phosphoricAcid, s.potassiumSulfate, s.calciumNitrate, s.magnesiumSulfate];
            const pads = [20, 18, 18, 16, 16, 16];

            report += `${s.weeklyPlan}\n`;
            report += `${s.totalOnArea.replace('{fieldArea}', fieldArea.toString())}\n\n`;
            
            let headerLine = "|";
            let separatorLine = "|";
            headers.forEach((h, i) => {
                headerLine += ` ${pad(h, pads[i])}|`;
                separatorLine += `${'-'.repeat(pads[i] + 2)}|`;
            });
            report += `${separatorLine}\n${headerLine}\n${separatorLine}\n`;

            weeklyPlan.forEach(item => {
                if(item) {
                     const weekLabel = `${item.week} ${getWeekDateRangeText(formData.sowingDate, item.week)}`;
                    const rowData = [
                        weekLabel,
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
                s.totalHeader,
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
    report += `   ${s.disclaimer}\n`;
    report += `==================================================\n`;

    return report;
};

const addValueToProcurement = (procurement: Record<string, number>, key: string, value: number) => {
    if (!key || value <= 0) return;
    procurement[key] = (procurement[key] || 0) + value;
};

// --- New XLSX Generation Logic ---

const generateSummarySheet = (reports: ReportData[], lang: Language) => {
    const preSeasonTotals: Record<string, number> = {};
    const monthlyTotals: Record<string, Record<string, number>> = {};

    reports.forEach(report => {
        const { formData, results, cultureParams, springFertilizer, nitrogenFertilizer, complexFertilizer, basicFertilizers, selectedAmendment, springFertilizerRate } = report;
        const fieldArea = parseFloat(formData.fieldArea) || 1;
        
        // --- Pre-season Fertilizers ---
        if (complexFertilizer && complexFertilizer.enabled && parseFloat(complexFertilizer.rate) > 0) {
             const name = `${t('complexFertilizer', lang)} N${complexFertilizer.n}-P${complexFertilizer.p2o5}-K${complexFertilizer.k2o}`;
             addValueToProcurement(preSeasonTotals, name, parseFloat(complexFertilizer.rate) * fieldArea);
        }
        if (springFertilizer && springFertilizer.enabled && springFertilizerRate && springFertilizerRate > 0) {
            const name = `${t('springFertilizer', lang)} N${springFertilizer.n}-P${springFertilizer.p}-K${springFertilizer.k}`;
            addValueToProcurement(preSeasonTotals, name, springFertilizerRate * fieldArea);
        }
        if(selectedAmendment) {
            const ph = parseFloat(formData.ph);
            if (ph <= 6.8) {
                const amendmentRateKg = Math.round((7 - ph) * 5) * 1000;
                const name = AMENDMENTS.find(a => a.value === selectedAmendment)?.label[lang] || selectedAmendment;
                addValueToProcurement(preSeasonTotals, name, amendmentRateKg * fieldArea);
            }
        }

        let finalBasicNeeds = [...results.basic];
        if (complexFertilizer && complexFertilizer.enabled && parseFloat(complexFertilizer.rate) > 0) {
            const rate = parseFloat(complexFertilizer.rate);
            const supplied = {
                'P2O5': rate * (parseFloat(complexFertilizer.p2o5 || '0') / 100), 'K2O': rate * (parseFloat(complexFertilizer.k2o || '0') / 100),
                'CaO': rate * (parseFloat(complexFertilizer.cao || '0') / 100), 'MgO': rate * (parseFloat(complexFertilizer.mg || '0') / 100),
            };
            finalBasicNeeds = finalBasicNeeds.map(need => ({ ...need, norm: Math.round(Math.max(0, need.norm - (supplied[need.element as keyof typeof supplied] || 0))) }));
        }

        Object.keys(basicFertilizers).forEach(el => {
            const fertValue = basicFertilizers[el]?.selectedFertilizer;
            const fert = SIMPLE_FERTILIZERS[el as keyof typeof SIMPLE_FERTILIZERS]?.find(f => f.value.toString() === fertValue);
            const need = finalBasicNeeds.find(n => n.element === el)?.norm || 0;
            if (fert && need > 0 && fertValue) {
                const rate = (need / fert.value) * 100;
                addValueToProcurement(preSeasonTotals, fert.label[lang], rate * fieldArea);
            }
        });

        // --- Monthly Fertigation Fertilizers ---
        const cultureKey = Object.keys(FERTIGATION_CULTURES).find(key => FERTIGATION_CULTURES[key as keyof typeof FERTIGATION_CULTURES].startsWith(results.culture));
        if (cultureKey && formData.sowingDate) {
             const { weeklyPlan } = calculateFertigationPlan({ initialNeeds: results.fertigation, cultureKey, cultureParams, springFertilizer, nitrogenFertilizer, manualRate: springFertilizerRate });
             
             const fertNames = [
                nitrogenFertilizer === 'urea' ? t('urea', lang) : t('ammoniumNitrate', lang),
                t('phosphoricAcid', lang),
                t('potassiumSulfate', lang),
                t('calciumNitrate', lang),
                t('magnesiumSulfate', lang),
             ];

             weeklyPlan.forEach(week => {
                if(!formData.sowingDate) return;
                const sowDate = new Date(formData.sowingDate);
                if (isNaN(sowDate.getTime())) return;

                const weekStartDate = new Date(sowDate);
                weekStartDate.setDate(sowDate.getDate() + (week.week - 1) * 7);
                const monthIndex = weekStartDate.getMonth();
                const monthName = t(`month_${monthIndex}` as TranslationKey, lang);

                const weeklyTotals = [week.nitrogen, week.phosphorus, week.potassium, week.calcium, week.magnesium];
                
                fertNames.forEach((name, i) => {
                    if (weeklyTotals[i] > 0) {
                        if (!monthlyTotals[name]) monthlyTotals[name] = {};
                        monthlyTotals[name][monthName] = (monthlyTotals[name][monthName] || 0) + (weeklyTotals[i] * fieldArea);
                    }
                });
             });
        }
    });
    
    const preSeasonSheetData = Object.entries(preSeasonTotals).map(([name, total]) => ({
        [t('fertilizerNameHeader', lang)]: name,
        [t('totalNeededKgHeader', lang)]: parseFloat(total.toFixed(1))
    }));

    const allMonths = [...new Set(Object.values(monthlyTotals).flatMap(months => Object.keys(months)))].sort((a, b) => {
         const monthOrder = Array.from({length: 12}, (_, i) => t(`month_${i}` as TranslationKey, lang));
         return monthOrder.indexOf(a) - monthOrder.indexOf(b);
    });

    const monthlySheetData = Object.keys(monthlyTotals).sort().map(fertName => {
        const row: Record<string, any> = { [t('fertilizerNameHeader', lang)]: fertName };
        let total = 0;
        allMonths.forEach(month => {
            const val = monthlyTotals[fertName][month] || 0;
            row[month] = parseFloat(val.toFixed(1)) || '';
            total += val;
        });
        row[t('totalLabel', lang)] = parseFloat(total.toFixed(1));
        return row;
    });

    const wsSummary = XLSX.utils.aoa_to_sheet([]);
    XLSX.utils.sheet_add_aoa(wsSummary, [[t('preSeasonFertilizersHeader', lang)]], { origin: "A1" });
    XLSX.utils.sheet_add_json(wsSummary, preSeasonSheetData, { origin: "A2", skipHeader: false });
    
    const nextRow = preSeasonSheetData.length + 5;
    XLSX.utils.sheet_add_aoa(wsSummary, [[t('monthlyNeedsHeader', lang)]], { origin: `A${nextRow}` });
    XLSX.utils.sheet_add_json(wsSummary, monthlySheetData, { origin: `A${nextRow + 1}`, skipHeader: false });
    
    const summaryColsWidths = [
        { wch: 40 }, // Fertilizer Name
        ...allMonths.map(() => ({ wch: 15 })),
        { wch: 18 } // Total
    ];
    wsSummary['!cols'] = summaryColsWidths;

    return wsSummary;
};

const generateDetailsSheet = (reports: ReportData[], lang: Language) => {
    let aoa: any[][] = [];

    reports.forEach((report, index) => {
        const { formData, results, cultureParams, springFertilizer, nitrogenFertilizer, complexFertilizer, basicFertilizers, selectedAmendment, springFertilizerRate } = report;
        const cultureName = CULTURES.find(c => c.key === formData.culture)?.name[lang] || formData.culture;
        const fieldArea = parseFloat(formData.fieldArea) || 1;

        if (index > 0) {
            aoa.push([]); 
        }

        aoa.push([t('reportFor', lang, { culture: formData.fieldName || cultureName })]);
        aoa.push([
            `${t('cultureLabel', lang)}: ${cultureName}`,
            `${t('fieldAreaLabel', lang)}: ${formData.fieldArea} ha`,
            `${t('sowingDateLabel', lang)}: ${formData.sowingDate ? new Date(formData.sowingDate).toLocaleDateString(lang === 'uk' ? 'uk-UA' : 'en-CA') : '-'}`
        ]);
        aoa.push([]);

        // --- Basic Application ---
        if (report.calculationType === 'basic' || report.calculationType === 'full') {
            aoa.push([t('basicApplicationSection', lang)]);
            aoa.push([t('fertilizerTypeHeader', lang), t('fertilizerNameCompositionHeader', lang), `${t('applicationRate', lang)} (kg/ha)`]);
            
            let finalBasicNeeds = [...results.basic];

            if (complexFertilizer && complexFertilizer.enabled && parseFloat(complexFertilizer.rate) > 0) {
                const comp = complexFertilizer;
                const compName = `N:${comp.n} P:${comp.p2o5} K:${comp.k2o} Ca:${comp.cao} Mg:${comp.mg}`;
                aoa.push([t('complexFertilizer', lang), compName, parseFloat(comp.rate)]);

                const rate = parseFloat(comp.rate);
                const supplied = {
                    'P2O5': rate * (parseFloat(comp.p2o5 || '0') / 100), 'K2O': rate * (parseFloat(comp.k2o || '0') / 100),
                    'CaO': rate * (parseFloat(comp.cao || '0') / 100), 'MgO': rate * (parseFloat(comp.mg || '0') / 100),
                };
                finalBasicNeeds = finalBasicNeeds.map(need => ({ ...need, norm: Math.round(Math.max(0, need.norm - (supplied[need.element as keyof typeof supplied] || 0))) }));
            }

            const ph = parseFloat(formData.ph);
            if (ph <= 6.8 && selectedAmendment) {
                const amendmentRateKg = Math.round((7 - ph) * 5) * 1000;
                const name = AMENDMENTS.find(a => a.value === selectedAmendment)?.label[lang] || selectedAmendment;
                aoa.push([t('amendmentLabel', lang), name, amendmentRateKg]);
            }
            
            finalBasicNeeds.filter(n => n.norm > 0).forEach(need => {
                const selection = basicFertilizers[need.element];
                if (selection?.selectedFertilizer) {
                    const fert = SIMPLE_FERTILIZERS[need.element as keyof typeof SIMPLE_FERTILIZERS]?.find(f => f.value.toString() === selection.selectedFertilizer);
                    if (fert) {
                        const physRate = (need.norm / fert.value) * 100;
                        aoa.push([`${t('fertilizerLabel', lang)} (${need.element})`, fert.label[lang], physRate.toFixed(1)]);
                    }
                }
            });
            aoa.push([]);
        }

        // --- Fertigation Program ---
        if (report.calculationType === 'fertigation' || report.calculationType === 'full') {
            aoa.push([t('fertigationProgramSection', lang)]);
            
            if (springFertilizer.enabled && springFertilizerRate && springFertilizerRate > 0) {
                const sf = springFertilizer;
                const sfName = `N:${sf.n} P:${sf.p} K:${sf.k} Ca:${sf.ca} Mg:${sf.mg}`;
                aoa.push([t('springFertilizer', lang), sfName, springFertilizerRate]);
            }
            
            const cultureKey = Object.keys(FERTIGATION_CULTURES).find(key => FERTIGATION_CULTURES[key as keyof typeof FERTIGATION_CULTURES].startsWith(results.culture));
            if (cultureKey) {
                const { weeklyPlan, totals } = calculateFertigationPlan({ initialNeeds: results.fertigation, cultureKey, cultureParams, springFertilizer, nitrogenFertilizer, manualRate: springFertilizerRate });
                
                const fertNames = [
                    nitrogenFertilizer === 'urea' ? t('urea', lang) : t('ammoniumNitrate', lang),
                    t('phosphoricAcid', lang), t('potassiumSulfate', lang),
                    t('calciumNitrate', lang), t('magnesiumSulfate', lang),
                ];
                aoa.push([t('week', lang), t('dateRangeHeader', lang), ...fertNames]);

                weeklyPlan.forEach(week => {
                    aoa.push([
                        week.week,
                        getWeekDateRangeText(formData.sowingDate, week.week),
                        week.nitrogen > 0 ? week.nitrogen.toFixed(1) : '',
                        week.phosphorus > 0 ? week.phosphorus.toFixed(1) : '',
                        week.potassium > 0 ? week.potassium.toFixed(1) : '',
                        week.calcium > 0 ? week.calcium.toFixed(1) : '',
                        week.magnesium > 0 ? week.magnesium.toFixed(1) : '',
                    ]);
                });
                
                aoa.push([
                    t('totalLabel', lang), '', 
                    totals.nitrogen.toFixed(1), totals.phosphorus.toFixed(1),
                    totals.potassium.toFixed(1), totals.calcium.toFixed(1),
                    totals.magnesium.toFixed(1)
                ]);
            }
        }
    });

    const wsDetails = XLSX.utils.aoa_to_sheet(aoa);
    wsDetails['!cols'] = [
        { wch: 30 }, { wch: 40 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 }
    ];
    return wsDetails;
};

export const generateXlsxReport = (reports: ReportData[], lang: Language) => {
    try {
        const wb = XLSX.utils.book_new();

        // Sheet 1: Summary & Procurement
        const wsSummary = generateSummarySheet(reports, lang);
        XLSX.utils.book_append_sheet(wb, wsSummary, t('summarySheet', lang));

        // Sheet 2: Calculation Details
        const wsDetails = generateDetailsSheet(reports, lang);
        XLSX.utils.book_append_sheet(wb, wsDetails, t('detailsSheet', lang));

        XLSX.writeFile(wb, "fertilizer_calculations.xlsx");
    } catch (error) {
        console.error("Failed to generate XLSX report", error);
        alert("An error occurred while generating the XLSX file.");
    }
};