const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export async function askGemini({ question, documentContent, knowledgeBaseEntries }) {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;

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

  const userMessage = context
    ? `Usá el siguiente contexto para responder la pregunta del técnico.
Si la respuesta está en el manual, citá la sección relevante.
Si la respuesta está en las soluciones conocidas del equipo, mencionalo.
Si no encontrás la respuesta en el contexto, decilo claramente.
Respondé en el mismo idioma que la pregunta.

${context}

PREGUNTA DEL TÉCNICO: ${question}

Respondé de forma clara, práctica y paso a paso si corresponde.`
    : question;

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'Eres un experto en instrumentación industrial. Ayudás a técnicos a diagnosticar y resolver problemas con instrumentos de medición.',
        },
        {
          role: 'user',
          content: userMessage,
        },
      ],
      temperature: 0.3,
      max_tokens: 1024,
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || 'Error al consultar Groq');
  }

  const data = await response.json();
  return data.choices[0].message.content;
}
