// Utilitários para validação e formatação de documentos

/**
 * Remove formatação de CNPJ/CPF mantendo apenas números
 */
export function removeDocumentFormatting(value: string): string {
  if (!value || typeof value !== 'string') return '';
  return value.replace(/\D/g, '');
}

/**
 * Valida se CNPJ é válido
 */
export function validateCNPJ(cnpj: string): boolean {
  const cleanCNPJ = removeDocumentFormatting(cnpj);
  
  if (cleanCNPJ.length !== 14) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(cleanCNPJ)) return false;
  
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const weights2 = [6, 7, 8, 9, 2, 3, 4, 5, 6, 7, 8, 9];
  
  // Calcular primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const digit = parseInt(cleanCNPJ[i]);
    if (isNaN(digit)) return false;
    sum += digit * weights1[i];
  }
  let digit1 = sum % 11;
  digit1 = digit1 < 2 ? 0 : 11 - digit1;
  
  if (digit1 !== parseInt(cleanCNPJ[12])) return false;
  
  // Calcular segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 13; i++) {
    const digit = parseInt(cleanCNPJ[i]);
    if (isNaN(digit)) return false;
    sum += digit * weights2[i];
  }
  let digit2 = sum % 11;
  digit2 = digit2 < 2 ? 0 : 11 - digit2;
  
  return digit2 === parseInt(cleanCNPJ[13]);
}

/**
 * Valida se CPF é válido
 */
export function validateCPF(cpf: string): boolean {
  const cleanCPF = removeDocumentFormatting(cpf);
  
  if (cleanCPF.length !== 11) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(cleanCPF)) return false;
  
  // Calcular primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    const digit = parseInt(cleanCPF[i]);
    if (isNaN(digit)) return false;
    sum += digit * (10 - i);
  }
  let digit1 = sum % 11;
  digit1 = digit1 < 2 ? 0 : 11 - digit1;
  
  if (digit1 !== parseInt(cleanCPF[9])) return false;
  
  // Calcular segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    const digit = parseInt(cleanCPF[i]);
    if (isNaN(digit)) return false;
    sum += digit * (11 - i);
  }
  let digit2 = sum % 11;
  digit2 = digit2 < 2 ? 0 : 11 - digit2;
  
  return digit2 === parseInt(cleanCPF[10]);
}

/**
 * Formata CNPJ para exibição (XX.XXX.XXX/XXXX-XX)
 */
export function formatCNPJForDisplay(cnpj: string): string {
  const cleanCNPJ = removeDocumentFormatting(cnpj);
  if (cleanCNPJ.length !== 14) return cnpj;
  
  return cleanCNPJ.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
}

/**
 * Formata CPF para exibição (XXX.XXX.XXX-XX)
 */
export function formatCPFForDisplay(cpf: string): string {
  const cleanCPF = removeDocumentFormatting(cpf);
  if (cleanCPF.length !== 11) return cpf;
  
  return cleanCPF.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
}

/**
 * Sanitiza entrada de CNPJ/CPF removendo formatação e validando
 */
export function sanitizeDocumentInput(value: string): string {
  const clean = removeDocumentFormatting(value);
  
  // Verifica se contém apenas números
  if (!/^\d*$/.test(clean)) {
    console.warn('Document input contains non-numeric characters:', value);
    return clean.replace(/\D/g, ''); // Remove qualquer caractere não numérico como fallback
  }
  
  return clean;
}

/**
 * Função segura para parseFloat que não retorna NaN em documentos
 */
export function safeParseFloat(value: string | number): number {
  if (typeof value === 'number') return isNaN(value) ? 0 : value;
  if (typeof value !== 'string') return 0;
  
  // Se parece com um documento (só números e tem 11 ou 14 dígitos), não parsear
  const clean = removeDocumentFormatting(value);
  if (clean.length === 11 || clean.length === 14) {
    console.warn('Attempting to parse document as float:', value);
    return 0;
  }
  
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
}