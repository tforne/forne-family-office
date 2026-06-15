import { describe, expect, it } from "vitest";
import type { PortalAction } from "@/lib/portal/chat-assistant";
import { filterPortalActionsByRuntime } from "@/lib/portal/ai-governance-runtime.service";
import type { PortalAgentRuntimeResolution } from "@/lib/portal/ai-agent-runtime.service";

function buildRuntime(overrides: Partial<PortalAgentRuntimeResolution> = {}): PortalAgentRuntimeResolution {
  return {
    operation: "maintenance_incident",
    agentCode: "OD-OPERATIONS",
    showBadge: true,
    debugVisible: false,
    allowedActions: ["create_incident", "append_comment", "add_attachment", "view_incident"],
    requiresConfirmation: true,
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

describe("filterPortalActionsByRuntime", () => {
  it("filters UI actions using allowedActions from Business Central", () => {
    const actions: PortalAction[] = [
      { type: "create_incident", label: "Crear incidencia" },
      { type: "attach_photo", label: "Adjuntar foto" },
      { type: "view_invoice", label: "Ver factura" },
      { type: "append_comment", label: "Anadir comentario" }
    ];

    const filtered = filterPortalActionsByRuntime(
      actions,
      buildRuntime({
        allowedActions: ["create_incident", "add_attachment"]
      })
    );

    expect(filtered.map((action) => action.type)).toEqual(["create_incident", "attach_photo"]);
  });

  it("maps create_anyway to create_incident governance", () => {
    const filtered = filterPortalActionsByRuntime(
      [{ type: "create_anyway", label: "Crear nueva incidencia igualmente" }],
      buildRuntime({
        allowedActions: ["create_incident"]
      })
    );

    expect(filtered.map((action) => action.type)).toEqual(["create_anyway"]);
  });

  it("filters follow_operational_route using the route destination", () => {
    const filtered = filterPortalActionsByRuntime(
      [
        {
          type: "follow_operational_route",
          label: "Ir a incidencias",
          payload: {
            href: "/portal/incidents",
            destination: "incidents",
            queue: "maintenance"
          }
        }
      ],
      buildRuntime({
        allowedActions: ["view_incident"]
      })
    );

    expect(filtered.map((action) => action.type)).toEqual(["follow_operational_route"]);
  });

  it("blocks unsafe write actions in local fallback", () => {
    const filtered = filterPortalActionsByRuntime(
      [
        { type: "create_incident", label: "Crear incidencia" },
        { type: "append_comment", label: "Anadir comentario" },
        { type: "contact_support", label: "Contactar soporte" }
      ],
      buildRuntime({
        operation: "other_tenant_data",
        agentCode: "OD-GOVERNANCE",
        allowedActions: [],
        routingSource: "local_fallback",
        resolutionSource: "local_fallback",
        governanceMode: "unsafe",
        runtimeApiSucceeded: false
      })
    );

    expect(filtered).toEqual([]);
  });
});
