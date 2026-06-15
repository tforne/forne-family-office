import "server-only";

import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { bcPostCustomApiForCompany, type BusinessCentralCustomApiRef } from "@/lib/bc/client";
import { env } from "@/lib/config/env";
import type { PortalChatReply } from "@/lib/portal/chat-assistant";
import type { PortalOperationalRouting } from "@/lib/portal/chat-assistant";
import { getCachedAIResponse, setCachedAIResponse } from "@/lib/portal/ai-response-cache";
import { resolvePortalAgentRuntime, type PortalAgentRuntimeResolution } from "@/lib/portal/ai-agent-runtime.service";
import { retryWithBackoff } from "@/lib/portal/ai-retry";
import { formatConversationMemory, type ConversationMemoryMessage } from "@/lib/portal/conversation-memory.service";
import type { IntentDetectionResult } from "@/lib/portal/intent-detector.service";
import type { PortalAIContext } from "@/lib/portal/portal-ai-context-builder";

const aiLayerApi: BusinessCentralCustomApiRef = {
  publisher: "onedata",
  group: "ai",
  version: "v1.0"
};

const aiChatPath = "aiChatRequests";
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
  intent: IntentDetectionResult;
  routing?: PortalOperationalRouting;
  portalAction?: string;
  runtime?: PortalAgentRuntimeResolution;
};

export interface PortalAIRuntimeMetadata {
  agentCode: string;
  promptCode?: string;
  deploymentCode?: string;
  model?: string;
  deployment?: string;
  temperature?: number;
  maxTokens?: number;
  runtimeSource?: "business_central" | "local_fallback" | "governance_override";
  fallbackAgentCode?: string;
}

export interface PortalAIChatRequest {
  agentCode: string;
  question: string;
  runtime?: PortalAIRuntimeMetadata;
}

type AILegacyChatRequestPayload = {
  portalUserId: string;
  sessionId: string;
  agentCode: string;
  question: string;
  source: string;
};

type AIPreferredChatRequestPayload = AILegacyChatRequestPayload & {
  promptCode?: string;
  deploymentCode?: string;
  model?: string;
  deployment?: string;
  temperature?: number;
  maxTokens?: number;
  runtimeSource?: PortalAIRuntimeMetadata["runtimeSource"];
  fallbackAgentCode?: string;
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
  if (page.startsWith("/portal/services")) {
    return ["Ver servicios", "Abrir WhatsApp", "Contactar proveedor"];
  }

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

  if (context.pageType === "services" || context.services?.requestedCategory) {
    return ["Ver servicios", "Abrir WhatsApp", "Contactar proveedor"];
  }

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

function buildAIQuestion(
  systemPrompt: string,
  agentCode: string,
  portalContextText: string,
  conversationMemory: string,
  message: string
) {
  return [
    "SYSTEM INSTRUCTIONS:",
    systemPrompt,
    conciseResponseInstruction,
    "",
    "SELECTED AGENT:",
    agentCode,
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

  if (portalContext.services?.propertyNo) {
    lines.push(`- Services Property Reference: ${portalContext.services.propertyNo}`);
  }

  if (portalContext.services?.requestedCategory) {
    lines.push(`- Requested Service Category: ${portalContext.services.requestedCategory}`);
  }

  if (portalContext.services?.matchedStakeholders?.length) {
    lines.push(
      `- Matching Services: ${portalContext.services.matchedStakeholders
        .map((stakeholder) => `${stakeholder.serviceTitle} (${stakeholder.stakeholderName})`)
        .join(" | ")}`
    );
  }

  if (portalContext.services) {
    lines.push("- Service Recommendation Safety: Do not invent providers or contact details outside the visible matched services.");
  }

  if (portalContext.operationalHints.length) {
    lines.push(`- Operational hints: ${portalContext.operationalHints.slice(0, 2).join(" | ")}`);
  }

  return lines.join("\n");
}

export function trimEnrichedPromptForBC(
  systemPrompt: string,
  agentCode: string,
  portalContext: PortalAIContext,
  conversationMemory: string,
  message: string
): PromptTrimResult {
  const fullPrompt = buildAIQuestion(systemPrompt, agentCode, portalContext.compactText, conversationMemory, message);
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

  const withoutMemory = buildAIQuestion(systemPrompt, agentCode, portalContext.compactText, "", message);
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
  const withCompactContext = buildAIQuestion(systemPrompt, agentCode, compactContext, "", message);
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
  const withShortSystem = buildAIQuestion(shortSystemPrompt, agentCode, essentialContext, "", message);
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

  const systemMarkerPrompt = buildAIQuestion(shortenedContextMarker, agentCode, essentialContext, "", message);
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
  const baseLength = buildAIQuestion(shortenedContextMarker, agentCode, "", "", currentQuestion).length;
  const contextBudget = Math.max(220, bcQuestionSoftLimit - baseLength - 2);
  const finalContext = trimSectionPreservingMarker(essentialContext, contextBudget);
  const finalPrompt = buildAIQuestion(shortenedContextMarker, agentCode, finalContext, "", currentQuestion);

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

function deriveRuntimeSource(runtime: PortalAgentRuntimeResolution): PortalAIRuntimeMetadata["runtimeSource"] {
  if (runtime.governanceMode === "unsafe") {
    return "governance_override";
  }

  return runtime.resolutionSource;
}

export function buildPortalAIRuntimeMetadata(runtime: PortalAgentRuntimeResolution): PortalAIRuntimeMetadata {
  return {
    agentCode: runtime.agentCode,
    promptCode: runtime.promptCode,
    deploymentCode: runtime.deploymentCode,
    model: runtime.model,
    deployment: runtime.deployment,
    temperature: runtime.temperature,
    maxTokens: runtime.maxTokens,
    runtimeSource: deriveRuntimeSource(runtime),
    fallbackAgentCode: runtime.fallbackAgentCode || runtime.agentCode
  };
}

export function buildPortalAIChatRequestPayload(input: {
  portalUserId: string;
  sessionId: string;
  question: string;
  runtime: PortalAgentRuntimeResolution;
}): {
  preferredPayload: AIPreferredChatRequestPayload;
  legacyPayload: AILegacyChatRequestPayload;
  runtimeMetadata: PortalAIRuntimeMetadata;
} {
  const runtimeMetadata = buildPortalAIRuntimeMetadata(input.runtime);
  const legacyPayload: AILegacyChatRequestPayload = {
    portalUserId: input.portalUserId,
    sessionId: input.sessionId,
    agentCode: input.runtime.agentCode,
    question: input.question,
    source: defaultSource
  };

  const preferredPayload: AIPreferredChatRequestPayload = {
    ...legacyPayload,
    promptCode: runtimeMetadata.promptCode,
    deploymentCode: runtimeMetadata.deploymentCode,
    model: runtimeMetadata.model,
    deployment: runtimeMetadata.deployment,
    temperature: runtimeMetadata.temperature,
    maxTokens: runtimeMetadata.maxTokens,
    runtimeSource: runtimeMetadata.runtimeSource,
    fallbackAgentCode: runtimeMetadata.fallbackAgentCode
  };

  return {
    preferredPayload,
    legacyPayload,
    runtimeMetadata
  };
}

function isPreferredPayloadCompatibilityError(error: unknown) {
  const message = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();

  return (
    message.includes("business central error 400") ||
    message.includes("business central error 422") ||
    message.includes("invalid property") ||
    message.includes("cannot find property") ||
    message.includes("unexpected") ||
    message.includes("badrequest") ||
    message.includes("requestbodyread") ||
    message.includes("could not be processed")
  );
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
  conversationMemory,
  intent,
  routing,
  portalAction,
  runtime: providedRuntime
}: SendAIChatRequestInput): Promise<PortalChatReply> {
  if (env.useMockApi) {
    throw new Error("OD AI Portal Chat API no esta disponible con USE_MOCK_API=true.");
  }

  const portalUserId = portalContext.tenant?.portalUserId;
  if (!portalUserId) {
    throw new Error("No se pudo resolver el portalUserId para la consulta AI.");
  }

  const runtime =
    providedRuntime ||
    (await resolvePortalAgentRuntime({
      message,
      intent,
      portalContext,
      routing,
      portalAction
    }));
  const systemPrompt = runtime.systemPrompt || (await loadSystemPrompt());
  const formattedMemory = formatConversationMemory(conversationMemory);
  const trimmedPrompt = trimEnrichedPromptForBC(systemPrompt, runtime.agentCode, portalContext, formattedMemory, message);
  const cacheKey = `${sessionId}:${runtime.agentCode}:${buildPromptHash(trimmedPrompt.prompt)}`;
  const cachedAnswer = getCachedAIResponse(cacheKey);

  console.info("[portal-ai] AI request start", {
    sessionId,
    page: portalContext.page || "/portal",
    pageType: portalContext.pageType,
    routeKey: runtime.routeKey,
    operation: runtime.operation,
    agentCode: runtime.agentCode,
    displayName: runtime.displayName || null,
    promptCode: runtime.promptCode || null,
    deploymentCode: runtime.deploymentCode || null,
    model: runtime.model || null,
    deployment: runtime.deployment || null,
    routingSource: runtime.routingSource,
    allowedActions: runtime.allowedActions,
    fallbackAgentCode: runtime.fallbackAgentCode || null,
    runtimeApiSucceeded: runtime.runtimeApiSucceeded,
    runtimeResolution: runtime.resolutionSource,
    governanceMode: runtime.governanceMode,
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
      routeKey: runtime.routeKey,
      agentCode: runtime.agentCode,
      finalQuestionLength: trimmedPrompt.finalLength
    });
    return mapCachedAnswerToReply(portalContext.page || "/portal", message, portalContext, cachedAnswer);
  }

  console.info("[portal-ai] AI cache miss", {
    sessionId,
    page: portalContext.page || "/portal",
    pageType: portalContext.pageType,
    routeKey: runtime.routeKey,
    agentCode: runtime.agentCode,
    finalQuestionLength: trimmedPrompt.finalLength
  });

  const { preferredPayload, legacyPayload, runtimeMetadata } = buildPortalAIChatRequestPayload({
    portalUserId,
    sessionId,
    question: trimmedPrompt.prompt,
    runtime
  });

  if (runtime.warnings.length > 0) {
    console.warn("[portal-ai] Runtime fallback in use", {
      sessionId,
      page: portalContext.page || "/portal",
      pageType: portalContext.pageType,
      routeKey: runtime.routeKey,
      warnings: runtime.warnings
    });
  }

  const aiResponse = await retryWithBackoff<AIChatResponse>({
    onAttemptFailure: ({ attempt, retryable, delayMs, errorMessage }) => {
      console.warn("[portal-ai] AI attempt failed", {
        sessionId,
        page: portalContext.page || "/portal",
        pageType: portalContext.pageType,
        routeKey: runtime.routeKey,
        agentCode: runtime.agentCode,
        attempt,
        retryable,
        retryDelayMs: delayMs,
        firstClassMetadataSent: true,
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
        routeKey: runtime.routeKey,
        agentCode: runtime.agentCode,
        attempt,
        firstClassMetadataSent: true,
        compatibleFallbackAvailable: true,
        runtimeSource: runtimeMetadata.runtimeSource || null,
        finalQuestionLength: trimmedPrompt.finalLength
      });

      let response: AIChatResponse;
      let compatibleFallbackUsed = false;
      try {
        try {
          response = await withTimeout(
            bcPostCustomApiForCompany<AIChatResponse>(
              {
                companyId: portalContext.company?.bcCompanyId,
                companyName: portalContext.company?.bcCompanyName
              },
              aiLayerApi,
              aiChatPath,
              preferredPayload
            ),
            requestTimeoutMs
          );
        } catch (error) {
          if (!isPreferredPayloadCompatibilityError(error)) {
            throw error;
          }

          console.warn("[portal-ai] AI metadata transport fallback", {
            sessionId,
            page: portalContext.page || "/portal",
            pageType: portalContext.pageType,
            routeKey: runtime.routeKey,
            agentCode: runtime.agentCode,
            attempt,
            compatibleFallbackUsed: true,
            runtimeSource: runtimeMetadata.runtimeSource || null,
            error: error instanceof Error ? error.message : String(error)
          });

          compatibleFallbackUsed = true;
          response = await withTimeout(
            bcPostCustomApiForCompany<AIChatResponse>(
              {
                companyId: portalContext.company?.bcCompanyId,
                companyName: portalContext.company?.bcCompanyName
              },
              aiLayerApi,
              aiChatPath,
              legacyPayload
            ),
            requestTimeoutMs
          );
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (errorMessage.toLowerCase().includes("timeout")) {
          console.error("[portal-ai] AI timeout", {
            sessionId,
            page: portalContext.page || "/portal",
            pageType: portalContext.pageType,
            routeKey: runtime.routeKey,
            agentCode: runtime.agentCode,
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
        routeKey: runtime.routeKey,
        agentCode: runtime.agentCode,
        attempt,
        status: response.status || null,
        error: response.errorMessage?.trim() || null,
        durationMs: response.durationMs ?? null,
        entryNo: response.entryNo ?? null,
        firstClassMetadataSent: true,
        compatibleFallbackUsed
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
