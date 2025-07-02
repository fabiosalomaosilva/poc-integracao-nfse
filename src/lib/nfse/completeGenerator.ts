import { XMLBuilder, XMLUtils } from './xmlBuilder';
import { CompleteDPSData, CompleteNFSeData } from '../../types/nfse/complete';
import { gerarChaveAcessoNFSe, gerarChaveAcessoDPS } from '../../utils/chaveAcessoGenerator';
import { validarEmitente, validarPrestador } from '../../utils/documentValidator';

// Helper para formatar números de forma segura
function safeToFixed(value: number | undefined, decimals: number = 2): string | undefined {
  return value !== undefined && value !== null && !isNaN(value) ? value.toFixed(decimals) : undefined;
}

export class CompleteNFSeGenerator {
  private xmlBuilder: XMLBuilder;
  private commonTimestamp: string;

  constructor() {
    this.xmlBuilder = new XMLBuilder();
    this.commonTimestamp = '';
  }

  // Gera DPS completo
  generateDPSXML(data: CompleteDPSData): string {
    this.xmlBuilder.clear();

    // Validar prestador antes de gerar XML
    const validacaoPrestador = validarPrestador(data.infDPS.prest);
    if (!validacaoPrestador.valido) {
      throw new Error(`Erro de validação do prestador: ${validacaoPrestador.erros.join(', ')}`);
    }

    // Gerar ID da DPS automaticamente
    const idDPS = gerarChaveAcessoDPS({
      cnpj: data.infDPS.prest.CNPJ,
      cpf: data.infDPS.prest.CPF,
      cLocEmi: data.infDPS.cLocEmi,
      serie: data.infDPS.serie || '1',
      nDPS: data.infDPS.nDPS
    });

    this.xmlBuilder
      .openElement('DPS', {
        'xmlns': 'http://www.sped.fazenda.gov.br/nfse',
        'versao': data.versao
      })
      .openElement('infDPS', { 'Id': idDPS });

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
    
    // Validar emitente antes de gerar XML
    const validacaoEmitente = validarEmitente(data.infNFSe.emit);
    if (!validacaoEmitente.valido) {
      throw new Error(`Erro de validação do emitente: ${validacaoEmitente.erros.join(', ')}`);
    }

    // Validar prestador da DPS interna
    const validacaoPrestador = validarPrestador(data.infNFSe.DPS.infDPS.prest);
    if (!validacaoPrestador.valido) {
      throw new Error(`Erro de validação do prestador (DPS): ${validacaoPrestador.erros.join(', ')}`);
    }
    
    // Definir timestamp comum para dhEmi e dhProc
    this.commonTimestamp = XMLUtils.formatDate(data.infNFSe.dhProc || new Date().toISOString());

    // Gerar ID da NFSe automaticamente
    const idNFSe = gerarChaveAcessoNFSe({
      cnpj: data.infNFSe.emit.CNPJ,
      ambGer: data.infNFSe.ambGer,
      cLocIncid: data.infNFSe.cLocIncid || data.infNFSe.DPS.infDPS.cLocEmi,
      nNFSe: data.infNFSe.nNFSe || '1',
      dhProc: this.commonTimestamp
    });

    this.xmlBuilder
      .openElement('NFSe', {
        'xmlns': 'http://www.sped.fazenda.gov.br/nfse',
        'versao': data.versao
      })
      .openElement('infNFSe', { 'Id': idNFSe });

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
    // Usar o timestamp comum se estiver definido, senão usar o dhEmi dos dados
    const dhEmiToUse = this.commonTimestamp || infDPS.dhEmi;
    
    this.xmlBuilder
      .addElement('tpAmb', infDPS.tpAmb)
      .addDate('dhEmi', dhEmiToUse)
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
          .addElement('xNome', XMLUtils.sanitizeText(prest.xNome));

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
          .addElement('mdPrestacao', serv.comExt.mdPrestacao || '1')
          .addElement('vincPrest', serv.comExt.vincPrest || '0')
          .addElement('tpMoeda', serv.comExt.tpMoeda || '790')
          .addNumber('vServMoeda', serv.comExt.vServMoeda || 0)
          .addElement('mecAFComexP', serv.comExt.mecAFComexP || '04')
          .addElement('mecAFComexT', serv.comExt.mecAFComexT || '05')
          .addElement('movTempBens', serv.comExt.movTempBens || '1')
          .addElement('mdic', serv.comExt.mdic || '1')
          .addOptional('nroDI', serv.comExt.nroDI)
          .addOptional('nroRE', serv.comExt.nroRE);
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
      // Tributação Municipal (sempre incluir campos obrigatórios)
      tribBuilder.addGroup('tribMun', undefined, (tribMunBuilder) => {
        // tribISSQN sempre obrigatório
        tribMunBuilder.addElement('tribISSQN', trib.tribMun?.tribISSQN || '1');

        // pAliq sempre obrigatório (mesmo que 0.00)
        const pAliq = trib.tribMun?.pAliq;
        tribMunBuilder.addElement('pAliq', pAliq ? XMLUtils.formatPercentage(pAliq, 2) : '0.00');

        // tpRetISSQN sempre obrigatório
        tribMunBuilder.addElement('tpRetISSQN', trib.tribMun?.tpRetISSQN || '1');

        // Campos condicionais baseados no tipo de tributação
        if (trib.tribMun?.tribISSQN === '2') {
          tribMunBuilder.addOptional('cPaisResult', trib.tribMun.cPaisResult);
        }

        if (trib.tribMun?.tribISSQN === '4') {
          tribMunBuilder.addOptional('tpImunidade', trib.tribMun.tpImunidade);
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

      // Tributação Federal (sempre incluir para satisfazer XSD)
      tribBuilder.addGroup('tribFed', undefined, (tribFedBuilder) => {
        // PIS/COFINS (condicional, mas incluir CST padrão se não informado)
        const piscofinData = trib.tribFed?.piscofins;
        if (piscofinData && XMLUtils.hasAnyValue(piscofinData)) {
          tribFedBuilder.addGroup('piscofins', undefined, (pisBuilder) => {
            pisBuilder
              .addElement('CST', piscofinData.CST)
              .addOptional('vBCPisCofins', safeToFixed(piscofinData.vBCPisCofins))
              .addOptional('pAliqPis', XMLUtils.formatPercentage(piscofinData.pAliqPis, 2))
              .addOptional('pAliqCofins', XMLUtils.formatPercentage(piscofinData.pAliqCofins, 2))
              .addOptional('vPis', safeToFixed(piscofinData.vPis))
              .addOptional('vCofins', safeToFixed(piscofinData.vCofins))
              .addOptional('tpRetPisCofins', piscofinData.tpRetPisCofins);
          });
        } else {
          // Incluir PIS/COFINS com valores padrão
          tribFedBuilder.addGroup('piscofins', undefined, (pisBuilder) => {
            pisBuilder
              .addElement('CST', '00')
              .addElement('vPis', '0.00')
              .addElement('vCofins', '0.00');
          });
        }

        // Outras retenções (sempre incluir, mesmo que zeradas)
        tribFedBuilder
          .addElement('vRetCP', safeToFixed(trib.tribFed?.vRetCP) || '0.00')
          .addElement('vRetIRRF', safeToFixed(trib.tribFed?.vRetIRRF) || '0.00')
          .addElement('vRetCSLL', safeToFixed(trib.tribFed?.vRetCSLL) || '0.00');
      });

      // Total de Tributos (sempre incluir para satisfazer XSD)
      tribBuilder.addGroup('totTrib', undefined, (totBuilder) => {
        const totTribData = trib.totTrib?.vTotTrib;
        if (totTribData && XMLUtils.hasAnyValue(totTribData)) {
          totBuilder.addGroup('vTotTrib', undefined, (vTotBuilder) => {
            vTotBuilder
              .addNumber('vTotTribFed', totTribData.vTotTribFed)
              .addNumber('vTotTribEst', totTribData.vTotTribEst)
              .addNumber('vTotTribMun', totTribData.vTotTribMun);
          });
        } else {
          // Incluir vTotTrib com valores padrão
          totBuilder.addGroup('vTotTrib', undefined, (vTotBuilder) => {
            vTotBuilder
              .addElement('vTotTribFed', '0.00')
              .addElement('vTotTribEst', '0.00')
              .addElement('vTotTribMun', '0.00');
          });
        }

        // TODO: Adicionar suporte a pTotTribPerc, indTotTrib, tribSN se necessário
      });
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
      .addOptional('cStat', infNFSe.cStat)
      .addOptional('dhProc', this.commonTimestamp)
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
    // Validação já foi feita no método principal, só gerar ID
    const idDPSInterno = gerarChaveAcessoDPS({
      cnpj: dps.infDPS.prest.CNPJ,
      cpf: dps.infDPS.prest.CPF,
      cLocEmi: dps.infDPS.cLocEmi,
      serie: dps.infDPS.serie || '1',
      nDPS: dps.infDPS.nDPS
    });

    // Adiciona a DPS como elemento direto no XMLBuilder
    this.xmlBuilder
      .openElement('DPS', {
        'xmlns': 'http://www.sped.fazenda.gov.br/nfse',
        'versao': dps.versao
      })
      .openElement('infDPS', { 'Id': idDPSInterno });

    // Dados básicos da DPS
    this.addDadosBasicosDPS(dps.infDPS);

    // Dados de substituição (se houver)
    if (dps.infDPS.subst && XMLUtils.hasAnyValue(dps.infDPS.subst)) {
      this.addDadosSubstituicao(dps.infDPS.subst);
    }

    // Prestador
    this.addPrestador(dps.infDPS.prest);

    // Tomador
    this.addTomador(dps.infDPS.toma);

    // Intermediário (se houver)
    if (dps.infDPS.interm && XMLUtils.hasAnyValue(dps.infDPS.interm)) {
      this.addIntermediario(dps.infDPS.interm);
    }

    // Serviços
    this.addServicos(dps.infDPS.serv);

    // Valores
    this.addValores(dps.infDPS.valores);

    this.xmlBuilder
      .closeElement('infDPS')
      .closeElement('DPS');
  }
}