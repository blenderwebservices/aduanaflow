// server.ts
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

// src/utils/customsCalculations.ts
function calculateIncrementablesUSD(incoterm, freightUSD, insuranceUSD, handlingUSD, otherIncrementablesUSD) {
  const normInco = incoterm.toUpperCase().trim();
  const baseOther = (handlingUSD || 0) + (otherIncrementablesUSD || 0);
  if (["EXW", "FCA", "FAS", "FOB"].includes(normInco)) {
    return (freightUSD || 0) + (insuranceUSD || 0) + baseOther;
  }
  if (["CFR", "CPT"].includes(normInco)) {
    return (insuranceUSD || 0) + baseOther;
  }
  return baseOther;
}
function calculateLandedCost(input) {
  const commercialValueUSD = Math.max(0, input.commercialValueUSD || 0);
  const exchangeRate = Math.max(1e-3, input.exchangeRate || 1);
  const unitsCount = Math.max(1, input.unitsCount || 1);
  const incrementablesUSD = calculateIncrementablesUSD(
    input.incoterm || "FOB",
    input.freightUSD || 0,
    input.insuranceUSD || 0,
    input.handlingUSD || 0,
    input.otherIncrementablesUSD || 0
  );
  const customsValueUSD = commercialValueUSD + incrementablesUSD;
  const commercialValueMXN = Math.round(commercialValueUSD * exchangeRate * 100) / 100;
  const incrementablesMXN = Math.round(incrementablesUSD * exchangeRate * 100) / 100;
  const customsValueMXN = Math.round(customsValueUSD * exchangeRate * 100) / 100;
  const igiRate = (input.igiRatePercent || 0) / 100;
  const igiAmountMXN = Math.round(customsValueMXN * igiRate);
  let dtaAmountMXN = 0;
  if (input.isDtaFixed) {
    dtaAmountMXN = input.dtaFixedAmountMXN ?? 415;
  } else {
    const calculatedDTA = Math.round(customsValueMXN * 8e-3);
    dtaAmountMXN = Math.max(415, calculatedDTA);
  }
  const prvAmountMXN = input.prvMXN ?? 310;
  const cntAmountMXN = input.cntMXN ?? 80;
  const ivaBaseMXN = customsValueMXN + igiAmountMXN + dtaAmountMXN;
  const ivaAmountMXN = Math.round(ivaBaseMXN * 0.16);
  const totalCustomsTaxesMXN = igiAmountMXN + dtaAmountMXN + prvAmountMXN + cntAmountMXN + ivaAmountMXN;
  const brokerRate = (input.brokerFeePercent ?? 0.45) / 100;
  const minBroker = input.brokerMinFeeMXN ?? 4200;
  const brokerFeeMXN = Math.round(Math.max(minBroker, customsValueMXN * brokerRate));
  const lastMileDeliveryMXN = Math.round(input.lastMileDeliveryMXN ?? 3800);
  const totalLandedCostMXN = Math.round(
    commercialValueMXN + (["EXW", "FCA", "FAS", "FOB"].includes(input.incoterm?.toUpperCase() || "") ? incrementablesMXN : 0) + totalCustomsTaxesMXN + brokerFeeMXN + lastMileDeliveryMXN
  );
  const costPerUnitMXN = Math.round(totalLandedCostMXN / unitsCount * 100) / 100;
  const costPerUnitUSD = Math.round(costPerUnitMXN / exchangeRate * 100) / 100;
  const targetMargin = (input.targetMarginPercent ?? 35) / 100;
  const suggestedSalePriceMXN = targetMargin < 1 ? Math.round(costPerUnitMXN / (1 - targetMargin) * 100) / 100 : costPerUnitMXN * 1.5;
  const suggestedMarginAmountMXN = Math.round((suggestedSalePriceMXN - costPerUnitMXN) * 100) / 100;
  const taxRatioPercent = commercialValueMXN > 0 ? Math.round(totalCustomsTaxesMXN / commercialValueMXN * 1e3) / 10 : 0;
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
    taxRatioPercent
  };
}
var COMMON_TARIFFS = [
  {
    hsCode: "8471.30.01",
    nico: "00",
    description: "M\xE1quinas autom\xE1ticas para tratamiento o procesamiento de datos, port\xE1tiles (Laptops/Notebooks)",
    igiPercent: 0,
    unit: "Pieza",
    regulations: ["NOM-001-SCFI-2018 (Seguridad electr\xF3nica)", "NOM-019-SCFI-1998 (Equipo perif\xE9rico)", "NOM-024-SCFI-2013 (Garant\xEDas)"]
  },
  {
    hsCode: "6109.10.01",
    nico: "01",
    description: "T-shirts y camisetas interiores de punto de algod\xF3n para hombres o ni\xF1os",
    igiPercent: 25,
    unit: "Pieza",
    regulations: ["Padr\xF3n Sectorial Textil y Confecci\xF3n", "NOM-004-SE-2021 (Informaci\xF3n comercial textiles)", "Etiquetado en espa\xF1ol"]
  },
  {
    hsCode: "6403.99.99",
    nico: "99",
    description: "Calzado con suela de caucho, pl\xE1stico y parte superior de cuero natural",
    igiPercent: 25,
    unit: "Par",
    regulations: ["Padr\xF3n Sectorial Calzado", "Precios Estimados SAT", "NOM-020-SCFI-1997"]
  },
  {
    hsCode: "8528.52.01",
    nico: "01",
    description: "Monitores capaces de conectarse directamente a una m\xE1quina autom\xE1tica para tratamiento de datos",
    igiPercent: 0,
    unit: "Pieza",
    regulations: ["NOM-019-SCFI-1998", "NOM-024-SCFI-2013"]
  },
  {
    hsCode: "8708.29.99",
    nico: "99",
    description: "Partes y accesorios de carrocer\xEDa para veh\xEDculos autom\xF3viles",
    igiPercent: 10,
    unit: "Pieza",
    regulations: ["NOM-119-SCFI-2000 (Cinturones de seguridad)", "Certificado de Origen T-MEC"]
  },
  {
    hsCode: "9503.00.99",
    nico: "03",
    description: "Juguetes de material pl\xE1stico con motor el\xE9ctrico o mecanismo",
    igiPercent: 15,
    unit: "Pieza",
    regulations: ["NOM-015-SCFI-2007 (Juguetes)", "NOM-252-SSA1-2011 (L\xEDmites de plomo/metales pesados)"]
  },
  {
    hsCode: "3923.30.99",
    nico: "01",
    description: "Bombonas, botellas, frascos y art\xEDculos similares de materias pl\xE1sticas",
    igiPercent: 10,
    unit: "Kilogramo",
    regulations: ["NOM-050-SCFI-2004 (Informaci\xF3n comercial general)"]
  },
  {
    hsCode: "2204.21.99",
    nico: "01",
    description: "Vino tinto o blanco en recipientes con capacidad menor o igual a 2 litros",
    igiPercent: 20,
    unit: "Litro",
    regulations: ["Padr\xF3n Sectorial Bebidas Alcoh\xF3licas", "Marbetes SAT", "IEPS 26.5% - 53%", "NOM-142-SSA1/SCFI-2014"]
  }
];

// src/utils/pedimentoValidator.ts
var VALID_CLAVES_PEDIMENTO = {
  A1: "Importaci\xF3n o Exportaci\xF3n definitiva (comercializaci\xF3n o consumo)",
  IN: "Importaci\xF3n temporal de bienes para retornar en el mismo estado o elaboraci\xF3n por empresas con programa IMMEX",
  AF: "Importaci\xF3n temporal de activo fijo por empresas con programa IMMEX",
  V1: "Transferencias de mercanc\xEDas entre empresas IMMEX o proveedores nacionales",
  K1: "Desistimiento de r\xE9gimen aduanero y retorno de mercanc\xEDas",
  G1: "Extracci\xF3n de dep\xF3sito fiscal para importaci\xF3n definitiva",
  F4: "Cambio de r\xE9gimen de importaci\xF3n temporal a definitiva",
  R1: "Rectificaci\xF3n de pedimento (correcci\xF3n de datos conforme al Art. 89)",
  RT: "Retorno de mercanc\xEDas importadas temporalmente"
};
var ADUANAS_MEXICO = {
  "16": "160 - Manzanillo, Colima (Mar\xEDtima)",
  "24": "240 - Nuevo Laredo, Tamaulipas (Fronteriza)",
  "47": "470 - Aeropuerto Internacional de la Ciudad de M\xE9xico (A\xE9rea)",
  "43": "430 - Veracruz, Veracruz (Mar\xEDtima)",
  "80": "800 - Colombia, Nuevo Le\xF3n (Fronteriza)",
  "40": "400 - Nogales, Sonora (Fronteriza)",
  "20": "200 - Ciudad Ju\xE1rez, Chihuahua (Fronteriza)",
  "65": "650 - Altamira, Tamaulipas (Mar\xEDtima)",
  "53": "530 - Canc\xFAn, Quintana Roo (A\xE9rea)"
};
function validatePedimentoNumber(rawNumber) {
  const clean = rawNumber.replace(/[\s-]/g, "");
  if (!/^\d{15}$/.test(clean)) {
    return {
      valid: false,
      cleanNumber: clean,
      error: `El n\xFAmero de pedimento debe contener exactamente 15 d\xEDgitos num\xE9ricos (actualmente tiene ${clean.length}).`
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
    details: { year, aduana, patente, yearDigit, sequential }
  };
}
function validateRFC(rfc) {
  const clean = rfc.toUpperCase().trim();
  const regexMoral = /^[A-Z&Ñ]{3}\d{6}[A-Z0-9]{3}$/;
  const regexFisica = /^[A-Z&Ñ]{4}\d{6}[A-Z0-9]{3}$/;
  return regexMoral.test(clean) || regexFisica.test(clean);
}
function auditPedimento(data) {
  const issues = [];
  const numCheck = validatePedimentoNumber(data.numeroPedimento);
  if (!numCheck.valid) {
    issues.push({
      field: "numeroPedimento",
      severity: "CRITICAL",
      title: "Estructura inv\xE1lida de n\xFAmero de pedimento",
      message: numCheck.error || "Formato de 15 d\xEDgitos no cumple la regla Anexo 22 SAT.",
      legalReference: "Anexo 22 de las Reglas Generales de Comercio Exterior, Instructivo de Llenado.",
      suggestedAction: "Verifique los 15 d\xEDgitos: [A\xF1o: 2][Aduana: 2][Patente: 4][\xDAltimo d\xEDgito a\xF1o: 1][Consecutivo: 6]."
    });
  } else {
    if (data.aduanaDespacho && !data.aduanaDespacho.startsWith(numCheck.details.aduana)) {
      issues.push({
        field: "aduanaDespacho",
        severity: "WARNING",
        title: "Discrepancia entre Aduana en n\xFAmero y Aduana de despacho",
        message: `Los d\xEDgitos 3 y 4 del pedimento indican aduana "${numCheck.details.aduana}", pero se seleccion\xF3 "${data.aduanaDespacho}".`,
        legalReference: "Anexo 22 RGCE, Campo 1.",
        suggestedAction: "Corrija la aduana de despacho o el prefijo del pedimento."
      });
    }
    if (data.patenteAgente && numCheck.details.patente !== data.patenteAgente) {
      issues.push({
        field: "patenteAgente",
        severity: "CRITICAL",
        title: "Patente de Agente Aduanal inconsistente",
        message: `El pedimento indica patente "${numCheck.details.patente}" pero se declar\xF3 "${data.patenteAgente}".`,
        legalReference: "Art. 159 y 160 Ley Aduanera.",
        suggestedAction: "Verifique que la patente aduanal autorizada coincida con los d\xEDgitos 5 al 8."
      });
    }
  }
  const claveNorm = data.clavePedimento?.toUpperCase().trim();
  if (!claveNorm || !VALID_CLAVES_PEDIMENTO[claveNorm]) {
    issues.push({
      field: "clavePedimento",
      severity: "CRITICAL",
      title: "Clave de pedimento no reconocida",
      message: `La clave "${data.clavePedimento}" no es una clave v\xE1lida del Ap\xE9ndice 2 del Anexo 22.`,
      legalReference: "Anexo 22 RGCE, Ap\xE9ndice 2.",
      suggestedAction: "Seleccione una clave v\xE1lida como A1 (Definitivo), IN (IMMEX) o V1."
    });
  }
  if (!validateRFC(data.rfcImportador)) {
    issues.push({
      field: "rfcImportador",
      severity: "CRITICAL",
      title: "RFC del importador inv\xE1lido",
      message: `El RFC "${data.rfcImportador}" no cumple con el formato est\xE1ndar del SAT (12 caracteres para Persona Moral o 13 para Persona F\xEDsica).`,
      legalReference: "Art. 27 del C\xF3digo Fiscal de la Federaci\xF3n.",
      suggestedAction: "Revise la Constancia de Situaci\xF3n Fiscal del importador para validar homoclave."
    });
  }
  const cleanFraccion = (data.fraccionArancelaria || "").replace(/\D/g, "");
  if (cleanFraccion.length !== 8) {
    issues.push({
      field: "fraccionArancelaria",
      severity: "CRITICAL",
      title: "Fracci\xF3n Arancelaria incompleta o inv\xE1lida",
      message: `La Fracci\xF3n Arancelaria debe tener exactamente 8 d\xEDgitos TIGIE (actualmente tiene ${cleanFraccion.length}).`,
      legalReference: "Ley de los Impuestos Generales de Importaci\xF3n y de Exportaci\xF3n (LIGIE), Art. 1.",
      suggestedAction: "Consulte la TIGIE para obtener la subpartida de 8 d\xEDgitos."
    });
  }
  const cleanNico = (data.nico || "").replace(/\D/g, "");
  if (cleanNico.length !== 2) {
    issues.push({
      field: "nico",
      severity: "WARNING",
      title: "N\xFAmero de Identificaci\xF3n Comercial (NICO) ausente o incompleto",
      message: "Desde la reforma de modernizaci\xF3n arancelaria, el NICO de 2 d\xEDgitos es obligatorio.",
      legalReference: "Publicaci\xF3n DOF 28/08/2020 - Sistema NICO.",
      suggestedAction: "Agregue el NICO de 2 d\xEDgitos correspondiente a la fracci\xF3n arancelaria."
    });
  }
  const incoNorm = (data.incoterm || "").toUpperCase().trim();
  const fletes = data.fletesUSD || 0;
  const seguros = data.segurosUSD || 0;
  const otros = data.otrosIncrementablesUSD || 0;
  const totalIncrementablesUSD = fletes + seguros + otros;
  if (["EXW", "FCA", "FAS", "FOB"].includes(incoNorm)) {
    if (totalIncrementablesUSD <= 0) {
      issues.push({
        field: "incoterm",
        severity: "CRITICAL",
        title: "Alerta grave: Omisi\xF3n de Incrementables (Art. 65 Ley Aduanera)",
        message: `El Incoterm pactado es ${incoNorm}, lo que significa que el comprador contrata el transporte internacional. Declarar $0 en fletes y seguros causa una subvaluaci\xF3n directa del Valor en Aduana y omisi\xF3n de contribuciones (IGI e IVA).`,
        legalReference: "Art. 64 y 65 fracci\xF3n I incisos a) y d) de la Ley Aduanera.",
        suggestedAction: "Declare los montos reales pagados por flete internacional y seguro seg\xFAn conocimiento de embarque (BL / AWB / Carta Porte) y p\xF3liza de seguro."
      });
    }
  }
  const tipoCambio = data.tipoCambio || 1;
  const valorComercialUSD = data.valorDolares || 0;
  const expectedValorAduanaUSD = valorComercialUSD + (["EXW", "FCA", "FAS", "FOB"].includes(incoNorm) ? totalIncrementablesUSD : otros);
  const expectedValorAduanaMXN = Math.round(expectedValorAduanaUSD * tipoCambio);
  if (data.tipoOperacion === "IMP") {
    if (data.valorAduanaMXN < data.valorDolares * tipoCambio) {
      issues.push({
        field: "valorAduanaMXN",
        severity: "CRITICAL",
        title: "Valor en Aduana inferior al Valor Comercial",
        message: `El Valor en Aduana ($${data.valorAduanaMXN?.toLocaleString()} MXN) no puede ser menor a la conversi\xF3n del Valor Comercial ($${Math.round(valorComercialUSD * tipoCambio)?.toLocaleString()} MXN) en importaciones definitivas.`,
        legalReference: "Art. 64 Ley Aduanera - Base gravable del impuesto general de importaci\xF3n.",
        suggestedAction: "Recalcule el Valor en Aduana sumando el precio pagado m\xE1s los incrementables aplicables."
      });
    } else if (Math.abs(data.valorAduanaMXN - expectedValorAduanaMXN) > 500) {
      issues.push({
        field: "valorAduanaMXN",
        severity: "WARNING",
        title: "Discrepancia en el c\xE1lculo del Valor en Aduana",
        message: `El Valor en Aduana declarado ($${data.valorAduanaMXN?.toLocaleString()} MXN) difiere del esperado ($${expectedValorAduanaMXN.toLocaleString()} MXN) con el tipo de cambio ${tipoCambio} y los incrementables capturados.`,
        legalReference: "Art. 56 y 81 Ley Aduanera.",
        suggestedAction: "Verifique si existen decrementables (Art. 66 LA) o ajuste el tipo de cambio oficial del DOF."
      });
    }
  }
  const dtaEsperado = Math.max(415, Math.round(data.valorAduanaMXN * 8e-3));
  if (data.clavePedimento === "A1" && data.dtaPagadoMXN < 415) {
    issues.push({
      field: "dtaPagadoMXN",
      severity: "CRITICAL",
      title: "Pago de DTA inferior a la cuota m\xEDnima de ley",
      message: `El DTA pagado ($${data.dtaPagadoMXN} MXN) es menor a la cuota m\xEDnima establecida en el Art. 49 de la Ley Federal de Derechos ($415 MXN).`,
      legalReference: "Art. 49 fracci\xF3n I y IV de la Ley Federal de Derechos.",
      suggestedAction: "Para pedimentos definitivos A1 sin tratado de exenci\xF3n de DTA, aplique la tasa del 8 al millar o la cuota m\xEDnima."
    });
  }
  const baseIVAEsperada = data.valorAduanaMXN + (data.igiPagadoMXN || 0) + (data.dtaPagadoMXN || 0);
  const ivaEsperado = Math.round(baseIVAEsperada * 0.16);
  if (data.clavePedimento === "A1" && Math.abs((data.ivaPagadoMXN || 0) - ivaEsperado) > 200) {
    issues.push({
      field: "ivaPagadoMXN",
      severity: "WARNING",
      title: "Diferencia en c\xE1lculo de IVA al 16%",
      message: `El IVA pagado ($${data.ivaPagadoMXN?.toLocaleString()} MXN) difiere del 16% sobre la base gravable aduanal ($${ivaEsperado.toLocaleString()} MXN).`,
      legalReference: "Art. 24 y 27 de la Ley del Impuesto al Valor Agregado.",
      suggestedAction: "Verifique si la mercanc\xEDa est\xE1 exenta, gravada a tasa 0% (ej. alimentos/medicinas) o si hubo retenci\xF3n."
    });
  }
  const criticalCount = issues.filter((i) => i.severity === "CRITICAL").length;
  const warningCount = issues.filter((i) => i.severity === "WARNING").length;
  let score = 100 - criticalCount * 30 - warningCount * 10;
  score = Math.max(0, Math.min(100, score));
  if (criticalCount === 0 && warningCount === 0) {
    issues.push({
      field: "auditoria",
      severity: "SUCCESS",
      title: "Cumplimiento Normativo Exitoso",
      message: "Todos los campos analizados cumplen satisfactoriamente con la Ley Aduanera y el Anexo 22 de las RGCE.",
      legalReference: "Conformidad con Art. 36 y 36-A Ley Aduanera."
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
      ivaExpectedMXN: ivaEsperado
    }
  };
}
var SAMPLE_PEDIMENTOS = [
  {
    name: "Pedimento A1 - Cumplimiento \xD3ptimo (Electr\xF3nicos)",
    description: "Importaci\xF3n definitiva v\xEDa Manzanillo con fletes y seguros declarados correctamente.",
    data: {
      numeroPedimento: "24 16 3840 4 001928",
      clavePedimento: "A1",
      tipoOperacion: "IMP",
      regimenAduanero: "IMD",
      rfcImportador: "DTE210419KM8",
      nombreImportador: "DISTRIBUIDORA TECNOL\xD3GICA DE OCCIDENTE S.A. DE C.V.",
      paisOrigen: "CHN",
      paisVendedor: "CHN",
      incoterm: "FOB",
      tipoCambio: 19.85,
      valorDolares: 34500,
      valorAduanaMXN: 730480,
      // (34500 + 2300) * 19.85
      fletesUSD: 1950,
      segurosUSD: 350,
      otrosIncrementablesUSD: 0,
      fraccionArancelaria: "84713001",
      nico: "00",
      igiPagadoMXN: 0,
      // 0% laptops
      dtaPagadoMXN: 5844,
      // 8 al millar
      ivaPagadoMXN: 117812,
      // 16% sobre (730480 + 5844)
      prvPagadoMXN: 310,
      cntPagadoMXN: 80,
      numBultos: 120,
      pesoBrutoKg: 840,
      aduanaDespacho: "160",
      patenteAgente: "3840"
    }
  },
  {
    name: "Pedimento con Riesgo: EXW sin Flete Declarado",
    description: "Inconsistencia grave: Incoterm EXW pero fletes y seguros en $0, riesgo de auditor\xEDa por subvaluaci\xF3n.",
    data: {
      numeroPedimento: "24 24 3912 4 008472",
      clavePedimento: "A1",
      tipoOperacion: "IMP",
      regimenAduanero: "IMD",
      rfcImportador: "MIM180312XX9",
      nombreImportador: "MODA INTERNACIONAL MEXICANA S.A. DE C.V.",
      paisOrigen: "USA",
      paisVendedor: "USA",
      incoterm: "EXW",
      tipoCambio: 19.85,
      valorDolares: 18e3,
      valorAduanaMXN: 357300,
      // No sumó incrementables
      fletesUSD: 0,
      // ERROR: en EXW debe haber flete internacional
      segurosUSD: 0,
      otrosIncrementablesUSD: 0,
      fraccionArancelaria: "61091001",
      nico: "01",
      igiPagadoMXN: 89325,
      // 25% IGI sobre base reducida
      dtaPagadoMXN: 2858,
      ivaPagadoMXN: 71917,
      prvPagadoMXN: 310,
      cntPagadoMXN: 80,
      numBultos: 45,
      pesoBrutoKg: 350,
      aduanaDespacho: "240",
      patenteAgente: "3912"
    }
  },
  {
    name: "Pedimento con Error de Estructura y Patente",
    description: "Contiene n\xFAmero de 14 d\xEDgitos en vez de 15 y patente que no coincide con la cabecera.",
    data: {
      numeroPedimento: "24 47 3120 4 00192",
      // Solo 14 dígitos
      clavePedimento: "A1",
      tipoOperacion: "IMP",
      regimenAduanero: "IMD",
      rfcImportador: "PRO19020199",
      // RFC incompleto
      nombreImportador: "PROVEEDORA INDUSTRIAL METROPOLITANA S.A.",
      paisOrigen: "DEU",
      paisVendedor: "DEU",
      incoterm: "CIF",
      tipoCambio: 19.85,
      valorDolares: 12500,
      valorAduanaMXN: 248125,
      fletesUSD: 0,
      segurosUSD: 0,
      otrosIncrementablesUSD: 0,
      fraccionArancelaria: "87082999",
      nico: "99",
      igiPagadoMXN: 24813,
      // 10%
      dtaPagadoMXN: 350,
      // Menor al mínimo de $415
      ivaPagadoMXN: 43726,
      prvPagadoMXN: 310,
      cntPagadoMXN: 80,
      numBultos: 18,
      pesoBrutoKg: 280,
      aduanaDespacho: "470",
      patenteAgente: "3999"
      // No coincide con 3120
    }
  }
];

// src/utils/incotermsData.ts
var INCOTERMS_2020 = [
  {
    code: "EXW",
    name: "Ex Works",
    nameEs: "En f\xE1brica",
    category: "MULTIMODAL",
    riskTransferPoint: "En el almac\xE9n o f\xE1brica del vendedor, antes de cargar la mercanc\xEDa al transporte.",
    costTransferPoint: "En las instalaciones del vendedor (el comprador cubre el 100% de la cadena log\xEDstica).",
    transportTypes: ["A\xE9reo", "Mar\xEDtimo", "Terrestre", "Ferroviario", "Multimodal"],
    pymeRecommendation: "CAUTION",
    pymeRecommendationText: "No recomendado para PyMEs novatas. La PyME compradora debe tramitar el despacho aduanal de exportaci\xF3n en el pa\xEDs de origen (ej. China o Europa), lo cual es sumamente complejo sin presencia f\xEDsica o agente local.",
    commonPitfall: "Creer que es el m\xE1s barato porque el precio unitario es menor, pero al sumar fletes locales, maniobras en origen y tr\xE1mites aduanales extranjeros el costo final se dispara.",
    obligations: {
      packaging: "SELLER",
      originLoading: "BUYER",
      originInland: "BUYER",
      exportClearance: "BUYER",
      originTerminalHandling: "BUYER",
      mainFreight: "BUYER",
      cargoInsurance: "BUYER",
      destinationTerminalHandling: "BUYER",
      importClearance: "BUYER",
      finalDelivery: "BUYER"
    }
  },
  {
    code: "FCA",
    name: "Free Carrier",
    nameEs: "Franco Porteador",
    category: "MULTIMODAL",
    riskTransferPoint: "Al entregar la mercanc\xEDa al transportista designado por el comprador en el punto convenido de origen.",
    costTransferPoint: "Punto de entrega acordado en el pa\xEDs de origen (el vendedor despacha la exportaci\xF3n).",
    transportTypes: ["A\xE9reo", "Mar\xEDtimo", "Terrestre", "Ferroviario", "Multimodal"],
    pymeRecommendation: "HIGH",
    pymeRecommendationText: "Altamente recomendado para PyMEs que importan por v\xEDa a\xE9rea o contenedores completos. El proveedor extranjero asume el despacho aduanero de exportaci\xF3n y la PyME mexicana mantiene el control del flete internacional y tarifas.",
    commonPitfall: "No especificar con exactitud el punto geogr\xE1fico de entrega dentro de la ciudad o puerto del proveedor.",
    obligations: {
      packaging: "SELLER",
      originLoading: "SELLER",
      originInland: "SELLER",
      exportClearance: "SELLER",
      originTerminalHandling: "BUYER",
      mainFreight: "BUYER",
      cargoInsurance: "BUYER",
      destinationTerminalHandling: "BUYER",
      importClearance: "BUYER",
      finalDelivery: "BUYER"
    }
  },
  {
    code: "CPT",
    name: "Carriage Paid To",
    nameEs: "Transporte Pagado Hasta",
    category: "MULTIMODAL",
    riskTransferPoint: "Al entregar la mercanc\xEDa al primer transportista en origen (\xA1ojo: el riesgo se transfiere ANTES del transporte principal!).",
    costTransferPoint: "En el lugar o terminal convenida de destino (el vendedor paga el flete principal).",
    transportTypes: ["A\xE9reo", "Mar\xEDtimo", "Terrestre", "Multimodal"],
    pymeRecommendation: "MEDIUM",
    pymeRecommendationText: "\xDAtil si el vendedor tiene tarifas de flete internacional m\xE1s competitivas, pero la PyME mexicana debe contratar su propio seguro de carga para proteger el trayecto.",
    commonPitfall: "Confundir la transferencia de costos con la de riesgos: si la mercanc\xEDa se da\xF1a en el mar, la p\xE9rdida es del comprador, aunque el vendedor haya pagado el flete.",
    obligations: {
      packaging: "SELLER",
      originLoading: "SELLER",
      originInland: "SELLER",
      exportClearance: "SELLER",
      originTerminalHandling: "SELLER",
      mainFreight: "SELLER",
      cargoInsurance: "BUYER",
      destinationTerminalHandling: "BUYER",
      importClearance: "BUYER",
      finalDelivery: "BUYER"
    }
  },
  {
    code: "CIP",
    name: "Carriage and Insurance Paid To",
    nameEs: "Transporte y Seguro Pagados Hasta",
    category: "MULTIMODAL",
    riskTransferPoint: "Al entregar la mercanc\xEDa al primer transportista en origen.",
    costTransferPoint: "En el lugar convenido de destino, con seguro internacional cubierto por el vendedor (cobertura amplia Cl\xE1usula A).",
    transportTypes: ["A\xE9reo", "Mar\xEDtimo", "Terrestre", "Multimodal"],
    pymeRecommendation: "HIGH",
    pymeRecommendationText: "Excelente para importaciones a\xE9reas o multimodales. El vendedor paga el flete y un seguro con cobertura m\xE1xima (Cl\xE1usulas del Instituto de Londres A).",
    commonPitfall: "No verificar que la p\xF3liza de seguro emitida en el extranjero tenga cobertura endosable y reclamable por la PyME en M\xE9xico.",
    obligations: {
      packaging: "SELLER",
      originLoading: "SELLER",
      originInland: "SELLER",
      exportClearance: "SELLER",
      originTerminalHandling: "SELLER",
      mainFreight: "SELLER",
      cargoInsurance: "SELLER",
      destinationTerminalHandling: "BUYER",
      importClearance: "BUYER",
      finalDelivery: "BUYER"
    }
  },
  {
    code: "DAP",
    name: "Delivered at Place",
    nameEs: "Entregado en el Lugar Acordado",
    category: "MULTIMODAL",
    riskTransferPoint: "Sobre el veh\xEDculo de transporte listo para ser descargado en el punto de destino acordado.",
    costTransferPoint: "En el punto de entrega acordado en M\xE9xico (excluyendo el despacho aduanero de importaci\xF3n e impuestos).",
    transportTypes: ["A\xE9reo", "Mar\xEDtimo", "Terrestre", "Multimodal"],
    pymeRecommendation: "HIGH",
    pymeRecommendationText: "Ideal para compras terrestres desde EE.UU. o Canad\xE1 (T-MEC). La PyME s\xF3lo se encarga de pagar sus impuestos y tr\xE1mites de aduana en M\xE9xico con su propio agente aduanal.",
    commonPitfall: "Demoras en el despacho aduanero en frontera que generen costos de estad\xEDa o demoras del cami\xF3n pagadas por el importador.",
    obligations: {
      packaging: "SELLER",
      originLoading: "SELLER",
      originInland: "SELLER",
      exportClearance: "SELLER",
      originTerminalHandling: "SELLER",
      mainFreight: "SELLER",
      cargoInsurance: "SELLER",
      destinationTerminalHandling: "SELLER",
      importClearance: "BUYER",
      finalDelivery: "SELLER"
    }
  },
  {
    code: "DPU",
    name: "Delivered at Place Unloaded",
    nameEs: "Entregado en Lugar Descargado",
    category: "MULTIMODAL",
    riskTransferPoint: "Una vez descargada la mercanc\xEDa en la terminal o punto designado de destino.",
    costTransferPoint: "En el lugar convenido de destino con maniobra de descarga incluida.",
    transportTypes: ["A\xE9reo", "Mar\xEDtimo", "Terrestre", "Multimodal"],
    pymeRecommendation: "MEDIUM",
    pymeRecommendationText: "Es el \xFAnico Incoterm donde el vendedor asume la descarga de la mercanc\xEDa en destino.",
    commonPitfall: "El vendedor puede desconocer los equipos mec\xE1nicos necesarios para la descarga en destino, generando retrasos.",
    obligations: {
      packaging: "SELLER",
      originLoading: "SELLER",
      originInland: "SELLER",
      exportClearance: "SELLER",
      originTerminalHandling: "SELLER",
      mainFreight: "SELLER",
      cargoInsurance: "SELLER",
      destinationTerminalHandling: "SELLER",
      importClearance: "BUYER",
      finalDelivery: "SELLER"
    }
  },
  {
    code: "DDP",
    name: "Delivered Duty Paid",
    nameEs: "Entregado con Derechos Pagados",
    category: "MULTIMODAL",
    riskTransferPoint: "En las instalaciones del comprador en M\xE9xico con mercanc\xEDa despachada de aduana.",
    costTransferPoint: "En puerta de la PyME compradora (m\xE1xima obligaci\xF3n para el vendedor extranjero).",
    transportTypes: ["A\xE9reo", "Mar\xEDtimo", "Terrestre", "Multimodal"],
    pymeRecommendation: "CAUTION",
    pymeRecommendationText: "Riesgoso en M\xE9xico para importadores que buscan deducibilidad fiscal. El vendedor extranjero t\xEDpicamente no tiene RFC ni padr\xF3n de importadores en M\xE9xico, por lo que no puede emitir un pedimento deducible ni acreditar el IVA.",
    commonPitfall: 'Pagar un precio global que incluye "impuestos" pero recibir la mercanc\xEDa sin pedimento individual deducible a nombre de la PyME.',
    obligations: {
      packaging: "SELLER",
      originLoading: "SELLER",
      originInland: "SELLER",
      exportClearance: "SELLER",
      originTerminalHandling: "SELLER",
      mainFreight: "SELLER",
      cargoInsurance: "SELLER",
      destinationTerminalHandling: "SELLER",
      importClearance: "SELLER",
      finalDelivery: "SELLER"
    }
  },
  {
    code: "FAS",
    name: "Free Alongside Ship",
    nameEs: "Franco al Costado del Buque",
    category: "MARITIMO",
    riskTransferPoint: "Al colocar la mercanc\xEDa al costado del buque (ej. en el muelle) en el puerto de embarque convenido.",
    costTransferPoint: "Al costado del buque en el puerto de salida designado.",
    transportTypes: ["Mar\xEDtimo", "V\xEDas navegables interiores"],
    pymeRecommendation: "CAUTION",
    pymeRecommendationText: "Uso especializado para graneles o cargas pesadas/sobredimensionadas. Rara vez adecuado para PyMEs que importan mercanc\xEDa en contenedores.",
    commonPitfall: "Intentar usarlo para mercanc\xEDa en contenedores cerrados; en ese caso debe usarse FCA.",
    obligations: {
      packaging: "SELLER",
      originLoading: "SELLER",
      originInland: "SELLER",
      exportClearance: "SELLER",
      originTerminalHandling: "BUYER",
      mainFreight: "BUYER",
      cargoInsurance: "BUYER",
      destinationTerminalHandling: "BUYER",
      importClearance: "BUYER",
      finalDelivery: "BUYER"
    }
  },
  {
    code: "FOB",
    name: "Free On Board",
    nameEs: "Franco a Bordo",
    category: "MARITIMO",
    riskTransferPoint: "A bordo del buque en el puerto de embarque convenido.",
    costTransferPoint: "A bordo del buque en el puerto de origen.",
    transportTypes: ["Mar\xEDtimo", "V\xEDas navegables interiores"],
    pymeRecommendation: "HIGH",
    pymeRecommendationText: "El Incoterm rey para importaciones mar\xEDtimas desde Asia y Europa. El exportador cubre todos los costos y permisos en su pa\xEDs hasta subir el contenedor al barco. La PyME mexicana negocia y controla su propio flete mar\xEDtimo hacia Manzanillo o Veracruz.",
    commonPitfall: "No contratar seguro internacional asumiendo que el flete mar\xEDtimo lo incluye (las navieras tienen responsabilidad limitada por ley).",
    obligations: {
      packaging: "SELLER",
      originLoading: "SELLER",
      originInland: "SELLER",
      exportClearance: "SELLER",
      originTerminalHandling: "SELLER",
      mainFreight: "BUYER",
      cargoInsurance: "BUYER",
      destinationTerminalHandling: "BUYER",
      importClearance: "BUYER",
      finalDelivery: "BUYER"
    }
  },
  {
    code: "CFR",
    name: "Cost and Freight",
    nameEs: "Costo y Flete",
    category: "MARITIMO",
    riskTransferPoint: "A bordo del buque en origen (\xA1el riesgo se transfiere al comprador en el puerto de salida!).",
    costTransferPoint: "Puerto de destino convenido (el vendedor paga el flete mar\xEDtimo).",
    transportTypes: ["Mar\xEDtimo", "V\xEDas navegables"],
    pymeRecommendation: "MEDIUM",
    pymeRecommendationText: "El vendedor paga el transporte mar\xEDtimo hasta el puerto mexicano (ej. Manzanillo o Altamira), pero el comprador debe asegurar la mercanc\xEDa.",
    commonPitfall: "Creer que el vendedor responde por aver\xEDas o p\xE9rdidas en alta mar: el riesgo es 100% del comprador desde que sube al buque en origen.",
    obligations: {
      packaging: "SELLER",
      originLoading: "SELLER",
      originInland: "SELLER",
      exportClearance: "SELLER",
      originTerminalHandling: "SELLER",
      mainFreight: "SELLER",
      cargoInsurance: "BUYER",
      destinationTerminalHandling: "BUYER",
      importClearance: "BUYER",
      finalDelivery: "BUYER"
    }
  },
  {
    code: "CIF",
    name: "Cost, Insurance and Freight",
    nameEs: "Costo, Seguro y Flete",
    category: "MARITIMO",
    riskTransferPoint: "A bordo del buque en el puerto de embarque en origen.",
    costTransferPoint: "Puerto de destino convenido, con flete y seguro cubiertos por el vendedor (cobertura m\xEDnima Cl\xE1usula C).",
    transportTypes: ["Mar\xEDtimo", "V\xEDas navegables"],
    pymeRecommendation: "MEDIUM",
    pymeRecommendationText: "Popular en importaciones mar\xEDtimas, pero en Incoterms 2020 el vendedor s\xF3lo est\xE1 obligado a contratar la cobertura m\xEDnima (Cl\xE1usulas C del Instituto). Para carga de alto valor o electr\xF3nica, se recomienda solicitar Cl\xE1usula A o comprar seguro propio.",
    commonPitfall: "La cobertura C no ampara robo parcial, mermas ni humedad, lo que deja desprotegida a la PyME en muchos siniestros frecuentes.",
    obligations: {
      packaging: "SELLER",
      originLoading: "SELLER",
      originInland: "SELLER",
      exportClearance: "SELLER",
      originTerminalHandling: "SELLER",
      mainFreight: "SELLER",
      cargoInsurance: "SELLER",
      destinationTerminalHandling: "BUYER",
      importClearance: "BUYER",
      finalDelivery: "BUYER"
    }
  }
];

// server.ts
dotenv.config();
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var app = express();
var port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3e3;
app.use(express.json());
var shipmentsDB = [
  {
    id: "SHP-2024-001",
    trackingNumber: "MX-AF-89214",
    clientName: "Distribuidora Tecnol\xF3gica de Occidente S.A.",
    clientRfc: "DTE210419KM8",
    originCountry: "China",
    originCity: "Shenzhen",
    destinationCity: "Guadalajara, Jalisco",
    incoterm: "FOB",
    status: "CUSTOMS_CLEARANCE",
    customsPort: "160 - Manzanillo, Colima",
    pedimentoNumber: "24 16 3840 4 001928",
    cargoDescription: "120 Laptops y componentes de c\xF3mputo",
    weightKg: 840,
    packagesCount: 120,
    commercialValueUSD: 34500,
    customsValueMXN: 730480,
    eta: "2026-11-08",
    lastUpdate: "Inspecci\xF3n de pedimento y RRNA en puerto de Manzanillo",
    lastMileCarrier: "Transportes Castores Express",
    lastMileCostMXN: 5400
  },
  {
    id: "SHP-2024-002",
    trackingNumber: "MX-AF-94301",
    clientName: "Maquinados Industriales del Norte S.A. de C.V.",
    clientRfc: "MIN190520AB3",
    originCountry: "Alemania",
    originCity: "Hamburgo",
    destinationCity: "Monterrey, Nuevo Le\xF3n",
    incoterm: "CIF",
    status: "GREEN_LIGHT",
    customsPort: "430 - Veracruz, Veracruz",
    pedimentoNumber: "24 43 3120 4 003912",
    cargoDescription: "V\xE1lvulas hidr\xE1ulicas y bombas de precisi\xF3n",
    weightKg: 1450,
    packagesCount: 32,
    commercialValueUSD: 52e3,
    customsValueMXN: 1032200,
    eta: "2026-11-06",
    lastUpdate: "Desaduanamiento libre (Sem\xE1foro Verde fiscal) en Veracruz",
    lastMileCarrier: "Fletes M\xE9xico Carga Consolidada",
    lastMileCostMXN: 8200
  },
  {
    id: "SHP-2024-003",
    trackingNumber: "MX-AF-71044",
    clientName: "Textiles & Confecciones Le\xF3n S.A.",
    clientRfc: "TCL170815TR2",
    originCountry: "Estados Unidos",
    originCity: "Laredo, Texas",
    destinationCity: "Le\xF3n, Guanajuato",
    incoterm: "FCA",
    status: "LAST_MILE",
    customsPort: "240 - Nuevo Laredo, Tamaulipas",
    pedimentoNumber: "24 24 3912 4 005421",
    cargoDescription: "Rollos de tela de algod\xF3n y forros sint\xE9ticos",
    weightKg: 2100,
    packagesCount: 65,
    commercialValueUSD: 19800,
    customsValueMXN: 418e3,
    eta: "2026-11-05",
    lastUpdate: "En unidad de \xFAltima milla rumbo al Parque Industrial Le\xF3n",
    lastMileCarrier: "Paquetexpress \xDAltima Milla",
    lastMileCostMXN: 4150
  },
  {
    id: "SHP-2024-004",
    trackingNumber: "MX-AF-63022",
    clientName: "BioHealth Nutrici\xF3n Natural PyME",
    clientRfc: "BNN200110PX1",
    originCountry: "Corea del Sur",
    originCity: "Busan",
    destinationCity: "Ciudad de M\xE9xico",
    incoterm: "CIP",
    status: "TRANSIT",
    customsPort: "470 - AICM / Pantaco",
    pedimentoNumber: "24 47 3840 4 000831",
    cargoDescription: "Extractos bot\xE1nicos y envases farmac\xE9uticos",
    weightKg: 380,
    packagesCount: 24,
    commercialValueUSD: 14200,
    customsValueMXN: 281870,
    eta: "2026-11-12",
    lastUpdate: "Vuelo de carga en escala en Los \xC1ngeles, ETA a CDMX 12-Nov",
    lastMileCarrier: "DHL Global Forwarding Last Mile",
    lastMileCostMXN: 2950
  }
];
app.get("/api/v1/health", (_req, res) => {
  res.json({
    status: "online",
    version: "1.0.0",
    platform: "AduanaFlow - Core API for Mobile & Web",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    supportedEndpoints: [
      "/api/v1/shipments",
      "/api/v1/calculator/landed-cost",
      "/api/v1/incoterms",
      "/api/v1/pedimentos/validate",
      "/api/v1/last-mile/quote",
      "/api/v1/ai/tariff-assistant",
      "/api/v1/docs"
    ]
  });
});
app.get("/api/v1/docs", (_req, res) => {
  res.json({
    title: "AduanaFlow Mobile & PyME Integration API",
    description: "API REST dise\xF1ada para apps m\xF3viles en iOS y Android que gestionan log\xEDstica internacional, c\xE1lculo de costos aduanales y validaci\xF3n de pedimentos en tiempo real.",
    baseEndpoint: "/api/v1",
    clientTarget: "PyMEs, Agencias Aduanales, Transportistas de \xDAltima Milla",
    authType: "Bearer Token (Header Authorization: Bearer <API_KEY>) [Simulado para demo]",
    resources: {
      shipments: {
        get_all: "GET /api/v1/shipments",
        get_one: "GET /api/v1/shipments/:id",
        create: "POST /api/v1/shipments"
      },
      calculator: {
        landed_cost: "POST /api/v1/calculator/landed-cost"
      },
      pedimentos: {
        validate: "POST /api/v1/pedimentos/validate",
        samples: "GET /api/v1/pedimentos/samples"
      },
      incoterms: {
        list: "GET /api/v1/incoterms"
      },
      lastMile: {
        quote: "POST /api/v1/last-mile/quote"
      }
    }
  });
});
app.get("/api/v1/shipments", (req, res) => {
  const { status, search } = req.query;
  let results = [...shipmentsDB];
  if (status && typeof status === "string" && status !== "ALL") {
    results = results.filter((s) => s.status === status);
  }
  if (search && typeof search === "string") {
    const q = search.toLowerCase();
    results = results.filter(
      (s) => s.trackingNumber.toLowerCase().includes(q) || s.clientName.toLowerCase().includes(q) || s.cargoDescription.toLowerCase().includes(q) || s.pedimentoNumber.toLowerCase().includes(q)
    );
  }
  res.json({
    success: true,
    count: results.length,
    data: results
  });
});
app.get("/api/v1/shipments/:id", (req, res) => {
  const shipment = shipmentsDB.find((s) => s.id === req.params.id || s.trackingNumber === req.params.id);
  if (!shipment) {
    res.status(404).json({ success: false, error: "Embarque no encontrado" });
    return;
  }
  res.json({ success: true, data: shipment });
});
app.post("/api/v1/shipments", (req, res) => {
  const body = req.body;
  if (!body.clientName || !body.cargoDescription) {
    res.status(400).json({ success: false, error: "Faltan campos obligatorios (clientName, cargoDescription)" });
    return;
  }
  const newId = `SHP-2024-${String(shipmentsDB.length + 1).padStart(3, "0")}`;
  const trackingNumber = `MX-AF-${Math.floor(1e4 + Math.random() * 9e4)}`;
  const newRecord = {
    id: newId,
    trackingNumber,
    clientName: body.clientName,
    clientRfc: body.clientRfc || "GEN010101000",
    originCountry: body.originCountry || "Estados Unidos",
    originCity: body.originCity || "Laredo",
    destinationCity: body.destinationCity || "Ciudad de M\xE9xico",
    incoterm: body.incoterm || "FOB",
    status: body.status || "ORIGIN",
    customsPort: body.customsPort || "240 - Nuevo Laredo, Tamaulipas",
    pedimentoNumber: body.pedimentoNumber || "24 24 3840 4 000100",
    cargoDescription: body.cargoDescription,
    weightKg: Number(body.weightKg) || 100,
    packagesCount: Number(body.packagesCount) || 10,
    commercialValueUSD: Number(body.commercialValueUSD) || 5e3,
    customsValueMXN: Number(body.customsValueMXN) || 99250,
    eta: body.eta || new Date(Date.now() + 7 * 864e5).toISOString().split("T")[0],
    lastUpdate: "Embarque registrado en plataforma para gesti\xF3n y \xFAltima milla",
    lastMileCarrier: body.lastMileCarrier || "Red Log\xEDstica PyME Express",
    lastMileCostMXN: Number(body.lastMileCostMXN) || 3500
  };
  shipmentsDB.unshift(newRecord);
  res.status(201).json({
    success: true,
    message: "Embarque registrado con \xE9xito",
    data: newRecord
  });
});
app.post("/api/v1/calculator/landed-cost", (req, res) => {
  try {
    const input = req.body;
    const result = calculateLandedCost(input);
    res.json({
      success: true,
      calculation: result,
      tariffsReference: COMMON_TARIFFS
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err instanceof Error ? err.message : "Error en c\xE1lculo" });
  }
});
app.post("/api/v1/pedimentos/validate", (req, res) => {
  try {
    const data = req.body;
    const auditReport = auditPedimento(data);
    res.json({
      success: true,
      report: auditReport
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err instanceof Error ? err.message : "Error en auditor\xEDa" });
  }
});
app.get("/api/v1/pedimentos/samples", (_req, res) => {
  res.json({
    success: true,
    samples: SAMPLE_PEDIMENTOS,
    referenceClaves: VALID_CLAVES_PEDIMENTO,
    aduanas: ADUANAS_MEXICO
  });
});
app.get("/api/v1/incoterms", (_req, res) => {
  res.json({
    success: true,
    count: INCOTERMS_2020.length,
    data: INCOTERMS_2020
  });
});
app.post("/api/v1/last-mile/quote", (req, res) => {
  const { originPort, destinationCity, weightKg, packagesCount, deliverySpeed } = req.body;
  const weight = Number(weightKg) || 100;
  const packages = Number(packagesCount) || 5;
  const baseRate = deliverySpeed === "EXPRESS" ? 1800 : 1200;
  const weightRate = weight * 2.8;
  const handlingRate = packages * 35;
  const insuranceRate = 350;
  const totalCostMXN = Math.round(baseRate + weightRate + handlingRate + insuranceRate);
  const estimatedDays = deliverySpeed === "EXPRESS" ? 1 : 3;
  res.json({
    success: true,
    quote: {
      originPort: originPort || "160 - Manzanillo",
      destinationCity: destinationCity || "Ciudad de M\xE9xico",
      weightKg: weight,
      packagesCount: packages,
      deliverySpeed: deliverySpeed || "STANDARD",
      estimatedDays,
      breakdown: {
        baseRate,
        weightRate: Math.round(weightRate),
        handlingRate,
        transitInsurance: insuranceRate
      },
      totalCostMXN,
      serviceProvider: "Red Aliada de \xDAltima Milla AduanaFlow"
    }
  });
});
app.post("/api/v1/ai/tariff-assistant", async (req, res) => {
  const { productDescription, originCountry } = req.body;
  if (!productDescription) {
    res.status(400).json({ success: false, error: "Descripci\xF3n de producto requerida" });
    return;
  }
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    const lower = productDescription.toLowerCase();
    const matched = COMMON_TARIFFS.find(
      (t) => lower.includes("laptop") || lower.includes("computadora") ? t.hsCode.startsWith("8471") : lower.includes("playera") || lower.includes("camisa") || lower.includes("ropa") ? t.hsCode.startsWith("6109") : lower.includes("zapato") || lower.includes("calzado") ? t.hsCode.startsWith("6403") : lower.includes("vino") || lower.includes("alcohol") ? t.hsCode.startsWith("2204") : lower.includes("juguete") ? t.hsCode.startsWith("9503") : false
    ) || COMMON_TARIFFS[0];
    res.json({
      success: true,
      mode: "RULE_ENGINE",
      analysis: {
        suggestedHsCode: matched.hsCode,
        suggestedNico: matched.nico,
        description: matched.description,
        estimatedIgi: `${matched.igiPercent}%`,
        requiredNorms: matched.regulations,
        advisories: [
          "Verifique en el portal VUCEM si la mercanc\xEDa requiere Padr\xF3n Sectorial previo.",
          "Considere el c\xE1lculo del Valor Aduana sumando flete y seguro seg\xFAn el Incoterm convenido.",
          "Revise etiquetado en origen para evitar retenci\xF3n en aduana por NOMs de informaci\xF3n comercial."
        ]
      }
    });
    return;
  }
  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `Act\xFAa como especialista aduanal senior en comercio exterior y Ley Aduanera de M\xE9xico (SAT/ANAM).
Analiza el siguiente producto para una PyME importadora mexicana:
Producto: "${productDescription}"
Pa\xEDs de origen: "${originCountry || "No especificado"}"

Responde en formato JSON con la siguiente estructura exacta:
{
  "suggestedHsCode": "XXXX.XX.XX",
  "suggestedNico": "XX",
  "productCategory": "categor\xEDa resumida",
  "estimatedIgi": "X%",
  "requiredNorms": ["NOM-XXX", "Permiso previo..."],
  "advisories": ["recomendaci\xF3n 1", "recomendaci\xF3n 2"]
}`;
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });
    const parsed = JSON.parse(response.text || "{}");
    res.json({
      success: true,
      mode: "AI_GEMINI",
      analysis: parsed
    });
  } catch (err) {
    const fallback = COMMON_TARIFFS[0];
    res.json({
      success: true,
      mode: "RULE_ENGINE_FALLBACK",
      analysis: {
        suggestedHsCode: fallback.hsCode,
        suggestedNico: fallback.nico,
        description: fallback.description,
        estimatedIgi: `${fallback.igiPercent}%`,
        requiredNorms: fallback.regulations,
        advisories: [
          "Clasificaci\xF3n arancelaria orientativa basada en cat\xE1logo de comercio exterior.",
          "Recuerde validar con su Agente Aduanal colegiado antes de generar la proforma de pedimento."
        ]
      }
    });
  }
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, "dist")));
    app.get("*", (_req, res) => {
      res.sendFile(path.resolve(__dirname, "dist", "index.html"));
    });
  }
  app.listen(port, "0.0.0.0", () => {
    console.log(`[AduanaFlow Server] Corriendo en http://0.0.0.0:${port}`);
    console.log(`[AduanaFlow Server] API REST activa en http://0.0.0.0:${port}/api/v1`);
  });
}
startServer();
