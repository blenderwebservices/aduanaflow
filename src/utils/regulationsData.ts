/**
 * AduanaFlow - Centro de Normatividad Actualizada de Comercio Exterior Mexicano
 * Compilación jurídica oficial organizada para PyMEs: leyes, reglamentos, tratados, RGCE y NOMs.
 */

export interface RegulationItem {
  id: string;
  order: number;
  category: 'LEYES' | 'REGLAS_RGCE' | 'TRATADOS' | 'NOMS_RRNA' | 'DERECHOS_IMPUESTOS';
  code: string;
  title: string;
  officialName: string;
  legalBasis: string;
  plainExplanation: string;
  practicalApplication: string;
  officialSource: string;
  sourceUrl?: string;
  publicationDate: string;
  lastUpdate: string;
  keyArticles?: { article: string; topic: string; summary: string }[];
}

export const REGULATIONS_CATALOG: RegulationItem[] = [
  {
    id: 'ley-aduanera',
    order: 1,
    category: 'LEYES',
    code: 'LA-MEX',
    title: 'Ley Aduanera (LA)',
    officialName: 'Ley Aduanera de los Estados Unidos Mexicanos',
    legalBasis: 'Diario Oficial de la Federación (DOF)',
    plainExplanation: 'Es la ley fundamental que regula la entrada y salida de mercancías del país, los impuestos que deben pagarse, las obligaciones de importadores, exportadores y agentes aduanales, y los procedimientos de inspección.',
    practicalApplication: 'Define cómo calcular el Valor en Aduana (base gravable de impuestos), qué gastos deben sumarse (fletes, seguros), cómo declarar el pedimento y las sanciones o embargos (PAMA) si hay discrepancias.',
    officialSource: 'Cámara de Diputados del H. Congreso de la Unión / DOF',
    sourceUrl: 'https://www.diputados.gob.mx/LeyesBiblio/pdf/LAdua.pdf',
    publicationDate: '15 de Diciembre de 1995',
    lastUpdate: 'Última reforma publicada DOF 12-Nov-2023 / Vigente 2026',
    keyArticles: [
      {
        article: 'Artículo 35 y 36',
        topic: 'Despacho aduanero y pedimento',
        summary: 'Obliga a tramitar un pedimento oficial ante la aduana a través de agente aduanal autorizado o agencia aduanal.',
      },
      {
        article: 'Artículo 36-A',
        topic: 'Documentos anexos al pedimento',
        summary: 'Establece los documentos obligatorios: factura comercial (COVE), conocimiento de embarque/guía, certificado de origen y cumplimiento de NOMs/RRNA.',
      },
      {
        article: 'Artículo 64 y 65',
        topic: 'Valor en Aduana e Incrementables',
        summary: 'Determina que la base gravable es el precio pagado más los incrementables (fletes internacionales, seguros, embalajes y maniobras en origen).',
      },
      {
        article: 'Artículo 150 y 151',
        topic: 'PAMA (Embargo precautorio)',
        summary: 'Faculta a las autoridades a embargar mercancías por omisión de impuestos superior al límite legal, falta de RRNA o datos falsos.',
      },
    ],
  },
  {
    id: 'rgce-anexo-22',
    order: 2,
    category: 'REGLAS_RGCE',
    code: 'RGCE-ANX22',
    title: 'Reglas Generales de Comercio Exterior y Anexo 22',
    officialName: 'Reglas Generales de Comercio Exterior y su Anexo 22: Instructivo para el llenado del Pedimento',
    legalBasis: 'Resolución SAT / ANAM publicada anualmente en el DOF',
    plainExplanation: 'Es el manual técnico y operativo que emite el SAT/ANAM para indicar con precisión quirúrgica cómo debe llenarse cada uno de los campos del pedimento aduanal, qué claves usar y qué validar.',
    practicalApplication: 'Los auditores y agentes aduanales lo usan como biblia técnica: define los 15 dígitos del número de pedimento, las claves de régimen (IMD, ITR), claves de pedimento (A1, IN, V1), identificadores de partidas y formas de pago.',
    officialSource: 'Servicio de Administración Tributaria (SAT) / DOF',
    sourceUrl: 'https://www.sat.gob.mx/normatividad/comercio-exterior',
    publicationDate: 'Publicación periódica DOF',
    lastUpdate: 'Compilación actualizada y vigente 2026',
    keyArticles: [
      {
        article: 'Apéndice 1',
        topic: 'Aduanas y Secciones Aduaneras',
        summary: 'Catálogo oficial de las 50 aduanas del país (ej. 160 Manzanillo, 240 Nuevo Laredo, 470 AICM).',
      },
      {
        article: 'Apéndice 2',
        topic: 'Claves de Pedimento',
        summary: 'Define A1 para importación definitiva, IN para maquiladoras IMMEX, R1 para rectificaciones, etc.',
      },
      {
        article: 'Apéndice 8',
        topic: 'Identificadores de Partidas',
        summary: 'Claves obligatorias para declarar permisos de Secretaría de Economía, certificados T-MEC, exenciones y reglas octavas.',
      },
    ],
  },
  {
    id: 'ligie-tigie',
    order: 3,
    category: 'LEYES',
    code: 'LIGIE-NICO',
    title: 'LIGIE y TIGIE con NICO (Sistema Armonizado)',
    officialName: 'Ley de los Impuestos Generales de Importación y de Exportación',
    legalBasis: 'Decreto DOF / Secretaría de Economía',
    plainExplanation: 'Clasifica todas las mercancías existentes en el mundo en un código numérico estándar de 8 dígitos (Fracción Arancelaria) más 2 dígitos mexicanos (NICO: Número de Identificación Comercial).',
    practicalApplication: 'A partir de este código de 10 dígitos se determina si tu producto paga 0%, 5%, 15% o 25% de arancel IGI, su unidad de medida y qué permisos o NOMs le aplican.',
    officialSource: 'Secretaría de Economía / SNICE / DOF',
    sourceUrl: 'https://www.snice.gob.mx',
    publicationDate: '07 de Junio de 2022',
    lastUpdate: 'Séptima Enmienda del Sistema Armonizado / DOF 2024-2026',
    keyArticles: [
      {
        article: 'Reglas Generales y Complementarias',
        topic: 'Criterios de Clasificación Arancelaria',
        summary: 'Reglas universales para clasificar productos compuestos, kits o incompletos atendiendo al carácter esencial.',
      },
      {
        article: 'Acuerdo NICO',
        topic: 'Números de Identificación Comercial',
        summary: 'Establece los 2 dígitos adicionales al código de 8 dígitos para recabar estadísticas comerciales específicas.',
      },
    ],
  },
  {
    id: 'ley-federal-derechos-dta',
    order: 4,
    category: 'DERECHOS_IMPUESTOS',
    code: 'LFD-ART49',
    title: 'Derecho de Trámite Aduanero (DTA) - Ley Federal de Derechos',
    officialName: 'Ley Federal de Derechos, Artículo 49',
    legalBasis: 'Ley Federal de Derechos (LFD), Artículo 49',
    plainExplanation: 'Es el pago obligatorio que se hace al Estado por el uso de las instalaciones, sistemas aduanales y el servicio de despacho de las mercancías.',
    practicalApplication: 'Para importaciones definitivas generales es del 8 al millar (0.008) sobre el Valor en Aduana, con una cuota mínima legal ($434 MXN). En casos de tratados como T-MEC o importaciones temporales IMMEX aplica cuota fija preferencial.',
    officialSource: 'Cámara de Diputados / SHCP',
    sourceUrl: 'https://www.diputados.gob.mx/LeyesBiblio/pdf/LFD.pdf',
    publicationDate: '31 de Diciembre de 1981',
    lastUpdate: 'Cuotas actualizadas anualmente en el Anexo 19 de la RMF / DOF',
    keyArticles: [
      {
        article: 'Art. 49 Fracción I',
        topic: 'Tasa General 8 al millar',
        summary: 'Aplica el 0.008 multiplicando el Valor en Aduana para mercancías bajo régimen definitivo.',
      },
      {
        article: 'Art. 49 Fracción III y IV',
        topic: 'Cuotas fijas y Tratados de Libre Comercio',
        summary: 'Exenciones o pago de cuota fija para operaciones bajo reglas de origen preferencial de tratados comerciales.',
      },
    ],
  },
  {
    id: 'ley-del-iva-importaciones',
    order: 5,
    category: 'DERECHOS_IMPUESTOS',
    code: 'LIVA-IMP',
    title: 'IVA en Importaciones (Ley del IVA)',
    officialName: 'Ley del Impuesto al Valor Agregado, Capítulos V y VI (Importación de Bienes)',
    legalBasis: 'Artículos 24, 25, 26, 27 y 28 de la LIVA',
    plainExplanation: 'Grava la introducción definitiva de bienes al territorio nacional con una tasa del 16%. Explica cómo se calcula la base gravable y cómo se acredita en la declaración mensual.',
    practicalApplication: 'La base gravable NO es solo el valor de la mercancía: se suma Valor en Aduana + IGI pagado + DTA pagado + Cuotas compensatorias. El resultado multiplicado por 16% es el IVA de importación, el cual es 100% acreditable si la PyME está en regla.',
    officialSource: 'Cámara de Diputados / SAT',
    sourceUrl: 'https://www.diputados.gob.mx/LeyesBiblio/pdf/LIVA.pdf',
    publicationDate: '29 de Diciembre de 1978',
    lastUpdate: 'Reformas vigentes DOF 2026',
    keyArticles: [
      {
        article: 'Artículo 24',
        topic: 'Actos gravados en importación',
        summary: 'Considera importación la introducción de bienes, el uso de servicios prestados por no residentes y el retorno de temporales.',
      },
      {
        article: 'Artículo 27',
        topic: 'Base del impuesto en importación',
        summary: 'La base gravable se integra con el Valor en Aduana adicionado con el IGI y demás contribuciones que se devenguen por la importación.',
      },
      {
        article: 'Artículo 28',
        topic: 'Pago y acreditamiento del IVA',
        summary: 'El IVA se paga conjuntamente con el pedimento aduanal y es acreditable en los términos del Artículo 5 de la Ley.',
      },
    ],
  },
  {
    id: 'tratado-tmec',
    order: 6,
    category: 'TRATADOS',
    code: 'T-MEC',
    title: 'Tratado entre México, Estados Unidos y Canadá (T-MEC / USMCA)',
    officialName: 'Tratado entre los Estados Unidos Mexicanos, los Estados Unidos de América y el Canadá',
    legalBasis: 'Decreto Promulgatorio DOF 29-Junio-2020',
    plainExplanation: 'Acuerdo comercial trilateral que elimina los aranceles de importación entre los tres países para aquellos bienes que cumplan con las reglas de contenido regional norteamericano.',
    practicalApplication: 'Permite importar miles de productos de EE.UU. y Canadá con 0% de IGI y cuota fija de DTA, siempre que se cuente con la Certificación de Origen con los 9 datos mínimos del Capítulo 5.',
    officialSource: 'Secretaría de Economía / USTR',
    sourceUrl: 'https://www.gob.mx/t-mec',
    publicationDate: '01 de Julio de 2020',
    lastUpdate: 'Revisión periódica y reglamentaciones uniformes vigentes',
    keyArticles: [
      {
        article: 'Capítulo 4',
        topic: 'Reglas de Origen',
        summary: 'Criterios de salto arancelario y Valor de Contenido Regional (VCR) para conferir origen norteamericano.',
      },
      {
        article: 'Capítulo 5',
        topic: 'Procedimientos de Origen',
        summary: 'Elimina el formato único oficial y permite la autocertificación por el importador, exportador o productor.',
      },
      {
        article: 'Capítulo 7',
        topic: 'Administración Aduanera y Facilitación del Comercio',
        summary: 'Despacho aduanero exprés, envíos de bajo valor (de minimis) y resoluciones anticipadas.',
      },
    ],
  },
  {
    id: 'noms-seguridad-etiquetado',
    order: 7,
    category: 'NOMS_RRNA',
    code: 'NOMS-SE',
    title: 'Normas Oficiales Mexicanas (NOMs) de Seguridad y Etiquetado',
    officialName: 'Acuerdo por el que la Secretaría de Economía emite las Reglas y Criterios de Carácter General en Materia de Comercio Exterior (Anexo de NOMs)',
    legalBasis: 'Ley de Infraestructura de la Calidad / Secretaría de Economía',
    plainExplanation: 'Regulaciones técnicas de observancia obligatoria que garantizan que los productos importados sean seguros, no dañen la salud y muestren etiquetas claras en español.',
    practicalApplication: 'Si tu producto requiere NOM (ej. electrodomésticos, juguetes, textiles, alimentos), la aduana NO liberará la carga a menos que el pedimento contenga el número de certificado emitido por un Organismo de Certificación o dictamen de UVA.',
    officialSource: 'Secretaría de Economía / SNICE / DOF',
    sourceUrl: 'https://www.snice.gob.mx/cs/avi/snice/noms.html',
    publicationDate: 'Compilación DOF periódica',
    lastUpdate: 'Actualizado conforme a modificaciones 2024-2026',
    keyArticles: [
      {
        article: 'NOM-050-SCFI-2004',
        topic: 'Información comercial en productos generales',
        summary: 'Etiquetado en español con nombre del producto, importador, RFC, país de origen, advertencias y garantías.',
      },
      {
        article: 'NOM-001 / NOM-019-SCFI',
        topic: 'Seguridad en aparatos electrónicos y cómputo',
        summary: 'Certificación en laboratorio para evitar descargas eléctricas o sobrecalentamiento en laptops, adaptadores y monitores.',
      },
      {
        article: 'NOM-004-SE-2021',
        topic: 'Información comercial en textiles y prendas',
        summary: 'Composición de fibras en porcentaje, instrucciones de lavado y talla en idioma español.',
      },
    ],
  },
];

