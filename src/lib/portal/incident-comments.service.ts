import { env } from "@/lib/config/env";
import { bcGet } from "@/lib/bc/client";
import { bcEndpoints } from "@/lib/bc/endpoints";
import { guidEqFilter, odataQuery, unwrap } from "@/lib/bc/odata";
import type { IncidentCommentDto } from "@/lib/dto/incident-comment.dto";

type CommentPayload = { value?: IncidentCommentDto[] };

function endpoint() {
  return env.bcIncidentCommentsEndpoint || bcEndpoints.incidentComments;
}

function normalizeComment(comment: Partial<IncidentCommentDto>): IncidentCommentDto {
  return {
    id: comment.id || "",
    entryNo: comment.entryNo,
    incidentId: comment.incidentId || "",
    incidentNo: comment.incidentNo || "",
    commentDate: comment.commentDate || null,
    commentText: comment.commentText || null,
    createdBy: comment.createdBy || null,
    source: comment.source || null,
    isPublic: Boolean(comment.isPublic),
    createdAt: comment.createdAt || null
  };
}

async function fetchCommentsByIncidentNo(incidentNo: string) {
  const payload = await bcGet<CommentPayload>(
    endpoint(),
    odataQuery({
      filter: guidEqFilter("incidentNo", incidentNo),
      orderBy: "commentDate desc",
      top: 100
    })
  );

  return unwrap(payload).map(normalizeComment);
}

function sortNewestFirst(comments: IncidentCommentDto[]) {
  return comments.sort((a, b) => {
    const left = a.commentDate || a.createdAt || "";
    const right = b.commentDate || b.createdAt || "";
    return right.localeCompare(left);
  });
}

export async function getIncidentComments(incidentNo: string, alternativeIncidentNo?: string) {
  if (env.useMockApi) return [];

  const candidates = [incidentNo, alternativeIncidentNo]
    .map((value) => value?.trim())
    .filter((value): value is string => Boolean(value));

  for (const candidate of candidates) {
    const comments = await fetchCommentsByIncidentNo(candidate);
    if (comments.length > 0) return sortNewestFirst(comments);
  }

  return [];
}
