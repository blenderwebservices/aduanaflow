/**
 * AduanaFlow - Motor de Cálculo Aduanal y Costeo de Importación (Landed Cost)
 * Basado en la Ley Aduanera mexicana, Ley Federal de Derechos y CFF.
 */

export interface LandedCostInput {
  commercialValueUSD: number;
  exchangeRate: number; // Tipo de cambio DOF (MXN por USD)
  incoterm: string; // EXW, FOB, CIF, DDP, etc.
  freightUSD: number;
  insuranceUSD: number;
  handlingUSD: number;
  otherIncrementablesUSD: number;
  igiRatePercent: number; // Tasa IGI % (0%, 5%, 10%, 15%, 20%, etc.)
  isDtaFixed?: boolean; // Si aplica cuota fija o 8 al millar
  dtaFixedAmountMXN?: number; // Cuota fija de DTA para tratados / regímenes especiales
  prvMXN?: number; // Prevalidación (típicamente $310 - $340 MXN)
  cntMXN?: number; // Contraprestación ($75 - $90 MXN)
  unitsCount: number;
  brokerFeePercent?: number; // Honorarios de agente aduanal % (ej. 0.45%)
  brokerMinFeeMXN?: number;
  lastMileDeliveryMXN?: number; // Flete terrestre nacional hasta la PyME
  targetMarginPercent?: number; // Margen de ganancia comercial deseado %
}

export interface LandedCostResult {
  commercialValueUSD: number;
  commercialValueMXN: number;
  incrementablesUSD: number;
  incrementablesMXN: number;
  customsValueUSD: number; // Valor Aduana en USD
  customsValueMXN: number; // Base gravable para IGI y DTA
  igiAmountMXN: number; // Impuesto General de Importación
  dtaAmountMXN: number; // Derecho de Trámite Aduanero (Art. 49 LFD)
  prvAmountMXN: number; // Prevalidación
  cntAmountMXN: number; // Contraprestación
  ivaBaseMXN: number; // Base gravable de IVA = Valor Aduana + IGI + DTA
  ivaAmountMXN: number; // IVA 16%
  totalCustomsTaxesMXN: number; // Suma de impuestos y derechos aduanales
  brokerFeeMXN: number; // Honorarios de agente aduanal
  lastMileDeliveryMXN: number; // Flete última milla
  totalLandedCostMXN: number; // Costo total puesto en puerta de la PyME
  costPerUnitMXN: number;
  costPerUnitUSD: number;
  suggestedSalePriceMXN: number;
  suggestedMarginAmountMXN: number;
  taxRatioPercent: number; // % que representan los impuestos del valor comercial
}

/**
 * Determina si el Incoterm requiere que el flete y seguro se sumen como incrementables
 * a la factura comercial para determinar el Valor en Aduana.
 * Según Art. 65 de la Ley Aduanera:
 * - EXW, FCA, FAS, FOB: El comprador paga flete y seguro internacional -> SÍ son incrementables.
 * - CFR, CPT: Incluyen flete en la factura, el seguro se incrementa.
 * - CIF, CIP, DAP, DPU, DDP: El precio pagado ya incluye flete y seguro (o parte de ellos).
 */
export function calculateIncrementablesUSD(
  incoterm: string,
  freightUSD: number,
  insuranceUSD: number,
  handlingUSD: number,
  otherIncrementablesUSD: number
): number {
  const normInco = incoterm.toUpperCase().trim();
  const baseOther = (handlingUSD || 0) + (otherIncrementablesUSD || 0);

  if (['EXW', 'FCA', 'FAS', 'FOB'].includes(normInco)) {
    return (freightUSD || 0) + (insuranceUSD || 0) + baseOther;
  }
  if (['CFR', 'CPT'].includes(normInco)) {
    // Flete ya en factura, se suma seguro y otros
    return (insuranceUSD || 0) + baseOther;
  }
  // CIF, CIP, DAP, DPU, DDP: Flete y seguro ya pactados en precio de factura
  return baseOther;
}

/**
 * Realiza el cálculo exhaustivo de costos de importación y despacho aduanal mexicano.
 */
export function calculateLandedCost(input: LandedCostInput): LandedCostResult {
  const commercialValueUSD = Math.max(0, input.commercialValueUSD || 0);
  const exchangeRate = Math.max(0.001, input.exchangeRate || 1);
  const unitsCount = Math.max(1, input.unitsCount || 1);

  const incrementablesUSD = calculateIncrementablesUSD(
    input.incoterm || 'FOB',
    input.freightUSD || 0,
    input.insuranceUSD || 0,
    input.handlingUSD || 0,
    input.otherIncrementablesUSD || 0
  );

  const customsValueUSD = commercialValueUSD + incrementablesUSD;
  const commercialValueMXN = Math.round(commercialValueUSD * exchangeRate * 100) / 100;
  const incrementablesMXN = Math.round(incrementablesUSD * exchangeRate * 100) / 100;
  const customsValueMXN = Math.round(customsValueUSD * exchangeRate * 100) / 100;

  // IGI (Impuesto General de Importación)
  const igiRate = (input.igiRatePercent || 0) / 100;
  const igiAmountMXN = Math.round(customsValueMXN * igiRate);

  // DTA (Derecho de Trámite Aduanero) - Art. 49 LFD
  let dtaAmountMXN = 0;
  if (input.isDtaFixed) {
    dtaAmountMXN = input.dtaFixedAmountMXN ?? 415;
  } else {
    // 8 al millar (0.008) sobre valor aduana, con cuota mínima legal
    const calculatedDTA = Math.round(customsValueMXN * 0.008);
    dtaAmountMXN = Math.max(415, calculatedDTA);
  }

  // Prevalidación y Contraprestación
  const prvAmountMXN = input.prvMXN ?? 310;
  const cntAmountMXN = input.cntMXN ?? 80;

  // Base gravable IVA = Valor Aduana + IGI + DTA
  const ivaBaseMXN = customsValueMXN + igiAmountMXN + dtaAmountMXN;
  const ivaAmountMXN = Math.round(ivaBaseMXN * 0.16);

  // Total contribuciones aduaneras
  const totalCustomsTaxesMXN = igiAmountMXN + dtaAmountMXN + prvAmountMXN + cntAmountMXN + ivaAmountMXN;

  // Honorarios Agente Aduanal (ej. 0.45% de valor aduana o mínimo de $4,500 MXN)
  const brokerRate = (input.brokerFeePercent ?? 0.45) / 100;
  const minBroker = input.brokerMinFeeMXN ?? 4200;
  const brokerFeeMXN = Math.round(Math.max(minBroker, customsValueMXN * brokerRate));

  // Flete de última milla a bodega de la PyME
  const lastMileDeliveryMXN = Math.round(input.lastMileDeliveryMXN ?? 3800);

  // Costo total de adquisición y logística (Landed Cost)
  // Incluye: Factura comercial en MXN + Incrementables (si se pagan aparte) + Impuestos + Agente Aduanal + Última milla
  const totalLandedCostMXN = Math.round(
    commercialValueMXN +
    (['EXW', 'FCA', 'FAS', 'FOB'].includes(input.incoterm?.toUpperCase() || '') ? incrementablesMXN : 0) +
    totalCustomsTaxesMXN +
    brokerFeeMXN +
    lastMileDeliveryMXN
  );

  const costPerUnitMXN = Math.round((totalLandedCostMXN / unitsCount) * 100) / 100;
  const costPerUnitUSD = Math.round((costPerUnitMXN / exchangeRate) * 100) / 100;

  const targetMargin = (input.targetMarginPercent ?? 35) / 100;
  // Precio de venta = Costo / (1 - margen)
  const suggestedSalePriceMXN = targetMargin < 1 
    ? Math.round((costPerUnitMXN / (1 - targetMargin)) * 100) / 100 
    : costPerUnitMXN * 1.5;
  const suggestedMarginAmountMXN = Math.round((suggestedSalePriceMXN - costPerUnitMXN) * 100) / 100;

  const taxRatioPercent = commercialValueMXN > 0
    ? Math.round((totalCustomsTaxesMXN / commercialValueMXN) * 1000) / 10
    : 0;

  return {
    commercialValueUSD,
    commercialValueMXN,
    incrementablesUSD,
    incrementablesMXN,
    customsValueUSD,
    customsValueMXN,
    igiAmountMXN,
    dtaAmountMXN,
    prvAmountMXN,
    cntAmountMXN,
    ivaBaseMXN,
    ivaAmountMXN,
    totalCustomsTaxesMXN,
    brokerFeeMXN,
    lastMileDeliveryMXN,
    totalLandedCostMXN,
    costPerUnitMXN,
    costPerUnitUSD,
    suggestedSalePriceMXN,
    suggestedMarginAmountMXN,
    taxRatioPercent,
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
    description: 'Máquinas automáticas para tratamiento o procesamiento de datos, portátiles (Laptops/Notebooks)',
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
