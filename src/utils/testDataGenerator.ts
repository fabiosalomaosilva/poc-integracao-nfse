// Utilitários para gerar dados de teste válidos

// Função para validar CNPJ
export function validateCNPJ(cnpj: string): boolean {
  if (!cnpj || cnpj.length !== 14 || !/^\d{14}$/.test(cnpj)) {
    return false;
  }

  // Verifica se não é uma sequência de números iguais
  if (/^(\d)\1{13}$/.test(cnpj)) {
    return false;
  }

  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const weights2 = [6, 7, 8, 9, 2, 3, 4, 5, 6, 7, 8, 9, 2];

  // Validar primeiro dígito
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cnpj[i]) * weights1[i];
  }
  let digit1 = sum % 11;
  digit1 = digit1 < 2 ? 0 : 11 - digit1;

  if (digit1 !== parseInt(cnpj[12])) {
    return false;
  }

  // Validar segundo dígito
  sum = 0;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cnpj[i]) * weights2[i];
  }
  let digit2 = sum % 11;
  digit2 = digit2 < 2 ? 0 : 11 - digit2;

  return digit2 === parseInt(cnpj[13]);
}

// Função para validar CPF
export function validateCPF(cpf: string): boolean {
  if (!cpf || cpf.length !== 11 || !/^\d{11}$/.test(cpf)) {
    return false;
  }

  // Verifica se não é uma sequência de números iguais
  if (/^(\d)\1{10}$/.test(cpf)) {
    return false;
  }

  // Validar primeiro dígito
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf[i]) * (10 - i);
  }
  let digit1 = sum % 11;
  digit1 = digit1 < 2 ? 0 : 11 - digit1;

  if (digit1 !== parseInt(cpf[9])) {
    return false;
  }

  // Validar segundo dígito
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf[i]) * (11 - i);
  }
  let digit2 = sum % 11;
  digit2 = digit2 < 2 ? 0 : 11 - digit2;

  return digit2 === parseInt(cpf[10]);
}

// Gerar CNPJ válido - Algoritmo verificado
export function generateValidCNPJ(): string {
  // Gerar 8 dígitos da base do CNPJ
  let n = '';
  for (let i = 0; i < 8; i++) {
    n += Math.floor(Math.random() * 10);
  }
  
  // Adicionar filial padrão 0001
  n += '0001';
  
  // Calcular primeiro dígito verificador
  let soma = 0;
  let peso = 2;
  for (let i = 11; i >= 0; i--) {
    soma += parseInt(n.charAt(i)) * peso;
    peso++;
    if (peso === 10) peso = 2;
  }
  
  let dv1 = soma % 11;
  dv1 = dv1 < 2 ? 0 : 11 - dv1;
  n += dv1;
  
  // Calcular segundo dígito verificador
  soma = 0;
  peso = 2;
  for (let i = 12; i >= 0; i--) {
    soma += parseInt(n.charAt(i)) * peso;
    peso++;
    if (peso === 10) peso = 2;
  }
  
  let dv2 = soma % 11;
  dv2 = dv2 < 2 ? 0 : 11 - dv2;
  n += dv2;
  
  // Verificar se não é sequência inválida
  if (/^(\d)\1{13}$/.test(n)) {
    return generateValidCNPJ();
  }
  
  return n;
}

// Gerar CPF válido - Algoritmo verificado
export function generateValidCPF(): string {
  // Gerar 9 dígitos do CPF
  let n = '';
  for (let i = 0; i < 9; i++) {
    n += Math.floor(Math.random() * 10);
  }
  
  // Calcular primeiro dígito verificador
  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(n.charAt(i)) * (10 - i);
  }
  
  let resto = soma % 11;
  const dv1 = resto < 2 ? 0 : 11 - resto;
  n += dv1;
  
  // Calcular segundo dígito verificador
  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(n.charAt(i)) * (11 - i);
  }
  
  resto = soma % 11;
  const dv2 = resto < 2 ? 0 : 11 - resto;
  n += dv2;
  
  // Verificar se não é sequência inválida
  if (/^(\d)\1{10}$/.test(n)) {
    return generateValidCPF();
  }
  
  return n;
}

// Gerar inscrição municipal
export function generateInscricaoMunicipal(): string {
  let im = '';
  for (let i = 0; i < 8; i++) {
    im += Math.floor(Math.random() * 10).toString();
  }
  return im;
}

// Gerar razão social para empresa
export function generateRazaoSocial(): string {
  const prefixos = [
    'Empresa', 'Consultoria', 'Serviços', 'Tecnologia', 'Sistemas', 
    'Inovação', 'Soluções', 'Desenvolvimento', 'Digital', 'Smart'
  ];
  
  const nomes = [
    'Alpha', 'Beta', 'Gamma', 'Delta', 'Omega', 'Prime', 'Nova', 
    'Ultra', 'Mega', 'Super', 'Advanced', 'Professional', 'Premium',
    'Excellence', 'Quality', 'Success', 'Future', 'Dynamic', 'Global'
  ];
  
  const sufixos = [
    'Ltda', 'S/A', 'ME', 'EPP', 'EIRELI'
  ];
  
  const prefixo = prefixos[Math.floor(Math.random() * prefixos.length)];
  const nome = nomes[Math.floor(Math.random() * nomes.length)];
  const sufixo = sufixos[Math.floor(Math.random() * sufixos.length)];
  
  return `${prefixo} ${nome} ${sufixo}`;
}

// Gerar nome fantasia
export function generateNomeFantasia(): string {
  const nomes = [
    'TechSolutions', 'DataWorks', 'CloudFirst', 'DevTeam', 'CodeLab',
    'InnovateTech', 'SmartSys', 'DigitalPro', 'WebMaster', 'SoftwareHub',
    'TechVision', 'DataFlow', 'CloudSync', 'DevStudio', 'CodeWorks'
  ];
  
  return nomes[Math.floor(Math.random() * nomes.length)];
}

// Gerar nome completo para pessoa física
export function generateNomeCompleto(): string {
  const primeirosNomes = [
    'João', 'Maria', 'José', 'Ana', 'Carlos', 'Francisca', 'Antônio', 'Luiza',
    'Paulo', 'Sandra', 'Francisco', 'Regina', 'Marcos', 'Fernanda', 'Pedro',
    'Juliana', 'Ricardo', 'Patricia', 'Roberto', 'Monica', 'Fernando', 'Carla'
  ];
  
  const sobrenomes = [
    'Silva', 'Santos', 'Oliveira', 'Souza', 'Lima', 'Pereira', 'Costa', 'Rodrigues',
    'Martins', 'Jesus', 'Barbosa', 'Ribeiro', 'Nascimento', 'Araújo', 'Fernandes',
    'Carvalho', 'Gomes', 'Cardoso', 'Rocha', 'Mendes', 'Almeida', 'Monteiro'
  ];
  
  const primeiroNome = primeirosNomes[Math.floor(Math.random() * primeirosNomes.length)];
  const sobrenome1 = sobrenomes[Math.floor(Math.random() * sobrenomes.length)];
  const sobrenome2 = sobrenomes[Math.floor(Math.random() * sobrenomes.length)];
  
  return `${primeiroNome} ${sobrenome1} ${sobrenome2}`;
}

// Função principal para gerar dados de teste para pessoa jurídica
export function generateTestDataPJ() {
  return {
    cnpj: generateValidCNPJ(),
    razaoSocial: generateRazaoSocial(),
    nomeFantasia: generateNomeFantasia(),
    inscricaoMunicipal: generateInscricaoMunicipal()
  };
}

// Função principal para gerar dados de teste para pessoa física
export function generateTestDataPF() {
  return {
    cpf: generateValidCPF(),
    nomeCompleto: generateNomeCompleto(),
    inscricaoMunicipal: generateInscricaoMunicipal()
  };
}

// Função de teste para validar os geradores
export function testGenerators() {
  console.log('=== Testando Geradores ===');
  
  // Testar CNPJ
  for (let i = 0; i < 5; i++) {
    const cnpj = generateValidCNPJ();
    const isValid = validateCNPJ(cnpj);
    console.log(`CNPJ ${i + 1}: ${cnpj} - ${isValid ? 'VÁLIDO' : 'INVÁLIDO'}`);
  }
  
  console.log('');
  
  // Testar CPF
  for (let i = 0; i < 5; i++) {
    const cpf = generateValidCPF();
    const isValid = validateCPF(cpf);
    console.log(`CPF ${i + 1}: ${cpf} - ${isValid ? 'VÁLIDO' : 'INVÁLIDO'}`);
  }
}