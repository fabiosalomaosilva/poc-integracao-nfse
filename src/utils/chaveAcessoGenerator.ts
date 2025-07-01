// Utilitário para gerar chaves de acesso NFSe e DPS conforme padrão SPED
import { validarDocumento } from './documentValidator';

/**
 * Calcula dígito verificador usando módulo 11
 */
function calcularDv(chave: string): number {
  let soma = 0;
  let peso = 2;

  for (let i = chave.length - 1; i >= 0; i--) {
    const num = parseInt(chave[i]);
    soma += num * peso;
    peso = peso === 9 ? 2 : peso + 1;
  }

  const resto = soma % 11;
  return resto < 2 ? 0 : 11 - resto;
}

/**
 * Gera código numérico aleatório de 9 dígitos
 */
function gerarCodigoNumerico(): string {
  return Math.floor(Math.random() * 999999999).toString().padStart(9, '0');
}

/**
 * Gera chave de acesso para NFSe
 */
export function gerarChaveAcessoNFSe(dados: {
  cnpj?: string;
  cpf?: string;
  ambGer: string;
  cLocIncid: string;
  nNFSe: string;
  dhProc: string;
}): string {
  // Validar documento antes de gerar a chave
  const documentoParaValidar = dados.cnpj || dados.cpf || '';
  const validacao = validarDocumento(documentoParaValidar);
  
  if (!validacao.valido) {
    throw new Error(`Não é possível gerar chave NFSe: ${validacao.erro}`);
  }

  // Determinar tipo de inscrição federal
  const tipoInscricaoFederal = dados.cnpj ? "2" : "1";
  
  // Preparar documento (CNPJ ou CPF)
  let documento: string;
  if (dados.cnpj) {
    documento = dados.cnpj.replace(/\D/g, '').padStart(14, '0');
  } else if (dados.cpf) {
    documento = dados.cpf.replace(/\D/g, '').padStart(11, '0');
  } else {
    throw new Error("CNPJ ou CPF deve ser fornecido");
  }

  // Preparar outros campos
  const ambienteGerador = dados.ambGer || "2"; // Default para homologação
  const codigoMunicipio = dados.cLocIncid.padStart(7, '0');
  const numeroNfse = dados.nNFSe.padStart(13, '0');

  // Validar campos obrigatórios
  if (!documento || !codigoMunicipio || !numeroNfse) {
    throw new Error("Erro ao extrair dados obrigatórios para gerar chave NFSe");
  }

  // Extrair ano/mês da data de processamento
  const dataProc = new Date(dados.dhProc);
  const anoMes = String(dataProc.getFullYear()).slice(-2) + 
                 String(dataProc.getMonth() + 1).padStart(2, '0');

  // Gerar código numérico aleatório
  const codigoNumerico = gerarCodigoNumerico();

  // Montar chave base
  const chaveBase = codigoMunicipio +
                    ambienteGerador +
                    tipoInscricaoFederal +
                    documento +
                    numeroNfse +
                    anoMes +
                    codigoNumerico;

  // Calcular dígito verificador
  const dv = calcularDv(chaveBase).toString();

  // Chave completa
  const chaveCompleta = "NFS" + chaveBase + dv;

  return chaveCompleta;
}

/**
 * Gera chave de acesso para DPS
 */
export function gerarChaveAcessoDPS(dados: {
  cnpj?: string;
  cpf?: string;
  cLocEmi: string;
  serie: string;
  nDPS: string;
}): string {
  // Validar documento antes de gerar a chave
  const documentoParaValidar = dados.cnpj || dados.cpf || '';
  const validacao = validarDocumento(documentoParaValidar);
  
  if (!validacao.valido) {
    throw new Error(`Não é possível gerar chave DPS: ${validacao.erro}`);
  }

  // Determinar tipo de inscrição federal
  const tipoInscricaoFederal = dados.cnpj ? "2" : "1";
  
  // Preparar documento (CNPJ ou CPF)
  let documento: string;
  if (dados.cnpj) {
    documento = dados.cnpj.replace(/\D/g, '').padStart(14, '0');
  } else if (dados.cpf) {
    documento = dados.cpf.replace(/\D/g, '').padStart(14, '0'); // CPF também vai para 14 dígitos no DPS
  } else {
    throw new Error("CNPJ ou CPF deve ser fornecido");
  }

  // Preparar outros campos
  const codigoMunicipio = dados.cLocEmi.padStart(7, '0');
  const serieDPS = dados.serie.padStart(5, '0');
  const numeroDPS = dados.nDPS.padStart(15, '0');

  // Validar campos obrigatórios
  if (!documento || !codigoMunicipio || !serieDPS || !numeroDPS) {
    throw new Error("Erro ao extrair dados obrigatórios para gerar chave DPS");
  }

  // Montar chave DPS
  const chaveDPS = "DPS" +
                   codigoMunicipio +
                   tipoInscricaoFederal +
                   documento +
                   serieDPS +
                   numeroDPS;

  return chaveDPS;
}

/**
 * Função para testar os geradores
 */
export function testarGeradores() {
  console.log('=== Testando Geradores de Chave ===');
  
  // Teste NFSe
  const chaveNFSe = gerarChaveAcessoNFSe({
    cnpj: '12345678000195',
    ambGer: '2',
    cLocIncid: '3550308',
    nNFSe: '123',
    dhProc: new Date().toISOString()
  });
  console.log('Chave NFSe:', chaveNFSe);
  
  // Teste DPS
  const chaveDPS = gerarChaveAcessoDPS({
    cnpj: '12345678000195',
    cLocEmi: '3550308',
    serie: '1',
    nDPS: '123'
  });
  console.log('Chave DPS:', chaveDPS);
}