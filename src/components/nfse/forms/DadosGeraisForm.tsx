'use client';

import { InputField, SelectField, FieldGroup } from '../../ui/FormField';
import { MunicipioAutocompleteField } from '../../ui/AutocompleteFields';
import { CompleteDPSData } from '../../../types/nfse/complete';

interface DadosGeraisFormProps {
  data: CompleteDPSData['infDPS'];
  onChange: (data: Partial<CompleteDPSData['infDPS']>) => void;
}

export default function DadosGeraisForm({ data, onChange }: DadosGeraisFormProps) {
  const updateField = (field: string, value: any) => {
    onChange({ [field]: value });
  };

  const tipoAmbienteOptions = [
    { value: '1', label: 'Produção' },
    { value: '2', label: 'Homologação' }
  ];

  const tipoEmitenteOptions = [
    { value: '1', label: 'Prestador' },
    { value: '2', label: 'Tomador' },
    { value: '3', label: 'Intermediário' }
  ];

  return (
    <div className="space-y-8">
      <FieldGroup
        title="Identificação da DPS"
        description="Dados básicos da Declaração de Prestação de Serviços"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <InputField
            label="ID da DPS"
            name="id"
            value={data.Id}
            onChange={(value) => updateField('Id', value)}
            placeholder="Ex: DPS001"
            help="Identificador único da DPS"
          />
          
          <InputField
            label="Série"
            name="serie"
            value={data.serie || ''}
            onChange={(value) => updateField('serie', value)}
            placeholder="Ex: 00001"
            help="Série da DPS (5 dígitos)"
            maxLength={5}
          />
          
          <InputField
            label="Número da DPS"
            name="nDPS"
            type="number"
            value={data.nDPS}
            onChange={(value) => updateField('nDPS', value)}
            required
            help="Número sequencial da DPS"
            min="1"
          />
        </div>
      </FieldGroup>

      <FieldGroup
        title="Ambiente e Emissão"
        description="Configurações do ambiente e tipo de emissão"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <SelectField
            label="Tipo de Ambiente"
            name="tpAmb"
            value={data.tpAmb}
            onChange={(value) => updateField('tpAmb', value)}
            options={tipoAmbienteOptions}
            required
            help="Ambiente de emissão da DPS"
          />
          
          <SelectField
            label="Tipo de Emitente"
            name="tpEmit"
            value={data.tpEmit}
            onChange={(value) => updateField('tpEmit', value)}
            options={tipoEmitenteOptions}
            required
            help="Quem está emitindo a DPS"
          />
          
          <InputField
            label="Versão da Aplicação"
            name="verAplic"
            value={data.verAplic}
            onChange={(value) => updateField('verAplic', value)}
            required
            help="Versão do software emissor"
            placeholder="Ex: 1.00"
          />
        </div>
      </FieldGroup>

      <FieldGroup
        title="Datas e Local"
        description="Informações de data/hora e localização"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <InputField
            label="Data/Hora de Emissão"
            name="dhEmi"
            type="datetime-local"
            value={data.dhEmi ? data.dhEmi.substring(0, 16) : ''}
            onChange={(value) => updateField('dhEmi', new Date(value).toISOString())}
            required
            help="Data e hora UTC de emissão"
          />
          
          <InputField
            label="Data de Competência"
            name="dCompet"
            type="date"
            value={data.dCompet}
            onChange={(value) => updateField('dCompet', value)}
            required
            help="Data de competência do serviço (YYYY-MM-DD)"
          />
          
          <MunicipioAutocompleteField
            label="Código do Local de Emissão"
            name="cLocEmi"
            value={data.cLocEmi}
            onChange={(value) => updateField('cLocEmi', value)}
            required
            help="Código IBGE do município de emissão"
            placeholder="Digite o município de emissão..."
          />
        </div>
      </FieldGroup>

      {/* Seção de Substituição - aparece apenas se necessário */}
      {data.subst && (
        <FieldGroup
          title="Dados de Substituição"
          description="Informações sobre substituição de NFSe"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Chave da NFSe Substituída"
              name="chSubstda"
              value={data.subst.chSubstda}
              onChange={(value) => updateField('subst', { ...data.subst!, chSubstda: value })}
              required
              help="Chave de 40 dígitos da NFSe substituída"
              maxLength={40}
            />
            
            <InputField
              label="Código do Motivo"
              name="cMotivo"
              value={data.subst.cMotivo}
              onChange={(value) => updateField('subst', { ...data.subst!, cMotivo: value })}
              required
              help="Código do motivo da substituição"
              maxLength={2}
            />
            
            <div className="md:col-span-2">
              <InputField
                label="Descrição do Motivo"
                name="xMotivo"
                value={data.subst.xMotivo}
                onChange={(value) => updateField('subst', { ...data.subst!, xMotivo: value })}
                required
                help="Descrição detalhada do motivo da substituição"
                maxLength={255}
              />
            </div>
          </div>
        </FieldGroup>
      )}

      {/* Botão para adicionar substituição */}
      {!data.subst && (
        <div className="border-t border-gray-200 pt-4">
          <button
            type="button"
            onClick={() => updateField('subst', {
              chSubstda: '',
              cMotivo: '',
              xMotivo: ''
            })}
            className="text-sm text-blue-600 hover:text-blue-500"
          >
            + Adicionar dados de substituição
          </button>
        </div>
      )}

      {/* Informações complementares */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Informações importantes</h3>
            <div className="text-sm text-blue-700 mt-1">
              <ul className="list-disc list-inside space-y-1">
                <li>Use ambiente de Homologação para testes</li>
                <li>O código do local de emissão deve ser válido conforme tabela IBGE</li>
                <li>A data de competência determina o mês de apuração do ISS</li>
                <li>Quando Tipo de Emitente = &quot;Intermediário&quot;, a aba Intermediário será habilitada</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}