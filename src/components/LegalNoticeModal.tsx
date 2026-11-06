import React, { useState } from 'react';
import { ShieldCheck, X, Scale, FileText, Lock, AlertTriangle } from 'lucide-react';

interface LegalNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
}

export const LegalNoticeModal: React.FC<LegalNoticeModalProps> = ({
  isOpen,
  onClose,
  isDark,
}) => {
  const [activeTab, setActiveTab] = useState<'DISCLAIMER' | 'PRIVACY' | 'TERMS'>('DISCLAIMER');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div
        className={`relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden ${
          isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Modal Header */}
        <div className={`p-5 flex items-center justify-between border-b ${
          isDark ? 'border-slate-800 bg-slate-950/60' : 'border-slate-100 bg-slate-50'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-slate-950 font-bold">
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Marco Legal, Privacidad y Términos de Uso
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                AduanaFlow · Plataforma de Cumplimiento en Comercio Exterior
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Cerrar ventana"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className={`flex border-b px-5 gap-2 text-xs font-semibold ${
          isDark ? 'border-slate-800 bg-slate-950/30' : 'border-slate-100 bg-slate-50/50'
        }`}>
          {[
            { id: 'DISCLAIMER', label: 'Deslinde SAT / ANAM', icon: AlertTriangle },
            { id: 'PRIVACY', label: 'Aviso de Privacidad', icon: Lock },
            { id: 'TERMS', label: 'Términos y Condiciones', icon: FileText },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
                  isActive
                    ? 'border-amber-500 text-amber-600 dark:text-amber-400 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
          {activeTab === 'DISCLAIMER' && (
            <div className="space-y-3">
              <div className={`p-4 rounded-xl border ${
                isDark ? 'border-amber-500/30 bg-amber-950/20 text-amber-200' : 'border-amber-300 bg-amber-50 text-amber-900'
              }`}>
                <div className="font-bold text-sm text-amber-700 dark:text-amber-400 mb-1">
                  Aviso Preventivo e Independencia Institucional
                </div>
                <p>
                  AduanaFlow es un desarrollo tecnológico independiente con propósitos exclusivamente educativos, analíticos, de planeación financiera y auditoría preventiva interna para empresas y profesionistas del comercio exterior.
                </p>
              </div>

              <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                1. No constituye Aprobación Oficial
              </h4>
              <p>
                Los cálculos del Simulador de Landed Cost, las alertas del Auditor de Pedimentos y las determinaciones arancelarias arrojadas por la plataforma <strong>no sustituyen, no representan ni constituyen una resolución o aprobación oficial</strong> del Servicio de Administración Tributaria (SAT), de la Agencia Nacional de Aduanas de México (ANAM) ni de la Secretaría de Economía.
              </p>

              <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                2. Intervención Obligatoria del Agente Aduanal
              </h4>
              <p>
                De conformidad con los Artículos 35, 40 y 159 de la Ley Aduanera vigente en México, el despacho formal de las mercancías, la validación y pago del pedimento oficial en el Sistema Automatizado Aduanero Integral (SAAI/M3) debe ser promovido a través de un Agente Aduanal o Agencia Aduanal legalmente autorizado por el SAT.
              </p>
            </div>
          )}

          {activeTab === 'PRIVACY' && (
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                Aviso de Privacidad Simplificado (LFPDPPP)
              </h4>
              <p>
                En cumplimiento con la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP), AduanaFlow garantiza que la información capturada en los simuladores, tales como RFC, valores de facturas y descripciones de mercancías:
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Se procesa de manera estrictamente local en el navegador del usuario y mediante peticiones seguras de sesión.</li>
                <li>No se comparte, comercializa ni transmite a terceros sin consentimiento expreso.</li>
                <li>Las simulaciones guardadas en historial residen en el almacenamiento local (localStorage) del dispositivo del usuario.</li>
              </ul>
            </div>
          )}

          {activeTab === 'TERMS' && (
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                Términos y Condiciones de Uso
              </h4>
              <p>
                Al utilizar AduanaFlow, el usuario reconoce y acepta:
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Que las tasas de impuestos (IGI, DTA, IVA) y tipos de cambio FIX del DOF son referenciales y deben contrastarse con las publicaciones vigentes del Diario Oficial de la Federación el día de la operación.</li>
                <li>Que las cotizaciones logísticas de última milla son estimaciones aproximadas no vinculantes.</li>
                <li>Que la responsabilidad por la veracidad de los datos declarados en un pedimento aduanal recae exclusivamente en el importador y su Agente Aduanal colegiado.</li>
              </ul>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className={`p-4 flex items-center justify-end border-t ${
          isDark ? 'border-slate-800 bg-slate-950/60' : 'border-slate-100 bg-slate-50'
        }`}>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors shadow-xs"
          >
            Entendido y Aceptar
          </button>
        </div>
      </div>
    </div>
  );
};

