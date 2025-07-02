'use client';

import { generateTestDataPJ, generateTestDataPF } from '../../utils/testDataGenerator';

interface InputFieldWithTestButtonProps {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'tel' | 'number' | 'date' | 'datetime-local';
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  min?: string | number;
  max?: string | number;
  step?: string | number;
  required?: boolean;
  error?: string;
  help?: string;
  className?: string;
  testButtonType?: 'cnpj' | 'cpf';
  onTestDataGenerated?: (data: any) => void;
}

export function InputFieldWithTestButton({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  maxLength,
  min,
  max,
  step,
  required = false,
  error,
  help,
  className = '',
  testButtonType,
  onTestDataGenerated
}: InputFieldWithTestButtonProps) {
  
  const handleGenerateTestData = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Prevenir completamente qualquer comportamento de formulário
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    
    if (!testButtonType || !onTestDataGenerated) return;

    // Usar setTimeout para garantir que a ação ocorre depois do evento
    setTimeout(() => {
      try {
        if (testButtonType === 'cnpj') {
          const testData = generateTestDataPJ();
          onChange(testData.cnpj);
          onTestDataGenerated({
            type: 'pj',
            cnpj: testData.cnpj,
            razaoSocial: testData.razaoSocial,
            nomeFantasia: testData.nomeFantasia,
            inscricaoMunicipal: testData.inscricaoMunicipal
          });
        } else if (testButtonType === 'cpf') {
          const testData = generateTestDataPF();
          onChange(testData.cpf);
          onTestDataGenerated({
            type: 'pf',
            cpf: testData.cpf,
            nomeCompleto: testData.nomeCompleto,
            inscricaoMunicipal: testData.inscricaoMunicipal
          });
        }
      } catch (error) {
        console.error('Error generating test data:', error);
      }
    }, 0);
  };

  return (
    <div className={`space-y-1 ${className}`}>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="relative flex">
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          min={min}
          max={max}
          step={step}
          className={`
            flex-1 px-3 py-2 border border-gray-300 rounded-l-md shadow-sm placeholder-gray-500 text-gray-900
            focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
            disabled:bg-gray-50 disabled:text-gray-500
            ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}
            ${testButtonType ? 'rounded-r-none' : 'rounded-r-md'}
          `}
        />
        
        {testButtonType && onTestDataGenerated && (
          <button
            type="button"
            onClick={handleGenerateTestData}
            className="
              px-3 py-2 bg-green-100 border border-l-0 border-gray-300 rounded-r-md
              text-green-800 hover:bg-green-200 focus:outline-none focus:ring-1 
              focus:ring-green-500 focus:border-green-500 transition-colors
              text-xs font-medium min-w-[60px]
            "
            title={`Gerar ${testButtonType.toUpperCase()} válido para teste`}
          >
            <div className="flex items-center justify-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Teste
            </div>
          </button>
        )}
      </div>

      {help && (
        <p className="text-xs text-gray-600">
          {help}
          {testButtonType && (
            <span className="block mt-1 text-green-700 font-medium">
              💡 Use o botão "Teste" para gerar {testButtonType.toUpperCase()} válido automaticamente
            </span>
          )}
        </p>
      )}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}