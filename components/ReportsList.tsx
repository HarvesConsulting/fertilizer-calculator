import React from 'react';
import type { SavedReport } from '../types';

interface ReportsListProps {
    reports: SavedReport[];
    onView: (report: SavedReport) => void;
    onDelete: (id: string) => void;
    onNewCalculation: () => void;
    onBack: () => void;
    onLoadReport: () => void;
}

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('uk-UA', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

export const ReportsList: React.FC<ReportsListProps> = ({ reports, onView, onDelete, onNewCalculation, onBack, onLoadReport }) => {

    if (reports.length === 0) {
        return (
            <div className="text-center bg-white p-8 md:p-16 rounded-xl shadow-lg">
                <h2 className="text-2xl font-semibold text-slate-800">Збережених звітів немає</h2>
                <p className="mt-4 text-slate-600">
                    Створіть свій перший розрахунок або завантажте існуючий звіт.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
                    <button
                        onClick={onNewCalculation}
                        className="bg-indigo-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-indigo-700 transition duration-300 shadow-lg text-lg"
                    >
                        Почати новий розрахунок
                    </button>
                     <button
                        onClick={onLoadReport}
                        className="bg-emerald-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-emerald-700 transition duration-300 shadow-lg"
                    >
                        Завантажити звіт
                    </button>
                </div>
            </div>
        );
    }
    
    return (
        <div className="bg-white p-4 md:p-8 rounded-xl shadow-lg">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4 mb-6 gap-4">
                <h2 className="text-2xl font-semibold text-slate-800">Мої звіти</h2>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <button
                        onClick={onLoadReport}
                        className="w-full sm:w-auto bg-emerald-100 text-emerald-800 font-semibold py-2 px-4 rounded-lg hover:bg-emerald-200 transition flex items-center justify-center gap-2"
                        title="Завантажити звіт з файлу"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        <span>Завантажити</span>
                    </button>
                    <button
                        onClick={onBack}
                        className="w-full sm:w-auto bg-slate-200 text-slate-800 font-semibold py-2 px-4 rounded-lg hover:bg-slate-300 transition flex items-center justify-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span>До калькулятора</span>
                    </button>
                </div>
            </div>
            <div className="space-y-4">
                {reports.map(report => (
                    <div key={report.id} className="p-4 border rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-slate-50 transition-colors">
                        <div className="flex-grow">
                            <h3 className="font-bold text-lg text-indigo-700">{report.formData.culture}</h3>
                            <p className="text-sm text-slate-600">
                                Врожайність: {report.formData.plannedYield} т/га
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                                Збережено: {formatDate(report.timestamp)}
                            </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 w-full md:w-auto">
                            <button
                                onClick={() => onView(report)}
                                className="w-full md:w-auto flex-1 bg-indigo-100 text-indigo-700 font-semibold py-2 px-4 rounded-lg hover:bg-indigo-200 transition"
                            >
                                Переглянути
                            </button>
                            <button
                                onClick={() => onDelete(report.id)}
                                className="w-auto bg-red-100 text-red-700 p-2 rounded-lg hover:bg-red-200 transition"
                                aria-label="Видалити звіт"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};