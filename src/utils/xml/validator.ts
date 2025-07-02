import Joi from 'joi';

export class NFSeValidator {
  private nfseSchema: Joi.ObjectSchema;
  private dpsSchema: Joi.ObjectSchema;

  constructor() {
    this.nfseSchema = this.buildNFSeSchema();
    this.dpsSchema = this.buildDPSSchema();
  }

  private buildNFSeSchema(): Joi.ObjectSchema {
    return Joi.object({
      infNFSe: Joi.object({
        xLocEmi: Joi.string().max(150).required(),
        xLocPrestacao: Joi.string().max(150).required(),
        nNFSe: Joi.string().optional(),
        cLocIncid: Joi.string().length(7).optional(),
        dhEmi: Joi.string().isoDate().required(),
        cNatOp: Joi.string().valid('1', '2', '3', '4', '5', '6').required(),
        cRegTrib: Joi.string().valid('1', '2', '3', '4', '5', '6').required(),
        xRegTrib: Joi.string().max(60).required(),
        optSimpNac: Joi.string().valid('1', '2').required(),
        dCompet: Joi.string().pattern(/^\d{4}-\d{2}$/).required(),
        prestador: this.buildPrestadorSchema(),
        tomador: this.buildTomadorSchema(),
        servico: this.buildServicoSchema(),
        valores: this.buildValoresSchema()
      }).required(),
      versao: Joi.string().valid('1.00').required()
    });
  }

  private buildDPSSchema(): Joi.ObjectSchema {
    return Joi.object({
      infDPS: Joi.object({
        prestador: this.buildPrestadorSchema(),
        tomador: this.buildTomadorSchema(),
        servico: this.buildServicoSchema(),
        valores: this.buildValoresSchema(),
        dhEmi: Joi.string().isoDate().required(),
        cNatOp: Joi.string().valid('1', '2', '3', '4', '5', '6').required(),
        cRegTrib: Joi.string().valid('1', '2', '3', '4', '5', '6').required(),
        xRegTrib: Joi.string().max(60).required(),
        optSimpNac: Joi.string().valid('1', '2').required(),
        dCompet: Joi.string().pattern(/^\d{4}-\d{2}$/).required()
      }).required(),
      versao: Joi.string().valid('1.00').required()
    });
  }

  private buildPrestadorSchema(): Joi.ObjectSchema {
    return Joi.object({
      cPrest: Joi.string().required(),
      cnpj: Joi.string().length(14).pattern(/^\d+$/).required(),
      xNome: Joi.string().max(150).required(),
      endereco: this.buildEnderecoSchema(),
      contato: this.buildContatoSchema().optional()
    });
  }

  private buildTomadorSchema(): Joi.ObjectSchema {
    return Joi.object({
      cnpjCpf: Joi.string().min(11).max(14).pattern(/^\d+$/).required(),
      xNome: Joi.string().max(150).required(),
      endereco: this.buildEnderecoSchema(),
      contato: this.buildContatoSchema().optional()
    });
  }

  private buildEnderecoSchema(): Joi.ObjectSchema {
    return Joi.object({
      xLog: Joi.string().max(125).required(),
      nro: Joi.string().max(10).required(),
      xCpl: Joi.string().max(60).optional(),
      xBairro: Joi.string().max(72).required(),
      cMun: Joi.string().length(7).required(),
      xMun: Joi.string().max(60).required(),
      uf: Joi.string().length(2).required(),
      cep: Joi.string().length(8).pattern(/^\d+$/).required()
    });
  }

  private buildContatoSchema(): Joi.ObjectSchema {
    return Joi.object({
      tel: Joi.string().max(20).optional(),
      email: Joi.string().email().max(80).optional()
    });
  }

  private buildServicoSchema(): Joi.ObjectSchema {
    return Joi.object({
      cServ: Joi.string().required(),
      xServ: Joi.string().max(2000).required(),
      cLCServ: Joi.string().required(),
      xLCServ: Joi.string().max(2000).required()
    });
  }

  private buildValoresSchema(): Joi.ObjectSchema {
    return Joi.object({
      vServ: Joi.number().precision(2).min(0).required(),
      vDed: Joi.number().precision(2).min(0).optional(),
      vBC: Joi.number().precision(2).min(0).required(),
      pISS: Joi.number().precision(4).min(0).max(100).required(),
      vISS: Joi.number().precision(2).min(0).required(),
      vLiq: Joi.number().precision(2).min(0).required()
    });
  }

  validateNFSe(data: unknown): { isValid: boolean; errors: string[] } {
    const { error } = this.nfseSchema.validate(data, { abortEarly: false });
    
    if (error) {
      return {
        isValid: false,
        errors: error.details.map(detail => detail.message)
      };
    }
    
    return { isValid: true, errors: [] };
  }

  validateDPS(data: unknown): { isValid: boolean; errors: string[] } {
    const { error } = this.dpsSchema.validate(data, { abortEarly: false });
    
    if (error) {
      return {
        isValid: false,
        errors: error.details.map(detail => detail.message)
      };
    }
    
    return { isValid: true, errors: [] };
  }

  async loadXSDSchema(schemaName: string): Promise<string> {
    try {
      const response = await fetch(`/XSDs/${schemaName}_v1.00.xsd`);
      if (!response.ok) {
        throw new Error(`Schema não encontrado: ${schemaName}`);
      }
      return await response.text();
    } catch (error) {
      throw new Error(`Erro ao carregar schema ${schemaName}: ${error}`);
    }
  }
}