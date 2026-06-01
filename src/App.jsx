import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Layout from './components/Layout';

import SelectTechnician from './pages/SelectTechnician';
import Dashboard from './pages/Dashboard';
import BrandView from './pages/BrandView';
import InstrumentView from './pages/InstrumentView';
import AdminPage from './pages/AdminPage';
import KnowledgeBase from './pages/KnowledgeBase';
import QueryLog from './pages/QueryLog';
import Technicians from './pages/Technicians';

function ProtectedRoute({ children }) {
  const { currentTechnician, loading, dbError } = useApp();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-400 text-sm">Cargando...</p>
        </div>
      </div>
    );
  }

  if (dbError) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-red-500/30 rounded-xl p-6 text-center">
          <p className="text-red-400 font-semibold mb-2">Error de conexión</p>
          <p className="text-slate-400 text-sm mb-4">{dbError}</p>
          <button onClick={() => window.location.reload()} className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!currentTechnician) return <Navigate to="/" replace />;
  return <Layout>{children}</Layout>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<SelectTechnician />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/brand/:id" element={<ProtectedRoute><BrandView /></ProtectedRoute>} />
      <Route path="/instrument/:id" element={<ProtectedRoute><InstrumentView /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
      <Route path="/knowledge" element={<ProtectedRoute><KnowledgeBase /></ProtectedRoute>} />
      <Route path="/logs" element={<ProtectedRoute><QueryLog /></ProtectedRoute>} />
      <Route path="/technicians" element={<ProtectedRoute><Technicians /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </BrowserRouter>
  );
}
