/**
 * AduanaFlow - Glosario Integral de Comercio Exterior y Aduanas de México
 * Definiciones técnicas explicadas en lenguaje amigable para importadores y PyMEs.
 */

export interface GlossaryTerm {
  term: string;
  acronym?: string;
  category: 'ADUANAS' | 'FISCAL' | 'LOGISTICA' | 'NORMATIVA';
  shortDefinition: string;
  detailedExplanation: string;
  legalBasis?: string;
  pymeTip: string;
}

export const CUSTOMS_GLOSSARY: GlossaryTerm[] = [
  {
    term: 'PAMA',
    acronym: 'Procedimiento Administrativo en Materia Aduanera',
    category: 'ADUANAS',
    shortDefinition: 'Procedimiento legal sancionador en el que la autoridad embarga precautoriamente las mercancías e inicia un juicio fiscal contra el importador.',
    detailedExplanation: 'Se inicia cuando la autoridad aduanera detecta infracciones graves: subvaluación superior al 50%, falta de permisos previos o NOMs de seguridad, mercancía no declarada o excedente en más del 10%, o cuando el importador no acredita la legal estancia.',
    legalBasis: 'Artículos 150 y 151 de la Ley Aduanera.',
    pymeTip: 'Es el mayor riesgo de un importador. Se previene auditando con lupa el pedimento, packing list y teniendo los certificados NOM antes de que el barco arribe a México.',
  },
  {
    term: 'VUCEM',
    acronym: 'Ventanilla Digital Mexicana de Comercio Exterior',
    category: 'NORMATIVA',
    shortDefinition: 'Plataforma informática federal que centraliza y digitaliza todos los trámites de comercio exterior ante el gobierno mexicano.',
    detailedExplanation: 'Permite enviar de manera digital y en un solo punto información para cumplir con todos los trámites de importación y exportación, como COVEs, permisos de Secretaría de Economía, SAGARPA, COFEPRIS y padrones.',
    legalBasis: 'Decreto por el que se establece la Ventanilla Digital Mexicana de Comercio Exterior.',
    pymeTip: 'Tu empresa necesita contar con e.firma (FIEL) activa y vigente del SAT para operar en VUCEM y otorgar el encargo conferido a tu agente aduanal.',
  },
  {
    term: 'NICO',
    acronym: 'Número de Identificación Comercial',
    category: 'NORMATIVA',
    shortDefinition: 'Quinto par de dígitos (del 9º al 10º) añadido a la fracción arancelaria para clasificar con mayor detalle las mercancías.',
    detailedExplanation: 'En México la fracción arancelaria tiene 8 dígitos (Capítulo, Partida, Subpartida y Fracción). Los 2 dígitos del NICO permiten obtener estadísticas más precisas sin alterar las tasas de aranceles.',
    legalBasis: 'Ley de los Impuestos Generales de Importación y de Exportación (LIGIE 2022/2026).',
    pymeTip: 'Al solicitar una proforma a tu agente aduanal, exige siempre el código completo de 10 dígitos (8 de Fracción + 2 de NICO).',
  },
  {
    term: 'Incrementables',
    category: 'FISCAL',
    shortDefinition: 'Gastos a cargo del importador devengados antes de que la mercancía cruce la aduana, que deben sumarse al precio pagado para calcular el Valor en Aduana.',
    detailedExplanation: 'Incluye fletes internacionales, seguros de carga, embalajes, envases, gastos de carga y descarga en origen, y regalías. Si el Incoterm no los incluye en la factura (ej. FOB, EXW), es obligatorio declararlos y sumarlos.',
    legalBasis: 'Artículo 65 de la Ley Aduanera.',
    pymeTip: 'Omitir los incrementables en una importación FOB para "pagar menos impuestos" es considerado delito de subvaluación y causa inmediata de PAMA y multas.',
  },
  {
    term: 'DTA',
    acronym: 'Derecho de Trámite Aduanero',
    category: 'FISCAL',
    shortDefinition: 'Contraprestación tributaria que se paga a la Federación por las operaciones aduaneras que se efectúan con un pedimento.',
    detailedExplanation: 'En importación definitiva general equivale al 8 al millar (0.008 o 0.8%) sobre el Valor en Aduana. Tiene cuotas mínimas y cuotas fijas específicas para tratados como el T-MEC o importaciones temporales.',
    legalBasis: 'Artículo 49 de la Ley Federal de Derechos.',
    pymeTip: 'Si importas mercancía originaria de EE.UU. o Canadá bajo T-MEC con Certificado de Origen válido, el DTA no paga el 8 al millar, sino una cuota fija reducida.',
  },
  {
    term: 'IGI',
    acronym: 'Impuesto General de Importación',
    category: 'FISCAL',
    shortDefinition: 'Arancel federal que se aplica a la entrada de mercancías extranjeras a territorio nacional.',
    detailedExplanation: 'Puede ser ad-valorem (un porcentaje sobre el valor en aduana, ej. 15%), específico (una cuota fija por unidad de medida, ej. $0.50 USD por kilo) o mixto.',
    legalBasis: 'Artículo 1 de la LIGIE y Artículo 12 de la Ley de Comercio Exterior.',
    pymeTip: 'Revisa si tu producto puede gozar de arancel 0% mediante Tratados de Libre Comercio (TLC) o mediante el programa de reducción arancelaria PROSEC.',
  },
  {
    term: 'Subvaluación',
    category: 'FISCAL',
    shortDefinition: 'Práctica ilegal de declarar un precio de compra o valor en aduana inferior al valor real pagado para evadir impuestos.',
    detailedExplanation: 'El SAT cuenta con un catálogo de Precios Estimados y cruces bancarios con aduanas extranjeras. Si el valor declarado es sospechosamente bajo, la aduana exigirá garantizar la diferencia mediante cuenta aduanera o retendrá la mercancía.',
    legalBasis: 'Artículo 86-A de la Ley Aduanera y Art. 108 del CFF.',
    pymeTip: 'Nunca aceptes facturas "por menor valor" propuestas por proveedores en China o internet; el SAT coteja las transferencias bancarias internacionales (SWIFT).',
  },
  {
    term: 'Padrón de Importadores',
    category: 'NORMATIVA',
    shortDefinition: 'Registro oficial ante el SAT que habilita a personas físicas y morales mexicanas para importar legalmente mercancías.',
    detailedExplanation: 'Para estar inscrito se requiere estar al corriente en obligaciones fiscales (Opinión de Cumplimiento 32-D positiva), tener e.firma activa y domicilio fiscal localizado por el SAT.',
    legalBasis: 'Artículo 59, Fracción IV de la Ley Aduanera; Regla 1.3.1 de las RGCE.',
    pymeTip: 'Si vas a importar calzado, textiles, acero, alcohol o químicos, además requieres tramitar el Padrón de Importadores de Sectores Específicos.',
  },
  {
    term: 'Agente Aduanal',
    category: 'ADUANAS',
    shortDefinition: 'Profesionista autorizado por el SAT mediante una patente para promover el despacho de mercancías en los diferentes regímenes aduaneros.',
    detailedExplanation: 'Es el representante legal y solidariamente responsable de la veracidad y exactitud de los datos consignados en el pedimento, la clasificación arancelaria y el cumplimiento de NOMs.',
    legalBasis: 'Artículos 159 a 167 de la Ley Aduanera.',
    pymeTip: 'Elige un agente aduanal con experiencia comprobable en tu tipo de producto y con patente adscrita a la aduana por donde arriba tu carga (ej. Manzanillo o Nuevo Laredo).',
  },
  {
    term: 'Reconocimiento Aduanero',
    category: 'ADUANAS',
    shortDefinition: 'Inspección física y documental de las mercancías que realiza la autoridad aduanera (coloquialmente conocido como Semáforo Rojo).',
    detailedExplanation: 'Se detona tras accionar el Mecanismo de Selección Automatizada en el módulo de salida. El verificador revisa que lo declarado en el pedimento coincida con el contenido físico de los contenedores.',
    legalBasis: 'Artículo 43 y 44 de la Ley Aduanera.',
    pymeTip: 'Si te toca rojo, mantén la calma. Si tu expediente digital, packing list y facturas coinciden exactamente, el reconocimiento se libera en pocas horas.',
  },
  {
    term: 'Desaduanamiento Libre',
    category: 'ADUANAS',
    shortDefinition: 'Resultado del Mecanismo de Selección Automatizada que autoriza la salida inmediata de la mercancía sin revisión física (Semáforo Verde).',
    detailedExplanation: 'Permite retirar el contenedor o camión de la aduana para iniciar el transporte terrestre de última milla hacia la bodega del importador.',
    legalBasis: 'Artículo 43 de la Ley Aduanera.',
    pymeTip: 'Que salga verde no exime a la empresa de una auditoría posterior (visita domiciliaria o revisión de gabinete) durante los 5 años siguientes.',
  },
  {
    term: 'Cuotas Compensatorias',
    category: 'FISCAL',
    shortDefinition: 'Gravamen adicional impuesto por la Secretaría de Economía a mercancías importadas en condiciones de discriminación de precios (dumping) o subsidios.',
    detailedExplanation: 'Tienen como objetivo nivelar los precios internacionales con la industria nacional. Suelen aplicarse a productos como calzado, confección, vajillas o acero procedentes de países como China.',
    legalBasis: 'Artículos 62 a 71 de la Ley de Comercio Exterior.',
    pymeTip: 'Siempre investiga si tu producto tiene resoluciones de cuota compensatoria vigentes antes de ordenar muestras o dar anticipos a proveedores.',
  },
  {
    term: 'Regla Octava (Regla 8va)',
    category: 'NORMATIVA',
    shortDefinition: 'Permiso previo de la Secretaría de Economía que permite importar con arancel preferencial (usualmente 0%) insumos, partes o maquinaria no producidos en el país.',
    detailedExplanation: 'Forma parte de la Fracción Arancelaria 9802 y se utiliza comúnmente para apoyar a la industria de manufactura y PyMEs con insumos críticos especializados.',
    legalBasis: 'Artículo 2, Fracción II, Regla Complementaria 8ª de la LIGIE.',
    pymeTip: 'Aplica principalmente cuando no existe fabricación nacional del bien y requieres abaratar los costos de insumos esenciales.',
  },
  {
    term: 'Carta Porte con Complemento',
    category: 'LOGISTICA',
    shortDefinition: 'CFDI emitido por la empresa transportista que acredita la legal tenencia y traslado de mercancías en carreteras federales mexicanas.',
    detailedExplanation: 'Contiene más de 180 campos de información sobre origen, destino, operador, camión, remolque, mercancía y número de pedimento de importación.',
    legalBasis: 'Artículos 29 y 29-A del CFF y reglas de la Resolución Miscelánea Fiscal.',
    pymeTip: 'No permitas que el transportista mueva tu carga si no te ha compartido el PDF y XML de la Carta Porte timbrada con el complemento correcto.',
  },
];

