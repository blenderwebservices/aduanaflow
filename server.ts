import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { calculateLandedCost, LandedCostInput, COMMON_TARIFFS } from './src/utils/customsCalculations';
import { auditPedimento, PedimentoData, SAMPLE_PEDIMENTOS, VALID_CLAVES_PEDIMENTO, ADUANAS_MEXICO } from './src/utils/pedimentoValidator';
import { INCOTERMS_2020 } from './src/utils/incotermsData';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// In-memory persistent demo store for shipments
export interface ShipmentRecord {
  id: string;
  trackingNumber: string;
  clientName: string;
  clientRfc: string;
  originCountry: string;
  originCity: string;
  destinationCity: string;
  incoterm: string;
  status: 'ORIGIN' | 'TRANSIT' | 'CUSTOMS_CLEARANCE' | 'GREEN_LIGHT' | 'LAST_MILE' | 'DELIVERED';
  customsPort: string;
  pedimentoNumber: string;
  cargoDescription: string;
  weightKg: number;
  packagesCount: number;
  commercialValueUSD: number;
  customsValueMXN: number;
  eta: string;
  lastUpdate: string;
  lastMileCarrier?: string;
  lastMileCostMXN?: number;
}

const shipmentsDB: ShipmentRecord[] = [
  {
    id: 'SHP-2024-001',
    trackingNumber: 'MX-AF-89214',
    clientName: 'Distribuidora Tecnológica de Occidente S.A.',
    clientRfc: 'DTE210419KM8',
    originCountry: 'China',
    originCity: 'Shenzhen',
    destinationCity: 'Guadalajara, Jalisco',
    incoterm: 'FOB',
    status: 'CUSTOMS_CLEARANCE',
    customsPort: '160 - Manzanillo, Colima',
    pedimentoNumber: '24 16 3840 4 001928',
    cargoDescription: '120 Laptops y componentes de cómputo',
    weightKg: 840,
    packagesCount: 120,
    commercialValueUSD: 34500,
    customsValueMXN: 730480,
    eta: '2026-11-08',
    lastUpdate: 'Inspección de pedimento y RRNA en puerto de Manzanillo',
    lastMileCarrier: 'Transportes Castores Express',
    lastMileCostMXN: 5400,
  },
  {
    id: 'SHP-2024-002',
    trackingNumber: 'MX-AF-94301',
    clientName: 'Maquinados Industriales del Norte S.A. de C.V.',
    clientRfc: 'MIN190520AB3',
    originCountry: 'Alemania',
    originCity: 'Hamburgo',
    destinationCity: 'Monterrey, Nuevo León',
    incoterm: 'CIF',
    status: 'GREEN_LIGHT',
    customsPort: '430 - Veracruz, Veracruz',
    pedimentoNumber: '24 43 3120 4 003912',
    cargoDescription: 'Válvulas hidráulicas y bombas de precisión',
    weightKg: 1450,
    packagesCount: 32,
    commercialValueUSD: 52000,
    customsValueMXN: 1032200,
    eta: '2026-11-06',
    lastUpdate: 'Desaduanamiento libre (Semáforo Verde fiscal) en Veracruz',
    lastMileCarrier: 'Fletes México Carga Consolidada',
    lastMileCostMXN: 8200,
  },
  {
    id: 'SHP-2024-003',
    trackingNumber: 'MX-AF-71044',
    clientName: 'Textiles & Confecciones León S.A.',
    clientRfc: 'TCL170815TR2',
    originCountry: 'Estados Unidos',
    originCity: 'Laredo, Texas',
    destinationCity: 'León, Guanajuato',
    incoterm: 'FCA',
    status: 'LAST_MILE',
    customsPort: '240 - Nuevo Laredo, Tamaulipas',
    pedimentoNumber: '24 24 3912 4 005421',
    cargoDescription: 'Rollos de tela de algodón y forros sintéticos',
    weightKg: 2100,
    packagesCount: 65,
    commercialValueUSD: 19800,
    customsValueMXN: 418000,
    eta: '2026-11-05',
    lastUpdate: 'En unidad de última milla rumbo al Parque Industrial León',
    lastMileCarrier: 'Paquetexpress Última Milla',
    lastMileCostMXN: 4150,
  },
  {
    id: 'SHP-2024-004',
    trackingNumber: 'MX-AF-63022',
    clientName: 'BioHealth Nutrición Natural PyME',
    clientRfc: 'BNN200110PX1',
    originCountry: 'Corea del Sur',
    originCity: 'Busan',
    destinationCity: 'Ciudad de México',
    incoterm: 'CIP',
    status: 'TRANSIT',
    customsPort: '470 - AICM / Pantaco',
    pedimentoNumber: '24 47 3840 4 000831',
    cargoDescription: 'Extractos botánicos y envases farmacéuticos',
    weightKg: 380,
    packagesCount: 24,
    commercialValueUSD: 14200,
    customsValueMXN: 281870,
    eta: '2026-11-12',
    lastUpdate: 'Vuelo de carga en escala en Los Ángeles, ETA a CDMX 12-Nov',
    lastMileCarrier: 'DHL Global Forwarding Last Mile',
    lastMileCostMXN: 2950,
  },
];

// -------------------------------------------------------------
// REST API Endpoints (diseñados para Apps Móviles iOS & Android)
// -------------------------------------------------------------

// 1. Health check & API metadata
app.get('/api/v1/health', (_req: Request, res: Response) => {
  res.json({
    status: 'online',
    version: '1.0.0',
    platform: 'AduanaFlow - Core API for Mobile & Web',
    timestamp: new Date().toISOString(),
    supportedEndpoints: [
      '/api/v1/shipments',
      '/api/v1/calculator/landed-cost',
      '/api/v1/incoterms',
      '/api/v1/pedimentos/validate',
      '/api/v1/last-mile/quote',
      '/api/v1/ai/tariff-assistant',
      '/api/v1/docs',
    ],
  });
});

// 2. OpenApi / Mobile Dev Docs
app.get('/api/v1/docs', (_req: Request, res: Response) => {
  res.json({
    title: 'AduanaFlow Mobile & PyME Integration API',
    description: 'API REST diseñada para apps móviles en iOS y Android que gestionan logística internacional, cálculo de costos aduanales y validación de pedimentos en tiempo real.',
    baseEndpoint: '/api/v1',
    clientTarget: 'PyMEs, Agencias Aduanales, Transportistas de Última Milla',
    authType: 'Bearer Token (Header Authorization: Bearer <API_KEY>) [Simulado para demo]',
    resources: {
      shipments: {
        get_all: 'GET /api/v1/shipments',
        get_one: 'GET /api/v1/shipments/:id',
        create: 'POST /api/v1/shipments',
      },
      calculator: {
        landed_cost: 'POST /api/v1/calculator/landed-cost',
      },
      pedimentos: {
        validate: 'POST /api/v1/pedimentos/validate',
        samples: 'GET /api/v1/pedimentos/samples',
      },
      incoterms: {
        list: 'GET /api/v1/incoterms',
      },
      lastMile: {
        quote: 'POST /api/v1/last-mile/quote',
      },
    },
  });
});

// 3. Shipments API
app.get('/api/v1/shipments', (req: Request, res: Response) => {
  const { status, search } = req.query;
  let results = [...shipmentsDB];

  if (status && typeof status === 'string' && status !== 'ALL') {
    results = results.filter((s) => s.status === status);
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    results = results.filter(
      (s) =>
        s.trackingNumber.toLowerCase().includes(q) ||
        s.clientName.toLowerCase().includes(q) ||
        s.cargoDescription.toLowerCase().includes(q) ||
        s.pedimentoNumber.toLowerCase().includes(q)
    );
  }

  res.json({
    success: true,
    count: results.length,
    data: results,
  });
});

app.get('/api/v1/shipments/:id', (req: Request, res: Response) => {
  const shipment = shipmentsDB.find((s) => s.id === req.params.id || s.trackingNumber === req.params.id);
  if (!shipment) {
    res.status(404).json({ success: false, error: 'Embarque no encontrado' });
    return;
  }
  res.json({ success: true, data: shipment });
});

app.post('/api/v1/shipments', (req: Request, res: Response) => {
  const body = req.body;
  if (!body.clientName || !body.cargoDescription) {
    res.status(400).json({ success: false, error: 'Faltan campos obligatorios (clientName, cargoDescription)' });
    return;
  }

  const newId = `SHP-2024-${String(shipmentsDB.length + 1).padStart(3, '0')}`;
  const trackingNumber = `MX-AF-${Math.floor(10000 + Math.random() * 90000)}`;

  const newRecord: ShipmentRecord = {
    id: newId,
    trackingNumber,
    clientName: body.clientName,
    clientRfc: body.clientRfc || 'GEN010101000',
    originCountry: body.originCountry || 'Estados Unidos',
    originCity: body.originCity || 'Laredo',
    destinationCity: body.destinationCity || 'Ciudad de México',
    incoterm: body.incoterm || 'FOB',
    status: body.status || 'ORIGIN',
    customsPort: body.customsPort || '240 - Nuevo Laredo, Tamaulipas',
    pedimentoNumber: body.pedimentoNumber || '24 24 3840 4 000100',
    cargoDescription: body.cargoDescription,
    weightKg: Number(body.weightKg) || 100,
    packagesCount: Number(body.packagesCount) || 10,
    commercialValueUSD: Number(body.commercialValueUSD) || 5000,
    customsValueMXN: Number(body.customsValueMXN) || 99250,
    eta: body.eta || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    lastUpdate: 'Embarque registrado en plataforma para gestión y última milla',
    lastMileCarrier: body.lastMileCarrier || 'Red Logística PyME Express',
    lastMileCostMXN: Number(body.lastMileCostMXN) || 3500,
  };

  shipmentsDB.unshift(newRecord);

  res.status(201).json({
    success: true,
    message: 'Embarque registrado con éxito',
    data: newRecord,
  });
});

// 4. Landed Cost Calculator API
app.post('/api/v1/calculator/landed-cost', (req: Request, res: Response) => {
  try {
    const input = req.body as LandedCostInput;
    const result = calculateLandedCost(input);
    res.json({
      success: true,
      calculation: result,
      tariffsReference: COMMON_TARIFFS,
    });
  } catch (err: unknown) {
    res.status(500).json({ success: false, error: err instanceof Error ? err.message : 'Error en cálculo' });
  }
});

// 5. Pedimento Validator API
app.post('/api/v1/pedimentos/validate', (req: Request, res: Response) => {
  try {
    const data = req.body as PedimentoData;
    const auditReport = auditPedimento(data);
    res.json({
      success: true,
      report: auditReport,
    });
  } catch (err: unknown) {
    res.status(500).json({ success: false, error: err instanceof Error ? err.message : 'Error en auditoría' });
  }
});

app.get('/api/v1/pedimentos/samples', (_req: Request, res: Response) => {
  res.json({
    success: true,
    samples: SAMPLE_PEDIMENTOS,
    referenceClaves: VALID_CLAVES_PEDIMENTO,
    aduanas: ADUANAS_MEXICO,
  });
});

// 6. Incoterms API
app.get('/api/v1/incoterms', (_req: Request, res: Response) => {
  res.json({
    success: true,
    count: INCOTERMS_2020.length,
    data: INCOTERMS_2020,
  });
});

// 7. Last Mile Quotation API
app.post('/api/v1/last-mile/quote', (req: Request, res: Response) => {
  const { originPort, destinationCity, weightKg, packagesCount, deliverySpeed } = req.body;
  const weight = Number(weightKg) || 100;
  const packages = Number(packagesCount) || 5;

  // Algoritmo de tarificación última milla para PyMEs
  const baseRate = deliverySpeed === 'EXPRESS' ? 1800 : 1200;
  const weightRate = weight * 2.8; // $2.8 MXN por kg
  const handlingRate = packages * 35; // $35 MXN por bulto
  const insuranceRate = 350; // Póliza básica de tránsito nacional

  const totalCostMXN = Math.round(baseRate + weightRate + handlingRate + insuranceRate);
  const estimatedDays = deliverySpeed === 'EXPRESS' ? 1 : 3;

  res.json({
    success: true,
    quote: {
      originPort: originPort || '160 - Manzanillo',
      destinationCity: destinationCity || 'Ciudad de México',
      weightKg: weight,
      packagesCount: packages,
      deliverySpeed: deliverySpeed || 'STANDARD',
      estimatedDays,
      breakdown: {
        baseRate,
        weightRate: Math.round(weightRate),
        handlingRate,
        transitInsurance: insuranceRate,
      },
      totalCostMXN,
      serviceProvider: 'Red Aliada de Última Milla AduanaFlow',
    },
  });
});

// 8. AI Customs & Tariff Advisor (usando Gemini API si hay clave, con fallback analítico seguro)
app.post('/api/v1/ai/tariff-assistant', async (req: Request, res: Response) => {
  const { productDescription, originCountry } = req.body;

  if (!productDescription) {
    res.status(400).json({ success: false, error: 'Descripción de producto requerida' });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    // Modo analítico inteligente sin API key externa
    const lower = productDescription.toLowerCase();
    const matched = COMMON_TARIFFS.find(t =>
      lower.includes('laptop') || lower.includes('computadora') ? t.hsCode.startsWith('8471') :
        lower.includes('playera') || lower.includes('camisa') || lower.includes('ropa') ? t.hsCode.startsWith('6109') :
          lower.includes('zapato') || lower.includes('calzado') ? t.hsCode.startsWith('6403') :
            lower.includes('vino') || lower.includes('alcohol') ? t.hsCode.startsWith('2204') :
              lower.includes('juguete') ? t.hsCode.startsWith('9503') : false
    ) || COMMON_TARIFFS[0];

    res.json({
      success: true,
      mode: 'RULE_ENGINE',
      analysis: {
        suggestedHsCode: matched.hsCode,
        suggestedNico: matched.nico,
        description: matched.description,
        estimatedIgi: `${matched.igiPercent}%`,
        requiredNorms: matched.regulations,
        advisories: [
          'Verifique en el portal VUCEM si la mercancía requiere Padrón Sectorial previo.',
          'Considere el cálculo del Valor Aduana sumando flete y seguro según el Incoterm convenido.',
          'Revise etiquetado en origen para evitar retención en aduana por NOMs de información comercial.',
        ],
      },
    });
    return;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `Actúa como especialista aduanal senior en comercio exterior y Ley Aduanera de México (SAT/ANAM).
Analiza el siguiente producto para una PyME importadora mexicana:
Producto: "${productDescription}"
País de origen: "${originCountry || 'No especificado'}"

Responde en formato JSON con la siguiente estructura exacta:
{
  "suggestedHsCode": "XXXX.XX.XX",
  "suggestedNico": "XX",
  "productCategory": "categoría resumida",
  "estimatedIgi": "X%",
  "requiredNorms": ["NOM-XXX", "Permiso previo..."],
  "advisories": ["recomendación 1", "recomendación 2"]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({
      success: true,
      mode: 'AI_GEMINI',
      analysis: parsed,
    });
  } catch (err: unknown) {
    // Si falla la llamada externa, responder con el motor de reglas
    const fallback = COMMON_TARIFFS[0];
    res.json({
      success: true,
      mode: 'RULE_ENGINE_FALLBACK',
      analysis: {
        suggestedHsCode: fallback.hsCode,
        suggestedNico: fallback.nico,
        description: fallback.description,
        estimatedIgi: `${fallback.igiPercent}%`,
        requiredNorms: fallback.regulations,
        advisories: [
          'Clasificación arancelaria orientativa basada en catálogo de comercio exterior.',
          'Recuerde validar con su Agente Aduanal colegiado antes de generar la proforma de pedimento.',
        ],
      },
    });
  }
});

// Setup Vite middleware for local development
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`[AduanaFlow Server] Corriendo en http://0.0.0.0:${port}`);
    console.log(`[AduanaFlow Server] API REST activa en http://0.0.0.0:${port}/api/v1`);
  });
}

startServer();
