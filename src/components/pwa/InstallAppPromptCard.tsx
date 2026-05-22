"use client";

import { useEffect, useMemo, useState } from "react";
import InstallAppButtonMount from "@/components/pwa/InstallAppButtonMount";

const DISMISS_KEY_PREFIX = "ffo-pwa-prompt-dismissed-at";
const VISIT_COUNT_KEY_PREFIX = "ffo-pwa-prompt-visit-count";
const VISIT_SESSION_PREFIX = "ffo-pwa-prompt-session";
const DISMISS_WINDOW_MS = 1000 * 60 * 60 * 24 * 14;

function isStandaloneMode() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.matchMedia("(display-mode: standalone)").matches;
}

function getUserAgent() {
  if (typeof navigator === "undefined") {
    return "";
  }

  return navigator.userAgent.toLowerCase();
}

function isIosSafari() {
  const ua = getUserAgent();
  return /iphone|ipad|ipod/i.test(ua) && ua.includes("safari") && !ua.includes("crios") && !ua.includes("fxios") && !ua.includes("edg");
}

function isChromiumMobile() {
  const ua = getUserAgent();
  return /android|iphone|ipad|mobile/i.test(ua) && /chrome|chromium|edg/i.test(ua) && !/opr\//i.test(ua);
}

function isMobileOrTablet() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.matchMedia("(max-width: 1024px)").matches;
}

export default function InstallAppPromptCard({
  surface,
  minVisits = 1,
  className,
  titleClassName,
  bodyClassName,
  dismissClassName,
  buttonClassName,
  iosButtonClassName
}: {
  surface: "login" | "portal";
  minVisits?: number;
  className: string;
  titleClassName: string;
  bodyClassName: string;
  dismissClassName: string;
  buttonClassName: string;
  iosButtonClassName?: string;
}) {
  const [ready, setReady] = useState(false);
  const [shouldShow, setShouldShow] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [isChromium, setIsChromium] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const dismissKey = `${DISMISS_KEY_PREFIX}:${surface}`;
    const visitCountKey = `${VISIT_COUNT_KEY_PREFIX}:${surface}`;

    if (isStandaloneMode() || !isMobileOrTablet()) {
      setReady(true);
      setShouldShow(false);
      return;
    }

    const dismissedAt = Number(window.localStorage.getItem(dismissKey) || "0");
    if (dismissedAt && Date.now() - dismissedAt < DISMISS_WINDOW_MS) {
      setReady(true);
      setShouldShow(false);
      return;
    }

    const sessionKey = `${VISIT_SESSION_PREFIX}:${surface}`;
    const countedThisSession = window.sessionStorage.getItem(sessionKey) === "1";
    const previousCount = Number(window.localStorage.getItem(visitCountKey) || "0");
    const nextCount = countedThisSession ? previousCount : previousCount + 1;

    if (!countedThisSession) {
      window.sessionStorage.setItem(sessionKey, "1");
      window.localStorage.setItem(visitCountKey, String(nextCount));
    }

    const ios = isIosSafari();
    const chromium = isChromiumMobile();
    const supported = ios || chromium;

    setIsIos(ios);
    setIsChromium(chromium);
    setReady(true);
    setShouldShow(supported && nextCount >= minVisits);
  }, [minVisits, surface]);

  const content = useMemo(() => {
    if (surface === "login") {
      if (isIos) {
        return {
          title: "Añádelo al inicio",
          body: "Guarda este acceso en tu iPhone o iPad para entrar al portal desde un toque, sin buscar el navegador cada vez."
        };
      }

      if (isChromium) {
        return {
          title: "Entra más rápido",
          body: "Guarda el acceso al portal como app y ábrelo desde tu móvil como si fuera una aplicación propia."
        };
      }

      return {
        title: "Acceso rápido",
        body: "Guarda este portal como app para entrar más rápido desde tu dispositivo."
      };
    }

    if (isIos) {
      return {
        title: "Ten el portal a mano",
        body: "Añádelo a la pantalla de inicio y abre facturas, avisos e incidencias como un acceso directo del móvil."
      };
    }

    if (isChromium) {
      return {
        title: "Guarda este portal como app",
        body: "Así tendrás un acceso más directo a tus gestiones, con una apertura más rápida y sin depender de buscar la pestaña."
      };
    }

    return {
      title: "Acceso rápido",
      body: "Guarda este portal como app para entrar más rápido desde tu dispositivo."
    };
  }, [isChromium, isIos, surface]);

  const onDismiss = () => {
    if (typeof window !== "undefined") {
      const dismissKey = `${DISMISS_KEY_PREFIX}:${surface}`;
      window.localStorage.setItem(dismissKey, String(Date.now()));
    }

    setShouldShow(false);
  };

  if (!ready || !shouldShow) {
    return null;
  }

  return (
    <div className={className}>
      <div className={titleClassName}>{content.title}</div>
      <div className={bodyClassName}>{content.body}</div>
      <div className="mt-4">
        <InstallAppButtonMount
          className={buttonClassName}
          iosClassName={iosButtonClassName || buttonClassName}
          label="Añadir acceso rapido"
          iosLabel="Ver como anadirlo"
        />
      </div>
      <button type="button" onClick={onDismiss} className={dismissClassName}>
        Ahora no
      </button>
    </div>
  );
}
