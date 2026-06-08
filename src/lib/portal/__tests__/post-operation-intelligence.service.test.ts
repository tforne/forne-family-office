import { describe, expect, it } from "vitest";
import { buildPostOperationIntelligence } from "@/lib/portal/post-operation-intelligence.service";

describe("buildPostOperationIntelligence", () => {
  it("builds review-first intelligence after creating an incident", () => {
    const result = buildPostOperationIntelligence({
      kind: "incident_created",
      incident: {
        id: "record-1",
        incidentId: "INC-200",
        title: "Humedad en baño principal",
        priority: "High",
        contractNo: "CTR-10"
      },
      attachmentCount: 0
    });

    expect(result.kind).toBe("incident_created");
    expect(result.actions.map((action) => action.type)).toEqual(["view_incident"]);
    expect(result.links[0]?.href).toBe("/portal/incidents/record-1");
    expect(result.recommendedNextStep).toContain("prioridad");
    expect(result.checklist.some((item) => item.includes("CTR-10"))).toBe(true);
  });

  it("builds post-comment intelligence with manual follow-up options", () => {
    const result = buildPostOperationIntelligence({
      kind: "incident_commented",
      incident: {
        id: "record-2",
        incidentId: "INC-201",
        title: "Filtración en cocina",
        priority: "Normal"
      },
      commentText: "Sigue entrando agua por la cocina cuando llueve y ahora afecta al armario."
    });

    expect(result.kind).toBe("incident_commented");
    expect(result.actions.map((action) => action.type)).toEqual(["view_incident", "append_comment"]);
    expect(result.summary).toContain("INC-201");
    expect(result.links[0]?.label).toBe("Abrir incidencia actualizada");
  });
});
