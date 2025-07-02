'use client';

import { useCallback } from 'react';
import { InputField, SelectField, FieldGroup } from '../../ui/FormField';
import { MunicipioAutocompleteField, PaisAutocompleteField } from '../../ui/AutocompleteFields';
import { InputFieldWithTestButton } from '../../ui/InputFieldWithTestButton';
import { PrestadorCompleto } from '../../../types/nfse/complete';

interface PrestadorFormProps {
  data: PrestadorCompleto;
  onChange: (data: PrestadorCompleto) => void;
}

export default function PrestadorForm({ data, onChange }: PrestadorFormProps) {
  const updateField = (field: string, value: any) => {
    onChange({ ...data, [field]: value });
  };

  // const updateNestedField = (section: string, field: string, value: any) => {
  //   onChange({
  //     ...data,
  //     [section]: {
  //       ...data[section as keyof PrestadorCompleto],
  //       [field]: value
  //     }
  //   });
  // };

  const updateEnderecoField = (field: string, value: any) => {
    onChange({
      ...data,
      end: {
        ...data.end,
        [field]: value
      }
    });
  };

  const updateEnderecoNacField = (field: string, value: any) => {
    onChange({
      ...data,
      end: {
        ...data.end,
        endNac: {
          ...data.end.endNac!,
          [field]: value
        }
      }
    });
  };

  const updateEnderecoExtField = (field: string, value: any) => {
    onChange({
      ...data,
      end: {
        ...data.end,
        endExt: {
          ...data.end.endExt!,
          [field]: value
        }
      }
    });
  };

  const updateRegTribField = (field: string, value: any) => {
    onChange({
      ...data,
      regTrib: {
        ...data.regTrib,
        [field]: value
      }
    });
  };

  // Determinar tipo de identificação selecionado
  const tipoIdentificacao = data.CNPJ ? 'CNPJ' :
    data.CPF ? 'CPF' :
      data.NIF ? 'NIF' :
        data.CAEPF ? 'CAEPF' : 'CNPJ';

  const setTipoIdentificacao = (tipo: string, valor: string) => {
    const newData = { ...data };
    // Limpar todas as identificações
    delete newData.CNPJ;
    delete newData.CPF;
    delete newData.NIF;
    delete newData.CAEPF;

    // Definir a nova
    onChange({
      ...newData,
      [tipo]: valor
    });
  };

  // Determinar se é endereço nacional ou exterior
  const isEnderecoNacional = !!data.end.endNac;

  const toggleTipoEndereco = (nacional: boolean) => {
    if (nacional) {
      onChange({
        ...data,
        end: {
          ...data.end,
          endNac: data.end.endNac || { cMun: '', CEP: '' },
          endExt: undefined
        }
      });
    } else {
      onChange({
        ...data,
        end: {
          ...data.end,
          endNac: undefined,
          endExt: data.end.endExt || { cPais: '', xCidade: '' }
        }
      });
    }
  };

  const tipoIdentificacaoOptions = [
    { value: 'CNPJ', label: 'CNPJ' },
    { value: 'CPF', label: 'CPF' },
    { value: 'NIF', label: 'NIF (Exterior)' },
    { value: 'CAEPF', label: 'CAEPF' }
  ];

  const opcaoSimplesNacionalOptions = [
    { value: '1', label: 'Não Optante pelo Simples Nacional' },
    { value: '2', label: 'MEI - Microempreendedor Individual' },
    { value: '3', label: 'ME/EPP - Optante pelo Simples Nacional' }
  ];

  const regimeApuracaoSNOptions = [
    { value: '1', label: 'Caixa' },
    { value: '2', label: 'Competência' },
    { value: '3', label: 'Misto' }
  ];

  const regimeEspecialOptions = [
    { value: '0', label: 'Nenhum' },
    { value: '1', label: 'Ato Cooperado' },
    { value: '2', label: 'Estimativa' },
    { value: '3', label: 'Sociedade de Profissionais' },
    { value: '4', label: 'Cooperativa' },
    { value: '5', label: 'MEI' },
    { value: '6', label: 'ME/EPP' }
  ];

  return (
    <div className="space-y-8">
      <FieldGroup
        title="Identificação do Prestador"
        description="Dados de identificação e inscrições do prestador de serviços"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <SelectField
            label="Tipo de Identificação"
            name="tipoIdentificacao"
            value={tipoIdentificacao}
            onChange={(tipo) => {
              const valorAtual = data[tipoIdentificacao as keyof PrestadorCompleto] as string || '';
              setTipoIdentificacao(tipo, valorAtual);
            }}
            options={tipoIdentificacaoOptions}
            required
            help="Tipo de documento de identificação"
          />

          <InputFieldWithTestButton
            label={tipoIdentificacao === 'CNPJ' ? 'CNPJ' :
              tipoIdentificacao === 'CPF' ? 'CPF' :
                tipoIdentificacao === 'NIF' ? 'NIF' : 'CAEPF'}
            name="identificacao"
            value={(data[tipoIdentificacao as keyof PrestadorCompleto] as string) || ''}
            onChange={(valor) => setTipoIdentificacao(tipoIdentificacao, valor)}
            required
            placeholder={tipoIdentificacao === 'CNPJ' ? '00.000.000/0000-00' :
              tipoIdentificacao === 'CPF' ? '000.000.000-00' :
                'Digite o número'}
            maxLength={tipoIdentificacao === 'CNPJ' ? 14 : tipoIdentificacao === 'CPF' ? 11 : 20}
            help={`Número do ${tipoIdentificacao} sem formatação`}
            testButtonType={tipoIdentificacao === 'CNPJ' ? 'cnpj' : tipoIdentificacao === 'CPF' ? 'cpf' : undefined}
            onTestDataGenerated={useCallback((testData: any) => {
              if (testData.type === 'pj') {
                // Preencher dados da pessoa jurídica
                const newData = {
                  ...data,
                  CNPJ: testData.cnpj,
                  xNome: testData.razaoSocial,
                  xFant: testData.nomeFantasia,
                  IM: testData.inscricaoMunicipal
                };
                // Limpar outros tipos de documento
                delete newData.CPF;
                delete newData.NIF;
                delete newData.CAEPF;
                onChange(newData);
              } else if (testData.type === 'pf') {
                // Preencher dados da pessoa física
                const newData = {
                  ...data,
                  CPF: testData.cpf,
                  xNome: testData.nomeCompleto,
                  IM: testData.inscricaoMunicipal
                };
                // Limpar outros tipos de documento
                delete newData.CNPJ;
                delete newData.NIF;
                delete newData.CAEPF;
                onChange(newData);
              }
            }, [data, onChange])}
          />

          <InputField
            label="Inscrição Municipal"
            name="IM"
            value={data.IM || ''}
            onChange={(value) => updateField('IM', value)}
            placeholder="Ex: 12345678"
            help="Inscrição Municipal (opcional)"
          />
        </div>
      </FieldGroup>

      <FieldGroup
        title="Dados Empresariais"
        description="Razão social e nome fantasia do prestador"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="Razão Social / Nome"
            name="xNome"
            value={data.xNome}
            onChange={(value) => updateField('xNome', value)}
            required
            maxLength={150}
            help="Razão social para PJ ou nome completo para PF"
          />

          <InputField
            label="Nome Fantasia"
            name="xFant"
            value={data.xFant || ''}
            onChange={(value) => updateField('xFant', value)}
            maxLength={60}
            help="Nome fantasia (opcional)"
          />
        </div>
      </FieldGroup>

      <FieldGroup
        title="Endereço do Prestador"
        description="Endereço completo do prestador (nacional ou exterior)"
      >
        {/* Seletor Nacional/Exterior */}
        <div className="flex items-center space-x-6 mb-4">
          <label className="flex items-center text-gray-700">
            <input
              type="radio"
              name="tipoEndereco"
              checked={isEnderecoNacional}
              onChange={() => toggleTipoEndereco(true)}
              className="mr-2"
            />
            Endereço Nacional
          </label>
          <label className="flex items-center text-gray-700">
            <input
              type="radio"
              name="tipoEndereco"
              checked={!isEnderecoNacional}
              onChange={() => toggleTipoEndereco(false)}
              className="mr-2"
            />
            Endereço no Exterior
          </label>
        </div>

        {/* Campos do endereço */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <InputField
            label="Logradouro"
            name="xLgr"
            value={data.end.xLgr}
            onChange={(value) => updateEnderecoField('xLgr', value)}
            required
            maxLength={125}
            placeholder="Ex: Rua das Flores"
          />

          <InputField
            label="Número"
            name="nro"
            value={data.end.nro}
            onChange={(value) => updateEnderecoField('nro', value)}
            required
            maxLength={10}
            placeholder="Ex: 123"
          />

          <InputField
            label="Complemento"
            name="xCpl"
            value={data.end.xCpl || ''}
            onChange={(value) => updateEnderecoField('xCpl', value)}
            maxLength={60}
            placeholder="Ex: Sala 101, Apto 202"
          />

          <InputField
            label="Bairro"
            name="xBairro"
            value={data.end.xBairro}
            onChange={(value) => updateEnderecoField('xBairro', value)}
            required
            maxLength={72}
            placeholder="Ex: Centro"
          />

          {/* Campos específicos para endereço nacional */}
          {isEnderecoNacional && data.end.endNac && (
            <>
              <MunicipioAutocompleteField
                label="Código do Município (IBGE)"
                name="cMun"
                value={data.end.endNac.cMun}
                onChange={(value) => updateEnderecoNacField('cMun', value)}
                required
                help="Código IBGE do município"
                placeholder="Digite o município..."
              />

              <InputField
                label="CEP"
                name="CEP"
                value={data.end.endNac.CEP}
                onChange={(value) => updateEnderecoNacField('CEP', value)}
                required
                maxLength={8}
                placeholder="Ex: 01234567"
                help="CEP sem formatação"
              />
            </>
          )}

          {/* Campos específicos para endereço exterior */}
          {!isEnderecoNacional && data.end.endExt && (
            <>
              <PaisAutocompleteField
                label="Código do País"
                name="cPais"
                value={data.end.endExt.cPais}
                onChange={(value) => updateEnderecoExtField('cPais', value)}
                required
                help="Código do país (ISO 3166-1 alpha-3)"
                placeholder="Digite o país..."
              />

              <InputField
                label="Cidade"
                name="xCidade"
                value={data.end.endExt.xCidade}
                onChange={(value) => updateEnderecoExtField('xCidade', value)}
                required
                maxLength={60}
                placeholder="Ex: New York"
              />

              <InputField
                label="Estado/Província"
                name="xEstado"
                value={data.end.endExt.xEstado || ''}
                onChange={(value) => updateEnderecoExtField('xEstado', value)}
                maxLength={60}
                placeholder="Ex: NY, California"
              />

              <InputField
                label="CEP/Postal Code"
                name="CEP"
                value={data.end.endExt.CEP || ''}
                onChange={(value) => updateEnderecoExtField('CEP', value)}
                maxLength={20}
                placeholder="Ex: 10001, SW1A 1AA"
              />
            </>
          )}
        </div>
      </FieldGroup>

      <FieldGroup
        title="Contato"
        description="Informações de contato do prestador (opcionais)"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="Telefone"
            name="fone"
            type="tel"
            value={data.fone || ''}
            onChange={(value) => updateField('fone', value)}
            maxLength={20}
            placeholder="Ex: 11999999999"
            help="Telefone sem formatação"
          />

          <InputField
            label="E-mail"
            name="email"
            type="email"
            value={data.email || ''}
            onChange={(value) => updateField('email', value)}
            maxLength={80}
            placeholder="Ex: contato@empresa.com.br"
          />
        </div>
      </FieldGroup>

      <FieldGroup
        title="Regimes de Tributação"
        description="Configurações dos regimes tributários do prestador (CRÍTICO)"
      >
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Atenção</h3>
              <p className="text-sm text-yellow-700 mt-1">
                Os regimes de tributação são obrigatórios e impactam diretamente no cálculo dos tributos da NFSe.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SelectField
            label="Opção pelo Simples Nacional"
            name="opSimpNac"
            value={data.regTrib.opSimpNac}
            onChange={(value) => updateRegTribField('opSimpNac', value)}
            options={opcaoSimplesNacionalOptions}
            required
            help="Situação perante o Simples Nacional"
          />

          {/* Regime de apuração - só aparece se for optante do Simples */}
          {(data.regTrib.opSimpNac === '2' || data.regTrib.opSimpNac === '3') && (
            <SelectField
              label="Regime de Apuração (Simples Nacional)"
              name="regApTribSN"
              value={data.regTrib.regApTribSN || ''}
              onChange={(value) => updateRegTribField('regApTribSN', value)}
              options={regimeApuracaoSNOptions}
              help="Regime de apuração para optantes do Simples Nacional"
            />
          )}

          <SelectField
            label="Regime Especial de Tributação"
            name="regEspTrib"
            value={data.regTrib.regEspTrib}
            onChange={(value) => updateRegTribField('regEspTrib', value)}
            options={regimeEspecialOptions}
            required
            help="Regime especial de tributação aplicável"
          />
        </div>
      </FieldGroup>

      {/* Informações contextuais */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Dicas de preenchimento</h3>
            <div className="text-sm text-blue-700 mt-1">
              <ul className="list-disc list-inside space-y-1">
                <li>Para CNPJ, digite apenas os 14 números sem formatação</li>
                <li>Use endereço nacional para prestadores brasileiros</li>
                <li>A inscrição municipal é obrigatória para empresas prestadoras</li>
                <li>Verifique os regimes tributários com seu contador</li>
                <li>MEI deve selecionar opção &quot;2&quot; no Simples Nacional</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}