import React, { useState, useEffect } from 'react';
import type { CalculationResults, FormData, NutrientNeeds, CultureParams, SavedReport, BasicFertilizerSelections } from './types';
import { Stepper } from './components/Stepper';
import { Step1SoilAnalysis } from './components/Step1SoilAnalysis';
import { Step2CropYield } from './components/Step2CropYield';
import { Step3CalculationChoice } from './components/Step3CalculationChoice';
import { Step4Results } from './components/Step4Results';
import { CULTURE_PARAMS } from './constants';
import { ReportsList } from './components/ReportsList';
import { ReportDetail } from './components/ReportDetail';

const INITIAL_FORM_DATA: FormData = {
    culture: 'Томат',
    plannedYield: '100',
    nitrogenAnalysis: '5',
    ph: '7.0',
    phosphorus: '50',
    potassium: '100',
    calcium: '2000',
    magnesium: '100',
    cec: '15',
    amendment: '',
};

const CalculatorIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-2m-3 2v-6m-3 6v-2m12-4H6a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2v-8a2 2 0 00-2-2z" />
    </svg>
);

const ReportsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
    </svg>
);

function App() {
    const [view, setView] = useState<'calculator' | 'reports'>('calculator');
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
    const [results, setResults] = useState<CalculationResults | null>(null);
    const [calculationType, setCalculationType] = useState<'basic' | 'fertigation' | 'full' | null>(null);
    
    // State for FertigationProgram
    const [springFertilizer, setSpringFertilizer] = useState({ n: '', p: '', k: '', ca: '', mg: '' });
    const [nitrogenFertilizer, setNitrogenFertilizer] = useState('ammonium-nitrate');

    // State for BasicApplicationCalculator
    const [basicFertilizers, setBasicFertilizers] = useState<BasicFertilizerSelections>({});
    const [selectedAmendment, setSelectedAmendment] = useState('');

    const [reports, setReports] = useState<SavedReport[]>(() => {
        try {
            const savedReports = localStorage.getItem('agro-reports');
            return savedReports ? JSON.parse(savedReports) : [];
        } catch (error) {
            console.error("Failed to load reports from localStorage", error);
            return [];
        }
    });
    const [selectedReport, setSelectedReport] = useState<SavedReport | null>(null);

    useEffect(() => {
        try {
            localStorage.setItem('agro-reports', JSON.stringify(reports));
        } catch (error) {
            console.error("Failed to save reports to localStorage", error);
        }
    }, [reports]);

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
            { element: 'Меліорант', norm: 0 },
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
        setSpringFertilizer({ n: '', p: '', k: '', ca: '', mg: '' });
        setNitrogenFertilizer('ammonium-nitrate');
        setBasicFertilizers({});
        setSelectedAmendment('');
    };
    
    const handleSaveReport = () => {
        if (!results || !calculationType) return;
        const newReport: SavedReport = {
            id: new Date().toISOString() + Math.random(),
            timestamp: new Date().toISOString(),
            formData,
            results,
            calculationType,
            springFertilizer,
            nitrogenFertilizer,
            basicFertilizers,
            selectedAmendment,
        };
        setReports(prev => [newReport, ...prev]);
        setView('reports');
        setSelectedReport(null);
    };
    
    const handleDeleteReport = (id: string) => {
        if (window.confirm('Ви впевнені, що хочете видалити цей звіт?')) {
            setReports(prev => prev.filter(report => report.id !== id));
            setSelectedReport(null);
        }
    };
    
    const renderCalculator = () => {
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
                    return <Step4Results 
                                onReset={handleReset} 
                                results={results!} 
                                type={calculationType!} 
                                formData={formData} 
                                cultureParams={params}
                                onSave={handleSaveReport}
                                springFertilizer={springFertilizer}
                                setSpringFertilizer={setSpringFertilizer}
                                nitrogenFertilizer={nitrogenFertilizer}
                                setNitrogenFertilizer={setNitrogenFertilizer}
                                basicFertilizers={basicFertilizers}
                                setBasicFertilizers={setBasicFertilizers}
                                selectedAmendment={selectedAmendment}
                                setSelectedAmendment={setSelectedAmendment}
                           />;
                default:
                    return null;
            }
        };

        return (
            <main className="bg-white p-4 md:p-8 rounded-xl shadow-lg">
                <Stepper currentStep={currentStep} steps={steps} />
                <div className="mt-8">
                    {renderStep()}
                </div>
            </main>
        );
    };
    
    const renderReports = () => {
        if (selectedReport) {
            return <ReportDetail report={selectedReport} onBack={() => setSelectedReport(null)} />;
        }
        return <ReportsList 
                    reports={reports} 
                    onView={setSelectedReport} 
                    onDelete={handleDeleteReport}
                    onNewCalculation={() => {
                        handleReset();
                        setView('calculator');
                    }}
                    onBack={() => setView('calculator')}
                />;
    };


    return (
        <div className="container mx-auto p-4 md:p-8 font-sans bg-gray-50 min-h-screen">
            <header className="bg-gradient-to-r from-blue-700 to-blue-900 text-white p-4 md:p-6 rounded-xl shadow-2xl mb-10 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <img src="logo.svg" alt="Логотип калькулятора" className="h-14 w-14 bg-blue-50/90 p-1 rounded-full shadow-md" />
                    <div>
                        <h1 className="text-xl md:text-3xl font-bold tracking-tight">Агрохімічний калькулятор</h1>
                        <p className="text-sm md:text-base text-blue-200 mt-1 hidden sm:block">
                             {view === 'calculator' ? 'Розрахунок потреб у живленні для овочевих культур' : 'Збережені звіти'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center">
                    <button
                        onClick={() => {
                            setView(view === 'calculator' ? 'reports' : 'calculator');
                            setSelectedReport(null);
                        }}
                        className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-white"
                        aria-label={view === 'calculator' ? "Переглянути збережені звіти" : "Перейти до калькулятора"}
                    >
                        {view === 'calculator' ? <ReportsIcon /> : <CalculatorIcon />}
                        <span className="hidden md:inline">
                            {view === 'calculator' ? 'Звіти' : 'Калькулятор'}
                        </span>
                    </button>
                </div>
            </header>
            
            {view === 'calculator' ? renderCalculator() : renderReports()}
            
            <footer className="text-center mt-12 text-gray-500 text-sm">
                <p>&copy; {new Date().getFullYear()} Агрохімічний калькулятор. Всі права захищено.</p>
            </footer>
        </div>
    );
}

export default App;