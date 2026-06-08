import { describe, expect, it } from "vitest";
import { buildIncidentTimeline } from "@/lib/portal/incident-timeline.service";

describe("buildIncidentTimeline", () => {
  it("includes a created event when the incident has a visible creation date", () => {
    const result = buildIncidentTimeline({
      incident: {
        id: "inc-1",
        incidentId: "INC-001",
        title: "Humedad en baño",
        description: "Descripción",
        incidentDate: "2026-06-07T09:12:00Z",
        stateCode: "Active",
        statusCode: "Open"
      }
    });

    expect(result.some((entry) => entry.type === "created")).toBe(true);
  });

  it("turns comments and attachments into timeline entries sorted by newest first", () => {
    const result = buildIncidentTimeline({
      incident: {
        id: "inc-1",
        incidentId: "INC-001",
        title: "Humedad en baño",
        incidentDate: "2026-06-07T09:12:00Z"
      },
      comments: [
        {
          id: "comment-1",
          incidentId: "inc-1",
          incidentNo: "INC-001",
          commentText: "Sigue habiendo humedad",
          commentDate: "2026-06-07T09:15:00Z",
          createdBy: "Tenant",
          isPublic: true
        }
      ],
      attachments: [
        {
          id: "att-1",
          filename: "humedad.jpg",
          uploadedAt: "2026-06-07T09:14:00Z",
          href: "https://example.com/humedad.jpg"
        }
      ]
    });

    expect(result[0].type).toBe("comment");
    expect(result[1].type).toBe("attachment");
    expect(result.some((entry) => entry.title.includes("humedad.jpg"))).toBe(true);
  });

  it("sanitizes user text and avoids duplicate entries", () => {
    const result = buildIncidentTimeline({
      incident: {
        id: "inc-1",
        incidentId: "INC-001",
        title: "Incidencia",
        incidentDate: "2026-06-07T09:12:00Z"
      },
      comments: [
        {
          id: "comment-1",
          incidentId: "inc-1",
          incidentNo: "INC-001",
          commentText: "<script>alert(1)</script> Sigue igual",
          commentDate: "2026-06-07T09:15:00Z",
          createdBy: "Tenant",
          isPublic: true
        },
        {
          id: "comment-2",
          incidentId: "inc-1",
          incidentNo: "INC-001",
          commentText: "<script>alert(1)</script> Sigue igual",
          commentDate: "2026-06-07T09:15:00Z",
          createdBy: "Tenant",
          isPublic: true
        }
      ]
    });

    const commentEntries = result.filter((entry) => entry.type === "comment");
    expect(commentEntries).toHaveLength(1);
    expect(commentEntries[0].description).not.toContain("<script>");
  });

  it("handles missing dates without crashing", () => {
    const result = buildIncidentTimeline({
      incident: {
        id: "inc-1",
        incidentId: "INC-001",
        title: "Incidencia sin fechas"
      },
      attachments: [{ id: "att-1", filename: "evidencia.pdf" }]
    });

    expect(result.some((entry) => entry.type === "attachment")).toBe(true);
  });
});
