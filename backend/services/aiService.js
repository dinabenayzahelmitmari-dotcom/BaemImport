const TOPIC_CATALOG = [
  {
    id: "importacion",
    title: "Proceso de importacion",
    keywords: ["importacion", "importar", "alemania", "entrega", "plazo", "transporte", "matriculacion"],
    answer:
      "El flujo habitual incluye seleccion del vehiculo, verificacion documental y tecnica, transporte, homologacion y matriculacion final. En condiciones normales, el plazo total suele estar entre 7 y 15 dias.",
  },
  {
    id: "costes",
    title: "Costes de operacion",
    keywords: ["coste", "costes", "precio final", "gastos", "transporte", "gestoria", "margen"],
    answer:
      "En el coste final influyen principalmente precio de compra, transporte internacional, gestoria/homologacion e impuestos. Para una estimacion real conviene calcular caso por caso con emisiones, tipo de vehiculo y destino.",
  },
  {
    id: "impuestos",
    title: "Fiscalidad y matriculacion",
    keywords: ["impuesto", "impuestos", "co2", "matriculacion", "iva", "itp", "hacienda"],
    answer:
      "El impuesto de matriculacion depende de emisiones CO2 por tramos. Ademas, segun origen y tipo de compra pueden aplicar IVA/ITP y tasas administrativas. Conviene validar siempre con la normativa vigente del momento.",
  },
  {
    id: "garantia",
    title: "Garantia",
    keywords: ["garantia", "averia", "cobertura", "reparacion", "postventa"],
    answer:
      "Los vehiculos se entregan con garantia conforme a normativa aplicable y condiciones pactadas. La cobertura exacta depende del contrato, kilometraje y origen de la garantia (comercial o legal).",
  },
  {
    id: "financiacion",
    title: "Financiacion",
    keywords: ["financiacion", "cuota", "interes", "tin", "tae", "prestamo", "entrada"],
    answer:
      "Se puede plantear financiacion con distintos plazos y entrada inicial. La cuota depende de precio, entrada, plazo y tipo aplicado. Para precision, hay que simular con importes concretos.",
  },
];

function normalize(text) {
  return String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function rankTopics(query) {
  const q = normalize(query);
  const tokens = new Set(q.split(" ").filter(Boolean));

  const ranked = TOPIC_CATALOG.map((topic) => {
    const matches = topic.keywords.reduce((acc, keyword) => {
      const k = normalize(keyword);
      if (tokens.has(k) || q.includes(k)) return acc + 1;
      return acc;
    }, 0);

    const score = matches / Math.max(topic.keywords.length, 1);
    return { topic, score, matches };
  })
    .filter((item) => item.matches > 0)
    .sort((a, b) => b.score - a.score);

  return ranked;
}

async function askOpenAIIfConfigured(query) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const baseUrl = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const systemPrompt =
    "Eres un asistente de operaciones de compraventa/importacion de vehiculos. " +
    "Responde en espanol, de forma breve, precisa y accionable para equipo comercial.";

  const response = await globalThis.fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: String(query || "") },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error (${response.status})`);
  }

  const data = await response.json();
  return data?.choices?.[0]?.message?.content?.trim() || null;
}

function buildLocalAnswer(query) {
  const ranked = rankTopics(query);
  if (!ranked.length) {
    return (
      "No tengo suficiente contexto para responder con precision. " +
      "Indica si la consulta es sobre importacion, costes, impuestos, garantia o financiacion."
    );
  }

  const top = ranked[0];
  const secondary = ranked.slice(1, 3).map((r) => r.topic.title);
  let answer = top.topic.answer;
  if (secondary.length) {
    answer += ` Tambien puede relacionarse con: ${secondary.join(", ")}.`;
  }
  return answer;
}

const processAiQuery = async (query) => {
  const cleanQuery = String(query || "").trim();
  if (!cleanQuery) return "Escribe una consulta para poder ayudarte.";

  try {
    const liveAnswer = await askOpenAIIfConfigured(cleanQuery);
    if (liveAnswer) return liveAnswer;
  } catch (_err) {
    // Si el proveedor externo falla, continua con el fallback local.
  }

  await new Promise((resolve) => setTimeout(resolve, 250));
  return buildLocalAnswer(cleanQuery);
};

module.exports = { processAiQuery };
