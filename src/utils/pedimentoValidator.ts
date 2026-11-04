/**
 * AduanaFlow - Auditor y Validador Normativo de Pedimentos Aduanales
 * Verificación según Anexo 22 de las Reglas Generales de Comercio Exterior (RGCE)
 * y Artículos 36, 36-A, 56, 64, 65, 81 de la Ley Aduanera.
 */

export interface PedimentoData {
  numeroPedimento: string; // Formato 15 dígitos: AA DD PPPP R NNNNNN
  clavePedimento: string; // A1, IN, AF, V1, etc.
  tipoOperacion: 'IMP' | 'EXP';
  regimenAduanero: string; // IMD, ITR, DFI, RFE, etc.
  rfcImportador: string;
  nombreImportador: string;
  paisOrigen: string; // Clave 3 letras ISO o nombre (USA, CHN, DEU, etc.)
  paisVendedor: string;
  incoterm: string; // FOB, EXW, CIF, etc.
  tipoCambio: number;
  valorDolares: number; // Valor Comercial USD
  valorAduanaMXN: number; // Valor en Aduana en moneda nacional
  fletesUSD: number;
  segurosUSD: number;
  otrosIncrementablesUSD: number;
  fraccionArancelaria: string; // 8 dígitos
  nico: string; // 2 dígitos
  igiPagadoMXN: number;
  dtaPagadoMXN: number;
  ivaPagadoMXN: number;
  prvPagadoMXN: number;
  cntPagadoMXN: number;
  numBultos: number;
  pesoBrutoKg: number;
  aduanaDespacho: string; // Clave de 2 o 3 dígitos (ej: 470 = AICM, 240 = Nuevo Laredo, 160 = Manzanillo)
  patenteAgente: string; // 4 dígitos
}

export type AuditSeverity = 'CRITICAL' | 'WARNING' | 'INFO' | 'SUCCESS';

export interface AuditIssue {
  field: string;
  severity: AuditSeverity;
  title: string;
  message: string;
  legalReference?: string;
  suggestedAction?: string;
}

export interface PedimentoAuditReport {
  isValid: boolean;
  score: number; // 0 a 100
  criticalCount: number;
  warningCount: number;
  passedCount: number;
  issues: AuditIssue[];
  calculatedExpected: {
    incrementablesUSD: number;
    valorAduanaExpectedMXN: number;
    dtaExpectedMXN: number;
    ivaExpectedMXN: number;
  };
}

export const VALID_CLAVES_PEDIMENTO: Record<string, string> = {
  A1: 'Importación o Exportación definitiva (comercialización o consumo)',
  IN: 'Importación temporal de bienes para retornar en el mismo estado o elaboración por empresas con programa IMMEX',
  AF: 'Importación temporal de activo fijo por empresas con programa IMMEX',
  V1: 'Transferencias de mercancías entre empresas IMMEX o proveedores nacionales',
  K1: 'Desistimiento de régimen aduanero y retorno de mercancías',
  G1: 'Extracción de depósito fiscal para importación definitiva',
  F4: 'Cambio de régimen de importación temporal a definitiva',
  R1: 'Rectificación de pedimento (corrección de datos conforme al Art. 89)',
  RT: 'Retorno de mercancías importadas temporalmente',
};

export const VALID_REGIMENES: Record<string, string> = {
  IMD: 'Definitivo de Importación',
  EXD: 'Definitivo de Exportación',
  ITR: 'Temporal de Importación para retornar en el mismo estado o transformación',
  ETR: 'Temporal de Exportación',
  DFI: 'Depósito Fiscal',
  TRA: 'Tránsito de mercancías (Interno o Internacional)',
  RFE: 'Recinto Fiscalizado Estratégico',
};

export const ADUANAS_MEXICO: Record<string, string> = {
  '16': '160 - Manzanillo, Colima (Marítima)',
  '24': '240 - Nuevo Laredo, Tamaulipas (Fronteriza)',
  '47': '470 - Aeropuerto Internacional de la Ciudad de México (Aérea)',
  '43': '430 - Veracruz, Veracruz (Marítima)',
  '80': '800 - Colombia, Nuevo León (Fronteriza)',
  '40': '400 - Nogales, Sonora (Fronteriza)',
  '20': '200 - Ciudad Juárez, Chihuahua (Fronteriza)',
  '65': '650 - Altamira, Tamaulipas (Marítima)',
  '53': '530 - Cancún, Quintana Roo (Aérea)',
};

/**
 * Valida la sintaxis del número de pedimento de 15 dígitos:
 * 2 dígitos de año + 2 dígitos de aduana + 4 dígitos patente + 1 dígito último año + 6 dígitos numeración progresiva.
 */
export function validatePedimentoNumber(rawNumber: string): {
  valid: boolean;
  cleanNumber: string;
  details?: { year: string; aduana: string; patente: string; yearDigit: string; sequential: string };
  error?: string;
} {
  const clean = rawNumber.replace(/[\s-]/g, '');
  if (!/^\d{15}$/.test(clean)) {
    return {
      valid: false,
      cleanNumber: clean,
      error: `El número de pedimento debe contener exactamente 15 dígitos numéricos (actualmente tiene ${clean.length}).`,
    };
  }

  const year = clean.substring(0, 2);
  const aduana = clean.substring(2, 4);
  const patente = clean.substring(4, 8);
  const yearDigit = clean.substring(8, 9);
  const sequential = clean.substring(9, 15);

  return {
    valid: true,
    cleanNumber: clean,
    details: { year, aduana, patente, yearDigit, sequential },
  };
}

/**
 * Valida el formato del RFC mexicano (12 para PM, 13 para PF)
 */
export function validateRFC(rfc: string): boolean {
  const clean = rfc.toUpperCase().trim();
  // Moral: 3 letras + 6 números (AAMMDD) + 3 caracteres homoclave = 12
  // Física: 4 letras + 6 números (AAMMDD) + 3 caracteres homoclave = 13
  const regexMoral = /^[A-Z&Ñ]{3}\d{6}[A-Z0-9]{3}$/;
  const regexFisica = /^[A-Z&Ñ]{4}\d{6}[A-Z0-9]{3}$/;
  return regexMoral.test(clean) || regexFisica.test(clean);
}

/**
 * Ejecuta una auditoría integral del pedimento aduanal.
 */
export function auditPedimento(data: PedimentoData): PedimentoAuditReport {
  const issues: AuditIssue[] = [];

  // 1. Verificación de estructura del número de pedimento
  const numCheck = validatePedimentoNumber(data.numeroPedimento);
  if (!numCheck.valid) {
    issues.push({
      field: 'numeroPedimento',
      severity: 'CRITICAL',
      title: 'Estructura inválida de número de pedimento',
      message: numCheck.error || 'Formato de 15 dígitos no cumple la regla Anexo 22 SAT.',
      legalReference: 'Anexo 22 de las Reglas Generales de Comercio Exterior, Instructivo de Llenado.',
      suggestedAction: 'Verifique los 15 dígitos: [Año: 2][Aduana: 2][Patente: 4][Último dígito año: 1][Consecutivo: 6].',
    });
  } else {
    // Verificar coherencia entre aduana del número y aduana declarada
    if (data.aduanaDespacho && !data.aduanaDespacho.startsWith(numCheck.details!.aduana)) {
      issues.push({
        field: 'aduanaDespacho',
        severity: 'WARNING',
        title: 'Discrepancia entre Aduana en número y Aduana de despacho',
        message: `Los dígitos 3 y 4 del pedimento indican aduana "${numCheck.details!.aduana}", pero se seleccionó "${data.aduanaDespacho}".`,
        legalReference: 'Anexo 22 RGCE, Campo 1.',
        suggestedAction: 'Corrija la aduana de despacho o el prefijo del pedimento.',
      });
    }

    // Verificar coherencia entre patente del número y patente declarada
    if (data.patenteAgente && numCheck.details!.patente !== data.patenteAgente) {
      issues.push({
        field: 'patenteAgente',
        severity: 'CRITICAL',
        title: 'Patente de Agente Aduanal inconsistente',
        message: `El pedimento indica patente "${numCheck.details!.patente}" pero se declaró "${data.patenteAgente}".`,
        legalReference: 'Art. 159 y 160 Ley Aduanera.',
        suggestedAction: 'Verifique que la patente aduanal autorizada coincida con los dígitos 5 al 8.',
      });
    }
  }

  // 2. Validación de Clave de Pedimento
  const claveNorm = data.clavePedimento?.toUpperCase().trim();
  if (!claveNorm || !VALID_CLAVES_PEDIMENTO[claveNorm]) {
    issues.push({
      field: 'clavePedimento',
      severity: 'CRITICAL',
      title: 'Clave de pedimento no reconocida',
      message: `La clave "${data.clavePedimento}" no es una clave válida del Apéndice 2 del Anexo 22.`,
      legalReference: 'Anexo 22 RGCE, Apéndice 2.',
      suggestedAction: 'Seleccione una clave válida como A1 (Definitivo), IN (IMMEX) o V1.',
    });
  }

  // 3. Validación de RFC
  if (!validateRFC(data.rfcImportador)) {
    issues.push({
      field: 'rfcImportador',
      severity: 'CRITICAL',
      title: 'RFC del importador inválido',
      message: `El RFC "${data.rfcImportador}" no cumple con el formato estándar del SAT (12 caracteres para Persona Moral o 13 para Persona Física).`,
      legalReference: 'Art. 27 del Código Fiscal de la Federación.',
      suggestedAction: 'Revise la Constancia de Situación Fiscal del importador para validar homoclave.',
    });
  }

  // 4. Fracción Arancelaria y NICO
  const cleanFraccion = (data.fraccionArancelaria || '').replace(/\D/g, '');
  if (cleanFraccion.length !== 8) {
    issues.push({
      field: 'fraccionArancelaria',
      severity: 'CRITICAL',
      title: 'Fracción Arancelaria incompleta o inválida',
      message: `La Fracción Arancelaria debe tener exactamente 8 dígitos TIGIE (actualmente tiene ${cleanFraccion.length}).`,
      legalReference: 'Ley de los Impuestos Generales de Importación y de Exportación (LIGIE), Art. 1.',
      suggestedAction: 'Consulte la TIGIE para obtener la subpartida de 8 dígitos.',
    });
  }

  const cleanNico = (data.nico || '').replace(/\D/g, '');
  if (cleanNico.length !== 2) {
    issues.push({
      field: 'nico',
      severity: 'WARNING',
      title: 'Número de Identificación Comercial (NICO) ausente o incompleto',
      message: 'Desde la reforma de modernización arancelaria, el NICO de 2 dígitos es obligatorio.',
      legalReference: 'Publicación DOF 28/08/2020 - Sistema NICO.',
      suggestedAction: 'Agregue el NICO de 2 dígitos correspondiente a la fracción arancelaria.',
    });
  }

  // 5. Coherencia de Incoterm y Determinación de Valor en Aduana (Art. 64 y 65 Ley Aduanera)
  const incoNorm = (data.incoterm || '').toUpperCase().trim();
  const fletes = data.fletesUSD || 0;
  const seguros = data.segurosUSD || 0;
  const otros = data.otrosIncrementablesUSD || 0;
  const totalIncrementablesUSD = fletes + seguros + otros;

  if (['EXW', 'FCA', 'FAS', 'FOB'].includes(incoNorm)) {
    if (totalIncrementablesUSD <= 0) {
      issues.push({
        field: 'incoterm',
        severity: 'CRITICAL',
        title: 'Alerta grave: Omisión de Incrementables (Art. 65 Ley Aduanera)',
        message: `El Incoterm pactado es ${incoNorm}, lo que significa que el comprador contrata el transporte internacional. Declarar $0 en fletes y seguros causa una subvaluación directa del Valor en Aduana y omisión de contribuciones (IGI e IVA).`,
        legalReference: 'Art. 64 y 65 fracción I incisos a) y d) de la Ley Aduanera.',
        suggestedAction: 'Declare los montos reales pagados por flete internacional y seguro según conocimiento de embarque (BL / AWB / Carta Porte) y póliza de seguro.',
      });
    }
  }

  // 6. Verificación de Valor en Aduana
  const tipoCambio = data.tipoCambio || 1;
  const valorComercialUSD = data.valorDolares || 0;
  const expectedValorAduanaUSD = valorComercialUSD + (['EXW', 'FCA', 'FAS', 'FOB'].includes(incoNorm) ? totalIncrementablesUSD : otros);
  const expectedValorAduanaMXN = Math.round(expectedValorAduanaUSD * tipoCambio);

  if (data.tipoOperacion === 'IMP') {
    if (data.valorAduanaMXN < data.valorDolares * tipoCambio) {
      issues.push({
        field: 'valorAduanaMXN',
        severity: 'CRITICAL',
        title: 'Valor en Aduana inferior al Valor Comercial',
        message: `El Valor en Aduana ($${data.valorAduanaMXN?.toLocaleString()} MXN) no puede ser menor a la conversión del Valor Comercial ($${Math.round(valorComercialUSD * tipoCambio)?.toLocaleString()} MXN) en importaciones definitivas.`,
        legalReference: 'Art. 64 Ley Aduanera - Base gravable del impuesto general de importación.',
        suggestedAction: 'Recalcule el Valor en Aduana sumando el precio pagado más los incrementables aplicables.',
      });
    } else if (Math.abs(data.valorAduanaMXN - expectedValorAduanaMXN) > 500) {
      issues.push({
        field: 'valorAduanaMXN',
        severity: 'WARNING',
        title: 'Discrepancia en el cálculo del Valor en Aduana',
        message: `El Valor en Aduana declarado ($${data.valorAduanaMXN?.toLocaleString()} MXN) difiere del esperado ($${expectedValorAduanaMXN.toLocaleString()} MXN) con el tipo de cambio ${tipoCambio} y los incrementables capturados.`,
        legalReference: 'Art. 56 y 81 Ley Aduanera.',
        suggestedAction: 'Verifique si existen decrementables (Art. 66 LA) o ajuste el tipo de cambio oficial del DOF.',
      });
    }
  }

  // 7. Verificación de DTA (Derecho de Trámite Aduanero)
  const dtaEsperado = Math.max(415, Math.round(data.valorAduanaMXN * 0.008));
  if (data.clavePedimento === 'A1' && data.dtaPagadoMXN < 415) {
    issues.push({
      field: 'dtaPagadoMXN',
      severity: 'CRITICAL',
      title: 'Pago de DTA inferior a la cuota mínima de ley',
      message: `El DTA pagado ($${data.dtaPagadoMXN} MXN) es menor a la cuota mínima establecida en el Art. 49 de la Ley Federal de Derechos ($415 MXN).`,
      legalReference: 'Art. 49 fracción I y IV de la Ley Federal de Derechos.',
      suggestedAction: 'Para pedimentos definitivos A1 sin tratado de exención de DTA, aplique la tasa del 8 al millar o la cuota mínima.',
    });
  }

  // 8. Verificación de IVA
  const baseIVAEsperada = data.valorAduanaMXN + (data.igiPagadoMXN || 0) + (data.dtaPagadoMXN || 0);
  const ivaEsperado = Math.round(baseIVAEsperada * 0.16);
  if (data.clavePedimento === 'A1' && Math.abs((data.ivaPagadoMXN || 0) - ivaEsperado) > 200) {
    issues.push({
      field: 'ivaPagadoMXN',
      severity: 'WARNING',
      title: 'Diferencia en cálculo de IVA al 16%',
      message: `El IVA pagado ($${data.ivaPagadoMXN?.toLocaleString()} MXN) difiere del 16% sobre la base gravable aduanal ($${ivaEsperado.toLocaleString()} MXN).`,
      legalReference: 'Art. 24 y 27 de la Ley del Impuesto al Valor Agregado.',
      suggestedAction: 'Verifique si la mercancía está exenta, gravada a tasa 0% (ej. alimentos/medicinas) o si hubo retención.',
    });
  }

  // Si todo está correcto o hay advertencias menores
  const criticalCount = issues.filter(i => i.severity === 'CRITICAL').length;
  const warningCount = issues.filter(i => i.severity === 'WARNING').length;

  let score = 100 - (criticalCount * 30) - (warningCount * 10);
  score = Math.max(0, Math.min(100, score));

  if (criticalCount === 0 && warningCount === 0) {
    issues.push({
      field: 'auditoria',
      severity: 'SUCCESS',
      title: 'Cumplimiento Normativo Exitoso',
      message: 'Todos los campos analizados cumplen satisfactoriamente con la Ley Aduanera y el Anexo 22 de las RGCE.',
      legalReference: 'Conformidad con Art. 36 y 36-A Ley Aduanera.',
    });
  }

  return {
    isValid: criticalCount === 0,
    score,
    criticalCount,
    warningCount,
    passedCount: Math.max(1, 10 - criticalCount - warningCount),
    issues,
    calculatedExpected: {
      incrementablesUSD: totalIncrementablesUSD,
      valorAduanaExpectedMXN: expectedValorAduanaMXN,
      dtaExpectedMXN: dtaEsperado,
      ivaExpectedMXN: ivaEsperado,
    },
  };
}

/**
 * Pedimentos muestra listos para auditar en demostraciones interactivas
 */
export const SAMPLE_PEDIMENTOS: { name: string; description: string; data: PedimentoData }[] = [
  {
    name: 'Pedimento A1 - Cumplimiento Óptimo (Electrónicos)',
    description: 'Importación definitiva vía Manzanillo con fletes y seguros declarados correctamente.',
    data: {
      numeroPedimento: '24 16 3840 4 001928',
      clavePedimento: 'A1',
      tipoOperacion: 'IMP',
      regimenAduanero: 'IMD',
      rfcImportador: 'DTE210419KM8',
      nombreImportador: 'DISTRIBUIDORA TECNOLÓGICA DE OCCIDENTE S.A. DE C.V.',
      paisOrigen: 'CHN',
      paisVendedor: 'CHN',
      incoterm: 'FOB',
      tipoCambio: 19.85,
      valorDolares: 34500,
      valorAduanaMXN: 730480, // (34500 + 2300) * 19.85
      fletesUSD: 1950,
      segurosUSD: 350,
      otrosIncrementablesUSD: 0,
      fraccionArancelaria: '84713001',
      nico: '00',
      igiPagadoMXN: 0, // 0% laptops
      dtaPagadoMXN: 5844, // 8 al millar
      ivaPagadoMXN: 117812, // 16% sobre (730480 + 5844)
      prvPagadoMXN: 310,
      cntPagadoMXN: 80,
      numBultos: 120,
      pesoBrutoKg: 840,
      aduanaDespacho: '160',
      patenteAgente: '3840',
    },
  },
  {
    name: 'Pedimento con Riesgo: EXW sin Flete Declarado',
    description: 'Inconsistencia grave: Incoterm EXW pero fletes y seguros en $0, riesgo de auditoría por subvaluación.',
    data: {
      numeroPedimento: '24 24 3912 4 008472',
      clavePedimento: 'A1',
      tipoOperacion: 'IMP',
      regimenAduanero: 'IMD',
      rfcImportador: 'MIM180312XX9',
      nombreImportador: 'MODA INTERNACIONAL MEXICANA S.A. DE C.V.',
      paisOrigen: 'USA',
      paisVendedor: 'USA',
      incoterm: 'EXW',
      tipoCambio: 19.85,
      valorDolares: 18000,
      valorAduanaMXN: 357300, // No sumó incrementables
      fletesUSD: 0, // ERROR: en EXW debe haber flete internacional
      segurosUSD: 0,
      otrosIncrementablesUSD: 0,
      fraccionArancelaria: '61091001',
      nico: '01',
      igiPagadoMXN: 89325, // 25% IGI sobre base reducida
      dtaPagadoMXN: 2858,
      ivaPagadoMXN: 71917,
      prvPagadoMXN: 310,
      cntPagadoMXN: 80,
      numBultos: 45,
      pesoBrutoKg: 350,
      aduanaDespacho: '240',
      patenteAgente: '3912',
    },
  },
  {
    name: 'Pedimento con Error de Estructura y Patente',
    description: 'Contiene número de 14 dígitos en vez de 15 y patente que no coincide con la cabecera.',
    data: {
      numeroPedimento: '24 47 3120 4 00192', // Solo 14 dígitos
      clavePedimento: 'A1',
      tipoOperacion: 'IMP',
      regimenAduanero: 'IMD',
      rfcImportador: 'PRO19020199', // RFC incompleto
      nombreImportador: 'PROVEEDORA INDUSTRIAL METROPOLITANA S.A.',
      paisOrigen: 'DEU',
      paisVendedor: 'DEU',
      incoterm: 'CIF',
      tipoCambio: 19.85,
      valorDolares: 12500,
      valorAduanaMXN: 248125,
      fletesUSD: 0,
      segurosUSD: 0,
      otrosIncrementablesUSD: 0,
      fraccionArancelaria: '87082999',
      nico: '99',
      igiPagadoMXN: 24813, // 10%
      dtaPagadoMXN: 350, // Menor al mínimo de $415
      ivaPagadoMXN: 43726,
      prvPagadoMXN: 310,
      cntPagadoMXN: 80,
      numBultos: 18,
      pesoBrutoKg: 280,
      aduanaDespacho: '470',
      patenteAgente: '3999', // No coincide con 3120
    },
  },
];
