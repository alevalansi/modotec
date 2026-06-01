import { supabase } from '../lib/supabase';

// TECHNICIANS
export async function getTechnicians() {
  const { data, error } = await supabase.from('technicians').select('*').order('name');
  if (error) throw error;
  return data || [];
}
export async function addTechnician(t) {
  const { data, error } = await supabase.from('technicians').insert(t).select().single();
  if (error) throw error;
  return data;
}
export async function updateTechnician(id, updates) {
  const { data, error } = await supabase.from('technicians').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data;
}
export async function deleteTechnician(id) {
  const { error } = await supabase.from('technicians').delete().eq('id', id);
  if (error) throw error;
}

// BRANDS
export async function getBrands() {
  const { data, error } = await supabase.from('brands').select('*').order('name');
  if (error) throw error;
  return data || [];
}
export async function addBrand(b) {
  const { data, error } = await supabase.from('brands').insert(b).select().single();
  if (error) throw error;
  return data;
}
export async function updateBrand(id, updates) {
  const { data, error } = await supabase.from('brands').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data;
}
export async function deleteBrand(id) {
  const { error } = await supabase.from('brands').delete().eq('id', id);
  if (error) throw error;
}

// INSTRUMENTS
export async function getInstruments() {
  const { data, error } = await supabase.from('instruments').select('*, brands(name)').order('name');
  if (error) throw error;
  return data || [];
}
export async function addInstrument(inst) {
  const { data, error } = await supabase.from('instruments').insert(inst).select().single();
  if (error) throw error;
  return data;
}
export async function updateInstrument(id, updates) {
  const { data, error } = await supabase.from('instruments').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data;
}
export async function deleteInstrument(id) {
  const { error } = await supabase.from('instruments').delete().eq('id', id);
  if (error) throw error;
}

// DOCUMENTS
export async function getDocuments(instrumentId) {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('instrument_id', instrumentId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}
export async function addDocument(doc) {
  const { data, error } = await supabase.from('documents').insert(doc).select().single();
  if (error) throw error;
  return data;
}
export async function deleteDocument(id) {
  const { error } = await supabase.from('documents').delete().eq('id', id);
  if (error) throw error;
}

// QUERIES LOG
export async function getQueriesLog() {
  const { data, error } = await supabase
    .from('queries_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(500);
  if (error) throw error;
  return data || [];
}
export async function addQueryLog(entry) {
  const { error } = await supabase.from('queries_log').insert(entry);
  if (error) console.error('Query log error:', error);
}

// KNOWLEDGE BASE
export async function getKnowledgeBase() {
  const { data, error } = await supabase
    .from('knowledge_base')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}
export async function addKnowledgeEntry(entry) {
  const { data, error } = await supabase.from('knowledge_base').insert(entry).select().single();
  if (error) throw error;
  return data;
}
export async function updateKnowledgeEntry(id, updates) {
  const { data, error } = await supabase.from('knowledge_base').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data;
}
export async function deleteKnowledgeEntry(id) {
  const { error } = await supabase.from('knowledge_base').delete().eq('id', id);
  if (error) throw error;
}

// LOCAL STORAGE
export function getCurrentTechnician() {
  try { return JSON.parse(localStorage.getItem('modotec_technician')); } catch { return null; }
}
export function setCurrentTechnician(tech) {
  localStorage.setItem('modotec_technician', JSON.stringify(tech));
}
