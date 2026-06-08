import { describe, expect, it } from "vitest";
import { buildIncidentDraft } from "@/lib/portal/incident-draft.service";
import { detectPortalIntent } from "@/lib/portal/intent-detector.service";

describe("buildIncidentDraft", () => {
  it("builds a maintenance draft for humidity issues", () => {
    const message = "Tengo humedad en el baño y ahora también huele mal";
    const intent = detectPortalIntent(message);
    const draft = buildIncidentDraft(message, undefined, intent);

    expect(draft).not.toBeNull();
    expect(draft?.title).toBe("Humedad y mal olor en baño");
    expect(draft?.priority).toBe("Medium");
    expect(draft?.urgency).toBe("medium");
  });

  it("returns null for non-incident intents", () => {
    const message = "No entiendo esta factura";
    const intent = detectPortalIntent(message);
    const draft = buildIncidentDraft(message, undefined, intent);

    expect(draft).toBeNull();
  });
});
