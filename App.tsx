import React, { useState, useEffect } from 'react';
import type { CalculationResults, FormData, NutrientNeeds, CultureParams, SavedReport } from './types';
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

const SunIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
);

const MoonIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
);

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

const ThemeSwitcher: React.FC<{ theme: 'light' | 'dark'; setTheme: (theme: 'light' | 'dark') => void; }> = ({ theme, setTheme }) => {
    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 dark:focus:ring-offset-gray-900 focus:ring-blue-500 transition-colors"
            aria-label="Toggle theme"
        >
            {theme === 'light' ? <MoonIcon /> : <SunIcon />}
        </button>
    );
};


function App() {
    const [view, setView] = useState<'calculator' | 'reports'>('calculator');
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
    const [results, setResults] = useState<CalculationResults | null>(null);
    const [calculationType, setCalculationType] = useState<'basic' | 'fertigation' | 'full' | null>(null);
    const [springFertilizer, setSpringFertilizer] = useState({ n: '', p: '', k: '', ca: '', mg: '' });
    const [nitrogenFertilizer, setNitrogenFertilizer] = useState('ammonium-nitrate');

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

    const [theme, setTheme] = useState<'light' | 'dark'>(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            return 'dark';
        }
        return 'light';
    });

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

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
        };
        setReports(prev => [newReport, ...prev]);
        // Ideally, show a toast notification here. For now, we can switch to reports view.
        setView('reports');
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
                           />;
                default:
                    return null;
            }
        };

        return (
            <main className="bg-white dark:bg-gray-800 p-4 md:p-8 rounded-xl shadow-lg">
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
                />;
    };


    return (
        <div className="container mx-auto p-4 md:p-8 font-sans bg-gray-50 dark:bg-gray-900 min-h-screen">
            <header className="text-center mb-10 relative">
                <h1 className="text-3xl md:text-5xl font-bold text-gray-800 dark:text-gray-100">Агрохімічний калькулятор</h1>
                <p className="text-md md:text-lg text-gray-600 dark:text-gray-400 mt-2">
                    {view === 'calculator' ? 'Розрахунок потреб у живленні для овочевих культур' : 'Збережені звіти'}
                </p>
                <div className="absolute top-0 right-0 flex items-center gap-2">
                    <button
                        onClick={() => {
                            setView(view === 'calculator' ? 'reports' : 'calculator');
                            setSelectedReport(null);
                        }}
                        className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 dark:focus:ring-offset-gray-900 focus:ring-blue-500 transition-colors"
                        aria-label={view === 'calculator' ? "Переглянути збережені звіти" : "Перейти до калькулятора"}
                    >
                        {view === 'calculator' ? <ReportsIcon /> : <CalculatorIcon />}
                    </button>
                    <ThemeSwitcher theme={theme} setTheme={setTheme} />
                </div>
            </header>
            
            {view === 'calculator' ? renderCalculator() : renderReports()}
            
            <footer className="text-center mt-12 text-gray-500 dark:text-gray-400 text-sm">
                <p>&copy; {new Date().getFullYear()} Агрохімічний калькулятор. Всі права захищено.</p>
            </footer>
        </div>
    );
}

export default App;
