import { describe, expect, it } from "vitest";
import { portalIncidentCommentMaxLength, prepareIncidentComment } from "@/lib/portal/incident-comment-draft.service";

describe("prepareIncidentComment", () => {
  it("rejects empty comments after trimming", () => {
    const result = prepareIncidentComment("   ");

    expect(result.isValid).toBe(false);
    expect(result.comment).toBe("");
  });

  it("removes basic HTML tags from the submitted comment", () => {
    const result = prepareIncidentComment("<script>alert(1)</script> Sigue habiendo humedad");

    expect(result.isValid).toBe(true);
    expect(result.comment).not.toContain("<script>");
    expect(result.comment).toContain("Sigue habiendo humedad");
  });

  it("trims long comments to the portal maximum", () => {
    const result = prepareIncidentComment(`inicio ${"a".repeat(portalIncidentCommentMaxLength + 50)}`);

    expect(result.isValid).toBe(true);
    expect(result.comment.length).toBe(portalIncidentCommentMaxLength);
    expect(result.wasTrimmed).toBe(true);
  });
});
