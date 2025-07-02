'use client';

import { useCallback, useState, useRef, useEffect, memo } from 'react';

interface NumericFieldProps {
  label: string;
  name: string;
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  required?: boolean;
  error?: string;
  help?: string;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  decimals?: number;
  className?: string;
}

export const NumericField = memo(function NumericField({
  label,
  name,
  value,
  onChange,
  required = false,
  error,
  help,
  placeholder,
  min,
  max,
  step = 0.01,
  decimals = 2,
  className = ''
}: NumericFieldProps) {
  // Estado interno para o valor string - inicializa apenas uma vez
  const [internalValue, setInternalValue] = useState<string>('');
  const [initialized, setInitialized] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const preventSync = useRef(false);

  // Inicialização controlada
  useEffect(() => {
    if (!initialized) {
      const initValue = value !== undefined ? value.toString() : '';
      setInternalValue(initValue);
      setInitialized(true);
    }
  }, [value, initialized]);

  // Evitar sincronização quando o usuário está digitando
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const stringValue = e.target.value;
    preventSync.current = true;
    setInternalValue(stringValue);

    // Debounce para evitar muitas chamadas onChange
    setTimeout(() => {
      // Converter para número apenas quando necessário
      if (stringValue === '') {
        onChange(undefined);
      } else {
        const numValue = parseFloat(stringValue);
        if (!isNaN(numValue)) {
          onChange(numValue);
        }
      }
      preventSync.current = false;
    }, 0);
  }, [onChange]);

  const handleBlur = useCallback(() => {
    preventSync.current = false;
    // Formatar o valor no blur se for um número válido
    if (internalValue !== '' && !isNaN(parseFloat(internalValue))) {
      const numValue = parseFloat(internalValue);
      if (decimals > 0) {
        setInternalValue(numValue.toFixed(decimals));
      } else {
        setInternalValue(Math.round(numValue).toString());
      }
    }
  }, [internalValue, decimals]);

  const handleFocus = useCallback(() => {
    preventSync.current = true;
  }, []);

  // Sincronizar apenas quando necessário e não estiver em foco
  useEffect(() => {
    if (initialized && !preventSync.current && document.activeElement !== inputRef.current) {
      const newStringValue = value !== undefined ? value.toString() : '';
      if (newStringValue !== internalValue) {
        setInternalValue(newStringValue);
      }
    }
  }, [value, internalValue, initialized]);

  if (!initialized) return null;

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
        type="number"
        value={internalValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        className={`
          w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-500 text-gray-900
          focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
          disabled:bg-gray-50 disabled:text-gray-500
          ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}
        `}
      />
      {help && <p className="text-xs text-gray-500">{help}</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
});