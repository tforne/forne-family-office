"use client";

import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
};

function isStandaloneMode() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.matchMedia("(display-mode: standalone)").matches;
}

function isIosDevice() {
  if (typeof navigator === "undefined") {
    return false;
  }

  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isSafariBrowser() {
  if (typeof navigator === "undefined") {
    return false;
  }

  const ua = navigator.userAgent.toLowerCase();
  return ua.includes("safari") && !ua.includes("crios") && !ua.includes("fxios") && !ua.includes("edg");
}

export default function InstallAppButton({
  className,
  iosClassName,
  label = "Instalar app",
  iosLabel = "Cómo instalar"
}: {
  className: string;
  iosClassName?: string;
  label?: string;
  iosLabel?: string;
}) {
  const [isMounted, setIsMounted] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIosHint, setShowIosHint] = useState(false);
  const [showHelpMessage, setShowHelpMessage] = useState(false);
  const [isChromium, setIsChromium] = useState(false);

  useEffect(() => {
    const standalone = isStandaloneMode();
    setIsMounted(true);
    setIsStandalone(standalone);

    if (standalone) {
      return;
    }

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    };

    const shouldShowIosHint = isIosDevice() && isSafariBrowser();
    const chromiumBrowser =
      typeof navigator !== "undefined" &&
      /chrome|chromium|edg/i.test(navigator.userAgent) &&
      !/opr\//i.test(navigator.userAgent);

    setShowIosHint(shouldShowIosHint);
    setIsChromium(chromiumBrowser);

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    };
  }, []);

  const onInstall = async () => {
    if (!installEvent) {
      setShowHelpMessage((current) => !current);
      return;
    }

    await installEvent.prompt();
    const choice = await installEvent.userChoice;

    if (choice.outcome === "accepted") {
      setInstallEvent(null);
      setShowHelpMessage(false);
    }
  };

  if (!isMounted) {
    return null;
  }

  if (isStandalone) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        onClick={onInstall}
        className={showIosHint ? iosClassName || className : className}
      >
        {installEvent ? label : showIosHint ? iosLabel : label}
      </button>
      {showHelpMessage ? (
        <div className="rounded-2xl border border-[#D7E7F5] bg-white/94 px-4 py-3 text-xs leading-5 text-[#5D6776] shadow-[0_18px_40px_-30px_rgba(15,47,87,0.18)]">
          {showIosHint ? (
            <>
              En iPhone o iPad, pulsa compartir y luego <strong>Añadir a pantalla de inicio</strong>.
            </>
          ) : isChromium ? (
            <>
              Si no aparece la instalación automática, usa el menú del navegador y elige{" "}
              <strong>Instalar aplicación</strong> o el icono de instalación de la barra.
            </>
          ) : (
            <>
              Instala la app desde las opciones del navegador o añade este sitio a tu pantalla de inicio
              si tu navegador lo permite.
            </>
          )}
        </div>
      ) : null}
    </>
  );
}
