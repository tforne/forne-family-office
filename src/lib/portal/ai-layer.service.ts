import "server-only";

import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { bcPostCustomApiForCompany, type BusinessCentralCustomApiRef } from "@/lib/bc/client";
import { env } from "@/lib/config/env";
import type { PortalChatReply } from "@/lib/portal/chat-assistant";
import { getCachedAIResponse, setCachedAIResponse } from "@/lib/portal/ai-response-cache";
import { retryWithBackoff } from "@/lib/portal/ai-retry";
import { formatConversationMemory, type ConversationMemoryMessage } from "@/lib/portal/conversation-memory.service";
import type { PortalAIContext } from "@/lib/portal/portal-ai-context-builder";

const aiLayerApi: BusinessCentralCustomApiRef = {
  publisher: "onedata",
  group: "ai",
  version: "v1.0"
};

const aiChatPath = "aiChatRequests";
const defaultAgentCode = "OD-GOVERNANCE";
const defaultSource = "TenantPortal";
const requestTimeoutMs = 15000;
const promptFilePath = path.join(process.cwd(), "src", "prompts", "tenant-assistant.system.txt");
const bcQuestionSoftLimit = 1800;
const shortenedContextMarker = "[Context shortened to fit Business Central API field]";
const conciseResponseInstruction = "Keep the response concise. Maximum 120 words unless the user asks for detail.";

type SendAIChatRequestInput = {
  message: string;
  sessionId: string;
  portalContext: PortalAIContext;
  conversationMemory: ConversationMemoryMessage[];
};

type AIChatRequestPayload = {
  portalUserId: string;
  sessionId: string;
  agentCode: string;
  question: string;
  source: string;
};

type AIChatResponse = {
  entryNo?: number;
  status?: string;
  response?: string;
  errorMessage?: string;
  durationMs?: number;
};

type PromptTrimResult = {
  prompt: string;
  originalLength: number;
  finalLength: number;
  wasTrimmed: boolean;
  contextIncluded: boolean;
  memoryIncluded: boolean;
};

let cachedSystemPrompt: string | null = null;

function trimText(value: string, maxLength: number) {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, Math.max(0, maxLength - 3)).trimEnd()}...`;
}

function trimSectionPreservingMarker(value: string, maxLength: number) {
  const normalized = value.trim();
  if (!normalized || normalized.length <= maxLength) return normalized;

  const marker = ` ${shortenedContextMarker}`;
  const available = Math.max(0, maxLength - marker.length);
  if (available === 0) {
    return shortenedContextMarker.slice(0, maxLength);
  }

  return `${normalized.slice(0, available).trimEnd()}${marker}`;
}

function normalizeCacheInput(value: string) {
  return value.replace(/\s+/g, " ").trim().toLowerCase();
}

function buildPromptHash(value: string) {
  return createHash("sha256").update(normalizeCacheInput(value)).digest("hex");
}

async function loadSystemPrompt() {
  if (cachedSystemPrompt) return cachedSystemPrompt;
  cachedSystemPrompt = (await readFile(promptFilePath, "utf8")).trim();
  return cachedSystemPrompt;
}

function pageLinks(page: string) {
  return [
    { href: page, label: "Seccion actual" },
    page === "/portal" ? null : { href: "/portal", label: "Ir al resumen" }
  ].filter((link): link is { href: string; label: string } => Boolean(link));
}

function pageSuggestions(page: string) {
  if (page.startsWith("/portal/incidents/")) {
    return ["Ver estado", "Anadir comentario", "Escalar incidencia"];
  }

  if (page.startsWith("/portal/invoices")) {
    return ["Ver factura", "Contactar administracion", "Revisar contrato"];
  }

  if (page.startsWith("/portal/incidents")) {
    return ["Abrir incidencia", "Adjuntar foto", "Contactar soporte"];
  }

  if (page.startsWith("/portal/documents")) {
    return ["Ver documento", "Solicitar copia", "Contactar soporte"];
  }

  if (page.startsWith("/portal/profile")) {
    return ["Revisar datos", "Contactar soporte", "Volver al portal"];
  }

  return ["Resume mi situacion actual", "Tengo algo pendiente", "Que puedo hacer desde el portal"];
}

function pickSuggestions(page: string, message: string, context: PortalAIContext) {
  const normalizedMessage = message.toLowerCase();

  if (context.pageType === "incident" || context.pageType === "incidents") {
    return ["Ver estado", "Anadir comentario", "Escalar incidencia"];
  }

  if (context.pageType === "invoice") {
    return ["Ver factura", "Contactar administracion", "Revisar contrato"];
  }

  if (/\b(humedad|fuga|averia|incidencia|mantenimiento|olor|agua)\b/.test(normalizedMessage)) {
    return ["Abrir incidencia", "Adjuntar foto", "Contactar soporte"];
  }

  return pageSuggestions(page);
}

function buildAIQuestion(systemPrompt: string, portalContextText: string, conversationMemory: string, message: string) {
  return [
    "SYSTEM INSTRUCTIONS:",
    systemPrompt,
    conciseResponseInstruction,
    "",
    portalContextText,
    conversationMemory ? "" : null,
    conversationMemory || null,
    "",
    "CURRENT USER QUESTION:",
    trimText(message, 600)
  ]
    .filter((section): section is string => Boolean(section))
    .join("\n");
}

function buildEssentialPortalContext(portalContext: PortalAIContext) {
  const lines = [
    "PORTAL CONTEXT:",
    `- Page: ${portalContext.page || "/portal"}`,
    `- Page Type: ${portalContext.pageType}`,
    `- Locale: ${portalContext.locale || "es"}`,
    `- Tenant: ${portalContext.tenant?.displayName || "current authenticated portal user"}${portalContext.tenant?.customerNo ? ` (customer ${portalContext.tenant.customerNo})` : ""}`
  ];

  if (portalContext.incident?.id) {
    lines.push(
      `- Incident: ${[portalContext.incident.id, portalContext.incident.title, portalContext.incident.status].filter(Boolean).join(" | ")}`
    );
  }

  if (portalContext.contract?.contractNo) {
    lines.push(`- Contract: ${portalContext.contract.contractNo}`);
  }

  if (portalContext.property?.fixedRealEstateNo) {
    lines.push(`- Property: ${portalContext.property.fixedRealEstateNo}`);
  }

  if (portalContext.operationalHints.length) {
    lines.push(`- Operational hints: ${portalContext.operationalHints.slice(0, 2).join(" | ")}`);
  }

  return lines.join("\n");
}

export function trimEnrichedPromptForBC(
  systemPrompt: string,
  portalContext: PortalAIContext,
  conversationMemory: string,
  message: string
): PromptTrimResult {
  const fullPrompt = buildAIQuestion(systemPrompt, portalContext.compactText, conversationMemory, message);
  const originalLength = fullPrompt.length;

  if (originalLength <= bcQuestionSoftLimit) {
    return {
      prompt: fullPrompt,
      originalLength,
      finalLength: originalLength,
      wasTrimmed: false,
      contextIncluded: Boolean(portalContext.compactText),
      memoryIncluded: Boolean(conversationMemory)
    };
  }

  const withoutMemory = buildAIQuestion(systemPrompt, portalContext.compactText, "", message);
  if (withoutMemory.length <= bcQuestionSoftLimit) {
    const withoutMemoryMarked = trimSectionPreservingMarker(withoutMemory, bcQuestionSoftLimit);
    return {
      prompt: withoutMemoryMarked,
      originalLength,
      finalLength: withoutMemoryMarked.length,
      wasTrimmed: true,
      contextIncluded: true,
      memoryIncluded: false
    };
  }

  const compactContext = trimSectionPreservingMarker(portalContext.compactText, Math.min(520, portalContext.compactText.length));
  const withCompactContext = buildAIQuestion(systemPrompt, compactContext, "", message);
  if (withCompactContext.length <= bcQuestionSoftLimit) {
    return {
      prompt: withCompactContext,
      originalLength,
      finalLength: withCompactContext.length,
      wasTrimmed: true,
      contextIncluded: true,
      memoryIncluded: false
    };
  }

  const essentialContext = buildEssentialPortalContext(portalContext);
  const shortSystemPrompt = trimSectionPreservingMarker(systemPrompt, 420);
  const withShortSystem = buildAIQuestion(shortSystemPrompt, essentialContext, "", message);
  if (withShortSystem.length <= bcQuestionSoftLimit) {
    return {
      prompt: withShortSystem,
      originalLength,
      finalLength: withShortSystem.length,
      wasTrimmed: true,
      contextIncluded: true,
      memoryIncluded: false
    };
  }

  const systemMarkerPrompt = buildAIQuestion(shortenedContextMarker, essentialContext, "", message);
  if (systemMarkerPrompt.length <= bcQuestionSoftLimit) {
    return {
      prompt: systemMarkerPrompt,
      originalLength,
      finalLength: systemMarkerPrompt.length,
      wasTrimmed: true,
      contextIncluded: true,
      memoryIncluded: false
    };
  }

  const currentQuestion = trimText(message, 600);
  const baseLength = buildAIQuestion(shortenedContextMarker, "", "", currentQuestion).length;
  const contextBudget = Math.max(220, bcQuestionSoftLimit - baseLength - 2);
  const finalContext = trimSectionPreservingMarker(essentialContext, contextBudget);
  const finalPrompt = buildAIQuestion(shortenedContextMarker, finalContext, "", currentQuestion);

  return {
    prompt: finalPrompt.slice(0, bcQuestionSoftLimit),
    originalLength,
    finalLength: Math.min(finalPrompt.length, bcQuestionSoftLimit),
    wasTrimmed: true,
    contextIncluded: true,
    memoryIncluded: false
  };
}

function mapAIResponseToChatReply(page: string, message: string, context: PortalAIContext, aiResponse: AIChatResponse): PortalChatReply {
  const answer = typeof aiResponse.response === "string" ? aiResponse.response.trim() : "";

  if (!answer) {
    throw new Error("OD AI Portal Chat API no devolvio contenido util.");
  }

  return {
    answer,
    links: pageLinks(page),
    suggestions: pickSuggestions(page, message, context)
  };
}

function mapCachedAnswerToReply(page: string, message: string, context: PortalAIContext, answer: string): PortalChatReply {
  return {
    answer,
    links: pageLinks(page),
    suggestions: pickSuggestions(page, message, context)
  };
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number) {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`OD AI Portal Chat API timeout tras ${timeoutMs} ms.`));
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => {
    if (timeoutId) clearTimeout(timeoutId);
  }) as Promise<T>;
}

export async function sendAIChatRequest({
  message,
  sessionId,
  portalContext,
  conversationMemory
}: SendAIChatRequestInput): Promise<PortalChatReply> {
  if (env.useMockApi) {
    throw new Error("OD AI Portal Chat API no esta disponible con USE_MOCK_API=true.");
  }

  const portalUserId = portalContext.tenant?.portalUserId;
  if (!portalUserId) {
    throw new Error("No se pudo resolver el portalUserId para la consulta AI.");
  }

  const systemPrompt = await loadSystemPrompt();
  const formattedMemory = formatConversationMemory(conversationMemory);
  const trimmedPrompt = trimEnrichedPromptForBC(systemPrompt, portalContext, formattedMemory, message);
  const cacheKey = `${sessionId}:${defaultAgentCode}:${buildPromptHash(trimmedPrompt.prompt)}`;
  const cachedAnswer = getCachedAIResponse(cacheKey);

  console.info("[portal-ai] AI request start", {
    sessionId,
    page: portalContext.page || "/portal",
    pageType: portalContext.pageType,
    contextIncluded: trimmedPrompt.contextIncluded,
    memoryIncluded: trimmedPrompt.memoryIncluded,
    originalQuestionLength: trimmedPrompt.originalLength,
    finalQuestionLength: trimmedPrompt.finalLength,
    promptTrimmed: trimmedPrompt.wasTrimmed,
    cacheHit: Boolean(cachedAnswer)
  });

  if (cachedAnswer) {
    console.info("[portal-ai] AI cache hit", {
      sessionId,
      page: portalContext.page || "/portal",
      pageType: portalContext.pageType,
      finalQuestionLength: trimmedPrompt.finalLength
    });
    return mapCachedAnswerToReply(portalContext.page || "/portal", message, portalContext, cachedAnswer);
  }

  console.info("[portal-ai] AI cache miss", {
    sessionId,
    page: portalContext.page || "/portal",
    pageType: portalContext.pageType,
    finalQuestionLength: trimmedPrompt.finalLength
  });

  const payload: AIChatRequestPayload = {
    portalUserId,
    sessionId,
    agentCode: defaultAgentCode,
    question: trimmedPrompt.prompt,
    source: defaultSource
  };

  const aiResponse = await retryWithBackoff<AIChatResponse>({
    onAttemptFailure: ({ attempt, retryable, delayMs, errorMessage }) => {
      console.warn("[portal-ai] AI attempt failed", {
        sessionId,
        page: portalContext.page || "/portal",
        pageType: portalContext.pageType,
        attempt,
        retryable,
        retryDelayMs: delayMs,
        finalQuestionLength: trimmedPrompt.finalLength,
        timeout: errorMessage.toLowerCase().includes("timeout"),
        error: errorMessage
      });
    },
    run: async (attempt) => {
      console.info("[portal-ai] AI attempt start", {
        sessionId,
        page: portalContext.page || "/portal",
        pageType: portalContext.pageType,
        attempt,
        finalQuestionLength: trimmedPrompt.finalLength
      });

      let response: AIChatResponse;
      try {
        response = await withTimeout(
          bcPostCustomApiForCompany<AIChatResponse>(
            {
              companyId: portalContext.company?.bcCompanyId,
              companyName: portalContext.company?.bcCompanyName
            },
            aiLayerApi,
            aiChatPath,
            payload
          ),
          requestTimeoutMs
        );
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (errorMessage.toLowerCase().includes("timeout")) {
          console.error("[portal-ai] AI timeout", {
            sessionId,
            page: portalContext.page || "/portal",
            pageType: portalContext.pageType,
            attempt,
            finalQuestionLength: trimmedPrompt.finalLength,
            timeoutMs: requestTimeoutMs
          });
        }
        throw error;
      }

      console.info("[portal-ai] AI response received", {
        sessionId,
        page: portalContext.page || "/portal",
        pageType: portalContext.pageType,
        attempt,
        status: response.status || null,
        error: response.errorMessage?.trim() || null,
        durationMs: response.durationMs ?? null,
        entryNo: response.entryNo ?? null
      });

      const status = (response.status || "").trim().toLowerCase();
      if (status && status !== "completed") {
        throw new Error(response.errorMessage?.trim() || `OD AI Portal Chat API devolvio estado ${response.status}.`);
      }

      if (response.errorMessage?.trim()) {
        throw new Error(response.errorMessage.trim());
      }

      return response;
    }
  });

  const reply = mapAIResponseToChatReply(portalContext.page || "/portal", message, portalContext, aiResponse);
  setCachedAIResponse(cacheKey, reply.answer);

  return reply;
}
