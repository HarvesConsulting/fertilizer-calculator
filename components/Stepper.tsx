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
                                        ? 'bg-blue-600 text-white'
                                        : isCompleted
                                        ? 'bg-green-500 text-white'
                                        : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                                }`}
                            >
                                {isCompleted ? '✓' : stepNumber}
                            </div>
                            <p className={`mt-2 text-sm text-center hidden md:block ${isActive ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-gray-500 dark:text-gray-400'}`}>
                                {step}
                            </p>
                        </div>
                        {stepNumber < steps.length && (
                             <div className={`flex-1 h-1 mx-2 md:mx-4 transition-colors duration-300 ${isCompleted ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
};