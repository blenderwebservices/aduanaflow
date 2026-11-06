/**
 * AduanaFlow - Catálogo Oficial de Documentos de Comercio Exterior
 * Biblioteca documental con información técnica, emisores, contenido, errores comunes y base legal.
 */

export interface CustomsDocumentItem {
  id: string;
  code: string;
  title: string;
  subtitle: string;
  category: 'COMERCIAL' | 'TRANSPORTE' | 'ADUANAL' | 'CUMPLIMIENTO';
  whatIsIt: string;
  whatIsItFor: string;
  whoIssuesIt: string;
  whenIsItUsed: string;
  mandatoryContent: string[];
  commonPitfalls: string[];
  bestPractices: string[];
  legalReference: string;
  sampleFileStructure?: string;
}

export const CUSTOMS_DOCUMENTS_CATALOG: CustomsDocumentItem[] = [
  {
    id: 'factura-comercial',
    code: 'FAC-01',
    title: 'Factura Comercial Internacional',
    subtitle: 'Commercial Invoice (Art. 36-A Ley Aduanera)',
    category: 'COMERCIAL',
    whatIsIt: 'Documento mercantil emitido por el vendedor extranjero que formaliza la transacción de compraventa y acredita el valor de las mercancías importadas.',
    whatIsItFor: 'Constituye la base principal para determinar el Valor Comercial y el Valor en Aduana de las mercancías conforme al Artículo 64 de la Ley Aduanera, determinando los impuestos a pagar.',
    whoIssuesIt: 'El proveedor o exportador en el país de origen.',
    whenIsItUsed: 'Antes del embarque internacional y obligatoriamente durante la transmisión del COVE en la VUCEM previo al despacho aduanero.',
    mandatoryContent: [
      'Lugar y fecha de expedición.',
      'Nombre y domicilio fiscal del vendedor/proveedor extranjero.',
      'Nombre, domicilio y RFC del comprador/importador mexicano.',
      'Descripción comercial detallada de la mercancía (marca, modelo, número de serie, especificaciones).',
      'Cantidad, unidad de medida comercial y precio unitario.',
      'Moneda de facturación y valor total.',
      'Incoterm 2020 pactado (con ciudad o puerto específico).',
      'Condiciones de pago y descuentos comerciales (si existen).',
    ],
    commonPitfalls: [
      'Descripciones genéricas como "partes electrónicas" o "ropa" (rechazadas por el SAT).',
      'Omitir el Incoterm o ponerlo sin indicar el lugar geográfico específico.',
      'Discrepancia entre la moneda facturada y la declarada en el COVE / Pedimento.',
      'Facturas con precios que no reflejan el valor real pagado (riesgo de auditoría por subvaluación).',
    ],
    bestPractices: [
      'Solicitar que el proveedor redacte la descripción en español o con traducción oficial.',
      'Verificar que el RFC del importador esté idéntico a la Constancia de Situación Fiscal vigente.',
      'Asegurarse de que desglose los costos de flete y seguro si el Incoterm es CIF o CFR.',
    ],
    legalReference: 'Art. 36-A, Fracc. I, Inciso a) de la Ley Aduanera; Regla 3.1.8 de las RGCE.',
  },
  {
    id: 'packing-list',
    code: 'PL-02',
    title: 'Lista de Empaque',
    subtitle: 'Packing List de Mercancías',
    category: 'COMERCIAL',
    whatIsIt: 'Documento que detalla el desglose físico, embalaje, pesos y medidas de todos los bultos que integran un embarque.',
    whatIsItFor: 'Permite a los transportistas, almacenadoras y autoridades aduaneras verificar físicamente la carga sin necesidad de abrir cada caja o pallet, facilitando el reconocimiento aduanero.',
    whoIssuesIt: 'El vendedor, fabricante o consolidador de carga (Freight Forwarder).',
    whenIsItUsed: 'Durante la carga en origen, maniobras de puerto/aeropuerto, inspección en aduana y recepción en el almacén de destino.',
    mandatoryContent: [
      'Número de bultos, cajas, pallets o atados totales.',
      'Marcas y números de identificación en los paquetes.',
      'Peso bruto y peso neto total y por cada bulto (en kg o lbs).',
      'Dimensiones cúbicas (largo, ancho y alto) de cada bulto.',
      'Contenido específico por cada paquete o contenedor.',
      'Referencia a la factura comercial correspondiente.',
    ],
    commonPitfalls: [
      'Discrepancia de peso bruto entre el Packing List, el Bill of Lading y el Pedimento (causa común de detención de carga).',
      'No distinguir entre peso neto (mercancía) y peso bruto (mercancía + embalaje/tarima).',
      'Omitir numerar los bultos consecutivamente en cargas consolidadas.',
    ],
    bestPractices: [
      'Cotejar que el peso total coincida con el ticket de báscula de la terminal portuaria.',
      'Exigir al proveedor que detalle el número de tarimas y si son de madera tratada con sello NIMF-15.',
    ],
    legalReference: 'Art. 36-A de la Ley Aduanera y Anexo 22 de las RGCE (Campos de peso y bultos).',
  },
  {
    id: 'bill-of-lading',
    code: 'BL-03',
    title: 'Conocimiento de Embarque Marítimo',
    subtitle: 'Bill of Lading (B/L)',
    category: 'TRANSPORTE',
    whatIsIt: 'Título de crédito y contrato de transporte marítimo internacional que acredita la posesión y propiedad de las mercancías a bordo de un buque.',
    whatIsItFor: 'Ampara el transporte marítimo, sirve como recibo de la naviera y es indispensable para que el Agente Aduanal revalide la carga en el puerto mexicano.',
    whoIssuesIt: 'La línea naviera (Master B/L) o el agente de carga / forwarder (House B/L).',
    whenIsItUsed: 'Desde el zarpe del buque en el puerto de origen hasta la revalidación en el puerto mexicano de arribo (ej. Manzanillo, Veracruz).',
    mandatoryContent: [
      'Nombre de la naviera, buque y número de viaje.',
      'Puerto de carga (POL) y puerto de descarga (POD).',
      'Embarcador (Shipper), Consignatario (Consignee) y Notificador (Notify Party).',
      'Número de contenedor y número de sellos de seguridad intactos.',
      'Descripción general de mercancías, peso bruto y volumen (CBM).',
      'Condición de flete: Freight Prepaid (pagado en origen) o Freight Collect (por cobrar en destino).',
    ],
    commonPitfalls: [
      'No liberar o revalidar el B/L a tiempo, generando demoras millonarias de contenedores en puerto.',
      'Errores en el nombre del consignatario que impiden la revalidación por parte del Agente Aduanal.',
      'Confundir House B/L con Master B/L al momento de solicitar la liberación.',
    ],
    bestPractices: [
      'Solicitar Telex Release (liberación electrónica) para evitar el envío de B/L originales en papel.',
      'Vigilar los días libres de demora otorgados por la naviera (habitualmente entre 7 y 14 días).',
    ],
    legalReference: 'Art. 20, Fracc. VII y Art. 36-A, Fracc. I, Inciso b) de la Ley Aduanera.',
  },
  {
    id: 'air-waybill',
    code: 'AWB-04',
    title: 'Guía Aérea Internacional',
    subtitle: 'Air Waybill (AWB)',
    category: 'TRANSPORTE',
    whatIsIt: 'Documento contractual del transporte aéreo de carga que certifica la recepción de la mercancía por la aerolínea y las condiciones del vuelo.',
    whatIsItFor: 'Acredita el flete aéreo, identifica el aeropuerto de entrada en México (ej. AICM, AIFA, GDL) y ampara el valor del flete para el cálculo de incrementables.',
    whoIssuesIt: 'La aerolínea de carga (Master AWB) o el agente de carga IATA (House AWB).',
    whenIsItUsed: 'Durante el transporte aéreo y en la aduana aeroportuaria para el despacho.',
    mandatoryContent: [
      'Código de aerolínea (3 dígitos) y número de guía (8 dígitos).',
      'Aeropuerto de origen y destino con códigos IATA.',
      'Dimensiones, peso físico y peso volumétrico tarifado.',
      'Tarifa y desglose de recargos (combustible FSC, seguridad SSC).',
      'Instrucciones de manejo especial (mercancía perecedera, frágil o peligrosa DGR).',
    ],
    commonPitfalls: [
      'No contemplar la diferencia entre peso báscula y peso volumétrico (IATA: Largo x Ancho x Alto / 6000), encareciendo el flete.',
      'Falta de desglose de recargos que impida determinar si forman parte de los incrementables aduanales.',
    ],
    bestPractices: [
      'Dar aviso anticipado al Agente Aduanal del vuelo de arribo para preparar el pedimento previo a la desconsolidación.',
    ],
    legalReference: 'Art. 36-A de la Ley Aduanera y Ley de Aviación Civil.',
  },
  {
    id: 'carta-porte',
    code: 'CP-05',
    title: 'Carta Porte con Complemento SAT',
    subtitle: 'CFDI de Ingreso / Traslado con Complemento Carta Porte 3.1',
    category: 'TRANSPORTE',
    whatIsIt: 'Comprobante Fiscal Digital por Internet (CFDI) que acredita el transporte legal de mercancías en territorio nacional por vía terrestre.',
    whatIsItFor: 'Ampara la legal tenencia y traslado de mercancías desde la aduana de despacho hasta las bodegas del importador, combatiendo el contrabando.',
    whoIssuesIt: 'La empresa transportista permisionaria (CFDI Ingreso) o el dueño del camión propio (CFDI Traslado).',
    whenIsItUsed: 'Al momento de salir de la aduana y durante todo el tránsito por carreteras federales de México.',
    mandatoryContent: [
      'Claves de producto y servicio del catálogo SAT Carta Porte.',
      'Claves de fracción arancelaria (para mercancías importadas).',
      'Número de pedimento aduanal que ampara la importación.',
      'Datos del operador: RFC, número de licencia federal vigente.',
      'Identificación vehicular: Placas, permiso SCT y póliza de seguro de responsabilidad civil.',
      'Ruta con origen, paradas intermedias y destino con código postal.',
    ],
    commonPitfalls: [
      'No incluir el número de pedimento completo de 15 dígitos en el complemento Carta Porte.',
      'Transportistas que inician ruta sin timbrar el CFDI con complemento (multas severas de la Guardia Nacional y SAT).',
    ],
    bestPractices: [
      'Exigir el PDF y XML timbrado al transportista antes de que el camión cruce la esclusa aduanera.',
    ],
    legalReference: 'Art. 29 y 29-A del CFF; Reglas 2.7.7.1.1 a 2.7.7.2.8 de la Resolución Miscelánea Fiscal vigente.',
  },
  {
    id: 'certificado-origen',
    code: 'CO-06',
    title: 'Certificado de Origen',
    subtitle: 'Prueba de Origen para Tratados de Libre Comercio (T-MEC, TLCUEM, etc.)',
    category: 'CUMPLIMIENTO',
    whatIsIt: 'Documento o declaración que certifica que las mercancías cumplen con las Reglas de Origen establecidas en un tratado comercial internacional suscrito por México.',
    whatIsItFor: 'Permite al importador aplicar un arancel preferencial (frecuentemente 0% de IGI en lugar del 15% o 25% general) y en muchos casos cuota fija de DTA.',
    whoIssuesIt: 'El exportador, productor o, en tratados modernos como T-MEC, el propio importador con conocimiento de causa.',
    whenIsItUsed: 'Al momento de elaborar el pedimento de importación para declarar la clave de preferencia arancelaria.',
    mandatoryContent: [
      'Datos completos del certificador, exportador, productor e importador.',
      'Descripción detallada y fracción arancelaria (al menos a nivel de 6 dígitos del Sistema Armonizado).',
      'Criterio de origen aplicable (ej. A, B, C, D del T-MEC).',
      'Período que cubre (declaración de embarque único o período global de hasta 12 meses).',
      'Firma autógrafa o digital autorizada y fecha de emisión.',
    ],
    commonPitfalls: [
      'Usar un certificado de formato TLCAN vencido en lugar del formato libre con datos mínimos de T-MEC.',
      'Declarar origen de un país intermedio donde la mercancía solo transitó sin transformación sustancial.',
      'Inconsistencia entre la fracción arancelaria del certificado y la del pedimento.',
    ],
    bestPractices: [
      'Verificar con el fabricante la regla de salto arancelario o Valor de Contenido Regional (VCR) antes de firmar.',
      'Guardar el expediente de origen durante 5 años conforme al Art. 67 del Código Fiscal de la Federación.',
    ],
    legalReference: 'Capítulo 5 del T-MEC; Art. 36-A de la Ley Aduanera; Reglas Generales de Comercio Exterior.',
  },
  {
    id: 'pedimento-aduanal',
    code: 'PED-07',
    title: 'Pedimento Aduanal',
    subtitle: 'Declaración Fiscal de Comercio Exterior (Anexo 22 RGCE)',
    category: 'ADUANAL',
    whatIsIt: 'Declaración fiscal oficial y formato oficial aprobado por el SAT/ANAM que formaliza la entrada o salida de mercancías del territorio nacional.',
    whatIsItFor: 'Acredita la legal importación, estancia y tenencia de mercancías en México; contiene la determinación y pago de contribuciones (IGI, DTA, IVA, IEPS).',
    whoIssuesIt: 'El Agente Aduanal o Agencia Aduanal autorizada con patente legal.',
    whenIsItUsed: 'Durante el despacho aduanero y como comprobante contable y fiscal permanente del importador.',
    mandatoryContent: [
      'Número de pedimento estructurado de 15 dígitos.',
      'Clave de pedimento (A1, IN, etc.) y régimen aduanero (IMD, etc.).',
      'Datos del importador (RFC, razón social, domicilio fiscal).',
      'Valores: Valor comercial USD, valor aduana MXN, tipo de cambio DOF.',
      'Liquidación de contribuciones y derechos aduanales.',
      'Partidas con fracción arancelaria, NICO, descripción, unidad, cantidad y aranceles.',
      'Certificación del banco o línea de captura electrónica pagada.',
    ],
    commonPitfalls: [
      'Errores en el número de serie, marcas o modelo en el campo de observaciones/partidas.',
      'Omisión de incrementables obligatorios en el bloque de valores.',
      'Clave de pedimento errónea que imposibilita la deducción del IVA o la deducibilidad del costo.',
    ],
    bestPractices: [
      'Revisar exhaustivamente la proforma enviada por la Agencia Aduanal antes de autorizar el pago.',
      'Integrar el pedimento completo junto con el archivo XML y el acuse de validación electrónica en el expediente digital.',
    ],
    legalReference: 'Arts. 36, 36-A, 81, 89 de la Ley Aduanera; Anexo 22 de las RGCE.',
  },
  {
    id: 'doda-sat',
    code: 'DODA-08',
    title: 'DODA (Documento de Operación para Despacho Aduanero)',
    subtitle: 'Documento con Código QR para Cruce de Módulo de Selección Automatizada',
    category: 'ADUANAL',
    whatIsIt: 'Formato digital con código de barras bidimensional QR que consolida la información de uno o varios pedimentos transmitidos electrónicamente.',
    whatIsItFor: 'Se presenta ante el módulo aduanal para accionar el Mecanismo de Selección Automatizada (semáforo fiscal: Verde = desaduanamiento libre, Rojo = reconocimiento aduanero).',
    whoIssuesIt: 'El Agente Aduanal a través del portal de la ANAM / SAT.',
    whenIsItUsed: 'Físicamente o en dispositivo electrónico en el carril de entrada de la aduana.',
    mandatoryContent: [
      'Código QR de alta densidad.',
      'Número de integración DODA.',
      'Números de pedimento asociados.',
      'Aduana y sección aduanera de despacho.',
      'Número de candados fiscales (sellos) y número de contenedor/remolque.',
    ],
    commonPitfalls: [
      'Llevar el código QR arrugado, manchado o con baja resolución que el escáner del módulo no pueda leer.',
      'Intentar cruzar con candados fiscales distintos a los declarados en el DODA.',
    ],
    bestPractices: [
      'Entregar copia digitalizada clara al chofer de la unidad y confirmar que los números de sello coincidan 100%.',
    ],
    legalReference: 'Regla 3.1.33 de las Reglas Generales de Comercio Exterior.',
  },
  {
    id: 'cove-vucem',
    code: 'COVE-09',
    title: 'COVE (Comprobante de Valor Electrónico)',
    subtitle: 'Transmisión Digital de Facturas en VUCEM (E-Document)',
    category: 'ADUANAL',
    whatIsIt: 'Acuse electrónico generado en la Ventanilla Digital Mexicana de Comercio Exterior (VUCEM) que contiene los datos de la factura comercial transmitidos de forma previa.',
    whatIsItFor: 'Sustituye la presentación física de la factura comercial en el despacho aduanero y asigna un número de E-Document que se asienta en el pedimento.',
    whoIssuesIt: 'El importador con su e.firma o el Agente Aduanal mediante mandato digital.',
    whenIsItUsed: 'Antes de validar y pagar el pedimento aduanal.',
    mandatoryContent: [
      'Número de COVE y firma electrónica del emisor.',
      'Datos completos de factura, proveedor, destinatario y desglose de mercancías.',
      'Relación de números de serie, parte y marcas.',
    ],
    commonPitfalls: [
      'Inconsistencia entre los importes del COVE y los importes impresos en el pedimento.',
      'Transmisión extemporánea que retrasa la validación del pedimento.',
    ],
    bestPractices: [
      'Comprobar que el número de E-Document esté correctamente asentado en el bloque de identificadores del pedimento.',
    ],
    legalReference: 'Art. 36-A de la Ley Aduanera; Reglas 1.9.16 y 3.1.8 de las RGCE.',
  },
  {
    id: 'manifestacion-valor',
    code: 'MV-10',
    title: 'Manifestación de Valor en Aduana',
    subtitle: 'Declaración Bajo Protesta de Decir Verdad (Arts. 59 y 81 Ley Aduanera)',
    category: 'ADUANAL',
    whatIsIt: 'Declaración jurada donde el importador manifiesta al Agente Aduanal y al SAT el valor comercial real de las mercancías y todos los gastos incrementables y decrementables.',
    whatIsItFor: 'Proporciona certidumbre y respaldo legal sobre cómo se determinó el Valor en Aduana, protegiendo al contribuyente ante auditorías de fiscalización posterior.',
    whoIssuesIt: 'El representante legal del importador con facultades fiscales.',
    whenIsItUsed: 'Previo a cada operación de importación o mediante manifestación periódica cuando proceda.',
    mandatoryContent: [
      'Método de valoración aduanera utilizado (Valor de transacción, mercancías idénticas, etc.).',
      'Desglose exacto de incrementables (fletes, seguros, regalías, comisiones).',
      'Existencia o inexistencia de vinculación comercial entre comprador y vendedor.',
      'Documentos anexos de soporte (comprobante de pago bancario, contrato de compraventa, póliza de seguro).',
    ],
    commonPitfalls: [
      'No contar con el comprobante de transferencia bancaria al proveedor que ampare el monto manifestado.',
      'Manifestar que no hubo fletes en operaciones marítimas con Incoterm FOB.',
    ],
    bestPractices: [
      'Conservar el expediente con los comprobantes de pago de los fletes internacionales por 5 años.',
    ],
    legalReference: 'Arts. 59, Fracc. III y 81 de la Ley Aduanera; Art. 220 de su Reglamento; Regla 1.5.1 de las RGCE.',
  },
  {
    id: 'rrna-permisos',
    code: 'RRNA-11',
    title: 'Documentos de RRNA y NOMs',
    subtitle: 'Regulaciones y Restricciones No Arancelarias (Secretaría de Economía / COFEPRIS)',
    category: 'CUMPLIMIENTO',
    whatIsIt: 'Certificados, permisos previos, autorizaciones sanitarias o constancias de cumplimiento que acreditan que una mercancía cumple con regulaciones de seguridad, salud o etiquetado.',
    whatIsItFor: 'Evitar el embargo precautorio de mercancías (PAMA) por incumplimiento de normativas técnicas obligatorias en territorio mexicano.',
    whoIssuesIt: 'Dependencias gubernamentales (Secretaría de Economía, SEMARNAT, COFEPRIS, SENASICA) y Organismos de Certificación acreditados.',
    whenIsItUsed: 'Antes del embarque y validado digitalmente en el pedimento aduanal con el número de folio oficial.',
    mandatoryContent: [
      'Folio oficial de autorización gubernamental.',
      'Fracción arancelaria y NICO de la mercancía.',
      'Nombre y RFC de la empresa autorizada.',
      'Vigencia del permiso o certificado.',
      'Especificaciones técnicas y descripción del producto avalado.',
    ],
    commonPitfalls: [
      'Arribar a la aduana sin el certificado NOM emitido, provocando retención forzosa y pago de almacenajes portuarios.',
      'Confundir una NOM de información comercial (etiquetado) con una NOM de seguridad eléctrica/electrónica.',
    ],
    bestPractices: [
      'Enviar muestras previas al laboratorio acreditado en México meses antes de la primera importación comercial masiva.',
      'Gestionar la Constancia de Conformidad ante Unidad de Verificación Acreditada (UVA) cuando aplique.',
    ],
    legalReference: 'Art. 36-A, Fracc. I, Inciso c) y Art. 150 de la Ley Aduanera; Ley de Infraestructura de la Calidad.',
  },
];

