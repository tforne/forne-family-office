import { bcPostCustomApiForCompany, type BusinessCentralCustomApiRef } from "@/lib/bc/client";
import { env } from "@/lib/config/env";
import type { PortalIntentType, PortalOperationalRouting } from "@/lib/portal/chat-assistant";
import type { IntentDetectionResult } from "@/lib/portal/intent-detector.service";
import type { PortalAIContext } from "@/lib/portal/portal-ai-context-builder";

export type PortalAIRuntimeOperation =
  | PortalIntentType
  | "payment_question"
  | "unsafe_request"
  | "delete_data"
  | "bypass_permissions"
  | "other_tenant_data";

export type GovernedPortalRuntimeAction =
  | "create_incident"
  | "append_comment"
  | "add_attachment"
  | "view_incident"
  | "view_invoice"
  | "view_contract"
  | "view_documents"
  | "recommend_service"
  | "contact_support";

export interface PortalAgentRuntimeResolution {
  operation: PortalAIRuntimeOperation;
  agentCode: string;
  displayName?: string;
  displayDescription?: string;
  displayIcon?: string;
  showBadge: boolean;
  debugVisible: boolean;
  promptCode?: string;
  deploymentCode?: string;
  systemPrompt?: string;
  model?: string;
  deployment?: string;
  temperature?: number;
  maxTokens?: number;
  allowedActions: GovernedPortalRuntimeAction[];
  requiresConfirmation: boolean;
  fallbackAgentCode?: string;
  routingSource: string;
  source: string;
  routeKey: string;
  resolutionSource: "business_central" | "local_fallback";
  governanceMode: "standard" | "unsafe";
  runtimeApiSucceeded: boolean;
  warnings: string[];
}

export interface ResolvePortalAgentRuntimeInput {
  message: string;
  intent: IntentDetectionResult;
  portalContext: PortalAIContext;
  routing?: PortalOperationalRouting;
  portalAction?: string;
}

type RuntimeResolveRequest = {
  intent: PortalAIRuntimeOperation;
  portalAction?: string;
  pageType?: string;
  page: string;
  sessionId: string;
  message: string;
};

type RuntimeResolveResponse = {
  agentCode?: unknown;
  displayName?: unknown;
  displayDescription?: unknown;
  displayIcon?: unknown;
  showBadge?: unknown;
  debugVisible?: unknown;
  promptCode?: unknown;
  deploymentCode?: unknown;
  systemPrompt?: unknown;
  model?: unknown;
  deployment?: unknown;
  temperature?: unknown;
  maxTokens?: unknown;
  allowedActions?: unknown;
  requiresConfirmation?: unknown;
  fallbackAgentCode?: unknown;
  routingSource?: unknown;
};

type RuntimeDescriptor = {
  agentCode: string;
  displayName?: string;
  displayDescription?: string;
  displayIcon?: string;
  showBadge: boolean;
  requiresConfirmation: boolean;
  allowedActions: GovernedPortalRuntimeAction[];
};

const defaultSource = "TenantPortal";
const runtimeResolveCacheTtlMs = 60_000;
const runtimeResolveApi: BusinessCentralCustomApiRef = {
  publisher: env.bcAiRuntimeApiPublisher,
  group: env.bcAiRuntimeApiGroup,
  version: env.bcAiRuntimeApiVersion
};
const supportedAllowedActions = new Set<GovernedPortalRuntimeAction>([
  "create_incident",
  "append_comment",
  "add_attachment",
  "view_incident",
  "view_invoice",
  "view_contract",
  "view_documents",
  "recommend_service",
  "contact_support"
]);

const localFallbackRuntimeMap: Record<PortalAIRuntimeOperation, RuntimeDescriptor> = {
  maintenance_incident: {
    agentCode: "OD-OPERATIONS",
    displayName: "Especialista de mantenimiento",
    displayDescription: "Gestiona incidencias, mantenimiento, urgencias y seguimiento operativo.",
    displayIcon: "maintenance",
    showBadge: true,
    requiresConfirmation: true,
    allowedActions: ["create_incident", "append_comment", "add_attachment", "view_incident"]
  },
  urgent_incident: {
    agentCode: "OD-OPERATIONS",
    displayName: "Especialista de mantenimiento",
    displayDescription: "Gestiona incidencias, mantenimiento, urgencias y seguimiento operativo.",
    displayIcon: "maintenance",
    showBadge: true,
    requiresConfirmation: true,
    allowedActions: ["create_incident", "append_comment", "add_attachment", "view_incident"]
  },
  invoice_question: {
    agentCode: "OD-ACCOUNTING",
    displayName: "Especialista de facturacion",
    displayDescription: "Aclara facturas, cobros, vencimientos y consultas economicas.",
    displayIcon: "billing",
    showBadge: true,
    requiresConfirmation: false,
    allowedActions: ["view_invoice"]
  },
  payment_question: {
    agentCode: "OD-ACCOUNTING",
    displayName: "Especialista de facturacion",
    displayDescription: "Aclara facturas, cobros, vencimientos y consultas economicas.",
    displayIcon: "billing",
    showBadge: true,
    requiresConfirmation: false,
    allowedActions: ["view_invoice"]
  },
  contract_question: {
    agentCode: "OD-CONTRACT",
    displayName: "Especialista de contratos",
    displayDescription: "Resuelve dudas contractuales y documentales del portal.",
    displayIcon: "contract",
    showBadge: true,
    requiresConfirmation: false,
    allowedActions: ["view_contract", "view_documents"]
  },
  document_request: {
    agentCode: "OD-CONTRACT",
    displayName: "Especialista de contratos",
    displayDescription: "Resuelve dudas contractuales y documentales del portal.",
    displayIcon: "contract",
    showBadge: true,
    requiresConfirmation: false,
    allowedActions: ["view_contract", "view_documents"]
  },
  service_recommendation: {
    agentCode: "OD-TENANT",
    displayName: "Asistente de servicios",
    displayDescription: "Orienta sobre servicios reales visibles para el inmueble del tenant.",
    displayIcon: "support",
    showBadge: false,
    requiresConfirmation: false,
    allowedActions: ["recommend_service", "contact_support"]
  },
  support_request: {
    agentCode: "OD-TENANT",
    displayName: "Asistente del portal",
    displayDescription: "Orienta al inquilino dentro del portal y canaliza soporte.",
    displayIcon: "support",
    showBadge: false,
    requiresConfirmation: false,
    allowedActions: ["contact_support"]
  },
  general_chat: {
    agentCode: "OD-TENANT",
    displayName: "Asistente del portal",
    displayDescription: "Orienta al inquilino dentro del portal y canaliza soporte.",
    displayIcon: "support",
    showBadge: false,
    requiresConfirmation: false,
    allowedActions: ["contact_support"]
  },
  unsafe_request: {
    agentCode: "OD-GOVERNANCE",
    displayName: "Supervisor de seguridad",
    displayDescription: "Bloquea solicitudes no seguras o fuera del alcance del portal.",
    displayIcon: "governance",
    showBadge: true,
    requiresConfirmation: true,
    allowedActions: []
  },
  delete_data: {
    agentCode: "OD-GOVERNANCE",
    displayName: "Supervisor de seguridad",
    displayDescription: "Bloquea solicitudes no seguras o fuera del alcance del portal.",
    displayIcon: "governance",
    showBadge: true,
    requiresConfirmation: true,
    allowedActions: []
  },
  bypass_permissions: {
    agentCode: "OD-GOVERNANCE",
    displayName: "Supervisor de seguridad",
    displayDescription: "Bloquea solicitudes no seguras o fuera del alcance del portal.",
    displayIcon: "governance",
    showBadge: true,
    requiresConfirmation: true,
    allowedActions: []
  },
  other_tenant_data: {
    agentCode: "OD-GOVERNANCE",
    displayName: "Supervisor de seguridad",
    displayDescription: "Bloquea solicitudes no seguras o fuera del alcance del portal.",
    displayIcon: "governance",
    showBadge: true,
    requiresConfirmation: true,
    allowedActions: []
  }
};

const unsafeRuntimeRules: Array<{
  operation: Extract<PortalAIRuntimeOperation, "unsafe_request" | "delete_data" | "bypass_permissions" | "other_tenant_data">;
  patterns: RegExp[];
}> = [
  {
    operation: "delete_data",
    patterns: [
      /\b(borra|borrar|elimina|eliminar|delete|wipe)\b.{0,40}\b(datos|historial|registros|incidencias|comentarios|adjuntos)\b/i,
      /\b(elimina|delete)\b.{0,20}\b(todo|todas|todos)\b/i
    ]
  },
  {
    operation: "bypass_permissions",
    patterns: [
      /\b(bypass|salt\w*|ignora|omitir|evitar)\b.{0,40}\b(permisos|seguridad|autorizaci[oó]n|autenticaci[oó]n|restricciones)\b/i,
      /\b(dame acceso|quiero acceso)\b.{0,40}\b(sin permisos|sin autorizaci[oó]n)\b/i
    ]
  },
  {
    operation: "other_tenant_data",
    patterns: [
      /\b(otro inquilino|otros inquilinos|otro cliente|otra empresa|otro arrendatario)\b/i,
      /\b(datos|incidencias|facturas|contratos)\b.{0,40}\b(de otro|de otra empresa|de otro cliente)\b/i
    ]
  },
  {
    operation: "unsafe_request",
    patterns: [
      /\b(hack|sql injection|inyecci[oó]n sql|contrase[nñ]a|password|token|credential|credenciales)\b/i,
      /\b(exfiltra|roba|robar|filtra datos)\b/i
    ]
  }
];

const runtimeResolveCache = new Map<
  string,
  {
    expiresAt: number;
    runtime: PortalAgentRuntimeResolution;
  }
>();

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function trimText(value: string, maxLength = 160) {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, Math.max(0, maxLength - 3)).trimEnd()}...`;
}

function sanitizeText(value: unknown, maxLength = 160) {
  if (typeof value !== "string") return undefined;
  const sanitized = value.replace(/[\u0000-\u001f\u007f]+/g, " ").trim();
  if (!sanitized) return undefined;
  return trimText(sanitized, maxLength);
}

function sanitizeBoolean(value: unknown) {
  if (typeof value === "boolean") return value;

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["true", "1", "yes", "si", "sí"].includes(normalized)) return true;
    if (["false", "0", "no"].includes(normalized)) return false;
  }

  return undefined;
}

function sanitizeNumber(value: unknown, options?: { min?: number; max?: number }) {
  const numeric =
    typeof value === "number" && Number.isFinite(value)
      ? value
      : typeof value === "string" && value.trim()
        ? Number(value)
        : Number.NaN;

  if (!Number.isFinite(numeric)) return undefined;
  if (typeof options?.min === "number" && numeric < options.min) return options.min;
  if (typeof options?.max === "number" && numeric > options.max) return options.max;
  return numeric;
}

function sanitizeAllowedActions(value: unknown) {
  if (!Array.isArray(value)) return [];

  const normalized = value
    .map((entry) => sanitizeText(entry, 60))
    .filter((entry): entry is string => Boolean(entry))
    .map((entry) => entry.toLowerCase())
    .filter((entry): entry is GovernedPortalRuntimeAction => supportedAllowedActions.has(entry as GovernedPortalRuntimeAction));

  return Array.from(new Set(normalized));
}

function deriveRuntimeOperation(message: string, intent: IntentDetectionResult): PortalAIRuntimeOperation {
  for (const rule of unsafeRuntimeRules) {
    if (rule.patterns.some((pattern) => pattern.test(message))) {
      return rule.operation;
    }
  }

  const normalizedMessage = normalizeText(message);
  if (
    intent.intent === "invoice_question" &&
    /\b(pago|pagos|cobro|cobros|transferencia|bank transfer|domiciliacion|domiciliacion bancaria)\b/.test(normalizedMessage)
  ) {
    return "payment_question";
  }

  return intent.intent;
}

function buildRouteKey(input: ResolvePortalAgentRuntimeInput, operation: PortalAIRuntimeOperation) {
  const parts = [
    operation,
    input.portalAction?.trim().toLowerCase(),
    input.routing?.queue?.trim().toLowerCase(),
    input.portalContext.pageType?.trim().toLowerCase()
  ].filter(Boolean);

  return parts.join(":");
}

function isUnsafeOperation(operation: PortalAIRuntimeOperation) {
  return operation === "unsafe_request" || operation === "delete_data" || operation === "bypass_permissions" || operation === "other_tenant_data";
}

function buildLocalRuntimeResolution(
  input: ResolvePortalAgentRuntimeInput,
  operation: PortalAIRuntimeOperation,
  warnings: string[] = []
): PortalAgentRuntimeResolution {
  const descriptor = localFallbackRuntimeMap[operation];

  return {
    operation,
    agentCode: descriptor.agentCode,
    displayName: descriptor.displayName,
    displayDescription: descriptor.displayDescription,
    displayIcon: descriptor.displayIcon,
    showBadge: descriptor.showBadge,
    debugVisible: false,
    promptCode: undefined,
    deploymentCode: undefined,
    systemPrompt: undefined,
    model: undefined,
    deployment: undefined,
    temperature: undefined,
    maxTokens: undefined,
    allowedActions: descriptor.allowedActions,
    requiresConfirmation: descriptor.requiresConfirmation,
    fallbackAgentCode: descriptor.agentCode,
    routingSource: "local_fallback",
    source: defaultSource,
    routeKey: buildRouteKey(input, operation),
    resolutionSource: "local_fallback",
    governanceMode: isUnsafeOperation(operation) ? "unsafe" : "standard",
    runtimeApiSucceeded: false,
    warnings
  };
}

function buildRuntimeResolveRequest(input: ResolvePortalAgentRuntimeInput, operation: PortalAIRuntimeOperation): RuntimeResolveRequest {
  return {
    intent: operation,
    portalAction: sanitizeText(input.portalAction, 80),
    pageType: sanitizeText(input.portalContext.pageType, 80),
    page: sanitizeText(input.portalContext.page, 180) || "/portal",
    sessionId: sanitizeText(input.portalContext.sessionId, 120) || "unknown-session",
    message: trimText(input.message, 600)
  };
}

function runtimeResolveCacheKey(input: ResolvePortalAgentRuntimeInput, operation: PortalAIRuntimeOperation) {
  const companyId = input.portalContext.company?.bcCompanyId?.trim() || input.portalContext.company?.bcCompanyName?.trim() || "default";
  const request = buildRuntimeResolveRequest(input, operation);
  return [
    companyId,
    request.intent,
    request.portalAction || "",
    request.pageType || "",
    request.page,
    normalizeText(request.message)
  ].join("::");
}

function normalizeRuntimeContract(
  input: ResolvePortalAgentRuntimeInput,
  operation: PortalAIRuntimeOperation,
  response: unknown
): PortalAgentRuntimeResolution | null {
  if (!response || typeof response !== "object") {
    return null;
  }

  const contract = response as RuntimeResolveResponse;
  const localFallback = buildLocalRuntimeResolution(input, operation);
  const agentCode = sanitizeText(contract.agentCode, 80);
  if (!agentCode) {
    return null;
  }

  const unsafeOperation = isUnsafeOperation(operation);
  const allowedActions = unsafeOperation ? [] : sanitizeAllowedActions(contract.allowedActions);
  const localWriteAllowed = localFallback.allowedActions.some((action) =>
    ["create_incident", "append_comment", "add_attachment"].includes(action)
  );
  const requiresConfirmation =
    sanitizeBoolean(contract.requiresConfirmation) ??
    (allowedActions.some((action) => ["create_incident", "append_comment", "add_attachment"].includes(action)) || localWriteAllowed);

  return {
    operation,
    agentCode,
    displayName: sanitizeText(contract.displayName, 120),
    displayDescription: sanitizeText(contract.displayDescription, 240),
    displayIcon: sanitizeText(contract.displayIcon, 60),
    showBadge: sanitizeBoolean(contract.showBadge) ?? false,
    debugVisible: sanitizeBoolean(contract.debugVisible) ?? false,
    promptCode: sanitizeText(contract.promptCode, 120),
    deploymentCode: sanitizeText(contract.deploymentCode, 120),
    systemPrompt: sanitizeText(contract.systemPrompt, 6_000),
    model: sanitizeText(contract.model, 120),
    deployment: sanitizeText(contract.deployment, 120),
    temperature: sanitizeNumber(contract.temperature, { min: 0, max: 2 }),
    maxTokens: sanitizeNumber(contract.maxTokens, { min: 1, max: 8_000 }),
    allowedActions,
    requiresConfirmation,
    fallbackAgentCode: sanitizeText(contract.fallbackAgentCode, 80) || localFallback.agentCode,
    routingSource: sanitizeText(contract.routingSource, 80) || "business_central",
    source: defaultSource,
    routeKey: buildRouteKey(input, operation),
    resolutionSource: "business_central",
    governanceMode: unsafeOperation ? "unsafe" : "standard",
    runtimeApiSucceeded: true,
    warnings: []
  };
}

async function loadBusinessCentralRuntimeResolution(input: ResolvePortalAgentRuntimeInput, operation: PortalAIRuntimeOperation) {
  const cacheKey = runtimeResolveCacheKey(input, operation);
  const cached = runtimeResolveCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.runtime;
  }

  const runtime = normalizeRuntimeContract(
    input,
    operation,
    await bcPostCustomApiForCompany(
      {
        companyId: input.portalContext.company?.bcCompanyId,
        companyName: input.portalContext.company?.bcCompanyName
      },
      runtimeResolveApi,
      env.bcAiRuntimeResolveEndpoint,
      buildRuntimeResolveRequest(input, operation)
    )
  );

  if (runtime) {
    runtimeResolveCache.set(cacheKey, {
      runtime,
      expiresAt: Date.now() + runtimeResolveCacheTtlMs
    });
  }

  return runtime;
}

export function resolvePortalAgentRuntimeFromContract(
  input: ResolvePortalAgentRuntimeInput,
  response: unknown
): PortalAgentRuntimeResolution {
  const operation = deriveRuntimeOperation(input.message, input.intent);
  return normalizeRuntimeContract(input, operation, response) || buildLocalRuntimeResolution(input, operation);
}

export function resolvePortalAgentRuntimeFallback(input: ResolvePortalAgentRuntimeInput) {
  return buildLocalRuntimeResolution(input, deriveRuntimeOperation(input.message, input.intent));
}

export async function resolvePortalAgentRuntime(input: ResolvePortalAgentRuntimeInput): Promise<PortalAgentRuntimeResolution> {
  const operation = deriveRuntimeOperation(input.message, input.intent);

  try {
    const runtime = await loadBusinessCentralRuntimeResolution(input, operation);
    if (runtime) {
      return runtime;
    }

    return buildLocalRuntimeResolution(input, operation, [
      "Business Central runtime response was invalid or incomplete. Local governed fallback was used."
    ]);
  } catch (error) {
    return buildLocalRuntimeResolution(input, operation, [
      `Business Central runtime API was unavailable. Local governed fallback was used: ${
        error instanceof Error ? trimText(error.message, 180) : "Unknown error"
      }`
    ]);
  }
}
