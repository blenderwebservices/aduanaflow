import React, { useState } from 'react';
import {
  Smartphone,
  Code2,
  Send,
  CheckCircle2,
  Copy,
  Terminal,
  ExternalLink,
  ShieldCheck,
  Truck,
  QrCode,
  Calculator,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { ShipmentRecord } from '../../server';

interface MobileApiPortalProps {
  isDark: boolean;
  shipments: ShipmentRecord[];
}

export const MobileApiPortal: React.FC<MobileApiPortalProps> = ({ isDark, shipments }) => {
  const [activeTab, setActiveTab] = useState<'simulator' | 'api-docs'>('simulator');
  const [mobileOs, setMobileOs] = useState<'ios' | 'android'>('ios');
  const [mobileAppScreen, setMobileAppScreen] = useState<'tracker' | 'quick-calc' | 'qr-scanner'>('tracker');

  // API Tester state
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('/api/v1/shipments');
  const [apiMethod, setApiMethod] = useState<'GET' | 'POST'>('GET');
  const [requestBody, setRequestBody] = useState<string>('{\n  "status": "ALL"\n}');
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [apiLatency, setApiLatency] = useState<number | null>(null);
  const [apiStatusCode, setApiStatusCode] = useState<number | null>(null);
  const [apiLoading, setApiLoading] = useState<boolean>(false);
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  // Mobile simulator mini calculator state
  const [miniValueUSD, setMiniValueUSD] = useState<number>(5000);
  const [miniFreightUSD, setMiniFreightUSD] = useState<number>(850);
  const [miniIncoterm, setMiniIncoterm] = useState<string>('FOB');

  const miniEstMXN = Math.round((miniValueUSD + (miniIncoterm === 'FOB' ? miniFreightUSD : 0)) * 19.85 * 1.22);

  const handleRunApiRequest = async () => {
    setApiLoading(true);
    const start = performance.now();
    try {
      let options: RequestInit = {
        method: apiMethod,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer af_live_demo_key_pyme_2024',
        },
      };

      if (apiMethod === 'POST') {
        options.body = requestBody;
      }

      const res = await fetch(selectedEndpoint, options);
      const data = await res.json();
      const end = performance.now();

      setApiStatusCode(res.status);
      setApiLatency(Math.round(end - start));
      setApiResponse(data);
    } catch (err: unknown) {
      setApiStatusCode(500);
      setApiResponse({ error: err instanceof Error ? err.message : 'Error al conectar con la API' });
    } finally {
      setApiLoading(false);
    }
  };

  const handleSelectEndpoint = (endpoint: string, method: 'GET' | 'POST', defaultBody?: string) => {
    setSelectedEndpoint(endpoint);
    setApiMethod(method);
    if (defaultBody) setRequestBody(defaultBody);
    setApiResponse(null);
    setApiStatusCode(null);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(label);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`p-6 rounded-2xl border ${
        isDark ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-white'
      } shadow-xs`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              <Smartphone className="h-4 w-4" />
              <span>Ecosistema Móvil iOS & Android · Arquitectura API-First</span>
            </div>
            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              Centro de Desarrollo Móvil & Simulador para PyMEs
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              La plataforma actúa como backend robusto para apps de captación de pequeñas empresas, conductores de última milla y auditores en aduana.
            </p>
          </div>

          {/* Switcher Tab */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setActiveTab('simulator')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'simulator'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Simulador App Móvil
            </button>
            <button
              onClick={() => setActiveTab('api-docs')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'api-docs'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Consola & Docs API REST
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'simulator' ? (
        /* Mobile Simulator Tab */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Interactive Phone Mockup (5 cols) */}
          <div className="lg:col-span-5 flex flex-col items-center">
            {/* OS Controls */}
            <div className="flex items-center gap-2 mb-3">
              <button
                onClick={() => setMobileOs('ios')}
                className={`px-3 py-1 text-xs font-medium rounded-full border transition-all ${
                  mobileOs === 'ios'
                    ? 'border-amber-500 bg-amber-500 text-slate-950 font-bold'
                    : 'border-slate-300 dark:border-slate-700 text-slate-500'
                }`}
              >
                Apple iOS (iPhone 16)
              </button>
              <button
                onClick={() => setMobileOs('android')}
                className={`px-3 py-1 text-xs font-medium rounded-full border transition-all ${
                  mobileOs === 'android'
                    ? 'border-amber-500 bg-amber-500 text-slate-950 font-bold'
                    : 'border-slate-300 dark:border-slate-700 text-slate-500'
                }`}
              >
                Android (Google Pixel)
              </button>
            </div>

            {/* Smartphone Chassis */}
            <div className={`relative w-[340px] h-[670px] rounded-[48px] p-3 shadow-2xl border-4 ${
              mobileOs === 'ios'
                ? 'border-slate-800 bg-slate-900'
                : 'border-slate-700 bg-slate-800'
            }`}>
              {/* Dynamic Island / Camera punch */}
              <div className="absolute top-5 left-1/2 -translate-x-1/2 z-20">
                {mobileOs === 'ios' ? (
                  <div className="h-6 w-24 bg-black rounded-full flex items-center justify-center">
                    <div className="h-2 w-2 rounded-full bg-slate-800 ml-auto mr-3" />
                  </div>
                ) : (
                  <div className="h-3.5 w-3.5 bg-black rounded-full" />
                )}
              </div>

              {/* Screen Content Container */}
              <div className="w-full h-full rounded-[38px] bg-slate-950 text-white overflow-hidden flex flex-col relative pt-8">
                {/* Mobile Top Bar */}
                <div className="px-5 pt-3 pb-2 flex items-center justify-between border-b border-slate-800/80">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-amber-400" />
                    <span className="text-xs font-bold tracking-tight">AduanaFlow Go</span>
                  </div>
                  <div className="text-[10px] text-emerald-400 font-mono bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800">
                    API 200 OK
                  </div>
                </div>

                {/* Mobile Screen Views */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {mobileAppScreen === 'tracker' && (
                    <div className="space-y-3">
                      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        Tus Envíos Activos (PyME)
                      </div>

                      {shipments.slice(0, 2).map((s) => (
                        <div
                          key={s.id}
                          className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-mono text-amber-400 font-semibold">{s.trackingNumber}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                              Semáforo Verde
                            </span>
                          </div>
                          <div className="text-xs font-bold text-white truncate">{s.cargoDescription}</div>
                          <div className="text-[11px] text-slate-400">
                            {s.originCity} → {s.destinationCity}
                          </div>
                          {/* Mini Progress */}
                          <div className="pt-1">
                            <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                              <span>En Aduana</span>
                              <span className="text-amber-400">Última Milla 85%</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                              <div className="h-full bg-amber-500 rounded-full w-[85%]" />
                            </div>
                          </div>
                        </div>
                      ))}

                      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
                        🔔 Notificación: Tu chofer de Paquetexpress está a 15 km de tu bodega.
                      </div>
                    </div>
                  )}

                  {mobileAppScreen === 'quick-calc' && (
                    <div className="space-y-3">
                      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        Cotizador Exprés en Ruta
                      </div>
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
                        <div>
                          <label className="text-[10px] text-slate-400 block">Factura Comercial (USD)</label>
                          <input
                            type="number"
                            value={miniValueUSD}
                            onChange={(e) => setMiniValueUSD(Number(e.target.value) || 0)}
                            className="w-full px-2 py-1 rounded bg-slate-800 border border-slate-700 text-xs font-mono text-white outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 block">Flete Estimado (USD)</label>
                          <input
                            type="number"
                            value={miniFreightUSD}
                            onChange={(e) => setMiniFreightUSD(Number(e.target.value) || 0)}
                            className="w-full px-2 py-1 rounded bg-slate-800 border border-slate-700 text-xs font-mono text-white outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 block">Incoterm</label>
                          <select
                            value={miniIncoterm}
                            onChange={(e) => setMiniIncoterm(e.target.value)}
                            className="w-full px-2 py-1 rounded bg-slate-800 border border-slate-700 text-xs font-mono text-amber-400 outline-none"
                          >
                            <option value="FOB">FOB</option>
                            <option value="EXW">EXW</option>
                            <option value="CIF">CIF</option>
                          </select>
                        </div>

                        <div className="pt-2 border-t border-slate-800">
                          <span className="text-[10px] text-slate-400">Landed Cost Estimado Puesto en MX:</span>
                          <div className="text-lg font-bold font-mono text-emerald-400">
                            ${miniEstMXN.toLocaleString()} MXN
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {mobileAppScreen === 'qr-scanner' && (
                    <div className="space-y-3 text-center">
                      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        Escáner de Pedimento / QR SAT
                      </div>
                      <div className="p-6 rounded-2xl bg-slate-900 border-2 border-dashed border-amber-500/50 flex flex-col items-center">
                        <QrCode className="h-16 w-16 text-amber-400 animate-pulse" />
                        <span className="text-xs font-semibold mt-3 text-white">
                          Apunta al código QR del Pedimento
                        </span>
                        <p className="text-[10px] text-slate-400 mt-1">
                          Valida al instante los 15 dígitos con el web service del SAT
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/80 text-left text-xs text-emerald-300">
                        ✓ Pedimento 24 16 3840 4 001928 auditado con éxito. Sin irregularidades detectadas.
                      </div>
                    </div>
                  )}
                </div>

                {/* Mobile Bottom Navigation Bar */}
                <div className="p-2 border-t border-slate-800 bg-slate-900/90 grid grid-cols-3 gap-1 text-center">
                  <button
                    onClick={() => setMobileAppScreen('tracker')}
                    className={`py-1.5 rounded-lg text-[10px] font-medium flex flex-col items-center ${
                      mobileAppScreen === 'tracker' ? 'text-amber-400 bg-amber-500/10' : 'text-slate-400'
                    }`}
                  >
                    <Truck className="h-4 w-4" />
                    <span>Envíos</span>
                  </button>
                  <button
                    onClick={() => setMobileAppScreen('quick-calc')}
                    className={`py-1.5 rounded-lg text-[10px] font-medium flex flex-col items-center ${
                      mobileAppScreen === 'quick-calc' ? 'text-amber-400 bg-amber-500/10' : 'text-slate-400'
                    }`}
                  >
                    <Calculator className="h-4 w-4" />
                    <span>Cotizar</span>
                  </button>
                  <button
                    onClick={() => setMobileAppScreen('qr-scanner')}
                    className={`py-1.5 rounded-lg text-[10px] font-medium flex flex-col items-center ${
                      mobileAppScreen === 'qr-scanner' ? 'text-amber-400 bg-amber-500/10' : 'text-slate-400'
                    }`}
                  >
                    <QrCode className="h-4 w-4" />
                    <span>Escanear</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Architecture & Capabilities for Mobile Growth (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            <div className={`p-6 rounded-2xl border ${
              isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-white'
            } shadow-xs space-y-4`}>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Estrategia de Captación para PyMEs & Micropymes
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Alexa diseñó esta arquitectura para que cualquier negocio que importe desde China, EE.UU. o Europa pueda descargar la app en su teléfono móvil y:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className={`p-3 rounded-xl border ${
                  isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="font-bold text-amber-600 dark:text-amber-400">1. Onboarding Rápido</div>
                  <p className="mt-1 text-slate-500 text-[11px]">
                    Registro con RFC y padrón de importadores en menos de 2 minutos vía API segura.
                  </p>
                </div>
                <div className={`p-3 rounded-xl border ${
                  isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="font-bold text-blue-600 dark:text-blue-400">2. Alertas de Semáforo Fiscal</div>
                  <p className="mt-1 text-slate-500 text-[11px]">
                    Notificación push instantánea cuando la aduana otorga desaduanamiento libre (verde) o reconocimiento (rojo).
                  </p>
                </div>
                <div className={`p-3 rounded-xl border ${
                  isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="font-bold text-emerald-600 dark:text-emerald-400">3. Control de Última Milla</div>
                  <p className="mt-1 text-slate-500 text-[11px]">
                    Asignación automática de unidades locales para llevar la carga desde la aduana hasta la puerta del negocio.
                  </p>
                </div>
                <div className={`p-3 rounded-xl border ${
                  isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="font-bold text-purple-600 dark:text-purple-400">4. Auditoría Anti-Multas</div>
                  <p className="mt-1 text-slate-500 text-[11px]">
                    Prevención de sanciones del SAT por omisión de fletes incrementables en pedimentos EXW y FOB.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick API Snippet for Mobile Developers */}
            <div className={`p-6 rounded-2xl border ${
              isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-white'
            } shadow-xs`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                  <Code2 className="h-4 w-4 text-amber-500" />
                  <span>Código de Integración para iOS (Swift) & Android (Kotlin)</span>
                </div>
                <button
                  onClick={() => setActiveTab('api-docs')}
                  className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline"
                >
                  Abrir Consola Interactiva →
                </button>
              </div>

              <div className="rounded-xl bg-slate-950 text-slate-200 p-4 font-mono text-[11px] overflow-x-auto border border-slate-800">
                <div className="text-slate-500">// Llamada REST a la API de AduanaFlow desde la App Móvil</div>
                <div className="text-amber-400">POST https://api.aduanaflow.mx/api/v1/calculator/landed-cost</div>
                <div className="text-slate-400 mt-1">Authorization: Bearer YOUR_MOBILE_APP_KEY</div>
                <div className="text-emerald-400 mt-1">
                  {"{\n  \"commercialValueUSD\": 25000,\n  \"exchangeRate\": 19.85,\n  \"incoterm\": \"FOB\",\n  \"freightUSD\": 1850,\n  \"unitsCount\": 100\n}"}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* API Documentation & Interactive Console Tab */
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Endpoints Sidebar (4 cols) */}
            <div className={`lg:col-span-4 p-4 rounded-2xl border space-y-2 ${
              isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-white'
            } shadow-xs`}>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 px-2 mb-2">
                Endpoints Disponibles (/api/v1)
              </div>

              <button
                onClick={() => handleSelectEndpoint('/api/v1/shipments', 'GET')}
                className={`w-full text-left p-2.5 rounded-lg text-xs font-mono transition-colors flex items-center justify-between ${
                  selectedEndpoint === '/api/v1/shipments'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span>GET /shipments</span>
                <span className="text-[10px] text-slate-400">Listar Envíos</span>
              </button>

              <button
                onClick={() =>
                  handleSelectEndpoint(
                    '/api/v1/calculator/landed-cost',
                    'POST',
                    JSON.stringify(
                      {
                        commercialValueUSD: 25000,
                        exchangeRate: 19.85,
                        incoterm: 'FOB',
                        freightUSD: 1850,
                        insuranceUSD: 320,
                        unitsCount: 100,
                      },
                      null,
                      2
                    )
                  )
                }
                className={`w-full text-left p-2.5 rounded-lg text-xs font-mono transition-colors flex items-center justify-between ${
                  selectedEndpoint === '/api/v1/calculator/landed-cost'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span>POST /calculator/landed-cost</span>
                <span className="text-[10px] text-slate-400">Costeo</span>
              </button>

              <button
                onClick={() =>
                  handleSelectEndpoint(
                    '/api/v1/pedimentos/validate',
                    'POST',
                    JSON.stringify(
                      {
                        numeroPedimento: '24 16 3840 4 001928',
                        clavePedimento: 'A1',
                        rfcImportador: 'DTE210419KM8',
                        incoterm: 'FOB',
                        valorDolares: 34500,
                        valorAduanaMXN: 730480,
                        fletesUSD: 1950,
                        fraccionArancelaria: '84713001',
                        nico: '00',
                      },
                      null,
                      2
                    )
                  )
                }
                className={`w-full text-left p-2.5 rounded-lg text-xs font-mono transition-colors flex items-center justify-between ${
                  selectedEndpoint === '/api/v1/pedimentos/validate'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span>POST /pedimentos/validate</span>
                <span className="text-[10px] text-slate-400">Auditor SAT</span>
              </button>

              <button
                onClick={() => handleSelectEndpoint('/api/v1/incoterms', 'GET')}
                className={`w-full text-left p-2.5 rounded-lg text-xs font-mono transition-colors flex items-center justify-between ${
                  selectedEndpoint === '/api/v1/incoterms'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span>GET /incoterms</span>
                <span className="text-[10px] text-slate-400">Matriz ICC</span>
              </button>

              <button
                onClick={() =>
                  handleSelectEndpoint(
                    '/api/v1/last-mile/quote',
                    'POST',
                    JSON.stringify(
                      {
                        originPort: '160 - Manzanillo',
                        destinationCity: 'Guadalajara, Jalisco',
                        weightKg: 850,
                        packagesCount: 40,
                        deliverySpeed: 'STANDARD',
                      },
                      null,
                      2
                    )
                  )
                }
                className={`w-full text-left p-2.5 rounded-lg text-xs font-mono transition-colors flex items-center justify-between ${
                  selectedEndpoint === '/api/v1/last-mile/quote'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span>POST /last-mile/quote</span>
                <span className="text-[10px] text-slate-400">Última Milla</span>
              </button>
            </div>

            {/* Request Console & Response (8 cols) */}
            <div className={`lg:col-span-8 p-6 rounded-2xl border space-y-4 ${
              isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-white'
            } shadow-xs`}>
              {/* URL Bar */}
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold font-mono text-xs">
                  {apiMethod}
                </span>
                <input
                  type="text"
                  readOnly
                  value={selectedEndpoint}
                  className={`flex-1 px-3 py-1.5 text-xs font-mono rounded-lg border outline-none ${
                    isDark ? 'border-slate-700 bg-slate-800 text-white' : 'border-slate-300 bg-slate-50'
                  }`}
                />
                <button
                  onClick={handleRunApiRequest}
                  disabled={apiLoading}
                  className="px-4 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors flex items-center gap-1.5"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>{apiLoading ? 'Llamando...' : 'Probar'}</span>
                </button>
              </div>

              {/* Request Payload Editor if POST */}
              {apiMethod === 'POST' && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">
                    Cuerpo del Request (JSON Body)
                  </label>
                  <textarea
                    rows={6}
                    value={requestBody}
                    onChange={(e) => setRequestBody(e.target.value)}
                    className="w-full p-3 text-xs font-mono rounded-xl bg-slate-950 text-amber-300 border border-slate-800 outline-none"
                  />
                </div>
              )}

              {/* Response Panel */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      Respuesta del Servidor (Live API Response):
                    </span>
                    {apiStatusCode && (
                      <span className={`px-2 py-0.5 rounded font-mono font-bold text-[11px] ${
                        apiStatusCode < 400
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-950/80 dark:text-red-300'
                      }`}>
                        Status: {apiStatusCode} OK · {apiLatency}ms
                      </span>
                    )}
                  </div>

                  {apiResponse && (
                    <button
                      onClick={() => copyToClipboard(JSON.stringify(apiResponse, null, 2), 'response')}
                      className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 hover:underline inline-flex items-center gap-1"
                    >
                      <Copy className="h-3 w-3" />
                      <span>{copiedSnippet === 'response' ? 'Copiado!' : 'Copiar JSON'}</span>
                    </button>
                  )}
                </div>

                <div className="rounded-xl bg-slate-950 text-slate-200 p-4 font-mono text-xs max-h-72 overflow-y-auto border border-slate-800">
                  {apiResponse ? (
                    <pre className="text-emerald-400 whitespace-pre-wrap">
                      {JSON.stringify(apiResponse, null, 2)}
                    </pre>
                  ) : (
                    <div className="text-slate-500 text-center py-8">
                      Haz clic en "Probar" para enviar la petición a {selectedEndpoint} y ver la respuesta en vivo.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
