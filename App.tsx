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
import { generateTxtReport, generateXlsxReport } from './utils/reportGenerator';
import { t, Language } from './i18n';
import { SaveConfirmationModal } from './components/SaveConfirmationModal';

const INITIAL_FORM_DATA: FormData = {
    culture: '',
    plannedYield: '',
    sowingDate: '',
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
  springFertilizerRate: number | null;
}

const INITIAL_FERTILIZER_SELECTIONS: FertilizerSelections = {
    springFertilizer: INITIAL_SPRING_FERTILIZER,
    nitrogenFertilizer: 'ammonium-nitrate',
    basicFertilizers: {},
    selectedAmendment: '',
    complexFertilizer: INITIAL_COMPLEX_FERTILIZER,
    springFertilizerRate: null,
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
    if (typeof migratedReport.formData.sowingDate === 'undefined') {
        migratedReport.formData.sowingDate = '';
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
    
    if (typeof migratedReport.springFertilizerRate === 'undefined') {
        migratedReport.springFertilizerRate = null;
    }
    
    if (migratedReport.id && migratedReport.formData && migratedReport.results) {
        return migratedReport as SavedReport;
    }
    return null;
}

const LANGUAGES: { code: Language; name: string; flag: string }[] = [
    { code: 'uk', name: 'Українська', flag: '🇺🇦' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'pt', name: 'Português', flag: '🇵🇹' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'kk', name: 'Қазақша', flag: '🇰🇿' },
    { code: 'sw', name: 'Kiswahili', flag: '🇹🇿' }
];

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
    const [springFertilizerRate, setSpringFertilizerRate] = useState<number | null>(null);
    
    // State for group mode selections
    const [groupFertilizerSelections, setGroupFertilizerSelections] = useState<FertilizerSelections[]>([]);
    const [recordedIndices, setRecordedIndices] = useState<Set<number>>(new Set());
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    
    const [language, setLanguage] = useState<Language>(() => {
        const savedLang = localStorage.getItem('agro-calc-lang');
        const validLangs = LANGUAGES.map(l => l.code);
        if (savedLang && validLangs.includes(savedLang as Language)) {
            return savedLang as Language;
        }
        return 'uk';
    });

    const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
    const langDropdownRef = useRef<HTMLDivElement>(null);


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
    
    useEffect(() => {
        localStorage.setItem('agro-calc-lang', language);
        document.documentElement.lang = language;
        document.title = t('appTitle', language);
    }, [language]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (langDropdownRef.current && !langDropdownRef.current.contains(event.target as Node)) {
                setIsLangDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);


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
            .filter(([key]) => !['culture', 'amendment', 'fieldName', 'sowingDate'].includes(key))
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
        setSpringFertilizerRate(null);
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
        setRecordedIndices(new Set());
        setMainView('landing');
        setAnalysisMode(null);
    };
    
    const handleReturnToLanding = () => {
        handleReset();
    };

    const handleSaveReport = () => { // For single mode JSON save
        if (analysisMode !== 'single' || !results || !calculationType) return;
        
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
            springFertilizerRate,
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

        setMainView('reports');
        setSelectedReport(null);
    };

    const handleRecordCalculation = () => {
        setRecordedIndices(prev => {
            const newSet = new Set(prev);
            newSet.add(activeAnalysisIndex);
            return newSet;
        });
    };

    const handleContinue = () => {
        // Add a new analysis form
        setAnalyses(prev => [...prev, { ...INITIAL_FORM_DATA, culture: 'Томат', plannedYield: '100' }]);
        // Set the new form as active
        setActiveAnalysisIndex(analyses.length);
        // Go back to the first step
        setCurrentStep(1);
    };

    const handleOpenSaveModal = () => {
        if (recordedIndices.size === 0) {
            alert(t('reportSaveError', language));
            return;
        }
        setIsSaveModalOpen(true);
    };

    const handleConfirmSave = (selectedIndices: number[]) => {
        if (selectedIndices.length === 0) {
            alert(t('reportSaveError', language));
            return;
        }

        const reportsToSave = selectedIndices.map(index => {
            const formData = analyses[index];
            const result = groupResults[index];
            const selections = groupFertilizerSelections[index];
            const cultureParams = CULTURE_PARAMS[formData.culture];

            if (!formData || !result || !selections || !cultureParams || !calculationType) {
                return null;
            }
            
            return {
                formData,
                results: result,
                calculationType,
                cultureParams,
                springFertilizer: selections.springFertilizer,
                nitrogenFertilizer: selections.nitrogenFertilizer,
                basicFertilizers: selections.basicFertilizers,
                selectedAmendment: selections.selectedAmendment,
                complexFertilizer: selections.complexFertilizer,
                springFertilizerRate: selections.springFertilizerRate,
                lang: language
            };
        }).filter((r): r is NonNullable<typeof r> => r !== null);
        
        if (reportsToSave.length > 0) {
            generateXlsxReport(reportsToSave, language);
        }
        setIsSaveModalOpen(false);
    };

    const handleSaveAllTxtReport = () => {
        if (analysisMode !== 'group' || analyses.length === 0 || !calculationType) return;
    
        const allReportsContent = analyses.map((formData, index) => {
            const result = groupResults[index];
            const selections = groupFertilizerSelections[index];
            const cultureParams = CULTURE_PARAMS[formData.culture];
            
            if (!result || !selections || !cultureParams) {
                return `---------- ERROR: Could not generate report for analysis #${index + 1} (${formData.fieldName || formData.culture}) ----------`;
            }
            
            const reportDataForGenerator = {
                formData,
                results: result,
                calculationType,
                cultureParams,
                springFertilizer: selections.springFertilizer,
                nitrogenFertilizer: selections.nitrogenFertilizer,
                basicFertilizers: selections.basicFertilizers,
                selectedAmendment: selections.selectedAmendment,
                complexFertilizer: selections.complexFertilizer,
                springFertilizerRate: selections.springFertilizerRate,
                lang: language
            };
    
            return generateTxtReport(reportDataForGenerator);
    
        }).join('\n\n\n==================================================\n   NEXT CALCULATION\n==================================================\n\n\n');
        
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
        if (window.confirm(t('deleteConfirm', language))) {
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
                     if (skippedCount > 0) {
                        alert(t('reportLoadSuccessMultiple', language, { count: newReports.length, skipped: skippedCount }));
                     } else {
                        alert(t('reportLoadSuccessOne', language));
                     }
                    setReports(prev => [...newReports, ...prev]);
                } else if (reportsToLoad.length > 0 && skippedCount === reportsToLoad.length) {
                     alert(t('reportLoadSkippedAll', language));
                } else {
                    throw new Error("Invalid report file format.");
                }
            } catch (error) {
                console.error("Failed to load or parse report file", error);
                alert(t('reportLoadError', language));
            } finally {
                 if(event.target) event.target.value = '';
            }
        };
        reader.onerror = () => {
             console.error("Failed to read file", reader.error);
             alert(t('reportLoadFileError', language));
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
        if (window.confirm(t('resetLogoConfirm', language))) {
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
    
    const handleLanguageChange = (lang: Language) => {
        setLanguage(lang);
        setIsLangDropdownOpen(false);
    };

    const currentLangDetails = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];

    const renderLandingPage = () => (
        <main className="bg-white p-8 md:p-16 rounded-xl shadow-lg text-center">
            <h2 className="text-3xl font-bold text-slate-800">{t('landingTitle', language)}</h2>
            <p className="mt-4 text-slate-600 max-w-2xl mx-auto">
                {t('landingDescription', language)}
            </p>
            <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-6">
                <button
                    onClick={() => { setAnalysisMode('single'); setMainView('calculator'); }}
                    className="w-full sm:w-64 bg-indigo-600 text-white font-bold py-4 px-8 rounded-lg hover:bg-indigo-700 transition duration-300 shadow-lg text-lg flex flex-col items-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-2m-3 2v-6m-3 6v-2m12-4H6a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2v-8a2 2 0 00-2-2z" /></svg>
                    <span>{t('singleAnalysis', language)}</span>
                </button>
                <button
                    onClick={() => { setAnalysisMode('group'); setMainView('calculator'); }}
                    className="w-full sm:w-64 bg-emerald-600 text-white font-bold py-4 px-8 rounded-lg hover:bg-emerald-700 transition duration-300 shadow-lg text-lg flex flex-col items-center gap-2"
                >
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                    <span>{t('groupAnalysis', language)}</span>
                </button>
            </div>
        </main>
    );

    const renderCalculator = () => {
        if (analysisMode === 'single') {
            const steps = [t('step1', language), t('step2', language), t('step3', language), t('step4', language)];
            return (
                <main className="bg-white p-4 md:p-8 rounded-xl shadow-lg">
                    <Stepper currentStep={currentStep} steps={steps} />
                    <div className="mt-8">
                        {currentStep === 1 && <Step1SoilAnalysis onNext={handleNext} onBack={handleReturnToLanding} data={currentFormData} onDataChange={updateCurrentAnalysis} lang={language} />}
                        {currentStep === 2 && <Step2CropYield onBack={handleBack} onCalculate={handleCalculate} data={currentFormData} onDataChange={updateCurrentAnalysis} isGroupMode={false} isCalculationDisabled={false} lang={language} />}
                        {currentStep === 3 && <Step3CalculationChoice onBack={handleBack} onSelect={handleSelectCalculation} lang={language} />}
                        {currentStep === 4 && results && calculationType && (
                            <Step4Results 
                                onReset={handleReset} 
                                onBack={handleBack}
                                results={results} 
                                type={calculationType} 
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
                                springFertilizerRate={springFertilizerRate}
                                setSpringFertilizerRate={setSpringFertilizerRate}
                                isGroupMode={false}
                                onSaveAllTxt={() => {}}
                                lang={language}
                           />
                        )}
                    </div>
                </main>
            );
        }

        if (analysisMode === 'group') {
            const steps = [t('step1', language), t('step2', language), t('step3', language), t('step4', language)];
            const isCalculationDisabled = analyses.some(a => !a.culture || !a.plannedYield || parseFloat(a.plannedYield) <= 0);

            const renderGroupStep = () => {
                switch (currentStep) {
                    case 1:
                        return <Step1SoilAnalysis onNext={handleNext} onBack={handleReturnToLanding} data={currentFormData} onDataChange={updateCurrentAnalysis} lang={language}/>;
                    case 2:
                        return <Step2CropYield onBack={handleBack} onCalculate={handleCalculateAll} data={currentFormData} onDataChange={updateCurrentAnalysis} isGroupMode={true} isCalculationDisabled={isCalculationDisabled} lang={language} />;
                    case 3:
                        return <Step3CalculationChoice onBack={handleBack} onSelect={handleSelectCalculation} lang={language} />;
                    case 4:
                        const currentResult = groupResults[activeAnalysisIndex];
                        const params = CULTURE_PARAMS[currentFormData.culture];
                        const currentSelections = groupFertilizerSelections[activeAnalysisIndex];

                        if (!currentResult || !params || !currentSelections || !calculationType) {
                            return (
                                <div className="text-center py-10">
                                    <h3 className="text-xl font-semibold text-red-600">{t('calculationError', language)}</h3>
                                    <p className="text-slate-600 mt-2">{t('calculationErrorDesc', language)}</p>
                                    <button onClick={handleBack} className="mt-6 bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-indigo-700 transition">{t('backButton', language)}</button>
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
                                    type={calculationType} 
                                    formData={currentFormData} 
                                    cultureParams={params}
                                    onSave={()=>{}}
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
                                    springFertilizerRate={currentSelections.springFertilizerRate}
                                    setSpringFertilizerRate={createGroupSelectionSetter<number | null>('springFertilizerRate')}
                                    isGroupMode={true}
                                    onSaveAllTxt={handleSaveAllTxtReport}
                                    lang={language}
                                    onRecord={handleRecordCalculation}
                                    onOpenSaveModal={handleOpenSaveModal}
                                    recordedIndices={recordedIndices}
                                    onContinue={handleContinue}
                                    activeAnalysisIndex={activeAnalysisIndex}
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
                                    {analysis.fieldName || t('analysisTab', language, { index: index + 1 })}
                                </button>
                            ))}
                            {currentStep < 3 && (
                                <button
                                    onClick={() => {
                                        setAnalyses(prev => [...prev, { ...INITIAL_FORM_DATA }]);
                                        setActiveAnalysisIndex(analyses.length);
                                    }}
                                    className="py-2 px-4 rounded-lg text-sm font-semibold text-indigo-600 hover:bg-indigo-100"
                                    title={t('addAnalysisTooltip', language)}
                                >
                                    + {t('addAnalysis', language)}
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
            return <ReportDetail report={selectedReport} onBack={() => setSelectedReport(null)} lang={language} />;
        }
        return <ReportsList 
                    reports={reports} 
                    onView={setSelectedReport} 
                    onDelete={handleDeleteReport}
                    onNewCalculation={handleReset}
                    onLoadReport={triggerLoadReport}
                    lang={language}
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
            {isSaveModalOpen && (
                <SaveConfirmationModal
                    isOpen={isSaveModalOpen}
                    onClose={() => setIsSaveModalOpen(false)}
                    onConfirm={handleConfirmSave}
                    analyses={analyses}
                    recordedIndices={recordedIndices}
                    lang={language}
                />
            )}
            <input type="file" ref={fileInputRef} onChange={handleLogoChange} accept="image/*" className="hidden" aria-hidden="true" />
            <input type="file" ref={reportInputRef} onChange={handleLoadReport} accept="application/json,.json" className="hidden" aria-hidden="true" />
            <header className="bg-gradient-to-r from-indigo-700 to-indigo-900 text-white p-4 md:p-6 rounded-xl shadow-2xl mb-10 flex justify-between items-center">
                <div className="flex items-center gap-4">
                     <div 
                        className="relative group cursor-pointer" 
                        onClick={handleLogoClick}
                        title={t('changeLogoTooltip', language)}
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
                                title={t('resetLogoTooltip', language)}
                                aria-label={t('resetLogoTooltip', language)}
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
                        <h1 className="text-xl md:text-3xl font-bold tracking-tight">{t('headerTitle', language)}</h1>
                        <p className="text-sm md:text-base text-indigo-200 mt-1 hidden sm:block">
                             {mainView === 'calculator' && t('headerSubtitleCalc', language)}
                             {mainView === 'reports' && t('headerSubtitleReports', language)}
                             {mainView === 'landing' && t('headerSubtitleLanding', language)}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 md:gap-4">
                     <div className="relative" ref={langDropdownRef}>
                        <button
                            onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold py-2 px-3 rounded-lg transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-white"
                        >
                            <span>{currentLangDetails.flag}</span>
                            <span className="hidden md:inline">{currentLangDetails.name}</span>
                            <svg className="h-5 w-5 text-white/80 hidden sm:block" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.23 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                            </svg>
                        </button>
                        {isLangDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 ring-1 ring-black ring-opacity-5">
                                {LANGUAGES.map(lang => (
                                    <button
                                        key={lang.code}
                                        onClick={() => handleLanguageChange(lang.code)}
                                        className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                                    >
                                        <span>{lang.flag}</span>
                                        <span>{lang.name}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <button
                        onClick={() => {
                            setMainView(mainView === 'reports' ? 'landing' : 'reports');
                            setSelectedReport(null);
                        }}
                        className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-white"
                        aria-label={mainView !== 'reports' ? t('viewReportsAria', language) : t('goToCalculatorAria', language)}
                    >
                        {mainView !== 'reports' ? <ReportsIcon /> : <CalculatorIcon />}
                        <span className="hidden md:inline">
                            {mainView !== 'reports' ? t('reports', language) : t('calculator', language)}
                        </span>
                    </button>
                </div>
            </header>
            
            <div className="bg-emerald-100 text-emerald-800 rounded-lg shadow-sm mb-8 overflow-hidden whitespace-nowrap">
                <div className="marquee-content py-2">
                    <span className="text-sm font-semibold italic px-4">Оновлено 11.11.2025</span>
                </div>
            </div>

            {renderContent()}
            
            <footer className="text-center mt-12 text-slate-500 text-sm">
                <p>{t('footerText', language, { year: new Date().getFullYear() })}</p>
            </footer>
        </div>
    );
}

export default App;