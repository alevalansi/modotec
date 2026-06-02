import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Send, Loader2, FileText, Plus, Trash2, BookOpen, AlertTriangle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getDocuments, addDocument, deleteDocument, addQueryLog, addKnowledgeEntry } from '../utils/storage';
import { askGemini } from '../lib/gemini';
import { extractTextFromPDF, findRelevantChunks, INSTRUMENT_TYPES } from '../utils/helpers';
import { PageWrapper, PageHeader, Card, Button, Textarea } from '../components/Layout';

export default function InstrumentView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { brands, instruments, knowledgeBase, currentTechnician, refreshKnowledgeBase, refreshQueriesLog } = useApp();

  const instrument = instruments.find((i) => i.id === id);
  const brand = instrument ? brands.find((b) => b.id === instrument.brand_id) : null;

  const [documents, setDocuments] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [uploadingDoc, setUploadingDoc] = useState(false);

  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState('');
  const [asking, setAsking] = useState(false);

  const [showKnowledgeForm, setShowKnowledgeForm] = useState(false);
  const [knowledgeProblem, setKnowledgeProblem] = useState('');
  const [knowledgeSolution, setKnowledgeSolution] = useState('');
  const [savingKnowledge, setSavingKnowledge] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const instrumentKB = knowledgeBase.filter((e) => e.instrument_id === id);

  useEffect(() => {
    if (id) loadDocs();
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadDocs = async () => {
    setLoadingDocs(true);
    try { setDocuments(await getDocuments(id)); }
    catch (e) { console.error(e); }
    finally { setLoadingDocs(false); }
  };

  const handleUploadDoc = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingDoc(true);
    try {
      let content = '';
      if (file.type === 'application/pdf') {
        content = await extractTextFromPDF(file);
      } else {
        content = await file.text();
      }
      await addDocument({
        instrument_id: id,
        title: file.name,
        content: content.slice(0, 100000),
        file_type: file.type,
      });
      await loadDocs();
    } catch (err) {
      alert('Error al procesar el documento: ' + err.message);
    } finally {
      setUploadingDoc(false);
      e.target.value = '';
    }
  };

  const handleDeleteDoc = async (docId, title) => {
    if (!confirm(`¿Eliminar "${title}"?`)) return;
    try {
      await deleteDocument(docId);
      await loadDocs();
    } catch (err) { alert('Error: ' + err.message); }
  };

  const handleAsk = async (e) => {
    e.preventDefault();
    if (!question.trim() || asking) return;

    const q = question.trim();
    setQuestion('');
    setMessages((prev) => [...prev, { role: 'user', text: q }]);
    setAsking(true);

    try {
      const fullContent = documents.map((d) => d.content || '').join('\n\n');
      const allDocContent = fullContent ? findRelevantChunks(fullContent, q) : null;
      const answer = await askGemini({
        question: q,
        documentContent: allDocContent || null,
        knowledgeBaseEntries: instrumentKB,
      });

      setMessages((prev) => [...prev, { role: 'assistant', text: answer }]);

      await addQueryLog({
        technician_name: currentTechnician?.name,
        instrument_id: id,
        instrument_name: instrument?.name,
        brand_name: brand?.name,
        question: q,
        answer,
        source: fullContent ? 'manual' : 'general',
      });
      await refreshQueriesLog();
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'error', text: 'Error al consultar la IA: ' + err.message }]);
    } finally {
      setAsking(false);
    }
  };

  const handleSaveKnowledge = async () => {
    if (!knowledgeProblem.trim() || !knowledgeSolution.trim()) return;
    setSavingKnowledge(true);
    try {
      await addKnowledgeEntry({
        instrument_id: id,
        instrument_name: instrument?.name,
        brand_name: brand?.name,
        problem: knowledgeProblem.trim(),
        solution: knowledgeSolution.trim(),
        technician_name: currentTechnician?.name,
      });
      await refreshKnowledgeBase();
      setKnowledgeProblem('');
      setKnowledgeSolution('');
      setShowKnowledgeForm(false);
    } catch (err) { alert('Error: ' + err.message); }
    finally { setSavingKnowledge(false); }
  };

  if (!instrument) return (
    <PageWrapper>
      <div className="text-center py-20 text-slate-500">
        <p>Instrumento no encontrado</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-orange-400 text-sm">Volver</button>
      </div>
    </PageWrapper>
  );

  return (
    <PageWrapper>
      <PageHeader
        title={instrument.name}
        subtitle={`${brand?.name || ''}${instrument.model ? ' • ' + instrument.model : ''}`}
        back={`/brand/${instrument.brand_id}`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: docs + knowledge */}
        <div className="space-y-4">
          {/* Documents */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-slate-200">Manuales</p>
              <button onClick={() => fileInputRef.current?.click()}
                disabled={uploadingDoc}
                className="flex items-center gap-1 text-xs text-orange-400 hover:text-orange-300 disabled:opacity-50">
                {uploadingDoc ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
                {uploadingDoc ? 'Procesando...' : 'Subir'}
              </button>
              <input ref={fileInputRef} type="file" accept=".pdf,.txt" className="hidden" onChange={handleUploadDoc} />
            </div>
            {loadingDocs ? (
              <div className="flex justify-center py-4"><Loader2 size={20} className="animate-spin text-slate-600" /></div>
            ) : documents.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-3">Sin manuales. Subí un PDF.</p>
            ) : (
              <div className="space-y-2">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-center gap-2 p-2 bg-slate-800 rounded-lg group">
                    <FileText size={14} className="text-orange-400 flex-shrink-0" />
                    <p className="text-xs text-slate-300 flex-1 truncate">{doc.title}</p>
                    <button onClick={() => handleDeleteDoc(doc.id, doc.title)}
                      className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-opacity">
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Knowledge base for this instrument */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
                <BookOpen size={14} className="text-emerald-400" />
                Soluciones conocidas ({instrumentKB.length})
              </p>
              <button onClick={() => setShowKnowledgeForm(!showKnowledgeForm)}
                className="text-xs text-emerald-400 hover:text-emerald-300">
                <Plus size={13} />
              </button>
            </div>

            {showKnowledgeForm && (
              <div className="mb-3 space-y-2">
                <textarea value={knowledgeProblem} onChange={(e) => setKnowledgeProblem(e.target.value)}
                  placeholder="Descripción del problema..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none" rows={2} />
                <textarea value={knowledgeSolution} onChange={(e) => setKnowledgeSolution(e.target.value)}
                  placeholder="Solución aplicada..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none" rows={2} />
                <button onClick={handleSaveKnowledge} disabled={savingKnowledge}
                  className="w-full py-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg text-xs font-medium hover:bg-emerald-500/30 disabled:opacity-50">
                  {savingKnowledge ? 'Guardando...' : 'Guardar solución'}
                </button>
              </div>
            )}

            {instrumentKB.length === 0 && !showKnowledgeForm ? (
              <p className="text-xs text-slate-500 text-center py-2">Sin soluciones documentadas aún.</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {instrumentKB.map((entry) => (
                  <div key={entry.id} className="p-2 bg-slate-800 rounded-lg">
                    <p className="text-xs text-amber-400 font-medium">{entry.problem}</p>
                    <p className="text-xs text-slate-300 mt-1">{entry.solution}</p>
                    <p className="text-[10px] text-slate-500 mt-1">{entry.technician_name}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right: Chat */}
        <div className="lg:col-span-2">
          <Card className="flex flex-col h-[500px]">
            <div className="p-4 border-b border-slate-800">
              <p className="text-sm font-semibold text-slate-200">Consultá a la IA</p>
              <p className="text-xs text-slate-400 mt-0.5">
                {documents.length > 0
                  ? `Analiza ${documents.length} manual${documents.length > 1 ? 'es' : ''} + base de conocimiento`
                  : 'Sin manuales — respondiendo desde conocimiento general'}
              </p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center mb-3">
                    <Send size={20} className="text-orange-400" />
                  </div>
                  <p className="text-slate-400 text-sm">Describí el problema que tenés</p>
                  <p className="text-slate-500 text-xs mt-1">con el {instrument.name}</p>
                </div>
              )}
              {messages.map((msg, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                    msg.role === 'user' ? 'bg-orange-500 text-white' :
                    msg.role === 'error' ? 'bg-red-500/20 text-red-400 flex items-start gap-2' :
                    'bg-slate-800 text-slate-100'
                  }`}>
                    {msg.role === 'error' && <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" />}
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  </div>
                </motion.div>
              ))}
              {asking && (
                <div className="flex justify-start">
                  <div className="bg-slate-800 rounded-2xl px-4 py-3 flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin text-orange-400" />
                    <span className="text-sm text-slate-400">Analizando...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleAsk} className="p-4 border-t border-slate-800 flex gap-2">
              <input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="¿Qué problema tenés?"
                disabled={asking}
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-orange-500 disabled:opacity-50"
              />
              <button type="submit" disabled={asking || !question.trim()}
                className="w-10 h-10 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors">
                <Send size={16} className="text-white" />
              </button>
            </form>
          </Card>
        </div>
      </div>
    </PageWrapper>
  );
}
