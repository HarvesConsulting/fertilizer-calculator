import React from 'react';

interface StyledSelectFieldProps {
    label: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    options: { value: string; label: string }[];
    placeholder: string;
    disabled?: boolean;
}

export const StyledSelectField: React.FC<StyledSelectFieldProps> = ({
    label,
    name,
    value,
    onChange,
    options,
    placeholder,
    disabled = false
}) => {
    return (
        <div className="relative">
             <label htmlFor={name} className="absolute text-sm text-slate-500 bg-slate-50 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] px-2 peer-focus:px-2 peer-focus:text-indigo-600 start-1">
                {label}
            </label>
            <select
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                disabled={disabled}
                className="block w-full px-4 py-3 text-slate-900 bg-slate-50 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-0 focus:border-indigo-600 peer disabled:bg-slate-100"
            >
                <option value="">{placeholder}</option>
                {options.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                ))}
            </select>
        </div>
    );
};