
import React, { useState, useEffect, useRef } from 'react';
import type { CalculationResults, FormData, NutrientNeeds, CultureParams, SavedReport, BasicFertilizerSelections, ComplexFertilizer, SpringFertilizer } from './types';
import { Stepper } from './components/Stepper';
import { Step1SoilAnalysis } from './components/Step1SoilAnalysis';
import { Step2CropYield } from './components/Step2CropYield';
import { Step3CalculationChoice } from './components/Step3CalculationChoice';
import { Step4Results } from './components/Step4Results';
import { CULTURE_PARAMS } from './constants';
import { ReportsList } from './components/ReportsList';
import { ReportDetail } from './components/ReportDetail';
import { Logo } from './components/Logo';
import { generateTxtReport } from './utils/reportGenerator';

const INITIAL_FORM_DATA: FormData = {
    culture: '',
    plannedYield: '',
    fieldArea: '1',
    fieldName: '',
    nitrogenAnalysis: '5',
    ph: '7.0',
    phosphorus: '50',
    potassium: '100',
    calcium: '2000',
    magnesium: '100',
    cec: '15',
    amendment: '',
};

const INITIAL_COMPLEX_FERTILIZER: ComplexFertilizer = {
    n: '', p2o5: '', k2o: '', cao: '', mg: '', rate: '', enabled: false
};

const INITIAL_SPRING_FERTILIZER: SpringFertilizer = {
    n: '', p: '', k: '', ca: '', mg: '', enabled: false
};

interface FertilizerSelections {
  springFertilizer: SpringFertilizer;
  nitrogenFertilizer: string;
  basicFertilizers: BasicFertilizerSelections;
  selectedAmendment: string;
  complexFertilizer: ComplexFertilizer;
}

const INITIAL_FERTILIZER_SELECTIONS: FertilizerSelections = {
    springFertilizer: INITIAL_SPRING_FERTILIZER,
    nitrogenFertilizer: 'ammonium-nitrate',
    basicFertilizers: {},
    selectedAmendment: '',
    complexFertilizer: INITIAL_COMPLEX_FERTILIZER,
};


const CalculatorIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-2m-3 2v-6m-3 6v-2m12-4H6a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2v-8a2 2 0 00-2-2z" />
    </svg>
);

const ReportsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
    </svg>
);

const migrateReport = (report: any): SavedReport | null => {
    if (!report || typeof report !== 'object') return null;
    const migratedReport = { ...report };
    if (!migratedReport.formData) return null;

    if (typeof migratedReport.formData.fieldArea === 'undefined') {
        migratedReport.formData.fieldArea = '1';
    }
    if (typeof migratedReport.formData.fieldName === 'undefined') {
        migratedReport.formData.fieldName = '';
    }
    if (migratedReport.springFertilizer && typeof (migratedReport.springFertilizer as any).enabled === 'undefined') {
        const oldFert = migratedReport.springFertilizer as any;
        const hasValues = oldFert.n || oldFert.p || oldFert.k || oldFert.ca || oldFert.mg;
        migratedReport.springFertilizer = {
            n: oldFert.n || '', p: oldFert.p || '', k: oldFert.k || '', ca: oldFert.ca || '', mg: oldFert.mg || '', enabled: !!hasValues
        };
    }
    if (!migratedReport.complexFertilizer) {
        migratedReport.complexFertilizer = INITIAL_COMPLEX_FERTILIZER;
    }
    
    if (migratedReport.id && migratedReport.formData && migratedReport.results) {
        return migratedReport as SavedReport;
    }
    return null;
}

function App() {
    const [mainView, setMainView] = useState<'landing' | 'calculator' | 'reports'>('landing');
    const [analysisMode, setAnalysisMode] = useState<'single' | 'group' | null>(null);
    const [currentStep, setCurrentStep] = useState(1);
    const [analyses, setAnalyses] = useState<FormData[]>([{...INITIAL_FORM_DATA, culture: 'Томат', plannedYield: '100'}]);
    const [activeAnalysisIndex, setActiveAnalysisIndex] = useState(0);

    const [results, setResults] = useState<CalculationResults | null>(null);
    const [groupResults, setGroupResults] = useState<(CalculationResults | null)[]>([]);
    const [calculationType, setCalculationType] = useState<'basic' | 'fertigation' | 'full' | null>(null);
    
    // State for single mode selections
    const [springFertilizer, setSpringFertilizer] = useState<SpringFertilizer>(INITIAL_SPRING_FERTILIZER);
    const [nitrogenFertilizer, setNitrogenFertilizer] = useState('ammonium-nitrate');
    const [basicFertilizers, setBasicFertilizers] = useState<BasicFertilizerSelections>({});
    const [selectedAmendment, setSelectedAmendment] = useState('');
    const [complexFertilizer, setComplexFertilizer] = useState<ComplexFertilizer>(INITIAL_COMPLEX_FERTILIZER);
    
    // State for group mode selections
    const [groupFertilizerSelections, setGroupFertilizerSelections] = useState<FertilizerSelections[]>([]);


    const [reports, setReports] = useState<SavedReport[]>(() => {
        try {
            const savedReports = localStorage.getItem('agro-reports');
            if (!savedReports) return [];
            
            const parsedReports = JSON.parse(savedReports);
            if (!Array.isArray(parsedReports)) {
                console.warn('Stored reports ("agro-reports") is not an array, removing.');
                localStorage.removeItem('agro-reports');
                return [];
            }
            
            return (parsedReports as any[]).map(migrateReport).filter(Boolean) as SavedReport[];

        } catch (error) {
            console.error("Failed to load or migrate reports from localStorage", error);
            localStorage.removeItem('agro-reports');
            return [];
        }
    });
    const [selectedReport, setSelectedReport] = useState<SavedReport | null>(null);

    const [customLogoUrl, setCustomLogoUrl] = useState<string | null>(() => {
        try {
            return localStorage.getItem('custom-logo');
        } catch (error) {
            console.error("Failed to load custom logo from localStorage", error);
            return null;
        }
    });
    const fileInputRef = useRef<HTMLInputElement>(null);
    const reportInputRef = useRef<HTMLInputElement>(null);
    const isInitialMount = useRef(true);

    const currentFormData = analyses[activeAnalysisIndex] || {...INITIAL_FORM_DATA};

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }
        try {
            localStorage.setItem('agro-reports', JSON.stringify(reports));
        } catch (error) {
            console.error("Failed to save reports to localStorage", error);
        }
    }, [reports]);

    const updateCurrentAnalysis = (data: Partial<FormData>) => {
        setAnalyses(prev => {
            const newAnalyses = [...prev];
            newAnalyses[activeAnalysisIndex] = { ...newAnalyses[activeAnalysisIndex], ...data };
            return newAnalyses;
        });
    };

    const handleNext = () => {
        setCurrentStep(prev => prev + 1);
    };

    const handleBack = () => {
        setCurrentStep(prev => prev - 1);
    };
    
    const runCalculation = (formData: FormData): CalculationResults | null => {
        const numericData = Object.entries(formData)
            .filter(([key]) => !['culture', 'amendment', 'fieldName'].includes(key))
            .reduce((acc, [key, value]) => ({ ...acc, [key]: parseFloat(value as string) }), {} as Record<string, number>);

        const params = CULTURE_PARAMS[formData.culture];
        if (!params) return null;

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

        return {
            culture: formData.culture,
            basic: basicNeeds.map(n => ({...n, norm: Math.round(n.norm)})),
            fertigation: fertigationNeeds.map(n => ({...n, norm: Math.round(n.norm)})),
        };
    };

    const handleCalculate = () => { // For single mode
        const calculatedResults = runCalculation(currentFormData);
        setResults(calculatedResults);
        setGroupResults([]);
        setCurrentStep(3);
    };

    const handleCalculateAll = () => { // For group mode
        const allResults = analyses.map(formData => runCalculation(formData));
        setGroupResults(allResults);
        setGroupFertilizerSelections(analyses.map(() => ({ ...INITIAL_FERTILIZER_SELECTIONS })));
        setResults(null);
        setCurrentStep(3);
    };
    
    const handleSelectCalculation = (type: 'basic' | 'fertigation' | 'full') => {
        setCalculationType(type);
        setCurrentStep(4);
    };
    
    const resetFertilizerSelections = () => {
        setSpringFertilizer(INITIAL_SPRING_FERTILIZER);
        setNitrogenFertilizer('ammonium-nitrate');
        setBasicFertilizers({});
        setSelectedAmendment('');
        setComplexFertilizer(INITIAL_COMPLEX_FERTILIZER);
    };

    const handleReset = () => {
        setCurrentStep(1);
        setAnalyses([{ ...INITIAL_FORM_DATA, culture: 'Томат', plannedYield: '100' }]);
        setActiveAnalysisIndex(0);
        setResults(null);
        setGroupResults([]);
        setCalculationType(null);
        resetFertilizerSelections();
        setGroupFertilizerSelections([]);
        setMainView('landing');
        setAnalysisMode(null);
    };
    
    const handleReturnToLanding = () => {
        handleReset();
    };

    const handleSaveReport = () => {
        if (analysisMode === 'single') {
            if (!results || !calculationType) return;
            const newReport: SavedReport = {
                id: new Date().toISOString() + Math.random(),
                timestamp: new Date().toISOString(),
                formData: currentFormData,
                results: results,
                calculationType: calculationType,
                springFertilizer,
                nitrogenFertilizer,
                basicFertilizers,
                selectedAmendment,
                complexFertilizer,
            };
            setReports(prev => [newReport, ...prev]);
            const reportJson = JSON.stringify(newReport, null, 2);
            const blob = new Blob([reportJson], { type: 'application/json;charset=utf-8' });
            
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            const cultureName = currentFormData.culture.replace(/ /g, '_');
            const date = new Date().toISOString().split('T')[0];
            link.setAttribute('href', url);
            link.setAttribute('download', `report_${cultureName}_${date}.json`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } else if (analysisMode === 'group') {
            const date = new Date();
            const timestamp = date.toISOString();
            const dateString = timestamp.split('T')[0];

            // Fix: Explicitly type the return of the map function to `SavedReport | null` to ensure correct type inference.
            const groupReports: SavedReport[] = analyses.map((formData, index): SavedReport | null => {
                const result = groupResults[index];
                const selections = groupFertilizerSelections[index];
                if (!result || !selections) return null;

                return {
                    id: `${timestamp}_${index}`,
                    timestamp,
                    formData,
                    results: result,
                    calculationType: 'full',
                    ...selections
                };
            }).filter((r): r is SavedReport => r !== null);

            if (groupReports.length === 0) {
                alert("Немає даних для збереження звіту.");
                return;
            }

            setReports(prev => [...groupReports, ...prev]);

            const reportJson = JSON.stringify(groupReports, null, 2);
            const blob = new Blob([reportJson], { type: 'application/json;charset=utf-8' });
            
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `group_report_${dateString}.json`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }

        setMainView('reports');
        setSelectedReport(null);
    };

    const handleSaveAllTxtReport = () => {
        if (analysisMode !== 'group' || analyses.length === 0) return;
    
        const allReportsContent = analyses.map((formData, index) => {
            const result = groupResults[index];
            const selections = groupFertilizerSelections[index];
            const cultureParams = CULTURE_PARAMS[formData.culture];
            
            if (!result || !selections || !cultureParams) {
                return `---------- ПОМИЛКА: Не вдалося згенерувати звіт для аналізу #${index + 1} (${formData.fieldName || formData.culture}) ----------`;
            }
            
            const reportDataForGenerator = {
                formData,
                results: result,
                calculationType: 'full' as const,
                cultureParams,
                springFertilizer: selections.springFertilizer,
                nitrogenFertilizer: selections.nitrogenFertilizer,
                basicFertilizers: selections.basicFertilizers,
                selectedAmendment: selections.selectedAmendment,
                complexFertilizer: selections.complexFertilizer,
            };
    
            return generateTxtReport(reportDataForGenerator);
    
        }).join('\n\n\n==================================================\n   НАСТУПНИЙ РОЗРАХУНОК\n==================================================\n\n\n');
        
        const blob = new Blob([allReportsContent], { type: 'text/plain;charset=utf-8' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        const date = new Date().toISOString().split('T')[0];
        link.setAttribute('href', url);
        link.setAttribute('download', `group_report_all_${date}.txt`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };
    
    const handleDeleteReport = (id: string) => {
        if (window.confirm('Ви впевнені, що хочете видалити цей звіт?')) {
            setReports(prev => {
                const updatedReports = prev.filter(report => report.id !== id);
                try {
                     localStorage.setItem('agro-reports', JSON.stringify(updatedReports));
                } catch (error) {
                    console.error("Failed to save reports to localStorage", error);
                }
                return updatedReports;
            });
            setSelectedReport(null);
        }
    };

    const handleLoadReport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result;
                if (typeof text !== 'string') throw new Error("File content is not a string.");
                
                const loadedData = JSON.parse(text);
                const reportsToLoad: any[] = Array.isArray(loadedData) ? loadedData : [loadedData];
                
                const newReports: SavedReport[] = [];
                const existingIds = new Set(reports.map(r => r.id));
                let skippedCount = 0;

                for (const report of reportsToLoad) {
                    const migratedReport = migrateReport(report);
                    if (migratedReport) {
                        if (existingIds.has(migratedReport.id)) {
                            skippedCount++;
                            continue;
                        }
                        newReports.push(migratedReport);
                        existingIds.add(migratedReport.id);
                    } else {
                        console.warn("Skipping an invalid report item during load.", report);
                    }
                }
                
                if (newReports.length > 0) {
                    setReports(prev => [...newReports, ...prev]);
                } else if (reportsToLoad.length > 0 && skippedCount === reportsToLoad.length) {
                     alert('Всі звіти з цього файлу вже існують у списку.');
                } else {
                    throw new Error("Invalid report file format.");
                }

                if (skippedCount > 0) {
                    alert(`${skippedCount} звіт(ів) вже існує у списку і був пропущений.`);
                }

            } catch (error) {
                console.error("Failed to load or parse report file", error);
                alert("Не вдалося завантажити звіт. Файл пошкоджено або має неправильний формат.");
            } finally {
                 if(event.target) event.target.value = '';
            }
        };
        reader.onerror = () => {
             console.error("Failed to read file", reader.error);
             alert("Не вдалося прочитати файл.");
             if(event.target) event.target.value = '';
        }
        reader.readAsText(file);
    };
    
    const triggerLoadReport = () => {
        reportInputRef.current?.click();
    };

    const handleLogoClick = () => {
        fileInputRef.current?.click();
    };

    const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                try {
                    localStorage.setItem('custom-logo', base64String);
                    setCustomLogoUrl(base64String);
                } catch (error) {
                    console.error("Failed to save custom logo to localStorage", error);
                    alert("Не вдалося зберегти логотип. Можливо, сховище переповнене.");
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleResetLogo = (e: React.MouseEvent) => {
        e.stopPropagation(); 
        if (window.confirm('Ви впевнені, що хочете видалити власний логотип і повернути стандартний?')) {
            try {
                localStorage.removeItem('custom-logo');
                setCustomLogoUrl(null);
            } catch (error) {
                console.error("Failed to remove custom logo from localStorage", error);
            }
        }
    };
    
    const handleActiveAnalysisChange = (index: number) => {
        setActiveAnalysisIndex(index);
    };

    const renderLandingPage = () => (
        <main className="bg-white p-8 md:p-16 rounded-xl shadow-lg text-center">
            <h2 className="text-3xl font-bold text-slate-800">Вітаємо!</h2>
            <p className="mt-4 text-slate-600 max-w-2xl mx-auto">
                Оберіть режим роботи: створіть один детальний розрахунок для конкретного поля або керуйте кількома аналізами одночасно для порівняння.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-6">
                <button
                    onClick={() => { setAnalysisMode('single'); setMainView('calculator'); }}
                    className="w-full sm:w-64 bg-indigo-600 text-white font-bold py-4 px-8 rounded-lg hover:bg-indigo-700 transition duration-300 shadow-lg text-lg flex flex-col items-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-2m-3 2v-6m-3 6v-2m12-4H6a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2v-8a2 2 0 00-2-2z" /></svg>
                    <span>Один аналіз</span>
                </button>
                <button
                    onClick={() => { setAnalysisMode('group'); setMainView('calculator'); }}
                    className="w-full sm:w-64 bg-emerald-600 text-white font-bold py-4 px-8 rounded-lg hover:bg-emerald-700 transition duration-300 shadow-lg text-lg flex flex-col items-center gap-2"
                >
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                    <span>Груповий аналіз</span>
                </button>
            </div>
        </main>
    );

    const renderCalculator = () => {
        if (analysisMode === 'single') {
            const steps = ['Аналіз ґрунту', 'Культура', 'Вибір', 'Результат'];
            return (
                <main className="bg-white p-4 md:p-8 rounded-xl shadow-lg">
                    <Stepper currentStep={currentStep} steps={steps} />
                    <div className="mt-8">
                        {currentStep === 1 && <Step1SoilAnalysis onNext={handleNext} onBack={handleReturnToLanding} data={currentFormData} onDataChange={updateCurrentAnalysis} />}
                        {currentStep === 2 && <Step2CropYield onBack={handleBack} onCalculate={handleCalculate} data={currentFormData} onDataChange={updateCurrentAnalysis} isGroupMode={false} isCalculationDisabled={false} />}
                        {currentStep === 3 && <Step3CalculationChoice onBack={handleBack} onSelect={handleSelectCalculation} />}
                        {currentStep === 4 && results && (
                            <Step4Results 
                                onReset={handleReset} 
                                onBack={handleBack}
                                results={results} 
                                type={calculationType!} 
                                formData={currentFormData} 
                                cultureParams={CULTURE_PARAMS[currentFormData.culture]}
                                onSave={handleSaveReport}
                                springFertilizer={springFertilizer}
                                setSpringFertilizer={setSpringFertilizer}
                                nitrogenFertilizer={nitrogenFertilizer}
                                setNitrogenFertilizer={setNitrogenFertilizer}
                                basicFertilizers={basicFertilizers}
                                setBasicFertilizers={setBasicFertilizers}
                                selectedAmendment={selectedAmendment}
                                setSelectedAmendment={setSelectedAmendment}
                                complexFertilizer={complexFertilizer}
                                setComplexFertilizer={setComplexFertilizer}
                                isGroupMode={false}
                                onSaveAllTxt={() => {}}
                           />
                        )}
                    </div>
                </main>
            );
        }

        if (analysisMode === 'group') {
            const steps = ['Аналіз ґрунту', 'Культура', 'Результати'];
            const isCalculationDisabled = analyses.some(a => !a.culture || !a.plannedYield || parseFloat(a.plannedYield) <= 0);

            const renderGroupStep = () => {
                switch (currentStep) {
                    case 1:
                        return <Step1SoilAnalysis onNext={handleNext} onBack={handleReturnToLanding} data={currentFormData} onDataChange={updateCurrentAnalysis} />;
                    case 2:
                        return <Step2CropYield onBack={handleBack} onCalculate={handleCalculateAll} data={currentFormData} onDataChange={updateCurrentAnalysis} isGroupMode={true} isCalculationDisabled={isCalculationDisabled} />;
                    case 3:
                        const currentResult = groupResults[activeAnalysisIndex];
                        const params = CULTURE_PARAMS[currentFormData.culture];
                        const currentSelections = groupFertilizerSelections[activeAnalysisIndex];

                        if (!currentResult || !params || !currentSelections) {
                            return (
                                <div className="text-center py-10">
                                    <h3 className="text-xl font-semibold text-red-600">Помилка розрахунку</h3>
                                    <p className="text-slate-600 mt-2">Не вдалося виконати розрахунок для цього аналізу. Будь ласка, перевірте вхідні дані.</p>
                                    <button onClick={handleBack} className="mt-6 bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-indigo-700 transition">Повернутися</button>
                                </div>
                            );
                        }
                        
                        const createGroupSelectionSetter = <T,>(key: keyof FertilizerSelections) => (value: React.SetStateAction<T>) => {
                            setGroupFertilizerSelections(prev => {
                                const newSelections = [...prev];
                                const current = newSelections[activeAnalysisIndex];
                                const newValue = typeof value === 'function' ? (value as (prevState: T) => T)(current[key] as T) : value;
                                newSelections[activeAnalysisIndex] = { ...current, [key]: newValue };
                                return newSelections;
                            });
                        };

                        return <Step4Results 
                                    onReset={handleReset} 
                                    onBack={handleBack}
                                    results={currentResult} 
                                    type={'full'} 
                                    formData={currentFormData} 
                                    cultureParams={params}
                                    onSave={handleSaveReport}
                                    springFertilizer={currentSelections.springFertilizer}
                                    setSpringFertilizer={createGroupSelectionSetter<SpringFertilizer>('springFertilizer')}
                                    nitrogenFertilizer={currentSelections.nitrogenFertilizer}
                                    setNitrogenFertilizer={createGroupSelectionSetter<string>('nitrogenFertilizer')}
                                    basicFertilizers={currentSelections.basicFertilizers}
                                    setBasicFertilizers={createGroupSelectionSetter<BasicFertilizerSelections>('basicFertilizers')}
                                    selectedAmendment={currentSelections.selectedAmendment}
                                    setSelectedAmendment={createGroupSelectionSetter<string>('selectedAmendment')}
                                    complexFertilizer={currentSelections.complexFertilizer}
                                    setComplexFertilizer={createGroupSelectionSetter<ComplexFertilizer>('complexFertilizer')}
                                    isGroupMode={true}
                                    onSaveAllTxt={handleSaveAllTxtReport}
                               />;
                    default:
                        return null;
                }
            };

            return (
                 <main className="bg-white p-4 md:p-8 rounded-xl shadow-lg">
                    <div className="mb-6 border-b border-slate-200">
                        <div className="flex items-center gap-2 overflow-x-auto pb-2">
                            {analyses.map((analysis, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleActiveAnalysisChange(index)}
                                    className={`py-2 px-4 rounded-t-lg text-sm font-semibold whitespace-nowrap transition-colors ${
                                        activeAnalysisIndex === index
                                            ? 'bg-indigo-600 text-white'
                                            : 'text-slate-600 hover:bg-slate-200'
                                    }`}
                                >
                                    {analysis.fieldName || `Аналіз #${index + 1}`}
                                </button>
                            ))}
                            {currentStep < 3 && (
                                <button
                                    onClick={() => {
                                        setAnalyses(prev => [...prev, { ...INITIAL_FORM_DATA }]);
                                        setActiveAnalysisIndex(analyses.length);
                                    }}
                                    className="py-2 px-4 rounded-lg text-sm font-semibold text-indigo-600 hover:bg-indigo-100"
                                    title="Додати новий аналіз"
                                >
                                    + Додати
                                </button>
                            )}
                        </div>
                    </div>
                    <Stepper currentStep={currentStep} steps={steps} />
                    <div className="mt-8">
                        {renderGroupStep()}
                    </div>
                </main>
            );
        }

        return null;
    };
    
    const renderReports = () => {
        if (selectedReport) {
            return <ReportDetail report={selectedReport} onBack={() => setSelectedReport(null)} />;
        }
        return <ReportsList 
                    reports={reports} 
                    onView={setSelectedReport} 
                    onDelete={handleDeleteReport}
                    onNewCalculation={handleReset}
                    onLoadReport={triggerLoadReport}
                />;
    };
    
    const renderContent = () => {
        switch(mainView) {
            case 'landing': return renderLandingPage();
            case 'calculator': return renderCalculator();
            case 'reports': return renderReports();
            default: return renderLandingPage();
        }
    }


    return (
        <div className="container mx-auto p-4 md:p-8 font-sans bg-slate-50 min-h-screen">
            <input type="file" ref={fileInputRef} onChange={handleLogoChange} accept="image/*" className="hidden" aria-hidden="true" />
            <input type="file" ref={reportInputRef} onChange={handleLoadReport} accept="application/json,.json" className="hidden" aria-hidden="true" />
            <header className="bg-gradient-to-r from-indigo-700 to-indigo-900 text-white p-4 md:p-6 rounded-xl shadow-2xl mb-10 flex justify-between items-center">
                <div className="flex items-center gap-4">
                     <div 
                        className="relative group cursor-pointer" 
                        onClick={handleLogoClick}
                        title="Натисніть, щоб змінити логотип"
                    >
                        {customLogoUrl ? (
                            <img 
                                src={customLogoUrl} 
                                alt="Логотип користувача" 
                                className="h-14 w-14 bg-indigo-50/90 p-1 rounded-full shadow-md object-cover"
                                 onError={() => {
                                    if (customLogoUrl) {
                                        console.error("Failed to load custom logo from localStorage.");
                                        localStorage.removeItem('custom-logo');
                                        setCustomLogoUrl(null);
                                    }
                                 }}
                            />
                        ) : (
                            <Logo className="h-14 w-14 shadow-md" title="Логотип калькулятора" />
                        )}
                        {customLogoUrl && (
                            <button
                                onClick={handleResetLogo}
                                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Видалити власний логотип"
                                aria-label="Видалити власний логотип"
                            >
                                &times;
                            </button>
                        )}
                        <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2-2H5a2 2 0 01-2-2V9z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                    </div>
                    <div>
                        <h1 className="text-xl md:text-3xl font-bold tracking-tight">Агрохімічний калькулятор</h1>
                        <p className="text-sm md:text-base text-indigo-200 mt-1 hidden sm:block">
                             {mainView === 'calculator' && 'Розрахунок потреб у живленні для овочевих культур'}
                             {mainView === 'reports' && 'Збережені звіти'}
                             {mainView === 'landing' && 'Багатофункціональний інструмент агронома'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center">
                    <button
                        onClick={() => {
                            setMainView(mainView === 'reports' ? 'landing' : 'reports');
                            setSelectedReport(null);
                        }}
                        className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-white"
                        aria-label={mainView !== 'reports' ? "Переглянути збережені звіти" : "Перейти до калькулятора"}
                    >
                        {mainView !== 'reports' ? <ReportsIcon /> : <CalculatorIcon />}
                        <span className="hidden md:inline">
                            {mainView !== 'reports' ? 'Звіти' : 'Калькулятор'}
                        </span>
                    </button>
                </div>
            </header>
            
            {renderContent()}
            
            <footer className="text-center mt-12 text-slate-500 text-sm">
                <p>&copy; {new Date().getFullYear()} Агрохімічний калькулятор. Всі права захищено.</p>
            </footer>
        </div>
    );
}

export default App;
