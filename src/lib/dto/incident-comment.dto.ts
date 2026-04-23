export interface IncidentCommentDto {
  id: string;
  entryNo?: number;
  incidentId: string;
  incidentNo: string;
  commentDate: string | null;
  commentText: string | null;
  createdBy: string | null;
  source: string | null;
  isPublic: boolean;
  createdAt: string | null;
}
