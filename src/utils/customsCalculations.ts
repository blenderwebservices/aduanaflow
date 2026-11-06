/**
 * AduanaFlow - Motor de Cálculo Aduanal y Costeo Integral de Importación (Landed Cost)
 * Basado en la Ley Aduanera mexicana (Arts. 64, 65, 66), Ley Federal de Derechos (Art. 49),
 * Ley del Impuesto al Valor Agregado (Arts. 24 al 28) y Código Fiscal de la Federación.
 */

export type InvoiceCurrency = 'USD' | 'EUR' | 'CNY' | 'MXN';

export type TradeAgreement = 'GENERAL' | 'TMEC' | 'TLCUEM' | 'TIPAT' | 'ALIANZA_PACIFICO' | 'PROSEC' | 'REGLA_8VA';

export interface LandedCostInput {
  // Factura y divisas
  invoiceValue?: number;
  currency?: InvoiceCurrency;
  exchangeRateToMXN?: number; // Tipo de cambio oficial DOF a MXN
  exchangeRateToUSD?: number; // Para convertir moneda a USD si no es USD
  originCountry?: string;
  provenanceCountry?: string;

  // Clasificación arancelaria e Incoterm
  hsCode?: string;
  nico?: string;
  incoterm?: string; // EXW, FOB, CIF, DDP, etc.
  tradeAgreement?: TradeAgreement;

  // Incrementables (Art. 65 Ley Aduanera)
  freightUSD?: number;
  insuranceUSD?: number;
  packagingUSD?: number;
  handlingUSD?: number;
  otherIncrementablesUSD?: number;

  // Gravámenes y derechos
  igiRatePercent?: number; // Tasa IGI general o preferencial %
  isDtaFixed?: boolean; // Cuota fija o 8 al millar
  dtaFixedAmountMXN?: number; // Cuota fija Art. 49 LFD
  compensatoryDutyPercent?: number; // Cuota compensatoria %
  prvMXN?: number; // Prevalidación (Anexo 22 / RGCE)
  cntMXN?: number; // Contraprestación

  // Logística y gestión aduanal
  unitsCount?: number;
  brokerFeePercent?: number; // Honorarios Agente Aduanal %
  brokerMinFeeMXN?: number; // Mínimo de honorarios
  storagePortMXN?: number; // Almacenaje en puerto o aeropuerto
  maneuversPortMXN?: number; // Maniobras portuarias / desconsolidación
  lastMileDeliveryMXN?: number; // Flete terrestre nacional a bodega de la PyME
  targetMarginPercent?: number; // Margen comercial deseado sobre costo %

  // Parámetros de compatibilidad previos
  commercialValueUSD?: number;
  exchangeRate?: number;
}

export interface CalculationLineDetail {
  concept: string;
  amountMXN: number;
  amountUSD: number;
  formula: string;
  legalBasis: string;
  warningNote?: string;
  isCreditableTax?: boolean;
}

export interface LandedCostResult {
  // Valores comerciales y aduana
  currency: InvoiceCurrency;
  commercialValueOriginal: number;
  commercialValueUSD: number;
  commercialValueMXN: number;
  incrementablesUSD: number;
  incrementablesMXN: number;
  customsValueUSD: number;
  customsValueMXN: number; // Base gravable Art. 64 Ley Aduanera

  // Contribuciones y derechos
  igiRateAppliedPercent: number;
  igiAmountMXN: number;
  dtaAmountMXN: number;
  compensatoryDutyMXN: number;
  prvAmountMXN: number;
  cntAmountMXN: number;
  ivaBaseMXN: number;
  ivaAmountMXN: number; // 16% sobre base
  totalCustomsTaxesMXN: number; // Suma pagada en pedimento (PE)

  // Gastos de despacho y logística
  brokerFeeMXN: number;
  brokerFeeIvaMXN: number;
  storagePortMXN: number;
  maneuversPortMXN: number;
  lastMileDeliveryMXN: number;

  // Reglas contables clave (Desembolso vs Costo de Adquisición)
  cashDisbursementTotalMXN: number; // Flujo de caja total necesario
  creditableIvaTotalMXN: number; // IVA acreditable ante el SAT (no es costo de producto)
  accountingInventoryCostMXN: number; // Costo contable neto del inventario en balance
  
  // Costos unitarios y precio de venta
  unitsCount: number;
  costPerUnitMXN: number; // Costo unitario neto contable
  costPerUnitUSD: number;
  disbursementPerUnitMXN: number; // Desembolso unitario de flujo
  suggestedSalePriceMXN: number; // Precio de venta antes de IVA sugerido
  suggestedMarginAmountMXN: number;
  taxRatioPercent: number;

  // Desglose técnico y legal detallado por concepto
  breakdown: CalculationLineDetail[];
}

/**
 * Tasas y beneficios arancelarios por Tratado Comercial
 */
export const TRADE_AGREEMENTS_INFO: Record<TradeAgreement, {
  name: string;
  description: string;
  igiExemptionDefault: boolean;
  dtaType: 'FIXED' | 'MILLAR';
  fixedDtaAmount: number;
  legalReference: string;
}> = {
  GENERAL: {
    name: 'Tasa General LIGIE (Sin Tratado)',
    description: 'Arancel general de importación según fracción arancelaria y DTA al 8 al millar.',
    igiExemptionDefault: false,
    dtaType: 'MILLAR',
    fixedDtaAmount: 434,
    legalReference: 'Art. 1 LIGIE y Art. 49 Fracc. I Ley Federal de Derechos.',
  },
  TMEC: {
    name: 'T-MEC (EE.UU. / Canadá)',
    description: 'Arancel preferencial 0% en bienes originarios calificados y exención del 8 al millar de DTA (aplica cuota fija).',
    igiExemptionDefault: true,
    dtaType: 'FIXED',
    fixedDtaAmount: 434,
    legalReference: 'Tratado entre México, EE.UU. y Canadá; Regla 5.1.4 de las RGCE.',
  },
  TLCUEM: {
    name: 'TLCUEM (Unión Europea)',
    description: 'Tratado de Libre Comercio con la Unión Europea. Requiere certificado EUR.1 o declaración en factura con exportador autorizado.',
    igiExemptionDefault: true,
    dtaType: 'MILLAR',
    fixedDtaAmount: 434,
    legalReference: 'Acuerdo de Asociación Económica México - UE.',
  },
  TIPAT: {
    name: 'TIPAT / CPTPP (Asia-Pacífico)',
    description: 'Tratado Integral y Progresista de Asociación Transpacífico (Japón, Vietnam, Australia, Singapur, etc.).',
    igiExemptionDefault: true,
    dtaType: 'MILLAR',
    fixedDtaAmount: 434,
    legalReference: 'Capítulo de Comercio de Mercancías del TIPAT.',
  },
  ALIANZA_PACIFICO: {
    name: 'Alianza del Pacífico (Chile, Colombia, Perú)',
    description: 'Desgravación arancelaria para el 92% de las fracciones arancelarias intrarregionales.',
    igiExemptionDefault: true,
    dtaType: 'MILLAR',
    fixedDtaAmount: 434,
    legalReference: 'Protocolo Adicional al Acuerdo Marco de la Alianza del Pacífico.',
  },
  PROSEC: {
    name: 'PROSEC (Programa de Promoción Sectorial)',
    description: 'Arancel preferencial del 0% al 5% para empresas con programa PROSEC autorizado por Secretaría de Economía.',
    igiExemptionDefault: true,
    dtaType: 'MILLAR',
    fixedDtaAmount: 434,
    legalReference: 'Decreto PROSEC publicado en el DOF.',
  },
  REGLA_8VA: {
    name: 'Regla 8va (Fracción Arancelaria 9802)',
    description: 'Permiso previo de la Secretaría de Economía para importar insumos o maquinaria no producida en México al 0%.',
    igiExemptionDefault: true,
    dtaType: 'FIXED',
    fixedDtaAmount: 434,
    legalReference: 'Regla Complementaria 8ª de la LIGIE.',
  },
};

/**
 * Determina incrementables conforme al Art. 65 de la Ley Aduanera según el Incoterm 2020.
 */
export function calculateIncrementablesUSD(
  incoterm: string,
  freightUSD: number,
  insuranceUSD: number,
  param4?: number,
  param5?: number,
  param6?: number
): number {
  const normInco = (incoterm || 'FOB').toUpperCase().trim();
  let directIncrementables = 0;
  if (param6 !== undefined) {
    // 6 params: (incoterm, freight, insurance, packaging, handling, other)
    directIncrementables = (param4 || 0) + (param5 || 0) + (param6 || 0);
  } else {
    // 4 or 5 params: (incoterm, freight, insurance, handling, other)
    directIncrementables = (param4 || 0) + (param5 || 0);
  }

  // EXW, FCA, FAS, FOB: El flete internacional y seguro NO están en factura comercial -> OBLIGATORIO incrementarlos
  if (['EXW', 'FCA', 'FAS', 'FOB'].includes(normInco)) {
    return (freightUSD || 0) + (insuranceUSD || 0) + directIncrementables;
  }
  // CFR, CPT: El flete ya viene en factura, el seguro y maniobras se incrementan
  if (['CFR', 'CPT'].includes(normInco)) {
    return (insuranceUSD || 0) + directIncrementables;
  }
  // CIF, CIP, DAP, DPU, DDP: Flete y seguro ya pactados en precio pagado
  return directIncrementables;
}

/**
 * Realiza el cálculo riguroso del Landed Cost, separando desembolso financiero y costo contable.
 */
export function calculateLandedCost(input: LandedCostInput): LandedCostResult {
  const currency: InvoiceCurrency = input.currency || 'USD';
  const exchangeRateToMXN = Math.max(0.0001, input.exchangeRateToMXN || input.exchangeRate || 19.85);
  
  // Normalización de valor comercial a USD y MXN
  let commercialValueUSD = 0;
  let commercialValueMXN = 0;
  const invoiceValue = Math.max(0, input.invoiceValue ?? input.commercialValueUSD ?? 0);

  if (currency === 'USD') {
    commercialValueUSD = invoiceValue;
    commercialValueMXN = Math.round(commercialValueUSD * exchangeRateToMXN * 100) / 100;
  } else if (currency === 'MXN') {
    commercialValueMXN = invoiceValue;
    commercialValueUSD = Math.round((commercialValueMXN / exchangeRateToMXN) * 100) / 100;
  } else if (currency === 'EUR') {
    const eurRateToUSD = input.exchangeRateToUSD || 1.08;
    commercialValueUSD = Math.round(invoiceValue * eurRateToUSD * 100) / 100;
    commercialValueMXN = Math.round(commercialValueUSD * exchangeRateToMXN * 100) / 100;
  } else if (currency === 'CNY') {
    const cnyRateToUSD = input.exchangeRateToUSD || 0.14;
    commercialValueUSD = Math.round(invoiceValue * cnyRateToUSD * 100) / 100;
    commercialValueMXN = Math.round(commercialValueUSD * exchangeRateToMXN * 100) / 100;
  }

  const unitsCount = Math.max(1, input.unitsCount || 1);
  const incoterm = (input.incoterm || 'FOB').toUpperCase().trim();
  const agreement = input.tradeAgreement || 'GENERAL';
  const agreementMeta = TRADE_AGREEMENTS_INFO[agreement] || TRADE_AGREEMENTS_INFO.GENERAL;

  // Incrementables
  const packagingUSD = input.packagingUSD || 0;
  const handlingUSD = input.handlingUSD || 0;
  const otherIncUSD = input.otherIncrementablesUSD || 0;
  const freightUSD = input.freightUSD || 0;
  const insuranceUSD = input.insuranceUSD || 0;

  const incrementablesUSD = calculateIncrementablesUSD(
    incoterm,
    freightUSD,
    insuranceUSD,
    packagingUSD,
    handlingUSD,
    otherIncUSD
  );
  const incrementablesMXN = Math.round(incrementablesUSD * exchangeRateToMXN * 100) / 100;

  // Valor en Aduana (Base gravable IGI y DTA) - Art. 64 Ley Aduanera
  const customsValueUSD = Math.round((commercialValueUSD + incrementablesUSD) * 100) / 100;
  const customsValueMXN = Math.round(customsValueUSD * exchangeRateToMXN);

  // 1. IGI (Impuesto General de Importación)
  let igiRateAppliedPercent = input.igiRatePercent || 0;
  if (agreement !== 'GENERAL' && agreementMeta.igiExemptionDefault && input.igiRatePercent === undefined) {
    igiRateAppliedPercent = 0;
  }
  const igiAmountMXN = Math.round(customsValueMXN * (igiRateAppliedPercent / 100));

  // 2. DTA (Derecho de Trámite Aduanero) - Art. 49 LFD
  let dtaAmountMXN = 0;
  const isDtaFixed = input.isDtaFixed ?? (agreementMeta.dtaType === 'FIXED');
  if (isDtaFixed) {
    dtaAmountMXN = input.dtaFixedAmountMXN ?? agreementMeta.fixedDtaAmount;
  } else {
    // 8 al millar sobre valor aduana con cuota mínima legal ($434 MXN vigente)
    const dtaMillar = Math.round(customsValueMXN * 0.008);
    dtaAmountMXN = Math.max(434, dtaMillar);
  }

  // 3. Cuotas Compensatorias
  const compensatoryRate = (input.compensatoryDutyPercent || 0) / 100;
  const compensatoryDutyMXN = Math.round(customsValueMXN * compensatoryRate);

  // 4. Prevalidación (PRV) y Contraprestación (CNT)
  const prvAmountMXN = input.prvMXN ?? 310;
  const cntAmountMXN = input.cntMXN ?? 80;

  // 5. IVA de Importación - Art. 27 Ley del IVA
  // Base gravable de IVA = Valor en Aduana + IGI + DTA + Cuotas compensatorias
  const ivaBaseMXN = customsValueMXN + igiAmountMXN + dtaAmountMXN + compensatoryDutyMXN;
  const ivaAmountMXN = Math.round(ivaBaseMXN * 0.16);

  // Total contribuciones pagadas en pedimento
  const totalCustomsTaxesMXN = igiAmountMXN + dtaAmountMXN + compensatoryDutyMXN + prvAmountMXN + cntAmountMXN + ivaAmountMXN;

  // 6. Honorarios del Agente Aduanal (con su IVA 16% respectivo)
  const brokerRate = (input.brokerFeePercent ?? 0.45) / 100;
  const minBroker = input.brokerMinFeeMXN ?? 4200;
  const brokerFeeSubtotalMXN = Math.round(Math.max(minBroker, customsValueMXN * brokerRate));
  const brokerFeeIvaMXN = Math.round(brokerFeeSubtotalMXN * 0.16);
  const brokerFeeTotalMXN = brokerFeeSubtotalMXN + brokerFeeIvaMXN;

  // 7. Almacenaje, maniobras y transporte nacional (última milla)
  const storagePortMXN = Math.round(input.storagePortMXN ?? 1800);
  const maneuversPortMXN = Math.round(input.maneuversPortMXN ?? 1500);
  const lastMileDeliveryMXN = Math.round(input.lastMileDeliveryMXN ?? 4200);

  // Desembolso de flete y seguro internacional pagado por fuera (si no venía en la factura comercial)
  const externalFreightInsuranceMXN = ['EXW', 'FCA', 'FAS', 'FOB'].includes(incoterm)
    ? incrementablesMXN
    : 0;

  // TOTAL DESEMBOLSO DE EFECTIVO (Flujo de tesorería requerido)
  const cashDisbursementTotalMXN = Math.round(
    commercialValueMXN +
    externalFreightInsuranceMXN +
    totalCustomsTaxesMXN +
    brokerFeeTotalMXN +
    storagePortMXN +
    maneuversPortMXN +
    lastMileDeliveryMXN
  );

  // TOTAL IVA ACREDITABLE ANTE EL SAT (IVA del pedimento + IVA de honorarios)
  // Conforme a los Artículos 1, 4 y 5 de la Ley del IVA, este monto se acredita contra el IVA cobrado
  const creditableIvaTotalMXN = ivaAmountMXN + brokerFeeIvaMXN;

  // COSTO NETO CONTABLE DE ADQUISICIÓN DEL INVENTARIO (Sin IVA acreditable)
  // Este es el costo real que entra al balance general y con el que se fija el precio de venta
  const accountingInventoryCostMXN = Math.round(cashDisbursementTotalMXN - creditableIvaTotalMXN);

  const costPerUnitMXN = Math.round((accountingInventoryCostMXN / unitsCount) * 100) / 100;
  const costPerUnitUSD = Math.round((costPerUnitMXN / exchangeRateToMXN) * 100) / 100;
  const disbursementPerUnitMXN = Math.round((cashDisbursementTotalMXN / unitsCount) * 100) / 100;

  // Margen comercial y precio de venta sugerido
  const targetMargin = Math.min(0.95, Math.max(0.05, (input.targetMarginPercent ?? 35) / 100));
  // Precio de venta sugerido (antes de IVA de venta al consumidor final) = Costo / (1 - Margen)
  const suggestedSalePriceMXN = Math.round((costPerUnitMXN / (1 - targetMargin)) * 100) / 100;
  const suggestedMarginAmountMXN = Math.round((suggestedSalePriceMXN - costPerUnitMXN) * 100) / 100;

  const taxRatioPercent = commercialValueMXN > 0
    ? Math.round((totalCustomsTaxesMXN / commercialValueMXN) * 1000) / 10
    : 0;

  // Desglose técnico de fórmulas y fundamentos legales
  const breakdown: CalculationLineDetail[] = [
    {
      concept: 'Valor Comercial de la Mercancía',
      amountMXN: commercialValueMXN,
      amountUSD: commercialValueUSD,
      formula: `Factura ${currency} (${invoiceValue.toLocaleString()}) * TC DOF ($${exchangeRateToMXN.toFixed(4)})`,
      legalBasis: 'Art. 64 de la Ley Aduanera (Precio pagado o por pagar)',
    },
    {
      concept: `Incrementables (${incoterm})`,
      amountMXN: incrementablesMXN,
      amountUSD: incrementablesUSD,
      formula: ['EXW', 'FCA', 'FOB'].includes(incoterm)
        ? `Flete ($${freightUSD}) + Seguro ($${insuranceUSD}) + Maniobras/Embalaje ($${handlingUSD + packagingUSD})`
        : `Maniobras y gastos conexos en origen ($${handlingUSD + packagingUSD})`,
      legalBasis: 'Art. 65 Fracc. I de la Ley Aduanera (Gastos a cargo del importador no incluidos en factura)',
      warningNote: ['EXW', 'FOB'].includes(incoterm) && incrementablesUSD === 0
        ? 'Alerta: Si el Incoterm es FOB o EXW y no se declaran fletes/seguros, la autoridad tipifica subvaluación.'
        : undefined,
    },
    {
      concept: 'Valor en Aduana (Base Gravable)',
      amountMXN: customsValueMXN,
      amountUSD: customsValueUSD,
      formula: `Valor Comercial ($${commercialValueUSD.toLocaleString()} USD) + Incrementables ($${incrementablesUSD.toLocaleString()} USD) * TC`,
      legalBasis: 'Art. 64 y 65 de la Ley Aduanera (Base del IGI y DTA)',
    },
    {
      concept: `IGI (Impuesto General de Importación: ${igiRateAppliedPercent}%)`,
      amountMXN: igiAmountMXN,
      amountUSD: Math.round((igiAmountMXN / exchangeRateToMXN) * 100) / 100,
      formula: `Valor en Aduana ($${customsValueMXN.toLocaleString()} MXN) * ${igiRateAppliedPercent}%`,
      legalBasis: `${agreementMeta.legalReference} Tratado: ${agreementMeta.name}`,
    },
    {
      concept: `DTA (Derecho de Trámite Aduanero: ${isDtaFixed ? 'Cuota Fija' : '8 al millar'})`,
      amountMXN: dtaAmountMXN,
      amountUSD: Math.round((dtaAmountMXN / exchangeRateToMXN) * 100) / 100,
      formula: isDtaFixed
        ? `Cuota fija conforme al tratado o régimen especial: $${dtaAmountMXN} MXN`
        : `Max($434 cuota mínima legal, Valor en Aduana * 0.008) = $${dtaAmountMXN.toLocaleString()} MXN`,
      legalBasis: 'Art. 49 de la Ley Federal de Derechos (LFD)',
    },
    {
      concept: 'IVA de Importación (16%)',
      amountMXN: ivaAmountMXN,
      amountUSD: Math.round((ivaAmountMXN / exchangeRateToMXN) * 100) / 100,
      formula: `[Valor en Aduana ($${customsValueMXN.toLocaleString()}) + IGI ($${igiAmountMXN.toLocaleString()}) + DTA ($${dtaAmountMXN.toLocaleString()})] * 16%`,
      legalBasis: 'Art. 24 y 27 de la Ley del IVA (Base gravable integrada)',
      warningNote: 'Impuesto 100% acreditable fiscalmente en la declaración mensual del SAT. No constituye costo de venta.',
      isCreditableTax: true,
    },
    {
      concept: 'Prevalidación (PRV) y Contraprestación (CNT)',
      amountMXN: prvAmountMXN + cntAmountMXN,
      amountUSD: Math.round(((prvAmountMXN + cntAmountMXN) / exchangeRateToMXN) * 100) / 100,
      formula: `Prevalidación ($${prvAmountMXN} MXN) + Contraprestación ($${cntAmountMXN} MXN)`,
      legalBasis: 'Art. 16-A y 16-B de la Ley Aduanera y Regla 1.8.2 de las RGCE',
    },
    {
      concept: 'Honorarios Agente Aduanal + IVA',
      amountMXN: brokerFeeTotalMXN,
      amountUSD: Math.round((brokerFeeTotalMXN / exchangeRateToMXN) * 100) / 100,
      formula: `Honorarios ($${brokerFeeSubtotalMXN.toLocaleString()} MXN) + IVA 16% ($${brokerFeeIvaMXN.toLocaleString()} MXN)`,
      legalBasis: 'Art. 160 de la Ley Aduanera y arancel privado de servicios aduanales',
      isCreditableTax: false,
    },
    {
      concept: 'Almacenajes, Maniobras y Flete Última Milla',
      amountMXN: storagePortMXN + maneuversPortMXN + lastMileDeliveryMXN,
      amountUSD: Math.round(((storagePortMXN + maneuversPortMXN + lastMileDeliveryMXN) / exchangeRateToMXN) * 100) / 100,
      formula: `Almacenaje ($${storagePortMXN}) + Maniobras ($${maneuversPortMXN}) + Transporte Terrestre ($${lastMileDeliveryMXN})`,
      legalBasis: 'Contratos logísticos y maniobras portuarias en recinto fiscalizado',
    },
  ];

  return {
    currency,
    commercialValueOriginal: invoiceValue,
    commercialValueUSD,
    commercialValueMXN,
    incrementablesUSD,
    incrementablesMXN,
    customsValueUSD,
    customsValueMXN,
    igiRateAppliedPercent,
    igiAmountMXN,
    dtaAmountMXN,
    compensatoryDutyMXN,
    prvAmountMXN,
    cntAmountMXN,
    ivaBaseMXN,
    ivaAmountMXN,
    totalCustomsTaxesMXN,
    brokerFeeMXN: brokerFeeSubtotalMXN,
    brokerFeeIvaMXN,
    storagePortMXN,
    maneuversPortMXN,
    lastMileDeliveryMXN,
    cashDisbursementTotalMXN,
    creditableIvaTotalMXN,
    accountingInventoryCostMXN,
    unitsCount,
    costPerUnitMXN,
    costPerUnitUSD,
    disbursementPerUnitMXN,
    suggestedSalePriceMXN,
    suggestedMarginAmountMXN,
    taxRatioPercent,
    breakdown,
  };
}

export interface TariffCategory {
  hsCode: string;
  nico: string;
  description: string;
  igiPercent: number;
  unit: string;
  regulations: string[];
}

export const COMMON_TARIFFS: TariffCategory[] = [
  {
    hsCode: '8471.30.01',
    nico: '00',
    description: 'Máquinas automáticas para tratamiento de datos, portátiles (Laptops/Notebooks)',
    igiPercent: 0,
    unit: 'Pieza',
    regulations: ['NOM-001-SCFI-2018 (Seguridad electrónica)', 'NOM-019-SCFI-1998 (Equipo periférico)', 'NOM-024-SCFI-2013 (Garantías)'],
  },
  {
    hsCode: '6109.10.01',
    nico: '01',
    description: 'T-shirts y camisetas interiores de punto de algodón para hombres o niños',
    igiPercent: 25,
    unit: 'Pieza',
    regulations: ['Padrón Sectorial Textil y Confección', 'NOM-004-SE-2021 (Información comercial textiles)', 'Etiquetado en español'],
  },
  {
    hsCode: '6403.99.99',
    nico: '99',
    description: 'Calzado con suela de caucho, plástico y parte superior de cuero natural',
    igiPercent: 25,
    unit: 'Par',
    regulations: ['Padrón Sectorial Calzado', 'Precios Estimados SAT', 'NOM-020-SCFI-1997'],
  },
  {
    hsCode: '8528.52.01',
    nico: '01',
    description: 'Monitores capaces de conectarse directamente a una máquina automática para tratamiento de datos',
    igiPercent: 0,
    unit: 'Pieza',
    regulations: ['NOM-019-SCFI-1998', 'NOM-024-SCFI-2013'],
  },
  {
    hsCode: '8708.29.99',
    nico: '99',
    description: 'Partes y accesorios de carrocería para vehículos automóviles',
    igiPercent: 10,
    unit: 'Pieza',
    regulations: ['NOM-119-SCFI-2000 (Cinturones de seguridad)', 'Certificado de Origen T-MEC'],
  },
  {
    hsCode: '9503.00.99',
    nico: '03',
    description: 'Juguetes de material plástico con motor eléctrico o mecanismo',
    igiPercent: 15,
    unit: 'Pieza',
    regulations: ['NOM-015-SCFI-2007 (Juguetes)', 'NOM-252-SSA1-2011 (Límites de plomo/metales pesados)'],
  },
  {
    hsCode: '3923.30.99',
    nico: '01',
    description: 'Bombonas, botellas, frascos y artículos similares de materias plásticas',
    igiPercent: 10,
    unit: 'Kilogramo',
    regulations: ['NOM-050-SCFI-2004 (Información comercial general)'],
  },
  {
    hsCode: '2204.21.99',
    nico: '01',
    description: 'Vino tinto o blanco en recipientes con capacidad menor o igual a 2 litros',
    igiPercent: 20,
    unit: 'Litro',
    regulations: ['Padrón Sectorial Bebidas Alcohólicas', 'Marbetes SAT', 'IEPS 26.5% - 53%', 'NOM-142-SSA1/SCFI-2014'],
  },
];
