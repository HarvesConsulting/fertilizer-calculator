import React, { useState } from 'react';
import type { SavedReport } from '../types';
import { BasicApplicationCalculator } from './BasicApplicationCalculator';
import { FertigationProgram } from './FertigationProgram';
import { CULTURE_PARAMS } from '../constants';

interface ReportDetailProps {
    report: SavedReport;
    onBack: () => void;
}

const InfoBlock: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div>
        <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">{title}</h4>
        <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg space-y-2 text-gray-800 dark:text-gray-200">
            {children}
        </div>
    </div>
);

export const ReportDetail: React.FC<ReportDetailProps> = ({ report, onBack }) => {
    const { formData, results, calculationType, springFertilizer, nitrogenFertilizer } = report;
    const cultureParams = CULTURE_PARAMS[formData.culture];

    const showBasic = calculationType === 'basic' || calculationType === 'full';
    const showFertigation = calculationType === 'fertigation' || calculationType === 'full';
    
    // Create dummy state setters as FertigationProgram expects them, but they won't be used in readOnly mode
    const [springFert, setSpringFert] = useState(springFertilizer);
    const [nitroFert, setNitroFert] = useState(nitrogenFertilizer);

    return (
        <div className="bg-white dark:bg-gray-800 p-4 md:p-8 rounded-xl shadow-lg space-y-10">
            <div>
                <button
                    onClick={onBack}
                    className="mb-6 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition flex items-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    До списку звітів
                </button>
                <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-gray-100">
                    Звіт для "{results.culture}"
                </h2>
                <p className="text-center text-gray-500 dark:text-gray-400 text-sm mt-1">
                    Збережено: {new Date(report.timestamp).toLocaleString('uk-UA')}
                </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <InfoBlock title="Вхідні дані">
                    <p><strong>Культура:</strong> {formData.culture}</p>
                    <p><strong>Планована врожайність:</strong> {formData.plannedYield} т/га</p>
                </InfoBlock>
                <InfoBlock title="Аналіз ґрунту">
                     <p><strong>N:</strong> {formData.nitrogenAnalysis} мг/кг, <strong>P₂O₅:</strong> {formData.phosphorus} мг/кг, <strong>K₂O:</strong> {formData.potassium} мг/кг, <strong>CaO:</strong> {formData.calcium} мг/кг, <strong>MgO:</strong> {formData.magnesium} мг/кг</p>
                     <p><strong>pH:</strong> {formData.ph}, <strong>ЄКО:</strong> {formData.cec} мг-екв/100г</p>
                </InfoBlock>
            </div>


            <div className="space-y-10">
                {showBasic && (
                    <div className="p-6 rounded-lg border dark:border-gray-700">
                       <BasicApplicationCalculator needs={results.basic} soilData={formData} />
                    </div>
                )}
                {showFertigation && (
                    <div className="p-6 rounded-lg border dark:border-gray-700">
                        <FertigationProgram 
                            initialNeeds={results.fertigation} 
                            culture={results.culture}
                            cultureParams={cultureParams}
                            springFertilizer={springFert}
                            setSpringFertilizer={setSpringFert}
                            nitrogenFertilizer={nitroFert}
                            setNitrogenFertilizer={setNitroFert}
                            readOnly={true}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};
