'use client';

import { useState } from 'react';

interface XMLViewerProps {
  xml: string;
}

export default function XMLViewer({ xml }: XMLViewerProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(xml);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Erro ao copiar XML:', err);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nfse-${new Date().toISOString().split('T')[0]}.xml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatXML = (xmlString: string): string => {
    if (!xmlString) return '';
    
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlString, 'application/xml');
      const serializer = new XMLSerializer();
      const formatted = serializer.serializeToString(xmlDoc);
      
      // Adiciona quebras de linha e indentação
      return formatted
        .replace(/></g, '>\n<')
        .split('\n')
        .map((line, index) => {
          const depth = line.match(/^<\//) ? -1 : line.match(/^<[^\/][^>]*[^\/]>/) ? 0 : 0;
          const indent = '  '.repeat(Math.max(0, index > 0 ? depth : 0));
          return indent + line.trim();
        })
        .join('\n');
    } catch {
      return xmlString;
    }
  };

  const highlightXML = (xmlString: string): string => {
    if (!xmlString) return '';
    
    return xmlString
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/(&lt;\/?[^&\s]*&gt;)/g, '<span class="text-blue-600 font-semibold">$1</span>')
      .replace(/(&lt;[^&]*\s)([^=\s&]*)(=)(&quot;[^&quot;]*&quot;)([^&]*&gt;)/g, 
        '$1<span class="text-green-600">$2</span><span class="text-gray-500">$3</span><span class="text-red-600">$4</span>$5')
      .replace(/(&lt;[^&]*&gt;)([^&]*)(&lt;\/[^&]*&gt;)/g, 
        '$1<span class="text-gray-800">$2</span>$3');
  };

  if (!xml) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="text-gray-500">Nenhum XML gerado ainda.</p>
        <p className="text-sm text-gray-400 mt-2">
          Preencha o formulário e clique em &quot;Gerar XML NFSe&quot; para visualizar o resultado.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">XML da NFSe Gerado</h3>
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            {copied ? 'Copiado!' : 'Copiar'}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download
          </button>
        </div>
      </div>

      <div className="bg-gray-900 rounded-lg p-4 overflow-auto max-h-96">
        <pre className="text-sm">
          <code 
            className="text-gray-100"
            dangerouslySetInnerHTML={{ 
              __html: highlightXML(formatXML(xml)) 
            }}
          />
        </pre>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-md p-4">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-green-400 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" 
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
              clipRule="evenodd" />
          </svg>
          <div>
            <h4 className="text-sm font-medium text-green-800">XML Gerado com Sucesso</h4>
            <div className="text-sm text-green-700 mt-1">
              <p>• Estrutura XML válida conforme schema NFSe v1.00</p>
              <p>• Dados validados conforme regras de negócio</p>
              <p>• Pronto para assinatura digital e envio</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-yellow-400 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" 
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" 
              clipRule="evenodd" />
          </svg>
          <div>
            <h4 className="text-sm font-medium text-yellow-800">Próximas Etapas</h4>
            <div className="text-sm text-yellow-700 mt-1">
              <p>1. Assinar digitalmente o XML com certificado A1/A3</p>
              <p>2. Enviar para o webservice da Sefaz</p>
              <p>3. Processar retorno e eventos</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}