import React from 'react';
import type { CalculationResults, FormData, CultureParams, BasicFertilizerSelections, ComplexFertilizer, SpringFertilizer } from '../types';
import { BasicApplicationCalculator } from './BasicApplicationCalculator';
import { FertigationProgram } from './FertigationProgram';
import { generateTxtReport } from '../utils/reportGenerator';

interface Step4Props {
    onReset: () => void;
    results: CalculationResults;
    type: 'basic' | 'fertigation' | 'full';
    formData: FormData;
    cultureParams: CultureParams;
    onSave: () => void;
    springFertilizer: SpringFertilizer;
    setSpringFertilizer: React.Dispatch<React.SetStateAction<SpringFertilizer>>;
    nitrogenFertilizer: string;
    setNitrogenFertilizer: React.Dispatch<React.SetStateAction<string>>;
    basicFertilizers: BasicFertilizerSelections;
    setBasicFertilizers: React.Dispatch<React.SetStateAction<BasicFertilizerSelections>>;
    selectedAmendment: string;
    setSelectedAmendment: React.Dispatch<React.SetStateAction<string>>;
    complexFertilizer: ComplexFertilizer;
    setComplexFertilizer: React.Dispatch<React.SetStateAction<ComplexFertilizer>>;
}

export const Step4Results: React.FC<Step4Props> = ({ 
    onReset, 
    results, 
    type, 
    formData, 
    cultureParams,
    onSave,
    springFertilizer,
    setSpringFertilizer,
    nitrogenFertilizer,
    setNitrogenFertilizer,
    basicFertilizers,
    setBasicFertilizers,
    selectedAmendment,
    setSelectedAmendment,
    complexFertilizer,
    setComplexFertilizer
}) => {
    
    const showBasic = type === 'basic' || type === 'full';
    const showFertigation = type === 'fertigation' || type === 'full';

    const handleSaveTxt = () => {
        const reportContent = generateTxtReport({
            formData,
            results,
            calculationType: type,
            cultureParams,
            springFertilizer,
            nitrogenFertilizer,
            complexFertilizer
        });

        const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `розрахунок_${formData.culture}.txt`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-10">
            <h2 className="text-3xl font-bold text-center text-slate-800 mb-6">Результати розрахунку для культури "{results.culture}"</h2>
            
            <div className="space-y-10">
                {showBasic && (
                    <div className="bg-white p-6 rounded-lg shadow-md border border-slate-100">
                       <BasicApplicationCalculator 
                           needs={results.basic} 
                           soilData={formData}
                           selections={basicFertilizers}
                           onSelectionsChange={setBasicFertilizers}
                           amendment={selectedAmendment}
                           onAmendmentChange={setSelectedAmendment}
                           complexFertilizer={complexFertilizer}
                           onComplexFertilizerChange={setComplexFertilizer}
                        />
                    </div>
                )}
                {showFertigation && (
                    <div className="bg-white p-6 rounded-lg shadow-md border border-slate-100">
                        <FertigationProgram 
                            initialNeeds={results.fertigation} 
                            culture={results.culture}
                            cultureParams={cultureParams}
                            springFertilizer={springFertilizer}
                            setSpringFertilizer={setSpringFertilizer}
                            nitrogenFertilizer={nitrogenFertilizer}
                            setNitrogenFertilizer={setNitrogenFertilizer}
                        />
                    </div>
                )}
            </div>

            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-8 border-t mt-10">
                <button
                    onClick={onReset}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-200 text-slate-700 font-semibold py-3 px-6 rounded-lg hover:bg-slate-300 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.667 0l3.181-3.183m-4.991-2.695V7.5a8.25 8.25 0 00-16.5 0v2.694" />
                    </svg>
                    <span>Новий розрахунок</span>
                </button>
                <button
                    onClick={handleSaveTxt}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white text-indigo-700 border-2 border-indigo-200 font-semibold py-3 px-6 rounded-lg hover:bg-indigo-50 hover:border-indigo-300 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <span>Зберегти в TXT</span>
                </button>
                <button
                    onClick={onSave}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors duration-300 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                       <path strokeLinecap="round" strokeLinejoin="round" d="M5 4h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5a1 1 0 011-1z" />
                       <path strokeLinecap="round" strokeLinejoin="round" d="M15 8H9" />
                       <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3" />
                    </svg>
                    <span>Зберегти звіт</span>
                </button>
            </div>
        </div>
    );
};