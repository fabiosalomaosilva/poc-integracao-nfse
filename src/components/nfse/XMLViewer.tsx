'use client';

import { useState } from 'react';
import { XmlSigningResponse } from '@/types/nfse-api';
import nfseApiService from '@/services/nfse-api';

interface XMLViewerProps {
  xml: string;
}

export default function XMLViewer({ xml }: XMLViewerProps) {
  const [copied, setCopied] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ success: boolean; message: string; apiData?: XmlSigningResponse } | null>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [currentApiData, setCurrentApiData] = useState<XmlSigningResponse | null>(null);

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

  const handleSendToAPI = async () => {
    if (!xml.trim()) {
      setSendResult({ success: false, message: 'Nenhum XML disponível para envio' });
      return;
    }

    setSending(true);
    setSendResult(null);

    try {
      const result: XmlSigningResponse = await nfseApiService.signAndSendXml(xml);

      setCurrentApiData(result);

      const chaveAcesso = result.lote[0]?.chaveAcesso || 'N/A';
      setSendResult({
        success: true,
        message: `XML processado com sucesso!\nChave de Acesso: ${chaveAcesso}\nStatus: ${result.lote[0]?.statusProcessamento || 'N/A'}`,
        apiData: result
      });

      console.log('Resposta da API:', result);
    } catch (error) {
      console.error('Erro ao enviar XML:', error);

      let errorMessage = 'Erro desconhecido ao enviar XML';

      if (error instanceof Error) {
        if (error.message.includes('Network Error') || error.message.includes('ECONNREFUSED')) {
          errorMessage = 'Erro de conexão: Verifique se a API está rodando e se o serviço está ativo.';
        } else if (error.message.includes('401')) {
          errorMessage = 'Erro de autenticação: Verifique se a API Key está configurada corretamente.';
        } else if (error.message.includes('403')) {
          errorMessage = 'Erro de autorização: A API Key não tem permissão para acessar este recurso.';
        } else if (error.message.includes('CORS')) {
          errorMessage = 'Erro CORS: A API precisa permitir requisições do domínio atual.';
        } else {
          errorMessage = error.message;
        }
      }

      setSendResult({
        success: false,
        message: errorMessage
      });
    } finally {
      setSending(false);
    }
  };

  const handleSaveTest = async (testName: string) => {
    if (!currentApiData || !testName.trim()) {
      return;
    }

    try {
      const testeData = {
        nome: testName.trim(),
        dataTeste: new Date().toISOString(),
        chaveAcesso: currentApiData.lote[0]?.chaveAcesso || '',
        xml: xml
      };

      const savedTest = await nfseApiService.createTeste(testeData);

      setSendResult({
        success: true,
        message: `Teste "${testName}" salvo com sucesso!\nID: ${savedTest.id}`,
        apiData: currentApiData
      });

      setShowSaveModal(false);
    } catch (error) {
      console.error('Erro ao salvar teste:', error);

      let errorMessage = 'Erro ao salvar teste. Tente novamente.';

      if (error instanceof Error) {
        if (error.message.includes('401')) {
          errorMessage = 'Erro de autenticação: Verifique se a API Key está configurada corretamente.';
        } else if (error.message.includes('400')) {
          errorMessage = 'Dados inválidos: Verifique se todos os campos estão preenchidos corretamente.';
        } else if (error.message.includes('500')) {
          errorMessage = 'Erro interno do servidor. Tente novamente mais tarde.';
        }
      }

      setSendResult({
        success: false,
        message: errorMessage
      });
    }
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
          <button
            onClick={handleSendToAPI}
            disabled={sending}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-green-100 hover:bg-green-200 text-green-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
            {sending ? 'Enviando...' : 'Enviar para API'}
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

      {sendResult && (
        <div className={`border rounded-md p-4 ${sendResult.success
          ? 'bg-green-50 border-green-200'
          : 'bg-red-50 border-red-200'
          }`}>
          <div className="flex items-start">
            <svg className={`w-5 h-5 mt-0.5 mr-2 ${sendResult.success ? 'text-green-400' : 'text-red-400'
              }`} fill="currentColor" viewBox="0 0 20 20">
              {sendResult.success ? (
                <path fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd" />
              ) : (
                <path fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd" />
              )}
            </svg>
            <div className="flex-1">
              <h4 className={`text-sm font-medium ${sendResult.success ? 'text-green-800' : 'text-red-800'
                }`}>
                {sendResult.success ? 'Sucesso!' : 'Erro no Envio'}
              </h4>
              <div className={`text-sm mt-1 ${sendResult.success ? 'text-green-700' : 'text-red-700'
                }`}>
                <pre className="whitespace-pre-wrap">{sendResult.message}</pre>
                {sendResult.success && sendResult.apiData && (
                  <button
                    onClick={() => setShowSaveModal(true)}
                    className="mt-3 inline-flex items-center px-3 py-2 border border-transparent text-xs font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Salvar Teste
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para salvar teste */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Salvar Teste
              </h3>
              <div className="mb-4">
                <label htmlFor="testName" className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Teste Realizado
                </label>
                <input
                  type="text"
                  id="testName"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder-gray-500 text-gray-700"
                  placeholder="Digite o nome do teste..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const input = e.target as HTMLInputElement;
                      handleSaveTest(input.value);
                    }
                  }}
                />
              </div>
              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => setShowSaveModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    const input = document.getElementById('testName') as HTMLInputElement;
                    if (input) {
                      handleSaveTest(input.value);
                    }
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}