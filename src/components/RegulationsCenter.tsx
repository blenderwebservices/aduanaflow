import React, { useState, useMemo } from 'react';
import {
  Scale,
  Search,
  BookOpen,
  Filter,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Calendar,
  Building,
  CheckCircle2,
  Download,
} from 'lucide-react';
import { REGULATIONS_CATALOG, RegulationItem } from '../utils/regulationsData';

interface RegulationsCenterProps {
  isDark: boolean;
}

export const RegulationsCenter: React.FC<RegulationsCenterProps> = ({ isDark }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'LEYES' | 'REGLAS_RGCE' | 'TRATADOS' | 'NOMS_RRNA' | 'DERECHOS_IMPUESTOS'>('ALL');
  const [expandedId, setExpandedId] = useState<string | null>('ley-aduanera');

  const filteredItems = useMemo(() => {
    return REGULATIONS_CATALOG.filter(item => {
      const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.officialName.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q) ||
        item.plainExplanation.toLowerCase().includes(q) ||
        item.keyArticles?.some(a => a.article.toLowerCase().includes(q) || a.topic.toLowerCase().includes(q));
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  const toggleExpand = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'LEYES':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase bg-blue-500/10 text-blue-500">Leyes Federales</span>;
      case 'REGLAS_RGCE':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase bg-amber-500/10 text-amber-500">RGCE & Anexo 22</span>;
      case 'TRATADOS':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase bg-purple-500/10 text-purple-500">Tratados (T-MEC)</span>;
      case 'NOMS_RRNA':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase bg-emerald-500/10 text-emerald-500">NOMs & RRNA</span>;
      case 'DERECHOS_IMPUESTOS':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase bg-rose-500/10 text-rose-500">Derechos & Fiscal</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className={`p-6 rounded-2xl border ${
        isDark ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-white'
      } shadow-xs`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              <Scale className="h-4 w-4" />
              <span>Marco Jurídico de Comercio Exterior Mexicano</span>
            </div>
            <h2 className="mt-1 text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Centro de Normatividad Actualizada
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
              Consulta las leyes, reglamentos, reglas de carácter general del SAT/ANAM y tratados de libre comercio con explicaciones aterrizadas a la operación diaria de una PyME.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => window.print()}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold border transition-colors ${
                isDark
                  ? 'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700'
                  : 'border-slate-300 bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Download className="h-3.5 w-3.5" />
              <span>Exportar Resumen</span>
            </button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por artículo, ley, concepto (ej. Art. 65 incrementables, DTA, T-MEC, NOM-050)..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 text-xs rounded-xl border focus:outline-hidden focus:ring-2 focus:ring-amber-500/50 ${
                isDark ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
              }`}
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'ALL', label: 'Todo el Marco' },
              { id: 'LEYES', label: 'Leyes' },
              { id: 'REGLAS_RGCE', label: 'RGCE' },
              { id: 'DERECHOS_IMPUESTOS', label: 'DTA / IVA' },
              { id: 'TRATADOS', label: 'Tratados' },
              { id: 'NOMS_RRNA', label: 'NOMs' },
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : isDark
                    ? 'bg-slate-800/80 text-slate-400 hover:text-white'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Regulations List */}
      <div className="space-y-4">
        {filteredItems.length === 0 ? (
          <div className={`p-12 text-center rounded-2xl border ${
            isDark ? 'border-slate-800 bg-slate-900/40 text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-600'
          }`}>
            <p className="text-sm">No se encontraron ordenamientos legales con el criterio "{searchQuery}".</p>
          </div>
        ) : (
          filteredItems.map(item => {
            const isExpanded = expandedId === item.id;

            return (
              <div
                key={item.id}
                className={`rounded-2xl border transition-all ${
                  isExpanded
                    ? isDark
                      ? 'border-amber-500/40 bg-slate-900/90 shadow-md ring-1 ring-amber-500/20'
                      : 'border-amber-400 bg-white shadow-md ring-1 ring-amber-400/20'
                    : isDark
                    ? 'border-slate-800/80 bg-slate-900/50 hover:border-slate-700'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                {/* Header */}
                <div
                  onClick={() => toggleExpand(item.id)}
                  className="p-5 flex items-start sm:items-center justify-between gap-4 cursor-pointer select-none"
                >
                  <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 font-mono font-bold text-xs border border-amber-500/20">
                      {item.code.substring(0, 4)}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
                          {item.title}
                        </h3>
                        {getCategoryBadge(item.category)}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {item.officialName}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{item.lastUpdate}</span>
                    </div>
                    <button
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      aria-label={isExpanded ? 'Contraer' : 'Expandir'}
                    >
                      {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* Body Details */}
                {isExpanded && (
                  <div className={`px-5 pb-6 pt-2 border-t text-xs ${
                    isDark ? 'border-slate-800/80 text-slate-300' : 'border-slate-100 text-slate-700'
                  }`}>
                    {/* Plain Explanation vs Practical Application */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-3">
                      <div className={`p-4 rounded-xl border ${
                        isDark ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200 bg-slate-50'
                      }`}>
                        <div className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                          Explicación Sencilla para la PyME
                        </div>
                        <p className="mt-2 text-slate-600 dark:text-slate-300 leading-relaxed text-xs sm:text-sm">
                          {item.plainExplanation}
                        </p>
                      </div>

                      <div className={`p-4 rounded-xl border ${
                        isDark ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200 bg-slate-50'
                      }`}>
                        <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                          Aplicación Práctica en la Aduana
                        </div>
                        <p className="mt-2 text-slate-600 dark:text-slate-300 leading-relaxed text-xs sm:text-sm">
                          {item.practicalApplication}
                        </p>
                      </div>
                    </div>

                    {/* Metadata strip */}
                    <div className={`mt-2 p-3 rounded-xl border flex flex-wrap items-center justify-between gap-3 text-slate-500 dark:text-slate-400 ${
                      isDark ? 'border-slate-800/80 bg-slate-950/40' : 'border-slate-200 bg-slate-100/50'
                    }`}>
                      <div>
                        <strong>Fuente Oficial:</strong> {item.officialSource}
                      </div>
                      <div>
                        <strong>Vigencia / Última reforma:</strong> {item.lastUpdate}
                      </div>
                      {item.sourceUrl && (
                        <a
                          href={item.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-amber-600 dark:text-amber-400 hover:underline font-semibold"
                        >
                          <span>Consultar texto oficial DOF</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>

                    {/* Key Articles Cards */}
                    {item.keyArticles && item.keyArticles.length > 0 && (
                      <div className="mt-4">
                        <div className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2.5">
                          Artículos & Puntos Clave de Cumplimiento
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                          {item.keyArticles.map((art, idx) => (
                            <div
                              key={idx}
                              className={`p-3.5 rounded-xl border ${
                                isDark ? 'border-slate-800 bg-slate-950/70' : 'border-slate-200 bg-white'
                              }`}
                            >
                              <div className="font-mono font-bold text-amber-600 dark:text-amber-400 text-xs">
                                {art.article}
                              </div>
                              <div className="font-semibold text-slate-900 dark:text-white text-xs mt-0.5">
                                {art.topic}
                              </div>
                              <p className="mt-1.5 text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                                {art.summary}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

