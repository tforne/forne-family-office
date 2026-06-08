import { describe, expect, it } from "vitest";
import type { PortalAIContext } from "@/lib/portal/portal-ai-context-builder";
import { detectOperationalEscalation } from "@/lib/portal/escalation-detector.service";
import { detectPortalIntent } from "@/lib/portal/intent-detector.service";

describe("detectOperationalEscalation", () => {
  it("marks gas incidents as urgent escalation", () => {
    const message = "Hay olor a gas en la cocina";
    const intent = detectPortalIntent(message);
    const result = detectOperationalEscalation(message, intent);

    expect(result.level).toBe("urgent");
    expect(result.shouldEscalate).toBe(true);
  });

  it("marks leak to downstairs neighbor as recommended or urgent", () => {
    const message = "Se está filtrando agua al vecino de abajo";
    const intent = detectPortalIntent(message);
    const result = detectOperationalEscalation(message, intent);

    expect(["recommended", "urgent"]).toContain(result.level);
  });

  it("does not over-escalate ordinary humidity", () => {
    const message = "Tengo humedad";
    const intent = detectPortalIntent(message);
    const result = detectOperationalEscalation(message, intent);

    expect(result.level).not.toBe("urgent");
  });

  it("marks repeated unresolved complaints as watch or recommended", () => {
    const message = "Tengo otra vez humedad y sigue igual";
    const intent = detectPortalIntent(message);
    const context = {
      propertyOperationalIntelligence: {
        fixedRealEstateNo: "RE-1",
        openIncidentCount: 1,
        totalIncidentCount: 1,
        operationalStatus: "active_attention",
        summary: "El inmueble ya tiene una incidencia abierta en seguimiento."
      }
    } as PortalAIContext;
    const result = detectOperationalEscalation(message, intent, undefined, context);

    expect(["watch", "recommended"]).toContain(result.level);
  });
});
