'use client';

import { useState } from 'react';
import nfseApiService from '@/services/nfse-api';
import { Lotedfe } from '@/types/nfse-api';
import { toast } from 'react-toastify';

export default function NFSesPage() {
  const [nsu, setNsu] = useState('');
  const [nfses, setNfses] = useState<Lotedfe[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState<Lotedfe | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [showXmlModal, setShowXmlModal] = useState<Lotedfe | null>(null);
  const [decompressedXml, setDecompressedXml] = useState<string>('');
  const [isCopied, setIsCopied] = useState(false);

  const handleSearch = async () => {
    if (!nsu.trim()) {
      toast.error('Por favor, informe o NSU');
      return;
    }

    try {
      setLoading(true);
      const result = await nfseApiService.consultarLoteDfe(nsu.trim());
      setNfses(result);
      setSearched(true);
      if (result.length === 0) {
        toast.info('Nenhuma NFSe encontrada para este NSU');
      }
    } catch (error) {
      console.error('Erro ao consultar lote DFe:', error);
      toast.error('Erro ao consultar lote DFe');
      setNfses([]);
      setSearched(true);
    } finally {
      setLoading(false);
    }
  };

  const handleViewPDF = async (chaveAcesso: string) => {
    try {
      const pdfUrl = await nfseApiService.visualizarDanfe(chaveAcesso);
      window.open(pdfUrl, '_blank');
    } catch (error) {
      console.error('Erro ao visualizar PDF:', error);
      toast.error('Erro ao abrir PDF da NFSe');
    }
  };

  const handleDownloadPDF = async (chaveAcesso: string) => {
    try {
      const blob = await nfseApiService.downloadDanfe(chaveAcesso);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `DANFE_${chaveAcesso}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('PDF baixado com sucesso');
    } catch (error) {
      console.error('Erro ao baixar PDF:', error);
      toast.error('Erro ao baixar PDF da NFSe');
    }
  };

  const openCancelModal = (nfse: Lotedfe) => {
    setShowCancelModal(nfse);
  };

  const closeCancelModal = () => {
    setShowCancelModal(null);
  };

  const handleCancelNfse = async () => {
    if (!showCancelModal?.chaveAcesso) return;

    try {
      setCancelling(true);

      // Usar o XML compactado e em base64 como vem da API
      const response = await nfseApiService.cancelarNfse({
        chaveAcesso: showCancelModal.chaveAcesso,
        xmlCancelamento: showCancelModal.arquivoXml // XML já vem compactado em base64
      });

      if (response.success) {
        toast.success('NFSe cancelada com sucesso');
        // Recarregar a lista
        if (nsu.trim()) {
          handleSearch();
        }
      } else {
        toast.error(`Erro ao cancelar NFSe: ${response.errorMessage?.Descricao || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error('Erro ao cancelar NFSe:', error);
      toast.error('Erro ao cancelar NFSe');
    } finally {
      setCancelling(false);
      closeCancelModal();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleViewXml = async (nfse: Lotedfe) => {
    if (!nfse.arquivoXml) {
      toast.error('XML não disponível para esta NFSe');
      return;
    }

    try {
      // O XML vem compactado (gzip) e em base64
      // Primeiro decodifica base64
      const base64Decoded = atob(nfse.arquivoXml);

      // Converter string para Uint8Array
      const uint8Array = new Uint8Array(base64Decoded.length);
      for (let i = 0; i < base64Decoded.length; i++) {
        uint8Array[i] = base64Decoded.charCodeAt(i);
      }

      // Tentar descompactar usando pako
      const pako = await import('pako');
      let decompressed: string;

      try {
        // Primeiro tenta inflate (deflate)
        decompressed = pako.inflate(uint8Array, { to: 'string' });
      } catch {
        try {
          // Se falhar, tenta ungzip
          decompressed = pako.ungzip(uint8Array, { to: 'string' });
        } catch {
          // Se ambos falharem, talvez seja apenas base64 sem compactação
          decompressed = base64Decoded;
        }
      }

      setDecompressedXml(decompressed);
      setShowXmlModal(nfse);
      setIsCopied(false); // Reset do estado de copiado
    } catch (error) {
      console.error('Erro ao processar XML:', error);
      toast.error('Erro ao processar XML. Verificando diferentes formatos...');

      // Fallback: tentar apenas decodificar base64
      try {
        const fallbackXml = atob(nfse.arquivoXml);
        setDecompressedXml(fallbackXml);
        setShowXmlModal(nfse);
        setIsCopied(false); // Reset do estado de copiado
      } catch (fallbackError) {
        console.error('Erro no fallback:', fallbackError);
        toast.error('Não foi possível processar o XML');
      }
    }
  };

  const downloadXml = (nfse: Lotedfe) => {
    if (!decompressedXml) {
      toast.error('Nenhum conteúdo XML disponível para download');
      return;
    }

    const blob = new Blob([decompressedXml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nfse-${nfse.chaveAcesso}-${nfse.nsu}.xml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('XML baixado com sucesso');
  };

  const copyXmlToClipboard = async () => {
    if (!decompressedXml) {
      toast.error('Nenhum conteúdo XML para copiar');
      return;
    }

    try {
      await navigator.clipboard.writeText(decompressedXml);
      setIsCopied(true);
      toast.success('XML copiado para a área de transferência');

      // Reset do estado após 2 segundos
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (error) {
      console.error('Erro ao copiar XML:', error);
      toast.error('Erro ao copiar XML');
    }
  };

  const formatXML = (xmlString: string): string => {
    if (!xmlString) return '';

    try {
      // Limpa o XML removendo espaços extras
      let xml = xmlString.replace(/>\s+</g, '><').trim();

      // Quebra por tags
      xml = xml.replace(/></g, '>\n<');

      const lines = xml.split('\n');
      const result: string[] = [];
      let indentLevel = 0;

      for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine) continue;

        // Verifica se é uma linha com tag completa (abertura e fechamento na mesma linha)
        const hasCompleteTag = trimmedLine.match(/^<([^\/!?][^>]*)>.*<\/\1>$/);

        // Se é tag de fechamento </xxx>, diminui indentação antes
        if (trimmedLine.startsWith('</')) {
          indentLevel = Math.max(0, indentLevel - 1);
        }

        // Aplica indentação
        const indent = '  '.repeat(indentLevel);
        result.push(indent + trimmedLine);

        // Se é tag de abertura <xxx> (não self-closing e não declaração XML), aumenta indentação depois
        // Mas se for uma tag completa na mesma linha, não aumenta indentação
        if (trimmedLine.startsWith('<') &&
          !trimmedLine.startsWith('</') &&
          !trimmedLine.endsWith('/>') &&
          !trimmedLine.startsWith('<?xml') &&
          !trimmedLine.startsWith('<!--') &&
          !hasCompleteTag) {
          indentLevel++;
        }
      }

      return result.join('\n');
    } catch (error) {
      console.warn('Erro ao formatar XML:', error);
      return xmlString;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Consulta de NFSes</h1>
          <p className="text-gray-600">Consulte NFSes por NSU (Número Sequencial Único)</p>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label htmlFor="nsu" className="block text-sm font-medium text-gray-700 mb-2">
                NSU (Número Sequencial Único)
              </label>
              <input
                id="nsu"
                type="text"
                value={nsu}
                onChange={(e) => setNsu(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite o NSU para consulta"
                className="w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              />
            </div>

            <button
              onClick={handleSearch}
              disabled={loading || !nsu.trim()}
              className="px-6 py-2 h-[42px] bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex self-end items-center gap-2"
            >
              {loading && (
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {loading ? 'Pesquisando...' : 'Pesquisar'}
            </button>

          </div>
        </div>

        {/* Results Section */}
        {searched && (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Resultados da Consulta {nsu && `- NSU: ${nsu}`}
              </h2>
              {nfses.length > 0 && (
                <p className="text-sm text-gray-600 mt-1">
                  {nfses.length} NFSe{nfses.length !== 1 ? 's' : ''} encontrada{nfses.length !== 1 ? 's' : ''}
                </p>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      NSU
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Chave de Acesso
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo Documento
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data Recebimento
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {nfses.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                        {loading ? 'Carregando...' : 'Nenhuma NFSe encontrada para este NSU'}
                      </td>
                    </tr>
                  ) : (
                    nfses.map((nfse, index) => (
                      <tr key={`${nfse.nsu}-${index}`} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{nfse.nsu}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 font-mono">
                            {nfse.chaveAcesso || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {nfse.tipoDocumento || 'N/A'}
                          </div>
                          {nfse.tipoEvento && (
                            <div className="text-sm text-gray-500">
                              Evento: {nfse.tipoEvento}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatDate(nfse.dataHoraRecebimento)}
                          </div>
                          {nfse.dataHoraGeracao && (
                            <div className="text-sm text-gray-500">
                              Gerado: {formatDate(nfse.dataHoraGeracao)}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-1">
                            {nfse.chaveAcesso && (
                              <>
                                <button
                                  onClick={() => handleViewPDF(nfse.chaveAcesso!)}
                                  className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-blue-100 text-blue-600 hover:bg-blue-200 hover:text-blue-700 transition-colors"
                                  title="Visualizar PDF"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                </button>

                                <button
                                  onClick={() => handleDownloadPDF(nfse.chaveAcesso!)}
                                  className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-green-100 text-green-600 hover:bg-green-200 hover:text-green-700 transition-colors"
                                  title="Download PDF"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                </button>
                              </>
                            )}

                            {nfse.arquivoXml && (
                              <button
                                onClick={() => handleViewXml(nfse)}
                                className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-purple-100 text-purple-600 hover:bg-purple-200 hover:text-purple-700 transition-colors"
                                title="Visualizar XML"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                </svg>
                              </button>
                            )}

                            {nfse.chaveAcesso && (
                              <button
                                onClick={() => openCancelModal(nfse)}
                                className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-red-100 text-red-600 hover:bg-red-200 hover:text-red-700 transition-colors"
                                title="Cancelar NFSe"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            )}

                            {!nfse.chaveAcesso && !nfse.arquivoXml && (
                              <span className="text-gray-400 text-xs">Sem ações disponíveis</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {nfses.length === 0 && searched && !loading && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma NFSe encontrada</h3>
                <p className="text-gray-600">Não há NFSes para o NSU informado.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal de Confirmação de Cancelamento */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-gray-600/40 overflow-y-auto h-full w-full z-50">
          <div className="relative top-40 mx-auto p-5 border w-[650px] shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h3 className="text-2xl font-medium text-red-600 mt-4">Confirmar Cancelamento</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-700">
                  Tem certeza que deseja cancelar esta NFSe?
                </p>
                <div className="mt-3 text-left bg-gray-50 rounded-md p-3">
                  <div className="text-sm">
                    <div className="font-medium text-gray-600 mb-2"><span className="font-semibold w-40">NSU:</span> {showCancelModal.nsu}</div>
                    <div className="text-gray-600 mb-2"><span className="font-semibold w-20">Chave de acesso:</span> {showCancelModal.chaveAcesso}</div>
                    <div className="text-gray-600 mb-2"><span className="font-semibold w-20">Tipo:</span> {showCancelModal.tipoDocumento}</div>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Esta ação não pode ser desfeita.
                </p>
              </div>
              <div className="items-center px-4 py-3">
                <div className="flex justify-center gap-3">
                  <button
                    onClick={closeCancelModal}
                    disabled={cancelling}
                    className="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md hover:bg-gray-600 transition-colors disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleCancelNfse}
                    disabled={cancelling}
                    className="px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {cancelling && (
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                    {cancelling ? 'Cancelando...' : 'Confirmar Cancelamento'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Visualização do XML */}
      {showXmlModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-5xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-medium text-emerald-700">
                  <span className="font-semibold">NSU:</span> {showXmlModal.nsu}
                </h3>
                <button
                  onClick={() => setShowXmlModal(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mb-4 grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-semibold">NSU:</span>
                  <span className="ml-2">{showXmlModal.nsu}</span>
                </div>
                <div className="-ml-30">
                  <span className="font-semibold">Chave de Acesso:</span>
                  <span className="ml-2 font-mono">{showXmlModal.chaveAcesso}</span>
                </div>
                <div>
                  <span className="font-semibold">Tipo Documento:</span>
                  <span className="ml-2">{showXmlModal.tipoDocumento}</span>
                </div>
                <div className="-ml-30">
                  <span className="font-semibold">Data Recebimento:</span>
                  <span className="ml-2">{formatDate(showXmlModal.dataHoraGeracao)}</span>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">Conteúdo XML:</h4>
                  <div className="flex gap-2">
                    <button
                      onClick={copyXmlToClipboard}
                      className={`relative inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-md transition-all duration-300 transform ${isCopied
                        ? 'bg-green-100 text-green-700 scale-110 shadow-lg animate-pulse'
                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200 hover:scale-105'
                        }`}
                      disabled={isCopied}
                    >
                      {isCopied ? (
                        <>
                          <svg className="w-4 h-4 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="animate-pulse">Copiado!</span>
                          <div className="absolute -top-1 -right-1 w-3 h-3">
                            <div className="w-full h-full bg-green-400 rounded-full animate-ping"></div>
                            <div className="absolute inset-0 w-full h-full bg-green-500 rounded-full animate-pulse"></div>
                          </div>
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 transition-transform hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          Copiar
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => downloadXml(showXmlModal)}
                      className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-green-100 text-green-700 hover:bg-green-200 rounded-md transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Download
                    </button>
                  </div>
                </div>
                <div className="bg-gray-900 rounded-lg p-4 overflow-auto max-h-96">
                  <pre className="text-sm text-gray-100 whitespace-pre-wrap">
                    {decompressedXml ? formatXML(decompressedXml) : (
                      <span className="text-gray-400 italic">Nenhum conteúdo XML disponível</span>
                    )}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}