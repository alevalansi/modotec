export function formatDateTime(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleString('he-IL');
}

export function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString('he-IL');
}

export const INSTRUMENT_TYPES = {
  flow_meter: 'Caudalímetro',
  level: 'Nivel',
  pressure: 'Presión',
  temperature: 'Temperatura',
  ph: 'pH',
  conductivity: 'Conductividad',
  turbidity: 'Turbidez',
  radar: 'Radar',
  analyzer: 'Analizador',
  valve: 'Válvula',
  other: 'Otro',
};

export function findRelevantChunks(content, question, topN = 5, chunkSize = 600) {
  if (!content) return '';
  const chunks = [];
  for (let i = 0; i < content.length; i += chunkSize) {
    chunks.push(content.slice(i, i + chunkSize));
  }
  const words = question.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
  const scored = chunks.map((chunk) => {
    const lower = chunk.toLowerCase();
    const score = words.reduce((acc, w) => acc + (lower.includes(w) ? 1 : 0), 0);
    return { chunk, score };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topN).map((s) => s.chunk).join('\n...\n');
}

export async function extractTextFromPDF(file) {
  const pdfjsLib = await import('pdfjs-dist');
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let text = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((item) => item.str).join(' ') + '\n';
  }
  return text;
}
