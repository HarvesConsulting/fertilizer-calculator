import React from 'react';
import type { SavedReport } from '../types';

interface ReportsListProps {
    reports: SavedReport[];
    onView: (report: SavedReport) => void;
    onDelete: (id: string) => void;
    onNewCalculation: () => void;
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

export const ReportsList: React.FC<ReportsListProps> = ({ reports, onView, onDelete, onNewCalculation }) => {

    if (reports.length === 0) {
        return (
            <div className="text-center bg-white dark:bg-gray-800 p-8 md:p-16 rounded-xl shadow-lg">
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Збережених звітів немає</h2>
                <p className="mt-4 text-gray-600 dark:text-gray-400">
                    У вас ще немає збережених розрахунків. Створіть свій перший!
                </p>
                <button
                    onClick={onNewCalculation}
                    className="mt-8 bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition duration-300 shadow-lg text-lg"
                >
                    Почати новий розрахунок
                </button>
            </div>
        );
    }
    
    return (
        <div className="bg-white dark:bg-gray-800 p-4 md:p-8 rounded-xl shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 border-b dark:border-gray-700 pb-4 mb-6">Мої звіти</h2>
            <div className="space-y-4">
                {reports.map(report => (
                    <div key={report.id} className="p-4 border dark:border-gray-700 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <div className="flex-grow">
                            <h3 className="font-bold text-lg text-blue-700 dark:text-blue-400">{report.formData.culture}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Врожайність: {report.formData.plannedYield} т/га
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                Збережено: {formatDate(report.timestamp)}
                            </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 w-full md:w-auto">
                            <button
                                onClick={() => onView(report)}
                                className="w-full md:w-auto flex-1 bg-blue-100 text-blue-700 dark:bg-blue-900/70 dark:text-blue-300 font-semibold py-2 px-4 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800/70 transition"
                            >
                                Переглянути
                            </button>
                            <button
                                onClick={() => onDelete(report.id)}
                                className="w-auto bg-red-100 text-red-700 dark:bg-red-900/70 dark:text-red-300 p-2 rounded-lg hover:bg-red-200 dark:hover:bg-red-800/70 transition"
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
