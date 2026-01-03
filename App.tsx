
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
import { calculateNutrientNeeds } from './utils/nutrientCalculations';

const createInitialComplexFertilizer = (): ComplexFertilizer => ({
    n: '', p2o5: '', k2o: '', cao: '', mg: '', rate: '', enabled: false
});

const createInitialSpringFertilizer = (): SpringFertilizer => ({
    n: '', p: '', k: '', ca: '', mg: '', enabled: false
});

const createInitialSelections = (): FertilizerSelections => ({
    springFertilizer: createInitialSpringFertilizer(),
    nitrogenFertilizer: 'ammonium-nitrate',
    basicFertilizers: {},
    selectedAmendment: '',
    complexFertilizer: createInitialComplexFertilizer(),
    springFertilizerRate: null,
});

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

interface FertilizerSelections {
  springFertilizer: SpringFertilizer;
  nitrogenFertilizer: string;
  basicFertilizers: BasicFertilizerSelections;
  selectedAmendment: string;
  complexFertilizer: ComplexFertilizer;
  springFertilizerRate: number | null;
}

// Project structure for saving/loading full state
interface AgroProject {
    version: string;
    type: 'project';
    mode: 'single' | 'group';
    analyses: FormData[];
    activeAnalysisIndex: number;
    calculationType: 'basic' | 'fertigation' | 'full' | null;
    selections: FertilizerSelections[]; // Array matching analyses
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
    
    // Single mode states
    const [springFertilizer, setSpringFertilizer] = useState<SpringFertilizer>(createInitialSpringFertilizer());
    const [nitrogenFertilizer, setNitrogenFertilizer] = useState('ammonium-nitrate');
    const [basicFertilizers, setBasicFertilizers] = useState<BasicFertilizerSelections>({});
    const [selectedAmendment, setSelectedAmendment] = useState('');
    const [complexFertilizer, setComplexFertilizer] = useState<ComplexFertilizer>(createInitialComplexFertilizer());
    const [springFertilizerRate, setSpringFertilizerRate] = useState<number | null>(null);
    
    // Group mode states
    const [groupFertilizerSelections, setGroupFertilizerSelections] = useState<FertilizerSelections[]>([]);
    const [recordedIndices, setRecordedIndices] = useState<Set<number>>(new Set());
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    
    const [language, setLanguage] = useState<Language>(() => {
        const savedLang = localStorage.getItem('agro-calc-lang');
        return (savedLang as Language) || 'uk';
    });

    const [reports, setReports] = useState<SavedReport[]>(() => {
        try {
            const saved = localStorage.getItem('agro-reports');
            if (!saved) return [];
            return JSON.parse(saved);
        } catch (e) {
            return [];
        }
    });
    const [selectedReport, setSelectedReport] = useState<SavedReport | null>(null);
    const [customLogoUrl, setCustomLogoUrl] = useState<string | null>(localStorage.getItem('custom-logo'));
    const fileInputRef = useRef<HTMLInputElement>(null);
    const reportInputRef = useRef<HTMLInputElement>(null);

    const currentFormData = analyses[activeAnalysisIndex] || {...INITIAL_FORM_DATA};

    useEffect(() => {
        localStorage.setItem('agro-reports', JSON.stringify(reports));
    }, [reports]);
    
    useEffect(() => {
        localStorage.setItem('agro-calc-lang', language);
    }, [language]);

    const updateCurrentAnalysis = (data: Partial<FormData>) => {
        setAnalyses(prev => {
            const newAnalyses = [...prev];
            newAnalyses[activeAnalysisIndex] = { ...newAnalyses[activeAnalysisIndex], ...data };
            return newAnalyses;
        });
    };

    const handleNext = () => setCurrentStep(prev => prev + 1);
    const handleBack = () => setCurrentStep(prev => prev - 1);
    
    const handleCalculate = () => {
        setResults(calculateNutrientNeeds(currentFormData));
        setGroupResults([]);
        setCurrentStep(3);
    };

    const handleCalculateAll = () => {
        const allResults = analyses.map(f => calculateNutrientNeeds(f));
        setGroupResults(allResults);
        
        setGroupFertilizerSelections(prev => {
            return analyses.map((_, i) => {
                if (prev[i]) return prev[i];
                return createInitialSelections();
            });
        });
        
        setRecordedIndices(new Set(analyses.map((_, i) => i)));
        setResults(null);
        setCurrentStep(3);
    };
    
    const handleSelectCalculation = (type: 'basic' | 'fertigation' | 'full') => {
        setCalculationType(type);
        setCurrentStep(4);
    };

    const handleReset = () => {
        setCurrentStep(1);
        setAnalyses([{ ...INITIAL_FORM_DATA, culture: 'Томат', plannedYield: '100' }]);
        setActiveAnalysisIndex(0);
        setResults(null);
        setGroupResults([]);
        setCalculationType(null);
        setRecordedIndices(new Set());
        setMainView('landing');
        setAnalysisMode(null);
        setGroupFertilizerSelections([]);
    };
    
    const handleSaveToHistory = () => {
        if (!results || !calculationType) return;
        const newReport: SavedReport = {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            formData: currentFormData,
            results: results!,
            calculationType: calculationType!,
            springFertilizer,
            nitrogenFertilizer,
            basicFertilizers,
            selectedAmendment,
            complexFertilizer,
            springFertilizerRate,
        };
        setReports(prev => [newReport, ...prev]);
        alert(t('saveToHistorySuccess', language));
    };

    const handleSaveDownload = () => {
        if (!calculationType) return;

        // Create the unified project structure
        const project: AgroProject = {
            version: '1.0',
            type: 'project',
            mode: analysisMode || 'single',
            analyses: analyses,
            activeAnalysisIndex: activeAnalysisIndex,
            calculationType: calculationType,
            selections: analysisMode === 'group' 
                ? groupFertilizerSelections 
                : [{
                    springFertilizer,
                    nitrogenFertilizer,
                    basicFertilizers,
                    selectedAmendment,
                    complexFertilizer,
                    springFertilizerRate,
                }]
        };

        const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const fileName = currentFormData.fieldName ? `${currentFormData.fieldName}_` : '';
        const projectPrefix = analysisMode === 'group' ? 'agro_group_session' : `agro_project_${fileName}${currentFormData.culture}`;
        
        a.href = url;
        a.download = `${projectPrefix}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleEditReport = (report: SavedReport) => {
        setMainView('calculator');
        setAnalysisMode('single');
        setAnalyses([report.formData]);
        setActiveAnalysisIndex(0);
        setResults(report.results);
        setCalculationType(report.calculationType);
        setSpringFertilizer(report.springFertilizer);
        setNitrogenFertilizer(report.nitrogenFertilizer);
        setBasicFertilizers(report.basicFertilizers);
        setSelectedAmendment(report.selectedAmendment);
        setComplexFertilizer(report.complexFertilizer || createInitialComplexFertilizer());
        setSpringFertilizerRate(report.springFertilizerRate ?? null);
        setCurrentStep(4);
        setSelectedReport(null);
    };

    const handleLoadProject = (project: AgroProject) => {
        setMainView('calculator');
        setAnalysisMode(project.mode);
        setAnalyses(project.analyses);
        setActiveAnalysisIndex(project.activeAnalysisIndex);
        setCalculationType(project.calculationType);
        
        if (project.mode === 'single') {
            const sel = project.selections[0];
            setSpringFertilizer(sel.springFertilizer);
            setNitrogenFertilizer(sel.nitrogenFertilizer);
            setBasicFertilizers(sel.basicFertilizers);
            setSelectedAmendment(sel.selectedAmendment);
            setComplexFertilizer(sel.complexFertilizer);
            setSpringFertilizerRate(sel.springFertilizerRate);
            setResults(calculateNutrientNeeds(project.analyses[0]));
        } else {
            setGroupFertilizerSelections(project.selections);
            const allResults = project.analyses.map(f => calculateNutrientNeeds(f));
            setGroupResults(allResults);
            setRecordedIndices(new Set(project.analyses.map((_, i) => i)));
        }
        
        setCurrentStep(4);
        setSelectedReport(null);
    };

    const handleRecordCalculation = () => {
        setRecordedIndices(prev => {
            const next = new Set(prev);
            if (next.has(activeAnalysisIndex)) next.delete(activeAnalysisIndex);
            else next.add(activeAnalysisIndex);
            return next;
        });
    };

    const handleContinue = () => {
        setAnalyses(prev => [...prev, { ...INITIAL_FORM_DATA, culture: 'Томат', plannedYield: '100' }]);
        setActiveAnalysisIndex(analyses.length);
        setCurrentStep(1);
    };

    const handleOpenSaveModal = () => setIsSaveModalOpen(true);

    const handleConfirmSave = (selectedIndices: number[]) => {
        const reportsToSave = selectedIndices.map(index => {
            const formData = analyses[index];
            const result = groupResults[index];
            const selections = groupFertilizerSelections[index];
            if (!formData || !result || !selections || !calculationType) return null;
            return {
                formData,
                results: result,
                calculationType,
                cultureParams: CULTURE_PARAMS[formData.culture],
                springFertilizer: selections.springFertilizer,
                nitrogenFertilizer: selections.nitrogenFertilizer,
                basicFertilizers: selections.basicFertilizers,
                selectedAmendment: selections.selectedAmendment,
                complexFertilizer: selections.complexFertilizer,
                springFertilizerRate: selections.springFertilizerRate,
                lang: language
            };
        }).filter(Boolean);
        
        if (reportsToSave.length > 0) generateXlsxReport(reportsToSave as any, language);
        setIsSaveModalOpen(false);
    };

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
            <input type="file" ref={fileInputRef} onChange={e => {
                const file = e.target.files?.[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        const b64 = reader.result as string;
                        localStorage.setItem('custom-logo', b64);
                        setCustomLogoUrl(b64);
                    };
                    reader.readAsDataURL(file);
                }
            }} accept="image/*" className="hidden" />
            <input type="file" ref={reportInputRef} onChange={e => {
                const file = e.target.files?.[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = e => {
                        try {
                            const data = JSON.parse(e.target?.result as string);
                            // Differentiate between a Project (restorable session) and a simple Report
                            if (data.type === 'project') {
                                handleLoadProject(data as AgroProject);
                            } else if (!Array.isArray(data) && data.formData && data.results) {
                                handleEditReport(data as SavedReport);
                            } else {
                                setReports(prev => [...(Array.isArray(data) ? data : [data]), ...prev]);
                                alert(t('reportLoadSuccessOne', language));
                            }
                        } catch (err) { alert(t('reportLoadError', language)); }
                    };
                    reader.readAsText(file);
                }
            }} className="hidden" />
            
            <header className="bg-gradient-to-r from-indigo-700 to-indigo-900 text-white p-4 md:p-6 rounded-xl shadow-2xl mb-10 flex justify-between items-center">
                <div className="flex items-center gap-4">
                     <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                        {customLogoUrl ? <img src={customLogoUrl} className="h-14 w-14 rounded-full object-cover" /> : <Logo className="h-14 w-14" />}
                    </div>
                    <div>
                        <h1 className="text-xl md:text-3xl font-bold">{t('headerTitle', language)}</h1>
                        <p className="text-indigo-200 hidden sm:block">Harvest Consulting</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                     <button onClick={() => setMainView(mainView === 'reports' ? 'calculator' : 'reports')} className="bg-white/10 hover:bg-white/20 text-white font-semibold py-2 px-4 rounded-lg">
                        {mainView === 'reports' ? t('calculator', language) : t('reports', language)}
                    </button>
                </div>
            </header>

            {mainView === 'landing' && (
                <main className="bg-white p-12 rounded-xl shadow-lg text-center">
                    <h2 className="text-3xl font-bold text-slate-800">{t('landingTitle', language)}</h2>
                    <p className="mt-4 text-slate-600 max-w-2xl mx-auto">{t('landingDescription', language)}</p>
                    <div className="mt-10 flex flex-col sm:flex-row justify-center gap-6">
                        <button onClick={() => { setAnalysisMode('single'); setMainView('calculator'); }} className="bg-indigo-600 text-white font-bold py-4 px-8 rounded-lg">
                            {t('singleAnalysis', language)}
                        </button>
                        <button onClick={() => { setAnalysisMode('group'); setMainView('calculator'); }} className="bg-emerald-600 text-white font-bold py-4 px-8 rounded-lg">
                            {t('groupAnalysis', language)}
                        </button>
                    </div>
                </main>
            )}

            {mainView === 'calculator' && (
                <main className="bg-white p-6 rounded-xl shadow-lg">
                    {analysisMode === 'group' && (
                        <div className="mb-6 flex gap-2 overflow-x-auto pb-2 border-b">
                            {analyses.map((a, i) => (
                                <button key={i} onClick={() => setActiveAnalysisIndex(i)} className={`py-2 px-4 rounded-t-lg text-sm font-semibold ${activeAnalysisIndex === i ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-200'}`}>
                                    {a.fieldName || t('analysisTab', language, { index: i + 1 })}
                                </button>
                            ))}
                            <button onClick={() => setAnalyses([...analyses, {...INITIAL_FORM_DATA}])} className="text-indigo-600 font-bold px-4">+</button>
                        </div>
                    )}
                    <Stepper currentStep={currentStep} steps={[t('step1', language), t('step2', language), t('step3', language), t('step4', language)]} />
                    <div className="mt-8">
                        {currentStep === 1 && <Step1SoilAnalysis onNext={handleNext} onBack={() => setMainView('landing')} data={currentFormData} onDataChange={updateCurrentAnalysis} lang={language} />}
                        {currentStep === 2 && <Step2CropYield onBack={handleBack} onCalculate={analysisMode === 'single' ? handleCalculate : handleCalculateAll} data={currentFormData} onDataChange={updateCurrentAnalysis} isGroupMode={analysisMode === 'group'} isCalculationDisabled={false} lang={language} />}
                        {currentStep === 3 && <Step3CalculationChoice onBack={handleBack} onSelect={handleSelectCalculation} lang={language} />}
                        {currentStep === 4 && (results || groupResults[activeAnalysisIndex]) && calculationType && (
                            <Step4Results 
                                onReset={handleReset} onBack={handleBack} results={(analysisMode === 'single' ? results : groupResults[activeAnalysisIndex])!}
                                type={calculationType!} formData={currentFormData} cultureParams={CULTURE_PARAMS[currentFormData.culture]}
                                onSaveToHistory={handleSaveToHistory} onSaveDownload={handleSaveDownload} 
                                springFertilizer={analysisMode === 'single' ? springFertilizer : (groupFertilizerSelections[activeAnalysisIndex]?.springFertilizer || createInitialSpringFertilizer())}
                                setSpringFertilizer={analysisMode === 'single' ? setSpringFertilizer : (val) => setGroupFertilizerSelections(prev => { const next = [...prev]; next[activeAnalysisIndex].springFertilizer = typeof val === 'function' ? (val as any)(next[activeAnalysisIndex].springFertilizer) : val; return next; })}
                                nitrogenFertilizer={analysisMode === 'single' ? nitrogenFertilizer : (groupFertilizerSelections[activeAnalysisIndex]?.nitrogenFertilizer || 'ammonium-nitrate')}
                                setNitrogenFertilizer={analysisMode === 'single' ? setNitrogenFertilizer : (val) => setGroupFertilizerSelections(prev => { const next = [...prev]; next[activeAnalysisIndex].nitrogenFertilizer = typeof val === 'function' ? (val as any)(next[activeAnalysisIndex].nitrogenFertilizer) : val; return next; })}
                                basicFertilizers={analysisMode === 'single' ? basicFertilizers : (groupFertilizerSelections[activeAnalysisIndex]?.basicFertilizers || {})}
                                setBasicFertilizers={analysisMode === 'single' ? setBasicFertilizers : (val) => setGroupFertilizerSelections(prev => { const next = [...prev]; next[activeAnalysisIndex].basicFertilizers = typeof val === 'function' ? (val as any)(next[activeAnalysisIndex].basicFertilizers) : val; return next; })}
                                selectedAmendment={analysisMode === 'single' ? selectedAmendment : (groupFertilizerSelections[activeAnalysisIndex]?.selectedAmendment || '')}
                                setSelectedAmendment={analysisMode === 'single' ? setSelectedAmendment : (val) => setGroupFertilizerSelections(prev => { const next = [...prev]; next[activeAnalysisIndex].selectedAmendment = typeof val === 'function' ? (val as any)(next[activeAnalysisIndex].selectedAmendment) : val; return next; })}
                                complexFertilizer={analysisMode === 'single' ? complexFertilizer : (groupFertilizerSelections[activeAnalysisIndex]?.complexFertilizer || createInitialComplexFertilizer())}
                                setComplexFertilizer={analysisMode === 'single' ? setComplexFertilizer : (val) => setGroupFertilizerSelections(prev => { const next = [...prev]; next[activeAnalysisIndex].complexFertilizer = typeof val === 'function' ? (val as any)(next[activeAnalysisIndex].complexFertilizer) : val; return next; })}
                                springFertilizerRate={analysisMode === 'single' ? springFertilizerRate : (groupFertilizerSelections[activeAnalysisIndex]?.springFertilizerRate || null)}
                                setSpringFertilizerRate={analysisMode === 'single' ? setSpringFertilizerRate : (val) => setGroupFertilizerSelections(prev => { const next = [...prev]; next[activeAnalysisIndex].springFertilizerRate = typeof val === 'function' ? (val as any)(next[activeAnalysisIndex].springFertilizerRate) : val; return next; })}
                                isGroupMode={analysisMode === 'group'} onSaveAllTxt={() => {}} lang={language}
                                onRecord={handleRecordCalculation} onOpenSaveModal={handleOpenSaveModal} onContinue={handleContinue} recordedIndices={recordedIndices} activeAnalysisIndex={activeAnalysisIndex}
                           />
                        )}
                    </div>
                </main>
            )}

            {mainView === 'reports' && (
                selectedReport ? <ReportDetail report={selectedReport} onBack={() => setSelectedReport(null)} onEdit={handleEditReport} lang={language} /> :
                <ReportsList reports={reports} onView={setSelectedReport} onDelete={id => setReports(reports.filter(r => r.id !== id))} onNewCalculation={handleReset} onLoadReport={() => reportInputRef.current?.click()} lang={language} />
            )}
            
            <footer className="text-center mt-12 text-slate-500 text-sm">
                <p>{t('footerText', language, { year: new Date().getFullYear() })}</p>
            </footer>
        </div>
    );
}

export default App;
