import React from 'react';
import {
  LayoutDashboard,
  Calculator,
  FileCheck2,
  Globe2,
  Truck,
  Smartphone,
  ChevronRight,
  ShieldCheck,
  Building2,
  Sparkles,
} from 'lucide-react';

export type NavTab = 'dashboard' | 'calculator' | 'pedimentos' | 'incoterms' | 'shipments' | 'mobile-api';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  isDark: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile,
  isDark,
}) => {
  const navItems = [
    {
      id: 'dashboard' as NavTab,
      label: 'Panel Principal',
      subtitle: 'Métricas & Panorama',
      icon: LayoutDashboard,
    },
    {
      id: 'calculator' as NavTab,
      label: 'Simulador Landed Cost',
      subtitle: 'Cálculo Aduanal & Margen',
      icon: Calculator,
      highlight: true,
    },
    {
      id: 'pedimentos' as NavTab,
      label: 'Auditor de Pedimentos',
      subtitle: 'Cumplimiento SAT Anexo 22',
      icon: FileCheck2,
    },
    {
      id: 'incoterms' as NavTab,
      label: 'Matriz Incoterms 2020',
      subtitle: 'Responsabilidades & Riesgo',
      icon: Globe2,
    },
    {
      id: 'shipments' as NavTab,
      label: 'Gestión de Envíos',
      subtitle: 'Tráfico & Última Milla',
      icon: Truck,
    },
    {
      id: 'mobile-api' as NavTab,
      label: 'API & Simulador Móvil',
      subtitle: 'iOS & Android Dev Center',
      icon: Smartphone,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Filament-inspired Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-72 flex-col border-r transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${isOpenMobile ? 'translate-x-0' : '-translate-x-full'
          } ${isDark
            ? 'bg-slate-950 border-slate-800 text-slate-200'
            : 'bg-white border-slate-200 text-slate-800'
          }`}
      >
        {/* Brand Header */}
        <div className={`flex h-16 items-center justify-between px-6 border-b ${isDark ? 'border-slate-800/80 bg-slate-900/40' : 'border-slate-100 bg-slate-50/50'
          }`}>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500 text-slate-950 font-bold shadow-xs">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight block leading-tight text-slate-900 dark:text-white">
                AduanaFlow
              </span>
              <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400 block leading-none">
                Filament Core · PyME Trade
              </span>
            </div>
          </div>
        </div>

        {/* Workspace Context Tag */}
        <div className={`mx-4 mt-4 p-3 rounded-lg border ${isDark
            ? 'bg-slate-900/70 border-slate-800 text-slate-300'
            : 'bg-amber-50/60 border-amber-200/60 text-slate-700'
          }`}>
          <div className="flex items-center gap-2 text-xs font-semibold">
            <Building2 className="h-3.5 w-3.5 text-amber-500" />
            <span>Módulo de Comercio Exterior</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            Optimizador para importadoras, agentes aduanales y micropymes.
          </p>
        </div>

        {/* Navigation Items */}
        <div className="mt-4 flex-1 overflow-y-auto px-3 space-y-1">
          <div className="px-3 pb-1 text-[10px] font-semibold tracking-wider uppercase text-slate-400 dark:text-slate-500">
            Recursos y Simuladores
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  onCloseMobile();
                }}
                className={`group flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${isActive
                    ? isDark
                      ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                      : 'bg-amber-50 text-amber-900 border border-amber-300/80 shadow-xs'
                    : isDark
                      ? 'text-slate-300 hover:bg-slate-900 hover:text-white border border-transparent'
                      : 'text-slate-700 hover:bg-slate-100/80 hover:text-slate-900 border border-transparent'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-4 w-4 shrink-0 transition-colors ${isActive
                        ? 'text-amber-500'
                        : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200'
                      }`}
                  />
                  <div>
                    <div className="leading-tight">{item.label}</div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">
                      {item.subtitle}
                    </div>
                  </div>
                </div>
                <ChevronRight
                  className={`h-3.5 w-3.5 transition-transform ${isActive ? 'text-amber-500 translate-x-0.5' : 'text-slate-400 opacity-40 group-hover:opacity-100'
                    }`}
                />
              </button>
            );
          })}
        </div>

        {/* Specialist Profile Badge: Alexa Sánchez */}
        <div className={`p-4 m-3 rounded-xl border ${isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
          <div className="flex items-center gap-3">
            <img
              src="/src/assets/images/alexa_founder_avatar_1793831212997.jpg"
              alt="Alexa Sánchez"
              className="h-10 w-10 rounded-full object-cover ring-2 ring-amber-500/30"
              referrerPolicy="no-referrer"
            />
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold truncate text-slate-900 dark:text-white">
                Lic. Alexa Sánchez
              </div>
              <div className="text-[11px] text-amber-600 dark:text-amber-400 truncate">
                Comercio Int. & Aduanas
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">
                Especialista en Pedimentos
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
