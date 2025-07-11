'use client';

import { InputField, SelectField, FieldGroup } from '../../ui/FormField';
import { MunicipioAutocompleteField, PaisAutocompleteField } from '../../ui/AutocompleteFields';
import { InputFieldWithTestButton } from '../../ui/InputFieldWithTestButton';
import { TomadorCompleto } from '../../../types/nfse/complete';

interface TomadorFormProps {
  data: TomadorCompleto;
  onChange: (data: TomadorCompleto) => void;
}

export default function TomadorForm({ data, onChange }: TomadorFormProps) {
  const updateField = (field: string, value: any) => {
    onChange({ ...data, [field]: value });
  };

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

  // Determinar tipo de identificação selecionado
  const tipoIdentificacao = data.CNPJ ? 'CNPJ' :
    data.CPF ? 'CPF' :
      data.NIF ? 'NIF' :
        data.cNaoNIF ? 'cNaoNIF' :
          data.CAEPF ? 'CAEPF' : 'CNPJ';

  const setTipoIdentificacao = (tipo: string, valor: string) => {
    const newData = { ...data };
    // Limpar todas as identificações
    delete newData.CNPJ;
    delete newData.CPF;
    delete newData.NIF;
    delete newData.cNaoNIF;
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
    { value: 'CNPJ', label: 'CNPJ - Pessoa Jurídica' },
    { value: 'CPF', label: 'CPF - Pessoa Física' },
    { value: 'NIF', label: 'NIF - Número de Identificação Fiscal (Exterior)' },
    { value: 'cNaoNIF', label: 'Não possui NIF (Exterior)' },
    { value: 'CAEPF', label: 'CAEPF - Cadastro de Atividade Econômica da Pessoa Física' }
  ];

  return (
    <div className="space-y-8">
      <FieldGroup
        title="Identificação do Tomador"
        description="Dados de identificação do tomador de serviços"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <SelectField
            label="Tipo de Identificação"
            name="tipoIdentificacao"
            value={tipoIdentificacao}
            onChange={(tipo) => {
              const valorAtual = data[tipoIdentificacao as keyof TomadorCompleto] as string || '';
              setTipoIdentificacao(tipo, valorAtual);
            }}
            options={tipoIdentificacaoOptions}
            required
            help="Tipo de documento de identificação do tomador"
          />

          <InputFieldWithTestButton
            label={tipoIdentificacao === 'CNPJ' ? 'CNPJ' :
              tipoIdentificacao === 'CPF' ? 'CPF' :
                tipoIdentificacao === 'NIF' ? 'NIF' :
                  tipoIdentificacao === 'cNaoNIF' ? 'Código do País' : 'CAEPF'}
            name="identificacao"
            value={(data[tipoIdentificacao as keyof TomadorCompleto] as string) || ''}
            onChange={(valor) => setTipoIdentificacao(tipoIdentificacao, valor)}
            required
            placeholder={tipoIdentificacao === 'CNPJ' ? '00.000.000/0000-00' :
              tipoIdentificacao === 'CPF' ? '000.000.000-00' :
                tipoIdentificacao === 'cNaoNIF' ? 'Ex: BR, USA' :
                  'Digite o número'}
            maxLength={tipoIdentificacao === 'CNPJ' ? 14 :
              tipoIdentificacao === 'CPF' ? 11 :
                tipoIdentificacao === 'cNaoNIF' ? 3 : 20}
            help={tipoIdentificacao === 'CNPJ' || tipoIdentificacao === 'CPF' ?
              `Número do ${tipoIdentificacao} sem formatação` :
              tipoIdentificacao === 'cNaoNIF' ? 'Código do país quando não possui NIF' :
                `Número do ${tipoIdentificacao}`}
            testButtonType={tipoIdentificacao === 'CNPJ' ? 'cnpj' : tipoIdentificacao === 'CPF' ? 'cpf' : undefined}
            onTestDataGenerated={(testData) => {
              if (testData.type === 'pj') {
                // Preencher dados da pessoa jurídica
                onChange({
                  ...data,
                  CNPJ: testData.cnpj,
                  xNome: testData.razaoSocial,
                  IM: testData.inscricaoMunicipal
                });
              } else if (testData.type === 'pf') {
                // Preencher dados da pessoa física
                onChange({
                  ...data,
                  CPF: testData.cpf,
                  xNome: testData.nomeCompleto,
                  IM: testData.inscricaoMunicipal
                });
              }
            }}
          />

          <InputField
            label="Inscrição Municipal"
            name="IM"
            value={data.IM || ''}
            onChange={(value) => updateField('IM', value)}
            placeholder="Ex: 12345678"
            help="Inscrição Municipal do tomador (se possuir)"
          />

          {/* CAEPF - só aparece se for selecionado */}
          {tipoIdentificacao === 'CAEPF' && (
            <InputField
              label="CAEPF"
              name="CAEPF"
              value={data.CAEPF || ''}
              onChange={(value) => updateField('CAEPF', value)}
              placeholder="Digite o CAEPF"
              help="Cadastro de Atividade Econômica da Pessoa Física"
            />
          )}
        </div>
      </FieldGroup>

      <FieldGroup
        title="Dados do Tomador"
        description="Nome ou razão social do tomador"
      >
        <div className="grid grid-cols-1 gap-4">
          <InputField
            label="Nome / Razão Social"
            name="xNome"
            value={data.xNome}
            onChange={(value) => updateField('xNome', value)}
            required
            maxLength={150}
            help="Nome completo (PF) ou razão social (PJ) do tomador"
          />
        </div>
      </FieldGroup>

      <FieldGroup
        title="Endereço do Tomador"
        description="Endereço completo do tomador (nacional ou exterior)"
      >
        {/* Seletor Nacional/Exterior */}
        <div className="flex items-center space-x-6 mb-4">
          <label className="flex items-center text-gray-700">
            <input
              type="radio"
              name="tipoEnderecoTomador"
              checked={isEnderecoNacional}
              onChange={() => toggleTipoEndereco(true)}
              className="mr-2"
            />
            Endereço Nacional
          </label>
          <label className="flex items-center text-gray-700">
            <input
              type="radio"
              name="tipoEnderecoTomador"
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
            placeholder="Ex: Avenida Paulista"
          />

          <InputField
            label="Número"
            name="nro"
            value={data.end.nro}
            onChange={(value) => updateEnderecoField('nro', value)}
            required
            maxLength={10}
            placeholder="Ex: 1000"
          />

          <InputField
            label="Complemento"
            name="xCpl"
            value={data.end.xCpl || ''}
            onChange={(value) => updateEnderecoField('xCpl', value)}
            maxLength={60}
            placeholder="Ex: Conjunto 101, Bloco A"
          />

          <InputField
            label="Bairro"
            name="xBairro"
            value={data.end.xBairro}
            onChange={(value) => updateEnderecoField('xBairro', value)}
            required
            maxLength={72}
            placeholder="Ex: Bela Vista"
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
                placeholder="Ex: 01310100"
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
                placeholder="Ex: Miami"
              />

              <InputField
                label="Estado/Província"
                name="xEstado"
                value={data.end.endExt.xEstado || ''}
                onChange={(value) => updateEnderecoExtField('xEstado', value)}
                maxLength={60}
                placeholder="Ex: Florida, Ontario"
              />

              <InputField
                label="CEP/Postal Code"
                name="CEP"
                value={data.end.endExt.CEP || ''}
                onChange={(value) => updateEnderecoExtField('CEP', value)}
                maxLength={20}
                placeholder="Ex: 33101, M5H 2N2"
              />
            </>
          )}
        </div>
      </FieldGroup>

      <FieldGroup
        title="Contato do Tomador"
        description="Informações de contato (opcionais)"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="Telefone"
            name="fone"
            type="tel"
            value={data.fone || ''}
            onChange={(value) => updateField('fone', value)}
            maxLength={20}
            placeholder="Ex: 11987654321"
            help="Telefone com código de área, sem formatação"
          />

          <InputField
            label="E-mail"
            name="email"
            type="email"
            value={data.email || ''}
            onChange={(value) => updateField('email', value)}
            maxLength={80}
            placeholder="Ex: cliente@empresa.com.br"
            help="E-mail do tomador"
          />
        </div>
      </FieldGroup>

      {/* Alertas específicos */}
      {!data.xNome && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Campo obrigatório</h3>
              <p className="text-sm text-yellow-700 mt-1">
                O nome ou razão social do tomador é obrigatório para gerar a NFSe.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}