'use client';

import { useCallback, useMemo } from 'react';
import { InputField, SelectField, CheckboxField, FieldGroup } from '../../ui/FormField';
import { FocusStableNumeric } from '../../ui/FocusStableNumeric';
import { SubTabs } from '../../ui/Tabs';
import { ValoresCompletos } from '../../../types/nfse/complete';

interface ValoresFormProps {
  data: ValoresCompletos;
  onChange: (data: Partial<ValoresCompletos>) => void;
}

export default function ValoresForm({ data, onChange }: ValoresFormProps) {
  // Garantir estrutura mínima dos dados para evitar erros de undefined
  const safeData = useMemo(() => {
    const defaultTribMun = {
      tribISSQN: '1' as const,
      pAliq: 0,
      tpRetISSQN: '1' as const
    };

    return {
      ...data,
      vServPrest: data?.vServPrest || { vServ: 0 },
      trib: {
        ...data?.trib,
        tribMun: {
          ...defaultTribMun,
          ...data?.trib?.tribMun
        },
        tribFed: data?.trib?.tribFed || {},
        totTrib: data?.trib?.totTrib || {}
      }
    };
  }, [data]);
  const updateField = useCallback((field: string, value: any) => {
    onChange({ [field]: value });
  }, [onChange]);

  const updateNestedField = useCallback((section: string, field: string, value: any) => {
    onChange({
      [section]: {
        ...data[section as keyof ValoresCompletos],
        [field]: value
      }
    });
  }, [onChange, data]);

  const updateDeepNestedField = useCallback((section: string, subsection: string, field: string, value: any) => {
    onChange({
      [section]: {
        ...data[section as keyof ValoresCompletos],
        [subsection]: {
          ...(data[section as keyof ValoresCompletos] as any)?.[subsection],
          [field]: value
        }
      }
    });
  }, [onChange, data]);

  // Estados para controlar quais seções estão ativas - usar data original para refletir estado real
  const hasDescontos = !!data?.vDescCondIncond;
  const hasDeducoes = !!data?.vDedRed;
  const hasTributacaoFederal = !!data?.trib?.tribFed && Object.keys(data.trib.tribFed).length > 0;
  const hasTotalTributos = !!data?.trib?.totTrib && Object.keys(data.trib.totTrib).length > 0;
  const hasBeneficioMunicipal = !!data?.trib?.tribMun?.BM;
  const hasExigibilidadeSuspensa = !!data?.trib?.tribMun?.exigSusp;
  const hasPisCofins = !!data?.trib?.tribFed?.piscofins;

  // Callbacks específicos para cada checkbox
  const toggleDescontos = useCallback((checked: boolean) => {
    if (checked) {
      onChange({ vDescCondIncond: { vDescIncond: 0, vDescCond: 0 } });
    } else {
      const newData = { ...data };
      delete newData.vDescCondIncond;
      onChange(newData);
    }
  }, [onChange, data]);

  const toggleDeducoes = useCallback((checked: boolean) => {
    if (checked) {
      onChange({ vDedRed: { pDR: 0 } });
    } else {
      const newData = { ...data };
      delete newData.vDedRed;
      onChange(newData);
    }
  }, [onChange, data]);

  const toggleBeneficioMunicipal = useCallback((checked: boolean) => {
    if (checked) {
      onChange({
        trib: {
          ...data.trib,
          tribMun: {
            ...data.trib.tribMun,
            BM: { tpBM: '', nBM: '' }
          }
        }
      });
    } else {
      const newTribMun = { ...data.trib.tribMun };
      delete newTribMun.BM;
      onChange({
        trib: {
          ...data.trib,
          tribMun: newTribMun
        }
      });
    }
  }, [onChange, data]);

  const toggleExigibilidadeSuspensa = useCallback((checked: boolean) => {
    if (checked) {
      onChange({
        trib: {
          ...data.trib,
          tribMun: {
            ...data.trib.tribMun,
            exigSusp: { tpSusp: '', nProcesso: '' }
          }
        }
      });
    } else {
      const newTribMun = { ...data.trib.tribMun };
      delete newTribMun.exigSusp;
      onChange({
        trib: {
          ...data.trib,
          tribMun: newTribMun
        }
      });
    }
  }, [onChange, data]);

  const toggleTributacaoFederal = useCallback((checked: boolean) => {
    if (checked) {
      onChange({
        trib: {
          ...data.trib,
          tribFed: { vRetCP: 0, vRetIRRF: 0, vRetCSLL: 0 }
        }
      });
    } else {
      const newTrib = { ...data.trib };
      delete newTrib.tribFed;
      onChange({ trib: newTrib });
    }
  }, [onChange, data]);

  const togglePisCofins = useCallback((checked: boolean) => {
    if (checked) {
      onChange({
        trib: {
          ...data.trib,
          tribFed: {
            ...data.trib.tribFed,
            piscofins: { CST: '', vPis: 0, vCofins: 0 }
          }
        }
      });
    } else {
      const newTribFed = { ...data.trib.tribFed };
      delete newTribFed.piscofins;
      onChange({
        trib: {
          ...data.trib,
          tribFed: newTribFed
        }
      });
    }
  }, [onChange, data]);

  const toggleTotalTributos = useCallback((checked: boolean) => {
    if (checked) {
      onChange({
        trib: {
          ...data.trib,
          totTrib: {
            vTotTrib: { vTotTribFed: 0, vTotTribEst: 0, vTotTribMun: 0 }
          }
        }
      });
    } else {
      const newTrib = { ...data.trib };
      delete newTrib.totTrib;
      onChange({ trib: newTrib });
    }
  }, [onChange, data]);


  // Função para calcular valores automaticamente
  const calcularValores = useCallback(() => {
    const vServ = safeData.vServPrest.vServ || 0;
    const vDescIncond = safeData.vDescCondIncond?.vDescIncond || 0;
    const vDescCond = safeData.vDescCondIncond?.vDescCond || 0;
    const vDR = safeData.vDedRed?.vDR || 0;
    const pAliq = safeData.trib.tribMun.pAliq || 0;

    const vBC = vServ - vDescIncond - vDescCond - vDR;
    const vISS = (vBC * pAliq) / 100;
    const vLiq = vServ - vISS;

    // Atualizar valores calculados
    updateDeepNestedField('trib', 'tribMun', 'vBC', vBC);
    updateDeepNestedField('trib', 'tribMun', 'vISS', vISS);
    updateField('vLiq', vLiq);
  }, [safeData, updateDeepNestedField, updateField]);

  // Callbacks estáveis para campos específicos para evitar perda de foco
  const handleNBMChange = useCallback((value: string) => {
    updateDeepNestedField('trib', 'tribMun', 'BM', { 
      ...safeData.trib.tribMun.BM, 
      nBM: value 
    });
  }, [updateDeepNestedField, safeData.trib.tribMun.BM]);

  const handleNProcessoChange = useCallback((value: string) => {
    updateDeepNestedField('trib', 'tribMun', 'exigSusp', { 
      ...safeData.trib.tribMun.exigSusp, 
      nProcesso: value 
    });
  }, [updateDeepNestedField, safeData.trib.tribMun.exigSusp]);

  // Tab 1: Valores do Serviço
  const ValoresServicoTab = () => (
    <FieldGroup
      title="Valores do Serviço Prestado"
      description="Valores básicos relacionados ao serviço"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FocusStableNumeric
          label="Valor do Serviço"
          name="vServ"
          value={safeData.vServPrest.vServ}
          onChange={(value) => updateNestedField('vServPrest', 'vServ', value || 0)}
          required
          min={0}
          help="Valor total do serviço prestado"
        />

        <FocusStableNumeric
          label="Valor Recebido pelo Intermediário"
          name="vReceb"
          value={safeData.vServPrest.vReceb}
          onChange={(value) => updateNestedField('vServPrest', 'vReceb', value)}
          min={0}
          help="Valor que o intermediário recebe (se houver)"
        />
      </div>

      <div className="mt-4">
        <button
          type="button"
          onClick={calcularValores}
          className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
        >
          Recalcular Valores
        </button>
        <p className="text-xs text-gray-500 mt-1">
          Clique para recalcular base de cálculo, ISS e valor líquido automaticamente
        </p>
      </div>
    </FieldGroup>
  );

  // Tab 2: Descontos
  const DescontosTab = () => (
    <div className="space-y-6">
      <CheckboxField
        label="Aplicar Descontos"
        name="hasDescontos"
        checked={hasDescontos}
        onChange={toggleDescontos}
        help="Marque se há descontos a serem aplicados"
      />

      {hasDescontos && safeData.vDescCondIncond && (
        <FieldGroup
          title="Descontos Condicionais e Incondicionais"
          description="Valores de desconto aplicados ao serviço"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FocusStableNumeric
              label="Desconto Incondicional"
              name="vDescIncond"
              value={safeData.vDescCondIncond.vDescIncond}
              onChange={(value) => updateNestedField('vDescCondIncond', 'vDescIncond', value || 0)}
              min={0}
              help="Desconto garantido independente de condições"
            />

            <FocusStableNumeric
              label="Desconto Condicional"
              name="vDescCond"
              value={safeData.vDescCondIncond.vDescCond}
              onChange={(value) => updateNestedField('vDescCondIncond', 'vDescCond', value || 0)}
              min={0}
              help="Desconto condicionado a critérios específicos"
            />
          </div>
        </FieldGroup>
      )}
    </div>
  );

  // Tab 3: Deduções/Reduções
  const DeducoesTab = () => (
    <div className="space-y-6">
      <CheckboxField
        label="Aplicar Deduções/Reduções"
        name="hasDeducoes"
        checked={hasDeducoes}
        onChange={toggleDeducoes}
        help="Marque se há deduções ou reduções a serem aplicadas"
      />

      {hasDeducoes && safeData.vDedRed && (
        <FieldGroup
          title="Deduções e Reduções"
          description="Valores ou percentuais de dedução aplicados"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FocusStableNumeric
              label="Percentual de Dedução/Redução (%)"
              name="pDR"
              value={safeData.vDedRed.pDR}
              onChange={(value) => {
                updateNestedField('vDedRed', 'pDR', value);
                // Limpar valor se percentual for definido
                if (value) {
                  updateNestedField('vDedRed', 'vDR', undefined);
                }
              }}
              min={0}
              max={100}
              help="Percentual de dedução sobre o valor do serviço"
            />

            <FocusStableNumeric
              label="Valor da Dedução/Redução"
              name="vDR"
              value={safeData.vDedRed.vDR}
              onChange={(value) => {
                updateNestedField('vDedRed', 'vDR', value);
                // Limpar percentual se valor for definido
                if (value) {
                  updateNestedField('vDedRed', 'pDR', undefined);
                }
              }}
              min={0}
              help="Valor fixo de dedução (use OU percentual OU valor)"
            />
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <p className="text-sm text-yellow-800">
              <strong>Atenção:</strong> Use APENAS percentual OU valor, não ambos. 
              O sistema também suporta dedução por documentos (não implementado nesta versão).
            </p>
          </div>
        </FieldGroup>
      )}
    </div>
  );

  // Tab 4: Tributação Municipal
  const TributacaoMunicipalTab = () => (
    <div className="space-y-6">
      <FieldGroup
        title="ISSQN - Imposto Sobre Serviços"
        description="Configurações da tributação municipal"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <SelectField
            label="Tributação do ISSQN"
            name="tribISSQN"
            value={safeData.trib.tribMun.tribISSQN}
            onChange={(value) => updateDeepNestedField('trib', 'tribMun', 'tribISSQN', value)}
            required
            options={[
              { value: '1', label: 'Tributável' },
              { value: '2', label: 'Exportação de Serviços' },
              { value: '3', label: 'Não Incidência' },
              { value: '4', label: 'Imunidade' }
            ]}
            help="Situação da tributação do ISSQN"
          />

          {safeData.trib.tribMun.tribISSQN === '2' && (
            <InputField
              label="País de Resultado do Serviço"
              name="cPaisResult"
              value={safeData.trib.tribMun.cPaisResult || ''}
              onChange={(value) => updateDeepNestedField('trib', 'tribMun', 'cPaisResult', value)}
              maxLength={3}
              placeholder="Ex: USA, FRA"
              help="Código do país onde o serviço produz efeito"
            />
          )}

          {safeData.trib.tribMun.tribISSQN === '4' && (
            <SelectField
              label="Tipo de Imunidade"
              name="tpImunidade"
              value={safeData.trib.tribMun.tpImunidade || ''}
              onChange={(value) => updateDeepNestedField('trib', 'tribMun', 'tpImunidade', value)}
              options={[
                { value: '1', label: 'Patrimônio, renda ou serviços da União, Estados, DF e Municípios' },
                { value: '2', label: 'Templos de qualquer culto' },
                { value: '3', label: 'Patrimônio, renda ou serviços dos partidos políticos' },
                { value: '4', label: 'Patrimônio, renda ou serviços das instituições de educação e assistência social' },
                { value: '5', label: 'Livros, jornais, periódicos e papel destinado à sua impressão' }
              ]}
              help="Tipo de imunidade aplicável"
            />
          )}

          {safeData.trib.tribMun.tribISSQN === '1' && (
            <>
              <FocusStableNumeric
                label="Alíquota do ISSQN (%)"
                name="pAliq"
                value={safeData.trib.tribMun.pAliq}
                onChange={(value) => updateDeepNestedField('trib', 'tribMun', 'pAliq', value)}
                min={0}
                max={100}
                help="Alíquota aplicável ao serviço"
              />

              <SelectField
                label="Retenção do ISSQN"
                name="tpRetISSQN"
                value={safeData.trib.tribMun.tpRetISSQN}
                onChange={(value) => updateDeepNestedField('trib', 'tribMun', 'tpRetISSQN', value)}
                options={[
                  { value: '1', label: 'Sem retenção' },
                  { value: '2', label: 'Com retenção' }
                ]}
                help="Indica se há retenção do ISSQN"
              />
            </>
          )}
        </div>
      </FieldGroup>

      {/* Benefício Municipal */}
      <div>
        <CheckboxField
          label="Benefício Municipal"
          name="hasBeneficioMunicipal"
          checked={hasBeneficioMunicipal}
          onChange={toggleBeneficioMunicipal}
          help="Marque se há benefício municipal aplicável"
        />

        {hasBeneficioMunicipal && safeData.trib.tribMun.BM && (
          <FieldGroup
            title="Dados do Benefício Municipal"
            description="Informações sobre benefício fiscal municipal"
            className="mt-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SelectField
                label="Tipo de Benefício"
                name="tpBM"
                value={safeData.trib.tribMun.BM.tpBM}
                onChange={(value) => updateDeepNestedField('trib', 'tribMun', 'BM', { ...safeData.trib.tribMun.BM, tpBM: value })}
                required
                options={[
                  { value: '1', label: 'Redução da base de cálculo' },
                  { value: '2', label: 'Redução da alíquota' },
                  { value: '3', label: 'Isenção' },
                  { value: '4', label: 'Não incidência' }
                ]}
              />

              <InputField
                label="Número do Benefício"
                name="nBM"
                value={safeData.trib.tribMun.BM.nBM}
                onChange={handleNBMChange}
                required
                maxLength={14}
                placeholder="Ex: 12345678901234"
                help="Número do benefício municipal"
              />

              <FocusStableNumeric
                label="Valor da Redução da Base de Cálculo"
                name="vRedBCBM"
                value={safeData.trib.tribMun.BM.vRedBCBM}
                onChange={(value) => {
                  updateDeepNestedField('trib', 'tribMun', 'BM', { 
                    ...safeData.trib.tribMun.BM, 
                    vRedBCBM: value 
                  });
                }}
                min={0}
                help="Valor da redução quando tipo = 1"
              />
            </div>
          </FieldGroup>
        )}
      </div>

      {/* Exigibilidade Suspensa */}
      <div>
        <CheckboxField
          label="Exigibilidade Suspensa"
          name="hasExigibilidadeSuspensa"
          checked={hasExigibilidadeSuspensa}
          onChange={toggleExigibilidadeSuspensa}
          help="Marque se há suspensão da exigibilidade"
        />

        {hasExigibilidadeSuspensa && safeData.trib.tribMun.exigSusp && (
          <FieldGroup
            title="Dados da Exigibilidade Suspensa"
            description="Informações sobre suspensão da exigibilidade do tributo"
            className="mt-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SelectField
                label="Tipo de Suspensão"
                name="tpSusp"
                value={safeData.trib.tribMun.exigSusp.tpSusp}
                onChange={(value) => updateDeepNestedField('trib', 'tribMun', 'exigSusp', { 
                  ...safeData.trib.tribMun.exigSusp, 
                  tpSusp: value 
                })}
                required
                options={[
                  { value: '1', label: 'Decisão judicial' },
                  { value: '2', label: 'Processo administrativo' },
                  { value: '3', label: 'Legislação tributária' }
                ]}
              />

              <InputField
                label="Número do Processo"
                name="nProcesso"
                value={safeData.trib.tribMun.exigSusp.nProcesso}
                onChange={handleNProcessoChange}
                required
                maxLength={20}
                placeholder="Ex: 1234567-89.2024.8.26.0001"
              />
            </div>
          </FieldGroup>
        )}
      </div>
    </div>
  );

  // Tab 5: Tributação Federal
  const TributacaoFederalTab = () => (
    <div className="space-y-6">
      <CheckboxField
        label="Aplicar Tributação Federal"
        name="hasTributacaoFederal"
        checked={hasTributacaoFederal}
        onChange={toggleTributacaoFederal}
        help="Marque se há tributação federal (PIS/COFINS, retenções)"
      />

      {hasTributacaoFederal && safeData.trib.tribFed && (
        <div className="space-y-6">
          {/* PIS/COFINS */}
          <div>
            <CheckboxField
              label="PIS/COFINS"
              name="hasPisCofins"
              checked={hasPisCofins}
              onChange={togglePisCofins}
              help="Marque se há incidência de PIS/COFINS"
            />

            {hasPisCofins && safeData.trib.tribFed?.piscofins && (
              <FieldGroup
                title="PIS e COFINS"
                description="Configurações do PIS e COFINS"
                className="mt-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <SelectField
                    label="CST PIS/COFINS"
                    name="CST"
                    value={safeData.trib.tribFed!.piscofins!.CST}
                    onChange={(value) => updateDeepNestedField('trib', 'tribFed', 'piscofins', { 
                      ...safeData.trib.tribFed!.piscofins, 
                      CST: value 
                    })}
                    required
                    options={[
                      { value: '00', label: '00 - Operação Tributável' },
                      { value: '01', label: '01 - Operação Tributável com Alíquota Diferenciada' },
                      { value: '02', label: '02 - Operação Tributável sem Incidência da Contribuição' },
                      { value: '03', label: '03 - Operação Tributável com Suspensão da Contribuição' },
                      { value: '04', label: '04 - Operação Tributável com Alíquota Zero' },
                      { value: '05', label: '05 - Operação Tributável com Isenção da Contribuição' },
                      { value: '49', label: '49 - Outras Operações de Saída' },
                      { value: '99', label: '99 - Outras Operações' }
                    ]}
                  />

                  <FocusStableNumeric
                    label="Base de Cálculo PIS/COFINS"
                    name="vBCPisCofins"
                    value={safeData.trib.tribFed!.piscofins!.vBCPisCofins}
                    onChange={(value) => updateDeepNestedField('trib', 'tribFed', 'piscofins', { 
                      ...safeData.trib.tribFed!.piscofins!, 
                      vBCPisCofins: value 
                    })}
                    min={0}
                    help="Base de cálculo para PIS/COFINS"
                  />

                  <FocusStableNumeric
                    label="Alíquota PIS (%)"
                    name="pAliqPis"
                    value={safeData.trib.tribFed!.piscofins!.pAliqPis}
                    onChange={(value) => updateDeepNestedField('trib', 'tribFed', 'piscofins', { 
                      ...safeData.trib.tribFed!.piscofins!, 
                      pAliqPis: value 
                    })}
                    min={0}
                    help="Alíquota do PIS"
                  />

                  <FocusStableNumeric
                    label="Alíquota COFINS (%)"
                    name="pAliqCofins"
                    value={safeData.trib.tribFed!.piscofins!.pAliqCofins}
                    onChange={(value) => updateDeepNestedField('trib', 'tribFed', 'piscofins', { 
                      ...safeData.trib.tribFed!.piscofins!, 
                      pAliqCofins: value 
                    })}
                    min={0}
                    help="Alíquota do COFINS"
                  />

                  <FocusStableNumeric
                    label="Valor PIS"
                    name="vPis"
                    value={safeData.trib.tribFed!.piscofins!.vPis}
                    onChange={(value) => updateDeepNestedField('trib', 'tribFed', 'piscofins', { 
                      ...safeData.trib.tribFed!.piscofins!, 
                      vPis: value || 0 
                    })}
                    min={0}
                    help="Valor calculado do PIS"
                  />

                  <FocusStableNumeric
                    label="Valor COFINS"
                    name="vCofins"
                    value={safeData.trib.tribFed!.piscofins!.vCofins}
                    onChange={(value) => updateDeepNestedField('trib', 'tribFed', 'piscofins', { 
                      ...safeData.trib.tribFed!.piscofins!, 
                      vCofins: value || 0 
                    })}
                    min={0}
                    help="Valor calculado do COFINS"
                  />

                  <SelectField
                    label="Retenção PIS/COFINS"
                    name="tpRetPisCofins"
                    value={safeData.trib.tribFed!.piscofins!.tpRetPisCofins || '2'}
                    onChange={(value) => updateDeepNestedField('trib', 'tribFed', 'piscofins', { 
                      ...safeData.trib.tribFed!.piscofins!, 
                      tpRetPisCofins: value 
                    })}
                    options={[
                      { value: '1', label: 'Retido na fonte' },
                      { value: '2', label: 'Não retido' }
                    ]}
                    help="Indica se há retenção na fonte"
                  />
                </div>
              </FieldGroup>
            )}
          </div>

          {/* Outras Retenções */}
          <FieldGroup
            title="Outras Retenções Federais"
            description="Valores retidos de IR, CSLL e Contribuição Previdenciária"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FocusStableNumeric
                label="Valor Retido Contribuição Previdenciária"
                name="vRetCP"
                value={safeData.trib.tribFed!.vRetCP}
                onChange={(value) => updateNestedField('trib', 'tribFed', { 
                  ...safeData.trib.tribFed!, 
                  vRetCP: value || 0 
                })}
                min={0}
                help="INSS retido na fonte"
              />

              <FocusStableNumeric
                label="Valor Retido IRRF"
                name="vRetIRRF"
                value={safeData.trib.tribFed!.vRetIRRF}
                onChange={(value) => updateNestedField('trib', 'tribFed', { 
                  ...safeData.trib.tribFed!, 
                  vRetIRRF: value || 0 
                })}
                min={0}
                help="Imposto de Renda retido na fonte"
              />

              <FocusStableNumeric
                label="Valor Retido CSLL"
                name="vRetCSLL"
                value={safeData.trib.tribFed!.vRetCSLL}
                onChange={(value) => updateNestedField('trib', 'tribFed', { 
                  ...safeData.trib.tribFed!, 
                  vRetCSLL: value || 0 
                })}
                min={0}
                help="Contribuição Social sobre Lucro Líquido retida"
              />
            </div>
          </FieldGroup>
        </div>
      )}
    </div>
  );

  // Tab 6: Total de Tributos
  const TotalTributosTab = () => (
    <div className="space-y-6">
      <CheckboxField
        label="Informar Total de Tributos"
        name="hasTotalTributos"
        checked={hasTotalTributos}
        onChange={toggleTotalTributos}
        help="Marque para informar o total de tributos incidentes"
      />

      {hasTotalTributos && safeData.trib.totTrib && (
        <FieldGroup
          title="Total de Tributos Incidentes"
          description="Totalização dos tributos federais, estaduais e municipais"
        >
          {safeData.trib.totTrib?.vTotTrib && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FocusStableNumeric
                label="Total Tributos Federais"
                name="vTotTribFed"
                value={safeData.trib.totTrib!.vTotTrib!.vTotTribFed}
                onChange={(value) => updateDeepNestedField('trib', 'totTrib', 'vTotTrib', { 
                  ...safeData.trib.totTrib!.vTotTrib!, 
                  vTotTribFed: value || 0 
                })}
                min={0}
                help="Soma de todos os tributos federais"
              />

              <FocusStableNumeric
                label="Total Tributos Estaduais"
                name="vTotTribEst"
                value={safeData.trib.totTrib!.vTotTrib!.vTotTribEst}
                onChange={(value) => updateDeepNestedField('trib', 'totTrib', 'vTotTrib', { 
                  ...safeData.trib.totTrib!.vTotTrib!, 
                  vTotTribEst: value || 0 
                })}
                min={0}
                help="Soma de todos os tributos estaduais"
              />

              <FocusStableNumeric
                label="Total Tributos Municipais"
                name="vTotTribMun"
                value={safeData.trib.totTrib!.vTotTrib!.vTotTribMun}
                onChange={(value) => updateDeepNestedField('trib', 'totTrib', 'vTotTrib', { 
                  ...safeData.trib.totTrib!.vTotTrib!, 
                  vTotTribMun: value || 0 
                })}
                min={0}
                help="Soma de todos os tributos municipais (ISSQN)"
              />
            </div>
          )}
        </FieldGroup>
      )}
    </div>
  );

  const tabs = [
    {
      id: 'valores-servico',
      label: 'Valores do Serviço',
      content: <ValoresServicoTab />
    },
    {
      id: 'descontos',
      label: 'Descontos',
      content: <DescontosTab />
    },
    {
      id: 'deducoes',
      label: 'Deduções/Reduções',
      content: <DeducoesTab />
    },
    {
      id: 'tributacao-municipal',
      label: 'Tributação Municipal',
      content: <TributacaoMunicipalTab />
    },
    {
      id: 'tributacao-federal',
      label: 'Tributação Federal',
      content: <TributacaoFederalTab />
    },
    {
      id: 'total-tributos',
      label: 'Total de Tributos',
      content: <TotalTributosTab />
    }
  ];

  return (
    <div className="space-y-6">
      <div className="border border-gray-200 rounded-md p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-2">Valores e Tributação</h3>
        <p className="text-sm text-gray-600">
          Configure aqui todos os valores e tributos relacionados ao serviço. O sistema pode 
          calcular automaticamente a base de cálculo, ISS e valor líquido baseado nos valores 
          informados. Use as seções opcionais apenas quando aplicáveis.
        </p>
      </div>

      <SubTabs tabs={tabs} defaultTab="valores-servico" />
    </div>
  );
}