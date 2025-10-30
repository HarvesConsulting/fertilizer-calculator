import React from 'react';
import { Tooltip } from './Tooltip';
import { InfoIcon } from './InfoIcon';

interface StyledFormFieldProps {
    label: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    unit: string;
    type?: string;
    step?: string;
    min?: string;
    max?: string;
    disabled?: boolean;
    tooltipText?: string;
}

export const StyledFormField: React.FC<StyledFormFieldProps> = ({
    label,
    name,
    value,
    onChange,
    unit,
    type = 'number',
    step = "0.1",
    min = "0",
    max,
    disabled = false,
    tooltipText,
}) => {
    return (
        <div className="relative group">
            <input
                type={type}
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                step={step}
                min={min}
                max={max}
                disabled={disabled}
                className="block w-full px-4 py-3 text-slate-900 bg-slate-50 border-2 border-slate-200 rounded-lg appearance-none focus:outline-none focus:ring-0 focus:border-indigo-600 peer disabled:bg-slate-200 disabled:cursor-not-allowed disabled:text-slate-500"
                placeholder=" "
                required
            />
            <label
                htmlFor={name}
                className="absolute text-slate-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-slate-50 px-2 peer-focus:px-2 peer-focus:text-indigo-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1"
            >
                <span className="flex items-center gap-1.5">
                    {label}
                    {tooltipText && (
                        <Tooltip text={tooltipText}>
                             <InfoIcon className="h-4 w-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                        </Tooltip>
                    )}
                </span>
            </label>
            <div className="absolute inset-y-0 right-0 flex items-center pr-1 pointer-events-none">
                <span className="h-[calc(100%-2px)] flex items-center px-3 bg-slate-100 border-l-2 border-slate-200 text-slate-600 text-sm rounded-r-md group-focus-within:border-indigo-600">
                    {unit}
                </span>
            </div>
        </div>
    );
};
