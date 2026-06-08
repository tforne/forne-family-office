import { env } from "@/lib/config/env";
import { bcGetForCompany, bcPostForCompany, type BusinessCentralCompanyRef } from "@/lib/bc/client";
import { bcEndpoints } from "@/lib/bc/endpoints";
import { guidEqFilter, odataQuery, unwrap } from "@/lib/bc/odata";
import { prepareIncidentComment } from "./incident-comment-draft.service";
import { resolvePortalUserContext } from "./user-context";
import type { IncidentCommentDto } from "@/lib/dto/incident-comment.dto";

type CommentPayload = { value?: IncidentCommentDto[] };
type CreateCommentPayload = Partial<IncidentCommentDto> & {
  commentText?: string | null;
  incidentNo?: string | null;
  incidentId?: string | null;
  createdBy?: string | null;
  portalUserEmail?: string | null;
  source?: string | null;
  isPublic?: boolean | null;
};

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

async function fetchCommentsByIncidentNo(company: BusinessCentralCompanyRef, incidentNo: string) {
  const payload = await bcGetForCompany<CommentPayload>(
    company,
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
  const user = await resolvePortalUserContext();
  const company = { companyId: user.bcCompanyId, companyName: user.bcCompanyName };

  const candidates = [incidentNo, alternativeIncidentNo]
    .map((value) => value?.trim())
    .filter((value): value is string => Boolean(value));

  for (const candidate of candidates) {
    const comments = await fetchCommentsByIncidentNo(company, candidate);
    if (comments.length > 0) return sortNewestFirst(comments);
  }

  return [];
}

export async function createIncidentComment(input: {
  incidentId?: string | null;
  incidentNo: string;
  comment: string;
}) {
  const prepared = prepareIncidentComment(input.comment);

  if (!prepared.isValid) {
    throw new Error("Escribe un comentario antes de enviarlo.");
  }

  const normalizedIncidentNo = input.incidentNo?.trim();
  if (!normalizedIncidentNo) {
    throw new Error("No se ha encontrado la incidencia a la que quieres añadir el comentario.");
  }

  const user = await resolvePortalUserContext();
  const company = { companyId: user.bcCompanyId, companyName: user.bcCompanyName };

  if (env.useMockApi) {
    return normalizeComment({
      id: `mock-comment-${Date.now()}`,
      incidentId: input.incidentId?.trim() || "",
      incidentNo: normalizedIncidentNo,
      commentDate: new Date().toISOString(),
      commentText: prepared.comment,
      createdBy: user.customerName || user.email || user.customerNo,
      source: "TenantPortal",
      isPublic: true,
      createdAt: new Date().toISOString()
    });
  }

  const created = await bcPostForCompany<CreateCommentPayload>(company, endpoint(), {
    incidentNo: normalizedIncidentNo,
    incidentId: input.incidentId?.trim() || undefined,
    commentText: prepared.comment,
    createdBy: user.customerName || user.email || user.customerNo,
    portalUserEmail: user.email || undefined,
    source: "TenantPortal",
    isPublic: true
  });

  return normalizeComment({
    ...created,
    incidentId: created.incidentId || input.incidentId?.trim() || "",
    incidentNo: created.incidentNo || normalizedIncidentNo,
    commentText: created.commentText || prepared.comment,
    createdBy: created.createdBy || user.customerName || user.email || user.customerNo,
    source: created.source || "TenantPortal",
    isPublic: typeof created.isPublic === "boolean" ? created.isPublic : true,
    commentDate: created.commentDate || new Date().toISOString(),
    createdAt: created.createdAt || new Date().toISOString()
  });
}
