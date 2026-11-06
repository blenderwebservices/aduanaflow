import React, { useState, useMemo, useEffect } from 'react';
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
  Download,
  BookmarkPlus,
  Trash2,
  Scale,
  AlertTriangle,
  Coins,
  Building,
  Info,
} from 'lucide-react';
import {
  calculateLandedCost,
  LandedCostInput,
  COMMON_TARIFFS,
  TariffCategory,
  InvoiceCurrency,
  TradeAgreement,
  TRADE_AGREEMENTS_INFO,
} from '../utils/customsCalculations';
import alexaAvatar from '../assets/images/alexa_founder_avatar_1793831212997.jpg';

interface LandedCostSimulatorProps {
  isDark: boolean;
  onSendToPedimento?: (values: LandedCostInput) => void;
}

interface SavedSimulation {
  id: string;
  date: string;
  productDescription: string;
  totalCashDisbursementMXN: number;
  accountingInventoryCostMXN: number;
  costPerUnitMXN: number;
  suggestedSalePriceMXN: number;
  currency: InvoiceCurrency;
  invoiceValue: number;
  incoterm: string;
  agreement: TradeAgreement;
}

export const LandedCostSimulator: React.FC<LandedCostSimulatorProps> = ({
  isDark,
  onSendToPedimento,
}) => {
  // Input parameters
  const [invoiceValue, setInvoiceValue] = useState<number>(25000);
  const [currency, setCurrency] = useState<InvoiceCurrency>('USD');
  const [exchangeRateToMXN, setExchangeRateToMXN] = useState<number>(19.85);
  const [exchangeRateToUSD, setExchangeRateToUSD] = useState<number>(1.08); // for EUR or CNY
  const [originCountry, setOriginCountry] = useState<string>('China');
  const [tradeAgreement, setTradeAgreement] = useState<TradeAgreement>('GENERAL');

  const [incoterm, setIncoterm] = useState<string>('FOB');
  const [selectedTariff, setSelectedTariff] = useState<string>(COMMON_TARIFFS[0].hsCode);
  const [customIgiRate, setCustomIgiRate] = useState<number>(COMMON_TARIFFS[0].igiPercent);
  const [useCustomIgi, setUseCustomIgi] = useState<boolean>(false);

  // Incrementables
  const [freightUSD, setFreightUSD] = useState<number>(1850);
  const [insuranceUSD, setInsuranceUSD] = useState<number>(320);
  const [packagingUSD, setPackagingUSD] = useState<number>(100);
  const [handlingUSD, setHandlingUSD] = useState<number>(150);
  const [otherIncrementablesUSD, setOtherIncrementablesUSD] = useState<number>(0);

  // DTA & Cuotas
  const [isDtaFixed, setIsDtaFixed] = useState<boolean>(false);
  const [compensatoryDutyPercent, setCompensatoryDutyPercent] = useState<number>(0);

  // Logística y Costos
  const [unitsCount, setUnitsCount] = useState<number>(100);
  const [brokerFeePercent, setBrokerFeePercent] = useState<number>(0.45);
  const [storagePortMXN, setStoragePortMXN] = useState<number>(1800);
  const [maneuversPortMXN, setManeuversPortMXN] = useState<number>(1500);
  const [lastMileDeliveryMXN, setLastMileDeliveryMXN] = useState<number>(4500);
  const [targetMarginPercent, setTargetMarginPercent] = useState<number>(35);

  // UI tabs
  const [activeTab, setActiveTab] = useState<'SUMMARY' | 'BREAKDOWN' | 'HISTORY'>('SUMMARY');
  const [savedSimulations, setSavedSimulations] = useState<SavedSimulation[]>([]);

  // Load history from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('aduanaflow_simulations');
      if (stored) {
        setSavedSimulations(JSON.parse(stored));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Update default currency exchange rates when currency changes
  const handleCurrencyChange = (curr: InvoiceCurrency) => {
    setCurrency(curr);
    if (curr === 'USD') {
      setExchangeRateToMXN(19.85);
    } else if (curr === 'EUR') {
      setExchangeRateToMXN(21.45);
      setExchangeRateToUSD(1.08);
    } else if (curr === 'CNY') {
      setExchangeRateToMXN(2.75);
      setExchangeRateToUSD(0.14);
    } else if (curr === 'MXN') {
      setExchangeRateToMXN(1.0);
    }
  };

  // Active tariff details
  const activeTariff = useMemo(() => {
    return COMMON_TARIFFS.find(t => t.hsCode === selectedTariff) || COMMON_TARIFFS[0];
  }, [selectedTariff]);

  const handleSelectTariff = (hsCode: string) => {
    setSelectedTariff(hsCode);
    const found = COMMON_TARIFFS.find(t => t.hsCode === hsCode);
    if (found) {
      setCustomIgiRate(found.igiPercent);
      setUseCustomIgi(false);
    }
  };

  // When agreement changes, adjust defaults
  useEffect(() => {
    const meta = TRADE_AGREEMENTS_INFO[tradeAgreement];
    if (meta) {
      setIsDtaFixed(meta.dtaType === 'FIXED');
      if (tradeAgreement !== 'GENERAL' && meta.igiExemptionDefault && !useCustomIgi) {
        setCustomIgiRate(0);
      } else if (tradeAgreement === 'GENERAL' && !useCustomIgi) {
        setCustomIgiRate(activeTariff.igiPercent);
      }
    }
  }, [tradeAgreement, activeTariff, useCustomIgi]);

  // Reactive calculation
  const result = useMemo(() => {
    return calculateLandedCost({
      invoiceValue,
      currency,
      exchangeRateToMXN,
      exchangeRateToUSD,
      originCountry,
      hsCode: activeTariff.hsCode,
      nico: activeTariff.nico,
      incoterm,
      tradeAgreement,
      freightUSD,
      insuranceUSD,
      packagingUSD,
      handlingUSD,
      otherIncrementablesUSD,
      igiRatePercent: customIgiRate,
      isDtaFixed,
      compensatoryDutyPercent,
      unitsCount,
      brokerFeePercent,
      storagePortMXN,
      maneuversPortMXN,
      lastMileDeliveryMXN,
      targetMarginPercent,
    });
  }, [
    invoiceValue,
    currency,
    exchangeRateToMXN,
    exchangeRateToUSD,
    originCountry,
    activeTariff,
    incoterm,
    tradeAgreement,
    freightUSD,
    insuranceUSD,
    packagingUSD,
    handlingUSD,
    otherIncrementablesUSD,
    customIgiRate,
    isDtaFixed,
    compensatoryDutyPercent,
    unitsCount,
    brokerFeePercent,
    storagePortMXN,
    maneuversPortMXN,
    lastMileDeliveryMXN,
    targetMarginPercent,
  ]);

  // Save current simulation to history
  const handleSaveSimulation = () => {
    const newSim: SavedSimulation = {
      id: `SIM-${Date.now()}`,
      date: new Date().toLocaleDateString('es-MX', { hour: '2-digit', minute: '2-digit' }),
      productDescription: activeTariff.description,
      totalCashDisbursementMXN: result.cashDisbursementTotalMXN,
      accountingInventoryCostMXN: result.accountingInventoryCostMXN,
      costPerUnitMXN: result.costPerUnitMXN,
      suggestedSalePriceMXN: result.suggestedSalePriceMXN,
      currency,
      invoiceValue,
      incoterm,
      agreement: tradeAgreement,
    };

    const updated = [newSim, ...savedSimulations.slice(0, 9)];
    setSavedSimulations(updated);
    try {
      localStorage.setItem('aduanaflow_simulations', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteSimulation = (id: string) => {
    const updated = savedSimulations.filter(s => s.id !== id);
    setSavedSimulations(updated);
    try {
      localStorage.setItem('aduanaflow_simulations', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const handleReset = () => {
    setInvoiceValue(25000);
    setCurrency('USD');
    setExchangeRateToMXN(19.85);
    setOriginCountry('China');
    setTradeAgreement('GENERAL');
    setIncoterm('FOB');
    setFreightUSD(1850);
    setInsuranceUSD(320);
    setPackagingUSD(100);
    setHandlingUSD(150);
    setOtherIncrementablesUSD(0);
    handleSelectTariff(COMMON_TARIFFS[0].hsCode);
    setUnitsCount(100);
    setLastMileDeliveryMXN(4500);
    setTargetMarginPercent(35);
  };

  // Percentage breakdown of cash disbursement
  const pctMerchandise = Math.max(1, Math.round((result.commercialValueMXN / (result.cashDisbursementTotalMXN || 1)) * 100));
  const pctTaxes = Math.max(1, Math.round((result.totalCustomsTaxesMXN / (result.cashDisbursementTotalMXN || 1)) * 100));
  const pctLogistics = Math.max(1, 100 - pctMerchandise - pctTaxes);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className={`p-6 rounded-2xl border ${isDark ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-white'
        } shadow-xs`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              <Calculator className="h-4 w-4" />
              <span>Simulador Financiero & Costeo de Importación (Landed Cost)</span>
            </div>
            <h2 className="mt-1 text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Cálculo de Impuestos, Incrementables y Costo Contable
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
              Calcula con precisión de Ley Aduanera el Valor en Aduana, IGI, DTA (Art. 49 LFD), IVA acreditable al 16% y separa el flujo de efectivo del costo contable de adquisición.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={handleSaveSimulation}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors shadow-xs"
            >
              <BookmarkPlus className="h-3.5 w-3.5" />
              <span>Guardar Simulación</span>
            </button>

            <button
              onClick={() => window.print()}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                isDark ? 'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700' : 'border-slate-300 bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Download className="h-3.5 w-3.5" />
              <span>Imprimir Reporte</span>
            </button>

            <button
              onClick={handleReset}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                isDark ? 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700' : 'border-slate-300 bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
              title="Restablecer valores predeterminados"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Restablecer</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form Controls (7 cols) */}
        <div className={`lg:col-span-7 p-6 rounded-2xl border space-y-6 ${
          isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-white'
        } shadow-xs`}>
          {/* Section 1: Factura, Divisa y Tratado */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <Coins className="h-4 w-4 text-amber-500" />
              <span>1. Factura Comercial, Moneda & Tratado Comercial</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Especifica la divisa original, tipo de cambio oficial del DOF y preferencias de origen.
            </p>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Valor de Factura */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Monto Factura Comercial
                </label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={invoiceValue}
                  onChange={e => setInvoiceValue(Number(e.target.value) || 0)}
                  className={`w-full px-3 py-2 text-xs font-mono font-bold rounded-lg border outline-none focus:ring-2 focus:ring-amber-500/50 ${
                    isDark ? 'border-slate-700 bg-slate-800 text-white' : 'border-slate-300 bg-slate-50 text-slate-900'
                  }`}
                />
              </div>

              {/* Moneda de Facturación */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Moneda de Facturación
                </label>
                <select
                  value={currency}
                  onChange={e => handleCurrencyChange(e.target.value as InvoiceCurrency)}
                  className={`w-full px-3 py-2 text-xs font-semibold rounded-lg border outline-none focus:ring-2 focus:ring-amber-500/50 ${
                    isDark ? 'border-slate-700 bg-slate-800 text-amber-400' : 'border-slate-300 bg-slate-50 text-amber-900'
                  }`}
                >
                  <option value="USD">USD - Dólar Estadounidense</option>
                  <option value="EUR">EUR - Euro Europeo</option>
                  <option value="CNY">CNY - Yuan Chino (Renminbi)</option>
                  <option value="MXN">MXN - Peso Mexicano</option>
                </select>
              </div>

              {/* Tipo de Cambio DOF */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  TC Oficial DOF ({currency} → MXN)
                </label>
                <input
                  type="number"
                  min="0.001"
                  step="0.01"
                  value={exchangeRateToMXN}
                  onChange={e => setExchangeRateToMXN(Number(e.target.value) || 1)}
                  className={`w-full px-3 py-2 text-xs font-mono rounded-lg border outline-none focus:ring-2 focus:ring-amber-500/50 ${
                    isDark ? 'border-slate-700 bg-slate-800 text-white' : 'border-slate-300 bg-slate-50 text-slate-900'
                  }`}
                />
              </div>
            </div>

            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* País de Origen */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  País de Origen de la Mercancía
                </label>
                <select
                  value={originCountry}
                  onChange={e => setOriginCountry(e.target.value)}
                  className={`w-full px-3 py-2 text-xs rounded-lg border outline-none focus:ring-2 focus:ring-amber-500/50 ${
                    isDark ? 'border-slate-700 bg-slate-800 text-white' : 'border-slate-300 bg-slate-50 text-slate-900'
                  }`}
                >
                  <option value="China">China (Principal origen manufactura)</option>
                  <option value="Estados Unidos">Estados Unidos (Sujeto a T-MEC)</option>
                  <option value="Canadá">Canadá (Sujeto a T-MEC)</option>
                  <option value="Alemania">Alemania (Sujeto a TLCUEM)</option>
                  <option value="Japón">Japón (Sujeto a TIPAT / AAEMJ)</option>
                  <option value="Corea del Sur">Corea del Sur</option>
                  <option value="Vietnam">Vietnam (Sujeto a TIPAT)</option>
                  <option value="Brasil">Brasil (Acuerdo ACE 55)</option>
                </select>
              </div>

              {/* Tratado Comercial / Preferencia */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Preferencia Arancelaria / Tratado (TLC)
                </label>
                <select
                  value={tradeAgreement}
                  onChange={e => setTradeAgreement(e.target.value as TradeAgreement)}
                  className={`w-full px-3 py-2 text-xs font-medium rounded-lg border outline-none focus:ring-2 focus:ring-amber-500/50 ${
                    isDark ? 'border-slate-700 bg-slate-800 text-white' : 'border-slate-300 bg-slate-50 text-slate-900'
                  }`}
                >
                  <option value="GENERAL">Tasa General LIGIE (Sin Tratado)</option>
                  <option value="TMEC">T-MEC (EE.UU. / Canadá - IGI 0% y DTA Fijo)</option>
                  <option value="TLCUEM">TLCUEM (Unión Europea - Certificado EUR.1)</option>
                  <option value="TIPAT">TIPAT / CPTPP (Asia-Pacífico)</option>
                  <option value="ALIANZA_PACIFICO">Alianza del Pacífico (Chile, Colombia, Perú)</option>
                  <option value="PROSEC">Programa PROSEC (Sectorial 0% - 5%)</option>
                  <option value="REGLA_8VA">Regla 8va (Fracción 9802 - Insumos no producidos)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Fracción Arancelaria & Incoterm */}
          <div className="border-t pt-5 border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <Scale className="h-4 w-4 text-amber-500" />
              <span>2. Clasificación Arancelaria (TIGIE + NICO) & Incoterm</span>
            </h3>

            <div className="mt-3">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Fracción Arancelaria de Referencia
              </label>
              <select
                value={selectedTariff}
                onChange={e => handleSelectTariff(e.target.value)}
                className={`w-full px-3 py-2 text-xs font-mono rounded-lg border outline-none focus:ring-2 focus:ring-amber-500/50 ${
                  isDark ? 'border-slate-700 bg-slate-800 text-white' : 'border-slate-300 bg-slate-50 text-slate-900'
                }`}
              >
                {COMMON_TARIFFS.map(t => (
                  <option key={t.hsCode} value={t.hsCode}>
                    {t.hsCode}.{t.nico} - {t.description.substring(0, 60)}... (IGI General: {t.igiPercent}%)
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Incoterm */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Incoterm 2020 Pactado
                </label>
                <select
                  value={incoterm}
                  onChange={e => setIncoterm(e.target.value)}
                  className={`w-full px-3 py-2 text-xs font-semibold rounded-lg border outline-none focus:ring-2 focus:ring-amber-500/50 ${
                    isDark ? 'border-slate-700 bg-slate-800 text-amber-400' : 'border-slate-300 bg-slate-50 text-amber-900'
                  }`}
                >
                  <option value="EXW">EXW - En Fábrica (Máx. Incrementables obligatorios)</option>
                  <option value="FCA">FCA - Franco Porteador (Recomendado Contenedores/Aéreo)</option>
                  <option value="FOB">FOB - Franco a Bordo (Marítimo Convencional)</option>
                  <option value="CFR">CFR - Costo y Flete</option>
                  <option value="CIF">CIF - Costo, Seguro y Flete (Marítimo - Seguro Cláusula C)</option>
                  <option value="CPT">CPT - Transporte Pagado Hasta</option>
                  <option value="CIP">CIP - Transporte y Seguro Pagados (Multimodal - Cláusula A)</option>
                  <option value="DAP">DAP - Entregado en Lugar Convenido</option>
                  <option value="DDP">DDP - Entregado con Derechos Pagados</option>
                </select>
              </div>

              {/* Tasa IGI aplicada */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Tasa IGI / Arancel Aplicable (%)
                  </label>
                  {tradeAgreement !== 'GENERAL' && (
                    <span className="text-[10px] text-emerald-500 font-medium">
                      Exención por {tradeAgreement}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={customIgiRate}
                    onChange={e => {
                      setCustomIgiRate(Number(e.target.value) || 0);
                      setUseCustomIgi(true);
                    }}
                    className={`w-full px-3 py-2 text-xs font-mono rounded-lg border outline-none focus:ring-2 focus:ring-amber-500/50 ${
                      isDark ? 'border-slate-700 bg-slate-800 text-white' : 'border-slate-300 bg-slate-50 text-slate-900'
                    }`}
                  />
                  <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 text-xs">%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Incrementables (Art. 65 LA) */}
          <div className="border-t pt-5 border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <Truck className="h-4 w-4 text-amber-500" />
              <span>3. Gastos Incrementables en Origen & Tránsito (Art. 65 LA)</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Gastos a cargo del importador devengados antes de que la mercancía cruce la aduana mexicana.
            </p>

            <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Flete Internacional (USD)
                </label>
                <input
                  type="number"
                  min="0"
                  value={freightUSD}
                  onChange={e => setFreightUSD(Number(e.target.value) || 0)}
                  className={`w-full px-2.5 py-1.5 text-xs font-mono rounded-md border ${
                    isDark ? 'border-slate-700 bg-slate-800 text-white' : 'border-slate-300 bg-slate-50'
                  }`}
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Seguro de Carga (USD)
                </label>
                <input
                  type="number"
                  min="0"
                  value={insuranceUSD}
                  onChange={e => setInsuranceUSD(Number(e.target.value) || 0)}
                  className={`w-full px-2.5 py-1.5 text-xs font-mono rounded-md border ${
                    isDark ? 'border-slate-700 bg-slate-800 text-white' : 'border-slate-300 bg-slate-50'
                  }`}
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Embalajes/Envases (USD)
                </label>
                <input
                  type="number"
                  min="0"
                  value={packagingUSD}
                  onChange={e => setPackagingUSD(Number(e.target.value) || 0)}
                  className={`w-full px-2.5 py-1.5 text-xs font-mono rounded-md border ${
                    isDark ? 'border-slate-700 bg-slate-800 text-white' : 'border-slate-300 bg-slate-50'
                  }`}
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Maniobras Origen (USD)
                </label>
                <input
                  type="number"
                  min="0"
                  value={handlingUSD}
                  onChange={e => setHandlingUSD(Number(e.target.value) || 0)}
                  className={`w-full px-2.5 py-1.5 text-xs font-mono rounded-md border ${
                    isDark ? 'border-slate-700 bg-slate-800 text-white' : 'border-slate-300 bg-slate-50'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Section 4: Logística Nacional, Unidades & Margen */}
          <div className="border-t pt-5 border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <PackageCheck className="h-4 w-4 text-amber-500" />
              <span>4. Maniobras Portuarias, Última Milla & Margen Comercial</span>
            </h3>

            <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Unidades del Lote (Pzas)
                </label>
                <input
                  type="number"
                  min="1"
                  value={unitsCount}
                  onChange={e => setUnitsCount(Number(e.target.value) || 1)}
                  className={`w-full px-2.5 py-1.5 text-xs font-mono rounded-md border ${
                    isDark ? 'border-slate-700 bg-slate-800 text-white' : 'border-slate-300 bg-slate-50'
                  }`}
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Almacenaje/Puerto (MXN)
                </label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={storagePortMXN}
                  onChange={e => setStoragePortMXN(Number(e.target.value) || 0)}
                  className={`w-full px-2.5 py-1.5 text-xs font-mono rounded-md border ${
                    isDark ? 'border-slate-700 bg-slate-800 text-white' : 'border-slate-300 bg-slate-50'
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
                  onChange={e => setLastMileDeliveryMXN(Number(e.target.value) || 0)}
                  className={`w-full px-2.5 py-1.5 text-xs font-mono rounded-md border ${
                    isDark ? 'border-slate-700 bg-slate-800 text-white' : 'border-slate-300 bg-slate-50'
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
                  onChange={e => setTargetMarginPercent(Number(e.target.value) || 35)}
                  className={`w-full px-2.5 py-1.5 text-xs font-mono rounded-md border ${
                    isDark ? 'border-slate-700 bg-slate-800 text-white' : 'border-slate-300 bg-slate-50'
                  }`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Consolidated Financial Results (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Main Comparison Card: Desembolso vs Costo Contable */}
          <div className={`p-6 rounded-2xl border ${
            isDark ? 'border-amber-500/30 bg-slate-900/90' : 'border-amber-300 bg-amber-50/40'
          } shadow-sm space-y-4`}>
            <div>
              <div className="text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                Dictamen Financiero & Contable
              </div>
              <div className="mt-1 text-2xl sm:text-3xl font-extrabold font-mono tabular-nums text-slate-900 dark:text-white">
                ${result.cashDisbursementTotalMXN.toLocaleString()} <span className="text-xs font-normal text-slate-500">MXN</span>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Flujo total de tesorería requerido para importar y recibir el lote
              </div>
            </div>

            {/* Key Accounting Distinction Box */}
            <div className={`p-4 rounded-xl border ${
              isDark ? 'border-emerald-500/30 bg-emerald-950/20' : 'border-emerald-300 bg-emerald-50'
            }`}>
              <div className="flex items-center justify-between text-xs font-bold text-emerald-700 dark:text-emerald-400">
                <span>Costo Contable Neto de Inventario:</span>
                <span className="font-mono text-sm">${result.accountingInventoryCostMXN.toLocaleString()} MXN</span>
              </div>
              <div className="mt-1 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                <strong>Regla Fiscal:</strong> Se descuentan <strong>${result.creditableIvaTotalMXN.toLocaleString()} MXN</strong> de IVA pagado en aduana, ya que es un impuesto 100% acreditable ante el SAT (Arts. 1, 4 y 5 LIVA) y no forma parte del costo de venta del producto.
              </div>
            </div>

            {/* Per Unit Metrics */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className={`p-3 rounded-xl border ${
                isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-white border-amber-200/80'
              }`}>
                <div className="text-[11px] text-slate-500">Costo Unitario Real</div>
                <div className="text-base font-bold font-mono tabular-nums text-slate-900 dark:text-white">
                  ${result.costPerUnitMXN.toLocaleString()} <span className="text-[10px] font-normal">MXN</span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  (${result.costPerUnitUSD} USD / pza)
                </div>
              </div>

              <div className={`p-3 rounded-xl border ${
                isDark ? 'bg-amber-500/10 border-amber-500/30' : 'bg-amber-100/60 border-amber-300'
              }`}>
                <div className="text-[11px] text-amber-800 dark:text-amber-300 font-semibold">Precio Venta Sugerido</div>
                <div className="text-base font-bold font-mono tabular-nums text-amber-900 dark:text-amber-400">
                  ${result.suggestedSalePriceMXN.toLocaleString()} <span className="text-[10px] font-normal">MXN</span>
                </div>
                <div className="text-[10px] text-amber-700 dark:text-amber-400 font-medium">
                  Margen: +${result.suggestedMarginAmountMXN.toLocaleString()} ({targetMarginPercent}%)
                </div>
              </div>
            </div>

            {/* Visual Bar of Flow */}
            <div>
              <div className="flex justify-between text-[11px] text-slate-500 font-medium mb-1.5">
                <span>Composición del Desembolso</span>
                <span className="font-mono">{pctMerchandise}% Mercancía · {pctTaxes}% Impuestos</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-slate-200 dark:bg-slate-800 flex overflow-hidden">
                <div style={{ width: `${pctMerchandise}%` }} className="bg-blue-500" title={`Mercancía: ${pctMerchandise}%`} />
                <div style={{ width: `${pctTaxes}%` }} className="bg-amber-500" title={`Impuestos y derechos: ${pctTaxes}%`} />
                <div style={{ width: `${pctLogistics}%` }} className="bg-emerald-500" title={`Logística y Agente: ${pctLogistics}%`} />
              </div>
            </div>

            {/* Fast Table of Customs Lines */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Valor Comercial ({currency}):</span>
                <span className="font-mono tabular-nums">${result.commercialValueMXN.toLocaleString()} MXN</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Incrementables Art. 65 LA:</span>
                <span className="font-mono tabular-nums">${result.incrementablesMXN.toLocaleString()} MXN</span>
              </div>
              <div className="flex justify-between font-bold text-slate-900 dark:text-white pt-1 border-t border-slate-200 dark:border-slate-800">
                <span>Valor en Aduana Declarado:</span>
                <span className="font-mono tabular-nums text-amber-600 dark:text-amber-400">
                  ${result.customsValueMXN.toLocaleString()} MXN
                </span>
              </div>

              <div className="pl-3 border-l-2 border-amber-500/40 space-y-1 my-1 text-[11px]">
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>IGI ({result.igiRateAppliedPercent}%):</span>
                  <span className="font-mono tabular-nums">${result.igiAmountMXN.toLocaleString()} MXN</span>
                </div>
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>DTA Art. 49 LFD:</span>
                  <span className="font-mono tabular-nums">${result.dtaAmountMXN.toLocaleString()} MXN</span>
                </div>
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>IVA de Importación (16%):</span>
                  <span className="font-mono tabular-nums font-semibold text-emerald-600 dark:text-emerald-400">
                    ${result.ivaAmountMXN.toLocaleString()} MXN
                  </span>
                </div>
              </div>

              <div className="flex justify-between font-semibold text-red-600 dark:text-red-400 pt-1 border-t border-slate-200 dark:border-slate-800">
                <span>Total Impuestos en Pedimento:</span>
                <span className="font-mono tabular-nums">
                  ${result.totalCustomsTaxesMXN.toLocaleString()} MXN
                </span>
              </div>
            </div>
          </div>

          {/* Alexa's Note on Creditable VAT */}
          <div className={`p-4 rounded-xl border ${isDark ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-white'}`}>
            <div className="flex items-start gap-3">
              <img
                src={alexaAvatar}
                alt="Alexa Sánchez"
                className="h-9 w-9 rounded-full object-cover shrink-0"
                referrerPolicy="no-referrer"
              />
              <div className="text-xs">
                <div className="font-semibold text-slate-900 dark:text-white">
                  Consejo Contable de Alexa:
                </div>
                <p className="mt-1 text-slate-600 dark:text-slate-300 leading-relaxed">
                  "No cometas el error de cargar el IVA de aduana al costo de tu producto. Al ser acreditable contra tus ventas gravadas en México, cargarlo al costo inflaría artificialmente tu precio de venta haciéndote perder competitividad."
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs View: Detailed Formulas Breakdown vs Simulation History */}
      <div className={`p-6 rounded-2xl border ${
        isDark ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-white'
      } shadow-xs`}>
        <div className="flex border-b border-slate-200 dark:border-slate-800 gap-4 mb-4">
          <button
            onClick={() => setActiveTab('SUMMARY')}
            className={`pb-2.5 text-xs font-bold border-b-2 transition-colors ${
              activeTab === 'SUMMARY'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Fórmulas Matemáticas & Fundamentos Legales
          </button>
          <button
            onClick={() => setActiveTab('HISTORY')}
            className={`pb-2.5 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'HISTORY'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <span>Historial de Simulaciones Guardadas</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500/10 text-amber-500">
              {savedSimulations.length}
            </span>
          </button>
        </div>

        {activeTab === 'SUMMARY' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className={`border-b text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider ${
                isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <tr>
                  <th className="py-3 px-4">Concepto Liquidado</th>
                  <th className="py-3 px-4 text-right">Monto (MXN)</th>
                  <th className="py-3 px-4">Fórmula Aplicada</th>
                  <th className="py-3 px-4">Fundamento Jurídico</th>
                  <th className="py-3 px-4">Tipo Contable</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80">
                {result.breakdown.map((line, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                      {line.concept}
                      {line.warningNote && (
                        <div className="text-[10px] text-amber-600 dark:text-amber-400 font-normal mt-0.5">
                          ⚠️ {line.warningNote}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums font-bold text-slate-800 dark:text-slate-200">
                      ${line.amountMXN.toLocaleString()} MXN
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                      {line.formula}
                    </td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400 text-[11px]">
                      {line.legalBasis}
                    </td>
                    <td className="py-3 px-4">
                      {line.isCreditableTax ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-500">
                          Impuesto Acreditable
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          Costo del Bien
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'HISTORY' && (
          <div>
            {savedSimulations.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                No hay simulaciones guardadas aún. Realiza una corrida y haz clic en "Guardar Simulación".
              </div>
            ) : (
              <div className="space-y-3">
                {savedSimulations.map(sim => (
                  <div
                    key={sim.id}
                    className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                      isDark ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200 bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400">
                          {sim.id}
                        </span>
                        <span className="text-[11px] text-slate-400">· {sim.date}</span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-slate-200 dark:bg-slate-800">
                          {sim.incoterm}
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-slate-900 dark:text-white mt-1">
                        {sim.productDescription}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Factura: {sim.invoiceValue.toLocaleString()} {sim.currency} | Tratado: {sim.agreement}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 self-end sm:self-center">
                      <div className="text-right">
                        <div className="text-[10px] text-slate-400">Costo Unitario</div>
                        <div className="text-sm font-bold font-mono text-slate-900 dark:text-white">
                          ${sim.costPerUnitMXN.toLocaleString()} MXN
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteSimulation(sim.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                        title="Eliminar del historial"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
