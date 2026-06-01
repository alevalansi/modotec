import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, Cpu, Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { addBrand, updateBrand, deleteBrand, addInstrument, updateInstrument, deleteInstrument } from '../utils/storage';
import { INSTRUMENT_TYPES } from '../utils/helpers';
import { PageWrapper, PageHeader, Card, Button, Input, Select } from '../components/Layout';

export default function AdminPage() {
  const [searchParams] = useSearchParams();
  const defaultBrandId = searchParams.get('brandId') || '';

  const { brands, instruments, refreshBrands, refreshInstruments } = useApp();

  const [tab, setTab] = useState('brands');
  const [showBrandForm, setShowBrandForm] = useState(false);
  const [brandName, setBrandName] = useState('');
  const [editBrandId, setEditBrandId] = useState(null);
  const [editBrandName, setEditBrandName] = useState('');

  const [showInstForm, setShowInstForm] = useState(false);
  const [instForm, setInstForm] = useState({ name: '', model: '', type: '', brand_id: defaultBrandId, description: '' });
  const [editInstId, setEditInstId] = useState(null);
  const [editInstForm, setEditInstForm] = useState({});
  const [saving, setSaving] = useState(false);

  // BRANDS
  const handleAddBrand = async (e) => {
    e.preventDefault();
    if (!brandName.trim()) return;
    setSaving(true);
    try {
      await addBrand({ name: brandName.trim() });
      await refreshBrands();
      setBrandName('');
      setShowBrandForm(false);
    } catch (err) { alert('Error: ' + err.message); }
    finally { setSaving(false); }
  };

  const handleSaveEditBrand = async (id) => {
    if (!editBrandName.trim()) return;
    try {
      await updateBrand(id, { name: editBrandName.trim() });
      await refreshBrands();
      setEditBrandId(null);
    } catch (err) { alert('Error: ' + err.message); }
  };

  const handleDeleteBrand = async (id, name) => {
    if (!confirm(`¿Eliminar la marca "${name}"? Se eliminarán todos sus instrumentos.`)) return;
    try {
      await deleteBrand(id);
      await refreshBrands();
      await refreshInstruments();
    } catch (err) { alert('Error: ' + err.message); }
  };

  // INSTRUMENTS
  const handleAddInstrument = async (e) => {
    e.preventDefault();
    if (!instForm.name.trim() || !instForm.brand_id) return;
    setSaving(true);
    try {
      await addInstrument({ ...instForm, name: instForm.name.trim() });
      await refreshInstruments();
      setInstForm({ name: '', model: '', type: '', brand_id: defaultBrandId, description: '' });
      setShowInstForm(false);
    } catch (err) { alert('Error: ' + err.message); }
    finally { setSaving(false); }
  };

  const handleSaveEditInst = async (id) => {
    try {
      await updateInstrument(id, editInstForm);
      await refreshInstruments();
      setEditInstId(null);
    } catch (err) { alert('Error: ' + err.message); }
  };

  const handleDeleteInst = async (id, name) => {
    if (!confirm(`¿Eliminar "${name}"?`)) return;
    try {
      await deleteInstrument(id);
      await refreshInstruments();
    } catch (err) { alert('Error: ' + err.message); }
  };

  return (
    <PageWrapper>
      <PageHeader title="Administración" subtitle="Gestión de marcas e instrumentos" />

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[{ key: 'brands', label: 'Marcas', icon: Building2 }, { key: 'instruments', label: 'Instrumentos', icon: Cpu }].map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              tab === key ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'bg-slate-900 text-slate-400 border border-slate-800 hover:border-slate-700'
            }`}>
            <Icon size={16} />{label}
          </button>
        ))}
      </div>

      {/* BRANDS TAB */}
      {tab === 'brands' && (
        <div>
          <div className="flex justify-between items-center mb-3">
            <p className="text-sm text-slate-400">{brands.length} marcas</p>
            <Button onClick={() => setShowBrandForm(!showBrandForm)}>
              <Plus size={16} />{showBrandForm ? 'Cancelar' : 'Nueva marca'}
            </Button>
          </div>

          {showBrandForm && (
            <Card className="p-4 mb-4">
              <form onSubmit={handleAddBrand} className="flex gap-2">
                <Input required placeholder="Nombre de la marca *" value={brandName} onChange={(e) => setBrandName(e.target.value)} />
                <Button type="submit" disabled={saving}>{saving ? '...' : 'Agregar'}</Button>
              </form>
            </Card>
          )}

          <div className="space-y-2">
            {brands.map((brand) => (
              <Card key={brand.id} className="p-3">
                {editBrandId === brand.id ? (
                  <div className="flex items-center gap-2">
                    <input autoFocus value={editBrandName} onChange={(e) => setEditBrandName(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleSaveEditBrand(brand.id); if (e.key === 'Escape') setEditBrandId(null); }}
                      className="flex-1 bg-slate-800 border border-orange-500 rounded-lg px-3 py-1.5 text-sm text-slate-100 focus:outline-none" />
                    <button onClick={() => handleSaveEditBrand(brand.id)} className="text-emerald-400 hover:text-emerald-300"><Check size={16} /></button>
                    <button onClick={() => setEditBrandId(null)} className="text-slate-500"><X size={16} /></button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <Building2 size={16} className="text-orange-400" />
                      <span className="text-sm font-medium text-slate-100">{brand.name}</span>
                      <span className="text-xs text-slate-500">
                        {instruments.filter((i) => i.brand_id === brand.id).length} instrumentos
                      </span>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setEditBrandId(brand.id); setEditBrandName(brand.name); }}
                        className="p-1.5 text-slate-500 hover:text-sky-400"><Edit2 size={14} /></button>
                      <button onClick={() => handleDeleteBrand(brand.id, brand.name)}
                        className="p-1.5 text-slate-500 hover:text-red-400"><Trash2 size={14} /></button>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* INSTRUMENTS TAB */}
      {tab === 'instruments' && (
        <div>
          <div className="flex justify-between items-center mb-3">
            <p className="text-sm text-slate-400">{instruments.length} instrumentos</p>
            <Button onClick={() => setShowInstForm(!showInstForm)}>
              <Plus size={16} />{showInstForm ? 'Cancelar' : 'Nuevo instrumento'}
            </Button>
          </div>

          {showInstForm && (
            <Card className="p-4 mb-4">
              <form onSubmit={handleAddInstrument} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Select label="Marca *" required value={instForm.brand_id} onChange={(e) => setInstForm({ ...instForm, brand_id: e.target.value })}>
                    <option value="">-- Seleccionar --</option>
                    {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </Select>
                  <Select label="Tipo" value={instForm.type} onChange={(e) => setInstForm({ ...instForm, type: e.target.value })}>
                    <option value="">-- Tipo --</option>
                    {Object.entries(INSTRUMENT_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Nombre *" required placeholder="Ej: OPTIFLUX 4300" value={instForm.name} onChange={(e) => setInstForm({ ...instForm, name: e.target.value })} />
                  <Input label="Modelo" placeholder="Ej: DN100" value={instForm.model} onChange={(e) => setInstForm({ ...instForm, model: e.target.value })} />
                </div>
                <Button type="submit" disabled={saving} className="w-full justify-center">{saving ? 'Guardando...' : 'Agregar instrumento'}</Button>
              </form>
            </Card>
          )}

          <div className="space-y-2">
            {instruments.map((inst) => {
              const brand = brands.find((b) => b.id === inst.brand_id);
              return (
                <Card key={inst.id} className="p-3">
                  {editInstId === inst.id ? (
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <input value={editInstForm.name || ''} onChange={(e) => setEditInstForm({ ...editInstForm, name: e.target.value })}
                          className="bg-slate-800 border border-orange-500 rounded-lg px-3 py-1.5 text-sm text-slate-100 focus:outline-none" placeholder="Nombre" />
                        <input value={editInstForm.model || ''} onChange={(e) => setEditInstForm({ ...editInstForm, model: e.target.value })}
                          className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-100 focus:outline-none" placeholder="Modelo" />
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleSaveEditInst(inst.id)} className="flex-1 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg text-sm flex items-center justify-center gap-1">
                          <Check size={14} />Guardar
                        </button>
                        <button onClick={() => setEditInstId(null)} className="flex-1 py-1.5 bg-slate-800 text-slate-400 rounded-lg text-sm flex items-center justify-center gap-1">
                          <X size={14} />Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <Cpu size={16} className="text-sky-400" />
                        <div>
                          <span className="text-sm font-medium text-slate-100">{inst.name}</span>
                          {inst.model && <span className="text-xs text-slate-500 ml-2">{inst.model}</span>}
                          <p className="text-xs text-slate-500">{brand?.name} {inst.type && `• ${INSTRUMENT_TYPES[inst.type] || inst.type}`}</p>
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setEditInstId(inst.id); setEditInstForm({ name: inst.name, model: inst.model || '' }); }}
                          className="p-1.5 text-slate-500 hover:text-sky-400"><Edit2 size={14} /></button>
                        <button onClick={() => handleDeleteInst(inst.id, inst.name)}
                          className="p-1.5 text-slate-500 hover:text-red-400"><Trash2 size={14} /></button>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </PageWrapper>
  );
}
