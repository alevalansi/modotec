import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Wrench, ChevronRight, Plus, Trash2, Pencil, Check, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { addTechnician, updateTechnician, deleteTechnician } from '../utils/storage';

export default function SelectTechnician() {
  const navigate = useNavigate();
  const { technicians, refreshTechnicians, setCurrentTechnician } = useApp();
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState('');
  const [saving, setSaving] = useState(false);

  const active = technicians.filter((t) => t.is_active !== false);

  const handleSelect = (tech) => {
    setCurrentTechnician(tech);
    navigate('/dashboard');
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setSaving(true);
    try {
      await addTechnician({ name: newName.trim(), is_active: true });
      await refreshTechnicians();
      setNewName('');
      setShowAdd(false);
    } catch (err) { alert('Error: ' + err.message); }
    finally { setSaving(false); }
  };

  const handleSaveEdit = async (id) => {
    if (!editName.trim()) return;
    try {
      await updateTechnician(id, { name: editName.trim() });
      await refreshTechnicians();
      setEditId(null);
    } catch (err) { alert('Error: ' + err.message); }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`¿Eliminar a "${name}"?`)) return;
    try {
      await deleteTechnician(id);
      await refreshTechnicians();
    } catch (err) { alert('Error: ' + err.message); }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-4 py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-orange-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Wrench size={32} className="text-orange-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100">ModotecApp</h1>
          <p className="text-slate-400 text-sm mt-1">Troubleshooting de instrumentos</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <p className="text-xs text-slate-400 mb-3 font-medium uppercase tracking-wide">¿Quién sos?</p>

          {active.length === 0 && !showAdd && (
            <p className="text-slate-500 text-sm text-center py-4">No hay técnicos. Agregá el primero.</p>
          )}

          <div className="space-y-2 mb-3">
            {active.map((tech, i) => (
              <motion.div key={tech.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                {editId === tech.id ? (
                  <div className="flex items-center gap-2 p-2 bg-slate-800 rounded-xl">
                    <input autoFocus value={editName} onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleSaveEdit(tech.id); if (e.key === 'Escape') setEditId(null); }}
                      className="flex-1 bg-slate-700 border border-orange-500 rounded-lg px-2 py-1 text-sm text-slate-100 focus:outline-none" />
                    <button onClick={() => handleSaveEdit(tech.id)} className="text-emerald-400 hover:text-emerald-300"><Check size={16} /></button>
                    <button onClick={() => setEditId(null)} className="text-slate-500 hover:text-slate-400"><X size={16} /></button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 group">
                    <button onClick={() => handleSelect(tech)}
                      className="flex-1 flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 transition-colors text-left">
                      <div className="w-9 h-9 bg-orange-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-orange-400 font-bold text-sm">{tech.name.charAt(0)}</span>
                      </div>
                      <span className="text-sm font-medium text-slate-100">{tech.name}</span>
                      <ChevronRight size={16} className="text-slate-600 ml-auto" />
                    </button>
                    <button onClick={() => { setEditId(tech.id); setEditName(tech.name); }}
                      className="p-1.5 text-slate-600 hover:text-sky-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => handleDelete(tech.id, tech.name)}
                      className="p-1.5 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {showAdd ? (
            <form onSubmit={handleAdd} className="flex gap-2">
              <input autoFocus required value={newName} onChange={(e) => setNewName(e.target.value)}
                placeholder="Nombre del técnico"
                className="flex-1 bg-slate-800 border border-orange-500 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none" />
              <button type="submit" disabled={saving} className="px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm disabled:opacity-50">
                {saving ? '...' : 'OK'}
              </button>
              <button type="button" onClick={() => setShowAdd(false)} className="px-3 py-2 bg-slate-800 text-slate-400 rounded-lg text-sm">
                <X size={16} />
              </button>
            </form>
          ) : (
            <button onClick={() => setShowAdd(true)}
              className="w-full flex items-center justify-center gap-2 py-2 text-sm text-slate-400 hover:text-orange-400 hover:bg-slate-800 rounded-xl transition-colors">
              <Plus size={16} />Agregar técnico
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
