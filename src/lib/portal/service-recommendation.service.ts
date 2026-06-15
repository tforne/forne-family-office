import type { PortalStakeholder } from "@/lib/portal/stakeholders.types";

export type ServiceRecommendationCategory =
  | "Cleaning"
  | "Internet"
  | "Electrician"
  | "Plumbing"
  | "Insurance"
  | "Maintenance";

export interface ServiceRecommendationMatch {
  requestedCategory?: ServiceRecommendationCategory;
  matchedStakeholders: PortalStakeholder[];
  matchedSignals: string[];
}

const categorySignals: Array<{
  category: ServiceRecommendationCategory;
  signals: string[];
}> = [
  {
    category: "Cleaning",
    signals: ["limpieza", "limpiar", "cleaning", "clean", "housekeeping"]
  },
  {
    category: "Internet",
    signals: ["internet", "wifi", "fibra", "router", "conexion", "conexión", "dig i", "digi"]
  },
  {
    category: "Electrician",
    signals: ["electricista", "electricidad", "electrico", "eléctrico", "enchufe", "luz", "cuadro electrico", "cuadro eléctrico"]
  },
  {
    category: "Plumbing",
    signals: ["fontanero", "fontaneria", "fontanería", "plumbing", "tuberia", "tubería", "grifo", "fuga", "agua"]
  },
  {
    category: "Insurance",
    signals: ["seguro", "seguros", "insurance", "siniestro", "cobertura", "aseguradora"]
  },
  {
    category: "Maintenance",
    signals: ["mantenimiento", "reparacion", "reparación", "arreglar", "tecnico", "técnico", "service", "servicio"]
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

function dedupe<T>(values: T[]) {
  return Array.from(new Set(values));
}

function categoryTokens(category: ServiceRecommendationCategory) {
  return categorySignals.find((entry) => entry.category === category)?.signals || [];
}

function stakeholderSearchText(stakeholder: PortalStakeholder) {
  return normalizeText(
    [
      stakeholder.category,
      stakeholder.serviceTitle,
      stakeholder.stakeholderName,
      stakeholder.portalDescription,
      stakeholder.aiDescription,
      stakeholder.aiKeywords,
      stakeholder.notes
    ]
      .filter(Boolean)
      .join(" ")
  );
}

function stakeholderScore(stakeholder: PortalStakeholder, requestedCategory: ServiceRecommendationCategory) {
  const text = stakeholderSearchText(stakeholder);
  let relevanceScore = 0;

  if (text.includes(normalizeText(requestedCategory))) {
    relevanceScore += 40;
  }

  for (const token of categoryTokens(requestedCategory)) {
    if (text.includes(normalizeText(token))) {
      relevanceScore += 12;
    }
  }

  if (relevanceScore === 0) {
    return 0;
  }

  let score = relevanceScore + (stakeholder.priorityScore || 0);

  if (stakeholder.defaultForCategory) {
    score += 8;
  }

  return score;
}

export function detectServiceRecommendationCategory(message: string) {
  const normalized = normalizeText(message);
  const matches = categorySignals
    .map((entry) => ({
      category: entry.category,
      matchedSignals: entry.signals.filter((signal) => normalized.includes(normalizeText(signal)))
    }))
    .filter((entry) => entry.matchedSignals.length > 0)
    .sort((left, right) => right.matchedSignals.length - left.matchedSignals.length);

  if (!matches.length) {
    return {
      category: undefined,
      matchedSignals: []
    };
  }

  return {
    category: matches[0].category,
    matchedSignals: dedupe(matches[0].matchedSignals)
  };
}

export function matchStakeholdersForRecommendation(
  message: string,
  stakeholders: PortalStakeholder[]
): ServiceRecommendationMatch {
  const { category, matchedSignals } = detectServiceRecommendationCategory(message);
  if (!category) {
    return {
      requestedCategory: undefined,
      matchedStakeholders: [],
      matchedSignals
    };
  }

  const matches = stakeholders
    .filter((stakeholder) => stakeholder.availableForAI)
    .map((stakeholder) => ({
      stakeholder,
      score: stakeholderScore(stakeholder, category)
    }))
    .filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score)
    .map((entry) => entry.stakeholder)
    .slice(0, 3);

  return {
    requestedCategory: category,
    matchedStakeholders: matches,
    matchedSignals
  };
}
