'use client';

import { useCallback } from 'react';
import { InputField, SelectField, TextAreaField, CheckboxField, FieldGroup } from '../../ui/FormField';
import { FocusStableNumeric } from '../../ui/FocusStableNumeric';
import { MunicipioAutocompleteField, PaisAutocompleteField, ServicoAutocompleteField } from '../../ui/AutocompleteFields';
import { SubTabs } from '../../ui/Tabs';
import { ServicoCompleto } from '../../../types/nfse/complete';
import { useServicos } from '../../../hooks/useAutocompleteData';

interface ServicosFormProps {
  data: ServicoCompleto;
  onChange: (data: ServicoCompleto) => void;
}

export default function ServicosForm({ data, onChange }: ServicosFormProps) {
  const { servicos } = useServicos();
  
  const updateNestedField = useCallback((section: string, field: string, value: any) => {
    onChange({
      ...data,
      [section]: {
        ...data[section as keyof ServicoCompleto],
        [field]: value
      }
    });
  }, [data, onChange]);

  // Callback otimizado para informações complementares
  const updateInfoComplementar = useCallback((field: string, value: any) => {
    onChange({
      ...data,
      infoCompl: {
        ...data.infoCompl,
        [field]: value
      }
    });
  }, [data, onChange]);

  // Callback otimizado para dados da obra
  const updateObra = useCallback((field: string, value: any) => {
    if (!data.obra) return;
    onChange({
      ...data,
      obra: {
        ...data.obra,
        [field]: value
      }
    });
  }, [data, onChange]);

  // Callback otimizado para dados do evento
  const updateEvento = useCallback((field: string, value: any) => {
    if (!data.atvEvento) return;
    onChange({
      ...data,
      atvEvento: {
        ...data.atvEvento,
        [field]: value
      }
    });
  }, [data, onChange]);

  // Determinar quais especialidades estão ativas
  const hasComercioExterior = !!data.comExt;
  const hasLocacaoSublocacao = !!data.lsadppu;
  const hasObra = !!data.obra;
  const hasEvento = !!data.atvEvento;
  const hasExploracaoRodoviaria = !!data.explRod;

  const toggleEspecialidade = useCallback((tipo: string, ativo: boolean) => {
    if (ativo) {
      // Adicionar a especialidade com valores padrão
      let novaEspecialidade;
      
      switch (tipo) {
        case 'comExt':
          novaEspecialidade = {
            mdPrestacao: '1',
            vincPrest: '0',
            tpMoeda: '790',
            vServMoeda: 0,
            mecAFComexP: '04',
            mecAFComexT: '05',
            movTempBens: '1',
            mdic: '1'
          };
          break;
        case 'lsadppu':
          novaEspecialidade = {
            categ: '',
            objeto: '',
            extensao: 0,
            nPostes: 0
          };
          break;
        case 'obra':
          novaEspecialidade = {
            inscImobFisc: '',
            endObra: {
              endNac: { cMun: '', CEP: '' },
              xLgr: '',
              nro: '',
              xBairro: ''
            }
          };
          break;
        case 'atvEvento':
          novaEspecialidade = {
            xDescEvento: '',
            dtIni: '',
            dtFim: '',
            idEvento: ''
          };
          break;
        case 'explRod':
          novaEspecialidade = {
            categVeic: '',
            nroEixos: 0,
            tpRodagem: '',
            sentido: '',
            placa: ''
          };
          break;
        default:
          return;
      }
      
      onChange({
        ...data,
        [tipo]: novaEspecialidade
      });
    } else {
      // Remover a especialidade criando um novo objeto sem a propriedade
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [tipo as keyof ServicoCompleto]: _, ...newData } = data;
      onChange(newData as ServicoCompleto);
    }
  }, [data, onChange]);

  // Componente para Local da Prestação
  const LocalPrestacaoTab = () => (
    <FieldGroup
      title="Local da Prestação de Serviços"
      description="Informações sobre onde o serviço será prestado"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <MunicipioAutocompleteField
          label="Código do Local de Prestação"
          name="cLocPrestacao"
          value={data.locPrest.cLocPrestacao}
          onChange={(value) => updateNestedField('locPrest', 'cLocPrestacao', value)}
          required
          help="Código IBGE do município onde o serviço será prestado"
          placeholder="Digite o município de prestação..."
        />

        <PaisAutocompleteField
          label="Código do País (Exterior)"
          name="cPaisPrestacao"
          value={data.locPrest.cPaisPrestacao || ''}
          onChange={(value) => updateNestedField('locPrest', 'cPaisPrestacao', value)}
          help="Código do país (apenas para serviços no exterior)"
          placeholder="Digite o país para serviços no exterior..."
        />

        <SelectField
          label="Opção de Consumo do Serviço"
          name="opConsumServ"
          value={data.locPrest.opConsumServ || ''}
          onChange={(value) => updateNestedField('locPrest', 'opConsumServ', value)}
          options={[
            { value: '', label: 'Não se aplica' },
            { value: '0', label: 'Prestação local' },
            { value: '1', label: 'Consumo no exterior' },
            { value: '2', label: 'Exportação de serviços' }
          ]}
          help="Opção de consumo para casos específicos"
        />
      </div>
    </FieldGroup>
  );

  // Componente para Código do Serviço
  const CodigoServicoTab = () => (
    <FieldGroup
      title="Código e Descrição do Serviço"
      description="Identificação e classificação do serviço prestado"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ServicoAutocompleteField
          label="Código de Tributação Nacional"
          name="cTribNac"
          value={data.cServ.cTribNac || ''}
          onChange={(value) => {
            // Encontrar o serviço correspondente
            const servicoSelecionado = servicos.find(s => s.codigo === value);
            
            // Atualizar ambos os campos em uma única operação
            const newCServ = {
              ...data.cServ,
              cTribNac: value
            };
            
            if (servicoSelecionado) {
              newCServ.xDescServ = servicoSelecionado.descricao;
            }
            
            onChange({
              ...data,
              cServ: newCServ
            });
          }}
          required
          help="Código conforme LC 116/03"
          placeholder="Digite o código ou descrição do serviço..."
        />

        <InputField
          label="Código de Tributação Municipal"
          name="cTribMun"
          value={data.cServ.cTribMun || ''}
          onChange={(value) => updateNestedField('cServ', 'cTribMun', value)}
          maxLength={20}
          placeholder="Ex: 001"
          help="Código específico do município (opcional)"
        />

        <InputField
          label="Código NBS"
          name="cNBS"
          value={data.cServ.cNBS || ''}
          onChange={(value) => updateNestedField('cServ', 'cNBS', value)}
          maxLength={9}
          placeholder="Ex: 123456789"
          help="Nomenclatura Brasileira de Serviços"
        />

        <InputField
          label="Código Interno do Contribuinte"
          name="cIntContrib"
          value={data.cServ.cIntContrib || ''}
          onChange={(value) => updateNestedField('cServ', 'cIntContrib', value)}
          maxLength={20}
          placeholder="Ex: SERV001"
          help="Código interno para controle do contribuinte"
        />
      </div>

      <TextAreaField
        label="Descrição do Serviço"
        name="xDescServ"
        value={data.cServ.xDescServ}
        onChange={(value) => updateNestedField('cServ', 'xDescServ', value)}
        required
        maxLength={2000}
        rows={4}
        placeholder="Descreva detalhadamente o serviço prestado..."
        help="Descrição completa e detalhada do serviço"
      />
    </FieldGroup>
  );

  // Componente para Comércio Exterior
  const ComercioExteriorTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <CheckboxField
          label="Serviço de Comércio Exterior"
          name="hasComercioExterior"
          checked={hasComercioExterior}
          onChange={(checked) => toggleEspecialidade('comExt', checked)}
          help="Marque se o serviço envolve comércio exterior"
        />
      </div>

      {hasComercioExterior && data.comExt && (
        <FieldGroup
          title="Dados do Comércio Exterior"
          description="Informações específicas para serviços de comércio exterior"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <SelectField
              label="Modo de Prestação"
              name="mdPrestacao"
              value={data.comExt.mdPrestacao}
              onChange={(value) => updateNestedField('comExt', 'mdPrestacao', value)}
              required
              options={[
                { value: '1', label: 'Transfronteiriço' },
                { value: '2', label: 'Consumo no exterior' },
                { value: '3', label: 'Presença comercial' },
                { value: '4', label: 'Movimento temporário de pessoas' }
              ]}
              help="Modo de prestação conforme GATS"
            />

            <SelectField
              label="Vínculo entre as Partes"
              name="vincPrest"
              value={data.comExt.vincPrest}
              onChange={(value) => updateNestedField('comExt', 'vincPrest', value)}
              required
              options={[
                { value: '0', label: 'Não vinculadas' },
                { value: '1', label: 'Vinculadas' }
              ]}
              help="Indica se há vínculo entre prestador e tomador"
            />

            <SelectField
              label="Tipo de Moeda"
              name="tpMoeda"
              value={data.comExt.tpMoeda}
              onChange={(value) => updateNestedField('comExt', 'tpMoeda', value)}
              required
              options={[
                { value: '790', label: 'Real (BRL)' },
                { value: '840', label: 'Dólar Americano (USD)' },
                { value: '978', label: 'Euro (EUR)' },
                { value: '826', label: 'Libra Esterlina (GBP)' },
                { value: '392', label: 'Iene (JPY)' }
              ]}
              help="Moeda utilizada na operação (código ISO 4217)"
            />

            <FocusStableNumeric
              label="Valor do Serviço em Moeda Estrangeira"
              name="vServMoeda"
              value={data.comExt.vServMoeda}
              onChange={(value) => updateNestedField('comExt', 'vServMoeda', value || 0)}
              required
              min={0}
              help="Valor convertido para a moeda selecionada"
            />

            <SelectField
              label="Mecanismo de Apoio/Fomento Prestador"
              name="mecAFComexP"
              value={data.comExt.mecAFComexP}
              onChange={(value) => updateNestedField('comExt', 'mecAFComexP', value)}
              required
              options={[
                { value: '01', label: 'Nenhum' },
                { value: '02', label: 'ACC - Adiantamento sobre Contrato de Câmbio' },
                { value: '03', label: 'ACE - Adiantamento sobre Cambiais Entregues' },
                { value: '04', label: 'BNDES-exim' },
                { value: '05', label: 'PROEX' }
              ]}
              help="Mecanismo de apoio/fomento do prestador"
            />

            <SelectField
              label="Mecanismo de Apoio/Fomento Tomador"
              name="mecAFComexT"
              value={data.comExt.mecAFComexT}
              onChange={(value) => updateNestedField('comExt', 'mecAFComexT', value)}
              required
              options={[
                { value: '01', label: 'Nenhum' },
                { value: '02', label: 'ACC - Adiantamento sobre Contrato de Câmbio' },
                { value: '03', label: 'ACE - Adiantamento sobre Cambiais Entregues' },
                { value: '04', label: 'BNDES-exim' },
                { value: '05', label: 'PROEX' }
              ]}
              help="Mecanismo de apoio/fomento do tomador"
            />

            <SelectField
              label="Movimento Temporário de Bens"
              name="movTempBens"
              value={data.comExt.movTempBens}
              onChange={(value) => updateNestedField('comExt', 'movTempBens', value)}
              required
              options={[
                { value: '1', label: 'Sim' },
                { value: '2', label: 'Não' }
              ]}
              help="Indica se há movimento temporário de bens"
            />

            <SelectField
              label="Envio de Informações ao MDIC"
              name="mdic"
              value={data.comExt.mdic}
              onChange={(value) => updateNestedField('comExt', 'mdic', value)}
              required
              options={[
                { value: '1', label: 'Sim' },
                { value: '2', label: 'Não' }
              ]}
              help="Indica se deve enviar informações ao MDIC"
            />

            <InputField
              label="Número da DI (Declaração de Importação)"
              name="nroDI"
              value={data.comExt.nroDI || ''}
              onChange={(value) => updateNestedField('comExt', 'nroDI', value)}
              maxLength={20}
              placeholder="Ex: 2024/1234567-8"
              help="Número da DI quando aplicável"
            />

            <InputField
              label="Número do RE (Registro de Exportação)"
              name="nroRE"
              value={data.comExt.nroRE || ''}
              onChange={(value) => updateNestedField('comExt', 'nroRE', value)}
              maxLength={20}
              placeholder="Ex: 24BR00123456789"
              help="Número do RE quando aplicável"
            />
          </div>
        </FieldGroup>
      )}
    </div>
  );

  // Componente para Especialidades
  const EspecialidadesTab = () => (
    <div className="space-y-8">
      {/* Locação/Sublocação */}
      <div>
        <CheckboxField
          label="Locação/Sublocação de Bens Móveis"
          name="hasLocacaoSublocacao"
          checked={hasLocacaoSublocacao}
          onChange={(checked) => toggleEspecialidade('lsadppu', checked)}
          help="Marque se o serviço envolve locação ou sublocação"
        />

        {hasLocacaoSublocacao && data.lsadppu && (
          <FieldGroup
            title="Dados de Locação/Sublocação"
            description="Informações específicas para locação de bens móveis"
            className="mt-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SelectField
                label="Categoria"
                name="categ"
                value={data.lsadppu.categ}
                onChange={(value) => updateNestedField('lsadppu', 'categ', value)}
                required
                options={[
                  { value: '1', label: 'Veículos terrestres' },
                  { value: '2', label: 'Embarcações' },
                  { value: '3', label: 'Aeronaves' },
                  { value: '4', label: 'Outros bens móveis' }
                ]}
              />

              <InputField
                label="Objeto da Locação"
                name="objeto"
                value={data.lsadppu.objeto}
                onChange={(value) => updateNestedField('lsadppu', 'objeto', value)}
                required
                maxLength={100}
                placeholder="Ex: Veículo Modelo X"
              />

              <FocusStableNumeric
                label="Extensão Total (metros)"
                name="extensao"
                value={data.lsadppu.extensao}
                onChange={(value) => updateNestedField('lsadppu', 'extensao', value)}
                min={0}
                help="Para casos aplicáveis (ex: tubulações)"
              />

              <FocusStableNumeric
                label="Número de Postes"
                name="nPostes"
                value={data.lsadppu.nPostes}
                onChange={(value) => updateNestedField('lsadppu', 'nPostes', value ? Math.round(value) : undefined)}
                min={0}
                decimals={0}
                help="Para casos aplicáveis"
              />
            </div>
          </FieldGroup>
        )}
      </div>

      {/* Obra */}
      <div>
        <CheckboxField
          label="Serviços Relacionados a Obra"
          name="hasObra"
          checked={hasObra}
          onChange={(checked) => toggleEspecialidade('obra', checked)}
          help="Marque se o serviço está relacionado a uma obra"
        />

        {hasObra && data.obra && (
          <FieldGroup
            title="Dados da Obra"
            description="Informações sobre a obra relacionada ao serviço"
            className="mt-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="Código CNO (Cadastro Nacional de Obras)"
                name="cCno"
                value={data.obra.cCno || ''}
                onChange={(value) => updateObra('cCno', value)}
                maxLength={20}
                placeholder="Ex: CNO123456789"
              />

              <InputField
                label="Código CEI (Cadastro Específico do INSS)"
                name="cCei"
                value={data.obra.cCei || ''}
                onChange={(value) => updateObra('cCei', value)}
                maxLength={20}
                placeholder="Ex: 123456789012"
              />

              <InputField
                label="Inscrição Imobiliária Fiscal"
                name="inscImobFisc"
                value={data.obra.inscImobFisc || ''}
                onChange={(value) => updateObra('inscImobFisc', value)}
                maxLength={30}
                placeholder="Ex: 123.456.789.0001"
              />
            </div>
          </FieldGroup>
        )}
      </div>

      {/* Evento */}
      <div>
        <CheckboxField
          label="Atividade/Evento"
          name="hasEvento"
          checked={hasEvento}
          onChange={(checked) => toggleEspecialidade('atvEvento', checked)}
          help="Marque se o serviço está relacionado a evento específico"
        />

        {hasEvento && data.atvEvento && (
          <FieldGroup
            title="Dados do Evento"
            description="Informações sobre o evento relacionado ao serviço"
            className="mt-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextAreaField
                label="Descrição do Evento"
                name="xDescEvento"
                value={data.atvEvento.xDescEvento}
                onChange={(value) => updateEvento('xDescEvento', value)}
                required
                maxLength={500}
                rows={3}
                placeholder="Descreva o evento..."
              />

              <InputField
                label="Data de Início"
                name="dtIni"
                type="date"
                value={data.atvEvento.dtIni}
                onChange={(value) => updateEvento('dtIni', value)}
                required
              />

              <InputField
                label="Data de Fim"
                name="dtFim"
                type="date"
                value={data.atvEvento.dtFim}
                onChange={(value) => updateEvento('dtFim', value)}
                required
              />

              <InputField
                label="ID do Evento"
                name="idEvento"
                value={data.atvEvento.idEvento || ''}
                onChange={(value) => updateEvento('idEvento', value)}
                maxLength={50}
                placeholder="Ex: EVT2024001"
              />
            </div>
          </FieldGroup>
        )}
      </div>

      {/* Exploração Rodoviária */}
      <div>
        <CheckboxField
          label="Exploração Rodoviária"
          name="hasExploracaoRodoviaria"
          checked={hasExploracaoRodoviaria}
          onChange={(checked) => toggleEspecialidade('explRod', checked)}
          help="Marque para serviços de exploração rodoviária"
        />

        {hasExploracaoRodoviaria && data.explRod && (
          <FieldGroup
            title="Dados de Exploração Rodoviária"
            description="Informações específicas para exploração rodoviária"
            className="mt-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <SelectField
                label="Categoria do Veículo"
                name="categVeic"
                value={data.explRod.categVeic}
                onChange={(value) => updateNestedField('explRod', 'categVeic', value)}
                required
                options={[
                  { value: '1', label: 'Motocicleta' },
                  { value: '2', label: 'Automóvel' },
                  { value: '3', label: 'Ônibus' },
                  { value: '4', label: 'Caminhão' },
                  { value: '5', label: 'Outros' }
                ]}
              />

              <FocusStableNumeric
                label="Número de Eixos"
                name="nroEixos"
                value={data.explRod.nroEixos}
                onChange={(value) => updateNestedField('explRod', 'nroEixos', value ? Math.round(value) : 1)}
                min={1}
                decimals={0}
                required
              />

              <SelectField
                label="Tipo de Rodagem"
                name="tpRodagem"
                value={data.explRod.tpRodagem}
                onChange={(value) => updateNestedField('explRod', 'tpRodagem', value)}
                required
                options={[
                  { value: '1', label: 'Simples' },
                  { value: '2', label: 'Dupla' }
                ]}
              />

              <SelectField
                label="Sentido"
                name="sentido"
                value={data.explRod.sentido}
                onChange={(value) => updateNestedField('explRod', 'sentido', value)}
                required
                options={[
                  { value: '1', label: 'Norte' },
                  { value: '2', label: 'Sul' },
                  { value: '3', label: 'Leste' },
                  { value: '4', label: 'Oeste' }
                ]}
              />

              <InputField
                label="Placa do Veículo"
                name="placa"
                value={data.explRod.placa || ''}
                onChange={(value) => updateNestedField('explRod', 'placa', value)}
                maxLength={8}
                placeholder="Ex: ABC1234"
              />

              <InputField
                label="Código de Acesso"
                name="codAcesso"
                value={data.explRod.codAcesso || ''}
                onChange={(value) => updateNestedField('explRod', 'codAcesso', value)}
                maxLength={20}
              />

              <InputField
                label="Código do Contrato"
                name="codContrato"
                value={data.explRod.codContrato || ''}
                onChange={(value) => updateNestedField('explRod', 'codContrato', value)}
                maxLength={20}
              />
            </div>
          </FieldGroup>
        )}
      </div>
    </div>
  );

  // Componente para Informações Complementares
  const InfoComplementaresTab = () => (
    <FieldGroup
      title="Informações Complementares"
      description="Dados adicionais sobre o serviço (opcionais)"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          label="ID do Documento Técnico (ART/RRT/DRT)"
          name="idDocTec"
          value={data.infoCompl?.idDocTec || ''}
          onChange={(value) => updateInfoComplementar('idDocTec', value)}
          maxLength={30}
          placeholder="Ex: ART123456789"
          help="Número da ART, RRT ou DRT quando aplicável"
        />

        <InputField
          label="Documento de Referência"
          name="docRef"
          value={data.infoCompl?.docRef || ''}
          onChange={(value) => updateInfoComplementar('docRef', value)}
          maxLength={50}
          placeholder="Ex: Contrato nº 123/2024"
          help="Documento que originou o serviço"
        />
      </div>

      <TextAreaField
        label="Informações Complementares"
        name="xInfComp"
        value={data.infoCompl?.xInfComp || ''}
        onChange={(value) => updateInfoComplementar('xInfComp', value)}
        maxLength={2000}
        rows={4}
        placeholder="Informações adicionais sobre o serviço..."
        help="Campo livre para informações complementares"
      />
    </FieldGroup>
  );

  const tabs = [
    {
      id: 'local-prestacao',
      label: 'Local da Prestação',
      content: <LocalPrestacaoTab />
    },
    {
      id: 'codigo-servico',
      label: 'Código do Serviço',
      content: <CodigoServicoTab />
    },
    {
      id: 'comercio-exterior',
      label: 'Comércio Exterior',
      content: <ComercioExteriorTab />
    },
    {
      id: 'especialidades',
      label: 'Especialidades',
      content: <EspecialidadesTab />
    },
    {
      id: 'info-complementares',
      label: 'Informações Complementares',
      content: <InfoComplementaresTab />
    }
  ];

  return (
    <div className="space-y-6">
      <div className="border border-gray-200 rounded-md p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-2">Sobre os Serviços</h3>
        <p className="text-sm text-gray-600">
          Configure aqui todos os dados relacionados ao serviço prestado. Use as abas para navegar 
          entre as diferentes categorias de informações. As especialidades são opcionais e devem 
          ser habilitadas apenas quando aplicáveis ao tipo de serviço.
        </p>
      </div>

      <SubTabs tabs={tabs} defaultTab="local-prestacao" />
    </div>
  );
}