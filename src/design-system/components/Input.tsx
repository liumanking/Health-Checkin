import { useId, type InputHTMLAttributes } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = '', id, ...rest }: InputProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        className={`min-h-11 rounded-xl border border-gray-300 bg-white px-3 text-base text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 ${error ? 'border-red-400' : ''} ${className}`}
        {...rest}
      />
      {error && (
        <p role="alert" className="text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}
