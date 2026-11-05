import React, { useState } from 'react';
import {
  Globe2,
  Check,
  X,
  AlertCircle,
  ShieldCheck,
  HelpCircle,
  Truck,
  Ship,
  Plane,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { INCOTERMS_2020, IncotermInfo } from '../utils/incotermsData';
import alexaAvatar from '../assets/images/alexa_founder_avatar_1793831212997.jpg';

interface IncotermsMatrixProps {
  isDark: boolean;
}

export const IncotermsMatrix: React.FC<IncotermsMatrixProps> = ({ isDark }) => {
  const [selectedCode, setSelectedCode] = useState<string>('FOB');
  const [compareCode, setCompareCode] = useState<string>('EXW');
  const [filterCategory, setFilterCategory] = useState<'ALL' | 'MULTIMODAL' | 'MARITIMO'>('ALL');

  const selectedIncoterm = INCOTERMS_2020.find(i => i.code === selectedCode) || INCOTERMS_2020[0];
  const compareIncoterm = INCOTERMS_2020.find(i => i.code === compareCode) || INCOTERMS_2020[1];

  const filteredIncoterms = INCOTERMS_2020.filter(item => {
    if (filterCategory === 'ALL') return true;
    return item.category === filterCategory;
  });

  const stagesList = [
    { key: 'packaging' as const, label: 'Embalaje & Verificación' },
    { key: 'originLoading' as const, label: 'Carga en Transporte Origen' },
    { key: 'originInland' as const, label: 'Flete Local en País de Origen' },
    { key: 'exportClearance' as const, label: 'Despacho Aduanal de Exportación' },
    { key: 'originTerminalHandling' as const, label: 'Maniobras Terminal Origen (THC)' },
    { key: 'mainFreight' as const, label: 'Transporte Internacional Principal' },
    { key: 'cargoInsurance' as const, label: 'Seguro de Transporte de Mercancía' },
    { key: 'destinationTerminalHandling' as const, label: 'Maniobras Terminal Puerto Destino' },
    { key: 'importClearance' as const, label: 'Despacho Aduanal Importación (SAT)' },
    { key: 'finalDelivery' as const, label: 'Entrega Última Milla en Puerta PyME' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`p-6 rounded-2xl border ${isDark ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-white'
        } shadow-xs`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              <Globe2 className="h-4 w-4" />
              <span>Cámara de Comercio Internacional (ICC) · Versión 2020</span>
            </div>
            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              Matriz Interactiva de Incoterms 2020 para PyMEs
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Visualiza con exactitud el punto de transferencia de riesgo y costos entre comprador y vendedor para evitar sobrecostos y controversias aduanales.
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setFilterCategory('ALL')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${filterCategory === 'ALL'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
            >
              Todos (11)
            </button>
            <button
              onClick={() => setFilterCategory('MULTIMODAL')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${filterCategory === 'MULTIMODAL'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
            >
              Multimodal (7)
            </button>
            <button
              onClick={() => setFilterCategory('MARITIMO')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${filterCategory === 'MARITIMO'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
            >
              Marítimo (4)
            </button>
          </div>
        </div>

        {/* Quick Incoterm Selector Chips */}
        <div className="mt-4 flex flex-wrap gap-2">
          {filteredIncoterms.map((inco) => {
            const isSelected = selectedCode === inco.code;
            return (
              <button
                key={inco.code}
                onClick={() => setSelectedCode(inco.code)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all border ${isSelected
                    ? 'border-amber-500 bg-amber-500 text-slate-950 shadow-xs'
                    : isDark
                      ? 'border-slate-800 bg-slate-800/80 text-slate-300 hover:bg-slate-800'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
              >
                {inco.code}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Incoterm Detail Card */}
      <div className={`p-6 rounded-2xl border ${isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-white'
        } shadow-xs`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b pb-5 border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-extrabold font-mono text-amber-600 dark:text-amber-400">
                {selectedIncoterm.code}
              </span>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {selectedIncoterm.name} ({selectedIncoterm.nameEs})
                </h3>
                <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <span>Modalidad: {selectedIncoterm.category === 'MULTIMODAL' ? 'Cualquier modo de transporte' : 'Marítimo y vías navegables'}</span>
                  <span>·</span>
                  <span>Transportes: {selectedIncoterm.transportTypes.join(', ')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recommendation Tag */}
          <div>
            {selectedIncoterm.pymeRecommendation === 'HIGH' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                <ShieldCheck className="h-4 w-4" />
                <span>Recomendado para PyMEs</span>
              </span>
            )}
            {selectedIncoterm.pymeRecommendation === 'MEDIUM' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
                <HelpCircle className="h-4 w-4" />
                <span>Uso Moderado (Requiere Seguro)</span>
              </span>
            )}
            {selectedIncoterm.pymeRecommendation === 'CAUTION' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                <AlertCircle className="h-4 w-4" />
                <span>Precaución: No sugerido a novatos</span>
              </span>
            )}
          </div>
        </div>

        {/* Transfer Points */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
            <div className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Punto de Transferencia de Riesgo
            </div>
            <p className="mt-1.5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {selectedIncoterm.riskTransferPoint}
            </p>
          </div>

          <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
            <div className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Punto de Transferencia de Costos
            </div>
            <p className="mt-1.5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {selectedIncoterm.costTransferPoint}
            </p>
          </div>
        </div>

        {/* Alexa's Warning & Pitfall */}
        <div className={`mt-4 p-4 rounded-xl border ${isDark ? 'bg-amber-950/20 border-amber-500/30' : 'bg-amber-50/70 border-amber-200'
          }`}>
          <div className="flex items-start gap-3">
            <img
              src={alexaAvatar}
              alt="Alexa Sánchez"
              className="h-10 w-10 rounded-full object-cover shrink-0"
              referrerPolicy="no-referrer"
            />
            <div className="text-xs">
              <span className="font-bold text-slate-900 dark:text-white">
                Consejo Práctico de Alexa para PyMEs ({selectedIncoterm.code}):
              </span>
              <p className="mt-1 text-slate-700 dark:text-slate-300 leading-relaxed">
                {selectedIncoterm.pymeRecommendationText}
              </p>
              <div className="mt-2 text-red-600 dark:text-red-400 font-medium">
                <strong>Error más común:</strong> {selectedIncoterm.commonPitfall}
              </div>
            </div>
          </div>
        </div>

        {/* 10-Stage Responsibility Visual Breakdown */}
        <div className="mt-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3">
            Desglose de Obligaciones Etapa por Etapa ({selectedIncoterm.code})
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {stagesList.map((stage) => {
              const oblig = selectedIncoterm.obligations[stage.key];
              const isSeller = oblig === 'SELLER';
              return (
                <div
                  key={stage.key}
                  className={`flex items-center justify-between p-3 rounded-lg border ${isSeller
                      ? isDark ? 'border-blue-500/30 bg-blue-950/20 text-blue-300' : 'border-blue-200 bg-blue-50/60 text-blue-900'
                      : isDark ? 'border-amber-500/30 bg-amber-950/20 text-amber-300' : 'border-amber-200 bg-amber-50/60 text-amber-900'
                    }`}
                >
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {stage.label}
                  </span>
                  <span className="font-semibold text-xs font-mono uppercase">
                    {isSeller ? 'Vendedor Exportador' : 'PyME Compradora'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Side-by-Side Comparison Matrix */}
      <div className={`p-6 rounded-2xl border ${isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-white'
        } shadow-xs`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Comparativa Frente a Frente de Incoterms
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Elige dos términos para comparar responsabilidades directas.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={selectedCode}
              onChange={(e) => setSelectedCode(e.target.value)}
              className={`px-3 py-1.5 text-xs font-mono font-bold rounded-lg border outline-none ${isDark ? 'border-slate-700 bg-slate-800 text-amber-400' : 'border-slate-300 bg-slate-50 text-amber-900'
                }`}
            >
              {INCOTERMS_2020.map(i => (
                <option key={i.code} value={i.code}>Término A: {i.code}</option>
              ))}
            </select>

            <span className="text-xs font-bold text-slate-400">vs</span>

            <select
              value={compareCode}
              onChange={(e) => setCompareCode(e.target.value)}
              className={`px-3 py-1.5 text-xs font-mono font-bold rounded-lg border outline-none ${isDark ? 'border-slate-700 bg-slate-800 text-blue-400' : 'border-slate-300 bg-slate-50 text-blue-900'
                }`}
            >
              {INCOTERMS_2020.map(i => (
                <option key={i.code} value={i.code}>Término B: {i.code}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className={`border-b text-slate-500 font-semibold uppercase ${isDark ? 'bg-slate-900/80 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200'
              }`}>
              <tr>
                <th className="py-2.5 px-4">Etapa Logística</th>
                <th className="py-2.5 px-4 text-center text-amber-600 dark:text-amber-400">
                  {selectedIncoterm.code}
                </th>
                <th className="py-2.5 px-4 text-center text-blue-600 dark:text-blue-400">
                  {compareIncoterm.code}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {stagesList.map((stage) => {
                const s1 = selectedIncoterm.obligations[stage.key] === 'SELLER';
                const s2 = compareIncoterm.obligations[stage.key] === 'SELLER';
                return (
                  <tr key={stage.key} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 px-4 font-medium text-slate-800 dark:text-slate-200">
                      {stage.label}
                    </td>
                    <td className="py-2.5 px-4 text-center font-mono">
                      {s1 ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Vendedor</span>
                      ) : (
                        <span className="text-amber-600 dark:text-amber-400 font-semibold">Comprador</span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-center font-mono">
                      {s2 ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Vendedor</span>
                      ) : (
                        <span className="text-blue-600 dark:text-blue-400 font-semibold">Comprador</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
