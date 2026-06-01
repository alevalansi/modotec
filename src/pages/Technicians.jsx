import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, Trash2, Pencil, Check, X, ToggleLeft, ToggleRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { addTechnician, updateTechnician, deleteTechnician } from '../utils/storage';
import { PageWrapper, PageHeader, Card, Button } from '../components/Layout';

export default function Technicians() {
  const { technicians, refreshTechnicians } = useApp();
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', specialty: '', phone: '' });
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!addForm.name.trim()) return;
    setSaving(true);
    try {
      await addTechnician({ name: addForm.name.trim(), specialty: addForm.specialty.trim(), phone: addForm.phone.trim(), is_active: true });
      await refreshTechnicians();
      setAddForm({ name: '', specialty: '', phone: '' });
      setShowAdd(false);
    } catch (err) { alert('Error: ' + err.message); }
    finally { setSaving(false); }
  };

  const handleSaveEdit = async (id) => {
    try {
      await updateTechnician(id, editForm);
      await refreshTechnicians();
      setEditId(null);
    } catch (err) { alert('Error: ' + err.message); }
  };

  const toggleActive = async (tech) => {
    try {
      await updateTechnician(tech.id, { is_active: !tech.is_active });
      await refreshTechnicians();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`¿Eliminar a "${name}"?`)) return;
    try {
      await deleteTechnician(id);
      await refreshTechnicians();
    } catch (err) { alert('Error: ' + err.message); }
  };

  const active = technicians.filter((t) => t.is_active !== false);
  const inactive = technicians.filter((t) => t.is_active === false);

  return (
    <PageWrapper>
      <PageHeader title="Técnicos" subtitle={`${active.length} activos, ${inactive.length} inactivos`}
        actions={<Button onClick={() => setShowAdd(!showAdd)}><Plus size={16} />{showAdd ? 'Cancelar' : 'Agregar'}</Button>} />

      {showAdd && (
        <Card className="p-4 mb-4">
          <form onSubmit={handleAdd} className="space-y-3">
            <input required placeholder="Nombre *" value={addForm.name} onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-orange-500" />
            <div className="grid grid-cols-2 gap-2">
              <input placeholder="Especialidad" value={addForm.specialty} onChange={(e) => setAddForm({ ...addForm, specialty: e.target.value })}
                className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-orange-500" />
              <input placeholder="Teléfono" value={addForm.phone} onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-orange-500" />
            </div>
            <button type="submit" disabled={saving} className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-lg py-2 text-sm font-medium">
              {saving ? 'Guardando...' : 'Agregar'}
            </button>
          </form>
        </Card>
      )}

      <div className="space-y-2">
        {technicians.map((tech, i) => (
          <motion.div key={tech.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
            <Card className={`p-4 ${tech.is_active === false ? 'opacity-60' : ''}`}>
              {editId === tech.id ? (
                <div className="space-y-2">
                  <input value={editForm.name || ''} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full bg-slate-800 border border-orange-500 rounded-lg px-3 py-1.5 text-sm text-slate-100 focus:outline-none" />
                  <div className="grid grid-cols-2 gap-2">
                    <input value={editForm.specialty || ''} onChange={(e) => setEditForm({ ...editForm, specialty: e.target.value })}
                      placeholder="Especialidad" className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-100 focus:outline-none" />
                    <input value={editForm.phone || ''} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      placeholder="Teléfono" className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-100 focus:outline-none" />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleSaveEdit(tech.id)} className="flex-1 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg text-sm flex items-center justify-center gap-1">
                      <Check size={14} />Guardar
                    </button>
                    <button onClick={() => setEditId(null)} className="flex-1 py-1.5 bg-slate-800 text-slate-400 rounded-lg text-sm flex items-center justify-center gap-1">
                      <X size={14} />Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-orange-400 font-bold text-sm">{tech.name.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-100">{tech.name}</p>
                    {tech.specialty && <p className="text-xs text-slate-400">{tech.specialty}</p>}
                    {tech.phone && <p className="text-xs text-slate-500">{tech.phone}</p>}
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => { setEditId(tech.id); setEditForm({ name: tech.name, specialty: tech.specialty || '', phone: tech.phone || '' }); }}
                      className="p-1.5 text-slate-500 hover:text-sky-400"><Pencil size={15} /></button>
                    <button onClick={() => toggleActive(tech)} className={tech.is_active !== false ? 'text-emerald-400' : 'text-slate-600'}>
                      {tech.is_active !== false ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                    </button>
                    <button onClick={() => handleDelete(tech.id, tech.name)} className="p-1 text-slate-600 hover:text-red-400"><Trash2 size={15} /></button>
                  </div>
                </div>
              )}
            </Card>
          </motion.div>
        ))}
      </div>
    </PageWrapper>
  );
}
