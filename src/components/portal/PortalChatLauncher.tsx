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

type ChatHistoryPayload = {
  role: "assistant" | "user";
  content: string;
};

type ActivePageContext = {
  pageTitle?: string;
  pageSummary?: string;
  pageEyebrow?: string;
  visibleFacts?: Array<{
    label: string;
    value: string;
    helper?: string;
  }>;
};

const welcomeMessage =
  "Puedo ayudarte con facturas, documentos, incidencias, avisos, perfil y el uso del portal. Elige una sugerencia o escribe tu consulta.";

const assistantRoleLabel = "Asistente Forne";
const userRoleLabel = "Tu consulta";

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
    return [
      "Que peticiones tengo pendientes",
      "Donde veo la respuesta de una peticion",
      "Como ver el texto completo de la respuesta",
      "Donde veo si una peticion genero incidencia"
    ];
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

function contextSummaryForPath(pathname: string) {
  if (pathname.startsWith("/portal/invoices")) return "Resuelve dudas de cobros, descargas, copias y facturas pendientes.";
  if (pathname.startsWith("/portal/incidents")) return "Te orienta para abrir, seguir y entender incidencias activas.";
  if (pathname.startsWith("/portal/documents")) return "Encuentra documentos, copias y accesos directos sin salir del portal.";
  if (pathname.startsWith("/portal/incident-requests")) return "Aclara el estado de peticiones y sus respuestas relacionadas.";
  if (pathname.startsWith("/portal/notices")) return "Te ayuda a revisar avisos importantes y acciones pendientes.";
  if (pathname.startsWith("/portal/profile")) return "Responde dudas sobre tus datos, empresa y uso del perfil.";
  return "Atiende preguntas frecuentes y te lleva a la siguiente accion mas util.";
}

function suggestionHeadingForPath(pathname: string) {
  if (pathname.startsWith("/portal/invoices")) return "Atajos de facturacion";
  if (pathname.startsWith("/portal/incidents")) return "Atajos de incidencias";
  if (pathname.startsWith("/portal/documents")) return "Atajos de documentacion";
  if (pathname.startsWith("/portal/incident-requests")) return "Atajos de peticiones";
  if (pathname.startsWith("/portal/notices")) return "Atajos de avisos";
  if (pathname.startsWith("/portal/profile")) return "Atajos de perfil";
  return "Sugerencias rapidas";
}

function serviceHighlightsForPath(pathname: string) {
  if (pathname.startsWith("/portal/invoices")) return ["Vencimientos", "Descargas", "Copias"];
  if (pathname.startsWith("/portal/incidents")) return ["Apertura", "Seguimiento", "Contacto"];
  if (pathname.startsWith("/portal/documents")) return ["Descargas", "Copias", "Localizacion"];
  if (pathname.startsWith("/portal/incident-requests")) return ["Respuestas", "Referencias", "Seguimiento"];
  if (pathname.startsWith("/portal/notices")) return ["Lecturas", "Confirmaciones", "Prioridades"];
  if (pathname.startsWith("/portal/profile")) return ["Acceso", "Cliente", "Entorno"];
  return ["Prioridades", "Orientacion", "Escalado"];
}

function readElementText(element: Element | null | undefined) {
  return element?.textContent?.replace(/\s+/g, " ").trim() || "";
}

function collectVisibleFacts(root: Element | null | undefined) {
  if (!root) return [];

  const labels = Array.from(root.querySelectorAll('[class*="uppercase"]'));
  const facts: Array<{ label: string; value: string; helper?: string }> = [];
  const seen = new Set<string>();

  for (const labelElement of labels) {
    const label = readElementText(labelElement);
    if (!label || label.length > 48) continue;

    const container = labelElement.parentElement;
    if (!container) continue;

    const children = Array.from(container.children);
    const labelIndex = children.indexOf(labelElement as HTMLElement);
    if (labelIndex < 0) continue;

    const valueElement = children
      .slice(labelIndex + 1)
      .find((child) => !child.matches('[class*="uppercase"]') && readElementText(child));

    const value = readElementText(valueElement);
    if (!value || value.length > 140) continue;

    const helperElement = children
      .slice(labelIndex + 1)
      .find((child) => child !== valueElement && !child.matches('[class*="uppercase"]') && readElementText(child));

    const helper = readElementText(helperElement);
    const signature = `${label}::${value}`;
    if (seen.has(signature)) continue;

    seen.add(signature);
    facts.push({
      label,
      value,
      helper: helper && helper !== value ? helper : undefined
    });

    if (facts.length >= 10) break;
  }

  return facts;
}

function readActivePageContext(): ActivePageContext {
  if (typeof document === "undefined") return {};

  const main = document.querySelector("main");
  const heading = document.querySelector("main h1, h1");
  const summary = heading?.parentElement?.querySelector("p");
  const eyebrow = heading?.parentElement?.querySelector('[class*="uppercase"]');

  return {
    pageTitle: heading?.textContent?.trim() || undefined,
    pageSummary: summary?.textContent?.trim() || undefined,
    pageEyebrow: eyebrow?.textContent?.trim() || undefined,
    visibleFacts: collectVisibleFacts(main)
  };
}

export default function PortalChatLauncher() {
  const pathname = usePathname();
  const currentPath = pathname || "/portal";
  const title = titleForPath(currentPath);
  const contextSummary = contextSummaryForPath(currentPath);
  const suggestionHeading = suggestionHeadingForPath(currentPath);
  const serviceHighlights = serviceHighlightsForPath(currentPath);

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
      links: [{ href: currentPath, label: "Seccion actual" }]
    }
  ]);
  const [suggestions, setSuggestions] = useState<string[]>(initialSuggestions(currentPath));
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const hasConversation = messages.some((message) => message.role === "user");

  useEffect(() => {
    setSuggestions(initialSuggestions(currentPath));
    setMessages((current) => {
      const next = [...current];
      const lastMessage = next[next.length - 1];

      if (lastMessage?.role === "assistant" && lastMessage.content === welcomeMessage) {
        lastMessage.links = [{ href: currentPath, label: "Seccion actual" }];
        return next;
      }

      next.push({
        id: `section-${currentPath}`,
        role: "assistant",
        content: `Ahora mismo estas en ${titleForPath(currentPath).toLowerCase()}. Si quieres, puedo orientarte con esta seccion.`,
        links: [{ href: currentPath, label: "Abrir seccion actual" }]
      });
      return next;
    });
  }, [currentPath]);

  useEffect(() => {
    if (!bodyRef.current) return;
    bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [messages, isOpen, pending]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const shell = document.getElementById("portal-main-shell");
    const content = document.getElementById("portal-main-content");

    const syncDockLayout = () => {
      const shouldDock = isOpen && window.innerWidth >= 1024;

      if (shell) {
        shell.style.marginRight = shouldDock ? "430px" : "";
      }

      if (content) {
        content.style.maxWidth = shouldDock ? "calc(100% - 1rem)" : "";
      }
    };

    syncDockLayout();
    window.addEventListener("resize", syncDockLayout);

    return () => {
      window.removeEventListener("resize", syncDockLayout);
      if (shell) shell.style.marginRight = "";
      if (content) content.style.maxWidth = "";
    };
  }, [isOpen]);

  const sendMessage = async (rawMessage: string) => {
    const message = rawMessage.trim();
    if (!message || pending) return;

    setPending(true);
    setError("");
    const history = messages
      .filter((item) => item.id !== "welcome")
      .slice(-5)
      .map<ChatHistoryPayload>((item) => ({ role: item.role, content: item.content }));
    const activePageContext = readActivePageContext();
    setMessages((current) => [...current, { id: `user-${Date.now()}`, role: "user", content: message }]);
    setInput("");

    try {
      const response = await fetch("/api/portal/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          page: currentPath,
          history,
          pageContext: activePageContext
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
          page: currentPath
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
          links: [{ href: currentPath, label: "Seguir en esta seccion" }]
        }
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo enviar la consulta por correo.");
    } finally {
      setSendingEscalationId(null);
    }
  };

  return (
    <div className="fixed bottom-3 right-3 z-50 sm:bottom-5 sm:right-5 lg:bottom-0 lg:right-0 lg:top-0">
      {isOpen ? (
        <div className="ffo-fade-up mb-2 flex h-[min(720px,calc(100dvh-1rem))] w-[min(420px,calc(100vw-0.5rem))] max-w-[calc(100vw-0.5rem)] flex-col overflow-hidden rounded-[28px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(245,249,253,0.96)_100%)] shadow-[0_36px_95px_-42px_rgba(15,35,67,0.45)] backdrop-blur-xl sm:mb-3 sm:w-[min(420px,calc(100vw-1rem))] sm:max-w-[calc(100vw-1rem)] lg:mb-0 lg:h-full lg:w-[430px] lg:max-w-[430px] lg:rounded-none lg:rounded-bl-[32px] lg:border-y-0 lg:border-r-0 lg:border-l-white/70 lg:shadow-[-16px_0_60px_-38px_rgba(15,35,67,0.2)]">
          <div className="ffo-portal-dark relative overflow-hidden px-4 pb-2.5 pt-3.5 text-white sm:px-5 sm:pb-3 lg:border-b lg:border-slate-200/80 lg:bg-[linear-gradient(180deg,rgba(248,251,255,0.98)_0%,rgba(241,246,251,0.96)_100%)] lg:px-4 lg:pb-2.5 lg:pt-3 lg:text-forne-ink">
            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-white/0 via-white/35 to-white/0 lg:via-slate-300/80" />
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/82 lg:border-slate-200/90 lg:bg-white lg:text-forne-muted lg:shadow-none">
                  <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_0_4px_rgba(110,231,183,0.14)] lg:shadow-[0_0_0_4px_rgba(52,211,153,0.12)]" />
                  Chat privado
                </div>
                <div className="mt-2.5 flex items-center gap-3 lg:mt-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.14)] ring-1 ring-white/10 lg:h-9 lg:w-9 lg:bg-forne-cloud lg:text-forne-ink lg:shadow-none lg:ring-0">
                    <BrandIcon name="guide" className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-base font-semibold tracking-tight text-white sm:text-lg lg:text-[17px] lg:text-forne-ink">{title}</div>
                    <div className="mt-0.5 text-[13px] text-slate-200/90 lg:text-[12px] lg:text-forne-muted">
                      Ayuda contextual con acceso directo a la seccion actual
                    </div>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full border border-white/12 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/88 transition hover:bg-white/15 lg:border-slate-300 lg:bg-white lg:px-3.5 lg:py-2 lg:text-forne-ink lg:hover:bg-slate-50"
              >
                Cerrar
              </button>
            </div>

            <div className="mt-3 lg:mt-2.5">
              <p className="max-w-[28rem] text-[13px] leading-5 text-slate-200/88 lg:max-w-none lg:text-[12px] lg:leading-5 lg:text-forne-muted">
                {contextSummary}
              </p>
              <div className="mt-2.5 flex flex-wrap gap-2 lg:mt-2">
                {serviceHighlights.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-white/10 bg-white/8 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/72 lg:border-slate-200/90 lg:bg-white/90 lg:px-2.5 lg:py-1 lg:text-[10px] lg:text-forne-muted"
                  >
                    {item}
                  </span>
                ))}
                <span className="rounded-full border border-white/10 bg-white/8 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/72 lg:border-slate-200/90 lg:bg-white/90 lg:px-2.5 lg:py-1 lg:text-[10px] lg:text-forne-muted">
                  Escalado humano
                </span>
              </div>
            </div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col gap-3 p-3 sm:gap-3.5 sm:p-4 lg:gap-4 lg:p-4">
            <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[24px] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(244,248,252,0.92)_0%,rgba(255,255,255,0.98)_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
              <div className="border-b border-slate-200/80 px-4 py-2.5">
                <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-forne-muted">Conversacion</div>
                <div className="mt-1 text-xs leading-5 text-forne-muted">
                  {hasConversation ? "Sigue el hilo desde aqui y usa los atajos solo si te ayudan." : "Empieza con una sugerencia o escribe tu consulta directamente."}
                </div>
              </div>
              <div ref={bodyRef} className="min-h-0 flex-1 space-y-2.5 overflow-y-auto px-3 py-3 sm:px-4 lg:space-y-3" aria-live="polite">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.role === "assistant" ? "pr-4" : "justify-end pl-4"}`}
                  >
                    {message.role === "assistant" ? (
                      <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl bg-forne-ink text-white shadow-[0_18px_32px_-20px_rgba(15,31,55,0.85)]">
                        <BrandIcon name="guide" className="h-3.5 w-3.5" />
                      </div>
                    ) : null}
                    <div
                      className={`max-w-[85%] rounded-[20px] px-3 py-2.5 text-[13px] leading-6 shadow-sm sm:max-w-[82%] sm:px-3.5 ${
                        message.role === "assistant"
                          ? "border border-slate-200/80 bg-white text-slate-700"
                          : "bg-[linear-gradient(135deg,#132746_0%,#1d4672_100%)] text-white shadow-[0_18px_34px_-24px_rgba(10,25,49,0.78)]"
                      }`}
                    >
                      <div
                        className={`mb-1.5 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] ${
                          message.role === "assistant" ? "text-slate-500" : "text-white/70"
                        }`}
                      >
                        <span>{message.role === "assistant" ? assistantRoleLabel : userRoleLabel}</span>
                      </div>
                      <div>{message.content}</div>
                      {message.links?.length ? (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {message.links.map((link) => (
                            <Link
                              key={`${message.id}-${link.href}-${link.label}`}
                              href={link.href}
                              className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                                message.role === "assistant"
                                  ? "bg-forne-cloud text-forne-ink hover:bg-slate-100"
                                  : "bg-white/10 text-white hover:bg-white/18"
                              }`}
                            >
                              <span>{link.label}</span>
                              <BrandIcon name="arrow" className="h-3.5 w-3.5" />
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
                            className="ffo-portal-button inline-flex items-center gap-2 rounded-full bg-forne-ink px-3 py-2 text-xs font-semibold text-white transition hover:bg-forne-ink/90 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <BrandIcon name="trust" className="h-3.5 w-3.5" />
                            <span>{sendingEscalationId === message.id ? "Enviando correo..." : "Escalar por correo"}</span>
                          </button>
                        </div>
                      ) : null}
                    </div>
                    {message.role === "user" ? (
                    <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl border border-forne-line bg-white text-forne-ink shadow-[0_16px_28px_-22px_rgba(15,47,87,0.5)]">
                        <BrandIcon name="portal" className="h-3.5 w-3.5" />
                      </div>
                    ) : null}
                  </div>
                ))}
                {pending ? (
                  <div className="flex gap-3 pr-4">
                    <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl bg-forne-ink text-white shadow-[0_18px_32px_-20px_rgba(15,31,55,0.85)]">
                      <BrandIcon name="guide" className="h-3.5 w-3.5" />
                    </div>
                    <div className="max-w-[85%] rounded-[20px] border border-slate-200/80 bg-white px-3.5 py-2.5 text-[13px] text-slate-700 shadow-sm">
                      <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                        <span>{assistantRoleLabel}</span>
                        <span className="h-1 w-1 rounded-full bg-forne-muted/40" />
                        <span>Preparando respuesta</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="ffo-portal-skeleton h-2.5 w-2.5 rounded-full" />
                        <span className="ffo-portal-skeleton h-2.5 w-2.5 rounded-full [animation-delay:120ms]" />
                        <span className="ffo-portal-skeleton h-2.5 w-2.5 rounded-full [animation-delay:240ms]" />
                        <span className="ml-1">Pensando la mejor respuesta para esta seccion...</span>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </section>

            {error ? (
              <div className="rounded-[20px] border border-rose-200 bg-[linear-gradient(180deg,rgba(255,247,247,0.98)_0%,rgba(255,240,240,0.95)_100%)] px-4 py-3 text-sm text-rose-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
                {error}
              </div>
            ) : null}

            <div className="rounded-[22px] border border-slate-200/80 bg-white/80 px-3 py-2.5 shadow-[0_18px_44px_-36px_rgba(15,47,87,0.28)] lg:px-3.5">
              <div className="flex items-center justify-between gap-3">
                <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-forne-muted">
                  {hasConversation ? "Sugerencias utiles" : suggestionHeading}
                </div>
                <div className="hidden text-[11px] text-forne-muted sm:block">
                  {hasConversation ? "Atajos para seguir la conversacion" : "Respuestas rapidas segun la pagina actual"}
                </div>
              </div>
              <div className="-mx-1 mt-2 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => void sendMessage(suggestion)}
                    disabled={pending}
                    className="group shrink-0 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-left text-[11px] font-semibold text-forne-ink shadow-[0_14px_30px_-24px_rgba(15,47,87,0.46)] transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <span className="inline-flex items-center gap-2">
                      <span className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-forne-cloud text-forne-ink transition group-hover:bg-white">
                        <BrandIcon name="arrow" className="h-3 w-3" />
                      </span>
                      <span>{suggestion}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={onSubmit} className="rounded-[24px] border border-slate-200/80 bg-white/95 p-3 shadow-[0_18px_44px_-34px_rgba(15,47,87,0.36)] lg:p-3.5">
              <div className="flex items-start gap-3">
                <div className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-forne-cloud text-forne-ink sm:flex">
                  <BrandIcon name="clarity" className="h-4 w-4" />
                </div>
                <label className="flex-1">
                  <span className="sr-only">Escribe tu consulta</span>
                  <textarea
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    rows={2}
                    placeholder="Escribe tu pregunta sobre facturas, documentos, avisos, incidencias o perfil..."
                    className="ffo-portal-input min-h-[68px] w-full resize-none rounded-[20px] px-4 py-3 text-[13px] text-forne-ink outline-none placeholder:text-forne-muted/75 sm:min-h-[78px]"
                  />
                </label>
              </div>
              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="max-w-[16rem] text-xs leading-5 text-forne-muted">
                  Si necesitas ayuda humana, puedes escalar la consulta por correo desde una respuesta del asistente.
                </div>
                <button
                  type="submit"
                  disabled={pending || !input.trim()}
                  className="ffo-portal-button inline-flex h-12 items-center justify-center rounded-2xl bg-forne-ink px-5 text-sm font-semibold text-white transition hover:bg-forne-ink/90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Enviar consulta
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        aria-expanded={isOpen}
        aria-label={isOpen ? "Cerrar chat del portal" : "Abrir chat del portal"}
        className="ffo-portal-button inline-flex items-center gap-3 rounded-full bg-[linear-gradient(135deg,#0f1f37_0%,#17446e_100%)] px-3.5 py-3 text-sm font-semibold text-white shadow-[0_24px_50px_-26px_rgba(7,11,26,0.75)] transition hover:-translate-y-0.5 hover:shadow-[0_28px_58px_-28px_rgba(7,11,26,0.85)] sm:px-4 lg:rounded-[22px] lg:px-4 lg:py-3.5"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/12 ring-1 ring-white/10">
          <BrandIcon name="guide" className="h-4 w-4" />
        </span>
        <span className="hidden flex-col items-start leading-none min-[380px]:flex">
          <span className="text-[10px] uppercase tracking-[0.22em] text-white/60">Asistencia</span>
          <span className="mt-1">Chat portal</span>
        </span>
        <span className="min-[380px]:hidden">Chat</span>
        <span className="hidden h-2.5 w-2.5 rounded-full bg-emerald-300 shadow-[0_0_0_4px_rgba(110,231,183,0.14)] sm:block" />
      </button>
    </div>
  );
}
