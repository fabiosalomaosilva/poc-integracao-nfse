import { XMLBuilder, XMLUtils } from './xmlBuilder';
import { CompleteDPSData, CompleteNFSeData } from '../../types/nfse/complete';

// Helper para formatar números de forma segura
function safeToFixed(value: number | undefined, decimals: number = 2): string | undefined {
  return value !== undefined && value !== null && !isNaN(value) ? value.toFixed(decimals) : undefined;
}

export class CompleteNFSeGenerator {
  private xmlBuilder: XMLBuilder;

  constructor() {
    this.xmlBuilder = new XMLBuilder();
  }

  // Gera DPS completo
  generateDPSXML(data: CompleteDPSData): string {
    this.xmlBuilder.clear();

    this.xmlBuilder
      .openElement('DPS', {
        'xmlns': 'http://www.sped.fazenda.gov.br/nfse',
        'versao': data.versao
      })
      .openElement('infDPS', { 'Id': data.infDPS.Id || 'DPS00' });

    // Dados básicos da DPS
    this.addDadosBasicosDPS(data.infDPS);

    // Dados de substituição (se houver)
    if (data.infDPS.subst && XMLUtils.hasAnyValue(data.infDPS.subst)) {
      this.addDadosSubstituicao(data.infDPS.subst);
    }

    // Prestador
    this.addPrestador(data.infDPS.prest);

    // Tomador
    this.addTomador(data.infDPS.toma);

    // Intermediário (se houver)
    if (data.infDPS.interm && XMLUtils.hasAnyValue(data.infDPS.interm)) {
      this.addIntermediario(data.infDPS.interm);
    }

    // Serviços
    this.addServicos(data.infDPS.serv);

    // Valores
    this.addValores(data.infDPS.valores);

    this.xmlBuilder
      .closeElement('infDPS')
      .closeElement('DPS');

    return this.xmlBuilder.build();
  }

  // Gera NFSe completa (com DPS interno)
  generateCompleteNFSeXML(data: CompleteNFSeData): string {
    this.xmlBuilder.clear();

    this.xmlBuilder
      .openElement('NFSe', {
        'xmlns': 'http://www.sped.fazenda.gov.br/nfse',
        'versao': data.versao
      })
      .openElement('infNFSe', { 'Id': data.infNFSe.Id || 'NFSe00' });

    // Dados da NFSe
    this.addDadosNFSe(data.infNFSe);

    // Emitente
    this.addEmitente(data.infNFSe.emit);

    // Valores da NFSe
    this.addValoresNFSe(data.infNFSe.valores);

    // DPS interno
    this.addDPSInterno(data.infNFSe.DPS);

    this.xmlBuilder
      .closeElement('infNFSe')
      .addComment('Assinatura digital deve ser adicionada aqui')
      .closeElement('NFSe');

    return this.xmlBuilder.build();
  }

  private addDadosBasicosDPS(infDPS: CompleteDPSData['infDPS']): void {
    this.xmlBuilder
      .addElement('tpAmb', infDPS.tpAmb)
      .addDate('dhEmi', infDPS.dhEmi)
      .addElement('verAplic', infDPS.verAplic)
      .addOptional('serie', infDPS.serie)
      .addElement('nDPS', infDPS.nDPS)
      .addElement('dCompet', infDPS.dCompet)
      .addElement('tpEmit', infDPS.tpEmit)
      .addElement('cLocEmi', infDPS.cLocEmi);
  }

  private addDadosSubstituicao(subst: any): void {
    this.xmlBuilder
      .addGroup('subst', undefined, (builder) => {
        builder
          .addElement('chSubstda', subst.chSubstda)
          .addElement('cMotivo', subst.cMotivo)
          .addElement('xMotivo', XMLUtils.sanitizeText(subst.xMotivo));
      });
  }

  private addPrestador(prest: any): void {
    this.xmlBuilder
      .addGroup('prest', undefined, (builder) => {
        // Identificação (choice)
        builder.addChoice([
          {
            condition: XMLUtils.isNotEmpty(prest.CNPJ),
            callback: (b) => b.addElement('CNPJ', XMLUtils.formatCNPJCPF(prest.CNPJ))
          },
          {
            condition: XMLUtils.isNotEmpty(prest.CPF),
            callback: (b) => b.addElement('CPF', XMLUtils.formatCNPJCPF(prest.CPF))
          },
          {
            condition: XMLUtils.isNotEmpty(prest.NIF),
            callback: (b) => b.addElement('NIF', prest.NIF)
          },
          {
            condition: XMLUtils.isNotEmpty(prest.CAEPF),
            callback: (b) => b.addElement('CAEPF', prest.CAEPF)
          }
        ]);

        builder
          .addOptional('IM', prest.IM)
          .addElement('xNome', XMLUtils.sanitizeText(prest.xNome))
          .addOptional('xFant', XMLUtils.sanitizeText(prest.xFant));

        // Endereço
        this.addEndereco(builder, prest.end);

        // Contato
        if (XMLUtils.isNotEmpty(prest.fone) || XMLUtils.isNotEmpty(prest.email)) {
          builder
            .addOptional('fone', XMLUtils.formatPhone(prest.fone))
            .addOptional('email', prest.email);
        }

        // Regime Tributário
        this.addRegimeTributario(builder, prest.regTrib);
      });
  }

  private addTomador(toma: any): void {
    this.xmlBuilder
      .addGroup('toma', undefined, (builder) => {
        // Identificação (choice)
        builder.addChoice([
          {
            condition: XMLUtils.isNotEmpty(toma.CNPJ),
            callback: (b) => b.addElement('CNPJ', XMLUtils.formatCNPJCPF(toma.CNPJ))
          },
          {
            condition: XMLUtils.isNotEmpty(toma.CPF),
            callback: (b) => b.addElement('CPF', XMLUtils.formatCNPJCPF(toma.CPF))
          },
          {
            condition: XMLUtils.isNotEmpty(toma.NIF),
            callback: (b) => b.addElement('NIF', toma.NIF)
          },
          {
            condition: XMLUtils.isNotEmpty(toma.cNaoNIF),
            callback: (b) => b.addElement('cNaoNIF', toma.cNaoNIF)
          }
        ]);

        if (XMLUtils.isNotEmpty(toma.CAEPF)) {
          builder.addElement('CAEPF', toma.CAEPF);
        }

        builder
          .addOptional('IM', toma.IM)
          .addElement('xNome', XMLUtils.sanitizeText(toma.xNome));

        // Endereço
        this.addEndereco(builder, toma.end);

        // Contato
        if (XMLUtils.isNotEmpty(toma.fone) || XMLUtils.isNotEmpty(toma.email)) {
          builder
            .addOptional('fone', XMLUtils.formatPhone(toma.fone))
            .addOptional('email', toma.email);
        }
      });
  }

  private addIntermediario(interm: any): void {
    this.xmlBuilder
      .addGroup('interm', undefined, (builder) => {
        // Mesma estrutura do tomador
        builder.addChoice([
          {
            condition: XMLUtils.isNotEmpty(interm.CNPJ),
            callback: (b) => b.addElement('CNPJ', XMLUtils.formatCNPJCPF(interm.CNPJ))
          },
          {
            condition: XMLUtils.isNotEmpty(interm.CPF),
            callback: (b) => b.addElement('CPF', XMLUtils.formatCNPJCPF(interm.CPF))
          },
          {
            condition: XMLUtils.isNotEmpty(interm.NIF),
            callback: (b) => b.addElement('NIF', interm.NIF)
          },
          {
            condition: XMLUtils.isNotEmpty(interm.cNaoNIF),
            callback: (b) => b.addElement('cNaoNIF', interm.cNaoNIF)
          }
        ]);

        if (XMLUtils.isNotEmpty(interm.CAEPF)) {
          builder.addElement('CAEPF', interm.CAEPF);
        }

        builder
          .addOptional('IM', interm.IM)
          .addElement('xNome', XMLUtils.sanitizeText(interm.xNome));

        this.addEndereco(builder, interm.end);

        if (XMLUtils.isNotEmpty(interm.fone) || XMLUtils.isNotEmpty(interm.email)) {
          builder
            .addOptional('fone', XMLUtils.formatPhone(interm.fone))
            .addOptional('email', interm.email);
        }
      });
  }

  private addEndereco(builder: XMLBuilder, end: any): void {
    builder.addGroup('end', undefined, (endBuilder) => {
      // Endereço nacional ou exterior (choice)
      endBuilder.addChoice([
        {
          condition: end.endNac && XMLUtils.hasAnyValue(end.endNac),
          callback: (b) => {
            b.addGroup('endNac', undefined, (nacBuilder) => {
              nacBuilder
                .addElement('cMun', end.endNac.cMun)
                .addElement('CEP', XMLUtils.formatCEP(end.endNac.CEP));
            });
          }
        },
        {
          condition: end.endExt && XMLUtils.hasAnyValue(end.endExt),
          callback: (b) => {
            b.addGroup('endExt', undefined, (extBuilder) => {
              extBuilder
                .addElement('cPais', end.endExt.cPais)
                .addElement('xCidade', XMLUtils.sanitizeText(end.endExt.xCidade))
                .addOptional('xEstado', XMLUtils.sanitizeText(end.endExt.xEstado))
                .addOptional('CEP', end.endExt.CEP);
            });
          }
        }
      ]);

      // Dados comuns do endereço
      endBuilder
        .addElement('xLgr', XMLUtils.sanitizeText(end.xLgr))
        .addElement('nro', end.nro)
        .addOptional('xCpl', XMLUtils.sanitizeText(end.xCpl))
        .addElement('xBairro', XMLUtils.sanitizeText(end.xBairro));
    });
  }

  private addRegimeTributario(builder: XMLBuilder, regTrib: any): void {
    builder.addGroup('regTrib', undefined, (regBuilder) => {
      regBuilder
        .addElement('opSimpNac', regTrib.opSimpNac)
        .addOptional('regApTribSN', regTrib.regApTribSN)
        .addElement('regEspTrib', regTrib.regEspTrib);
    });
  }

  private addServicos(serv: any): void {
    this.xmlBuilder
      .addGroup('serv', undefined, (builder) => {
        // Local da prestação
        builder.addGroup('locPrest', undefined, (locBuilder) => {
          locBuilder
            .addElement('cLocPrestacao', serv.locPrest.cLocPrestacao)
            .addOptional('cPaisPrestacao', serv.locPrest.cPaisPrestacao)
            .addOptional('opConsumServ', serv.locPrest.opConsumServ);
        });

        // Código do serviço
        builder.addGroup('cServ', undefined, (cServBuilder) => {
          cServBuilder
            .addElement('cTribNac', serv.cServ.cTribNac)
            .addOptional('cTribMun', serv.cServ.cTribMun)
            .addElement('xDescServ', XMLUtils.sanitizeText(serv.cServ.xDescServ))
            .addOptional('cNBS', serv.cServ.cNBS)
            .addOptional('cIntContrib', serv.cServ.cIntContrib);
        });

        // Especialidades condicionais
        this.addEspecialidadesServico(builder, serv);

        // Informações complementares
        if (serv.infoCompl && XMLUtils.hasAnyValue(serv.infoCompl)) {
          builder.addGroup('infoCompl', undefined, (infoBuilder) => {
            infoBuilder
              .addOptional('idDocTec', serv.infoCompl.idDocTec)
              .addOptional('docRef', XMLUtils.sanitizeText(serv.infoCompl.docRef))
              .addOptional('xInfComp', XMLUtils.sanitizeText(serv.infoCompl.xInfComp));
          });
        }
      });
  }

  private addEspecialidadesServico(builder: XMLBuilder, serv: any): void {
    // Comércio Exterior
    if (serv.comExt && XMLUtils.hasAnyValue(serv.comExt)) {
      builder.addGroup('comExt', undefined, (comExtBuilder) => {
        comExtBuilder
          .addElement('mdPrestacao', serv.comExt.mdPrestacao)
          .addElement('vincPrest', serv.comExt.vincPrest)
          .addElement('tpMoeda', serv.comExt.tpMoeda)
          .addNumber('vServMoeda', serv.comExt.vServMoeda)
          .addElement('mecApoioFomento', serv.comExt.mecApoioFomento)
          .addOptional('nroDI', serv.comExt.nroDI)
          .addOptional('nroRE', serv.comExt.nroRE)
          .addElement('mdic', serv.comExt.mdic);
      });
    }

    // Locação/Sublocação
    if (serv.lsadppu && XMLUtils.hasAnyValue(serv.lsadppu)) {
      builder.addGroup('lsadppu', undefined, (lsBuilder) => {
        lsBuilder
          .addElement('categ', serv.lsadppu.categ)
          .addElement('objeto', XMLUtils.sanitizeText(serv.lsadppu.objeto))
          .addOptional('extensao', serv.lsadppu.extensao?.toString())
          .addOptional('nPostes', serv.lsadppu.nPostes?.toString());
      });
    }

    // Obra
    if (serv.obra && XMLUtils.hasAnyValue(serv.obra)) {
      builder.addGroup('obra', undefined, (obraBuilder) => {
        obraBuilder
          .addOptional('cCno', serv.obra.cCno)
          .addOptional('cCei', serv.obra.cCei)
          .addOptional('inscImobFisc', serv.obra.inscImobFisc);

        if (serv.obra.endObra && XMLUtils.hasAnyValue(serv.obra.endObra)) {
          this.addEndereco(obraBuilder, serv.obra.endObra);
        }
      });
    }

    // Evento
    if (serv.atvEvento && XMLUtils.hasAnyValue(serv.atvEvento)) {
      builder.addGroup('atvEvento', undefined, (eventoBuilder) => {
        eventoBuilder
          .addElement('xDescEvento', XMLUtils.sanitizeText(serv.atvEvento.xDescEvento))
          .addElement('dtIni', serv.atvEvento.dtIni)
          .addElement('dtFim', serv.atvEvento.dtFim)
          .addOptional('idEvento', serv.atvEvento.idEvento);

        if (serv.atvEvento.endEvento && XMLUtils.hasAnyValue(serv.atvEvento.endEvento)) {
          this.addEndereco(eventoBuilder, serv.atvEvento.endEvento);
        }
      });
    }

    // Exploração Rodoviária
    if (serv.explRod && XMLUtils.hasAnyValue(serv.explRod)) {
      builder.addGroup('explRod', undefined, (explBuilder) => {
        explBuilder
          .addElement('categVeic', serv.explRod.categVeic)
          .addElement('nroEixos', serv.explRod.nroEixos.toString())
          .addElement('tpRodagem', serv.explRod.tpRodagem)
          .addElement('sentido', serv.explRod.sentido)
          .addOptional('placa', serv.explRod.placa)
          .addOptional('codAcesso', serv.explRod.codAcesso)
          .addOptional('codContrato', serv.explRod.codContrato);
      });
    }
  }

  private addValores(valores: any): void {
    this.xmlBuilder
      .addGroup('valores', undefined, (builder) => {
        // Valor do serviço prestado
        builder.addGroup('vServPrest', undefined, (vServBuilder) => {
          vServBuilder
            .addOptional('vReceb', safeToFixed(valores.vServPrest.vReceb))
            .addNumber('vServ', valores.vServPrest.vServ);
        });

        // Descontos (condicional)
        if (valores.vDescCondIncond && XMLUtils.hasAnyValue(valores.vDescCondIncond)) {
          builder.addGroup('vDescCondIncond', undefined, (descBuilder) => {
            descBuilder
              .addOptional('vDescIncond', safeToFixed(valores.vDescCondIncond.vDescIncond))
              .addOptional('vDescCond', safeToFixed(valores.vDescCondIncond.vDescCond));
          });
        }

        // Deduções (condicional)
        if (valores.vDedRed && XMLUtils.hasAnyValue(valores.vDedRed)) {
          builder.addGroup('vDedRed', undefined, (dedBuilder) => {
            if (XMLUtils.isNotEmpty(valores.vDedRed.pDR)) {
              dedBuilder.addElement('pDR', XMLUtils.formatPercentage(valores.vDedRed.pDR, 2));
            } else if (XMLUtils.isNotEmpty(valores.vDedRed.vDR)) {
              dedBuilder.addNumber('vDR', valores.vDedRed.vDR);
            }
            // TODO: Adicionar suporte a documentos de dedução
          });
        }

        // Tributação
        this.addTributacao(builder, valores.trib);
      });
  }

  private addTributacao(builder: XMLBuilder, trib: any): void {
    builder.addGroup('trib', undefined, (tribBuilder) => {
      // Tributação Municipal
      tribBuilder.addGroup('tribMun', undefined, (tribMunBuilder) => {
        tribMunBuilder.addElement('tribISSQN', trib.tribMun.tribISSQN);

        // Campos condicionais baseados no tipo de tributação
        if (trib.tribMun.tribISSQN === '2') {
          tribMunBuilder.addOptional('cPaisResult', trib.tribMun.cPaisResult);
        }

        if (trib.tribMun.tribISSQN === '4') {
          tribMunBuilder.addOptional('tpImunidade', trib.tribMun.tpImunidade);
        }

        if (trib.tribMun.tribISSQN === '1') {
          tribMunBuilder
            .addOptional('pAliq', XMLUtils.formatPercentage(trib.tribMun.pAliq, 2))
            .addOptional('tpRetISSQN', trib.tribMun.tpRetISSQN);
        }

        // Benefício Municipal (condicional)
        if (trib.tribMun.BM && XMLUtils.hasAnyValue(trib.tribMun.BM)) {
          tribMunBuilder.addGroup('BM', undefined, (bmBuilder) => {
            bmBuilder
              .addElement('tpBM', trib.tribMun.BM.tpBM)
              .addElement('nBM', trib.tribMun.BM.nBM)
              .addOptional('vRedBCBM', safeToFixed(trib.tribMun.BM.vRedBCBM));
          });
        }

        // Exigibilidade Suspensa (condicional)
        if (trib.tribMun.exigSusp && XMLUtils.hasAnyValue(trib.tribMun.exigSusp)) {
          tribMunBuilder.addGroup('exigSusp', undefined, (exigBuilder) => {
            exigBuilder
              .addElement('tpSusp', trib.tribMun.exigSusp.tpSusp)
              .addElement('nProcesso', trib.tribMun.exigSusp.nProcesso);
          });
        }
      });

      // Tributação Federal (condicional)
      if (trib.tribFed && XMLUtils.hasAnyValue(trib.tribFed)) {
        tribBuilder.addGroup('tribFed', undefined, (tribFedBuilder) => {
          // PIS/COFINS (condicional)
          if (trib.tribFed.piscofins && XMLUtils.hasAnyValue(trib.tribFed.piscofins)) {
            tribFedBuilder.addGroup('piscofins', undefined, (pisBuilder) => {
              pisBuilder
                .addElement('CST', trib.tribFed.piscofins.CST)
                .addOptional('vBCPisCofins', safeToFixed(trib.tribFed.piscofins.vBCPisCofins))
                .addOptional('pAliqPis', XMLUtils.formatPercentage(trib.tribFed.piscofins.pAliqPis, 2))
                .addOptional('pAliqCofins', XMLUtils.formatPercentage(trib.tribFed.piscofins.pAliqCofins, 2))
                .addOptional('vPis', safeToFixed(trib.tribFed.piscofins.vPis))
                .addOptional('vCofins', safeToFixed(trib.tribFed.piscofins.vCofins))
                .addOptional('tpRetPisCofins', trib.tribFed.piscofins.tpRetPisCofins);
            });
          }

          // Outras retenções
          tribFedBuilder
            .addOptional('vRetCP', safeToFixed(trib.tribFed.vRetCP))
            .addOptional('vRetIRRF', safeToFixed(trib.tribFed.vRetIRRF))
            .addOptional('vRetCSLL', safeToFixed(trib.tribFed.vRetCSLL));
        });
      }

      // Total de Tributos (condicional)
      if (trib.totTrib && XMLUtils.hasAnyValue(trib.totTrib)) {
        tribBuilder.addGroup('totTrib', undefined, (totBuilder) => {
          if (trib.totTrib.vTotTrib && XMLUtils.hasAnyValue(trib.totTrib.vTotTrib)) {
            totBuilder.addGroup('vTotTrib', undefined, (vTotBuilder) => {
              vTotBuilder
                .addNumber('vTotTribFed', trib.totTrib.vTotTrib.vTotTribFed)
                .addNumber('vTotTribEst', trib.totTrib.vTotTrib.vTotTribEst)
                .addNumber('vTotTribMun', trib.totTrib.vTotTrib.vTotTribMun);
            });
          }

          // TODO: Adicionar suporte a pTotTribPerc, indTotTrib, tribSN
        });
      }
    });
  }

  private addDadosNFSe(infNFSe: any): void {
    this.xmlBuilder
      .addElement('xLocEmi', XMLUtils.sanitizeText(infNFSe.xLocEmi))
      .addElement('xLocPrestacao', XMLUtils.sanitizeText(infNFSe.xLocPrestacao))
      .addOptional('nNFSe', infNFSe.nNFSe)
      .addOptional('cLocIncid', infNFSe.cLocIncid)
      .addOptional('xLocIncid', XMLUtils.sanitizeText(infNFSe.xLocIncid))
      .addOptional('xTribNac', XMLUtils.sanitizeText(infNFSe.xTribNac))
      .addOptional('xTribMun', XMLUtils.sanitizeText(infNFSe.xTribMun))
      .addElement('verAplic', infNFSe.verAplic)
      .addElement('ambGer', infNFSe.ambGer)
      .addElement('tpEmis', infNFSe.tpEmis)
      .addOptional('procEmi', infNFSe.procEmi)
      .addOptional('cStat', infNFSe.cStat)
      .addOptional('dhProc', XMLUtils.formatDate(infNFSe.dhProc))
      .addOptional('nDFSe', infNFSe.nDFSe);
  }

  private addEmitente(emit: any): void {
    this.xmlBuilder
      .addGroup('emit', undefined, (builder) => {
        builder
          .addElement('CNPJ', XMLUtils.formatCNPJCPF(emit.CNPJ))
          .addElement('IM', emit.IM)
          .addElement('xNome', XMLUtils.sanitizeText(emit.xNome))
          .addOptional('xFant', XMLUtils.sanitizeText(emit.xFant));

        // Endereço do emitente (estrutura específica da NFSe)
        builder.addGroup('enderNac', undefined, (endBuilder) => {
          endBuilder
            .addElement('xLgr', XMLUtils.sanitizeText(emit.enderNac.xLgr))
            .addElement('nro', emit.enderNac.nro)
            .addOptional('xCpl', XMLUtils.sanitizeText(emit.enderNac.xCpl))
            .addElement('xBairro', XMLUtils.sanitizeText(emit.enderNac.xBairro))
            .addElement('cMun', emit.enderNac.cMun)
            .addElement('UF', emit.enderNac.UF)
            .addElement('CEP', XMLUtils.formatCEP(emit.enderNac.CEP));
        });

        builder
          .addOptional('fone', XMLUtils.formatPhone(emit.fone))
          .addOptional('email', emit.email);
      });
  }

  private addValoresNFSe(valores: any): void {
    this.xmlBuilder
      .addGroup('valores', undefined, (builder) => {
        builder
          .addOptional('vCalcDR', safeToFixed(valores.vCalcDR))
          .addOptional('vCalcBM', safeToFixed(valores.vCalcBM))
          .addNumber('vBC', valores.vBC)
          .addElement('pAliqAplic', XMLUtils.formatPercentage(valores.pAliqAplic, 2))
          .addNumber('vISSQN', valores.vISSQN)
          .addOptional('vTotalRet', safeToFixed(valores.vTotalRet))
          .addNumber('vLiq', valores.vLiq);
      });
  }

  private addDPSInterno(dps: CompleteDPSData): void {
    // Adiciona a DPS como elemento interno da NFSe
    const dpsXML = this.generateDPSXML(dps);
    
    // Remove a declaração XML e adiciona como elemento interno
    const dpsContent = dpsXML
      .replace('<?xml version="1.0" encoding="UTF-8"?>\n', '')
      .split('\n')
      .map(line => '  ' + line) // Adiciona indentação
      .join('\n');

    this.xmlBuilder.addRaw(dpsContent);
  }
}