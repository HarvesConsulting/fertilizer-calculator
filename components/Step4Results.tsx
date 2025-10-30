import React from 'react';
import type { CalculationResults, FormData, CultureParams, BasicFertilizerSelections, ComplexFertilizer } from '../types';
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
    springFertilizer: { n: string; p: string; k: string; ca: string; mg: string; };
    setSpringFertilizer: React.Dispatch<React.SetStateAction<{ n: string; p: string; k: string; ca: string; mg: string; }>>;
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
    
    const fertigationNeedsSummary = results.fertigation.filter(need => need.norm > 0);

    return (
        <div className="space-y-10">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Результати розрахунку для культури "{results.culture}"</h2>
            
            <div className="space-y-10">
                {showBasic && (
                    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
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
                    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                        {fertigationNeedsSummary.length > 0 && (
                            <div className="mb-10 hidden md:block">
                                <h3 className="text-xl font-semibold mb-4 text-gray-700 border-b pb-2">Початкова потреба для фертигації (д.р./га)</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                                    {fertigationNeedsSummary.map(need => (
                                        <div key={need.element} className="bg-gray-50 p-4 rounded-lg text-center shadow-sm">
                                            <p className="text-base font-bold text-gray-800">{need.element}</p>
                                            <p className="text-2xl font-semibold text-blue-600">{need.norm}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
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

            <div className="flex flex-col md:flex-row justify-center items-center gap-4 pt-6">
                <button
                    onClick={onReset}
                    className="w-full md:w-auto bg-gray-300 text-gray-800 font-bold py-3 px-10 rounded-lg hover:bg-gray-400 transition duration-300"
                >
                    Новий розрахунок
                </button>
                 <button
                    onClick={handleSaveTxt}
                    className="w-full md:w-auto bg-gray-700 text-white font-bold py-3 px-10 rounded-lg hover:bg-gray-800 transition duration-300 shadow-lg"
                >
                    Зберегти в TXT
                </button>
                 <button
                    onClick={onSave}
                    className="w-full md:w-auto bg-blue-600 text-white font-bold py-3 px-10 rounded-lg hover:bg-blue-700 transition duration-300 shadow-lg text-lg"
                >
                    Зберегти звіт
                </button>
            </div>
        </div>
    );
};