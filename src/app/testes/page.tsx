'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import nfseApiService from '@/services/nfse-api';
import { TesteResponse } from '@/types/nfse-api';

export default function TestesPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedTest, setSelectedTest] = useState<TesteResponse | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<TesteResponse | null>(null);
  const queryClient = useQueryClient();

  const { data: testesData, isLoading, error, refetch } = useQuery({
    queryKey: ['testes-paginated', currentPage, pageSize],
    queryFn: () => nfseApiService.getPaginatedTestes(currentPage, pageSize),
    staleTime: 1000 * 60 * 5,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => nfseApiService.deleteTeste(id.toString()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testes-paginated'] });
      setShowDeleteModal(null);
    },
    onError: (error) => {
      console.error('Erro ao deletar teste:', error);
    },
  });

  const handleDeleteTest = (test: TesteResponse) => {
    setShowDeleteModal(test);
  };

  const confirmDelete = () => {
    if (showDeleteModal) {
      deleteMutation.mutate(showDeleteModal.id);
    }
  };

  const handleViewXml = (test: TesteResponse) => {
    console.log('Visualizando XML do teste:', test);
    console.log('XML Content:', test.xml);
    setSelectedTest(test);
  };

  const downloadXml = (test: TesteResponse) => {
    if (!test.xml || test.xml.trim() === '') {
      alert('Nenhum conteúdo XML disponível para download');
      return;
    }

    const blob = new Blob([test.xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `teste-${test.nome}-${test.chaveAcesso}.xml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.966-.833-2.732 0L3.732 19c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Erro ao carregar testes</h3>
          <p className="text-gray-600 mb-4">Não foi possível carregar os testes salvos.</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Testes Salvos</h1>
          <p className="text-gray-600">Visualize e gerencie os testes de XML NFSe salvos</p>
        </div>


        {/* Statistics */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Total de Testes: {testesData?.totalCount || 0}
              </h2>
              <p className="text-sm text-gray-600">
                Mostrando {testesData?.data?.length || 0} testes nesta página
              </p>
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="pageSize" className="text-sm text-gray-700">
                Itens por página:
              </label>
              <select
                id="pageSize"
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tests List */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Lista de Testes</h2>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Carregando testes...</p>
              </div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nome do Teste
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Chave de Acesso
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data do Teste
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {testesData?.data && Array.isArray(testesData.data) ? testesData.data.map((test) => (
                      <tr key={test.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="text-sm font-medium text-gray-900">{test.nome}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 font-mono">{test.chaveAcesso}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatDate(test.dataTeste)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleViewXml(test)}
                              className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-blue-100 text-blue-600 hover:bg-blue-200 hover:text-blue-700 transition-colors"
                              title="Visualizar XML"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => downloadXml(test)}
                              className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-green-100 text-green-600 hover:bg-green-200 hover:text-green-700 transition-colors"
                              title="Download XML"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteTest(test)}
                              className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-red-100 text-red-600 hover:bg-red-200 hover:text-red-700 transition-colors"
                              title="Excluir teste"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                          {isLoading ? 'Carregando...' : 'Nenhum teste encontrado'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {testesData?.data && Array.isArray(testesData.data) && testesData.data.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum teste encontrado</h3>
                  <p className="text-gray-600">Não há testes salvos ainda.</p>
                </div>
              )}

              {/* Pagination */}
              {testesData && testesData.totalCount > 0 && (
                <div className="px-6 py-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Mostrando {((currentPage - 1) * pageSize) + 1} a {Math.min(currentPage * pageSize, testesData.totalCount || 0)} de {testesData.totalCount || 0} resultados
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={!testesData.hasPreviousPage}
                        className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        Anterior
                      </button>
                      <span className="text-sm text-gray-700">
                        Página {currentPage} de {testesData.totalPages || 1}
                      </span>
                      <button
                        onClick={() => setCurrentPage(prev => prev + 1)}
                        disabled={!testesData.hasNextPage}
                        className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        Próxima
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* XML Modal */}
      {selectedTest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  XML do Teste: {selectedTest.nome}
                </h3>
                <button
                  onClick={() => setSelectedTest(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mb-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Chave de Acesso:</span>
                  <span className="ml-2 font-mono">{selectedTest.chaveAcesso}</span>
                </div>
                <div>
                  <span className="font-medium">Data do Teste:</span>
                  <span className="ml-2">{formatDate(selectedTest.dataTeste)}</span>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">XML Content:</h4>
                  <button
                    onClick={() => downloadXml(selectedTest)}
                    className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-green-100 text-green-700 hover:bg-green-200 rounded-md transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download
                  </button>
                </div>
                <div className="bg-gray-900 rounded-lg p-4 overflow-auto max-h-96">
                  <pre className="text-sm text-gray-100 whitespace-pre-wrap">
                    {selectedTest.xml ? formatXML(selectedTest.xml) : (
                      <span className="text-gray-400 italic">Nenhum conteúdo XML disponível</span>
                    )}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-600/40 overflow-y-auto h-full w-full z-50">
          <div className="relative top-40 mx-auto p-5 border w-[450px] shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mt-4">Confirmar Exclusão</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Tem certeza que deseja excluir o teste "{showDeleteModal.nome}"?
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Esta ação não pode ser desfeita.
                </p>
              </div>
              <div className="items-center px-4 py-3">
                <div className="flex justify-center gap-3">
                  <button
                    onClick={() => setShowDeleteModal(null)}
                    className="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md hover:bg-gray-600 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={confirmDelete}
                    disabled={deleteMutation.isPending}
                    className="px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {deleteMutation.isPending ? 'Excluindo...' : 'Excluir'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}