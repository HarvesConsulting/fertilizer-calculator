import React, { useState } from 'react';
import type { CalculationResults, FormData } from './types';
import { Stepper } from './components/Stepper';
import { Step1SoilAnalysis } from './components/Step1SoilAnalysis';
import { Step2CropYield } from './components/Step2CropYield';
import { Step3CalculationChoice } from './components/Step3CalculationChoice';
import { Step4Results } from './components/Step4Results';
import { CULTURE_PARAMS } from './constants';
import type { NutrientNeeds, CultureParams } from './types';

const INITIAL_FORM_DATA: FormData = {
    culture: 'Томат',
    plannedYield: '100',
    nitrogenAnalysis: '5',
    ph: '7.0',
    phosphorus: '50',
    potassium: '200',
    calcium: '2000',
    magnesium: '100',
    cec: '15',
    amendment: '',
};

function App() {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
    const [results, setResults] = useState<CalculationResults | null>(null);
    const [calculationType, setCalculationType] = useState<'basic' | 'fertigation' | 'full' | null>(null);

    const steps = ['Аналіз ґрунту', 'Культура', 'Вибір', 'Результат'];

    const handleNext = (data: Partial<FormData>) => {
        setFormData(prev => ({ ...prev, ...data }));
        setCurrentStep(prev => prev + 1);
    };

    const handleBack = () => {
        setCurrentStep(prev => prev - 1);
    };

    const handleCalculate = (data: Partial<FormData>) => {
        const finalData = { ...formData, ...data };
        setFormData(finalData);

        const numericData = Object.entries(finalData)
            .filter(([key]) => key !== 'culture' && key !== 'amendment')
            .reduce((acc, [key, value]) => ({ ...acc, [key]: parseFloat(value as string) }), {} as Record<string, number>);

        const params = CULTURE_PARAMS[finalData.culture];
        if (!params) return;

        let phosphorusRate = 0;
        if (numericData.phosphorus > 30) phosphorusRate = 50;
        else if (numericData.phosphorus > 20) phosphorusRate = 100;
        else if (numericData.phosphorus > 10) phosphorusRate = 150;
        else if (numericData.phosphorus >= 5) phosphorusRate = 200;
        else phosphorusRate = 250;

        const potassiumNeed = Math.max(0, (110 + 2.5 * numericData.cec) - numericData.potassium);
        const calciumRate = Math.max(0, (130 * numericData.cec) - numericData.calcium);
        const magnesiumRate = Math.max(0, (10 * numericData.cec) - numericData.magnesium);

        const basicNeeds: NutrientNeeds[] = [
            { element: 'P2O5', norm: phosphorusRate },
            { element: 'K2O', norm: potassiumNeed },
            { element: 'CaO', norm: calciumRate },
            { element: 'MgO', norm: magnesiumRate },
            { element: 'Меліорант', norm: 0 }, // Placeholder, will be calculated in results view
        ];

        const nitrogenRate = (params.nitrogenFactor * numericData.plannedYield) - (numericData.nitrogenAnalysis * 3);
        const waterSolublePhosphorusRate = Math.max(0, phosphorusRate * 0.2);
        
        const kRange = params.potassiumRanges.find(r => numericData.potassium >= r.min && numericData.potassium <= r.max);
        const solublePotassiumNeed = kRange ? kRange.value : 0;
        
        const solubleCalciumNeed = solublePotassiumNeed * params.calciumFactor;
        const solubleMagnesiumNeed = solublePotassiumNeed * params.magnesiumFactor;
        
        const fertigationNeeds: NutrientNeeds[] = [
            { element: 'N', norm: Math.max(0, nitrogenRate) },
            { element: 'P2O5', norm: waterSolublePhosphorusRate },
            { element: 'K2O', norm: solublePotassiumNeed },
            { element: 'CaO', norm: solubleCalciumNeed },
            { element: 'MgO', norm: solubleMagnesiumNeed },
        ];

        const calculatedResults: CalculationResults = {
            culture: finalData.culture,
            basic: basicNeeds.map(n => ({...n, norm: Math.round(n.norm)})),
            fertigation: fertigationNeeds.map(n => ({...n, norm: Math.round(n.norm)})),
        };

        setResults(calculatedResults);
        setCurrentStep(3);
    };
    
    const handleSelectCalculation = (type: 'basic' | 'fertigation' | 'full') => {
        setCalculationType(type);
        setCurrentStep(4);
    };

    const handleReset = () => {
        setCurrentStep(1);
        setFormData(INITIAL_FORM_DATA);
        setResults(null);
        setCalculationType(null);
    };

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return <Step1SoilAnalysis onNext={handleNext} data={formData} />;
            case 2:
                return <Step2CropYield onBack={handleBack} onCalculate={handleCalculate} data={formData} />;
            case 3:
                return <Step3CalculationChoice onBack={handleBack} onSelect={handleSelectCalculation} />;
            case 4:
                const params = CULTURE_PARAMS[formData.culture];
                return <Step4Results onReset={handleReset} results={results!} type={calculationType!} formData={formData} cultureParams={params} />;
            default:
                return null;
        }
    };

    return (
        <div className="container mx-auto p-4 md:p-8 font-sans bg-gray-50 min-h-screen">
            <header className="text-center mb-10">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-800">Агрохімічний калькулятор</h1>
                <p className="text-lg text-gray-600 mt-2">Розрахунок потреб у живленні для овочевих культур</p>
            </header>
            
            <main className="bg-white p-6 md:p-8 rounded-xl shadow-lg">
                <Stepper currentStep={currentStep} steps={steps} />
                <div className="mt-8">
                    {renderStep()}
                </div>
            </main>
            
            <footer className="text-center mt-12 text-gray-500 text-sm">
                <p>&copy; {new Date().getFullYear()} Агрохімічний калькулятор. Всі права захищено.</p>
            </footer>
        </div>
    );
}

export default App;