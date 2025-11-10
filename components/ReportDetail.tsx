import React, { useState } from 'react';
import type { SavedReport, ComplexFertilizer } from '../types';
import { BasicApplicationCalculator } from './BasicApplicationCalculator';
import { FertigationProgram } from './FertigationProgram';
import { CULTURE_PARAMS, CULTURES } from '../constants';
import { Language, t } from '../i18n';

interface ReportDetailProps {
    report: SavedReport;
    onBack: () => void;
    lang: Language;
}

const InfoBlock: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div>
        <h4 className="text-lg font-semibold text-slate-700 mb-2">{title}</h4>
        <div className="bg-slate-50 p-4 rounded-lg space-y-2 text-slate-800">
            {children}
        </div>
    </div>
);

const defaultComplexFertilizer: ComplexFertilizer = {
    n: '', p2o5: '', k2o: '', cao: '', mg: '', rate: '', enabled: false
};

export const ReportDetail: React.FC<ReportDetailProps> = ({ report, onBack, lang }) => {
    const { formData, results, calculationType, springFertilizer, nitrogenFertilizer, complexFertilizer } = report;
    const cultureParams = CULTURE_PARAMS[formData.culture];

    const showBasic = calculationType === 'basic' || calculationType === 'full';
    const showFertigation = calculationType === 'fertigation' || calculationType === 'full';
    
    const [springFert, setSpringFert] = useState(springFertilizer);
    const [nitroFert, setNitroFert] = useState(nitrogenFertilizer);
    const [springFertRate, setSpringFertRate] = useState(report.springFertilizerRate ?? null);

    const cultureName = CULTURES.find(c => c.key === results.culture)?.name[lang] || results.culture;

    return (
        <div className="bg-white p-4 md:p-8 rounded-xl shadow-lg space-y-10">
            <div>
                <button
                    onClick={onBack}
                    className="mb-6 bg-slate-200 text-slate-800 font-semibold py-2 px-4 rounded-lg hover:bg-slate-300 transition flex items-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    {t('backToList', lang)}
                </button>
                <h2 className="text-3xl font-bold text-center text-slate-800">
                    {t('reportFor', lang, { culture: cultureName })}
                </h2>
                <p className="text-center text-slate-500 text-sm mt-1">
                    {t('savedAt', lang)}: {new Date(report.timestamp).toLocaleString(lang === 'uk' ? 'uk-UA' : 'en-US')}
                </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <InfoBlock title={t('inputData', lang)}>
                    {formData.fieldName && (<p><strong>{t('fieldNameLabel', lang)}:</strong> {formData.fieldName}</p>)}
                    <p><strong>{t('cultureLabel', lang)}:</strong> {cultureName}</p>
                    <p><strong>{t('plannedYieldLabel', lang)}:</strong> {formData.plannedYield} t/ha</p>
                    <p><strong>{t('fieldAreaLabel', lang)}:</strong> {formData.fieldArea || 1} ha</p>
                </InfoBlock>
                <InfoBlock title={t('soilAnalysis', lang)}>
                     <p><strong>N:</strong> {formData.nitrogenAnalysis} mg/kg, <strong>P₂O₅:</strong> {formData.phosphorus} mg/kg, <strong>K₂O:</strong> {formData.potassium} mg/kg, <strong>CaO:</strong> {formData.calcium} mg/kg, <strong>MgO:</strong> {formData.magnesium} mg/kg</p>
                     <p><strong>{t('phLabel', lang)}:</strong> {formData.ph}, <strong>{t('cecLabel', lang)}:</strong> {formData.cec} mg-eq/100g</p>
                </InfoBlock>
            </div>


            <div className="space-y-10">
                {showBasic && (
                    <div className="p-6 rounded-lg border">
                       <BasicApplicationCalculator 
                           needs={results.basic} 
                           formData={formData}
                           selections={report.basicFertilizers || {}}
                           onSelectionsChange={() => {}}
                           amendment={report.selectedAmendment || ''}
                           onAmendmentChange={() => {}}
                           complexFertilizer={complexFertilizer || defaultComplexFertilizer}
                           onComplexFertilizerChange={() => {}}
                           readOnly={true}
                           lang={lang}
                       />
                    </div>
                )}
                {showFertigation && (
                    <div className="p-6 rounded-lg border">
                        <FertigationProgram 
                            initialNeeds={results.fertigation} 
                            culture={results.culture}
                            cultureParams={cultureParams}
                            fieldArea={formData.fieldArea}
                            springFertilizer={springFert}
                            setSpringFertilizer={setSpringFert}
                            nitrogenFertilizer={nitroFert}
                            setNitrogenFertilizer={setNitroFert}
                            springFertilizerRate={springFertRate}
                            setSpringFertilizerRate={setSpringFertRate}
                            readOnly={true}
                            lang={lang}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};
