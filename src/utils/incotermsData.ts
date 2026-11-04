/**
 * AduanaFlow - Base de Conocimiento de Incoterms 2020 (ICC)
 * Matriz interactiva de responsabilidades, transferencia de riesgo y recomendaciones PyME.
 */

export interface IncotermObligation {
  stage: string;
  sellerObligation: boolean;
  buyerObligation: boolean;
  notes: string;
}

export interface IncotermInfo {
  code: string;
  name: string;
  nameEs: string;
  category: 'MULTIMODAL' | 'MARITIMO';
  riskTransferPoint: string;
  costTransferPoint: string;
  transportTypes: string[];
  pymeRecommendation: 'HIGH' | 'MEDIUM' | 'CAUTION';
  pymeRecommendationText: string;
  commonPitfall: string;
  obligations: {
    packaging: 'SELLER' | 'BUYER';
    originLoading: 'SELLER' | 'BUYER';
    originInland: 'SELLER' | 'BUYER';
    exportClearance: 'SELLER' | 'BUYER';
    originTerminalHandling: 'SELLER' | 'BUYER';
    mainFreight: 'SELLER' | 'BUYER';
    cargoInsurance: 'SELLER' | 'BUYER' | 'NEGOTIABLE';
    destinationTerminalHandling: 'SELLER' | 'BUYER';
    importClearance: 'SELLER' | 'BUYER';
    finalDelivery: 'SELLER' | 'BUYER';
  };
}

export const INCOTERMS_2020: IncotermInfo[] = [
  {
    code: 'EXW',
    name: 'Ex Works',
    nameEs: 'En fábrica',
    category: 'MULTIMODAL',
    riskTransferPoint: 'En el almacén o fábrica del vendedor, antes de cargar la mercancía al transporte.',
    costTransferPoint: 'En las instalaciones del vendedor (el comprador cubre el 100% de la cadena logística).',
    transportTypes: ['Aéreo', 'Marítimo', 'Terrestre', 'Ferroviario', 'Multimodal'],
    pymeRecommendation: 'CAUTION',
    pymeRecommendationText: 'No recomendado para PyMEs novatas. La PyME compradora debe tramitar el despacho aduanal de exportación en el país de origen (ej. China o Europa), lo cual es sumamente complejo sin presencia física o agente local.',
    commonPitfall: 'Creer que es el más barato porque el precio unitario es menor, pero al sumar fletes locales, maniobras en origen y trámites aduanales extranjeros el costo final se dispara.',
    obligations: {
      packaging: 'SELLER',
      originLoading: 'BUYER',
      originInland: 'BUYER',
      exportClearance: 'BUYER',
      originTerminalHandling: 'BUYER',
      mainFreight: 'BUYER',
      cargoInsurance: 'BUYER',
      destinationTerminalHandling: 'BUYER',
      importClearance: 'BUYER',
      finalDelivery: 'BUYER',
    },
  },
  {
    code: 'FCA',
    name: 'Free Carrier',
    nameEs: 'Franco Porteador',
    category: 'MULTIMODAL',
    riskTransferPoint: 'Al entregar la mercancía al transportista designado por el comprador en el punto convenido de origen.',
    costTransferPoint: 'Punto de entrega acordado en el país de origen (el vendedor despacha la exportación).',
    transportTypes: ['Aéreo', 'Marítimo', 'Terrestre', 'Ferroviario', 'Multimodal'],
    pymeRecommendation: 'HIGH',
    pymeRecommendationText: 'Altamente recomendado para PyMEs que importan por vía aérea o contenedores completos. El proveedor extranjero asume el despacho aduanero de exportación y la PyME mexicana mantiene el control del flete internacional y tarifas.',
    commonPitfall: 'No especificar con exactitud el punto geográfico de entrega dentro de la ciudad o puerto del proveedor.',
    obligations: {
      packaging: 'SELLER',
      originLoading: 'SELLER',
      originInland: 'SELLER',
      exportClearance: 'SELLER',
      originTerminalHandling: 'BUYER',
      mainFreight: 'BUYER',
      cargoInsurance: 'BUYER',
      destinationTerminalHandling: 'BUYER',
      importClearance: 'BUYER',
      finalDelivery: 'BUYER',
    },
  },
  {
    code: 'CPT',
    name: 'Carriage Paid To',
    nameEs: 'Transporte Pagado Hasta',
    category: 'MULTIMODAL',
    riskTransferPoint: 'Al entregar la mercancía al primer transportista en origen (¡ojo: el riesgo se transfiere ANTES del transporte principal!).',
    costTransferPoint: 'En el lugar o terminal convenida de destino (el vendedor paga el flete principal).',
    transportTypes: ['Aéreo', 'Marítimo', 'Terrestre', 'Multimodal'],
    pymeRecommendation: 'MEDIUM',
    pymeRecommendationText: 'Útil si el vendedor tiene tarifas de flete internacional más competitivas, pero la PyME mexicana debe contratar su propio seguro de carga para proteger el trayecto.',
    commonPitfall: 'Confundir la transferencia de costos con la de riesgos: si la mercancía se daña en el mar, la pérdida es del comprador, aunque el vendedor haya pagado el flete.',
    obligations: {
      packaging: 'SELLER',
      originLoading: 'SELLER',
      originInland: 'SELLER',
      exportClearance: 'SELLER',
      originTerminalHandling: 'SELLER',
      mainFreight: 'SELLER',
      cargoInsurance: 'BUYER',
      destinationTerminalHandling: 'BUYER',
      importClearance: 'BUYER',
      finalDelivery: 'BUYER',
    },
  },
  {
    code: 'CIP',
    name: 'Carriage and Insurance Paid To',
    nameEs: 'Transporte y Seguro Pagados Hasta',
    category: 'MULTIMODAL',
    riskTransferPoint: 'Al entregar la mercancía al primer transportista en origen.',
    costTransferPoint: 'En el lugar convenido de destino, con seguro internacional cubierto por el vendedor (cobertura amplia Cláusula A).',
    transportTypes: ['Aéreo', 'Marítimo', 'Terrestre', 'Multimodal'],
    pymeRecommendation: 'HIGH',
    pymeRecommendationText: 'Excelente para importaciones aéreas o multimodales. El vendedor paga el flete y un seguro con cobertura máxima (Cláusulas del Instituto de Londres A).',
    commonPitfall: 'No verificar que la póliza de seguro emitida en el extranjero tenga cobertura endosable y reclamable por la PyME en México.',
    obligations: {
      packaging: 'SELLER',
      originLoading: 'SELLER',
      originInland: 'SELLER',
      exportClearance: 'SELLER',
      originTerminalHandling: 'SELLER',
      mainFreight: 'SELLER',
      cargoInsurance: 'SELLER',
      destinationTerminalHandling: 'BUYER',
      importClearance: 'BUYER',
      finalDelivery: 'BUYER',
    },
  },
  {
    code: 'DAP',
    name: 'Delivered at Place',
    nameEs: 'Entregado en el Lugar Acordado',
    category: 'MULTIMODAL',
    riskTransferPoint: 'Sobre el vehículo de transporte listo para ser descargado en el punto de destino acordado.',
    costTransferPoint: 'En el punto de entrega acordado en México (excluyendo el despacho aduanero de importación e impuestos).',
    transportTypes: ['Aéreo', 'Marítimo', 'Terrestre', 'Multimodal'],
    pymeRecommendation: 'HIGH',
    pymeRecommendationText: 'Ideal para compras terrestres desde EE.UU. o Canadá (T-MEC). La PyME sólo se encarga de pagar sus impuestos y trámites de aduana en México con su propio agente aduanal.',
    commonPitfall: 'Demoras en el despacho aduanero en frontera que generen costos de estadía o demoras del camión pagadas por el importador.',
    obligations: {
      packaging: 'SELLER',
      originLoading: 'SELLER',
      originInland: 'SELLER',
      exportClearance: 'SELLER',
      originTerminalHandling: 'SELLER',
      mainFreight: 'SELLER',
      cargoInsurance: 'SELLER',
      destinationTerminalHandling: 'SELLER',
      importClearance: 'BUYER',
      finalDelivery: 'SELLER',
    },
  },
  {
    code: 'DPU',
    name: 'Delivered at Place Unloaded',
    nameEs: 'Entregado en Lugar Descargado',
    category: 'MULTIMODAL',
    riskTransferPoint: 'Una vez descargada la mercancía en la terminal o punto designado de destino.',
    costTransferPoint: 'En el lugar convenido de destino con maniobra de descarga incluida.',
    transportTypes: ['Aéreo', 'Marítimo', 'Terrestre', 'Multimodal'],
    pymeRecommendation: 'MEDIUM',
    pymeRecommendationText: 'Es el único Incoterm donde el vendedor asume la descarga de la mercancía en destino.',
    commonPitfall: 'El vendedor puede desconocer los equipos mecánicos necesarios para la descarga en destino, generando retrasos.',
    obligations: {
      packaging: 'SELLER',
      originLoading: 'SELLER',
      originInland: 'SELLER',
      exportClearance: 'SELLER',
      originTerminalHandling: 'SELLER',
      mainFreight: 'SELLER',
      cargoInsurance: 'SELLER',
      destinationTerminalHandling: 'SELLER',
      importClearance: 'BUYER',
      finalDelivery: 'SELLER',
    },
  },
  {
    code: 'DDP',
    name: 'Delivered Duty Paid',
    nameEs: 'Entregado con Derechos Pagados',
    category: 'MULTIMODAL',
    riskTransferPoint: 'En las instalaciones del comprador en México con mercancía despachada de aduana.',
    costTransferPoint: 'En puerta de la PyME compradora (máxima obligación para el vendedor extranjero).',
    transportTypes: ['Aéreo', 'Marítimo', 'Terrestre', 'Multimodal'],
    pymeRecommendation: 'CAUTION',
    pymeRecommendationText: 'Riesgoso en México para importadores que buscan deducibilidad fiscal. El vendedor extranjero típicamente no tiene RFC ni padrón de importadores en México, por lo que no puede emitir un pedimento deducible ni acreditar el IVA.',
    commonPitfall: 'Pagar un precio global que incluye "impuestos" pero recibir la mercancía sin pedimento individual deducible a nombre de la PyME.',
    obligations: {
      packaging: 'SELLER',
      originLoading: 'SELLER',
      originInland: 'SELLER',
      exportClearance: 'SELLER',
      originTerminalHandling: 'SELLER',
      mainFreight: 'SELLER',
      cargoInsurance: 'SELLER',
      destinationTerminalHandling: 'SELLER',
      importClearance: 'SELLER',
      finalDelivery: 'SELLER',
    },
  },
  {
    code: 'FAS',
    name: 'Free Alongside Ship',
    nameEs: 'Franco al Costado del Buque',
    category: 'MARITIMO',
    riskTransferPoint: 'Al colocar la mercancía al costado del buque (ej. en el muelle) en el puerto de embarque convenido.',
    costTransferPoint: 'Al costado del buque en el puerto de salida designado.',
    transportTypes: ['Marítimo', 'Vías navegables interiores'],
    pymeRecommendation: 'CAUTION',
    pymeRecommendationText: 'Uso especializado para graneles o cargas pesadas/sobredimensionadas. Rara vez adecuado para PyMEs que importan mercancía en contenedores.',
    commonPitfall: 'Intentar usarlo para mercancía en contenedores cerrados; en ese caso debe usarse FCA.',
    obligations: {
      packaging: 'SELLER',
      originLoading: 'SELLER',
      originInland: 'SELLER',
      exportClearance: 'SELLER',
      originTerminalHandling: 'BUYER',
      mainFreight: 'BUYER',
      cargoInsurance: 'BUYER',
      destinationTerminalHandling: 'BUYER',
      importClearance: 'BUYER',
      finalDelivery: 'BUYER',
    },
  },
  {
    code: 'FOB',
    name: 'Free On Board',
    nameEs: 'Franco a Bordo',
    category: 'MARITIMO',
    riskTransferPoint: 'A bordo del buque en el puerto de embarque convenido.',
    costTransferPoint: 'A bordo del buque en el puerto de origen.',
    transportTypes: ['Marítimo', 'Vías navegables interiores'],
    pymeRecommendation: 'HIGH',
    pymeRecommendationText: 'El Incoterm rey para importaciones marítimas desde Asia y Europa. El exportador cubre todos los costos y permisos en su país hasta subir el contenedor al barco. La PyME mexicana negocia y controla su propio flete marítimo hacia Manzanillo o Veracruz.',
    commonPitfall: 'No contratar seguro internacional asumiendo que el flete marítimo lo incluye (las navieras tienen responsabilidad limitada por ley).',
    obligations: {
      packaging: 'SELLER',
      originLoading: 'SELLER',
      originInland: 'SELLER',
      exportClearance: 'SELLER',
      originTerminalHandling: 'SELLER',
      mainFreight: 'BUYER',
      cargoInsurance: 'BUYER',
      destinationTerminalHandling: 'BUYER',
      importClearance: 'BUYER',
      finalDelivery: 'BUYER',
    },
  },
  {
    code: 'CFR',
    name: 'Cost and Freight',
    nameEs: 'Costo y Flete',
    category: 'MARITIMO',
    riskTransferPoint: 'A bordo del buque en origen (¡el riesgo se transfiere al comprador en el puerto de salida!).',
    costTransferPoint: 'Puerto de destino convenido (el vendedor paga el flete marítimo).',
    transportTypes: ['Marítimo', 'Vías navegables'],
    pymeRecommendation: 'MEDIUM',
    pymeRecommendationText: 'El vendedor paga el transporte marítimo hasta el puerto mexicano (ej. Manzanillo o Altamira), pero el comprador debe asegurar la mercancía.',
    commonPitfall: 'Creer que el vendedor responde por averías o pérdidas en alta mar: el riesgo es 100% del comprador desde que sube al buque en origen.',
    obligations: {
      packaging: 'SELLER',
      originLoading: 'SELLER',
      originInland: 'SELLER',
      exportClearance: 'SELLER',
      originTerminalHandling: 'SELLER',
      mainFreight: 'SELLER',
      cargoInsurance: 'BUYER',
      destinationTerminalHandling: 'BUYER',
      importClearance: 'BUYER',
      finalDelivery: 'BUYER',
    },
  },
  {
    code: 'CIF',
    name: 'Cost, Insurance and Freight',
    nameEs: 'Costo, Seguro y Flete',
    category: 'MARITIMO',
    riskTransferPoint: 'A bordo del buque en el puerto de embarque en origen.',
    costTransferPoint: 'Puerto de destino convenido, con flete y seguro cubiertos por el vendedor (cobertura mínima Cláusula C).',
    transportTypes: ['Marítimo', 'Vías navegables'],
    pymeRecommendation: 'MEDIUM',
    pymeRecommendationText: 'Popular en importaciones marítimas, pero en Incoterms 2020 el vendedor sólo está obligado a contratar la cobertura mínima (Cláusulas C del Instituto). Para carga de alto valor o electrónica, se recomienda solicitar Cláusula A o comprar seguro propio.',
    commonPitfall: 'La cobertura C no ampara robo parcial, mermas ni humedad, lo que deja desprotegida a la PyME en muchos siniestros frecuentes.',
    obligations: {
      packaging: 'SELLER',
      originLoading: 'SELLER',
      originInland: 'SELLER',
      exportClearance: 'SELLER',
      originTerminalHandling: 'SELLER',
      mainFreight: 'SELLER',
      cargoInsurance: 'SELLER',
      destinationTerminalHandling: 'BUYER',
      importClearance: 'BUYER',
      finalDelivery: 'BUYER',
    },
  },
];
