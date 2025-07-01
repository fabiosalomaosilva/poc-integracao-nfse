'use client';

// import { useState } from 'react';
import { InputField, SelectField, CheckboxField, FieldGroup } from '../../ui/FormField';
import { SubTabs } from '../../ui/Tabs';
import { ValoresCompletos } from '../../../types/nfse/complete';

interface ValoresFormProps {
  data: ValoresCompletos;
  onChange: (data: ValoresCompletos) => void;
}

export default function ValoresForm({ data, onChange }: ValoresFormProps) {
  const updateField = (field: string, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const updateNestedField = (section: string, field: string, value: any) => {
    onChange({
      ...data,
      [section]: {
        ...data[section as keyof ValoresCompletos],
        [field]: value
      }
    });
  };

  const updateDeepNestedField = (section: string, subsection: string, field: string, value: any) => {
    onChange({
      ...data,
      [section]: {
        ...data[section as keyof ValoresCompletos],
        [subsection]: {
          ...(data[section as keyof ValoresCompletos] as any)?.[subsection],
          [field]: value
        }
      }
    });
  };

  // Estados para controlar quais seções estão ativas
  const hasDescontos = !!data.vDescCondIncond;
  const hasDeducoes = !!data.vDedRed;
  const hasTributacaoFederal = !!data.trib.tribFed;
  const hasTotalTributos = !!data.trib.totTrib;
  const hasBeneficioMunicipal = !!data.trib.tribMun.BM;
  const hasExigibilidadeSuspensa = !!data.trib.tribMun.exigSusp;
  const hasPisCofins = !!data.trib.tribFed?.piscofins;

  const toggleSection = (section: string, ativo: boolean) => {
    if (ativo) {
      switch (section) {
        case 'vDescCondIncond':
          updateField('vDescCondIncond', { vDescIncond: 0, vDescCond: 0 });
          break;
        case 'vDedRed':
          updateField('vDedRed', { pDR: 0 });
          break;
        case 'tribFed':
          updateNestedField('trib', 'tribFed', {
            vRetCP: 0,
            vRetIRRF: 0,
            vRetCSLL: 0
          });
          break;
        case 'totTrib':
          updateDeepNestedField('trib', 'totTrib', 'vTotTrib', {
            vTotTribFed: 0,
            vTotTribEst: 0,
            vTotTribMun: 0
          });
          break;
        case 'BM':
          updateDeepNestedField('trib', 'tribMun', 'BM', {
            tpBM: '',
            nBM: ''
          });
          break;
        case 'exigSusp':
          updateDeepNestedField('trib', 'tribMun', 'exigSusp', {
            tpSusp: '',
            nProcesso: ''
          });
          break;
        case 'piscofins':
          updateDeepNestedField('trib', 'tribFed', 'piscofins', {
            CST: '',
            vPis: 0,
            vCofins: 0
          });
          break;
      }
    } else {
      if (section.includes('.')) {
        const [mainSection, subSection] = section.split('.');
        const currentData = { ...data[mainSection as keyof ValoresCompletos] as any };
        delete currentData[subSection];
        updateField(mainSection, currentData);
      } else {
        const newData = { ...data };
        delete newData[section as keyof ValoresCompletos];
        onChange(newData);
      }
    }
  };

  // Função para calcular valores automaticamente
  const calcularValores = () => {
    const vServ = data.vServPrest.vServ || 0;
    const vDescIncond = data.vDescCondIncond?.vDescIncond || 0;
    const vDescCond = data.vDescCondIncond?.vDescCond || 0;
    const vDR = data.vDedRed?.vDR || 0;
    const pAliq = data.trib.tribMun.pAliq || 0;

    const vBC = vServ - vDescIncond - vDescCond - vDR;
    const vISS = (vBC * pAliq) / 100;
    const vLiq = vServ - vISS;

    // Atualizar valores calculados
    updateDeepNestedField('trib', 'tribMun', 'vBC', vBC);
    updateDeepNestedField('trib', 'tribMun', 'vISS', vISS);
    updateField('vLiq', vLiq);
  };

  // Tab 1: Valores do Serviço
  const ValoresServicoTab = () => (
    <FieldGroup
      title="Valores do Serviço Prestado"
      description="Valores básicos relacionados ao serviço"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField
          label="Valor do Serviço"
          name="vServ"
          type="number"
          step="0.01"
          min="0"
          value={data.vServPrest.vServ}
          onChange={(value) => {
            updateNestedField('vServPrest', 'vServ', parseFloat(value) || 0);
            setTimeout(calcularValores, 100);
          }}
          required
          help="Valor total do serviço prestado"
        />

        <InputField
          label="Valor Recebido pelo Intermediário"
          name="vReceb"
          type="number"
          step="0.01"
          min="0"
          value={data.vServPrest.vReceb || ''}
          onChange={(value) => updateNestedField('vServPrest', 'vReceb', parseFloat(value) || undefined)}
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
        onChange={(checked) => toggleSection('vDescCondIncond', checked)}
        help="Marque se há descontos a serem aplicados"
      />

      {hasDescontos && data.vDescCondIncond && (
        <FieldGroup
          title="Descontos Condicionais e Incondicionais"
          description="Valores de desconto aplicados ao serviço"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Desconto Incondicional"
              name="vDescIncond"
              type="number"
              step="0.01"
              min="0"
              value={data.vDescCondIncond.vDescIncond || 0}
              onChange={(value) => {
                updateNestedField('vDescCondIncond', 'vDescIncond', parseFloat(value) || 0);
                setTimeout(calcularValores, 100);
              }}
              help="Desconto garantido independente de condições"
            />

            <InputField
              label="Desconto Condicional"
              name="vDescCond"
              type="number"
              step="0.01"
              min="0"
              value={data.vDescCondIncond.vDescCond || 0}
              onChange={(value) => {
                updateNestedField('vDescCondIncond', 'vDescCond', parseFloat(value) || 0);
                setTimeout(calcularValores, 100);
              }}
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
        onChange={(checked) => toggleSection('vDedRed', checked)}
        help="Marque se há deduções ou reduções a serem aplicadas"
      />

      {hasDeducoes && data.vDedRed && (
        <FieldGroup
          title="Deduções e Reduções"
          description="Valores ou percentuais de dedução aplicados"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Percentual de Dedução/Redução (%)"
              name="pDR"
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={data.vDedRed.pDR || ''}
              onChange={(value) => {
                updateNestedField('vDedRed', 'pDR', parseFloat(value) || undefined);
                // Limpar valor se percentual for definido
                if (value) {
                  updateNestedField('vDedRed', 'vDR', undefined);
                }
                setTimeout(calcularValores, 100);
              }}
              help="Percentual de dedução sobre o valor do serviço"
            />

            <InputField
              label="Valor da Dedução/Redução"
              name="vDR"
              type="number"
              step="0.01"
              min="0"
              value={data.vDedRed.vDR || ''}
              onChange={(value) => {
                updateNestedField('vDedRed', 'vDR', parseFloat(value) || undefined);
                // Limpar percentual se valor for definido
                if (value) {
                  updateNestedField('vDedRed', 'pDR', undefined);
                }
                setTimeout(calcularValores, 100);
              }}
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
            value={data.trib.tribMun.tribISSQN}
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

          {data.trib.tribMun.tribISSQN === '2' && (
            <InputField
              label="País de Resultado do Serviço"
              name="cPaisResult"
              value={data.trib.tribMun.cPaisResult || ''}
              onChange={(value) => updateDeepNestedField('trib', 'tribMun', 'cPaisResult', value)}
              maxLength={3}
              placeholder="Ex: USA, FRA"
              help="Código do país onde o serviço produz efeito"
            />
          )}

          {data.trib.tribMun.tribISSQN === '4' && (
            <SelectField
              label="Tipo de Imunidade"
              name="tpImunidade"
              value={data.trib.tribMun.tpImunidade || ''}
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

          {data.trib.tribMun.tribISSQN === '1' && (
            <>
              <InputField
                label="Alíquota do ISSQN (%)"
                name="pAliq"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={data.trib.tribMun.pAliq || ''}
                onChange={(value) => {
                  updateDeepNestedField('trib', 'tribMun', 'pAliq', parseFloat(value) || undefined);
                  setTimeout(calcularValores, 100);
                }}
                help="Alíquota aplicável ao serviço"
              />

              <SelectField
                label="Retenção do ISSQN"
                name="tpRetISSQN"
                value={data.trib.tribMun.tpRetISSQN || '1'}
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
          onChange={(checked) => toggleSection('BM', checked)}
          help="Marque se há benefício municipal aplicável"
        />

        {hasBeneficioMunicipal && data.trib.tribMun.BM && (
          <FieldGroup
            title="Dados do Benefício Municipal"
            description="Informações sobre benefício fiscal municipal"
            className="mt-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SelectField
                label="Tipo de Benefício"
                name="tpBM"
                value={data.trib.tribMun.BM.tpBM}
                onChange={(value) => updateDeepNestedField('trib', 'tribMun', 'BM', { ...data.trib.tribMun.BM, tpBM: value })}
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
                value={data.trib.tribMun.BM.nBM}
                onChange={(value) => updateDeepNestedField('trib', 'tribMun', 'BM', { ...data.trib.tribMun.BM, nBM: value })}
                required
                maxLength={14}
                placeholder="Ex: 12345678901234"
              />

              <InputField
                label="Valor da Redução da Base de Cálculo"
                name="vRedBCBM"
                type="number"
                step="0.01"
                min="0"
                value={data.trib.tribMun.BM.vRedBCBM || ''}
                onChange={(value) => updateDeepNestedField('trib', 'tribMun', 'BM', { 
                  ...data.trib.tribMun.BM, 
                  vRedBCBM: parseFloat(value) || undefined 
                })}
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
          onChange={(checked) => toggleSection('exigSusp', checked)}
          help="Marque se há suspensão da exigibilidade"
        />

        {hasExigibilidadeSuspensa && data.trib.tribMun.exigSusp && (
          <FieldGroup
            title="Dados da Exigibilidade Suspensa"
            description="Informações sobre suspensão da exigibilidade do tributo"
            className="mt-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SelectField
                label="Tipo de Suspensão"
                name="tpSusp"
                value={data.trib.tribMun.exigSusp.tpSusp}
                onChange={(value) => updateDeepNestedField('trib', 'tribMun', 'exigSusp', { 
                  ...data.trib.tribMun.exigSusp, 
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
                value={data.trib.tribMun.exigSusp.nProcesso}
                onChange={(value) => updateDeepNestedField('trib', 'tribMun', 'exigSusp', { 
                  ...data.trib.tribMun.exigSusp, 
                  nProcesso: value 
                })}
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
        onChange={(checked) => toggleSection('tribFed', checked)}
        help="Marque se há tributação federal (PIS/COFINS, retenções)"
      />

      {hasTributacaoFederal && data.trib.tribFed && (
        <div className="space-y-6">
          {/* PIS/COFINS */}
          <div>
            <CheckboxField
              label="PIS/COFINS"
              name="hasPisCofins"
              checked={hasPisCofins}
              onChange={(checked) => toggleSection('piscofins', checked)}
              help="Marque se há incidência de PIS/COFINS"
            />

            {hasPisCofins && data.trib.tribFed!.piscofins && (
              <FieldGroup
                title="PIS e COFINS"
                description="Configurações do PIS e COFINS"
                className="mt-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <SelectField
                    label="CST PIS/COFINS"
                    name="CST"
                    value={data.trib.tribFed!.piscofins!.CST}
                    onChange={(value) => updateDeepNestedField('trib', 'tribFed', 'piscofins', { 
                      ...data.trib.tribFed!.piscofins, 
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

                  <InputField
                    label="Base de Cálculo PIS/COFINS"
                    name="vBCPisCofins"
                    type="number"
                    step="0.01"
                    min="0"
                    value={data.trib.tribFed!.piscofins!.vBCPisCofins || ''}
                    onChange={(value) => updateDeepNestedField('trib', 'tribFed', 'piscofins', { 
                      ...data.trib.tribFed!.piscofins!, 
                      vBCPisCofins: parseFloat(value) || undefined 
                    })}
                    help="Base de cálculo para PIS/COFINS"
                  />

                  <InputField
                    label="Alíquota PIS (%)"
                    name="pAliqPis"
                    type="number"
                    step="0.01"
                    min="0"
                    value={data.trib.tribFed!.piscofins!.pAliqPis || ''}
                    onChange={(value) => updateDeepNestedField('trib', 'tribFed', 'piscofins', { 
                      ...data.trib.tribFed!.piscofins!, 
                      pAliqPis: parseFloat(value) || undefined 
                    })}
                    help="Alíquota do PIS"
                  />

                  <InputField
                    label="Alíquota COFINS (%)"
                    name="pAliqCofins"
                    type="number"
                    step="0.01"
                    min="0"
                    value={data.trib.tribFed!.piscofins!.pAliqCofins || ''}
                    onChange={(value) => updateDeepNestedField('trib', 'tribFed', 'piscofins', { 
                      ...data.trib.tribFed!.piscofins!, 
                      pAliqCofins: parseFloat(value) || undefined 
                    })}
                    help="Alíquota do COFINS"
                  />

                  <InputField
                    label="Valor PIS"
                    name="vPis"
                    type="number"
                    step="0.01"
                    min="0"
                    value={data.trib.tribFed!.piscofins!.vPis || 0}
                    onChange={(value) => updateDeepNestedField('trib', 'tribFed', 'piscofins', { 
                      ...data.trib.tribFed!.piscofins!, 
                      vPis: parseFloat(value) || 0 
                    })}
                    help="Valor calculado do PIS"
                  />

                  <InputField
                    label="Valor COFINS"
                    name="vCofins"
                    type="number"
                    step="0.01"
                    min="0"
                    value={data.trib.tribFed!.piscofins!.vCofins || 0}
                    onChange={(value) => updateDeepNestedField('trib', 'tribFed', 'piscofins', { 
                      ...data.trib.tribFed!.piscofins!, 
                      vCofins: parseFloat(value) || 0 
                    })}
                    help="Valor calculado do COFINS"
                  />

                  <SelectField
                    label="Retenção PIS/COFINS"
                    name="tpRetPisCofins"
                    value={data.trib.tribFed!.piscofins!.tpRetPisCofins || '2'}
                    onChange={(value) => updateDeepNestedField('trib', 'tribFed', 'piscofins', { 
                      ...data.trib.tribFed!.piscofins!, 
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
              <InputField
                label="Valor Retido Contribuição Previdenciária"
                name="vRetCP"
                type="number"
                step="0.01"
                min="0"
                value={data.trib.tribFed!.vRetCP || 0}
                onChange={(value) => updateNestedField('tribFed', 'vRetCP', parseFloat(value) || 0)}
                help="INSS retido na fonte"
              />

              <InputField
                label="Valor Retido IRRF"
                name="vRetIRRF"
                type="number"
                step="0.01"
                min="0"
                value={data.trib.tribFed!.vRetIRRF || 0}
                onChange={(value) => updateNestedField('tribFed', 'vRetIRRF', parseFloat(value) || 0)}
                help="Imposto de Renda retido na fonte"
              />

              <InputField
                label="Valor Retido CSLL"
                name="vRetCSLL"
                type="number"
                step="0.01"
                min="0"
                value={data.trib.tribFed!.vRetCSLL || 0}
                onChange={(value) => updateNestedField('tribFed', 'vRetCSLL', parseFloat(value) || 0)}
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
        onChange={(checked) => toggleSection('totTrib', checked)}
        help="Marque para informar o total de tributos incidentes"
      />

      {hasTotalTributos && data.trib.totTrib && (
        <FieldGroup
          title="Total de Tributos Incidentes"
          description="Totalização dos tributos federais, estaduais e municipais"
        >
          {data.trib.totTrib!.vTotTrib && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InputField
                label="Total Tributos Federais"
                name="vTotTribFed"
                type="number"
                step="0.01"
                min="0"
                value={data.trib.totTrib!.vTotTrib!.vTotTribFed}
                onChange={(value) => updateDeepNestedField('trib', 'totTrib', 'vTotTrib', { 
                  ...data.trib.totTrib!.vTotTrib!, 
                  vTotTribFed: parseFloat(value) || 0 
                })}
                help="Soma de todos os tributos federais"
              />

              <InputField
                label="Total Tributos Estaduais"
                name="vTotTribEst"
                type="number"
                step="0.01"
                min="0"
                value={data.trib.totTrib!.vTotTrib!.vTotTribEst}
                onChange={(value) => updateDeepNestedField('trib', 'totTrib', 'vTotTrib', { 
                  ...data.trib.totTrib!.vTotTrib!, 
                  vTotTribEst: parseFloat(value) || 0 
                })}
                help="Soma de todos os tributos estaduais"
              />

              <InputField
                label="Total Tributos Municipais"
                name="vTotTribMun"
                type="number"
                step="0.01"
                min="0"
                value={data.trib.totTrib!.vTotTrib!.vTotTribMun}
                onChange={(value) => updateDeepNestedField('trib', 'totTrib', 'vTotTrib', { 
                  ...data.trib.totTrib!.vTotTrib!, 
                  vTotTribMun: parseFloat(value) || 0 
                })}
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