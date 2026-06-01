import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, Cpu, Database, ChevronRight, Search, Plus } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PageWrapper, Card } from '../components/Layout';

export default function Dashboard() {
  const navigate = useNavigate();
  const { currentTechnician, brands, instruments, knowledgeBase } = useApp();
  const [search, setSearch] = useState('');

  const filteredBrands = brands.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase())
  );

  const stats = [
    { label: 'Marcas', value: brands.length, icon: Building2, color: 'text-orange-400', bg: 'bg-orange-400/10' },
    { label: 'Instrumentos', value: instruments.length, icon: Cpu, color: 'text-sky-400', bg: 'bg-sky-400/10' },
    { label: 'Base de conocimiento', value: knowledgeBase.length, icon: Database, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  ];

  return (
    <PageWrapper>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
        <h1 className="text-2xl font-bold text-slate-100">
          Hola, {currentTechnician?.name || 'Técnico'} 👋
        </h1>
        <p className="text-slate-400 text-sm mt-1">¿Con qué instrumento necesitás ayuda?</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <Card className="p-4">
              <div className={`w-9 h-9 ${s.bg} rounded-lg flex items-center justify-center mb-2`}>
                <s.icon size={18} className={s.color} />
              </div>
              <p className="text-2xl font-bold text-slate-100">{s.value}</p>
              <p className="text-xs text-slate-400">{s.label}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar marca..."
          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 pr-9 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-orange-500"
        />
      </div>

      {/* Brands */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold text-slate-200">Marcas</h2>
        <button onClick={() => navigate('/admin')} className="flex items-center gap-1 text-orange-400 hover:text-orange-300 text-sm">
          <Plus size={16} />Agregar
        </button>
      </div>

      {filteredBrands.length === 0 ? (
        <Card className="p-12 text-center">
          <Building2 size={40} className="mx-auto text-slate-600 mb-3" />
          <p className="text-slate-500 text-sm mb-4">
            {search ? 'No se encontraron marcas' : 'No hay marcas. Agregá la primera en Administración.'}
          </p>
          {!search && (
            <button onClick={() => navigate('/admin')} className="text-orange-400 text-sm hover:underline">
              Ir a Administración
            </button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredBrands.map((brand, i) => {
            const count = instruments.filter((inst) => inst.brand_id === brand.id).length;
            return (
              <motion.div key={brand.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Link to={`/brand/${brand.id}`}>
                  <Card className="p-4 hover:border-orange-500/30 hover:bg-slate-800/50 transition-colors cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center">
                          <Building2 size={20} className="text-orange-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-100">{brand.name}</p>
                          <p className="text-xs text-slate-400">{count} instrumento{count !== 1 ? 's' : ''}</p>
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-slate-600" />
                    </div>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </PageWrapper>
  );
}
