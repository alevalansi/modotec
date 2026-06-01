import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
  getTechnicians, getBrands, getInstruments, getKnowledgeBase, getQueriesLog,
  getCurrentTechnician, setCurrentTechnician as storageSetTech,
} from '../utils/storage';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [technicians, setTechnicians] = useState([]);
  const [brands, setBrands] = useState([]);
  const [instruments, setInstruments] = useState([]);
  const [knowledgeBase, setKnowledgeBase] = useState([]);
  const [queriesLog, setQueriesLog] = useState([]);
  const [currentTechnician, setCurrentTechnicianState] = useState(() => getCurrentTechnician());
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState(null);

  const loadAll = useCallback(async () => {
    try {
      const [t, b, i, kb, ql] = await Promise.all([
        getTechnicians(), getBrands(), getInstruments(), getKnowledgeBase(), getQueriesLog(),
      ]);
      setTechnicians(t);
      setBrands(b);
      setInstruments(i);
      setKnowledgeBase(kb);
      setQueriesLog(ql);
      setDbError(null);
    } catch (err) {
      setDbError(err?.message || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const refreshTechnicians = useCallback(async () => {
    try { setTechnicians(await getTechnicians()); } catch (e) { console.error(e); }
  }, []);
  const refreshBrands = useCallback(async () => {
    try { setBrands(await getBrands()); } catch (e) { console.error(e); }
  }, []);
  const refreshInstruments = useCallback(async () => {
    try { setInstruments(await getInstruments()); } catch (e) { console.error(e); }
  }, []);
  const refreshKnowledgeBase = useCallback(async () => {
    try { setKnowledgeBase(await getKnowledgeBase()); } catch (e) { console.error(e); }
  }, []);
  const refreshQueriesLog = useCallback(async () => {
    try { setQueriesLog(await getQueriesLog()); } catch (e) { console.error(e); }
  }, []);

  const setCurrentTechnician = useCallback((tech) => {
    storageSetTech(tech);
    setCurrentTechnicianState(tech);
  }, []);

  return (
    <AppContext.Provider value={{
      technicians, brands, instruments, knowledgeBase, queriesLog,
      currentTechnician, loading, dbError,
      refreshTechnicians, refreshBrands, refreshInstruments,
      refreshKnowledgeBase, refreshQueriesLog,
      setCurrentTechnician, loadAll,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() { return useContext(AppContext); }
