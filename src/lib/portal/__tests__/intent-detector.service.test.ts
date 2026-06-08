import { describe, expect, it } from "vitest";
import { detectPortalIntent } from "@/lib/portal/intent-detector.service";

describe("detectPortalIntent", () => {
  it("classifies maintenance incidents with medium urgency", () => {
    const result = detectPortalIntent("Tengo humedad en el baño");

    expect(result.intent).toBe("maintenance_incident");
    expect(result.urgency).toBe("medium");
  });

  it("classifies urgent water incidents as high urgency", () => {
    const result = detectPortalIntent("Se está filtrando agua al vecino de abajo");

    expect(result.intent).toBe("urgent_incident");
    expect(result.urgency).toBe("high");
  });

  it("classifies gas issues as critical urgent incidents", () => {
    const result = detectPortalIntent("Hay olor a gas en la cocina");

    expect(result.intent).toBe("urgent_incident");
    expect(result.urgency).toBe("critical");
  });

  it("classifies invoice questions as low urgency", () => {
    const result = detectPortalIntent("No entiendo esta factura");

    expect(result.intent).toBe("invoice_question");
    expect(result.urgency).toBe("low");
  });

  it("classifies contract questions", () => {
    const result = detectPortalIntent("¿Cuándo vence mi contrato?");

    expect(result.intent).toBe("contract_question");
  });

  it("prioritizes document request over contract question when asking for a copy", () => {
    const result = detectPortalIntent("Necesito una copia del contrato");

    expect(result.intent).toBe("document_request");
  });

  it("classifies support requests", () => {
    const result = detectPortalIntent("Necesito contactar con soporte");

    expect(result.intent).toBe("support_request");
  });
});
