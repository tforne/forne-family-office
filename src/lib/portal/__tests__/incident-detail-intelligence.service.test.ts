import { describe, expect, it } from "vitest";
import { buildIncidentDetailIntelligence } from "@/lib/portal/incident-detail-intelligence.service";

describe("buildIncidentDetailIntelligence", () => {
  it("builds an open humidity incident summary", () => {
    const result = buildIncidentDetailIntelligence({
      incident: {
        id: "inc-1",
        incidentId: "INC-001",
        title: "Humedad persistente en baño",
        description: "Hay humedad y mal olor desde hace varios días.",
        priority: "Medium",
        stateCode: "Active",
        incidentDate: new Date(Date.now() - 3 * 86400000).toISOString(),
        followupBy: new Date(Date.now() + 2 * 86400000).toISOString()
      },
      comments: [
        {
          id: "c-1",
          incidentId: "inc-1",
          incidentNo: "INC-001",
          commentDate: new Date(Date.now() - 1 * 86400000).toISOString(),
          commentText: "Sigue habiendo humedad.",
          createdBy: "Tenant",
          source: "TenantPortal",
          isPublic: true,
          createdAt: new Date(Date.now() - 1 * 86400000).toISOString()
        }
      ]
    });

    expect(result.title).toBe("Resumen IA de incidencia");
    expect(result.detectedProblem).toContain("Humedad");
    expect(result.operationalStatus).toBe("En seguimiento");
    expect(result.latestActivity).toContain("Comentario añadido");
    expect(result.recommendedNextStep).toContain("cronología");
  });

  it("flags repeated issues when related incidents exist", () => {
    const result = buildIncidentDetailIntelligence({
      incident: {
        id: "inc-2",
        incidentId: "INC-002",
        title: "Humedad en baño principal",
        description: "Problema recurrente",
        priority: "Normal",
        stateCode: "Active",
        incidentDate: new Date(Date.now() - 10 * 86400000).toISOString(),
        contractNo: "CTR-01",
        fixedRealEstateNo: "PROP-01"
      },
      relatedIncidents: [
        {
          id: "inc-old",
          incidentId: "INC-0004",
          title: "Humedad en baño",
          description: "Caso anterior",
          priority: "Normal",
          stateCode: "Closed",
          contractNo: "CTR-01",
          fixedRealEstateNo: "PROP-01",
          incidentDate: new Date(Date.now() - 20 * 86400000).toISOString()
        }
      ]
    });

    expect(result.repeatedIssue).toBe(true);
    expect(result.operationalRisk).toContain("recurrente");
    expect(result.relatedIncidents?.[0]?.href).toBe("/portal/incidents/inc-old");
  });

  it("marks urgent operational risk for critical issues", () => {
    const result = buildIncidentDetailIntelligence({
      incident: {
        id: "inc-3",
        incidentId: "INC-003",
        title: "Olor a gas en cocina",
        description: "Parece una fuga y es urgente.",
        priority: "High",
        stateCode: "Active",
        incidentDate: new Date(Date.now() - 1 * 86400000).toISOString()
      }
    });

    expect(result.operationalStatus).toBe("Urgente");
    expect(result.escalationLevel).toBe("Urgente");
    expect(result.operationalRisk).toContain("Riesgo alto");
  });

  it("marks recently resolved incidents accordingly", () => {
    const result = buildIncidentDetailIntelligence({
      incident: {
        id: "inc-4",
        incidentId: "INC-004",
        title: "Ventana reparada",
        description: "Incidencia cerrada",
        priority: "Low",
        stateCode: "Closed",
        incidentDate: new Date(Date.now() - 7 * 86400000).toISOString(),
        resolutionDate: new Date(Date.now() - 1 * 86400000).toISOString()
      }
    });

    expect(result.operationalStatus).toBe("Resuelto recientemente");
    expect(result.actions?.map((action) => action.type)).toEqual(["view_related_incidents"]);
  });

  it("handles missing comments safely", () => {
    const result = buildIncidentDetailIntelligence({
      incident: {
        id: "inc-5",
        incidentId: "INC-005",
        title: "Nueva incidencia sin seguimiento",
        description: "Pendiente",
        priority: "Normal",
        stateCode: "Active",
        incidentDate: new Date().toISOString()
      },
      comments: []
    });

    expect(result.timelineSummary?.some((line) => line.includes("Todavía no hay comentarios visibles"))).toBe(true);
    expect(result.operationalStatus).toBe("Nuevo");
  });

  it("uses visible attachments in latest activity and timeline summary", () => {
    const result = buildIncidentDetailIntelligence({
      incident: {
        id: "inc-6",
        incidentId: "INC-006",
        title: "Seguimiento con adjuntos",
        description: "Se ha añadido documentación",
        priority: "Normal",
        stateCode: "Active",
        incidentDate: new Date(Date.now() - 2 * 86400000).toISOString()
      },
      attachments: [
        {
          id: "att-1",
          filename: "humedad.jpg",
          uploadedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
        }
      ]
    });

    expect(result.latestActivity).toContain("Archivo adjuntado");
    expect(result.timelineSummary?.some((line) => line.includes("Último archivo adjuntado"))).toBe(true);
  });
});
