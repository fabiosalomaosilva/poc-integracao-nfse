'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface AutocompleteOption {
  value: string;
  label: string;
  secondary?: string; // Para informações adicionais como UF, etc.
}

interface AutocompleteFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: AutocompleteOption[];
  placeholder?: string;
  required?: boolean;
  error?: string;
  help?: string;
  className?: string;
  maxResults?: number;
  searchFields?: string[]; // Campos para busca (default: value, label)
}

export function AutocompleteField({
  label,
  name,
  value,
  onChange,
  options,
  placeholder,
  required = false,
  error,
  help,
  className = '',
  maxResults = 10,
  searchFields = ['value', 'label']
}: AutocompleteFieldProps) {
  const [inputValue, setInputValue] = useState('');
  const [filteredOptions, setFilteredOptions] = useState<AutocompleteOption[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sincronizar inputValue com value prop (sem abrir dropdown)
  useEffect(() => {
    if (value) {
      setInputValue(value);
    } else {
      setInputValue('');
    }
    // Reset do estado de interação quando o valor muda externamente
    setHasUserInteracted(false);
  }, [value]);

  // Filtrar opções baseado no input (só abre se usuário interagiu)
  useEffect(() => {
    if (!inputValue.trim()) {
      setFilteredOptions([]);
      setIsOpen(false);
      return;
    }

    const searchTerm = inputValue.toLowerCase();
    const filtered = options.filter(option => {
      return searchFields.some(field => {
        const fieldValue = option[field as keyof AutocompleteOption];
        return fieldValue && String(fieldValue).toLowerCase().includes(searchTerm);
      });
    }).slice(0, maxResults);

    setFilteredOptions(filtered);
    // Só abre o dropdown se o usuário interagiu (digitou ou deu foco)
    setIsOpen(hasUserInteracted && filtered.length > 0);
    setSelectedIndex(-1);
  }, [inputValue, options, searchFields, maxResults, hasUserInteracted]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setHasUserInteracted(true); // Marcar que o usuário interagiu

    // Se o input está vazio, limpar o valor
    if (!newValue.trim()) {
      onChange('');
    }
  };

  const closeDropdown = useCallback(() => {
    setIsOpen(false);
    setSelectedIndex(-1);
  }, []);

  const handleOptionSelect = (option: AutocompleteOption) => {
    setInputValue(option.value);
    onChange(option.value);
    closeDropdown();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev < filteredOptions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : prev);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && filteredOptions[selectedIndex]) {
          handleOptionSelect(filteredOptions[selectedIndex]);
        }
        break;
      case 'Escape':
        closeDropdown();
        break;
    }
  };

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        closeDropdown();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen, closeDropdown]);

  const handleFocus = () => {
    setHasUserInteracted(true); // Marcar que o usuário interagiu
    if (inputValue.trim() && filteredOptions.length > 0) {
      setIsOpen(true);
    }
  };

  return (
    <div ref={containerRef} className={`relative space-y-1 ${className}`}>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div className="relative">
        <input
          ref={inputRef}
          id={name}
          name={name}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          placeholder={placeholder}
          autoComplete="off"
          className={`
            w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-500 text-gray-900
            focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
            disabled:bg-gray-50 disabled:text-gray-500
            ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}
          `}
        />

        {/* Dropdown com opções */}
        {isOpen && filteredOptions.length > 0 && (
          <ul
            ref={listRef}
            className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
          >
            {filteredOptions.map((option, index) => (
              <li
                key={option.value}
                onClick={() => handleOptionSelect(option)}
                className={`
                  px-3 py-2 cursor-pointer border-b border-gray-100 last:border-b-0
                  ${index === selectedIndex
                    ? 'bg-blue-50 text-blue-700'
                    : 'hover:bg-gray-50'
                  }
                `}
              >
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <div className="font-medium text-sm text-gray-700">{option.label}</div>
                    {option.secondary && (
                      <div className="text-xs text-gray-500">{option.secondary}</div>
                    )}
                  </div>
                  <div className="ml-2 text-xs text-gray-400 font-mono">
                    {option.value}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {help && <p className="text-xs text-gray-500">{help}</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}

      {/* Indicador de resultados */}
      {inputValue.trim() && isOpen && (
        <p className="text-xs text-gray-400">
          {filteredOptions.length} resultado{filteredOptions.length !== 1 ? 's' : ''} encontrado{filteredOptions.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
}