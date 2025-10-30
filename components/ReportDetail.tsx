import React, { useState } from 'react';
import type { SavedReport, ComplexFertilizer } from '../types';
import { BasicApplicationCalculator } from './BasicApplicationCalculator';
import { FertigationProgram } from './FertigationProgram';
import { CULTURE_PARAMS } from '../constants';

interface ReportDetailProps {
    report: SavedReport;
    onBack: () => void;
}

const InfoBlock: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div>
        <h4 className="text-lg font-semibold text-gray-700 mb-2">{title}</h4>
        <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-gray-800">
            {children}
        </div>
    </div>
);

const defaultComplexFertilizer: ComplexFertilizer = {
    n: '', p2o5: '', k2o: '', cao: '', mg: '', rate: '', enabled: false
};

export const ReportDetail: React.FC<ReportDetailProps> = ({ report, onBack }) => {
    const { formData, results, calculationType, springFertilizer, nitrogenFertilizer, complexFertilizer } = report;
    const cultureParams = CULTURE_PARAMS[formData.culture];

    const showBasic = calculationType === 'basic' || calculationType === 'full';
    const showFertigation = calculationType === 'fertigation' || calculationType === 'full';
    
    const [springFert, setSpringFert] = useState(springFertilizer);
    const [nitroFert, setNitroFert] = useState(nitrogenFertilizer);

    return (
        <div className="bg-white p-4 md:p-8 rounded-xl shadow-lg space-y-10">
            <div>
                <button
                    onClick={onBack}
                    className="mb-6 bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 transition flex items-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    До списку звітів
                </button>
                <h2 className="text-3xl font-bold text-center text-gray-800">
                    Звіт для "{results.culture}"
                </h2>
                <p className="text-center text-gray-500 text-sm mt-1">
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
                    <div className="p-6 rounded-lg border">
                       <BasicApplicationCalculator 
                           needs={results.basic} 
                           soilData={formData}
                           selections={report.basicFertilizers || {}}
                           onSelectionsChange={() => {}}
                           amendment={report.selectedAmendment || ''}
                           onAmendmentChange={() => {}}
                           complexFertilizer={complexFertilizer || defaultComplexFertilizer}
                           onComplexFertilizerChange={() => {}}
                           readOnly={true}
                       />
                    </div>
                )}
                {showFertigation && (
                    <div className="p-6 rounded-lg border">
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