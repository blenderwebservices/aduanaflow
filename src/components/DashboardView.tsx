import React from 'react';
import {
  TrendingUp,
  Package,
  ShieldCheck,
  FileText,
  ArrowRight,
  Truck,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { NavTab } from './Sidebar';
import { ShipmentRecord } from '../../server';

interface DashboardViewProps {
  shipments: ShipmentRecord[];
  onNavigateTab: (tab: NavTab) => void;
  isDark: boolean;
  onOpenShipmentDetail: (shipment: ShipmentRecord) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  shipments,
  onNavigateTab,
  isDark,
  onOpenShipmentDetail,
}) => {
  const totalValueUSD = shipments.reduce((sum, s) => sum + s.commercialValueUSD, 0);
  const totalCustomsMXN = shipments.reduce((sum, s) => sum + s.customsValueMXN, 0);
  const activeCount = shipments.filter(s => s.status !== 'DELIVERED').length;

  return (
    <div className="space-y-6">
      {/* Editorial Welcome Banner with Alexa's Vision */}
      <div className={`relative overflow-hidden rounded-2xl border ${isDark ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-white'
        } shadow-xs`}>
        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
          <div className="p-6 lg:p-8 lg:col-span-7 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                <span>Especialidad en Comercio Exterior & Logística PyME</span>
                <span aria-hidden="true">·</span>
                <span>Plataforma Alexa Sánchez</span>
              </div>
              <h2 className="mt-2 text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-slate-900 dark:text-white" style={{ textWrap: 'balance' }}>
                Domina Importaciones, Incoterms 2020 y Auditoría de Pedimentos
              </h2>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Herramienta creada para dotar a las pequeñas y medianas empresas mexicanas de certidumbre fiscal, cálculo exacto de contribuciones aduaneras (IGI, DTA, IVA) y control logístico desde el puerto de origen hasta la última milla.
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={() => onNavigateTab('calculator')}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors shadow-xs"
              >
                <span>Simular Costeo Landed Cost</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => onNavigateTab('pedimentos')}
                className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg border transition-colors ${isDark
                    ? 'border-slate-700 bg-slate-800/80 text-slate-200 hover:bg-slate-700'
                    : 'border-slate-300 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
              >
                <span>Auditar Pedimento SAT</span>
                <FileText className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => onNavigateTab('mobile-api')}
                className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg border transition-colors ${isDark
                    ? 'border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
                    : 'border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100'
                  }`}
              >
                <span>API Móvil iOS/Android</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="relative min-h-[220px] lg:col-span-5 overflow-hidden">
            <img
              src="/src/assets/images/hero_customs_logistics_1793831213651.jpg"
              alt="Terminal portuaria de comercio internacional"
              className="h-full w-full object-cover lg:absolute lg:inset-0"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-slate-950/70 via-slate-950/20 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 p-3 rounded-lg bg-slate-950/80 backdrop-blur-xs border border-white/10 text-white">
              <div className="text-[11px] font-semibold text-amber-400">Terminal Manzanillo & Nuevo Laredo</div>
              <div className="text-xs text-slate-300">Despacho aduanero y enlace directo con transporte terrestre nacional</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filament KPI Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1 */}
        <div className={`p-5 rounded-xl border ${isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-white'
          } shadow-xs`}>
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Embarques en Tránsito</span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
              <Package className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
            {activeCount} <span className="text-xs font-normal text-slate-400">activos</span>
          </div>
          <div className="mt-1 text-xs text-slate-500 flex items-center gap-1.5">
            <span className="text-emerald-500 font-medium">100% en tiempo</span>
            <span>· Vía marítima y aérea</span>
          </div>
        </div>

        {/* Stat 2 */}
        <div className={`p-5 rounded-xl border ${isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-white'
          } shadow-xs`}>
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Valor Comercial Total</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
            ${totalValueUSD.toLocaleString()} <span className="text-xs font-normal text-slate-400">USD</span>
          </div>
          <div className="mt-1 text-xs text-slate-500 flex items-center gap-1.5">
            <span>Base gravable protegida en aduana</span>
          </div>
        </div>

        {/* Stat 3 */}
        <div className={`p-5 rounded-xl border ${isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-white'
          } shadow-xs`}>
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Valor en Aduana Declarado</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
            ${totalCustomsMXN.toLocaleString()} <span className="text-xs font-normal text-slate-400">MXN</span>
          </div>
          <div className="mt-1 text-xs text-slate-500 flex items-center gap-1.5">
            <span className="text-emerald-500 font-medium">+ Incrementables</span>
            <span>conforme Art. 65 LA</span>
          </div>
        </div>

        {/* Stat 4 */}
        <div className={`p-5 rounded-xl border ${isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-white'
          } shadow-xs`}>
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Cumplimiento Normativo SAT</span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
            98.5% <span className="text-xs font-normal text-slate-400">auditoría limpia</span>
          </div>
          <div className="mt-1 text-xs text-slate-500 flex items-center gap-1.5">
            <span>Validación Anexo 22 RGCE</span>
          </div>
        </div>
      </div>

      {/* 3 Interactive Pillars for Alexa's Expertise */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Pillar 1 */}
        <div
          onClick={() => onNavigateTab('calculator')}
          className={`group cursor-pointer p-5 rounded-xl border transition-all ${isDark
              ? 'border-slate-800 bg-slate-900/40 hover:border-amber-500/40 hover:bg-slate-900/80'
              : 'border-slate-200 bg-white hover:border-amber-400 hover:shadow-sm'
            }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">Pilar 01</span>
            <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </div>
          <h3 className="mt-2 text-base font-bold text-slate-900 dark:text-white">
            1. Costeo de Importaciones
          </h3>
          <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Automatiza el cálculo del Landed Cost: IGI específico por fracción arancelaria, DTA al 8 al millar, IVA 16%, honorarios del agente y flete terrestre.
          </p>
          <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-amber-600 dark:text-amber-400">
            <span>Abrir Simulador Financiero</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </div>
        </div>

        {/* Pillar 2 */}
        <div
          onClick={() => onNavigateTab('incoterms')}
          className={`group cursor-pointer p-5 rounded-xl border transition-all ${isDark
              ? 'border-slate-800 bg-slate-900/40 hover:border-amber-500/40 hover:bg-slate-900/80'
              : 'border-slate-200 bg-white hover:border-amber-400 hover:shadow-sm'
            }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">Pilar 02</span>
            <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </div>
          <h3 className="mt-2 text-base font-bold text-slate-900 dark:text-white">
            2. Matriz Incoterms 2020
          </h3>
          <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Compara los 11 términos internacionales de comercio de la ICC. Evita trampas frecuentes como comprar en EXW o DDP sin infraestructura legal.
          </p>
          <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-amber-600 dark:text-amber-400">
            <span>Ver Matriz de Responsabilidades</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </div>
        </div>

        {/* Pillar 3 */}
        <div
          onClick={() => onNavigateTab('pedimentos')}
          className={`group cursor-pointer p-5 rounded-xl border transition-all ${isDark
              ? 'border-slate-800 bg-slate-900/40 hover:border-amber-500/40 hover:bg-slate-900/80'
              : 'border-slate-200 bg-white hover:border-amber-400 hover:shadow-sm'
            }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">Pilar 03</span>
            <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </div>
          <h3 className="mt-2 text-base font-bold text-slate-900 dark:text-white">
            3. Auditor de Pedimentos
          </h3>
          <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Valida la estructura de 15 dígitos del pedimento, detecta discrepancias en incrementables vs Incoterm y audita el pago correcto de derechos aduanales.
          </p>
          <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-amber-600 dark:text-amber-400">
            <span>Iniciar Auditoría de Pedimento</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </div>
        </div>
      </div>

      {/* Active Shipments Table (Filament-style resource table) */}
      <div className={`rounded-xl border ${isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-white'
        } shadow-xs overflow-hidden`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Embarques Activos & Despacho Aduanal
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Operaciones registradas con seguimiento en tiempo real y enlace de última milla.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('shipments')}
            className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline inline-flex items-center gap-1"
          >
            <span>Ver todos los embarques</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className={`border-b text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
              <tr>
                <th className="py-3 px-4">Guía / Pedimento</th>
                <th className="py-3 px-4">Cliente PyME</th>
                <th className="py-3 px-4">Ruta (Origen → Destino)</th>
                <th className="py-3 px-4">Incoterm</th>
                <th className="py-3 px-4">Estado Aduanal</th>
                <th className="py-3 px-4 text-right">Valor Comercial</th>
                <th className="py-3 px-4 text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80">
              {shipments.map((shipment) => {
                const statusStyles: Record<string, { label: string; bg: string; text: string }> = {
                  ORIGIN: { label: 'En Origen', bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-700 dark:text-slate-300' },
                  TRANSIT: { label: 'En Tránsito Internacional', bg: 'bg-blue-100 dark:bg-blue-950/60', text: 'text-blue-700 dark:text-blue-300' },
                  CUSTOMS_CLEARANCE: { label: 'En Despacho Aduanal', bg: 'bg-amber-100 dark:bg-amber-950/60', text: 'text-amber-800 dark:text-amber-300' },
                  GREEN_LIGHT: { label: 'Semáforo Verde SAT', bg: 'bg-emerald-100 dark:bg-emerald-950/60', text: 'text-emerald-800 dark:text-emerald-300' },
                  LAST_MILE: { label: 'En Ruta Última Milla', bg: 'bg-purple-100 dark:bg-purple-950/60', text: 'text-purple-800 dark:text-purple-300' },
                  DELIVERED: { label: 'Entregado a PyME', bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-600 dark:text-slate-400' },
                };
                const badge = statusStyles[shipment.status] || statusStyles.TRANSIT;

                return (
                  <tr
                    key={shipment.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {shipment.trackingNumber}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Pedimento: {shipment.pedimentoNumber}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-900 dark:text-white">
                        {shipment.clientName}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        RFC: {shipment.clientRfc}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-slate-800 dark:text-slate-200">
                        {shipment.originCity}, {shipment.originCountry}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        → {shipment.destinationCity} ({shipment.customsPort})
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-semibold px-2 py-0.5 rounded text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                        {shipment.incoterm}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium ${badge.bg} ${badge.text}`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono tabular-nums font-semibold text-slate-900 dark:text-white">
                      ${shipment.commercialValueUSD.toLocaleString()} USD
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => onOpenShipmentDetail(shipment)}
                        className="px-2.5 py-1 text-xs font-medium rounded-md text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 border border-amber-300 dark:border-amber-800/80 transition-colors"
                      >
                        Detalle
                      </button>
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
