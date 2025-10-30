import React from 'react';

interface StepperProps {
    currentStep: number;
    steps: string[];
}

export const Stepper: React.FC<StepperProps> = ({ currentStep, steps }) => {
    return (
        <div className="flex justify-center items-center">
            {steps.map((step, index) => {
                const stepNumber = index + 1;
                const isActive = stepNumber === currentStep;
                const isCompleted = stepNumber < currentStep;

                return (
                    <React.Fragment key={step}>
                        <div className="flex flex-col items-center">
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold transition-colors duration-300 ${
                                    isActive
                                        ? 'bg-indigo-600 text-white'
                                        : isCompleted
                                        ? 'bg-emerald-500 text-white'
                                        : 'bg-slate-200 text-slate-500'
                                }`}
                            >
                                {isCompleted ? '✓' : stepNumber}
                            </div>
                            <p className={`mt-2 text-sm text-center hidden md:block ${isActive ? 'text-indigo-600 font-semibold' : 'text-slate-500'}`}>
                                {step}
                            </p>
                        </div>
                        {stepNumber < steps.length && (
                             <div className={`flex-1 h-1 mx-2 md:mx-4 transition-colors duration-300 ${isCompleted ? 'bg-emerald-500' : 'bg-slate-200'}`}></div>
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
};