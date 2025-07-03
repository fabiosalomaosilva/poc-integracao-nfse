'use client';

import { InputField, SelectField, FieldGroup } from '../../ui/FormField';
import { MunicipioAutocompleteField, PaisAutocompleteField } from '../../ui/AutocompleteFields';
import { InputFieldWithTestButton } from '../../ui/InputFieldWithTestButton';
import { IntermediarioCompleto } from '../../../types/nfse/complete';

interface IntermediarioFormProps {
  data: IntermediarioCompleto;
  onChange: (data: IntermediarioCompleto) => void;
}

export default function IntermediarioForm({ data, onChange }: IntermediarioFormProps) {
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
        title="Identificação do Intermediário"
        description="Dados de identificação do intermediário da operação"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <SelectField
            label="Tipo de Identificação"
            name="tipoIdentificacao"
            value={tipoIdentificacao}
            onChange={(tipo) => {
              const valorAtual = data[tipoIdentificacao as keyof IntermediarioCompleto] as string || '';
              setTipoIdentificacao(tipo, valorAtual);
            }}
            options={tipoIdentificacaoOptions}
            required
            help="Tipo de documento de identificação do intermediário"
          />

          <InputFieldWithTestButton
            label={tipoIdentificacao === 'CNPJ' ? 'CNPJ' :
              tipoIdentificacao === 'CPF' ? 'CPF' :
                tipoIdentificacao === 'NIF' ? 'NIF' :
                  tipoIdentificacao === 'cNaoNIF' ? 'Código do País' : 'CAEPF'}
            name="identificacao"
            value={(data[tipoIdentificacao as keyof IntermediarioCompleto] as string) || ''}
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
            help="Inscrição Municipal do intermediário (se possuir)"
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
        title="Dados do Intermediário"
        description="Nome ou razão social do intermediário"
      >
        <div className="grid grid-cols-1 gap-4">
          <InputField
            label="Nome / Razão Social"
            name="xNome"
            value={data.xNome}
            onChange={(value) => updateField('xNome', value)}
            required
            maxLength={150}
            help="Nome completo (PF) ou razão social (PJ) do intermediário"
          />
        </div>
      </FieldGroup>

      <FieldGroup
        title="Endereço do Intermediário"
        description="Endereço completo do intermediário (nacional ou exterior)"
      >
        {/* Seletor Nacional/Exterior */}
        <div className="flex items-center space-x-6 mb-4">
          <label className="flex items-center text-gray-700">
            <input
              type="radio"
              name="tipoEnderecoIntermediario"
              checked={isEnderecoNacional}
              onChange={() => toggleTipoEndereco(true)}
              className="mr-2"
            />
            Endereço Nacional
          </label>
          <label className="flex items-center text-gray-700">
            <input
              type="radio"
              name="tipoEnderecoIntermediario"
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
            placeholder="Ex: Rua dos Intermediários"
          />

          <InputField
            label="Número"
            name="nro"
            value={data.end.nro}
            onChange={(value) => updateEnderecoField('nro', value)}
            required
            maxLength={10}
            placeholder="Ex: 500"
          />

          <InputField
            label="Complemento"
            name="xCpl"
            value={data.end.xCpl || ''}
            onChange={(value) => updateEnderecoField('xCpl', value)}
            maxLength={60}
            placeholder="Ex: Sala 301"
          />

          <InputField
            label="Bairro"
            name="xBairro"
            value={data.end.xBairro}
            onChange={(value) => updateEnderecoField('xBairro', value)}
            required
            maxLength={72}
            placeholder="Ex: Centro Comercial"
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
                placeholder="Ex: 90010000"
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
                placeholder="Ex: Lisboa"
              />

              <InputField
                label="Estado/Província"
                name="xEstado"
                value={data.end.endExt.xEstado || ''}
                onChange={(value) => updateEnderecoExtField('xEstado', value)}
                maxLength={60}
                placeholder="Ex: Lisboa, Buenos Aires"
              />

              <InputField
                label="CEP/Postal Code"
                name="CEP"
                value={data.end.endExt.CEP || ''}
                onChange={(value) => updateEnderecoExtField('CEP', value)}
                maxLength={20}
                placeholder="Ex: 1000-001, C1425"
              />
            </>
          )}
        </div>
      </FieldGroup>

      <FieldGroup
        title="Contato do Intermediário"
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
            placeholder="Ex: 51987654321"
            help="Telefone com código de área, sem formatação"
          />

          <InputField
            label="E-mail"
            name="email"
            type="email"
            value={data.email || ''}
            onChange={(value) => updateField('email', value)}
            maxLength={80}
            placeholder="Ex: intermediario@empresa.com.br"
            help="E-mail do intermediário"
          />
        </div>
      </FieldGroup>
    </div>
  );
}