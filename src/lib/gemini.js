import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export async function askGemini({ question, documentContent, knowledgeBaseEntries }) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  let context = '';

  if (documentContent) {
    context += `=== MANUAL DEL INSTRUMENTO ===\n${documentContent}\n\n`;
  }

  if (knowledgeBaseEntries && knowledgeBaseEntries.length > 0) {
    context += `=== SOLUCIONES CONOCIDAS DEL EQUIPO ===\n`;
    knowledgeBaseEntries.forEach((e, i) => {
      context += `${i + 1}. Problema: ${e.problem}\n   Solución: ${e.solution}\n   Técnico: ${e.technician_name}\n\n`;
    });
  }

  const prompt = context
    ? `Eres un experto en instrumentación industrial. Usá el siguiente contexto para responder la pregunta del técnico.
Si la respuesta está en el manual, citá la sección relevante.
Si la respuesta está en las soluciones conocidas del equipo, mencionalo.
Si no encontrás la respuesta en el contexto, decilo claramente.
Respondé en el mismo idioma que la pregunta.

${context}

PREGUNTA DEL TÉCNICO: ${question}

Respondé de forma clara, práctica y paso a paso si corresponde.`
    : `Eres un experto en instrumentación industrial. Respondé esta pregunta de forma clara y práctica: ${question}`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}
