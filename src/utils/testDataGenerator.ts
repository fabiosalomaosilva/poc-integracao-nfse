// Utilitários para gerar dados de teste válidos

// Gerar CNPJ válido
export function generateValidCNPJ(): string {
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const weights2 = [6, 7, 8, 9, 2, 3, 4, 5, 6, 7, 8, 9];
  
  // Gerar primeiros 8 dígitos (base)
  let cnpj = '';
  for (let i = 0; i < 8; i++) {
    cnpj += Math.floor(Math.random() * 10);
  }
  
  // Adicionar sequência 0001 (filial)
  cnpj += '0001';
  
  // Calcular primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cnpj[i]) * weights1[i];
  }
  let digit1 = sum % 11;
  digit1 = digit1 < 2 ? 0 : 11 - digit1;
  cnpj += digit1;
  
  // Calcular segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cnpj[i]) * weights2[i];
  }
  let digit2 = sum % 11;
  digit2 = digit2 < 2 ? 0 : 11 - digit2;
  cnpj += digit2;
  
  return cnpj;
}

// Gerar CPF válido
export function generateValidCPF(): string {
  // Gerar primeiros 9 dígitos
  let cpf = '';
  for (let i = 0; i < 9; i++) {
    cpf += Math.floor(Math.random() * 10);
  }
  
  // Calcular primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf[i]) * (10 - i);
  }
  let digit1 = sum % 11;
  digit1 = digit1 < 2 ? 0 : 11 - digit1;
  cpf += digit1;
  
  // Calcular segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf[i]) * (11 - i);
  }
  let digit2 = sum % 11;
  digit2 = digit2 < 2 ? 0 : 11 - digit2;
  cpf += digit2;
  
  return cpf;
}

// Gerar inscrição municipal
export function generateInscricaoMunicipal(): string {
  let im = '';
  for (let i = 0; i < 8; i++) {
    im += Math.floor(Math.random() * 10);
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