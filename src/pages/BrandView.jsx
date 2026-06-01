import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Cpu, ChevronRight, Plus } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { INSTRUMENT_TYPES } from '../utils/helpers';
import { PageWrapper, PageHeader, Card, Button } from '../components/Layout';

export default function BrandView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { brands, instruments } = useApp();

  const brand = brands.find((b) => b.id === id);
  const brandInstruments = instruments.filter((i) => i.brand_id === id);

  if (!brand) return (
    <PageWrapper>
      <div className="text-center py-20 text-slate-500">
        <p>Marca no encontrada</p>
        <button onClick={() => navigate('/dashboard')} className="mt-4 text-orange-400 text-sm">Volver</button>
      </div>
    </PageWrapper>
  );

  return (
    <PageWrapper>
      <PageHeader
        title={brand.name}
        subtitle={`${brandInstruments.length} instrumento${brandInstruments.length !== 1 ? 's' : ''}`}
        back="/dashboard"
        actions={
          <Button onClick={() => navigate(`/admin?brandId=${id}`)}>
            <Plus size={16} />Agregar instrumento
          </Button>
        }
      />

      {brandInstruments.length === 0 ? (
        <Card className="p-12 text-center">
          <Cpu size={40} className="mx-auto text-slate-600 mb-3" />
          <p className="text-slate-500 text-sm mb-4">No hay instrumentos para esta marca</p>
          <Button onClick={() => navigate(`/admin?brandId=${id}`)}>
            <Plus size={16} />Agregar primero
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {brandInstruments.map((inst, i) => (
            <motion.div key={inst.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <button onClick={() => navigate(`/instrument/${inst.id}`)} className="w-full text-left">
                <Card className="p-4 hover:border-orange-500/30 hover:bg-slate-800/50 transition-colors cursor-pointer">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 bg-sky-500/20 rounded-xl flex items-center justify-center">
                      <Cpu size={20} className="text-sky-400" />
                    </div>
                    <ChevronRight size={16} className="text-slate-600 mt-1" />
                  </div>
                  <p className="font-semibold text-slate-100 text-sm">{inst.name}</p>
                  {inst.model && <p className="text-xs text-slate-400 mt-0.5">Modelo: {inst.model}</p>}
                  {inst.type && (
                    <span className="inline-block mt-2 text-xs px-2 py-0.5 bg-orange-500/10 text-orange-400 rounded-full border border-orange-500/20">
                      {INSTRUMENT_TYPES[inst.type] || inst.type}
                    </span>
                  )}
                </Card>
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </PageWrapper>
  );
}
