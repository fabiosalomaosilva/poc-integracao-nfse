'use client';

import { useState } from 'react';
import { NFSeGenerator } from '../../lib/nfse/generator';
import { NFSeData } from '../../types/nfse';

interface NFSeFormProps {
  onXMLGenerated: (xml: string) => void;
}

export default function NFSeForm({ onXMLGenerated }: NFSeFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  
  const [formData, setFormData] = useState({
    // Dados básicos NFSe
    xLocEmi: 'Brasília - DF',
    xLocPrestacao: 'Brasília - DF',
    dhEmi: new Date().toISOString(),
    cNatOp: '1',
    cRegTrib: '1',
    xRegTrib: 'Regime Normal',
    optSimpNac: '2',
    dCompet: new Date().toISOString().substring(0, 7),
    
    // Prestador
    prestador: {
      cPrest: '12345',
      cnpj: '12345678000123',
      xNome: 'Empresa Prestadora LTDA',
      endereco: {
        xLog: 'Rua das Flores',
        nro: '123',
        xCpl: 'Sala 101',
        xBairro: 'Centro',
        cMun: '5300108',
        xMun: 'Brasília',
        uf: 'DF',
        cep: '70000000'
      },
      contato: {
        tel: '61999999999',
        email: 'contato@empresa.com.br'
      }
    },
    
    // Tomador
    tomador: {
      cnpjCpf: '98765432000187',
      xNome: 'Cliente Tomador LTDA',
      endereco: {
        xLog: 'Avenida Principal',
        nro: '456',
        xCpl: '',
        xBairro: 'Asa Norte',
        cMun: '5300108',
        xMun: 'Brasília',
        uf: 'DF',
        cep: '70000001'
      },
      contato: {
        tel: '61888888888',
        email: 'cliente@tomador.com.br'
      }
    },
    
    // Serviço
    servico: {
      cServ: '01.01',
      xServ: 'Análise e desenvolvimento de sistemas',
      cLCServ: '01.01',
      xLCServ: 'Análise e desenvolvimento de sistemas'
    },
    
    // Valores
    valores: {
      vServ: 1000.00,
      vDed: 0,
      vBC: 1000.00,
      pISS: 5.0000,
      vISS: 50.00,
      vLiq: 950.00
    }
  });

  const handleInputChange = (section: string, field: string, value: string | number, subField?: string) => {
    setFormData(prev => {
      const newData = { ...prev };
      const sectionData = { ...newData[section as keyof typeof prev] as Record<string, unknown> };
      
      if (subField) {
        const fieldData = { ...sectionData[field] as Record<string, unknown> };
        fieldData[subField] = value;
        sectionData[field] = fieldData;
      } else {
        sectionData[field] = value;
      }
      
      (newData as Record<string, unknown>)[section] = sectionData;
      return newData;
    });
  };

  const handleRootChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculateValues = () => {
    const vServ = formData.valores.vServ;
    const vDed = formData.valores.vDed || 0;
    const vBC = vServ - vDed;
    const pISS = formData.valores.pISS;
    const vISS = (vBC * pISS) / 100;
    const vLiq = vServ - vISS;

    handleInputChange('valores', 'vBC', vBC);
    handleInputChange('valores', 'vISS', vISS);
    handleInputChange('valores', 'vLiq', vLiq);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const nfseData: NFSeData = {
        versao: '1.00',
        infNFSe: {
          xLocEmi: formData.xLocEmi,
          xLocPrestacao: formData.xLocPrestacao,
          dhEmi: formData.dhEmi,
          cNatOp: formData.cNatOp,
          cRegTrib: formData.cRegTrib,
          xRegTrib: formData.xRegTrib,
          optSimpNac: formData.optSimpNac,
          dCompet: formData.dCompet,
          prestador: formData.prestador,
          tomador: formData.tomador,
          servico: formData.servico,
          valores: formData.valores
        }
      };

      const generator = new NFSeGenerator();
      const xml = generator.generateNFSeXML(nfseData);
      onXMLGenerated(xml);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao gerar XML');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Dados Básicos */}
      <section className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Dados Básicos da NFSe</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Local de Emissão
            </label>
            <input
              type="text"
              value={formData.xLocEmi}
              onChange={(e) => handleRootChange('xLocEmi', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Local de Prestação
            </label>
            <input
              type="text"
              value={formData.xLocPrestacao}
              onChange={(e) => handleRootChange('xLocPrestacao', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Natureza da Operação
            </label>
            <select
              value={formData.cNatOp}
              onChange={(e) => handleRootChange('cNatOp', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="1">Tributação no município</option>
              <option value="2">Tributação fora do município</option>
              <option value="3">Isenção</option>
              <option value="4">Imune</option>
              <option value="5">Exigibilidade suspensa</option>
              <option value="6">Exportação de serviços</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Competência (YYYY-MM)
            </label>
            <input
              type="month"
              value={formData.dCompet}
              onChange={(e) => handleRootChange('dCompet', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              required
            />
          </div>
        </div>
      </section>

      {/* Prestador */}
      <section className="bg-blue-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Dados do Prestador</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CNPJ
            </label>
            <input
              type="text"
              value={formData.prestador.cnpj}
              onChange={(e) => handleInputChange('prestador', 'cnpj', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Razão Social
            </label>
            <input
              type="text"
              value={formData.prestador.xNome}
              onChange={(e) => handleInputChange('prestador', 'xNome', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Telefone
            </label>
            <input
              type="text"
              value={formData.prestador.contato?.tel || ''}
              onChange={(e) => handleInputChange('prestador', 'contato', e.target.value, 'tel')}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={formData.prestador.contato?.email || ''}
              onChange={(e) => handleInputChange('prestador', 'contato', e.target.value, 'email')}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
        </div>
      </section>

      {/* Tomador */}
      <section className="bg-green-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Dados do Tomador</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CNPJ/CPF
            </label>
            <input
              type="text"
              value={formData.tomador.cnpjCpf}
              onChange={(e) => handleInputChange('tomador', 'cnpjCpf', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome/Razão Social
            </label>
            <input
              type="text"
              value={formData.tomador.xNome}
              onChange={(e) => handleInputChange('tomador', 'xNome', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              required
            />
          </div>
        </div>
      </section>

      {/* Serviço */}
      <section className="bg-yellow-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Dados do Serviço</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Código do Serviço
            </label>
            <input
              type="text"
              value={formData.servico.cServ}
              onChange={(e) => handleInputChange('servico', 'cServ', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              required
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição do Serviço
            </label>
            <textarea
              value={formData.servico.xServ}
              onChange={(e) => handleInputChange('servico', 'xServ', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              rows={3}
              required
            />
          </div>
        </div>
      </section>

      {/* Valores */}
      <section className="bg-purple-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Valores</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Valor do Serviço (R$)
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.valores.vServ}
              onChange={(e) => {
                handleInputChange('valores', 'vServ', parseFloat(e.target.value) || 0);
                setTimeout(calculateValues, 100);
              }}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alíquota ISS (%)
            </label>
            <input
              type="number"
              step="0.0001"
              value={formData.valores.pISS}
              onChange={(e) => {
                handleInputChange('valores', 'pISS', parseFloat(e.target.value) || 0);
                setTimeout(calculateValues, 100);
              }}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Valor ISS (R$)
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.valores.vISS}
              readOnly
              className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100"
            />
          </div>
        </div>
      </section>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Gerando...' : 'Gerar XML NFSe'}
        </button>
      </div>
    </form>
  );
}