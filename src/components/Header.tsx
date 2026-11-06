import React from 'react';
import { Menu, Sun, Moon, ArrowUpRight, DollarSign } from 'lucide-react';
import { NavTab } from './Sidebar';

interface HeaderProps {
  currentTab: NavTab;
  onToggleMobileMenu: () => void;
  isDark: boolean;
  onToggleDark: () => void;
  onOpenQuickAction: () => void;
  exchangeRate: number;
  onOpenLegalNotice?: () => void;
}

const TAB_TITLES: Record<NavTab, { title: string; breadcrumb: string }> = {
  dashboard: {
    title: 'Panel Principal de Operaciones',
    breadcrumb: 'AduanaFlow / Métricas & Panorama General',
  },
  calculator: {
    title: 'Simulador Financiero Landed Cost',
    breadcrumb: 'AduanaFlow / Costeo & Margen de Importación',
  },
  pedimentos: {
    title: 'Auditor Normativo de Pedimentos',
    breadcrumb: 'AduanaFlow / Cumplimiento SAT Anexo 22',
  },
  incoterms: {
    title: 'Matriz Comparativa Incoterms 2020',
    breadcrumb: 'AduanaFlow / Transferencia de Costos & Riesgo',
  },
  shipments: {
    title: 'Gestión de Tráfico & Última Milla',
    breadcrumb: 'AduanaFlow / Monitoreo & Despacho Aduanal',
  },
  documents: {
    title: 'Biblioteca Documental de Comercio Exterior',
    breadcrumb: 'AduanaFlow / Catálogo Pedagógico de 11 Documentos',
  },
  regulations: {
    title: 'Centro de Normatividad Actualizada',
    breadcrumb: 'AduanaFlow / Ley Aduanera, LIGIE, RGCE & NOMs',
  },
  glossary: {
    title: 'Glosario Integral de Comercio Exterior',
    breadcrumb: 'AduanaFlow / Diccionario Técnico para PyMEs',
  },
  'mobile-api': {
    title: 'Portal de API REST & Simulador Móvil',
    breadcrumb: 'AduanaFlow / Apps Móviles para PyMEs (iOS & Android)',
  },
};

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onToggleMobileMenu,
  isDark,
  onToggleDark,
  onOpenQuickAction,
  exchangeRate,
}) => {
  const current = TAB_TITLES[currentTab];

  return (
    <header
      className={`sticky top-0 z-30 flex h-16 w-full items-center justify-between gap-4 border-b px-4 lg:px-8 transition-colors ${
        isDark
          ? 'bg-slate-950/90 border-slate-800/80 backdrop-blur-md text-slate-100'
          : 'bg-white/90 border-slate-200/80 backdrop-blur-md text-slate-900'
      }`}
    >
      {/* Zone 1: Mobile burger + Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900"
          aria-label="Abrir menú de navegación"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="min-w-0">
          <div className="text-[11px] font-medium text-slate-400 dark:text-slate-500 truncate">
            {current.breadcrumb}
          </div>
          <h1 className="text-sm lg:text-base font-bold tracking-tight text-slate-900 dark:text-white truncate">
            {current.title}
          </h1>
        </div>
      </div>

      {/* Zone 2: Live FX Rate & Indicators */}
      <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-mono tabular-nums bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
        <DollarSign className="h-3.5 w-3.5 text-amber-500" />
        <span>USD/MXN DOF:</span>
        <span className="font-semibold text-slate-900 dark:text-amber-400">
          ${exchangeRate.toFixed(2)}
        </span>
      </div>

      {/* Zone 3: Actions (Theme toggle + Primary CTA) */}
      <div className="flex items-center gap-2.5 shrink-0">
        <button
          onClick={onToggleDark}
          className={`p-2 rounded-lg border transition-colors ${
            isDark
              ? 'border-slate-800 bg-slate-900 text-amber-400 hover:bg-slate-800'
              : 'border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
          title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          aria-label="Alternar tema visual"
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        <button
          onClick={onOpenQuickAction}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors shadow-xs whitespace-nowrap shrink-0"
        >
          <span>Nueva Simulación</span>
          <ArrowUpRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </header>
  );
};
