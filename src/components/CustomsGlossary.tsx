import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Search,
  HelpCircle,
  Scale,
  Sparkles,
  Filter,
  Lightbulb,
} from 'lucide-react';
import { CUSTOMS_GLOSSARY, GlossaryTerm } from '../utils/glossaryData';

interface CustomsGlossaryProps {
  isDark: boolean;
}

export const CustomsGlossary: React.FC<CustomsGlossaryProps> = ({ isDark }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'ADUANAS' | 'FISCAL' | 'LOGISTICA' | 'NORMATIVA'>('ALL');

  const filteredTerms = useMemo(() => {
    return CUSTOMS_GLOSSARY.filter(item => {
      const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.term.toLowerCase().includes(q) ||
        (item.acronym && item.acronym.toLowerCase().includes(q)) ||
        item.shortDefinition.toLowerCase().includes(q) ||
        item.detailedExplanation.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className={`p-6 rounded-2xl border ${
        isDark ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-white'
      } shadow-xs`}>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
          <BookOpen className="h-4 w-4" />
          <span>Diccionario Práctico de Comercio Exterior Mexicano</span>
        </div>
        <h2 className="mt-1 text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Glosario Aduanal & Términos Técnicos
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
          Comprende sin rodeos los conceptos clave de la Ley Aduanera, trámites del SAT y fiscalización aduanera para evitar multas, retrasos y sobrecostos en tus importaciones.
        </p>

        {/* Search & Category Pills */}
        <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar término (ej. PAMA, VUCEM, DTA, Incrementables, Subvaluación)..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 text-xs rounded-xl border focus:outline-hidden focus:ring-2 focus:ring-amber-500/50 ${
                isDark ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
              }`}
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'ALL', label: 'Todos' },
              { id: 'ADUANAS', label: 'Aduanas' },
              { id: 'FISCAL', label: 'Fiscal' },
              { id: 'LOGISTICA', label: 'Logística' },
              { id: 'NORMATIVA', label: 'Normativa' },
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

      {/* Grid of Terms */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTerms.map((t, idx) => (
          <div
            key={idx}
            className={`p-5 rounded-2xl border flex flex-col justify-between transition-all ${
              isDark
                ? 'border-slate-800/80 bg-slate-900/50 hover:border-amber-500/30 hover:bg-slate-900/80'
                : 'border-slate-200 bg-white hover:border-amber-400 hover:shadow-xs'
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  {t.category}
                </span>
                {t.legalBasis && (
                  <span className="text-[10px] text-slate-400 truncate max-w-[150px]" title={t.legalBasis}>
                    {t.legalBasis.split(';')[0]}
                  </span>
                )}
              </div>

              <h3 className="mt-2.5 text-base font-bold text-slate-900 dark:text-white">
                {t.term}
              </h3>
              {t.acronym && (
                <div className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                  {t.acronym}
                </div>
              )}

              <p className="mt-2 text-xs font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
                {t.shortDefinition}
              </p>

              <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                {t.detailedExplanation}
              </p>
            </div>

            {/* PyME Tip */}
            <div className={`mt-4 p-3 rounded-xl border text-[11px] ${
              isDark ? 'border-amber-500/20 bg-amber-950/10 text-amber-200' : 'border-amber-200 bg-amber-50/70 text-amber-900'
            }`}>
              <div className="font-bold flex items-center gap-1.5 mb-1 text-[10px] uppercase tracking-wider text-amber-600 dark:text-amber-400">
                <Lightbulb className="h-3 w-3" />
                <span>Consejo PyME:</span>
              </div>
              <p className="italic leading-relaxed">{t.pymeTip}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

