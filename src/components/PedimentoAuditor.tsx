import React, { useState, useMemo } from 'react';
import {
  FileCheck2,
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Search,
  Scale,
  Building,
  HelpCircle,
  FileSpreadsheet,
  Upload,
  Download,
  FileText,
  ShieldAlert,
} from 'lucide-react';
import {
  auditPedimento,
  PedimentoData,
  SAMPLE_PEDIMENTOS,
  VALID_CLAVES_PEDIMENTO,
  ADUANAS_MEXICO,
  validatePedimentoNumber,
  parsePedimentoDocumentText,
} from '../utils/pedimentoValidator';

interface PedimentoAuditorProps {
  isDark: boolean;
}

export const PedimentoAuditor: React.FC<PedimentoAuditorProps> = ({ isDark }) => {
  // Current active pedimento data (defaults to sample 1)
  const [pedimento, setPedimento] = useState<PedimentoData>(SAMPLE_PEDIMENTOS[0].data);
  const [selectedPresetIndex, setSelectedPresetIndex] = useState<number>(0);
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);
  const [showFileModal, setShowFileModal] = useState<boolean>(false);
  const [pastedDocumentText, setPastedDocumentText] = useState<string>('');

  // Handle uploaded file or pasted pedimento text
  const handleParseText = (rawText: string) => {
    if (!rawText.trim()) return;
    const extracted = parsePedimentoDocumentText(rawText);
    setPedimento(prev => ({
      ...prev,
      ...extracted,
    }));
    setUploadNotice(`Datos extraídos del documento: ${Object.keys(extracted).join(', ')}.`);
    setShowFileModal(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      handleParseText(text);
    };
    reader.readAsText(file);
  };

  // AI Tariff query state
  const [aiProductQuery, setAiProductQuery] = useState<string>('');
  const [aiCountryQuery, setAiCountryQuery] = useState<string>('China');
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiResult, setAiResult] = useState<any>(null);

  // Run audit reactively
  const auditReport = useMemo(() => {
    return auditPedimento(pedimento);
  }, [pedimento]);

  const numValidation = useMemo(() => {
    return validatePedimentoNumber(pedimento.numeroPedimento);
  }, [pedimento.numeroPedimento]);

  // Handle preset change
  const handleSelectPreset = (index: number) => {
    setSelectedPresetIndex(index);
    setPedimento({ ...SAMPLE_PEDIMENTOS[index].data });
  };

  // Run AI / Expert Tariff query
  const handleAskAIAdvisor = async () => {
    if (!aiProductQuery.trim()) return;
    setAiLoading(true);
    try {
      const res = await fetch('/api/v1/ai/tariff-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productDescription: aiProductQuery,
          originCountry: aiCountryQuery,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAiResult(data.analysis);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  };

  const handleApplyAiTariff = () => {
    if (!aiResult) return;
    setPedimento(prev => ({
      ...prev,
      fraccionArancelaria: aiResult.suggestedHsCode.replace(/\D/g, ''),
      nico: aiResult.suggestedNico || '00',
    }));
  };

  return (
    <div className="space-y-6">
      {/* Permanent SAT / ANAM Disclaimer Banner */}
      <div className={`p-4 rounded-xl border flex items-start gap-3 ${
        isDark ? 'border-amber-500/30 bg-amber-950/20 text-amber-200' : 'border-amber-300 bg-amber-50 text-amber-900'
      }`}>
        <ShieldAlert className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs leading-relaxed">
          <strong className="block font-bold mb-0.5">
            Aviso de Auditoría Preventiva e Independencia Institucional:
          </strong>
          Esta herramienta realiza una auditoría analítica y sintáctica interna conforme al Anexo 22 de las RGCE. <strong>No constituye una aprobación o validación oficial</strong> del Servicio de Administración Tributaria (SAT) ni de la Agencia Nacional de Aduanas de México (ANAM). Toda declaración formal de impuestos de comercio exterior debe ser promovida y firmada por su Agente Aduanal con patente autorizada.
        </div>
      </div>

      {/* Upload notice if active */}
      {uploadNotice && (
        <div className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
          isDark ? 'border-emerald-500/30 bg-emerald-950/30 text-emerald-300' : 'border-emerald-300 bg-emerald-50 text-emerald-800'
        }`}>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            <span>{uploadNotice}</span>
          </div>
          <button
            onClick={() => setUploadNotice(null)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Banner & Scenario Selector */}
      <div className={`p-6 rounded-2xl border ${
        isDark ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-white'
      } shadow-xs`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              <FileCheck2 className="h-4 w-4" />
              <span>Auditor Normativo Preventivo (Anexo 22 RGCE)</span>
            </div>
            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              Validación Sintáctica, Incrementables & Detección de Riesgos Fiscales
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Verifica los 15 dígitos conforme al Anexo 22 de las RGCE, cruza coherencia de Incoterm con gastos incrementables y audita el cálculo de contribuciones.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Upload PDF / Document Button */}
            <button
              onClick={() => setShowFileModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors shadow-xs"
            >
              <Upload className="h-3.5 w-3.5" />
              <span>Cargar Archivo / Texto Pedimento</span>
            </button>

            <button
              onClick={() => window.print()}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                isDark ? 'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700' : 'border-slate-300 bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Download className="h-3.5 w-3.5" />
              <span>Imprimir Dictamen</span>
            </button>
          </div>
        </div>

        {/* Preset Buttons */}
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-slate-500 mr-1">Casos de Estudio:</span>
          {SAMPLE_PEDIMENTOS.map((sample, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectPreset(idx)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                selectedPresetIndex === idx
                  ? isDark
                    ? 'border-amber-500 bg-amber-500/20 text-amber-300 font-semibold shadow-xs'
                    : 'border-amber-500 bg-amber-50 text-amber-900 font-semibold shadow-xs'
                  : isDark
                  ? 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700'
                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {idx === 0 && '✓ A1 Conforme (Electrónicos)'}
              {idx === 1 && '⚠️ Riesgo EXW sin Flete'}
              {idx === 2 && '✕ Error Estructura 14 Dígitos'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Form Inputs (7 cols) + Audit Results (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Pedimento Fields (7 cols) */}
        <div className={`lg:col-span-7 p-6 rounded-2xl border space-y-5 ${
          isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-white'
        } shadow-xs`}>
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                1. Cabecera del Pedimento Aduanal (15 Dígitos)
              </h3>
              <span className="text-[11px] text-amber-600 dark:text-amber-400 font-mono">
                Regla Anexo 22 SAT
              </span>
            </div>

            {/* Visual 15-digit helper */}
            <div className="mt-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Número de Pedimento Completo (15 dígitos)
              </label>
              <input
                type="text"
                value={pedimento.numeroPedimento}
                onChange={(e) => setPedimento({ ...pedimento, numeroPedimento: e.target.value })}
                placeholder="24 16 3840 4 001928"
                className={`w-full px-3 py-2 text-sm font-mono tracking-widest rounded-lg border outline-none focus:ring-2 focus:ring-amber-500/50 ${
                  !numValidation.valid
                    ? 'border-red-500 bg-red-50/20 text-red-700 dark:text-red-400'
                    : isDark
                    ? 'border-slate-700 bg-slate-800 text-white'
                    : 'border-slate-300 bg-slate-50 text-slate-900'
                }`}
              />

              {/* Anatomy of 15 digits */}
              <div className={`mt-2 p-2.5 rounded-lg border text-[11px] font-mono grid grid-cols-5 gap-1 text-center ${
                numValidation.valid
                  ? isDark ? 'bg-slate-800/60 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                  : 'bg-red-500/10 border-red-500/30 text-red-500'
              }`}>
                <div>
                  <span className="block font-bold text-amber-500">{numValidation.details?.year || '--'}</span>
                  <span className="text-[10px] text-slate-400">Año (2)</span>
                </div>
                <div>
                  <span className="block font-bold text-blue-500">{numValidation.details?.aduana || '--'}</span>
                  <span className="text-[10px] text-slate-400">Aduana (2)</span>
                </div>
                <div>
                  <span className="block font-bold text-emerald-500">{numValidation.details?.patente || '----'}</span>
                  <span className="text-[10px] text-slate-400">Patente (4)</span>
                </div>
                <div>
                  <span className="block font-bold text-purple-500">{numValidation.details?.yearDigit || '-'}</span>
                  <span className="text-[10px] text-slate-400">Año curso (1)</span>
                </div>
                <div>
                  <span className="block font-bold text-slate-400">{numValidation.details?.sequential || '------'}</span>
                  <span className="text-[10px] text-slate-400">Consecutivo (6)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Clave, Régimen y RFC */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Clave de Pedimento
              </label>
              <select
                value={pedimento.clavePedimento}
                onChange={(e) => setPedimento({ ...pedimento, clavePedimento: e.target.value })}
                className={`w-full px-2.5 py-1.5 text-xs font-mono font-bold rounded-lg border outline-none ${
                  isDark ? 'border-slate-700 bg-slate-800 text-amber-400' : 'border-slate-300 bg-slate-50 text-slate-900'
                }`}
              >
                {Object.entries(VALID_CLAVES_PEDIMENTO).map(([k, v]) => (
                  <option key={k} value={k}>
                    {k} - {v.substring(0, 24)}...
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Régimen Aduanero
              </label>
              <select
                value={pedimento.regimenAduanero}
                onChange={(e) => setPedimento({ ...pedimento, regimenAduanero: e.target.value })}
                className={`w-full px-2.5 py-1.5 text-xs font-mono rounded-lg border outline-none ${
                  isDark ? 'border-slate-700 bg-slate-800 text-white' : 'border-slate-300 bg-slate-50 text-slate-900'
                }`}
              >
                <option value="IMD">IMD - Definitivo de Importación</option>
                <option value="ITR">ITR - Temporal IMMEX</option>
                <option value="DFI">DFI - Depósito Fiscal</option>
                <option value="RFE">RFE - Recinto Fiscalizado Estratégico</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Patente Declarada
              </label>
              <input
                type="text"
                value={pedimento.patenteAgente}
                onChange={(e) => setPedimento({ ...pedimento, patenteAgente: e.target.value })}
                className={`w-full px-2.5 py-1.5 text-xs font-mono rounded-lg border outline-none ${
                  isDark ? 'border-slate-700 bg-slate-800 text-white' : 'border-slate-300 bg-slate-50 text-slate-900'
                }`}
              />
            </div>
          </div>

          {/* RFC & Importador */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                RFC del Importador (SAT)
              </label>
              <input
                type="text"
                value={pedimento.rfcImportador}
                onChange={(e) => setPedimento({ ...pedimento, rfcImportador: e.target.value.toUpperCase() })}
                className={`w-full px-2.5 py-1.5 text-xs font-mono uppercase rounded-lg border outline-none ${
                  isDark ? 'border-slate-700 bg-slate-800 text-white' : 'border-slate-300 bg-slate-50 text-slate-900'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Aduana de Despacho
              </label>
              <select
                value={pedimento.aduanaDespacho}
                onChange={(e) => setPedimento({ ...pedimento, aduanaDespacho: e.target.value })}
                className={`w-full px-2.5 py-1.5 text-xs font-mono rounded-lg border outline-none ${
                  isDark ? 'border-slate-700 bg-slate-800 text-white' : 'border-slate-300 bg-slate-50 text-slate-900'
                }`}
              >
                {Object.entries(ADUANAS_MEXICO).map(([k, name]) => (
                  <option key={k} value={name.substring(0, 3)}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Section 2: Incoterm & Incrementables */}
          <div className="border-t pt-4 border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              2. Declaración de Valor Comercial e Incrementables (Art. 64 & 65)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              El Incoterm determina si el flete y seguro deben sumarse para formar el Valor en Aduana.
            </p>

            <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Incoterm Pactado
                </label>
                <select
                  value={pedimento.incoterm}
                  onChange={(e) => setPedimento({ ...pedimento, incoterm: e.target.value })}
                  className={`w-full px-2.5 py-1.5 text-xs font-bold rounded-lg border outline-none ${
                    isDark ? 'border-slate-700 bg-slate-800 text-amber-400' : 'border-slate-300 bg-slate-50 text-amber-900'
                  }`}
                >
                  <option value="FOB">FOB (Fletes y Seguros obligatorios en incrementables)</option>
                  <option value="EXW">EXW (Máxima obligación de incrementables)</option>
                  <option value="FCA">FCA (Fletes y Seguros requeridos)</option>
                  <option value="CIF">CIF (Flete y Seguro incluidos en precio)</option>
                  <option value="CIP">CIP (Transporte y Seguro incluidos)</option>
                  <option value="DDP">DDP (Todo incluido)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Valor Factura (USD)
                </label>
                <input
                  type="number"
                  value={pedimento.valorDolares}
                  onChange={(e) => setPedimento({ ...pedimento, valorDolares: Number(e.target.value) || 0 })}
                  className={`w-full px-2.5 py-1.5 text-xs font-mono rounded-lg border outline-none ${
                    isDark ? 'border-slate-700 bg-slate-800 text-white' : 'border-slate-300 bg-slate-50'
                  }`}
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Tipo de Cambio DOF
                </label>
                <input
                  type="number"
                  step="0.05"
                  value={pedimento.tipoCambio}
                  onChange={(e) => setPedimento({ ...pedimento, tipoCambio: Number(e.target.value) || 1 })}
                  className={`w-full px-2.5 py-1.5 text-xs font-mono rounded-lg border outline-none ${
                    isDark ? 'border-slate-700 bg-slate-800 text-white' : 'border-slate-300 bg-slate-50'
                  }`}
                />
              </div>
            </div>

            <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Fletes Declarados (USD)
                </label>
                <input
                  type="number"
                  value={pedimento.fletesUSD}
                  onChange={(e) => setPedimento({ ...pedimento, fletesUSD: Number(e.target.value) || 0 })}
                  className={`w-full px-2.5 py-1.5 text-xs font-mono rounded-lg border outline-none ${
                    isDark ? 'border-slate-700 bg-slate-800 text-white' : 'border-slate-300 bg-slate-50'
                  }`}
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Seguros Declarados (USD)
                </label>
                <input
                  type="number"
                  value={pedimento.segurosUSD}
                  onChange={(e) => setPedimento({ ...pedimento, segurosUSD: Number(e.target.value) || 0 })}
                  className={`w-full px-2.5 py-1.5 text-xs font-mono rounded-lg border outline-none ${
                    isDark ? 'border-slate-700 bg-slate-800 text-white' : 'border-slate-300 bg-slate-50'
                  }`}
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Valor Aduana Declarado (MXN)
                </label>
                <input
                  type="number"
                  value={pedimento.valorAduanaMXN}
                  onChange={(e) => setPedimento({ ...pedimento, valorAduanaMXN: Number(e.target.value) || 0 })}
                  className={`w-full px-2.5 py-1.5 text-xs font-mono rounded-lg border outline-none font-semibold ${
                    isDark ? 'border-slate-700 bg-slate-800 text-amber-400' : 'border-slate-300 bg-slate-50 text-slate-900'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Fracción TIGIE & NICO */}
          <div className="border-t pt-4 border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              3. Fracción Arancelaria (8 Dígitos) y NICO (2 Dígitos)
            </h3>

            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Fracción TIGIE (8 dígitos)
                </label>
                <input
                  type="text"
                  maxLength={8}
                  value={pedimento.fraccionArancelaria}
                  onChange={(e) => setPedimento({ ...pedimento, fraccionArancelaria: e.target.value.replace(/\D/g, '') })}
                  className={`w-full px-2.5 py-1.5 text-xs font-mono rounded-lg border outline-none ${
                    isDark ? 'border-slate-700 bg-slate-800 text-white' : 'border-slate-300 bg-slate-50'
                  }`}
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  NICO (2 dígitos)
                </label>
                <input
                  type="text"
                  maxLength={2}
                  value={pedimento.nico}
                  onChange={(e) => setPedimento({ ...pedimento, nico: e.target.value.replace(/\D/g, '') })}
                  className={`w-full px-2.5 py-1.5 text-xs font-mono rounded-lg border outline-none ${
                    isDark ? 'border-slate-700 bg-slate-800 text-white' : 'border-slate-300 bg-slate-50'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* AI Tariff Assistant Section */}
          <div className={`p-4 rounded-xl border ${
            isDark ? 'border-amber-500/20 bg-slate-950/60' : 'border-amber-200 bg-amber-50/30'
          }`}>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-600 dark:text-amber-400">
              <Sparkles className="h-4 w-4" />
              <span>Asistente Inteligente de Clasificación & NOMs Aduanales</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
              Escribe la descripción de tu mercancía para obtener sugerencias de fracción TIGIE, NICO y normas oficiales mexicanas.
            </p>

            <div className="mt-3 flex gap-2">
              <input
                type="text"
                placeholder="Ej. Laptops gamers portátiles con pantalla 15 pulgadas..."
                value={aiProductQuery}
                onChange={(e) => setAiProductQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAskAIAdvisor()}
                className={`flex-1 px-3 py-1.5 text-xs rounded-lg border outline-none ${
                  isDark ? 'border-slate-700 bg-slate-900 text-white' : 'border-slate-300 bg-white'
                }`}
              />
              <button
                onClick={handleAskAIAdvisor}
                disabled={aiLoading}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-500 text-slate-950 hover:bg-amber-400 disabled:opacity-50 whitespace-nowrap"
              >
                {aiLoading ? 'Analizando...' : 'Clasificar'}
              </button>
            </div>

            {aiResult && (
              <div className="mt-3 pt-3 border-t border-amber-200 dark:border-slate-800 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900 dark:text-white">
                    Sugerencia: {aiResult.suggestedHsCode}.{aiResult.suggestedNico || '00'}
                  </span>
                  <button
                    onClick={handleApplyAiTariff}
                    className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 hover:underline"
                  >
                    Aplicar al Pedimento
                  </button>
                </div>
                <div className="text-[11px] text-slate-600 dark:text-slate-300">
                  Arancel estimado: <strong className="font-mono">{aiResult.estimatedIgi || '0%'}</strong>
                </div>
                {aiResult.requiredNorms && (
                  <div className="text-[11px] text-slate-500">
                    NOMs requeridas: {aiResult.requiredNorms.join(', ')}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Audit Findings & SAT Compliance Score (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Compliance Score Card */}
          <div className={`p-6 rounded-2xl border ${
            auditReport.isValid
              ? isDark ? 'border-emerald-500/30 bg-slate-900/90' : 'border-emerald-300 bg-emerald-50/40'
              : isDark ? 'border-red-500/30 bg-slate-900/90' : 'border-red-300 bg-red-50/40'
          } shadow-sm`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Dictamen de Cumplimiento SAT / ANAM
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                auditReport.isValid
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                  : 'bg-red-100 text-red-800 dark:bg-red-950/80 dark:text-red-300'
              }`}>
                {auditReport.isValid ? 'APROBADO' : 'RIESGO FISCAL'}
              </span>
            </div>

            <div className="mt-3 flex items-baseline gap-2">
              <span className={`text-4xl font-extrabold font-mono tabular-nums ${
                auditReport.score >= 80 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
              }`}>
                {auditReport.score}
              </span>
              <span className="text-sm font-semibold text-slate-500">/ 100 puntos de confiabilidad</span>
            </div>

            {/* Counters */}
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 font-semibold">
                <div className="text-lg font-mono">{auditReport.criticalCount}</div>
                <div className="text-[10px]">Críticos</div>
              </div>
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold">
                <div className="text-lg font-mono">{auditReport.warningCount}</div>
                <div className="text-[10px]">Advertencias</div>
              </div>
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold">
                <div className="text-lg font-mono">{auditReport.passedCount}</div>
                <div className="text-[10px]">Conformes</div>
              </div>
            </div>
          </div>

          {/* Issues List with Legal References */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1">
              Hallazgos de la Auditoría ({auditReport.issues.length})
            </h4>

            {auditReport.issues.map((issue, idx) => {
              const severityIcons = {
                CRITICAL: <AlertOctagon className="h-4 w-4 text-red-500 shrink-0" />,
                WARNING: <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />,
                INFO: <HelpCircle className="h-4 w-4 text-blue-500 shrink-0" />,
                SUCCESS: <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />,
              };

              const severityBorders = {
                CRITICAL: isDark ? 'border-red-500/30 bg-red-950/20' : 'border-red-200 bg-red-50/50',
                WARNING: isDark ? 'border-amber-500/30 bg-amber-950/20' : 'border-amber-200 bg-amber-50/50',
                INFO: isDark ? 'border-blue-500/30 bg-blue-950/20' : 'border-blue-200 bg-blue-50/50',
                SUCCESS: isDark ? 'border-emerald-500/30 bg-emerald-950/20' : 'border-emerald-200 bg-emerald-50/50',
              };

              return (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border text-xs space-y-1.5 ${severityBorders[issue.severity]}`}
                >
                  <div className="flex items-center gap-2">
                    {severityIcons[issue.severity]}
                    <span className="font-bold text-slate-900 dark:text-white">
                      {issue.title}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed pl-6">
                    {issue.message}
                  </p>
                  {issue.legalReference && (
                    <div className="pl-6 pt-1 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                      <strong>Fundamento:</strong> {issue.legalReference}
                    </div>
                  )}
                  {issue.suggestedAction && (
                    <div className="pl-6 text-[11px] text-amber-700 dark:text-amber-400 font-medium">
                      <strong>Acción correctiva:</strong> {issue.suggestedAction}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Expected vs Declared Comparison Box */}
          <div className={`p-4 rounded-xl border text-xs space-y-2 ${
            isDark ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-white'
          }`}>
            <div className="font-bold text-slate-900 dark:text-white">
              Cálculo de Base Gravable Esperada vs Declarada
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Incrementables Esperados:</span>
              <span className="font-mono tabular-nums text-slate-900 dark:text-white">
                ${auditReport.calculatedExpected.incrementablesUSD.toLocaleString()} USD
              </span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Valor en Aduana Esperado:</span>
              <span className="font-mono tabular-nums text-slate-900 dark:text-white">
                ${auditReport.calculatedExpected.valorAduanaExpectedMXN.toLocaleString()} MXN
              </span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>DTA Mínimo Legal Esperado:</span>
              <span className="font-mono tabular-nums text-slate-900 dark:text-white">
                ${auditReport.calculatedExpected.dtaExpectedMXN.toLocaleString()} MXN
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Cargar Archivo / Texto Pedimento */}
      {showFileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className={`w-full max-w-lg p-6 rounded-2xl border shadow-2xl ${
            isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white">
                <Upload className="h-5 w-5 text-amber-500" />
                <span>Cargar Pedimento para Auditoría Automática</span>
              </div>
              <button
                onClick={() => setShowFileModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Sube el archivo de texto/M3 o pega el texto copiado de tu pedimento en PDF. El motor extraerá los 15 dígitos, RFC, claves de aduana e importes para auditarlos al instante.
            </p>

            {/* Drag & drop file area */}
            <div className="mt-4">
              <label className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
                isDark ? 'border-slate-700 bg-slate-950/50 hover:border-amber-500/50' : 'border-slate-300 bg-slate-50 hover:border-amber-400'
              }`}>
                <FileText className="h-8 w-8 text-amber-500 mb-2" />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Seleccionar archivo de pedimento (.txt, .m3, .pdf)
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">
                  Extracción local segura en tu navegador
                </span>
                <input
                  type="file"
                  accept=".txt,.m3,.csv,.json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Or Paste text */}
            <div className="mt-4">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                O pega el texto extraído del documento:
              </label>
              <textarea
                rows={4}
                value={pastedDocumentText}
                onChange={e => setPastedDocumentText(e.target.value)}
                placeholder="Pega aquí el contenido del pedimento, por ejemplo:
PEDIMENTO: 24 16 3840 4 001928 CLAVE: A1 REGIMEN: IMD
RFC: DTE210419KM8 T.C.: 19.85 INCOTERM: FOB..."
                className={`w-full p-2.5 text-xs font-mono rounded-xl border outline-none focus:ring-2 focus:ring-amber-500/50 ${
                  isDark ? 'border-slate-700 bg-slate-950 text-white placeholder-slate-600' : 'border-slate-300 bg-white text-slate-900 placeholder-slate-400'
                }`}
              />
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowFileModal(false)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                  isDark ? 'border-slate-700 text-slate-300' : 'border-slate-300 text-slate-700'
                }`}
              >
                Cancelar
              </button>
              <button
                onClick={() => handleParseText(pastedDocumentText)}
                disabled={!pastedDocumentText.trim()}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 text-slate-950 hover:bg-amber-400 disabled:opacity-50 transition-colors shadow-xs"
              >
                Analizar & Auditar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
