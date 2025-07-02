'use client';

import { useCallback, useState, useRef, useEffect, memo } from 'react';

interface StableNumericFieldProps {
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

export const StableNumericField = memo(function StableNumericField({
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
}: StableNumericFieldProps) {
  const [displayValue, setDisplayValue] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);
  const isTypingRef = useRef(false);

  // Inicializar display value
  useEffect(() => {
    if (!isTypingRef.current && document.activeElement !== inputRef.current) {
      const newValue = value !== undefined ? value.toString() : '';
      setDisplayValue(newValue);
    }
  }, [value]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value;
    
    // Permitir apenas números, ponto decimal e sinal negativo
    inputValue = inputValue.replace(/[^0-9.-]/g, '');
    
    // Garantir apenas um ponto decimal
    const parts = inputValue.split('.');
    if (parts.length > 2) {
      inputValue = parts[0] + '.' + parts.slice(1).join('');
    }
    
    // Garantir apenas um sinal negativo no início
    if (inputValue.includes('-')) {
      const negative = inputValue.charAt(0) === '-';
      inputValue = inputValue.replace(/-/g, '');
      if (negative) inputValue = '-' + inputValue;
    }
    
    // Aplicar restrição de mínimo se positivo obrigatório
    if (min >= 0 && inputValue.startsWith('-')) {
      inputValue = inputValue.substring(1);
    }

    setDisplayValue(inputValue);
    isTypingRef.current = true;

    // Debounce para notificar mudança
    setTimeout(() => {
      if (inputValue === '' || inputValue === '-') {
        onChange(undefined);
      } else {
        const numValue = parseFloat(inputValue);
        if (!isNaN(numValue)) {
          // Aplicar restrições de min/max
          let finalValue = numValue;
          if (min !== undefined && finalValue < min) finalValue = min;
          if (max !== undefined && finalValue > max) finalValue = max;
          onChange(finalValue);
        }
      }
      isTypingRef.current = false;
    }, 100);
  }, [onChange, min, max]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    // Permitir teclas de navegação e edição
    const allowedKeys = [
      'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
      'Home', 'End', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'
    ];
    
    if (allowedKeys.includes(e.key)) {
      return;
    }

    // Permitir Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
    if (e.ctrlKey || e.metaKey) {
      return;
    }

    // Permitir números
    if (/^[0-9]$/.test(e.key)) {
      return;
    }

    // Permitir ponto decimal (apenas um)
    if (e.key === '.' && !displayValue.includes('.')) {
      return;
    }

    // Permitir sinal negativo apenas no início e se min permite
    if (e.key === '-' && displayValue.length === 0 && (min === undefined || min < 0)) {
      return;
    }

    // Bloquear outras teclas
    e.preventDefault();
  }, [displayValue, min]);

  const handleBlur = useCallback(() => {
    isTypingRef.current = false;
    
    // Formatar valor no blur
    if (displayValue && !isNaN(parseFloat(displayValue))) {
      const numValue = parseFloat(displayValue);
      let formattedValue = numValue;
      
      // Aplicar restrições
      if (min !== undefined && formattedValue < min) formattedValue = min;
      if (max !== undefined && formattedValue > max) formattedValue = max;
      
      // Formatar decimais
      const formatted = decimals > 0 
        ? formattedValue.toFixed(decimals)
        : Math.round(formattedValue).toString();
      
      setDisplayValue(formatted);
      
      // Notificar se valor mudou
      if (formattedValue !== parseFloat(displayValue)) {
        onChange(formattedValue);
      }
    }
  }, [displayValue, min, max, decimals, onChange]);

  const handleFocus = useCallback(() => {
    isTypingRef.current = true;
  }, []);

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
        value={displayValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        onFocus={handleFocus}
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