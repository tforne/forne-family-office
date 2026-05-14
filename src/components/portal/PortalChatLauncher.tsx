"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";
import BrandIcon from "@/components/brand/BrandIcon";

type ChatLink = {
  href: string;
  label: string;
};

type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  content: string;
  links?: ChatLink[];
  canEscalate?: boolean;
  escalationSourceMessage?: string;
};

type ChatReply = {
  answer: string;
  links: ChatLink[];
  suggestions: string[];
  canEscalate?: boolean;
};

const welcomeMessage =
  "Puedo ayudarte con facturas, documentos, incidencias, avisos, perfil y el uso del portal. Elige una sugerencia o escribe tu consulta.";

function initialSuggestions(pathname: string) {
  if (pathname.startsWith("/portal/invoices")) {
    return [
      "Tengo facturas pendientes",
      "Como descargar una factura",
      "Como descargar las ultimas 3 facturas",
      "Como pido una copia de factura"
    ];
  }

  if (pathname.startsWith("/portal/incidents")) {
    return ["Quiero abrir una incidencia", "Que datos debo indicar en una incidencia", "Cuantas incidencias tengo abiertas"];
  }

  if (pathname.startsWith("/portal/documents")) {
    return [
      "Como descargar un documento",
      "Que documentos puedo descargar",
      "Como pido una copia de un documento",
      "Tengo documentos pendientes"
    ];
  }

  if (pathname.startsWith("/portal/incident-requests")) {
    return ["Que peticiones tengo pendientes", "Como se tramita una peticion", "Donde veo si una peticion genero incidencia"];
  }

  if (pathname.startsWith("/portal/notices")) {
    return ["Tengo avisos sin leer", "Que significa confirmacion requerida", "Donde reviso mis avisos"];
  }

  if (pathname.startsWith("/portal/profile")) {
    return ["Que datos puedo revisar aqui", "Que empresa usa el portal", "Como actualizo mis datos"];
  }

  return ["Resume mi situacion actual", "Tengo algo pendiente", "Que puedo hacer desde el portal"];
}

function titleForPath(pathname: string) {
  if (pathname.startsWith("/portal/invoices")) return "Asistente de facturas";
  if (pathname.startsWith("/portal/incidents")) return "Asistente de incidencias";
  if (pathname.startsWith("/portal/documents")) return "Asistente de documentos";
  if (pathname.startsWith("/portal/incident-requests")) return "Asistente de peticiones";
  if (pathname.startsWith("/portal/notices")) return "Asistente de avisos";
  if (pathname.startsWith("/portal/profile")) return "Asistente de perfil";
  return "Asistente del portal";
}

export default function PortalChatLauncher() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [sendingEscalationId, setSendingEscalationId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: welcomeMessage,
      links: [{ href: pathname || "/portal", label: "Seccion actual" }]
    }
  ]);
  const [suggestions, setSuggestions] = useState<string[]>(initialSuggestions(pathname || "/portal"));
  const bodyRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setSuggestions(initialSuggestions(pathname || "/portal"));
    setMessages((current) => {
      const next = [...current];
      const lastMessage = next[next.length - 1];

      if (lastMessage?.role === "assistant" && lastMessage.content === welcomeMessage) {
        lastMessage.links = [{ href: pathname || "/portal", label: "Seccion actual" }];
        return next;
      }

      next.push({
        id: `section-${pathname}`,
        role: "assistant",
        content: `Ahora mismo estas en ${titleForPath(pathname || "/portal").toLowerCase()}. Si quieres, puedo orientarte con esta seccion.`,
        links: [{ href: pathname || "/portal", label: "Abrir seccion actual" }]
      });
      return next;
    });
  }, [pathname]);

  useEffect(() => {
    if (!bodyRef.current) return;
    bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [messages, isOpen, pending]);

  const sendMessage = async (rawMessage: string) => {
    const message = rawMessage.trim();
    if (!message || pending) return;

    setPending(true);
    setError("");
    setMessages((current) => [...current, { id: `user-${Date.now()}`, role: "user", content: message }]);
    setInput("");

    try {
      const response = await fetch("/api/portal/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          page: pathname || "/portal"
        })
      });
      const payload = (await response.json().catch(() => ({}))) as { reply?: ChatReply; error?: string };

      if (!response.ok || !payload.reply) {
        throw new Error(payload.error || "No se pudo responder a la consulta.");
      }

      const reply = payload.reply;

      setMessages((current) => [
        ...current,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: reply.answer,
          links: reply.links,
          canEscalate: reply.canEscalate,
          escalationSourceMessage: reply.canEscalate ? message : undefined
        }
      ]);
      setSuggestions(reply.suggestions);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo responder a la consulta.");
    } finally {
      setPending(false);
    }
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await sendMessage(input);
  };

  const escalateByEmail = async (messageId: string, sourceMessage: string) => {
    if (!sourceMessage || pending || sendingEscalationId) return;

    setError("");
    setSendingEscalationId(messageId);

    try {
      const response = await fetch("/api/portal/chat/escalate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: sourceMessage,
          page: pathname || "/portal"
        })
      });
      const payload = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string };

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || "No se pudo enviar la consulta por correo.");
      }

      setMessages((current) => [
        ...current,
        {
          id: `assistant-mail-${Date.now()}`,
          role: "assistant",
          content: "He enviado tu consulta por correo a office@forne.family para que el equipo la revise.",
          links: [{ href: pathname || "/portal", label: "Seguir en esta seccion" }]
        }
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo enviar la consulta por correo.");
    } finally {
      setSendingEscalationId(null);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {isOpen ? (
        <div className="mb-3 w-[360px] max-w-[calc(100vw-2rem)] rounded-[24px] border border-forne-line bg-white p-5 shadow-[0_30px_70px_-35px_rgba(15,23,42,0.35)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-forne-muted">
                {titleForPath(pathname || "/portal")}
              </div>
              <div className="mt-2 text-lg font-semibold text-forne-ink">Ayuda contextual</div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-sm font-semibold text-forne-muted transition hover:text-forne-ink"
            >
              Cerrar
            </button>
          </div>

          <p className="mt-3 text-sm leading-6 text-forne-muted">
            Responde preguntas frecuentes del portal y te lleva a la accion mas util segun la seccion en la que estes.
          </p>

          <div
            ref={bodyRef}
            className="mt-4 max-h-[320px] space-y-3 overflow-y-auto rounded-[20px] bg-forne-cloud/35 p-3"
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={`rounded-2xl px-4 py-3 text-sm leading-6 ${
                  message.role === "assistant"
                    ? "mr-6 bg-white text-forne-muted shadow-sm"
                    : "ml-6 bg-forne-ink text-white"
                }`}
              >
                <div>{message.content}</div>
                {message.links?.length ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {message.links.map((link) => (
                      <Link
                        key={`${message.id}-${link.href}-${link.label}`}
                        href={link.href}
                        className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                          message.role === "assistant"
                            ? "bg-forne-cloud text-forne-ink hover:bg-white"
                            : "bg-white/10 text-white hover:bg-white/20"
                        }`}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                ) : null}
                {message.canEscalate && message.escalationSourceMessage ? (
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={() => void escalateByEmail(message.id, message.escalationSourceMessage || "")}
                      disabled={Boolean(sendingEscalationId)}
                      className="rounded-full bg-forne-ink px-3 py-2 text-xs font-semibold text-white transition hover:bg-forne-ink/90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {sendingEscalationId === message.id ? "Enviando correo..." : "Enviar duda por correo"}
                    </button>
                  </div>
                ) : null}
              </div>
            ))}
            {pending ? (
              <div className="mr-6 rounded-2xl bg-white px-4 py-3 text-sm text-forne-muted shadow-sm">
                Pensando la mejor respuesta para esta seccion...
              </div>
            ) : null}
          </div>

          {error ? (
            <div className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
              {error}
            </div>
          ) : null}

          <div className="mt-4">
            <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-forne-muted">
              Sugerencias rapidas
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => void sendMessage(suggestion)}
                  disabled={pending}
                  className="rounded-full border border-forne-line bg-white px-3 py-2 text-xs font-semibold text-forne-ink transition hover:bg-forne-cloud disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={onSubmit} className="mt-4 flex items-end gap-3">
            <label className="flex-1">
              <span className="sr-only">Escribe tu consulta</span>
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                rows={2}
                placeholder="Escribe tu pregunta sobre facturas, documentos, avisos, incidencias o perfil..."
                className="w-full resize-none rounded-2xl border border-forne-line bg-white px-4 py-3 text-sm text-forne-ink outline-none transition placeholder:text-forne-muted/75 focus:border-forne-ink"
              />
            </label>
            <button
              type="submit"
              disabled={pending || !input.trim()}
              className="inline-flex h-12 items-center justify-center rounded-2xl bg-forne-ink px-4 text-sm font-semibold text-white transition hover:bg-forne-ink/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Enviar
            </button>
          </form>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="inline-flex items-center gap-3 rounded-full bg-forne-ink px-4 py-3 text-sm font-semibold text-white shadow-[0_24px_50px_-26px_rgba(7,11,26,0.75)] transition hover:bg-forne-ink/90"
      >
        <BrandIcon name="guide" className="h-4 w-4" />
        <span>Chat portal</span>
      </button>
    </div>
  );
}
