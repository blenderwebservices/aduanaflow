import React, { useState, useMemo } from 'react';
import {
  Truck,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  MapPin,
  FileText,
  DollarSign,
  Package,
  Calendar,
  Building,
  ArrowRight,
  ShieldCheck,
  X,
} from 'lucide-react';
import { ShipmentRecord } from '../../server';

interface ShipmentsDashboardProps {
  shipments: ShipmentRecord[];
  onAddShipment: (newShipment: Partial<ShipmentRecord>) => void;
  isDark: boolean;
  selectedShipmentForModal: ShipmentRecord | null;
  onCloseModal: () => void;
  onOpenShipmentDetail: (shipment: ShipmentRecord) => void;
}

export const ShipmentsDashboard: React.FC<ShipmentsDashboardProps> = ({
  shipments,
  onAddShipment,
  isDark,
  selectedShipmentForModal,
  onCloseModal,
  onOpenShipmentDetail,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Last-mile quote tool state
  const [quotePort, setQuotePort] = useState('160 - Manzanillo');
  const [quotePortCP, setQuotePortCP] = useState('28200');
  const [quoteDest, setQuoteDest] = useState('Guadalajara, Jalisco');
  const [quoteDestCP, setQuoteDestCP] = useState('44100');
  const [quoteWeight, setQuoteWeight] = useState(500);
  const [quotePackages, setQuotePackages] = useState(25);
  const [quoteLength, setQuoteLength] = useState(120); // cm
  const [quoteWidth, setQuoteWidth] = useState(100); // cm
  const [quoteHeight, setQuoteHeight] = useState(140); // cm
  const [cargoType, setCargoType] = useState('GENERAL_DRY');
  const [deliveryCondition, setDeliveryCondition] = useState('RAMP'); // RAMP, FLOOR, SPECIAL
  const [quoteSpeed, setQuoteSpeed] = useState<'STANDARD' | 'EXPRESS'>('STANDARD');
  const [quoteResult, setQuoteResult] = useState<any>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);

  // Volumetric weight calculation (cm / 4000 for overland freight in Mexico)
  const volumetricWeightKg = useMemo(() => {
    const vol = (quoteLength * quoteWidth * quoteHeight) / 4000;
    return Math.round(vol * Math.max(1, quotePackages));
  }, [quoteLength, quoteWidth, quoteHeight, quotePackages]);

  const chargeableWeightKg = Math.max(quoteWeight, volumetricWeightKg);

  // Checklist state
  const [checkedSteps, setCheckedSteps] = useState<Record<number, boolean>>({
    1: true,
    2: true,
    3: true,
    4: false,
    5: false,
    6: false,
    7: false,
  });

  const toggleChecklistStep = (stepNumber: number) => {
    setCheckedSteps(prev => ({
      ...prev,
      [stepNumber]: !prev[stepNumber],
    }));
  };

  // New Shipment Form State
  const [formData, setFormData] = useState({
    clientName: '',
    clientRfc: '',
    cargoDescription: '',
    originCountry: 'China',
    originCity: 'Shenzhen',
    destinationCity: 'Ciudad de México',
    customsPort: '160 - Manzanillo, Colima',
    incoterm: 'FOB',
    commercialValueUSD: 15000,
    weightKg: 450,
    packagesCount: 30,
    pedimentoNumber: '24 16 3840 4 002100',
    lastMileCarrier: 'Transportes Castores Express',
    lastMileCostMXN: 3800,
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientName || !formData.cargoDescription) return;
    onAddShipment(formData);
    setIsCreateOpen(false);
    setFormData({
      clientName: '',
      clientRfc: '',
      cargoDescription: '',
      originCountry: 'China',
      originCity: 'Shenzhen',
      destinationCity: 'Ciudad de México',
      customsPort: '160 - Manzanillo, Colima',
      incoterm: 'FOB',
      commercialValueUSD: 15000,
      weightKg: 450,
      packagesCount: 30,
      pedimentoNumber: '24 16 3840 4 002100',
      lastMileCarrier: 'Transportes Castores Express',
      lastMileCostMXN: 3800,
    });
  };

  const handleQuoteSubmit = async () => {
    setQuoteLoading(true);
    try {
      const res = await fetch('/api/v1/last-mile/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originPort: quotePort,
          destinationCity: quoteDest,
          weightKg: quoteWeight,
          packagesCount: quotePackages,
          deliverySpeed: quoteSpeed,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setQuoteResult(data.quote);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setQuoteLoading(false);
    }
  };

  const filteredShipments = shipments.filter((s) => {
    const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      s.trackingNumber.toLowerCase().includes(q) ||
      s.clientName.toLowerCase().includes(q) ||
      s.cargoDescription.toLowerCase().includes(q) ||
      s.pedimentoNumber.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const statusStyles: Record<string, { label: string; bg: string; text: string }> = {
    ORIGIN: { label: 'En Origen', bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-700 dark:text-slate-300' },
    TRANSIT: { label: 'Tránsito Internacional', bg: 'bg-blue-100 dark:bg-blue-950/60', text: 'text-blue-700 dark:text-blue-300' },
    CUSTOMS_CLEARANCE: { label: 'Despacho Aduanal', bg: 'bg-amber-100 dark:bg-amber-950/60', text: 'text-amber-800 dark:text-amber-300' },
    GREEN_LIGHT: { label: 'Semáforo Verde SAT', bg: 'bg-emerald-100 dark:bg-emerald-950/60', text: 'text-emerald-800 dark:text-emerald-300' },
    LAST_MILE: { label: 'Ruta Última Milla', bg: 'bg-purple-100 dark:bg-purple-950/60', text: 'text-purple-800 dark:text-purple-300' },
    DELIVERED: { label: 'Entregado a PyME', bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-600 dark:text-slate-400' },
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className={`p-6 rounded-2xl border ${
        isDark ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-white'
      } shadow-xs`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              <Truck className="h-4 w-4" />
              <span>Logística Integral & Enlace de Última Milla</span>
            </div>
            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              Gestión de Envíos, Despacho Aduanal y Ruteo PyME
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Monitorea el estatus aduanal (semáforo fiscal) y conecta el desaduanamiento con el flete terrestre de última milla.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCreateOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors shadow-xs"
            >
              <Plus className="h-4 w-4" />
              <span>Registrar Nuevo Embarque</span>
            </button>
          </div>
        </div>
      </div>

      {/* Resource Table Controls (Search & Filters) */}
      <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
        isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-white'
      }`}>
        <div className="relative flex-1 max-w-md">
          <Search className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 h-4 w-4 pointer-events-none my-auto" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por guía, cliente, mercancía o pedimento..."
            className={`w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border outline-none ${
              isDark ? 'border-slate-700 bg-slate-800 text-white' : 'border-slate-300 bg-slate-50 text-slate-900'
            }`}
          />
        </div>

        {/* Status Pills Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
          {['ALL', 'TRANSIT', 'CUSTOMS_CLEARANCE', 'GREEN_LIGHT', 'LAST_MILE', 'DELIVERED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-xs'
                  : isDark
                  ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {st === 'ALL' && 'Todos'}
              {st === 'TRANSIT' && 'Tránsito'}
              {st === 'CUSTOMS_CLEARANCE' && 'Aduana'}
              {st === 'GREEN_LIGHT' && 'Semáforo Verde'}
              {st === 'LAST_MILE' && 'Última Milla'}
              {st === 'DELIVERED' && 'Entregados'}
            </button>
          ))}
        </div>
      </div>

      {/* Shipments Table */}
      <div className={`rounded-xl border overflow-hidden shadow-xs ${
        isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-white'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className={`border-b font-semibold uppercase text-slate-500 tracking-wider ${
              isDark ? 'bg-slate-900/80 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200'
            }`}>
              <tr>
                <th className="py-3 px-4">Guía & Pedimento</th>
                <th className="py-3 px-4">Cliente / RFC</th>
                <th className="py-3 px-4">Mercancía & Bultos</th>
                <th className="py-3 px-4">Ruta & Aduana</th>
                <th className="py-3 px-4">Estado Aduana</th>
                <th className="py-3 px-4">Última Milla</th>
                <th className="py-3 px-4 text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredShipments.map((s) => {
                const badge = statusStyles[s.status] || statusStyles.TRANSIT;
                return (
                  <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {s.trackingNumber}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Pedimento: {s.pedimentoNumber}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-900 dark:text-white">
                        {s.clientName}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {s.clientRfc}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-slate-800 dark:text-slate-200 font-medium">
                        {s.cargoDescription}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {s.packagesCount} bultos · {s.weightKg} kg · Incoterm: {s.incoterm}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-slate-800 dark:text-slate-200">
                        {s.originCity} → {s.destinationCity}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Pto: {s.customsPort}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium ${badge.bg} ${badge.text}`}>
                        {badge.label}
                      </span>
                      <div className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[180px]">
                        {s.lastUpdate}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-slate-800 dark:text-slate-200 font-medium">
                        {s.lastMileCarrier || 'Por asignar'}
                      </div>
                      <div className="text-[11px] text-amber-600 dark:text-amber-400 font-mono font-semibold">
                        ${s.lastMileCostMXN?.toLocaleString()} MXN
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => onOpenShipmentDetail(s)}
                        className="px-2.5 py-1 text-xs font-medium rounded-md text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 border border-amber-300 dark:border-amber-800 transition-colors"
                      >
                        Ver Detalle
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cotizador Integrado de Última Milla para PyMEs */}
      <div className={`p-6 rounded-2xl border ${
        isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-white'
      } shadow-xs`}>
        <div className="border-b pb-3 border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase">
              <Truck className="h-4 w-4" />
              <span>Cotizador Rápido de Última Milla (Aduana → Bodega PyME)</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
              Tarifador de Flete Terrestre Consolidado para Pequeñas Empresas
            </h3>
          </div>

          <span className="px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wide uppercase bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            Cotización Estimativa · No Vinculante
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Aduana / CP Origen
            </label>
            <div className="flex gap-2">
              <select
                value={quotePort}
                onChange={(e) => {
                  setQuotePort(e.target.value);
                  if (e.target.value.includes('Manzanillo')) setQuotePortCP('28200');
                  else if (e.target.value.includes('Nuevo Laredo')) setQuotePortCP('88000');
                  else if (e.target.value.includes('AICM')) setQuotePortCP('15620');
                  else if (e.target.value.includes('Veracruz')) setQuotePortCP('91700');
                }}
                className={`w-2/3 px-2 py-1.5 text-xs rounded-lg border outline-none ${
                  isDark ? 'border-slate-700 bg-slate-800 text-white' : 'border-slate-300 bg-slate-50 text-slate-900'
                }`}
              >
                <option value="160 - Manzanillo">160 - Manzanillo</option>
                <option value="240 - Nuevo Laredo">240 - Nuevo Laredo</option>
                <option value="470 - AICM / Pantaco">470 - AICM / Pantaco</option>
                <option value="430 - Veracruz">430 - Veracruz</option>
              </select>
              <input
                type="text"
                value={quotePortCP}
                onChange={(e) => setQuotePortCP(e.target.value)}
                placeholder="C.P."
                className={`w-1/3 px-2 py-1.5 text-xs font-mono rounded-lg border outline-none ${
                  isDark ? 'border-slate-700 bg-slate-800 text-white' : 'border-slate-300 bg-slate-50 text-slate-900'
                }`}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Destino PyME & C.P.
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={quoteDest}
                onChange={(e) => setQuoteDest(e.target.value)}
                className={`w-2/3 px-2.5 py-1.5 text-xs rounded-lg border outline-none ${
                  isDark ? 'border-slate-700 bg-slate-800 text-white' : 'border-slate-300 bg-slate-50 text-slate-900'
                }`}
              />
              <input
                type="text"
                value={quoteDestCP}
                onChange={(e) => setQuoteDestCP(e.target.value)}
                placeholder="C.P."
                className={`w-1/3 px-2 py-1.5 text-xs font-mono rounded-lg border outline-none ${
                  isDark ? 'border-slate-700 bg-slate-800 text-white' : 'border-slate-300 bg-slate-50 text-slate-900'
                }`}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Dimensiones (L x W x H cm)
            </label>
            <div className="flex gap-1">
              <input
                type="number"
                value={quoteLength}
                onChange={(e) => setQuoteLength(Number(e.target.value) || 1)}
                placeholder="L"
                className={`w-1/3 px-1.5 py-1.5 text-xs font-mono rounded-lg border outline-none ${
                  isDark ? 'border-slate-700 bg-slate-800 text-white' : 'border-slate-300 bg-slate-50 text-slate-900'
                }`}
              />
              <input
                type="number"
                value={quoteWidth}
                onChange={(e) => setQuoteWidth(Number(e.target.value) || 1)}
                placeholder="W"
                className={`w-1/3 px-1.5 py-1.5 text-xs font-mono rounded-lg border outline-none ${
                  isDark ? 'border-slate-700 bg-slate-800 text-white' : 'border-slate-300 bg-slate-50 text-slate-900'
                }`}
              />
              <input
                type="number"
                value={quoteHeight}
                onChange={(e) => setQuoteHeight(Number(e.target.value) || 1)}
                placeholder="H"
                className={`w-1/3 px-1.5 py-1.5 text-xs font-mono rounded-lg border outline-none ${
                  isDark ? 'border-slate-700 bg-slate-800 text-white' : 'border-slate-300 bg-slate-50 text-slate-900'
                }`}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Peso Báscula vs Cubicaje
              </label>
              <span className="text-[10px] text-amber-500 font-mono">
                {volumetricWeightKg} kg vol.
              </span>
            </div>
            <div className="flex gap-2">
              <input
                type="number"
                min="10"
                value={quoteWeight}
                onChange={(e) => setQuoteWeight(Number(e.target.value) || 10)}
                className={`w-1/2 px-2.5 py-1.5 text-xs font-mono rounded-lg border outline-none ${
                  isDark ? 'border-slate-700 bg-slate-800 text-white' : 'border-slate-300 bg-slate-50 text-slate-900'
                }`}
                placeholder="kg físico"
              />
              <input
                type="number"
                min="1"
                value={quotePackages}
                onChange={(e) => setQuotePackages(Number(e.target.value) || 1)}
                className={`w-1/2 px-2.5 py-1.5 text-xs font-mono rounded-lg border outline-none ${
                  isDark ? 'border-slate-700 bg-slate-800 text-white' : 'border-slate-300 bg-slate-50 text-slate-900'
                }`}
                placeholder="bultos"
              />
            </div>
          </div>
        </div>

        {/* Commodity and Delivery Conditions */}
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-3 border-t border-slate-200 dark:border-slate-800">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Tipo de Carga
            </label>
            <select
              value={cargoType}
              onChange={(e) => setCargoType(e.target.value)}
              className={`w-full px-2.5 py-1.5 text-xs rounded-lg border outline-none ${
                isDark ? 'border-slate-700 bg-slate-800 text-white' : 'border-slate-300 bg-slate-50 text-slate-900'
              }`}
            >
              <option value="GENERAL_DRY">Carga General Seca (Pallets/Cajas)</option>
              <option value="ELECTRONICS">Electrónica & Componentes (Custodia)</option>
              <option value="PERISHABLE">Perecedero / Refrigerado</option>
              <option value="HAZMAT">Material Regulado / Químico</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Condición de Descarga
            </label>
            <select
              value={deliveryCondition}
              onChange={(e) => setDeliveryCondition(e.target.value)}
              className={`w-full px-2.5 py-1.5 text-xs rounded-lg border outline-none ${
                isDark ? 'border-slate-700 bg-slate-800 text-white' : 'border-slate-300 bg-slate-50 text-slate-900'
              }`}
            >
              <option value="RAMP">Unidad con Rampa Hidráulica</option>
              <option value="FLOOR">Entrega a Piso en Andén PyME</option>
              <option value="CRANE">Maniobra Especial con Grúa</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Modalidad de Entrega
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setQuoteSpeed('STANDARD')}
                className={`flex-1 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                  quoteSpeed === 'STANDARD'
                    ? 'bg-amber-500 text-slate-950 font-bold border-amber-500'
                    : isDark ? 'border-slate-700 bg-slate-800 text-slate-300' : 'border-slate-300 bg-slate-50 text-slate-700'
                }`}
              >
                Estándar (3 días)
              </button>
              <button
                type="button"
                onClick={() => setQuoteSpeed('EXPRESS')}
                className={`flex-1 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                  quoteSpeed === 'EXPRESS'
                    ? 'bg-amber-500 text-slate-950 font-bold border-amber-500'
                    : isDark ? 'border-slate-700 bg-slate-800 text-slate-300' : 'border-slate-300 bg-slate-50 text-slate-700'
                }`}
              >
                Exprés (24h)
              </button>
            </div>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleQuoteSubmit}
              disabled={quoteLoading}
              className="w-full py-2 text-xs font-semibold rounded-lg bg-amber-500 text-slate-950 hover:bg-amber-400 disabled:opacity-50 transition-colors shadow-xs"
            >
              {quoteLoading ? 'Calculando flete...' : 'Cotizar Flete Estimado'}
            </button>
          </div>
        </div>

        {quoteResult && (
          <div className={`mt-4 p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
            isDark ? 'border-amber-500/30 bg-amber-950/20' : 'border-amber-200 bg-amber-50'
          }`}>
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Resultado de Cotización Estimada (Ruta: {quotePort} → {quoteDest}):
              </span>
              <div className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">
                ${quoteResult.totalCostMXN.toLocaleString()} MXN
                <span className="text-xs font-normal text-slate-400 ml-2">
                  (Tiempo estimado: {quoteResult.estimatedDays} {quoteResult.estimatedDays === 1 ? 'día hábil' : 'días hábiles'})
                </span>
              </div>
            </div>
            <div className="text-right text-[11px] text-slate-500">
              <div>Peso Tasado: <strong>{chargeableWeightKg} kg</strong></div>
              <div>Condición: {deliveryCondition === 'RAMP' ? 'Rampa Hidráulica' : 'Piso Andén'}</div>
            </div>
          </div>
        )}
      </div>

      {/* Checklist Integrado de Pedidos e Importaciones */}
      <div className={`p-6 rounded-2xl border ${
        isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-white'
      } shadow-xs`}>
        <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              <CheckCircle2 className="h-4 w-4" />
              <span>Control Operativo de Cumplimiento</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
              Checklist Integral de Pedidos & Expediente Aduanal
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Verificación paso a paso para evitar demoras, multas y retenciones en aduana.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
            {Object.values(checkedSteps).filter(Boolean).length} / 7 Completados
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { step: 1, title: '1. Orden de Compra & Incoterm', desc: 'Contrato mercantil, PO firmada e Incoterm 2020 acordado con punto exacto.' },
            { step: 2, title: '2. Clasificación & NOMs', desc: 'Validación de Fracción Arancelaria (8 dígitos) + NICO y pruebas de laboratorio NOM.' },
            { step: 3, title: '3. Factura & Packing List', desc: 'Cotejo de descripción comercial sin tecnicismos genéricos y pesos báscula vs bultos.' },
            { step: 4, title: '4. Flete & Seguro Internacional', desc: 'Emisión de B/L o AWB y póliza de seguro de carga con cobertura adecuada.' },
            { step: 5, title: '5. VUCEM: COVE & Manifestación', desc: 'Transmisión electrónica de factura (E-Document) y Manifestación de Valor con e.firma.' },
            { step: 6, title: '6. Validación de Pedimento SAT', desc: 'Proforma del Agente Aduanal revisada con 15 dígitos y pago de contribuciones (PE).' },
            { step: 7, title: '7. Carta Porte & Última Milla', desc: 'CFDI con Complemento Carta Porte 3.1 verificado antes de salida del recinto aduanal.' },
          ].map(item => {
            const isDone = !!checkedSteps[item.step];
            return (
              <div
                key={item.step}
                onClick={() => toggleChecklistStep(item.step)}
                className={`p-3.5 rounded-xl border cursor-pointer select-none transition-all ${
                  isDone
                    ? isDark
                      ? 'border-emerald-500/30 bg-emerald-950/20 text-emerald-200'
                      : 'border-emerald-300 bg-emerald-50 text-emerald-950'
                    : isDark
                    ? 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isDone}
                    onChange={() => {}}
                    className="h-4 w-4 rounded text-amber-500 focus:ring-0 cursor-pointer"
                  />
                  <span className={`text-xs font-bold ${isDone ? 'line-through opacity-80' : 'text-slate-900 dark:text-white'}`}>
                    {item.title}
                  </span>
                </div>
                <p className="mt-1.5 text-[11px] opacity-80 pl-6 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Shipment Detail Modal */}
      {selectedShipmentForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className={`w-full max-w-2xl rounded-2xl border p-6 shadow-xl ${
            isDark ? 'border-slate-800 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-900'
          }`}>
            <div className="flex items-center justify-between border-b pb-4 border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-xs font-mono text-amber-500 font-semibold">
                  {selectedShipmentForModal.trackingNumber}
                </span>
                <h3 className="text-lg font-bold">
                  {selectedShipmentForModal.cargoDescription}
                </h3>
              </div>
              <button
                onClick={onCloseModal}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              {/* Timeline */}
              <div className="p-4 rounded-xl border bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800">
                <div className="font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Línea de Vida Logística & Despacho:
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Embarque en Origen ({selectedShipmentForModal.originCity}, {selectedShipmentForModal.originCountry})</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Arribo a Aduana Mexicana ({selectedShipmentForModal.customsPort})</span>
                  </div>
                  <div className="flex items-center gap-2 text-amber-500 font-semibold">
                    <Clock className="h-4 w-4" />
                    <span>Estatus Actual: {selectedShipmentForModal.lastUpdate}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <MapPin className="h-4 w-4" />
                    <span>Destino Final: {selectedShipmentForModal.destinationCity} (Vía {selectedShipmentForModal.lastMileCarrier})</span>
                  </div>
                </div>
              </div>

              {/* Data Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Cliente PyME:</span>
                  <span className="font-semibold">{selectedShipmentForModal.clientName}</span>
                </div>
                <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 block text-[10px]">RFC Importador:</span>
                  <span className="font-mono font-semibold">{selectedShipmentForModal.clientRfc}</span>
                </div>
                <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Incoterm:</span>
                  <span className="font-mono font-semibold text-amber-500">{selectedShipmentForModal.incoterm}</span>
                </div>
                <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Pedimento SAT:</span>
                  <span className="font-mono">{selectedShipmentForModal.pedimentoNumber}</span>
                </div>
                <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Valor Comercial USD:</span>
                  <span className="font-mono font-semibold">${selectedShipmentForModal.commercialValueUSD.toLocaleString()}</span>
                </div>
                <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Flete Última Milla:</span>
                  <span className="font-mono font-semibold text-emerald-500">${selectedShipmentForModal.lastMileCostMXN?.toLocaleString()} MXN</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={onCloseModal}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-amber-500 text-slate-950 hover:bg-amber-400"
              >
                Cerrar Ventana
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create New Shipment Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className={`w-full max-w-xl rounded-2xl border p-6 shadow-xl ${
            isDark ? 'border-slate-800 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-900'
          }`}>
            <div className="flex items-center justify-between border-b pb-4 border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-xs font-semibold text-amber-500 uppercase">Módulo de Despacho</span>
                <h3 className="text-lg font-bold">Registrar Nuevo Embarque para PyME</h3>
              </div>
              <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="mt-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 mb-1">Nombre de la PyME</label>
                  <input
                    type="text"
                    required
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    placeholder="Ej. Comercializadora Bajío S.A."
                    className={`w-full px-2.5 py-1.5 rounded-lg border outline-none ${
                      isDark ? 'border-slate-700 bg-slate-800 text-white' : 'border-slate-300 bg-slate-50'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 mb-1">RFC Importador</label>
                  <input
                    type="text"
                    value={formData.clientRfc}
                    onChange={(e) => setFormData({ ...formData, clientRfc: e.target.value.toUpperCase() })}
                    placeholder="CBA190312XX1"
                    className={`w-full px-2.5 py-1.5 font-mono uppercase rounded-lg border outline-none ${
                      isDark ? 'border-slate-700 bg-slate-800 text-white' : 'border-slate-300 bg-slate-50'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">Descripción de la Mercancía</label>
                <input
                  type="text"
                  required
                  value={formData.cargoDescription}
                  onChange={(e) => setFormData({ ...formData, cargoDescription: e.target.value })}
                  placeholder="Ej. 200 cajas de calzado de piel sintética"
                  className={`w-full px-2.5 py-1.5 rounded-lg border outline-none ${
                    isDark ? 'border-slate-700 bg-slate-800 text-white' : 'border-slate-300 bg-slate-50'
                  }`}
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 mb-1">Incoterm</label>
                  <select
                    value={formData.incoterm}
                    onChange={(e) => setFormData({ ...formData, incoterm: e.target.value })}
                    className={`w-full px-2 py-1.5 font-mono rounded-lg border outline-none ${
                      isDark ? 'border-slate-700 bg-slate-800 text-white' : 'border-slate-300 bg-slate-50'
                    }`}
                  >
                    <option value="FOB">FOB</option>
                    <option value="EXW">EXW</option>
                    <option value="CIF">CIF</option>
                    <option value="FCA">FCA</option>
                    <option value="DAP">DAP</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 mb-1">Valor USD</label>
                  <input
                    type="number"
                    value={formData.commercialValueUSD}
                    onChange={(e) => setFormData({ ...formData, commercialValueUSD: Number(e.target.value) || 0 })}
                    className={`w-full px-2 py-1.5 font-mono rounded-lg border outline-none ${
                      isDark ? 'border-slate-700 bg-slate-800 text-white' : 'border-slate-300 bg-slate-50'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 mb-1">Peso (kg)</label>
                  <input
                    type="number"
                    value={formData.weightKg}
                    onChange={(e) => setFormData({ ...formData, weightKg: Number(e.target.value) || 0 })}
                    className={`w-full px-2 py-1.5 font-mono rounded-lg border outline-none ${
                      isDark ? 'border-slate-700 bg-slate-800 text-white' : 'border-slate-300 bg-slate-50'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 mb-1">Aduana de Despacho</label>
                  <select
                    value={formData.customsPort}
                    onChange={(e) => setFormData({ ...formData, customsPort: e.target.value })}
                    className={`w-full px-2 py-1.5 rounded-lg border outline-none ${
                      isDark ? 'border-slate-700 bg-slate-800 text-white' : 'border-slate-300 bg-slate-50'
                    }`}
                  >
                    <option value="160 - Manzanillo, Colima">160 - Manzanillo, Colima</option>
                    <option value="240 - Nuevo Laredo, Tamaulipas">240 - Nuevo Laredo, Tamaulipas</option>
                    <option value="470 - AICM, CDMX">470 - AICM, CDMX</option>
                    <option value="430 - Veracruz, Veracruz">430 - Veracruz, Veracruz</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 mb-1">Ciudad Destino PyME</label>
                  <input
                    type="text"
                    value={formData.destinationCity}
                    onChange={(e) => setFormData({ ...formData, destinationCity: e.target.value })}
                    placeholder="Ej. León, Guanajuato"
                    className={`w-full px-2.5 py-1.5 rounded-lg border outline-none ${
                      isDark ? 'border-slate-700 bg-slate-800 text-white' : 'border-slate-300 bg-slate-50'
                    }`}
                  />
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-amber-500 text-slate-950 hover:bg-amber-400"
                >
                  Guardar Embarque
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
