import { describe, expect, it } from "vitest";
import type { IncidentDto } from "@/lib/dto/incident.dto";
import type { PortalAIContext } from "@/lib/portal/portal-ai-context-builder";
import { detectDuplicateIncidents } from "@/lib/portal/duplicate-incident-detector.service";
import { detectOperationalEscalation } from "@/lib/portal/escalation-detector.service";
import { detectPortalIntent } from "@/lib/portal/intent-detector.service";

function incident(overrides: Partial<IncidentDto>): IncidentDto {
  return {
    id: "1",
    incidentId: "INC-001",
    incidentDate: "2026-06-01",
    title: "Humedad en baño principal",
    description: "Humedad persistente en el baño",
    refDescription: "Piso principal",
    caseType: "Problem",
    priority: "High",
    stateCode: "Active",
    statusCode: "Open",
    customerNo: "C0001",
    contractNo: "CTR-1",
    fixedRealEstateNo: "RE-1",
    contactName: null,
    contactPhoneNo: null,
    contactEmail: null,
    createdOn: "2026-06-01",
    modifiedOn: "2026-06-02",
    followupBy: null,
    expectedResolutionDate: null,
    resolutionDate: null,
    ...overrides
  };
}

function context(overrides?: Partial<PortalAIContext>): PortalAIContext {
  return {
    page: "/portal",
    pageType: "home",
    property: { fixedRealEstateNo: "RE-1" },
    contract: { contractNo: "CTR-1" },
    operationalHints: [],
    compactText: "",
    ...overrides
  } as PortalAIContext;
}

describe("detectDuplicateIncidents", () => {
  it("detects a strong duplicate for the same property and open incident", () => {
    const message = "Tengo humedad en el baño";
    const intent = detectPortalIntent(message);
    const result = detectDuplicateIncidents(message, [incident({})], context(), intent);

    expect(result.isPotentialDuplicate).toBe(true);
    expect(result.confidence).toBeGreaterThanOrEqual(0.65);
  });

  it("does not flag unrelated invoice questions as duplicates", () => {
    const message = "No entiendo esta factura";
    const intent = detectPortalIntent(message);
    const result = detectDuplicateIncidents(message, [incident({})], context(), intent);

    expect(result.isPotentialDuplicate).toBe(false);
  });

  it("reduces confidence when the similar incident belongs to a different property", () => {
    const message = "Tengo humedad en el baño";
    const intent = detectPortalIntent(message);
    const result = detectDuplicateIncidents(
      message,
      [incident({ fixedRealEstateNo: "RE-9", contractNo: "CTR-9" })],
      context(),
      intent
    );

    expect(result.isPotentialDuplicate).toBe(false);
    expect(result.confidence).toBeLessThan(0.65);
  });

  it("reduces confidence for closed incidents", () => {
    const message = "Tengo humedad en el baño";
    const intent = detectPortalIntent(message);
    const result = detectDuplicateIncidents(
      message,
      [incident({ stateCode: "Closed", resolutionDate: "2026-06-05" })],
      context(),
      intent
    );

    expect(result.isPotentialDuplicate).toBe(false);
  });

  it("detects repeated unresolved complaints and combines well with escalation", () => {
    const message = "Tengo otra vez humedad y sigue igual";
    const intent = detectPortalIntent(message);
    const duplicate = detectDuplicateIncidents(message, [incident({})], context(), intent);
    const escalation = detectOperationalEscalation(message, intent, duplicate, context());

    expect(duplicate.isPotentialDuplicate).toBe(true);
    expect(["recommended", "urgent"]).toContain(escalation.level);
  });
});
