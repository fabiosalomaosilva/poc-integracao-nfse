'use client';

import { useState, useRef, useEffect, useCallback, memo } from 'react';

interface FocusStableNumericProps {
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
  decimals?: number;
  className?: string;
}

export const FocusStableNumeric = memo(function FocusStableNumeric({
  label,
  name,
  value,
  onChange,
  required = false,
  error,
  help,
  placeholder,
  min = 0,
  max,
  decimals = 2,
  className = ''
}: FocusStableNumericProps) {
  const [localValue, setLocalValue] = useState<string>('');
  const [hasFocus, setHasFocus] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const initializedRef = useRef(false);

  // Inicializar apenas uma vez
  useEffect(() => {
    if (!initializedRef.current) {
      const initValue = value !== undefined ? value.toString() : '';
      setLocalValue(initValue);
      initializedRef.current = true;
    }
  }, [value]);

  // Sincronizar apenas quando não tem foco E valor externo mudou
  useEffect(() => {
    if (!hasFocus && initializedRef.current) {
      const externalValue = value !== undefined ? value.toString() : '';
      if (externalValue !== localValue) {
        setLocalValue(externalValue);
      }
    }
  }, [value, hasFocus, localValue]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Filtrar apenas números, ponto e sinal negativo
    const filteredValue = inputValue.replace(/[^0-9.-]/g, '');
    
    // Garantir apenas um ponto decimal
    const parts = filteredValue.split('.');
    let cleanValue = parts[0];
    if (parts.length > 1) {
      cleanValue += '.' + parts.slice(1).join('');
    }
    
    // Garantir apenas um sinal negativo no início
    if (cleanValue.includes('-')) {
      const isNegative = cleanValue.charAt(0) === '-';
      cleanValue = cleanValue.replace(/-/g, '');
      if (isNegative && (min === undefined || min < 0)) {
        cleanValue = '-' + cleanValue;
      }
    }
    
    // Aplicar restrição de mínimo se não permite negativo
    if (min >= 0 && cleanValue.startsWith('-')) {
      cleanValue = cleanValue.substring(1);
    }

    setLocalValue(cleanValue);
    
    // NÃO chamar onChange aqui - apenas no blur ou Enter
  }, [min]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Permitir teclas de controle
    if ([
      'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
      'Home', 'End', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'
    ].includes(e.key)) {
      if (e.key === 'Enter') {
        inputRef.current?.blur(); // Trigger blur para salvar
      }
      return;
    }

    // Permitir Ctrl/Cmd + teclas
    if (e.ctrlKey || e.metaKey) {
      return;
    }

    // Permitir números
    if (/^[0-9]$/.test(e.key)) {
      return;
    }

    // Permitir ponto decimal (apenas um)
    if (e.key === '.' && !localValue.includes('.')) {
      return;
    }

    // Permitir sinal negativo apenas no início
    if (e.key === '-' && localValue.length === 0 && (min === undefined || min < 0)) {
      return;
    }

    // Bloquear outras teclas
    e.preventDefault();
  }, [localValue, min]);

  const processValue = useCallback(() => {
    if (localValue === '' || localValue === '-') {
      onChange(undefined);
      return;
    }

    const numValue = parseFloat(localValue);
    if (isNaN(numValue)) {
      onChange(undefined);
      return;
    }

    let finalValue = numValue;
    
    // Aplicar restrições
    if (min !== undefined && finalValue < min) finalValue = min;
    if (max !== undefined && finalValue > max) finalValue = max;
    
    onChange(finalValue);
    
    // Formatar display
    if (decimals > 0) {
      setLocalValue(finalValue.toFixed(decimals));
    } else {
      setLocalValue(Math.round(finalValue).toString());
    }
  }, [localValue, onChange, min, max, decimals]);

  const handleFocus = useCallback(() => {
    setHasFocus(true);
  }, []);

  const handleBlur = useCallback(() => {
    setHasFocus(false);
    processValue();
  }, [processValue]);

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
        inputMode="decimal"
        value={localValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
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