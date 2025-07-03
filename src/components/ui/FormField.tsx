'use client';

interface BaseFieldProps {
  label: string;
  name: string;
  required?: boolean;
  error?: string;
  help?: string;
  className?: string;
}

interface InputFieldProps extends BaseFieldProps {
  type?: 'text' | 'email' | 'tel' | 'number' | 'date' | 'datetime-local';
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  min?: string | number;
  max?: string | number;
  step?: string | number;
}

interface SelectFieldProps extends BaseFieldProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string; disabled?: boolean }[];
  placeholder?: string;
}

interface TextAreaFieldProps extends BaseFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  maxLength?: number;
}

interface CheckboxFieldProps extends BaseFieldProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function InputField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  required = false,
  error,
  help,
  placeholder,
  maxLength,
  min,
  max,
  step,
  className = ''
}: InputFieldProps) {
  return (
    <div className={`space-y-1 ${className}`}>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
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
}

export function SelectField({
  label,
  name,
  value,
  onChange,
  options,
  required = false,
  error,
  help,
  placeholder,
  className = ''
}: SelectFieldProps) {
  return (
    <div className={`space-y-1 ${className}`}>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`
          w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900
          focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
          disabled:bg-gray-50 disabled:text-gray-500
          ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}
        `}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>
      {help && <p className="text-xs text-gray-600">{help}</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

export function TextAreaField({
  label,
  name,
  value,
  onChange,
  required = false,
  error,
  help,
  placeholder,
  rows = 3,
  maxLength,
  className = ''
}: TextAreaFieldProps) {
  return (
    <div className={`space-y-1 ${className}`}>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        className={`
          w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-500 text-gray-900
          focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
          disabled:bg-gray-50 disabled:text-gray-500 resize-vertical
          ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}
        `}
      />
      {maxLength && (
        <p className="text-xs text-gray-600">
          {value.length}/{maxLength} caracteres
        </p>
      )}
      {help && <p className="text-xs text-gray-600">{help}</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

export { AutocompleteField } from './AutocompleteField';

export function CheckboxField({
  label,
  name,
  checked,
  onChange,
  required = false,
  error,
  help,
  className = ''
}: CheckboxFieldProps) {
  return (
    <div className={`space-y-1 ${className}`}>
      <div className="flex items-center">
        <input
          id={name}
          name={name}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className={`
            h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded
            ${error ? 'border-red-300' : ''}
          `}
        />
        <label htmlFor={name} className="ml-2 block text-sm text-gray-800 font-medium">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      </div>
      {help && <p className="text-xs text-gray-600 mt-1">{help}</p>}
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}

interface FieldGroupProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function FieldGroup({ title, description, children, className = '' }: FieldGroupProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <h3 className="text-base font-medium text-gray-900">{title}</h3>
        {description && (
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        )}
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}