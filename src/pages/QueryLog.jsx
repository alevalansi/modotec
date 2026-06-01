import { useState } from 'react';
import { motion } from 'framer-motion';
import { ClipboardList, Search, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatDateTime } from '../utils/helpers';
import { PageWrapper, PageHeader, Card } from '../components/Layout';

export default function QueryLog() {
  const { queriesLog } = useApp();
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(null);

  const filtered = queriesLog.filter((q) =>
    q.question?.toLowerCase().includes(search.toLowerCase()) ||
    q.instrument_name?.toLowerCase().includes(search.toLowerCase()) ||
    q.brand_name?.toLowerCase().includes(search.toLowerCase()) ||
    q.technician_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PageWrapper>
      <PageHeader title="Registro de consultas" subtitle={`${queriesLog.length} consultas totales`} />

      <div className="relative mb-4">
        <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por técnico, instrumento, pregunta..."
          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 pr-9 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-orange-500" />
      </div>

      {filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <ClipboardList size={40} className="mx-auto text-slate-600 mb-3" />
          <p className="text-slate-500 text-sm">{search ? 'Sin resultados' : 'No hay consultas aún'}</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((entry, i) => (
            <motion.div key={entry.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Card className="p-4">
                <button onClick={() => setExpanded(expanded === entry.id ? null : entry.id)} className="w-full text-left">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs text-orange-400 font-medium">{entry.brand_name}</span>
                        <span className="text-xs text-slate-500">•</span>
                        <span className="text-xs text-sky-400">{entry.instrument_name}</span>
                      </div>
                      <p className="text-sm text-slate-200 line-clamp-2">{entry.question}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                        <span>{entry.technician_name}</span>
                        <span className="flex items-center gap-1"><Clock size={10} />{formatDateTime(entry.created_at)}</span>
                      </div>
                    </div>
                    {expanded === entry.id ? <ChevronUp size={16} className="text-slate-500 flex-shrink-0 mt-1" /> : <ChevronDown size={16} className="text-slate-500 flex-shrink-0 mt-1" />}
                  </div>
                </button>
                {expanded === entry.id && entry.answer && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                    className="mt-3 pt-3 border-t border-slate-800">
                    <p className="text-xs text-slate-400 mb-1">Respuesta de la IA:</p>
                    <p className="text-sm text-slate-300 whitespace-pre-wrap">{entry.answer}</p>
                  </motion.div>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </PageWrapper>
  );
}
