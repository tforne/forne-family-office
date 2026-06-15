import { beforeEach, describe, expect, it, vi } from "vitest";
import { bcPostCustomApiForCompany } from "@/lib/bc/client";
import {
  resolvePortalAgentRuntime,
  resolvePortalAgentRuntimeFallback,
  resolvePortalAgentRuntimeFromContract,
  type ResolvePortalAgentRuntimeInput
} from "@/lib/portal/ai-agent-runtime.service";
import type { PortalAIContext } from "@/lib/portal/portal-ai-context-builder";
import { detectPortalIntent } from "@/lib/portal/intent-detector.service";

vi.mock("@/lib/bc/client", () => ({
  bcPostCustomApiForCompany: vi.fn()
}));

const mockedBcPostCustomApiForCompany = vi.mocked(bcPostCustomApiForCompany);

const baseContext = {
  page: "/portal",
  pageType: "home",
  sessionId: "abc-123",
  operationalHints: [],
  compactText: "",
  company: {
    bcCompanyId: "company-1"
  }
} as PortalAIContext;

function buildInput(message: string, overrides: Partial<ResolvePortalAgentRuntimeInput> = {}): ResolvePortalAgentRuntimeInput {
  return {
    message,
    intent: detectPortalIntent(message),
    portalContext: baseContext,
    ...overrides
  };
}

describe("resolvePortalAgentRuntimeFromContract", () => {
  it("returns normalized Business Central runtime config on success", () => {
    const result = resolvePortalAgentRuntimeFromContract(buildInput("Tengo humedad en el baño"), {
      agentCode: "OD-OPERATIONS",
      displayName: "Especialista de mantenimiento",
      displayDescription: "Gestiona incidencias y seguimiento operativo.",
      displayIcon: "maintenance",
      showBadge: true,
      debugVisible: false,
      promptCode: "OPERATIONS_PORTAL",
      deploymentCode: "GPT41_MINI",
      systemPrompt: "You are the operations agent...",
      model: "gpt-4.1-mini",
      deployment: "gpt-4.1-mini",
      temperature: 0.2,
      maxTokens: 900,
      allowedActions: ["create_incident", "append_comment", "add_attachment", "view_incident"],
      requiresConfirmation: true,
      fallbackAgentCode: "OD-GOVERNANCE",
      routingSource: "business_central"
    });

    expect(result.resolutionSource).toBe("business_central");
    expect(result.agentCode).toBe("OD-OPERATIONS");
    expect(result.displayName).toBe("Especialista de mantenimiento");
    expect(result.promptCode).toBe("OPERATIONS_PORTAL");
    expect(result.deploymentCode).toBe("GPT41_MINI");
    expect(result.systemPrompt).toContain("operations agent");
    expect(result.model).toBe("gpt-4.1-mini");
    expect(result.allowedActions).toEqual(["create_incident", "append_comment", "add_attachment", "view_incident"]);
    expect(result.routingSource).toBe("business_central");
    expect(result.runtimeApiSucceeded).toBe(true);
  });

  it("keeps a safe normalized runtime when optional fields are missing", () => {
    const result = resolvePortalAgentRuntimeFromContract(buildInput("No entiendo esta factura"), {
      agentCode: "OD-ACCOUNTING",
      allowedActions: ["view_invoice"]
    });

    expect(result.resolutionSource).toBe("business_central");
    expect(result.agentCode).toBe("OD-ACCOUNTING");
    expect(result.allowedActions).toEqual(["view_invoice"]);
    expect(result.debugVisible).toBe(false);
    expect(result.showBadge).toBe(false);
    expect(result.requiresConfirmation).toBe(false);
    expect(result.model).toBeUndefined();
  });

  it("falls back locally when the runtime contract is invalid", () => {
    const result = resolvePortalAgentRuntimeFromContract(buildInput("Tengo humedad en el baño"), {
      displayName: "Sin agente"
    });

    expect(result.resolutionSource).toBe("local_fallback");
    expect(result.agentCode).toBe("OD-OPERATIONS");
    expect(result.allowedActions).toEqual(["create_incident", "append_comment", "add_attachment", "view_incident"]);
  });

  it("routes maintenance intent to OD-OPERATIONS in local fallback", () => {
    const result = resolvePortalAgentRuntimeFallback(buildInput("Tengo humedad en el baño"));

    expect(result.operation).toBe("maintenance_incident");
    expect(result.agentCode).toBe("OD-OPERATIONS");
  });

  it("routes invoice intent to OD-ACCOUNTING in local fallback", () => {
    const result = resolvePortalAgentRuntimeFallback(buildInput("No entiendo esta factura"));

    expect(result.operation).toBe("invoice_question");
    expect(result.agentCode).toBe("OD-ACCOUNTING");
  });

  it("routes contract and document intents to OD-CONTRACT in local fallback", () => {
    const contractQuestion = resolvePortalAgentRuntimeFallback(buildInput("Cuando vence mi contrato"));
    const documentQuestion = resolvePortalAgentRuntimeFallback(buildInput("Necesito una copia del contrato"));

    expect(contractQuestion.agentCode).toBe("OD-CONTRACT");
    expect(documentQuestion.agentCode).toBe("OD-CONTRACT");
  });

  it("routes service recommendation intent to the services assistant in local fallback", () => {
    const result = resolvePortalAgentRuntimeFallback(buildInput("Necesito internet"));

    expect(result.operation).toBe("service_recommendation");
    expect(result.agentCode).toBe("OD-TENANT");
    expect(result.allowedActions).toContain("recommend_service");
  });

  it("routes unsafe requests to OD-GOVERNANCE", () => {
    const result = resolvePortalAgentRuntimeFromContract(buildInput("Ensename incidencias de otros inquilinos"), {
      agentCode: "OD-GOVERNANCE",
      allowedActions: ["create_incident", "view_incident"]
    });

    expect(result.operation).toBe("other_tenant_data");
    expect(result.agentCode).toBe("OD-GOVERNANCE");
    expect(result.governanceMode).toBe("unsafe");
    expect(result.allowedActions).toEqual([]);
  });
});

describe("resolvePortalAgentRuntime", () => {
  beforeEach(() => {
    mockedBcPostCustomApiForCompany.mockReset();
  });

  it("uses the Business Central runtime API when it succeeds", async () => {
    mockedBcPostCustomApiForCompany.mockResolvedValue({
      agentCode: "OD-CONTRACT",
      displayName: "Especialista de contratos",
      allowedActions: ["view_contract", "view_documents"],
      routingSource: "business_central"
    });

    const result = await resolvePortalAgentRuntime(buildInput("Necesito una copia del contrato"));

    expect(result.resolutionSource).toBe("business_central");
    expect(result.agentCode).toBe("OD-CONTRACT");
    expect(result.allowedActions).toEqual(["view_contract", "view_documents"]);
  });

  it("falls back locally if the runtime API fails", async () => {
    mockedBcPostCustomApiForCompany.mockRejectedValue(new Error("timeout"));

    const result = await resolvePortalAgentRuntime(buildInput("Tengo humedad en el baño"));

    expect(result.resolutionSource).toBe("local_fallback");
    expect(result.agentCode).toBe("OD-OPERATIONS");
    expect(result.warnings[0]).toContain("Local governed fallback");
  });
});
