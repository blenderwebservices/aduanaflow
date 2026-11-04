import React, { useState, useEffect } from 'react';
import { Sidebar, NavTab } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { LandedCostSimulator } from './components/LandedCostSimulator';
import { PedimentoAuditor } from './components/PedimentoAuditor';
import { IncotermsMatrix } from './components/IncotermsMatrix';
import { ShipmentsDashboard } from './components/ShipmentsDashboard';
import { MobileApiPortal } from './components/MobileApiPortal';
import { ShipmentRecord } from '../server';

const INITIAL_SHIPMENTS: ShipmentRecord[] = [
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

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [isDark, setIsDark] = useState<boolean>(true);
  const [isOpenMobile, setIsOpenMobile] = useState<boolean>(false);
  const [shipments, setShipments] = useState<ShipmentRecord[]>(INITIAL_SHIPMENTS);
  const [selectedShipmentForModal, setSelectedShipmentForModal] = useState<ShipmentRecord | null>(null);
  const [exchangeRate] = useState<number>(19.85);

  // Sync dark class with document element
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Fetch live shipments from API on load
  useEffect(() => {
    fetch('/api/v1/shipments')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setShipments(data.data);
        }
      })
      .catch(() => {
        // Fallback already populated
      });
  }, []);

  const handleAddShipment = async (newShipmentData: Partial<ShipmentRecord>) => {
    try {
      const res = await fetch('/api/v1/shipments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newShipmentData),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setShipments((prev) => [data.data, ...prev]);
      } else {
        // Local fallback
        const localId = `SHP-2024-${String(shipments.length + 1).padStart(3, '0')}`;
        const newRecord: ShipmentRecord = {
          id: localId,
          trackingNumber: `MX-AF-${Math.floor(10000 + Math.random() * 90000)}`,
          clientName: newShipmentData.clientName || 'PyME Mexicana',
          clientRfc: newShipmentData.clientRfc || 'GEN010101000',
          originCountry: newShipmentData.originCountry || 'China',
          originCity: newShipmentData.originCity || 'Shenzhen',
          destinationCity: newShipmentData.destinationCity || 'Ciudad de México',
          incoterm: newShipmentData.incoterm || 'FOB',
          status: 'ORIGIN',
          customsPort: newShipmentData.customsPort || '160 - Manzanillo, Colima',
          pedimentoNumber: newShipmentData.pedimentoNumber || '24 16 3840 4 000100',
          cargoDescription: newShipmentData.cargoDescription || 'Mercancía de importación',
          weightKg: Number(newShipmentData.weightKg) || 100,
          packagesCount: Number(newShipmentData.packagesCount) || 10,
          commercialValueUSD: Number(newShipmentData.commercialValueUSD) || 5000,
          customsValueMXN: Number(newShipmentData.customsValueMXN) || 99250,
          eta: '2026-11-15',
          lastUpdate: 'Embarque registrado en plataforma para gestión y última milla',
          lastMileCarrier: newShipmentData.lastMileCarrier || 'Red Logística Castores',
          lastMileCostMXN: Number(newShipmentData.lastMileCostMXN) || 3500,
        };
        setShipments((prev) => [newRecord, ...prev]);
      }
    } catch {
      // Local fallback on network error
    }
  };

  return (
    <div className={`min-h-screen flex ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        isOpenMobile={isOpenMobile}
        onCloseMobile={() => setIsOpenMobile(false)}
        isDark={isDark}
      />

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header
          currentTab={currentTab}
          onToggleMobileMenu={() => setIsOpenMobile((v) => !v)}
          isDark={isDark}
          onToggleDark={() => setIsDark((v) => !v)}
          onOpenQuickAction={() => setCurrentTab('calculator')}
          exchangeRate={exchangeRate}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {currentTab === 'dashboard' && (
            <DashboardView
              shipments={shipments}
              onNavigateTab={setCurrentTab}
              isDark={isDark}
              onOpenShipmentDetail={(shipment) => setSelectedShipmentForModal(shipment)}
            />
          )}

          {currentTab === 'calculator' && (
            <LandedCostSimulator
              isDark={isDark}
              onSendToPedimento={() => setCurrentTab('pedimentos')}
            />
          )}

          {currentTab === 'pedimentos' && (
            <PedimentoAuditor isDark={isDark} />
          )}

          {currentTab === 'incoterms' && (
            <IncotermsMatrix isDark={isDark} />
          )}

          {currentTab === 'shipments' && (
            <ShipmentsDashboard
              shipments={shipments}
              onAddShipment={handleAddShipment}
              isDark={isDark}
              selectedShipmentForModal={selectedShipmentForModal}
              onCloseModal={() => setSelectedShipmentForModal(null)}
              onOpenShipmentDetail={(shipment) => setSelectedShipmentForModal(shipment)}
            />
          )}

          {currentTab === 'mobile-api' && (
            <MobileApiPortal isDark={isDark} shipments={shipments} />
          )}
        </main>
      </div>
    </div>
  );
}
