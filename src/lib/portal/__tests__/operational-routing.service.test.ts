import { describe, expect, it } from "vitest";
import type { PortalAIContext } from "@/lib/portal/portal-ai-context-builder";
import { detectPortalIntent } from "@/lib/portal/intent-detector.service";
import { buildOperationalRouting, buildOperationalRoutingActions } from "@/lib/portal/operational-routing.service";

const baseContext = {
  page: "/portal",
  pageType: "home",
  operationalHints: [],
  compactText: ""
} as PortalAIContext;

describe("buildOperationalRouting", () => {
  it("routes invoice questions to invoices", () => {
    const intent = detectPortalIntent("No entiendo esta factura");
    const routing = buildOperationalRouting(intent, undefined, undefined, baseContext);

    expect(routing.href).toBe("/portal/invoices");
  });

  it("routes explicit document copy requests to documents", () => {
    const intent = detectPortalIntent("Necesito una copia del contrato");
    const routing = buildOperationalRouting(intent, undefined, undefined, baseContext);

    expect(routing.href).toBe("/portal/documents");
  });

  it("routes maintenance incidents to the incidents section", () => {
    const intent = detectPortalIntent("Tengo humedad en el baño");
    const routing = buildOperationalRouting(intent, undefined, undefined, baseContext);

    expect(routing.href).toBe("/portal/incidents");
  });

  it("routes service recommendations to services", () => {
    const intent = detectPortalIntent("Necesito internet");
    const routing = buildOperationalRouting(intent, undefined, undefined, baseContext);

    expect(routing.destination).toBe("services");
    expect(routing.href).toBe("/portal/services");
  });

  it("prefers an existing incident when a duplicate is detected", () => {
    const intent = detectPortalIntent("Tengo humedad en el baño");
    const routing = buildOperationalRouting(
      intent,
      {
        isPotentialDuplicate: true,
        confidence: 0.82,
        summary: "Hay una incidencia parecida abierta.",
        matches: [
          {
            id: "1",
            incidentId: "INC-001",
            title: "Humedad en baño principal",
            similarity: 0.82,
            reason: "Coincidencia fuerte",
            href: "/portal/incidents/1"
          }
        ]
      },
      undefined,
      baseContext
    );

    expect(routing.destination).toBe("incident_detail");
    expect(routing.href).toBe("/portal/incidents/1");
  });

  it("offers duplicate resolution actions when a likely duplicate exists", () => {
    const intent = detectPortalIntent("Tengo humedad en el baño otra vez");
    const routing = buildOperationalRouting(
      intent,
      {
        isPotentialDuplicate: true,
        confidence: 0.88,
        summary: "Ya existe una incidencia parecida abierta.",
        matches: [
          {
            id: "1",
            incidentId: "INC-001",
            title: "Humedad en baño principal",
            similarity: 0.88,
            reason: "Coincidencia fuerte",
            href: "/portal/incidents/1"
          }
        ]
      },
      undefined,
      baseContext
    );
    const actions = buildOperationalRoutingActions(routing, {
      isPotentialDuplicate: true,
      confidence: 0.88,
      summary: "Ya existe una incidencia parecida abierta.",
      matches: [
        {
          id: "1",
          incidentId: "INC-001",
          title: "Humedad en baño principal",
          similarity: 0.88,
          reason: "Coincidencia fuerte",
          href: "/portal/incidents/1"
        }
      ]
    }, {
      message: "Tengo humedad en el baño otra vez",
      incidentDraft: {
        title: "Humedad en baño",
        category: "Maintenance",
        priority: "Medium",
        urgency: "medium",
        description: "Humedad recurrente en baño"
      }
    });

    expect(actions.map((action) => action.type)).toEqual(["view_incident", "append_comment", "create_anyway"]);
    expect(actions[1]?.payload?.suggestedComment).toBe("Tengo humedad en el baño otra vez");
  });

  it("does not add duplicate-only actions when there is no duplicate", () => {
    const intent = detectPortalIntent("Tengo un problema nuevo con una ventana rota");
    const routing = buildOperationalRouting(intent, undefined, undefined, baseContext);
    const actions = buildOperationalRoutingActions(routing, undefined, {
      message: "Tengo un problema nuevo con una ventana rota"
    });

    expect(actions.some((action) => action.type === "append_comment")).toBe(false);
    expect(actions.some((action) => action.type === "create_anyway")).toBe(false);
  });
});
