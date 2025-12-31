
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

const getWeekDateRangeText = (sowingDateStr: string, week: number): string => {
    const sowingDate = sowingDateStr ? new Date(sowingDateStr) : new Date();
    const startDate = new Date(sowingDate);
    startDate.setDate(startDate.getDate() + (week - 1) * 7);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);
    return `${startDate.toLocaleDateString('default', { day: '2-digit', month: '2-digit' })}-${endDate.toLocaleDateString('default', { day: '2-digit', month: '2-digit' })}`;
}

const getIdentifiedComplexName = (n: string, p: string, k: string, ca: string, mg: string, lang: Language): string | null => {
    const clear = (val: string) => Math.round(parseFloat(val || '0')).toString();
    const [cN, cP, cK] = [clear(n), clear(p), clear(k)];
    if (cN === '16' && cP === '16' && cK === '16') return t('nitroammophoskaButton', lang);
    if (cN === '2' && cP === '2' && cK === '1') return t('chickenManureButton', lang);
    if (cN === '11' && cP === '11' && cK === '21') return t('yaraMilaButton', lang);
    if (cN === '12' && cP === '12' && cK === '17') return t('rosafertButton', lang);
    return null;
};

const getNormalizedFertName = (n: string, p: string, k: string, ca: string, mg: string, defaultType: string, lang: Language): string => {
    const numN = Math.round(parseFloat(n || '0'));
    const numP = Math.round(parseFloat(p || '0'));
    const numK = Math.round(parseFloat(k || '0'));
    const idName = getIdentifiedComplexName(n, p, k, ca, mg, lang);
    const comp = `N${numN}-P${numP}-K${numK}`;
    return idName ? `${idName} (${comp})` : `${defaultType} ${comp}`;
};

const addCorporateHeader = (aoa: any[][], title: string) => {
    aoa.push(["HarvestConsulting"]);
    aoa.push(["Лашин Олександр Володимирович"]);
    aoa.push(["м. Нова Каховка | lashyn.aleksandr@gmail.com"]);
    aoa.push([]); 
    aoa.push([title.toUpperCase()]);
    aoa.push([]); 
};

const getMergesForHeader = (startRow: number) => [
    { s: { r: startRow, c: 0 }, e: { r: startRow, c: 6 } },
    { s: { r: startRow + 1, c: 0 }, e: { r: startRow + 1, c: 6 } },
    { s: { r: startRow + 2, c: 0 }, e: { r: startRow + 2, c: 6 } },
    { s: { r: startRow + 4, c: 0 }, e: { r: startRow + 4, c: 6 } }
];

export const generateTxtReport = (data: ReportData): string => {
    const { formData, results, calculationType, cultureParams, springFertilizer, nitrogenFertilizer, complexFertilizer, basicFertilizers, selectedAmendment, springFertilizerRate, lang } = data;
    const area = parseFloat(formData.fieldArea || '1') || 1;
    const cultureName = CULTURES.find(c => c.key === formData.culture)?.name[lang] || formData.culture;
    let report = `==================================================\n   HarvestConsulting\n==================================================\n\n   ${t('resultsTitle', lang, { cultureName })}\n\n`;
    if (calculationType !== 'fertigation') {
        report += `---------- ${t('basicApplicationSection', lang)} ----------\n`;
        if (complexFertilizer?.enabled && parseFloat(complexFertilizer.rate) > 0) {
            report += `${getNormalizedFertName(complexFertilizer.n, complexFertilizer.p2o5, complexFertilizer.k2o, complexFertilizer.cao, complexFertilizer.mg, t('complexFertilizer', lang), lang)}: ${complexFertilizer.rate} kg/ha\n`;
        }
    }
    return report;
};

const addValueToProcurement = (procurement: Record<string, number>, key: string, value: number) => {
    if (!key || isNaN(value) || value <= 0) return;
    const normKey = key.trim();
    procurement[normKey] = (procurement[normKey] || 0) + value;
};

const generateSummarySheet = (reports: ReportData[], lang: Language) => {
    const preSeasonTotals: Record<string, number> = {};
    const monthlyTotals: Record<string, Record<string, number>> = {};
    reports.forEach(report => {
        const { formData, results, cultureParams, springFertilizer, nitrogenFertilizer, complexFertilizer, basicFertilizers, selectedAmendment, springFertilizerRate } = report;
        const area = parseFloat(formData.fieldArea) || 1;
        if (complexFertilizer?.enabled && parseFloat(complexFertilizer.rate) > 0) {
            addValueToProcurement(preSeasonTotals, getNormalizedFertName(complexFertilizer.n, complexFertilizer.p2o5, complexFertilizer.k2o, complexFertilizer.cao, complexFertilizer.mg, t('complexFertilizer', lang), lang), parseFloat(complexFertilizer.rate) * area);
        }
        if (springFertilizer?.enabled && springFertilizerRate && springFertilizerRate > 0) {
            addValueToProcurement(preSeasonTotals, getNormalizedFertName(springFertilizer.n, springFertilizer.p, springFertilizer.k, springFertilizer.ca, springFertilizer.mg, t('springFertilizer', lang), lang), springFertilizerRate * area);
        }
        if (selectedAmendment && parseFloat(formData.ph) <= 6.8) {
            addValueToProcurement(preSeasonTotals, AMENDMENTS.find(a => a.value === selectedAmendment)?.label[lang] || selectedAmendment, Math.round((7 - parseFloat(formData.ph)) * 5) * 1000 * area);
        }
        let basicNeeds = [...results.basic];
        if (complexFertilizer?.enabled && parseFloat(complexFertilizer.rate) > 0) {
            const r = parseFloat(complexFertilizer.rate);
            const sup = { 'P2O5': r * (parseFloat(complexFertilizer.p2o5||'0')/100), 'K2O': r * (parseFloat(complexFertilizer.k2o||'0')/100), 'CaO': r * (parseFloat(complexFertilizer.cao||'0')/100), 'MgO': r * (parseFloat(complexFertilizer.mg||'0')/100) };
            basicNeeds = basicNeeds.map(n => ({ ...n, norm: Math.max(0, n.norm - (sup[n.element as keyof typeof sup] || 0)) }));
        }
        Object.keys(basicFertilizers).forEach(el => {
            const fert = SIMPLE_FERTILIZERS[el]?.find(f => f.value.toString() === basicFertilizers[el]?.selectedFertilizer);
            const n = basicNeeds.find(n => n.element === el)?.norm || 0;
            if (fert && n > 0) addValueToProcurement(preSeasonTotals, fert.label[lang], (n / fert.value) * 100 * area);
        });
        const cKey = Object.keys(FERTIGATION_CULTURES).find(k => FERTIGATION_CULTURES[k].startsWith(results.culture));
        if (cKey) {
            const { weeklyPlan } = calculateFertigationPlan({ initialNeeds: results.fertigation, cultureKey: cKey, cultureParams, springFertilizer, nitrogenFertilizer, manualRate: springFertilizerRate });
            const fNames = [nitrogenFertilizer === 'urea' ? t('urea', lang) : t('ammoniumNitrate', lang), t('phosphoricAcid', lang), t('potassiumSulfate', lang), t('calciumNitrate', lang), t('magnesiumSulfate', lang)];
            const baseDate = formData.sowingDate ? new Date(formData.sowingDate) : new Date();
            weeklyPlan.forEach(w => {
                const m = t(`month_${new Date(baseDate.getTime() + (w.week-1)*7*24*60*60*1000).getMonth()}` as TranslationKey, lang);
                [w.nitrogen, w.phosphorus, w.potassium, w.calcium, w.magnesium].forEach((v, i) => {
                    if (v > 0) {
                        if (!monthlyTotals[fNames[i]]) monthlyTotals[fNames[i]] = {};
                        monthlyTotals[fNames[i]][m] = (monthlyTotals[fNames[i]][m] || 0) + v * area;
                    }
                });
            });
        }
    });

    // Fix variable shadowing: renamed 'n' to 'name' and 't' to 'totalVal' so they don't shadow the translation function 't'.
    const preData = Object.entries(preSeasonTotals).map(([name, totalVal]) => ({ 
        [t('fertilizerNameHeader', lang)]: name, 
        [t('totalNeededKgHeader', lang)]: parseFloat(totalVal.toFixed(1)) 
    }));

    const months = [...new Set(Object.values(monthlyTotals).flatMap(m => Object.keys(m)))].sort((a,b) => {
        const o = Array.from({length:12}, (_,i)=>t(`month_${i}` as TranslationKey, lang));
        return o.indexOf(a) - o.indexOf(b);
    });
    const monData = Object.keys(monthlyTotals).sort().map(f => {
        const row: any = { [t('fertilizerNameHeader', lang)]: f };
        let s = 0;
        months.forEach(m => { const v = monthlyTotals[f][m] || 0; row[m] = v > 0 ? parseFloat(v.toFixed(1)) : ''; s += v; });
        row[t('totalLabel', lang)] = parseFloat(s.toFixed(1));
        return row;
    });
    let aoa: any[][] = [];
    addCorporateHeader(aoa, t('summarySheet', lang));
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    XLSX.utils.sheet_add_aoa(ws, [[t('preSeasonFertilizersHeader', lang)]], { origin: `A${aoa.length + 1}` });
    XLSX.utils.sheet_add_json(ws, preData, { origin: `A${aoa.length + 2}`, skipHeader: false });
    const next = aoa.length + preData.length + 5;
    XLSX.utils.sheet_add_aoa(ws, [[t('monthlyNeedsHeader', lang)]], { origin: `A${next}` });
    XLSX.utils.sheet_add_json(ws, monData, { origin: `A${next + 1}`, skipHeader: false });
    ws['!cols'] = [{ wch: 45 }, ...months.map(() => ({ wch: 15 })), { wch: 20 }];
    ws['!merges'] = getMergesForHeader(0);
    return ws;
};

const generateDetailsSheet = (reports: ReportData[], lang: Language) => {
    let aoa: any[][] = [];
    addCorporateHeader(aoa, t('detailsSheet', lang));
    reports.forEach((report, idx) => {
        const { formData, results, cultureParams, springFertilizer, nitrogenFertilizer, complexFertilizer, basicFertilizers, selectedAmendment, springFertilizerRate } = report;
        const area = parseFloat(formData.fieldArea) || 1;
        if (idx > 0) aoa.push([], ["------------------------------------------------------------------------------------------------"]);
        aoa.push([t('reportFor', lang, { culture: formData.fieldName || results.culture })]);
        aoa.push([`${t('cultureLabel', lang)}: ${results.culture}`, `${t('fieldAreaLabel', lang)}: ${area} ha`, `${t('sowingDateLabel', lang)}: ${formData.sowingDate || '-'}`]);
        if (report.calculationType !== 'fertigation') {
            aoa.push([], [t('basicApplicationSection', lang)], [t('fertilizerTypeHeader', lang), t('fertilizerNameCompositionHeader', lang), `${t('applicationRate', lang)} (kg/ha)`, `${t('totalLabel', lang)} (kg)`]);
            let needs = [...results.basic];
            if (complexFertilizer?.enabled && parseFloat(complexFertilizer.rate) > 0) {
                const n = getNormalizedFertName(complexFertilizer.n, complexFertilizer.p2o5, complexFertilizer.k2o, complexFertilizer.cao, complexFertilizer.mg, t('complexFertilizer', lang), lang);
                const r = parseFloat(complexFertilizer.rate);
                aoa.push([t('complexFertilizer', lang), n, r, r * area]);
                const s = { 'P2O5': r * (parseFloat(complexFertilizer.p2o5||'0')/100), 'K2O': r * (parseFloat(complexFertilizer.k2o||'0')/100), 'CaO': r * (parseFloat(complexFertilizer.cao||'0')/100), 'MgO': r * (parseFloat(complexFertilizer.mg||'0')/100) };
                needs = needs.map(n => ({ ...n, norm: Math.max(0, n.norm - (s[n.element as keyof typeof s] || 0)) }));
            }
            if (selectedAmendment && parseFloat(formData.ph) <= 6.8) {
                const r = Math.round((7 - parseFloat(formData.ph)) * 5) * 1000;
                aoa.push([t('amendmentLabel', lang), AMENDMENTS.find(a => a.value === selectedAmendment)?.label[lang] || selectedAmendment, r, r * area]);
            }
            needs.filter(n => n.element !== 'Меліорант' && n.norm > 0).forEach(n => {
                const f = SIMPLE_FERTILIZERS[n.element]?.find(f => f.value.toString() === basicFertilizers[n.element]?.selectedFertilizer);
                if (f) {
                    const r = (n.norm / f.value) * 100;
                    aoa.push([`${t('fertilizerLabel', lang)} (${n.element})`, f.label[lang], parseFloat(r.toFixed(1)), parseFloat((r * area).toFixed(1))]);
                } else {
                    aoa.push([`${t('fertilizerLabel', lang)} (${n.element})`, `${t('need', lang)}: ${n.norm} kg a.i.`, '-', '-']);
                }
            });
        }
        if (report.calculationType !== 'basic') {
            aoa.push([], [t('fertigationProgramSection', lang)]);
            if (springFertilizer?.enabled && springFertilizerRate && springFertilizerRate > 0) {
                const n = getNormalizedFertName(springFertilizer.n, springFertilizer.p, springFertilizer.k, springFertilizer.ca, springFertilizer.mg, t('springFertilizer', lang), lang);
                aoa.push([t('springFertilizer', lang), n, springFertilizerRate, springFertilizerRate * area]);
            }
            const cK = Object.keys(FERTIGATION_CULTURES).find(k => FERTIGATION_CULTURES[k].startsWith(results.culture));
            if (cK) {
                const { weeklyPlan, totals } = calculateFertigationPlan({ initialNeeds: results.fertigation, cultureKey: cK, cultureParams, springFertilizer, nitrogenFertilizer, manualRate: springFertilizerRate });
                const fNs = [nitrogenFertilizer === 'urea' ? t('urea', lang) : t('ammoniumNitrate', lang), t('phosphoricAcid', lang), t('potassiumSulfate', lang), t('calciumNitrate', lang), t('magnesiumSulfate', lang)];
                aoa.push([t('week', lang), t('dateRangeHeader', lang), ...fNs.map(n => `${n} (kg/ha)`)]);
                weeklyPlan.forEach(w => aoa.push([w.week, getWeekDateRangeText(formData.sowingDate, w.week), parseFloat(w.nitrogen.toFixed(1)), parseFloat(w.phosphorus.toFixed(1)), parseFloat(w.potassium.toFixed(1)), parseFloat(w.calcium.toFixed(1)), parseFloat(w.magnesium.toFixed(1))]));
                aoa.push([t('totalLabel', lang), '', parseFloat(totals.nitrogen.toFixed(1)), parseFloat(totals.phosphorus.toFixed(1)), parseFloat(totals.potassium.toFixed(1)), parseFloat(totals.calcium.toFixed(1)), parseFloat(totals.magnesium.toFixed(1))]);
            }
        }
    });
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    ws['!cols'] = [{ wch: 35 }, { wch: 45 }, { wch: 25 }, { wch: 25 }, { wch: 25 }, { wch: 25 }, { wch: 25 }];
    ws['!merges'] = getMergesForHeader(0);
    return ws;
};

export const generateXlsxReport = (reports: ReportData[], lang: Language) => {
    try {
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, generateSummarySheet(reports, lang), t('summarySheet', lang));
        XLSX.utils.book_append_sheet(wb, generateDetailsSheet(reports, lang), t('detailsSheet', lang));
        XLSX.writeFile(wb, "harvest_consulting_calculations.xlsx");
    } catch (e) { console.error(e); alert("XLSX error"); }
};
