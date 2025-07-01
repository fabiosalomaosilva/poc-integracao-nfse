'use client';

import { AutocompleteField } from './AutocompleteField';
import { useMunicipios, usePaises, useServicos } from '../../hooks/useAutocompleteData';

interface AutocompleteFieldBaseProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  help?: string;
  className?: string;
}

// Campo de autocomplete para municípios
export function MunicipioAutocompleteField({
  label,
  name,
  value,
  onChange,
  placeholder = "Digite o nome do município ou código IBGE...",
  required = false,
  error,
  help,
  className = ''
}: AutocompleteFieldBaseProps) {
  const { municipios, loading, error: loadError } = useMunicipios();

  if (loading) {
    return (
      <div className={`space-y-1 ${className}`}>
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <div className="animate-pulse bg-gray-200 h-10 rounded-md"></div>
        <p className="text-xs text-gray-500">Carregando municípios...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className={`space-y-1 ${className}`}>
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
        <p className="text-xs text-red-600">Erro ao carregar municípios. Use o código IBGE diretamente.</p>
      </div>
    );
  }

  const options = municipios.map(municipio => ({
    value: municipio.Codigo,
    label: `${municipio.Municipio} - ${municipio.Uf}`,
    secondary: `${municipio.Estado}`
  }));

  return (
    <AutocompleteField
      label={label}
      name={name}
      value={value}
      onChange={onChange}
      options={options}
      placeholder={placeholder}
      required={required}
      error={error}
      help={help || "Digite o nome do município, UF ou código IBGE"}
      className={className}
      maxResults={15}
      searchFields={['value', 'label', 'secondary']}
    />
  );
}

// Campo de autocomplete para países
export function PaisAutocompleteField({
  label,
  name,
  value,
  onChange,
  placeholder = "Digite o nome do país ou código...",
  required = false,
  error,
  help,
  className = ''
}: AutocompleteFieldBaseProps) {
  const { paises, loading, error: loadError } = usePaises();

  if (loading) {
    return (
      <div className={`space-y-1 ${className}`}>
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <div className="animate-pulse bg-gray-200 h-10 rounded-md"></div>
        <p className="text-xs text-gray-500">Carregando países...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className={`space-y-1 ${className}`}>
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
        <p className="text-xs text-red-600">Erro ao carregar países. Use o código ISO diretamente.</p>
      </div>
    );
  }

  const options = paises.map(pais => ({
    value: pais.Codigo,
    label: pais.Nome,
    secondary: `Código: ${pais.Codigo}`
  }));

  return (
    <AutocompleteField
      label={label}
      name={name}
      value={value}
      onChange={onChange}
      options={options}
      placeholder={placeholder}
      required={required}
      error={error}
      help={help || "Digite o nome do país ou código ISO"}
      className={className}
      maxResults={10}
      searchFields={['value', 'label']}
    />
  );
}

// Campo de autocomplete para serviços
export function ServicoAutocompleteField({
  label,
  name,
  value,
  onChange,
  placeholder = "Digite o código ou descrição do serviço...",
  required = false,
  error,
  help,
  className = ''
}: AutocompleteFieldBaseProps) {
  const { servicos, loading, error: loadError } = useServicos();

  if (loading) {
    return (
      <div className={`space-y-1 ${className}`}>
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <div className="animate-pulse bg-gray-200 h-10 rounded-md"></div>
        <p className="text-xs text-gray-500">Carregando itens de serviço...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className={`space-y-1 ${className}`}>
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
        <p className="text-xs text-red-600">Erro ao carregar serviços. Use o código LC 116/03 diretamente.</p>
      </div>
    );
  }

  const options = servicos.map(servico => ({
    value: servico.codigo,
    label: servico.descricao,
    secondary: `Código: ${servico.codigo}`
  }));

  return (
    <AutocompleteField
      label={label}
      name={name}
      value={value}
      onChange={onChange}
      options={options}
      placeholder={placeholder}
      required={required}
      error={error}
      help={help || "Digite o código LC 116/03 ou descrição do serviço"}
      className={className}
      maxResults={20}
      searchFields={['value', 'label']}
    />
  );
}