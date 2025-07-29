
import { GoogleGenAI, Type } from "@google/genai";
import type { EvaluationResponse } from '../types';
import { REGULATION_DOLCE_PARAISO, REGULATION_EL_MARQUES, REGULATION_JUSTICIA_CIVICA } from '../constants/regulations';

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    classification: {
      type: Type.STRING,
      description: "Clasificación del hecho: 'Infracción', 'Falta Administrativa', o 'No Aplica'.",
    },
    severity: {
      type: Type.STRING,
      enum: ['Grave', 'Moderada', 'Leve', 'Sin Falta'],
      description: "Nivel de severidad del hecho.",
    },
    legal_reference: {
      type: Type.STRING,
      description: "Artículo(s) específico(s) y reglamento(s) aplicable(s). Si no aplica, indicar 'N/A'.",
    },
    suggested_sanction: {
      type: Type.STRING,
      description: "Sanción sugerida basada en los reglamentos. Si no aplica, indicar 'N/A'.",
    },
    convivencia_comment: {
      type: Type.STRING,
      description: "Comentario reflexivo sobre sana convivencia si no hay infracción formal pero sí un comportamiento poco armonioso. De lo contrario, dejar vacío.",
    },
    convivencia_warning: {
      type: Type.BOOLEAN,
      description: "True si se emitió un comentario de convivencia, de lo contrario false.",
    },
    legal_text: {
        type: Type.STRING,
        description: "El texto completo y textual del/los artículo(s) citados en 'legal_reference'. Si no aplica, indicar 'N/A'.",
    },
    interpretation: {
        type: Type.STRING,
        description: "Una interpretación de cómo los artículos citados aplican directamente a la situación narrada. Si no aplica, indicar 'N/A'.",
    }
  },
  required: ['classification', 'severity', 'legal_reference', 'suggested_sanction', 'convivencia_comment', 'convivencia_warning', 'legal_text', 'interpretation']
};

export const evaluateSituation = async (narrative: string, apiKey: string): Promise<EvaluationResponse> => {
  if (!apiKey) {
    throw new Error("Por favor, introduce tu clave de API de Google Gemini para continuar.");
  }

  const ai = new GoogleGenAI({ apiKey });
  const model = "gemini-2.5-flash";

  const fullContext = `
    --- REGLAMENTO DE CONDÓMINOS DE DOLCE PARAÍSO ---
    ${REGULATION_DOLCE_PARAISO}
    --- FIN REGLAMENTO DOLCE PARAÍSO ---

    --- REGLAMENTO DEL FRACCIONAMIENTO EL MARQUÉS (EXTRACTO) ---
    ${REGULATION_EL_MARQUES}
    --- FIN REGLAMENTO EL MARQUÉS ---

    --- REGLAMENTO DE JUSTICIA CÍVICA (EXTRACTO) ---
    ${REGULATION_JUSTICIA_CIVICA}
    --- FIN REGLAMENTO JUSTICIA CÍVICA ---
  `;

  const prompt = `
    Eres un asistente legal experto en derecho condominal y justicia cívica del municipio de El Marqués, Querétaro.
    Tu tarea es analizar la siguiente situación entre vecinos y evaluarla ÚNICAMENTE con base en los tres reglamentos proporcionados.

    SITUACIÓN A ANALIZAR:
    "${narrative}"

    INSTRUCCIONES:
    1.  Lee la situación y compárala con los artículos de los tres reglamentos.
    2.  Determina si la conducta constituye una 'Infracción' o 'Falta Administrativa' según los reglamentos. Si no se viola ningún artículo, clasifícalo como 'No Aplica'.
    3.  Evalúa la severidad: 'Grave', 'Moderada', 'Leve', o 'Sin Falta'.
    4.  Cita el/los artículo(s) y reglamento(s) exacto(s) que fundamentan tu evaluación. Si no aplica, indica 'N/A'.
    5.  Si es una falta, sugiere una sanción basada en los textos. Si no aplica, indica 'N/A'.
    6.  Cita textualmente el contenido completo de los artículos que mencionaste en el fundamento legal. Si no aplica ningún artículo, indica 'N/A'.
    7.  Proporciona una interpretación clara de cómo esos artículos se aplican a la situación narrada. Si no aplica, indica 'N/A'.
    8.  Si la conducta NO es una infracción formal pero afecta la sana convivencia, escribe un comentario reflexivo y neutral para las partes involucradas y activa la advertencia de convivencia.
    9.  Genera una respuesta en formato JSON estructurado según el esquema proporcionado. No incluyas explicaciones fuera del JSON.
  `;

  try {
    const response = await ai.models.generateContent({
        model: model,
        contents: prompt + fullContext,
        config: {
            responseMimeType: "application/json",
            responseSchema: responseSchema,
            temperature: 0.2
        },
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as EvaluationResponse;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("No se pudo obtener una respuesta de la IA. Verifica tu clave de API, el formato de la respuesta podría ser incorrecto o hubo un problema de conexión.");
  }
};
