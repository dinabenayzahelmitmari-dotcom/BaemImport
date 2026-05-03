/**
 * Servicio de IA para el asistente de BAEMIMPORT
 */

const KNOWLEDGE_BASE = {
  "importacion": "El proceso de importación desde Alemania suele tardar entre 7 y 15 días. Incluye la búsqueda del vehículo, revisión mecánica, transporte y matriculación en España.",
  "costes": "Los costes principales son: Precio del vehículo, Transporte (aprox. 800-1200€), Impuesto de Matriculación (basado en emisiones CO2) y Gastos de Gestoría.",
  "impuestos": "El impuesto de matriculación varía según las emisiones: 0% si <120g/km, 4.75% hasta 160g/km, 9.75% hasta 200g/km y 14.75% si >200g/km.",
  "garantia": "Todos nuestros vehículos importados cuentan con garantía europea mínima de 12 meses.",
  "financiacion": "Ofrecemos financiación a medida con tipos de interés competitivos desde el 5.99% TIN.",
};

const processAiQuery = async (query) => {
  // Simular latencia de red
  await new Promise(resolve => setTimeout(resolve, 800));

  const lowerQuery = query.toLowerCase();
  
  if (lowerQuery.includes('hola') || lowerQuery.includes('buenos dias')) {
    return "¡Hola! Soy el asistente inteligente de BAEMIMPORT. ¿En qué puedo ayudarte hoy con la gestión de tus vehículos o clientes?";
  }

  for (const [key, value] of Object.entries(KNOWLEDGE_BASE)) {
    if (lowerQuery.includes(key)) {
      return value;
    }
  }

  return "Entiendo tu consulta sobre '" + query + "'. Como asistente de BAEMIMPORT, puedo ayudarte con dudas sobre importación, costes, impuestos o financiación. ¿Podrías ser más específico?";
};

module.exports = { processAiQuery };
