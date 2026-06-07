import type { PortalIncidentDraft, PortalIntentMetadata } from "@/lib/portal/chat-assistant";

export const portalIncidentReviewDraftKey = "ffo_portal_incident_review_draft";
export const portalIncidentReviewDraftQueryKey = "draft";
export const portalIncidentReviewDraftQueryValue = "chat";

export type PortalIncidentReviewDraft = {
  source: "chat";
  createdAt: string;
  title: string;
  description: string;
  priority: "Normal" | "High" | "Low";
  caseType: "Problem" | "Request" | "Question";
  incidentDraft: PortalIncidentDraft;
  intent?: PortalIntentMetadata;
};

export function mapIncidentDraftPriorityToCasePriority(priority: PortalIncidentDraft["priority"]): PortalIncidentReviewDraft["priority"] {
  if (priority === "Critical" || priority === "High") return "High";
  if (priority === "Low") return "Low";
  return "Normal";
}

export function buildIncidentReviewDraft(
  incidentDraft: PortalIncidentDraft,
  intent?: PortalIntentMetadata
): PortalIncidentReviewDraft {
  return {
    source: "chat",
    createdAt: new Date().toISOString(),
    title: incidentDraft.title,
    description: incidentDraft.description,
    priority: mapIncidentDraftPriorityToCasePriority(incidentDraft.priority),
    caseType: "Problem",
    incidentDraft,
    intent
  };
}
