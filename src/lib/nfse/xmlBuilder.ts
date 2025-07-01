// Classe utilitária para construção condicional de XML
export class XMLBuilder {
  private elements: string[] = [];
  private indentLevel = 0;

  constructor(private includeDeclaration = true) {
    if (includeDeclaration) {
      this.elements.push('<?xml version="1.0" encoding="UTF-8"?>');
    }
  }

  // Adiciona um elemento com indentação
  private getIndent(): string {
    return '  '.repeat(this.indentLevel);
  }

  // Adiciona elemento de abertura
  openElement(tagName: string, attributes?: Record<string, string | number>, namespace?: string): XMLBuilder {
    let openTag = `<${tagName}`;
    
    if (namespace) {
      openTag += ` xmlns="${namespace}"`;
    }
    
    if (attributes) {
      Object.entries(attributes).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          openTag += ` ${key}="${value}"`;
        }
      });
    }
    
    openTag += '>';
    this.elements.push(this.getIndent() + openTag);
    this.indentLevel++;
    return this;
  }

  // Adiciona elemento de fechamento
  closeElement(tagName: string): XMLBuilder {
    this.indentLevel--;
    this.elements.push(this.getIndent() + `</${tagName}>`);
    return this;
  }

  // Adiciona elemento simples com valor
  addElement(tagName: string, value?: string | number | boolean, attributes?: Record<string, string | number>): XMLBuilder {
    if (value === undefined || value === null || value === '') {
      return this; // Não adiciona elementos vazios
    }

    let element = `<${tagName}`;
    
    if (attributes) {
      Object.entries(attributes).forEach(([key, attrValue]) => {
        if (attrValue !== undefined && attrValue !== null && attrValue !== '') {
          element += ` ${key}="${attrValue}"`;
        }
      });
    }
    
    element += `>${value}</${tagName}>`;
    this.elements.push(this.getIndent() + element);
    return this;
  }

  // Adiciona elemento condicional
  addConditional(condition: boolean, callback: (builder: XMLBuilder) => void): XMLBuilder {
    if (condition) {
      callback(this);
    }
    return this;
  }

  // Adiciona elemento apenas se valor não estiver vazio
  addOptional(tagName: string, value?: string | number | boolean, attributes?: Record<string, string | number>): XMLBuilder {
    if (value !== undefined && value !== null && value !== '' && value !== 0) {
      return this.addElement(tagName, value, attributes);
    }
    return this;
  }

  // Adiciona número formatado com decimais
  addNumber(tagName: string, value?: number, decimals = 2): XMLBuilder {
    if (value !== undefined && value !== null && !isNaN(value)) {
      return this.addElement(tagName, value.toFixed(decimals));
    }
    return this;
  }

  // Adiciona data formatada
  addDate(tagName: string, date?: string): XMLBuilder {
    if (date && date.trim()) {
      // Garantir formato correto da data
      const formattedDate = date.includes('T') ? date : `${date}T00:00:00-03:00`;
      return this.addElement(tagName, formattedDate);
    }
    return this;
  }

  // Constrói o XML final
  build(): string {
    return this.elements.join('\n');
  }

  // Limpa o builder
  clear(): XMLBuilder {
    this.elements = [];
    this.indentLevel = 0;
    if (this.includeDeclaration) {
      this.elements.push('<?xml version="1.0" encoding="UTF-8"?>');
    }
    return this;
  }

  // Adiciona comentário
  addComment(comment: string): XMLBuilder {
    this.elements.push(this.getIndent() + `<!-- ${comment} -->`);
    return this;
  }

  // Adiciona linha em branco
  addBlankLine(): XMLBuilder {
    this.elements.push('');
    return this;
  }

  // Adiciona texto raw (sem indentação)
  addRaw(text: string): XMLBuilder {
    this.elements.push(text);
    return this;
  }

  // Helpers para estruturas complexas
  addGroup(tagName: string, attributes: Record<string, string | number> | undefined, callback: (builder: XMLBuilder) => void): XMLBuilder {
    this.openElement(tagName, attributes);
    callback(this);
    this.closeElement(tagName);
    return this;
  }

  addConditionalGroup(condition: boolean, tagName: string, attributes: Record<string, string | number> | undefined, callback: (builder: XMLBuilder) => void): XMLBuilder {
    if (condition) {
      return this.addGroup(tagName, attributes, callback);
    }
    return this;
  }

  // Helper para choice (ou um ou outro)
  addChoice(choices: Array<{ condition: boolean; callback: (builder: XMLBuilder) => void }>): XMLBuilder {
    for (const choice of choices) {
      if (choice.condition) {
        choice.callback(this);
        break; // Apenas o primeiro true é executado
      }
    }
    return this;
  }
}

// Funções utilitárias para validação de dados
export class XMLUtils {
  static isNotEmpty(value: any): boolean {
    return value !== undefined && value !== null && value !== '' && 
           (typeof value !== 'number' || !isNaN(value));
  }

  static hasAnyValue(obj: any): boolean {
    if (!obj || typeof obj !== 'object') return false;
    
    return Object.values(obj).some(value => {
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      if (typeof value === 'object') {
        return XMLUtils.hasAnyValue(value);
      }
      return XMLUtils.isNotEmpty(value);
    });
  }

  static formatCurrency(value: number): string {
    return value !== undefined && value !== null && !isNaN(value) ? value.toFixed(2) : '0.00';
  }

  static formatPercentage(value: number, decimals = 2): string | undefined {
    return value !== undefined && value !== null && !isNaN(value) ? value.toFixed(decimals) : undefined;
  }

  static formatDate(date: string): string {
    if (!date) return '';
    
    // Se já tem timezone, mantém
    if (date.includes('T') && (date.includes('+') || date.includes('-') || date.endsWith('Z'))) {
      return date;
    }
    
    // Se é só data, adiciona hora e timezone
    if (date.length === 10) {
      return `${date}T00:00:00-03:00`;
    }
    
    // Se tem hora mas não tem timezone, adiciona
    if (date.includes('T') && !date.includes('+') && !date.includes('-') && !date.endsWith('Z')) {
      return `${date}-03:00`;
    }
    
    return date;
  }

  static sanitizeText(text: string): string {
    if (!text) return '';
    
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;')
      .trim();
  }

  static formatCNPJCPF(value: string): string {
    if (!value) return '';
    // Remove qualquer formatação e mantém apenas números
    return value.replace(/\D/g, '');
  }

  static formatCEP(value: string): string {
    if (!value) return '';
    // Remove qualquer formatação e mantém apenas números
    return value.replace(/\D/g, '');
  }

  static formatPhone(value: string): string {
    if (!value) return '';
    // Remove qualquer formatação e mantém apenas números
    return value.replace(/\D/g, '');
  }
}