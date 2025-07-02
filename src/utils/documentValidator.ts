// Validador de CNPJ e CPF

/**
 * Valida CNPJ
 */
export function validarCNPJ(cnpj: string): boolean {
  if (!cnpj || typeof cnpj !== 'string') {
    return false;
  }

  // Remove caracteres não numéricos
  const cnpjLimpo = cnpj.replace(/\D/g, '');

  // Verifica se tem 14 dígitos
  if (cnpjLimpo.length !== 14) {
    return false;
  }

  // Verifica se não é uma sequência de números iguais
  if (/^(\d)\1{13}$/.test(cnpjLimpo)) {
    return false;
  }

  // Usar o mesmo algoritmo do gerador (peso cíclico 2-9)
  
  // Calcular primeiro dígito verificador
  let soma = 0;
  let peso = 2;
  for (let i = 11; i >= 0; i--) {
    soma += parseInt(cnpjLimpo.charAt(i)) * peso;
    peso++;
    if (peso === 10) peso = 2;
  }
  
  let dv1 = soma % 11;
  dv1 = dv1 < 2 ? 0 : 11 - dv1;
  
  if (dv1 !== parseInt(cnpjLimpo[12])) {
    return false;
  }
  
  // Calcular segundo dígito verificador
  soma = 0;
  peso = 2;
  for (let i = 12; i >= 0; i--) {
    soma += parseInt(cnpjLimpo.charAt(i)) * peso;
    peso++;
    if (peso === 10) peso = 2;
  }
  
  let dv2 = soma % 11;
  dv2 = dv2 < 2 ? 0 : 11 - dv2;
  
  return dv2 === parseInt(cnpjLimpo[13]);
}

/**
 * Valida CPF
 */
export function validarCPF(cpf: string): boolean {
  if (!cpf || typeof cpf !== 'string') {
    return false;
  }

  // Remove caracteres não numéricos
  const cpfLimpo = cpf.replace(/\D/g, '');

  // Verifica se tem 11 dígitos
  if (cpfLimpo.length !== 11) {
    return false;
  }

  // Verifica se não é uma sequência de números iguais
  if (/^(\d)\1{10}$/.test(cpfLimpo)) {
    return false;
  }

  // Primeiro dígito verificador
  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpfLimpo[i]) * (10 - i);
  }
  let resto = soma % 11;
  const dv1 = resto < 2 ? 0 : 11 - resto;

  if (dv1 !== parseInt(cpfLimpo[9])) {
    return false;
  }

  // Segundo dígito verificador
  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpfLimpo[i]) * (11 - i);
  }
  resto = soma % 11;
  const dv2 = resto < 2 ? 0 : 11 - resto;

  return dv2 === parseInt(cpfLimpo[10]);
}

/**
 * Valida se o documento (CNPJ ou CPF) é válido
 */
export function validarDocumento(documento: string): { valido: boolean; tipo: 'CNPJ' | 'CPF' | null; erro?: string } {
  if (!documento || typeof documento !== 'string') {
    return { valido: false, tipo: null, erro: 'Documento não fornecido' };
  }

  const docLimpo = documento.replace(/\D/g, '');

  if (docLimpo.length === 14) {
    // CNPJ
    const valido = validarCNPJ(docLimpo);
    return {
      valido,
      tipo: 'CNPJ',
      erro: valido ? undefined : 'CNPJ inválido'
    };
  } else if (docLimpo.length === 11) {
    // CPF
    const valido = validarCPF(docLimpo);
    return {
      valido,
      tipo: 'CPF',
      erro: valido ? undefined : 'CPF inválido'
    };
  } else {
    return {
      valido: false,
      tipo: null,
      erro: `Documento deve ter 11 (CPF) ou 14 (CNPJ) dígitos. Fornecido: ${docLimpo.length} dígitos`
    };
  }
}

/**
 * Valida emitente (pessoa que emite a NFSe)
 */
export function validarEmitente(emitente: { CNPJ?: string; CPF?: string; xNome?: string }): { valido: boolean; erros: string[] } {
  const erros: string[] = [];

  // Verificar se foi fornecido CNPJ ou CPF
  if (!emitente.CNPJ && !emitente.CPF) {
    erros.push('CNPJ ou CPF do emitente deve ser fornecido');
    return { valido: false, erros };
  }

  // Verificar se não foi fornecido ambos
  if (emitente.CNPJ && emitente.CPF) {
    erros.push('Forneça apenas CNPJ ou CPF, não ambos');
    return { valido: false, erros };
  }

  // Validar documento fornecido
  const documento = emitente.CNPJ || emitente.CPF || '';
  const validacao = validarDocumento(documento);

  if (!validacao.valido) {
    erros.push(`Emitente: ${validacao.erro}`);
  }

  // Verificar nome
  if (!emitente.xNome || emitente.xNome.trim().length === 0) {
    erros.push('Nome do emitente deve ser fornecido');
  }

  return {
    valido: erros.length === 0,
    erros
  };
}

/**
 * Valida prestador (pessoa que presta o serviço)
 */
export function validarPrestador(prestador: { CNPJ?: string; CPF?: string; xNome?: string }): { valido: boolean; erros: string[] } {
  const erros: string[] = [];

  // Verificar se foi fornecido CNPJ ou CPF
  if (!prestador.CNPJ && !prestador.CPF) {
    erros.push('CNPJ ou CPF do prestador deve ser fornecido');
    return { valido: false, erros };
  }

  // Verificar se não foi fornecido ambos
  if (prestador.CNPJ && prestador.CPF) {
    erros.push('Forneça apenas CNPJ ou CPF do prestador, não ambos');
    return { valido: false, erros };
  }

  // Validar documento fornecido
  const documento = prestador.CNPJ || prestador.CPF || '';
  const validacao = validarDocumento(documento);

  if (!validacao.valido) {
    erros.push(`Prestador: ${validacao.erro}`);
  }

  // Verificar nome
  if (!prestador.xNome || prestador.xNome.trim().length === 0) {
    erros.push('Nome do prestador deve ser fornecido');
  }

  return {
    valido: erros.length === 0,
    erros
  };
}

/**
 * Função para testar os validadores
 */
export function testarValidadores() {
  console.log('=== Testando Validadores ===');

  // Testar CNPJs
  const cnpjsValidos = ['11222333000181', '11.222.333/0001-81'];
  const cnpjsInvalidos = ['11222333000180', '11111111111111', '123', ''];

  console.log('CNPJs Válidos:');
  cnpjsValidos.forEach(cnpj => {
    console.log(`${cnpj}: ${validarCNPJ(cnpj) ? 'VÁLIDO' : 'INVÁLIDO'}`);
  });

  console.log('CNPJs Inválidos:');
  cnpjsInvalidos.forEach(cnpj => {
    console.log(`${cnpj}: ${validarCNPJ(cnpj) ? 'VÁLIDO' : 'INVÁLIDO'}`);
  });

  // Testar CPFs
  const cpfsValidos = ['11144477735', '111.444.777-35'];
  const cpfsInvalidos = ['11144477736', '11111111111', '123', ''];

  console.log('CPFs Válidos:');
  cpfsValidos.forEach(cpf => {
    console.log(`${cpf}: ${validarCPF(cpf) ? 'VÁLIDO' : 'INVÁLIDO'}`);
  });

  console.log('CPFs Inválidos:');
  cpfsInvalidos.forEach(cpf => {
    console.log(`${cpf}: ${validarCPF(cpf) ? 'VÁLIDO' : 'INVÁLIDO'}`);
  });
}