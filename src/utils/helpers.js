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
