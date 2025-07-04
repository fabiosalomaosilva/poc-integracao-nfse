'use client';

import { useState } from 'react';
import CompleteNFSeForm from '../components/nfse/CompleteNFSeForm';
import XMLViewer from '../components/nfse/XMLViewer';
import { FiEdit3, FiCode } from 'react-icons/fi';

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
              <nav className="flex bg-gray-100 rounded-xl p-1 shadow-inner">
                <button
                  onClick={() => setActiveView('form')}
                  className={`relative flex items-center gap-3 px-6 py-3 text-sm font-semibold rounded-lg transition-all duration-300 transform ${activeView === 'form'
                    ? 'bg-white text-blue-700 shadow-lg scale-105 ring-2 ring-blue-100'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:scale-102'
                    }`}
                >
                  <FiEdit3 className={`w-5 h-5 transition-all duration-300 ${activeView === 'form' ? 'text-blue-600 drop-shadow-sm' : 'text-gray-500'
                    }`} />
                  <span className="relative">
                    Formulário
                    {activeView === 'form' && (
                      <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"></div>
                    )}
                  </span>
                  {activeView === 'form' && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  )}
                </button>

                <button
                  onClick={() => setActiveView('xml')}
                  className={`relative flex items-center gap-3 px-6 py-3 text-sm font-semibold rounded-lg transition-all duration-300 transform ${activeView === 'xml'
                    ? 'bg-white text-green-700 shadow-lg scale-105 ring-2 ring-green-100'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50 hover:scale-102'
                    }`}
                >
                  <FiCode className={`w-5 h-5 transition-all duration-300 ${activeView === 'xml' ? 'text-green-600 drop-shadow-sm' : 'text-gray-500'
                    }`} />
                  <span className="relative">
                    XML
                    {activeView === 'xml' && (
                      <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-green-400 to-green-600 rounded-full"></div>
                    )}
                  </span>
                  {activeView === 'xml' && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  )}
                  {generatedXML && activeView !== 'xml' && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-400 rounded-full animate-bounce">
                      <div className="absolute inset-0 w-full h-full bg-orange-500 rounded-full animate-ping"></div>
                    </div>
                  )}
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
