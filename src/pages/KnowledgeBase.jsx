import { useState } from 'react';
import { motion } from 'framer-motion';
import { Database, Search, Trash2, CheckCircle, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { deleteKnowledgeEntry, updateKnowledgeEntry } from '../utils/storage';
import { formatDate } from '../utils/helpers';
import { PageWrapper, PageHeader, Card } from '../components/Layout';

export default function KnowledgeBase() {
  const { knowledgeBase, brands, instruments, refreshKnowledgeBase } = useApp();
  const [search, setSearch] = useState('');

  const filtered = knowledgeBase.filter((e) =>
    e.problem?.toLowerCase().includes(search.toLowerCase()) ||
    e.solution?.toLowerCase().includes(search.toLowerCase()) ||
    e.instrument_name?.toLowerCase().includes(search.toLowerCase()) ||
    e.brand_name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id, problem) => {
    if (!confirm(`¿Eliminar esta solución?`)) return;
    try {
      await deleteKnowledgeEntry(id);
      await refreshKnowledgeBase();
    } catch (err) { alert('Error: ' + err.message); }
  };

  const handleVerify = async (id, current) => {
    try {
      await updateKnowledgeEntry(id, { verified: !current });
      await refreshKnowledgeBase();
    } catch (err) { console.error(err); }
  };

  return (
    <PageWrapper>
      <PageHeader title="Base de conocimiento" subtitle={`${knowledgeBase.length} soluciones documentadas por el equipo`} />

      <div className="relative mb-4">
        <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar problema, solución, instrumento..."
          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 pr-9 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-orange-500" />
      </div>

      {filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <Database size={40} className="mx-auto text-slate-600 mb-3" />
          <p className="text-slate-500 text-sm">
            {search ? 'No se encontraron resultados' : 'Aún no hay soluciones documentadas'}
          </p>
          <p className="text-slate-600 text-xs mt-2">Cuando un técnico resuelva un problema que no estaba en el manual, puede documentarlo desde la página del instrumento.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((entry, i) => (
            <motion.div key={entry.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Card className={`p-4 ${entry.verified ? 'border-emerald-500/20' : ''}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="text-xs px-2 py-0.5 bg-orange-500/10 text-orange-400 rounded-full border border-orange-500/20">
                        {entry.brand_name || '—'}
                      </span>
                      <span className="text-xs px-2 py-0.5 bg-sky-500/10 text-sky-400 rounded-full border border-sky-500/20">
                        {entry.instrument_name || '—'}
                      </span>
                      {entry.verified && (
                        <span className="text-xs px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20 flex items-center gap-1">
                          <CheckCircle size={10} />Verificado
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-amber-400 mb-1">⚠ {entry.problem}</p>
                    <p className="text-sm text-slate-200">✓ {entry.solution}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                      <span>{entry.technician_name}</span>
                      <span className="flex items-center gap-1"><Clock size={10} />{formatDate(entry.created_at)}</span>
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button onClick={() => handleVerify(entry.id, entry.verified)}
                      className={`p-1.5 rounded transition-colors ${entry.verified ? 'text-emerald-400 hover:text-slate-400' : 'text-slate-600 hover:text-emerald-400'}`}
                      title={entry.verified ? 'Quitar verificación' : 'Marcar como verificado'}>
                      <CheckCircle size={15} />
                    </button>
                    <button onClick={() => handleDelete(entry.id)} className="p-1.5 text-slate-600 hover:text-red-400 rounded transition-colors">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </PageWrapper>
  );
}
