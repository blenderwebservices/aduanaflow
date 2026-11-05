import React, { useState, useMemo } from 'react';
import {
  Calculator,
  RefreshCw,
  HelpCircle,
  TrendingUp,
  Percent,
  DollarSign,
  PackageCheck,
  Truck,
  ArrowRight,
  ShieldCheck,
  FileSpreadsheet,
} from 'lucide-react';
import {
  calculateLandedCost,
  LandedCostInput,
  COMMON_TARIFFS,
  TariffCategory,
} from '../utils/customsCalculations';
import alexaAvatar from '../assets/images/alexa_founder_avatar_1793831212997.jpg';

interface LandedCostSimulatorProps {
  isDark: boolean;
  onSendToPedimento?: (values: LandedCostInput) => void;
}

export const LandedCostSimulator: React.FC<LandedCostSimulatorProps> = ({
  isDark,
  onSendToPedimento,
}) => {
  // Simulator state with realistic initial values
  const [commercialValueUSD, setCommercialValueUSD] = useState<number>(25000);
  const [exchangeRate, setExchangeRate] = useState<number>(19.85);
  const [incoterm, setIncoterm] = useState<string>('FOB');
  const [freightUSD, setFreightUSD] = useState<number>(1850);
  const [insuranceUSD, setInsuranceUSD] = useState<number>(320);
  const [handlingUSD, setHandlingUSD] = useState<number>(150);
  const [otherIncrementablesUSD, setOtherIncrementablesUSD] = useState<number>(0);
  const [selectedTariff, setSelectedTariff] = useState<string>(COMMON_TARIFFS[0].hsCode);
  const [igiRatePercent, setIgiRatePercent] = useState<number>(COMMON_TARIFFS[0].igiPercent);
  const [isDtaFixed, setIsDtaFixed] = useState<boolean>(false);
  const [unitsCount, setUnitsCount] = useState<number>(100);
  const [brokerFeePercent, setBrokerFeePercent] = useState<number>(0.45);
  const [lastMileDeliveryMXN, setLastMileDeliveryMXN] = useState<number>(4500);
  const [targetMarginPercent, setTargetMarginPercent] = useState<number>(35);

  // Active tariff details
  const activeTariff = useMemo(() => {
    return COMMON_TARIFFS.find(t => t.hsCode === selectedTariff) || COMMON_TARIFFS[0];
  }, [selectedTariff]);

  const handleSelectTariff = (hsCode: string) => {
    setSelectedTariff(hsCode);
    const found = COMMON_TARIFFS.find(t => t.hsCode === hsCode);
    if (found) {
      setIgiRatePercent(found.igiPercent);
    }
  };

  // Instant reactive calculation
  const result = useMemo(() => {
    return calculateLandedCost({
      commercialValueUSD,
      exchangeRate,
      incoterm,
      freightUSD,
      insuranceUSD,
      handlingUSD,
      otherIncrementablesUSD,
      igiRatePercent,
      isDtaFixed,
      unitsCount,
      brokerFeePercent,
      lastMileDeliveryMXN,
      targetMarginPercent,
    });
  }, [
    commercialValueUSD,
    exchangeRate,
    incoterm,
    freightUSD,
    insuranceUSD,
    handlingUSD,
    otherIncrementablesUSD,
    igiRatePercent,
    isDtaFixed,
    unitsCount,
    brokerFeePercent,
    lastMileDeliveryMXN,
    targetMarginPercent,
  ]);

  // Reset to realistic preset
  const handleReset = () => {
    setCommercialValueUSD(25000);
    setExchangeRate(19.85);
    setIncoterm('FOB');
    setFreightUSD(1850);
    setInsuranceUSD(320);
    setHandlingUSD(150);
    setOtherIncrementablesUSD(0);
    handleSelectTariff(COMMON_TARIFFS[0].hsCode);
    setUnitsCount(100);
    setLastMileDeliveryMXN(4500);
    setTargetMarginPercent(35);
  };

  // Percentage breakdown
  const pctMerchandise = Math.round((result.commercialValueMXN / result.totalLandedCostMXN) * 100);
  const pctTaxes = Math.round((result.totalCustomsTaxesMXN / result.totalLandedCostMXN) * 100);
  const pctIntLogistics = Math.round((result.incrementablesMXN / result.totalLandedCostMXN) * 100);
  const pctLocalLogistics = Math.max(1, 100 - pctMerchandise - pctTaxes - pctIntLogistics);

  return (
    <div className="space-y-6">
      {/* Simulator Header & Controls */}
      <div className={`p-6 rounded-2xl border ${isDark ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-white'
        } shadow-xs`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              <Calculator className="h-4 w-4" />
              <span>Simulador Reactivo de Costos de Importación (Landed Cost)</span>
            </div>
            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              Cálculo de Impuestos, Incrementables y Precio de Venta PyME
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Determina con rigor de Ley Aduanera el Valor en Aduana, IGI, DTA (Art. 49 LFD), IVA al 16% y margen comercial.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${isDark
                  ? 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700'
                  : 'border-slate-300 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Restablecer</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Reactive Input Controls (7 cols) */}
        <div className={`lg:col-span-7 p-6 rounded-2xl border space-y-5 ${isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-white'
          } shadow-xs`}>
          <div className="border-b pb-3 border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              1. Datos de Factura Comercial & Clasificación TIGIE
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Captura los valores de origen y selecciona la fracción arancelaria correspondiente.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Valor Comercial USD */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Valor Factura Comercial (USD)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-xs">$</span>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={commercialValueUSD}
                  onChange={(e) => setCommercialValueUSD(Number(e.target.value) || 0)}
                  className={`w-full pl-7 pr-3 py-2 text-sm font-mono rounded-lg border outline-none focus:ring-2 focus:ring-amber-500/50 ${isDark
                      ? 'border-slate-700 bg-slate-800 text-white'
                      : 'border-slate-300 bg-slate-50 text-slate-900'
                    }`}
                />
              </div>
            </div>

            {/* Tipo de Cambio DOF */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tipo de Cambio DOF (MXN por USD)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-xs">$</span>
                <input
                  type="number"
                  min="1"
                  step="0.05"
                  value={exchangeRate}
                  onChange={(e) => setExchangeRate(Number(e.target.value) || 1)}
                  className={`w-full pl-7 pr-3 py-2 text-sm font-mono rounded-lg border outline-none focus:ring-2 focus:ring-amber-500/50 ${isDark
                      ? 'border-slate-700 bg-slate-800 text-white'
                      : 'border-slate-300 bg-slate-50 text-slate-900'
                    }`}
                />
              </div>
            </div>
          </div>

          {/* Fracción Arancelaria Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Catálogo de Fracción Arancelaria (TIGIE + NICO)
            </label>
            <select
              value={selectedTariff}
              onChange={(e) => handleSelectTariff(e.target.value)}
              className={`w-full px-3 py-2 text-xs font-mono rounded-lg border outline-none focus:ring-2 focus:ring-amber-500/50 ${isDark
                  ? 'border-slate-700 bg-slate-800 text-white'
                  : 'border-slate-300 bg-slate-50 text-slate-900'
                }`}
            >
              {COMMON_TARIFFS.map((t) => (
                <option key={t.hsCode} value={t.hsCode}>
                  {t.hsCode}.{t.nico} - {t.description.substring(0, 65)}... (IGI: {t.igiPercent}%)
                </option>
              ))}
            </select>

            {/* Regulation Badge Box */}
            <div className={`mt-2 p-2.5 rounded-lg border text-xs ${isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200'
              }`}>
              <div className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                Regulaciones & Restricciones No Arancelarias (RRNA) aplicables:
              </div>
              <ul className="mt-1 space-y-0.5 text-slate-600 dark:text-slate-300 text-[11px]">
                {activeTariff.regulations.map((reg, idx) => (
                  <li key={idx} className="flex items-center gap-1.5">
                    <span className="text-amber-500">✓</span>
                    <span>{reg}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Incoterm & Arancel IGI */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Término Incoterm 2020
              </label>
              <select
                value={incoterm}
                onChange={(e) => setIncoterm(e.target.value)}
                className={`w-full px-3 py-2 text-sm font-semibold rounded-lg border outline-none focus:ring-2 focus:ring-amber-500/50 ${isDark
                    ? 'border-slate-700 bg-slate-800 text-amber-400'
                    : 'border-slate-300 bg-slate-50 text-amber-900'
                  }`}
              >
                <option value="EXW">EXW - En fábrica (Máx. Incrementables)</option>
                <option value="FCA">FCA - Franco porteador</option>
                <option value="FOB">FOB - Franco a bordo (Recomendado Marítimo)</option>
                <option value="CFR">CFR - Costo y flete</option>
                <option value="CIF">CIF - Costo, seguro y flete</option>
                <option value="CPT">CPT - Transporte pagado</option>
                <option value="CIP">CIP - Transporte y seguro pagados</option>
                <option value="DAP">DAP - Entregado en lugar</option>
                <option value="DDP">DDP - Entregado derechos pagados</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tasa IGI / Arancel Aduanero (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={igiRatePercent}
                  onChange={(e) => setIgiRatePercent(Number(e.target.value) || 0)}
                  className={`w-full px-3 py-2 text-sm font-mono rounded-lg border outline-none focus:ring-2 focus:ring-amber-500/50 ${isDark
                      ? 'border-slate-700 bg-slate-800 text-white'
                      : 'border-slate-300 bg-slate-50 text-slate-900'
                    }`}
                />
                <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 text-xs">%</span>
              </div>
            </div>
          </div>

          {/* Section 2: Incrementables */}
          <div className="border-t pt-4 border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              2. Gastos Incrementables en Origen y Tránsito (Art. 65 LA)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Fletes y seguros pagados por el importador que forman parte de la base gravable.
            </p>

            <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Flete Internacional (USD)
                </label>
                <input
                  type="number"
                  min="0"
                  value={freightUSD}
                  onChange={(e) => setFreightUSD(Number(e.target.value) || 0)}
                  className={`w-full px-2.5 py-1.5 text-xs font-mono rounded-md border ${isDark ? 'border-slate-700 bg-slate-800 text-white' : 'border-slate-300 bg-slate-50'
                    }`}
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Seguro Internacional (USD)
                </label>
                <input
                  type="number"
                  min="0"
                  value={insuranceUSD}
                  onChange={(e) => setInsuranceUSD(Number(e.target.value) || 0)}
                  className={`w-full px-2.5 py-1.5 text-xs font-mono rounded-md border ${isDark ? 'border-slate-700 bg-slate-800 text-white' : 'border-slate-300 bg-slate-50'
                    }`}
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Maniobras & Carga (USD)
                </label>
                <input
                  type="number"
                  min="0"
                  value={handlingUSD}
                  onChange={(e) => setHandlingUSD(Number(e.target.value) || 0)}
                  className={`w-full px-2.5 py-1.5 text-xs font-mono rounded-md border ${isDark ? 'border-slate-700 bg-slate-800 text-white' : 'border-slate-300 bg-slate-50'
                    }`}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Costos en Destino, Última Milla & Margen */}
          <div className="border-t pt-4 border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              3. Despacho Nacional, Última Milla & Margen Comercial
            </h3>

            <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Unidades del Lote (Piezas)
                </label>
                <input
                  type="number"
                  min="1"
                  value={unitsCount}
                  onChange={(e) => setUnitsCount(Number(e.target.value) || 1)}
                  className={`w-full px-2.5 py-1.5 text-xs font-mono rounded-md border ${isDark ? 'border-slate-700 bg-slate-800 text-white' : 'border-slate-300 bg-slate-50'
                    }`}
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Flete Última Milla (MXN)
                </label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={lastMileDeliveryMXN}
                  onChange={(e) => setLastMileDeliveryMXN(Number(e.target.value) || 0)}
                  className={`w-full px-2.5 py-1.5 text-xs font-mono rounded-md border ${isDark ? 'border-slate-700 bg-slate-800 text-white' : 'border-slate-300 bg-slate-50'
                    }`}
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Margen Deseado (%)
                </label>
                <input
                  type="number"
                  min="5"
                  max="90"
                  value={targetMarginPercent}
                  onChange={(e) => setTargetMarginPercent(Number(e.target.value) || 35)}
                  className={`w-full px-2.5 py-1.5 text-xs font-mono rounded-md border ${isDark ? 'border-slate-700 bg-slate-800 text-white' : 'border-slate-300 bg-slate-50'
                    }`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Calculation Results & Landed Cost Card (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Main Result Card */}
          <div className={`p-6 rounded-2xl border ${isDark ? 'border-amber-500/30 bg-slate-900/90' : 'border-amber-300 bg-amber-50/40'
            } shadow-sm`}>
            <div className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
              Resumen Financiero Consolidado
            </div>
            <div className="mt-1 text-3xl font-extrabold font-mono tabular-nums text-slate-900 dark:text-white">
              ${result.totalLandedCostMXN.toLocaleString()} <span className="text-sm font-semibold text-slate-500">MXN</span>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Costo total de importación puesto en bodega de la PyME
            </div>

            {/* Per Unit Metrics */}
            <div className="mt-4 pt-4 border-t border-amber-200 dark:border-slate-800 grid grid-cols-2 gap-3">
              <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-white border-amber-200/80'
                }`}>
                <div className="text-[11px] text-slate-500">Costo Unitario Real</div>
                <div className="text-lg font-bold font-mono tabular-nums text-slate-900 dark:text-white">
                  ${result.costPerUnitMXN.toLocaleString()} <span className="text-xs font-normal">MXN</span>
                </div>
                <div className="text-[10px] text-slate-400">(${result.costPerUnitUSD} USD)</div>
              </div>

              <div className={`p-3 rounded-xl border ${isDark ? 'bg-amber-500/10 border-amber-500/30' : 'bg-amber-100/60 border-amber-300'
                }`}>
                <div className="text-[11px] text-amber-800 dark:text-amber-300 font-semibold">Precio de Venta Sugerido</div>
                <div className="text-lg font-bold font-mono tabular-nums text-amber-900 dark:text-amber-400">
                  ${result.suggestedSalePriceMXN.toLocaleString()} <span className="text-xs font-normal">MXN</span>
                </div>
                <div className="text-[10px] text-amber-700 dark:text-amber-400 font-medium">Margen: +${result.suggestedMarginAmountMXN.toLocaleString()} ({targetMarginPercent}%)</div>
              </div>
            </div>

            {/* Cost Breakdown Visual Bar */}
            <div className="mt-4">
              <div className="flex justify-between text-[11px] text-slate-500 font-medium mb-1.5">
                <span>Composición del Costo Total</span>
                <span className="font-mono">{pctMerchandise}% Producto · {pctTaxes}% Impuestos</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-slate-200 dark:bg-slate-800 flex overflow-hidden">
                <div style={{ width: `${pctMerchandise}%` }} className="bg-blue-500" title={`Mercancía: ${pctMerchandise}%`} />
                <div style={{ width: `${pctTaxes}%` }} className="bg-amber-500" title={`Impuestos y derechos: ${pctTaxes}%`} />
                <div style={{ width: `${pctIntLogistics}%` }} className="bg-emerald-500" title={`Logística int.: ${pctIntLogistics}%`} />
                <div style={{ width: `${pctLocalLogistics}%` }} className="bg-purple-500" title={`Agente y última milla: ${pctLocalLogistics}%`} />
              </div>
            </div>

            {/* Detailed Customs Breakdown Table */}
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Valor Comercial Factura:</span>
                <span className="font-mono tabular-nums">${result.commercialValueMXN.toLocaleString()} MXN</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Incrementables (Flete + Seguro):</span>
                <span className="font-mono tabular-nums">${result.incrementablesMXN.toLocaleString()} MXN</span>
              </div>
              <div className="flex justify-between font-semibold text-slate-900 dark:text-white pt-1 border-t border-slate-200 dark:border-slate-800">
                <span>Valor en Aduana (Base Gravable):</span>
                <span className="font-mono tabular-nums text-amber-600 dark:text-amber-400">
                  ${result.customsValueMXN.toLocaleString()} MXN
                </span>
              </div>

              {/* Tax lines */}
              <div className="pl-3 border-l-2 border-amber-500/40 space-y-1.5 my-2 pt-1 text-[11px]">
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>IGI ({igiRatePercent}%):</span>
                  <span className="font-mono tabular-nums">${result.igiAmountMXN.toLocaleString()} MXN</span>
                </div>
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>DTA Art. 49 LFD (8 al millar):</span>
                  <span className="font-mono tabular-nums">${result.dtaAmountMXN.toLocaleString()} MXN</span>
                </div>
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>Prevalidación (PRV) + Contraprestación (CNT):</span>
                  <span className="font-mono tabular-nums">${(result.prvAmountMXN + result.cntAmountMXN).toLocaleString()} MXN</span>
                </div>
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>IVA al 16% (Base Aduana + IGI + DTA):</span>
                  <span className="font-mono tabular-nums font-semibold">${result.ivaAmountMXN.toLocaleString()} MXN</span>
                </div>
              </div>

              <div className="flex justify-between font-medium text-slate-800 dark:text-slate-200">
                <span>Total Contribuciones Aduanales:</span>
                <span className="font-mono tabular-nums text-red-600 dark:text-red-400 font-semibold">
                  ${result.totalCustomsTaxesMXN.toLocaleString()} MXN
                </span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Honorarios Agente Aduanal:</span>
                <span className="font-mono tabular-nums">${result.brokerFeeMXN.toLocaleString()} MXN</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Flete Nacional Última Milla:</span>
                <span className="font-mono tabular-nums">${result.lastMileDeliveryMXN.toLocaleString()} MXN</span>
              </div>
            </div>
          </div>

          {/* Alexa's Expert Note */}
          <div className={`p-4 rounded-xl border ${isDark ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-white'
            }`}>
            <div className="flex items-start gap-3">
              <img
                src={alexaAvatar}
                alt="Alexa Sánchez"
                className="h-9 w-9 rounded-full object-cover shrink-0"
                referrerPolicy="no-referrer"
              />
              <div className="text-xs">
                <div className="font-semibold text-slate-900 dark:text-white">
                  Consejo de Alexa sobre Incrementables:
                </div>
                <p className="mt-1 text-slate-600 dark:text-slate-300 leading-relaxed">
                  "Si negociaste en {incoterm}, recuerda que el Art. 65 de la Ley Aduanera te obliga a declarar el flete y seguro en el pedimento. No hacerlo puede derivar en un Procedimiento Administrativo en Materia Aduanera (PAMA) por subvaluación de contribuciones."
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
