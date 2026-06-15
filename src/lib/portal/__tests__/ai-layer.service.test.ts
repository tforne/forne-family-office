import { beforeEach, describe, expect, it, vi } from "vitest";
import { bcPostCustomApiForCompany } from "@/lib/bc/client";
import {
  buildPortalAIChatRequestPayload,
  buildPortalAIRuntimeMetadata,
  sendAIChatRequest
} from "@/lib/portal/ai-layer.service";
import type { PortalAgentRuntimeResolution } from "@/lib/portal/ai-agent-runtime.service";
import type { PortalAIContext } from "@/lib/portal/portal-ai-context-builder";
import { detectPortalIntent } from "@/lib/portal/intent-detector.service";

vi.mock("@/lib/bc/client", () => ({
  bcPostCustomApiForCompany: vi.fn()
}));

vi.mock("@/lib/config/env", () => ({
  env: {
    useMockApi: false
  }
}));

const mockedBcPostCustomApiForCompany = vi.mocked(bcPostCustomApiForCompany);

const basePortalContext = {
  page: "/portal/incidents/INC-1",
  pageType: "incident",
  locale: "es",
  sessionId: "session-1",
  compactText: "PORTAL CONTEXT:\n- Incident: INC-1 | Humedad | Open",
  operationalHints: [],
  company: {
    bcCompanyId: "company-1"
  },
  tenant: {
    portalUserId: "tenant-1",
    displayName: "Tenant One",
    customerNo: "C0001"
  },
  incident: {
    id: "INC-1",
    title: "Humedad",
    status: "Open"
  }
} as PortalAIContext;

function buildRuntime(overrides: Partial<PortalAgentRuntimeResolution> = {}): PortalAgentRuntimeResolution {
  return {
    operation: "maintenance_incident",
    agentCode: "OD-OPERATIONS",
    displayName: "Especialista de mantenimiento",
    displayDescription: "Gestiona incidencias",
    displayIcon: "maintenance",
    showBadge: true,
    debugVisible: false,
    promptCode: "OPERATIONS_PORTAL",
    deploymentCode: "GPT41_MINI",
    systemPrompt: "You are the operations portal runtime.",
    model: "gpt-4.1-mini",
    deployment: "gpt-4.1-mini",
    temperature: 0.2,
    maxTokens: 900,
    allowedActions: ["create_incident", "append_comment", "add_attachment", "view_incident"],
    requiresConfirmation: true,
    fallbackAgentCode: "OD-GOVERNANCE",
    routingSource: "business_central",
    source: "TenantPortal",
    routeKey: "maintenance_incident",
    resolutionSource: "business_central",
    governanceMode: "standard",
    runtimeApiSucceeded: true,
    warnings: [],
    ...overrides
  };
}

describe("buildPortalAIRuntimeMetadata", () => {
  it("maps resolved runtime fields into structured metadata", () => {
    const metadata = buildPortalAIRuntimeMetadata(buildRuntime());

    expect(metadata).toEqual({
      agentCode: "OD-OPERATIONS",
      promptCode: "OPERATIONS_PORTAL",
      deploymentCode: "GPT41_MINI",
      model: "gpt-4.1-mini",
      deployment: "gpt-4.1-mini",
      temperature: 0.2,
      maxTokens: 900,
      runtimeSource: "business_central",
      fallbackAgentCode: "OD-GOVERNANCE"
    });
  });

  it("marks unsafe runtime as governance override", () => {
    const metadata = buildPortalAIRuntimeMetadata(
      buildRuntime({
        agentCode: "OD-GOVERNANCE",
        governanceMode: "unsafe"
      })
    );

    expect(metadata.runtimeSource).toBe("governance_override");
    expect(metadata.agentCode).toBe("OD-GOVERNANCE");
  });
});

describe("buildPortalAIChatRequestPayload", () => {
  it("builds preferred and legacy payloads without dropping the user question", () => {
    const payload = buildPortalAIChatRequestPayload({
      portalUserId: "tenant-1",
      sessionId: "session-1",
      question: "Tengo humedad en el baño",
      runtime: buildRuntime()
    });

    expect(payload.preferredPayload).toMatchObject({
      portalUserId: "tenant-1",
      sessionId: "session-1",
      agentCode: "OD-OPERATIONS",
      question: "Tengo humedad en el baño",
      promptCode: "OPERATIONS_PORTAL",
      deploymentCode: "GPT41_MINI",
      model: "gpt-4.1-mini",
      deployment: "gpt-4.1-mini",
      temperature: 0.2,
      maxTokens: 900,
      runtimeSource: "business_central",
      fallbackAgentCode: "OD-GOVERNANCE"
    });
    expect(payload.legacyPayload).toEqual({
      portalUserId: "tenant-1",
      sessionId: "session-1",
      agentCode: "OD-OPERATIONS",
      question: "Tengo humedad en el baño",
      source: "TenantPortal"
    });
  });
});

describe("sendAIChatRequest", () => {
  beforeEach(() => {
    mockedBcPostCustomApiForCompany.mockReset();
  });

  it("sends preferred runtime metadata fields when the BC endpoint supports them", async () => {
    mockedBcPostCustomApiForCompany.mockResolvedValue({
      status: "Completed",
      response: "Respuesta AI"
    });

    const reply = await sendAIChatRequest({
      message: "Tengo humedad en el baño",
      sessionId: "preferred-session",
      portalContext: basePortalContext,
      conversationMemory: [],
      intent: detectPortalIntent("Tengo humedad en el baño"),
      runtime: buildRuntime()
    });

    expect(reply.answer).toBe("Respuesta AI");
    expect(mockedBcPostCustomApiForCompany).toHaveBeenCalledTimes(1);
    expect(mockedBcPostCustomApiForCompany.mock.calls[0]?.[3]).toMatchObject({
      portalUserId: "tenant-1",
      sessionId: "preferred-session",
      agentCode: "OD-OPERATIONS",
      promptCode: "OPERATIONS_PORTAL",
      deploymentCode: "GPT41_MINI",
      model: "gpt-4.1-mini",
      deployment: "gpt-4.1-mini",
      temperature: 0.2,
      maxTokens: 900,
      runtimeSource: "business_central",
      fallbackAgentCode: "OD-GOVERNANCE"
    });
  });

  it("retries with the legacy payload when structured metadata is rejected", async () => {
    mockedBcPostCustomApiForCompany
      .mockRejectedValueOnce(new Error("Business Central error 400 (url): Invalid property 'promptCode'"))
      .mockResolvedValueOnce({
        status: "Completed",
        response: "Respuesta legacy"
      });

    const reply = await sendAIChatRequest({
      message: "Tengo humedad en el baño",
      sessionId: "legacy-session",
      portalContext: basePortalContext,
      conversationMemory: [],
      intent: detectPortalIntent("Tengo humedad en el baño"),
      runtime: buildRuntime()
    });

    expect(reply.answer).toBe("Respuesta legacy");
    expect(mockedBcPostCustomApiForCompany).toHaveBeenCalledTimes(2);
    expect(mockedBcPostCustomApiForCompany.mock.calls[0]?.[3]).toMatchObject({
      promptCode: "OPERATIONS_PORTAL",
      deploymentCode: "GPT41_MINI",
      runtimeSource: "business_central"
    });
    expect(mockedBcPostCustomApiForCompany.mock.calls[1]?.[3]).toEqual({
      portalUserId: "tenant-1",
      sessionId: "legacy-session",
      agentCode: "OD-OPERATIONS",
      question: expect.stringContaining("CURRENT USER QUESTION"),
      source: "TenantPortal"
    });
  });

  it("keeps local fallback metadata transport safe when optional runtime fields are missing", async () => {
    mockedBcPostCustomApiForCompany.mockResolvedValue({
      status: "Completed",
      response: "Respuesta fallback"
    });

    await sendAIChatRequest({
      message: "No entiendo esta factura",
      sessionId: "fallback-session",
      portalContext: {
        ...basePortalContext,
        page: "/portal/invoices/INV-1",
        pageType: "invoice"
      },
      conversationMemory: [],
      intent: detectPortalIntent("No entiendo esta factura"),
      runtime: buildRuntime({
        agentCode: "OD-ACCOUNTING",
        promptCode: undefined,
        deploymentCode: undefined,
        model: undefined,
        deployment: undefined,
        temperature: undefined,
        maxTokens: undefined,
        fallbackAgentCode: "OD-ACCOUNTING",
        resolutionSource: "local_fallback",
        routingSource: "local_fallback",
        runtimeApiSucceeded: false
      })
    });

    expect(mockedBcPostCustomApiForCompany.mock.calls[0]?.[3]).toMatchObject({
      agentCode: "OD-ACCOUNTING",
      runtimeSource: "local_fallback",
      fallbackAgentCode: "OD-ACCOUNTING"
    });
  });
});
