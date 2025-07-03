'use client';

import { useState, useRef, useEffect, useCallback, memo } from 'react';

interface FocusStableTextProps {
  label: string;
  name: string;
  value: string | undefined;
  onChange: (value: string) => void;
  required?: boolean;
  error?: string;
  help?: string;
  placeholder?: string;
  maxLength?: number;
  className?: string;
}

export const FocusStableText = memo(function FocusStableText({
  label,
  name,
  value,
  onChange,
  required = false,
  error,
  help,
  placeholder,
  maxLength,
  className = ''
}: FocusStableTextProps) {
  const [localValue, setLocalValue] = useState<string>('');
  const [hasFocus, setHasFocus] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const initializedRef = useRef(false);

  // Inicializar apenas uma vez
  useEffect(() => {
    if (!initializedRef.current) {
      const initValue = value || '';
      setLocalValue(initValue);
      initializedRef.current = true;
    }
  }, [value]);

  // Sincronizar apenas quando não tem foco E valor externo mudou
  useEffect(() => {
    if (!hasFocus && initializedRef.current) {
      const externalValue = value || '';
      if (externalValue !== localValue) {
        setLocalValue(externalValue);
      }
    }
  }, [value, hasFocus, localValue]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setLocalValue(inputValue);
    onChange(inputValue);
  }, [onChange]);

  const handleFocus = useCallback(() => {
    setHasFocus(true);
  }, []);

  const handleBlur = useCallback(() => {
    setHasFocus(false);
    // Sincronizar valor final
    onChange(localValue);
  }, [onChange, localValue]);

  return (
    <div className={`space-y-1 ${className}`}>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        ref={inputRef}
        id={name}
        name={name}
        type="text"
        value={localValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        maxLength={maxLength}
        className={`
          w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-600 text-gray-900
          focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
          disabled:bg-gray-50 disabled:text-gray-500
          ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}
        `}
      />
      {help && <p className="text-xs text-gray-600">{help}</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
});