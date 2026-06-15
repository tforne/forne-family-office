import type { PortalAction, PortalIntentMetadata, PortalIntentType, PortalIntentUrgency } from "@/lib/portal/chat-assistant";

export type PortalIntent = PortalIntentType;

export interface IntentDetectionResult {
  intent: PortalIntent;
  confidence: number;
  urgency?: PortalIntentUrgency;
  matchedSignals?: string[];
}

type ScoredSignal = {
  signal: string;
  weight: number;
};

type IntentRule = {
  intent: PortalIntent;
  baseConfidence: number;
  urgency?: PortalIntentUrgency;
  signals: ScoredSignal[];
  requiresAll?: string[];
};

type ScoredIntentResult = {
  intent: PortalIntent;
  confidence: number;
  urgency: PortalIntentUrgency | undefined;
  matchedSignals: string[];
};

const urgentSignals: Array<{ pattern: RegExp; label: string; urgency: PortalIntentUrgency; weight: number }> = [
  { pattern: /\b(humo|incendio)\b/, label: "humo", urgency: "critical", weight: 1.2 },
  { pattern: /\b(gas|olor a gas)\b/, label: "gas", urgency: "critical", weight: 1.2 },
  { pattern: /\b(electricidad|cortocircuito|chispa|electrico|eléctrico)\b/, label: "electricidad", urgency: "critical", weight: 1.15 },
  { pattern: /\b(fuga de agua|filtrando agua|filtracion de agua|filtración de agua|inundacion|inundación)\b/, label: "fuga agua", urgency: "high", weight: 1.05 },
  { pattern: /\b(vecino afectado|vecino de abajo|afecta al vecino)\b/, label: "vecino afectado", urgency: "high", weight: 1.05 },
  { pattern: /\b(urgente|urgencia|inmediato|ya mismo)\b/, label: "urgente", urgency: "high", weight: 0.95 },
  { pattern: /\b(humedad|moho|filtracion|filtración|gotea|goteo|mal olor)\b/, label: "humedad", urgency: "medium", weight: 0.7 },
  { pattern: /\b(factura|recibo|contrato|documento|soporte)\b/, label: "consulta no operativa", urgency: "low", weight: 0.2 }
];

const intentRules: IntentRule[] = [
  {
    intent: "urgent_incident",
    baseConfidence: 0.78,
    urgency: "high",
    signals: [
      { signal: "fuga agua", weight: 1.1 },
      { signal: "filtrando agua", weight: 1.1 },
      { signal: "vecino de abajo", weight: 1.05 },
      { signal: "vecino afectado", weight: 1.05 },
      { signal: "electricidad", weight: 1.15 },
      { signal: "cortocircuito", weight: 1.15 },
      { signal: "humo", weight: 1.2 },
      { signal: "gas", weight: 1.2 },
      { signal: "incendio", weight: 1.2 },
      { signal: "urgente", weight: 0.95 }
    ]
  },
  {
    intent: "maintenance_incident",
    baseConfidence: 0.72,
    urgency: "medium",
    signals: [
      { signal: "humedad", weight: 0.95 },
      { signal: "filtracion", weight: 0.92 },
      { signal: "filtración", weight: 0.92 },
      { signal: "averia", weight: 0.88 },
      { signal: "avería", weight: 0.88 },
      { signal: "mantenimiento", weight: 0.86 },
      { signal: "mal olor", weight: 0.82 },
      { signal: "gotea", weight: 0.9 },
      { signal: "agua", weight: 0.78 },
      { signal: "baño", weight: 0.72 },
      { signal: "bano", weight: 0.72 }
    ]
  },
  {
    intent: "invoice_question",
    baseConfidence: 0.82,
    urgency: "low",
    signals: [
      { signal: "factura", weight: 1.05 },
      { signal: "facturas", weight: 1.05 },
      { signal: "recibo", weight: 1.0 },
      { signal: "cobro", weight: 0.95 },
      { signal: "pago", weight: 0.92 },
      { signal: "importe", weight: 0.86 },
      { signal: "vencimiento", weight: 0.86 }
    ]
  },
  {
    intent: "contract_question",
    baseConfidence: 0.8,
    urgency: "low",
    signals: [
      { signal: "contrato", weight: 1.05 },
      { signal: "clausula", weight: 0.92 },
      { signal: "cláusula", weight: 0.92 },
      { signal: "alquiler", weight: 0.82 },
      { signal: "renovacion", weight: 0.82 },
      { signal: "renovación", weight: 0.82 },
      { signal: "fianza", weight: 0.88 }
    ]
  },
  {
    intent: "document_request",
    baseConfidence: 0.84,
    urgency: "low",
    signals: [
      { signal: "copia", weight: 1.05 },
      { signal: "documento", weight: 1.0 },
      { signal: "archivo", weight: 0.9 },
      { signal: "pdf", weight: 0.86 },
      { signal: "adjunto", weight: 0.82 },
      { signal: "descargar", weight: 0.78 }
    ]
  },
  {
    intent: "service_recommendation",
    baseConfidence: 0.84,
    urgency: "low",
    signals: [
      { signal: "necesito internet", weight: 1.08 },
      { signal: "internet", weight: 1.02 },
      { signal: "wifi", weight: 1.02 },
      { signal: "fibra", weight: 1.02 },
      { signal: "necesito limpieza", weight: 1.08 },
      { signal: "limpieza", weight: 1.02 },
      { signal: "limpiar", weight: 1.02 },
      { signal: "electricista", weight: 1.02 },
      { signal: "fontanero", weight: 1.02 },
      { signal: "fontaneria", weight: 0.98 },
      { signal: "fontanería", weight: 0.98 },
      { signal: "seguro", weight: 0.96 },
      { signal: "mantenimiento", weight: 0.92 },
      { signal: "alguien para", weight: 0.94 },
      { signal: "busco", weight: 0.84 },
      { signal: "arreglar esto", weight: 0.94 }
    ]
  },
  {
    intent: "support_request",
    baseConfidence: 0.72,
    urgency: "medium",
    signals: [
      { signal: "soporte", weight: 1.0 },
      { signal: "ayuda", weight: 0.82 },
      { signal: "contactar", weight: 0.82 },
      { signal: "asistencia", weight: 0.82 },
      { signal: "no funciona", weight: 0.88 },
      { signal: "problema", weight: 0.72 },
      { signal: "acceso", weight: 0.75 }
    ]
  }
];

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

function dedupe(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

function detectUrgency(message: string) {
  const normalized = normalizeText(message);
  let currentUrgency: PortalIntentUrgency = "low";
  let strongestWeight = 0;
  const matches: string[] = [];

  const urgencyRank: Record<PortalIntentUrgency, number> = {
    low: 0,
    medium: 1,
    high: 2,
    critical: 3
  };

  for (const signal of urgentSignals) {
    if (!signal.pattern.test(normalized)) continue;
    matches.push(signal.label);
    if (
      urgencyRank[signal.urgency] > urgencyRank[currentUrgency] ||
      (signal.urgency === currentUrgency && signal.weight > strongestWeight)
    ) {
      currentUrgency = signal.urgency;
      strongestWeight = signal.weight;
    }
  }

  return {
    urgency: currentUrgency,
    matchedSignals: dedupe(matches)
  };
}

function scoreIntent(rule: IntentRule, normalizedMessage: string): ScoredIntentResult | null {
  const matchedSignals = rule.signals
    .filter((signal) => normalizedMessage.includes(signal.signal))
    .map((signal) => signal.signal);

  if (rule.requiresAll && !rule.requiresAll.every((required) => matchedSignals.includes(required))) {
    return null;
  }

  if (matchedSignals.length === 0) {
    return null;
  }

  const signalScore = rule.signals
    .filter((signal) => matchedSignals.includes(signal.signal))
    .reduce((total, signal) => total + signal.weight, 0);

  const confidence = Math.min(0.98, Number((rule.baseConfidence + Math.min(signalScore * 0.06, 0.22)).toFixed(2)));

  return {
    intent: rule.intent,
    confidence,
    urgency: rule.urgency,
    matchedSignals: dedupe(matchedSignals)
  };
}

export function detectPortalIntent(message: string): IntentDetectionResult {
  const normalizedMessage = normalizeText(message);

  if (!normalizedMessage) {
    return {
      intent: "general_chat",
      confidence: 0.55,
      urgency: "low",
      matchedSignals: []
    };
  }

  const urgencyResult = detectUrgency(normalizedMessage);

  // Favor explicit document requests like "copia del contrato" over pure contract questions.
  const forcedDocumentRequest =
    normalizedMessage.includes("copia") &&
    (normalizedMessage.includes("contrato") || normalizedMessage.includes("documento") || normalizedMessage.includes("archivo"));

  if (forcedDocumentRequest) {
    return {
      intent: "document_request",
      confidence: 0.94,
      urgency: "low",
      matchedSignals: dedupe(["copia", normalizedMessage.includes("contrato") ? "contrato" : "documento"])
    };
  }

  const scored = intentRules
    .map((rule) => scoreIntent(rule, normalizedMessage))
    .filter((result): result is ScoredIntentResult => Boolean(result))
    .sort((left, right) => right.confidence - left.confidence);

  const bestIntent = scored[0];
  if (!bestIntent) {
    return {
      intent: "general_chat",
      confidence: 0.58,
      urgency: urgencyResult.urgency,
      matchedSignals: urgencyResult.matchedSignals
    };
  }

  const incidentIntent =
    bestIntent.intent === "maintenance_incident" || bestIntent.intent === "urgent_incident";

  const intent =
    incidentIntent && (urgencyResult.urgency === "high" || urgencyResult.urgency === "critical")
      ? "urgent_incident"
      : bestIntent.intent;

  const urgency = incidentIntent
    ? urgencyResult.urgency === "low"
      ? bestIntent.urgency || "medium"
      : urgencyResult.urgency
    : bestIntent.urgency || urgencyResult.urgency;

  return {
    intent,
    confidence:
      intent !== bestIntent.intent
        ? Math.min(0.99, Number((bestIntent.confidence + 0.03).toFixed(2)))
        : bestIntent.confidence,
    urgency,
    matchedSignals: dedupe([...(bestIntent.matchedSignals || []), ...urgencyResult.matchedSignals])
  };
}

export function toPortalIntentMetadata(result: IntentDetectionResult): PortalIntentMetadata {
  return {
    type: result.intent,
    confidence: result.confidence,
    urgency: result.urgency,
    matchedSignals: result.matchedSignals
  };
}

export function buildPortalActions(intent: IntentDetectionResult, incidentDraft?: { title?: string } | null): PortalAction[] {
  const draftPayload = {
    intent: intent.intent,
    urgency: intent.urgency,
    confidence: intent.confidence,
    requiresConfirmation: true
  };

  switch (intent.intent) {
    case "maintenance_incident":
    case "urgent_incident":
      return [
        {
          type: "create_incident",
          label: "Crear incidencia",
          payload: {
            ...draftPayload,
            draftTitle: incidentDraft?.title || null
          }
        },
        {
          type: "attach_photo",
          label: "Adjuntar foto",
          payload: {
            ...draftPayload,
            recommendedForIntent: true
          }
        }
      ];
    case "invoice_question":
      return [
        {
          type: "view_invoice",
          label: "Ver factura",
          payload: draftPayload
        }
      ];
    case "support_request":
      return [
        {
          type: "contact_support",
          label: "Contactar soporte",
          payload: draftPayload
        }
      ];
    case "document_request":
      return [
        {
          type: "view_documents",
          label: "Ver documentos",
          payload: draftPayload
        }
      ];
    case "service_recommendation":
      return [
        {
          type: "recommend_service",
          label: "Ver servicios recomendados",
          payload: draftPayload
        }
      ];
    case "contract_question":
      return [
        {
          type: "view_contract",
          label: "Ver contrato",
          payload: draftPayload
        }
      ];
    default:
      return [];
  }
}
