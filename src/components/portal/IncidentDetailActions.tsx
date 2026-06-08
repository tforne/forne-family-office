"use client";

import { useState } from "react";
import type { IncidentDetailIntelligence } from "@/lib/portal/incident-detail-intelligence.service";
import type { PortalPostOperationIntelligence } from "@/lib/portal/post-operation-intelligence.service";

type Props = {
  incidentId: string;
  incidentTitle: string;
  actions: IncidentDetailIntelligence["actions"];
  relatedIncidents?: IncidentDetailIntelligence["relatedIncidents"];
};

type AttachmentResponse = {
  ok?: boolean;
  error?: string;
  warning?: string;
  postOperation?: PortalPostOperationIntelligence;
};

function scrollToElement(id: string) {
  if (typeof document === "undefined") return;
  const element = document.getElementById(id);
  if (!element) return;
  element.scrollIntoView({ behavior: "smooth", block: "start" });
}

function openHref(href?: string) {
  if (!href) return;
  if (href.startsWith("#")) {
    scrollToElement(href.replace(/^#/, ""));
    return;
  }
  window.location.href = href;
}

export default function IncidentDetailActions({
  incidentId,
  incidentTitle,
  actions = [],
  relatedIncidents = []
}: Props) {
  const [isCommentOpen, setIsCommentOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [commentStatus, setCommentStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [commentError, setCommentError] = useState("");
  const [isAttachmentOpen, setIsAttachmentOpen] = useState(false);
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [attachmentComment, setAttachmentComment] = useState("");
  const [attachmentStatus, setAttachmentStatus] = useState<"idle" | "uploading" | "sent" | "error">("idle");
  const [attachmentError, setAttachmentError] = useState("");
  const [attachmentWarning, setAttachmentWarning] = useState("");
  const [postOperation, setPostOperation] = useState<PortalPostOperationIntelligence | null>(null);

  const closeAttachmentFlow = () => {
    setIsAttachmentOpen(false);
    setAttachmentStatus("idle");
    setAttachmentError("");
    setAttachmentWarning("");
  };

  const openCommentFlow = (suggestedComment?: string) => {
    setIsCommentOpen(true);
    setComment(suggestedComment || "");
    setCommentStatus("idle");
    setCommentError("");
    closeAttachmentFlow();
  };

  const openAttachmentFlow = () => {
    setIsAttachmentOpen(true);
    setAttachmentStatus("idle");
    setAttachmentError("");
    setAttachmentWarning("");
    setIsCommentOpen(false);
    setCommentStatus("idle");
    setCommentError("");
  };

  const submitComment = async () => {
    if (!comment.trim() || commentStatus === "sending") return;

    setCommentStatus("sending");
    setCommentError("");
    setPostOperation(null);

    try {
      const response = await fetch(`/api/incidents/${encodeURIComponent(incidentId)}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment })
      });
      const payload = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string };

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || "No se ha podido añadir el comentario.");
      }

      setComment("");
      setCommentStatus("sent");
      setIsCommentOpen(false);
    } catch (error) {
      setCommentStatus("error");
      setCommentError(error instanceof Error ? error.message : "No se ha podido añadir el comentario.");
    }
  };

  const submitAttachment = async () => {
    if (!attachmentFile || attachmentStatus === "uploading") return;

    setAttachmentStatus("uploading");
    setAttachmentError("");
    setAttachmentWarning("");
    setPostOperation(null);

    try {
      const formData = new FormData();
      formData.append("file", attachmentFile);
      if (attachmentComment.trim()) {
        formData.append("comment", attachmentComment.trim());
      }

      const response = await fetch(`/api/incidents/${encodeURIComponent(incidentId)}/attachments`, {
        method: "POST",
        body: formData
      });
      const payload = (await response.json().catch(() => ({}))) as AttachmentResponse;

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || "No se ha podido subir el archivo.");
      }

      setAttachmentStatus("sent");
      setAttachmentFile(null);
      setAttachmentComment("");
      setAttachmentWarning(payload.warning || "");
      setPostOperation(payload.postOperation || null);
      setIsAttachmentOpen(false);
    } catch (error) {
      setAttachmentStatus("error");
      setAttachmentError(error instanceof Error ? error.message : "No se ha podido subir el archivo.");
    }
  };

  const handlePostOperationAction = (actionType: string, payload?: Record<string, unknown>) => {
    if (actionType === "add_another_attachment") {
      openAttachmentFlow();
      scrollToElement("incident-overview");
      return;
    }

    if (actionType === "append_comment") {
      const suggestedComment = typeof payload?.suggestedComment === "string" ? payload.suggestedComment : "";
      openCommentFlow(suggestedComment);
      scrollToElement("incident-overview");
      return;
    }

    if (actionType === "view_incident") {
      const href = typeof payload?.href === "string" ? payload.href : "";
      if (href) {
        openHref(href);
        return;
      }
      scrollToElement("incident-overview");
    }
  };

  const handleAction = (actionType: string, href?: string) => {
    if (actionType === "append_comment") {
      openCommentFlow();
      return;
    }

    if (actionType === "attach_photo") {
      openAttachmentFlow();
      return;
    }

    if (actionType === "contact_support") {
      closeAttachmentFlow();
      setIsCommentOpen(false);
      scrollToElement("incident-contact");
      return;
    }

    if (actionType === "view_related_incidents" && href) {
      openHref(href);
      return;
    }

    openHref(href);
  };

  return (
    <div className="mt-4 rounded-[24px] border border-forne-line bg-white p-4">
      <div className="text-xs font-semibold uppercase tracking-[0.22em] text-forne-muted">Acciones recomendadas</div>
      <div className="mt-3 flex flex-wrap gap-2">
        {actions.map((action) => (
          <button
            key={`${action.type}-${action.label}`}
            type="button"
            onClick={() => handleAction(action.type, action.href)}
            className="inline-flex items-center gap-2 rounded-full bg-forne-ink px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-forne-ink/90"
          >
            <span>{action.label}</span>
          </button>
        ))}
      </div>

      {isAttachmentOpen ? (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-4">
          <div className="text-sm font-semibold text-forne-ink">Adjuntar archivo a la incidencia</div>
          <div className="mt-1 text-sm leading-6 text-forne-muted">
            El archivo solo se subirá a <span className="font-semibold text-forne-ink">{incidentTitle}</span> cuando confirmes la operación.
          </div>
          <input
            type="file"
            accept=".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf"
            onChange={(event) => {
              setAttachmentFile(event.target.files?.[0] || null);
              setAttachmentStatus("idle");
              setAttachmentError("");
              setAttachmentWarning("");
            }}
            className="mt-3 block w-full rounded-2xl border border-forne-line bg-white px-4 py-3 text-sm text-forne-ink file:mr-3 file:rounded-full file:border-0 file:bg-forne-cloud file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-forne-ink"
          />
          <div className="mt-2 text-xs leading-5 text-forne-muted">
            Formatos permitidos: JPG, PNG, WEBP o PDF. Tamaño máximo: 10 MB.
          </div>
          <textarea
            value={attachmentComment}
            onChange={(event) => setAttachmentComment(event.target.value)}
            className="ffo-portal-input mt-3 min-h-24 w-full rounded-2xl px-4 py-3 text-sm leading-6 text-forne-ink outline-none"
            placeholder="Comentario opcional para acompañar el archivo..."
            maxLength={1000}
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void submitAttachment()}
              disabled={!attachmentFile || attachmentStatus === "uploading"}
              className="ffo-portal-button rounded-2xl bg-forne-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-forne-ink/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {attachmentStatus === "uploading" ? "Subiendo archivo..." : "Subir archivo"}
            </button>
            <button
              type="button"
              onClick={closeAttachmentFlow}
              disabled={attachmentStatus === "uploading"}
              className="rounded-2xl border border-forne-line bg-white px-4 py-2 text-sm font-semibold text-forne-ink transition hover:bg-forne-cloud disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancelar
            </button>
          </div>
          {attachmentStatus === "error" ? (
            <div className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 px-3 py-3 text-sm text-rose-800">
              {attachmentError}
            </div>
          ) : null}
        </div>
      ) : null}

      {isCommentOpen ? (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-4">
          <div className="text-sm font-semibold text-forne-ink">Añadir comentario a la incidencia</div>
          <div className="mt-1 text-sm leading-6 text-forne-muted">
            El comentario se añadirá a <span className="font-semibold text-forne-ink">{incidentTitle}</span> solo cuando lo confirmes.
          </div>
          <textarea
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            className="ffo-portal-input mt-3 min-h-32 w-full rounded-2xl px-4 py-3 text-sm leading-6 text-forne-ink outline-none"
            placeholder="Escribe aquí el seguimiento que quieres añadir..."
            maxLength={1000}
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void submitComment()}
              disabled={commentStatus === "sending" || !comment.trim()}
              className="ffo-portal-button rounded-2xl bg-forne-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-forne-ink/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {commentStatus === "sending" ? "Enviando comentario..." : "Enviar comentario"}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsCommentOpen(false);
                setCommentStatus("idle");
                setCommentError("");
              }}
              disabled={commentStatus === "sending"}
              className="rounded-2xl border border-forne-line bg-white px-4 py-2 text-sm font-semibold text-forne-ink transition hover:bg-forne-cloud disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancelar
            </button>
          </div>
          {commentStatus === "error" ? (
            <div className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 px-3 py-3 text-sm text-rose-800">
              {commentError}
            </div>
          ) : null}
        </div>
      ) : null}

      {commentStatus === "sent" && !isCommentOpen ? (
        <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-800">
          Comentario añadido correctamente.
        </div>
      ) : null}

      {attachmentStatus === "sent" && !isAttachmentOpen ? (
        <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-800">
          Archivo añadido correctamente a la incidencia.
        </div>
      ) : null}

      {attachmentWarning ? (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-900">
          {attachmentWarning}
        </div>
      ) : null}

      {postOperation ? (
        <div className="mt-4 rounded-2xl border border-forne-line bg-forne-cloud p-4">
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-forne-muted">Siguiente paso sugerido</div>
          <div className="mt-2 text-sm font-semibold text-forne-ink">{postOperation.title}</div>
          <div className="mt-2 text-sm leading-6 text-forne-muted">{postOperation.summary}</div>
          {postOperation.recommendedNextStep ? (
            <div className="mt-3 rounded-2xl bg-white px-3 py-3 text-sm leading-6 text-forne-muted">
              {postOperation.recommendedNextStep}
            </div>
          ) : null}
          {postOperation.actions.length ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {postOperation.actions.map((action) => (
                <button
                  key={`${action.type}-${action.label}`}
                  type="button"
                  onClick={() => handlePostOperationAction(action.type, action.payload)}
                  className="inline-flex items-center gap-2 rounded-full bg-forne-ink px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-forne-ink/90"
                >
                  {action.label}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      {relatedIncidents.length ? (
        <div className="mt-4 rounded-2xl bg-forne-cloud p-4">
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-forne-muted">Incidencias relacionadas</div>
          <div className="mt-3 flex flex-col gap-2">
            {relatedIncidents.map((related) => (
              <button
                key={related.id}
                type="button"
                onClick={() => {
                  window.location.href = related.href;
                }}
                className="rounded-2xl bg-white px-3 py-3 text-left text-sm font-medium text-forne-ink transition hover:bg-slate-50"
              >
                {related.title}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
