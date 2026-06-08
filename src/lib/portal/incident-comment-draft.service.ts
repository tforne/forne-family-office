export const portalIncidentCommentMaxLength = 1000;

function sanitizeCommentValue(comment: string) {
  return comment.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export function prepareIncidentComment(comment: string) {
  const sanitized = sanitizeCommentValue(comment || "");
  if (!sanitized) {
    return {
      comment: "",
      isValid: false,
      wasTrimmed: false
    };
  }

  const trimmed = sanitized.slice(0, portalIncidentCommentMaxLength).trim();

  return {
    comment: trimmed,
    isValid: Boolean(trimmed),
    wasTrimmed: trimmed.length < sanitized.length
  };
}
