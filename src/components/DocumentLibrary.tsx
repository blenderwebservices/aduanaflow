import React, { useState, useMemo } from 'react';
import {
  FileText,
  Search,
  BookOpen,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Sparkles,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Download,
  Building2,
  HelpCircle,
} from 'lucide-react';
import { CUSTOMS_DOCUMENTS_CATALOG, CustomsDocumentItem } from '../utils/documentCatalogData';

interface DocumentLibraryProps {
  isDark: boolean;
}

export const DocumentLibrary: React.FC<DocumentLibraryProps> = ({ isDark }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'COMERCIAL' | 'TRANSPORTE' | 'ADUANAL' | 'CUMPLIMIENTO'>('ALL');
  const [expandedDocId, setExpandedDocId] = useState<string | null>('factura-comercial');

  const filteredDocs = useMemo(() => {
    return CUSTOMS_DOCUMENTS_CATALOG.filter(doc => {
      const matchesCategory = selectedCategory === 'ALL' || doc.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        doc.title.toLowerCase().includes(q) ||
        doc.subtitle.toLowerCase().includes(q) ||
        doc.whatIsIt.toLowerCase().includes(q) ||
        doc.code.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  const toggleExpand = (id: string) => {
    setExpandedDocId(prev => (prev === id ? null : id));
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'COMERCIAL':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase bg-blue-500/10 text-blue-500">Comercial</span>;
      case 'TRANSPORTE':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase bg-emerald-500/10 text-emerald-500">Transporte</span>;
      case 'ADUANAL':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase bg-amber-500/10 text-amber-500">Aduanal</span>;
      case 'CUMPLIMIENTO':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase bg-purple-500/10 text-purple-500">Cumplimiento / RRNA</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className={`p-6 rounded-2xl border ${
        isDark ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-white'
      } shadow-xs`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              <BookOpen className="h-4 w-4" />
              <span>Módulo Educativo y de Referencia Técnica</span>
            </div>
            <h2 className="mt-1 text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Biblioteca Documental de Comercio Exterior
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
              Catálogo pedagógico para dominar los 11 documentos indispensables en una importación aduanera hacia México: función, emisor, requisitos del Anexo 22, errores recurrentes y base legal.
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
              <span>Imprimir Fichas</span>
            </button>
          </div>
        </div>

        {/* Search & Category Filter Pills */}
        <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar documento por nombre, clave (ej. B/L, COVE, DODA, Factura)..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 text-xs rounded-xl border focus:outline-hidden focus:ring-2 focus:ring-amber-500/50 ${
                isDark ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
              }`}
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'ALL', label: 'Todos (11)' },
              { id: 'COMERCIAL', label: 'Comerciales' },
              { id: 'TRANSPORTE', label: 'Transporte' },
              { id: 'ADUANAL', label: 'Aduanales' },
              { id: 'CUMPLIMIENTO', label: 'RRNA & Origen' },
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

      {/* Document Catalog Accordion / Cards */}
      <div className="space-y-4">
        {filteredDocs.length === 0 ? (
          <div className={`p-12 text-center rounded-2xl border ${
            isDark ? 'border-slate-800 bg-slate-900/40 text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-600'
          }`}>
            <p className="text-sm">No se encontraron documentos con el criterio "{searchQuery}".</p>
          </div>
        ) : (
          filteredDocs.map(doc => {
            const isExpanded = expandedDocId === doc.id;

            return (
              <div
                key={doc.id}
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
                {/* Collapsed Header */}
                <div
                  onClick={() => toggleExpand(doc.id)}
                  className="p-5 flex items-start sm:items-center justify-between gap-4 cursor-pointer select-none"
                >
                  <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 font-mono font-bold text-xs border border-amber-500/20">
                      {doc.code}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
                          {doc.title}
                        </h3>
                        {getCategoryBadge(doc.category)}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {doc.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="hidden sm:inline-block text-xs text-slate-400 dark:text-slate-500 font-mono">
                      {doc.whoIssuesIt.split(' ')[0]}...
                    </span>
                    <button
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      aria-label={isExpanded ? 'Contraer ficha' : 'Expandir ficha'}
                    >
                      {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details Body */}
                {isExpanded && (
                  <div className={`px-5 pb-6 pt-2 border-t text-xs ${
                    isDark ? 'border-slate-800/80 text-slate-300' : 'border-slate-100 text-slate-700'
                  }`}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 py-3">
                      {/* 1. ¿Para qué es? */}
                      <div className={`p-4 rounded-xl border ${
                        isDark ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200 bg-slate-50'
                      }`}>
                        <div className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                          ¿Qué es?
                        </div>
                        <p className="mt-1.5 leading-relaxed text-slate-600 dark:text-slate-300">
                          {doc.whatIsIt}
                        </p>
                      </div>

                      {/* 2. ¿Para qué sirve? */}
                      <div className={`p-4 rounded-xl border ${
                        isDark ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200 bg-slate-50'
                      }`}>
                        <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                          ¿Para qué sirve?
                        </div>
                        <p className="mt-1.5 leading-relaxed text-slate-600 dark:text-slate-300">
                          {doc.whatIsItFor}
                        </p>
                      </div>

                      {/* 3. ¿Quién lo emite? */}
                      <div className={`p-4 rounded-xl border ${
                        isDark ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200 bg-slate-50'
                      }`}>
                        <div className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                          ¿Quién lo emite?
                        </div>
                        <p className="mt-1.5 font-medium text-slate-900 dark:text-white">
                          {doc.whoIssuesIt}
                        </p>
                        <div className="mt-2 text-[10px] text-slate-500">
                          <strong>Momento de uso:</strong> {doc.whenIsItUsed}
                        </div>
                      </div>

                      {/* 4. Fundamento Legal */}
                      <div className={`p-4 rounded-xl border ${
                        isDark ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200 bg-slate-50'
                      }`}>
                        <div className="text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
                          <Scale className="h-3.5 w-3.5" />
                          <span>Fundamento Legal</span>
                        </div>
                        <p className="mt-1.5 font-medium text-slate-800 dark:text-slate-200">
                          {doc.legalReference}
                        </p>
                      </div>
                    </div>

                    {/* Detailed Columns: Contenido obligatorio vs Errores Comunes */}
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Left: Requisitos de información obligatoria */}
                      <div className={`p-4 rounded-xl border ${
                        isDark ? 'border-emerald-500/20 bg-emerald-950/10' : 'border-emerald-200 bg-emerald-50/50'
                      }`}>
                        <div className="flex items-center gap-2 font-bold text-emerald-700 dark:text-emerald-400 text-xs">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Información Obligatoria que Debe Contener</span>
                        </div>
                        <ul className="mt-3 space-y-2">
                          {doc.mandatoryContent.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                              <span className="text-slate-700 dark:text-slate-300 leading-relaxed">
                                {item}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Right: Errores comunes & Recomendaciones */}
                      <div className={`p-4 rounded-xl border ${
                        isDark ? 'border-red-500/20 bg-red-950/10' : 'border-red-200 bg-red-50/50'
                      }`}>
                        <div className="flex items-center gap-2 font-bold text-red-700 dark:text-red-400 text-xs">
                          <AlertTriangle className="h-4 w-4" />
                          <span>Errores Frecuentes & Riesgos de Auditoría</span>
                        </div>
                        <ul className="mt-3 space-y-2">
                          {doc.commonPitfalls.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="h-1.5 w-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                              <span className="text-slate-700 dark:text-slate-300 leading-relaxed">
                                {item}
                              </span>
                            </li>
                          ))}
                        </ul>

                        {/* Buenas prácticas */}
                        {doc.bestPractices && doc.bestPractices.length > 0 && (
                          <div className="mt-4 pt-3 border-t border-red-200/40 dark:border-red-500/20">
                            <div className="text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wide">
                              Consejo Práctico AduanaFlow:
                            </div>
                            <p className="mt-1 text-slate-700 dark:text-slate-300 italic">
                              "{doc.bestPractices[0]}"
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
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

