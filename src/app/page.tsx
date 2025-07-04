'use client';

import { useState } from 'react';
import CompleteNFSeForm from '../components/nfse/CompleteNFSeForm';
import XMLViewer from '../components/nfse/XMLViewer';

export default function Home() {
  const [generatedXML, setGeneratedXML] = useState<string>('');
  const [activeView, setActiveView] = useState<'form' | 'xml'>('form');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Gerador de NFSe
              </h1>
              <p className="text-gray-600 mt-1">
                Preencha os dados e gere o XML da Nota Fiscal de Serviço Eletrônica
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <nav className="flex space-x-1">
                <button
                  onClick={() => setActiveView('form')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeView === 'form'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  Formulário
                </button>
                <button
                  onClick={() => setActiveView('xml')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeView === 'xml'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  XML
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {activeView === 'form' ? (
          <CompleteNFSeForm
            onXMLGenerated={(xml) => {
              setGeneratedXML(xml);
              setActiveView('xml');
            }}
          />
        ) : (
          <XMLViewer xml={generatedXML} />
        )}
      </main>
    </div>
  );
}
