"use client";

import { useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import BrandIcon from "@/components/brand/BrandIcon";

type ContractOption = {
  contractNo: string;
  description: string;
  property: string;
  propertyNo: string;
};

type Props = {
  contracts: ContractOption[];
};

const incidentTypes = [
  { value: "Problem", label: "Avería o problema" },
  { value: "Request", label: "Solicitud" },
  { value: "Question", label: "Consulta" }
];

const priorities = [
  { value: "Normal", label: "Normal" },
  { value: "High", label: "Alta" },
  { value: "Low", label: "Baja" }
];

const practicalTips = [
  "Indica dónde ocurre el problema y desde cuándo sucede.",
  "Si afecta al uso normal del inmueble, marca prioridad alta.",
  "Deja un teléfono válido para acelerar la coordinación."
];

export default function NewIncidentForm({ contracts }: Props) {
  const [contractNo, setContractNo] = useState(contracts[0]?.contractNo || "");
  const [caseType, setCaseType] = useState("Problem");
  const [priority, setPriority] = useState("Normal");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const selectedContract = useMemo(
    () => contracts.find((contract) => contract.contractNo === contractNo),
    [contractNo, contracts]
  );

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("sending");
    setError("");
    setWarning("");

    const formData = new FormData();
    formData.set("requestType", "new");
    formData.set("title", title);
    formData.set("message", message);
    formData.set("caseType", caseType);
    formData.set("priority", priority);
    formData.set("contractNo", contractNo);
    formData.set("fixedRealEstateNo", selectedContract?.propertyNo || "");
    formData.set("property", selectedContract?.property || selectedContract?.description || "");
    formData.set("contactPhone", contactPhone);

    for (const file of files) {
      formData.append("attachments", file);
    }

    const res = await fetch("/api/incidents/contact", {
      method: "POST",
      body: formData
    });

    const payload = await res.json().catch(() => ({}));

    if (!res.ok) {
      setStatus("error");
      setError(typeof payload.error === "string" ? payload.error : "No se pudo enviar la incidencia.");
      return;
    }

    setStatus("sent");
    setTitle("");
    setMessage("");
    setContactPhone("");
    setFiles([]);
    setCaseType("Problem");
    setPriority("Normal");
    setWarning(typeof payload.warning === "string" ? payload.warning : "");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <form onSubmit={onSubmit} className="ffo-portal-card rounded-[32px] p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="text-lg font-semibold tracking-tight text-forne-ink">Alta de nueva incidencia</div>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-forne-muted">
            Registra una nueva solicitud o avería directamente en Business Central.
          </p>
        </div>
        <span className="w-fit rounded-full bg-[#f8fafc] px-3 py-1 text-xs font-semibold text-forne-muted ring-1 ring-forne-line">
          Alta directa
        </span>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wide text-forne-muted">Contrato</span>
          <select
            value={contractNo}
            onChange={(event) => setContractNo(event.target.value)}
            className="ffo-portal-input mt-2 w-full rounded-2xl px-4 py-3 text-sm text-forne-ink outline-none"
          >
            {contracts.length === 0 ? <option value="">Sin contrato asociado</option> : null}
            {contracts.map((contract) => (
              <option key={contract.contractNo} value={contract.contractNo}>
                {contract.contractNo} · {contract.property || contract.description}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wide text-forne-muted">Tipo</span>
          <select
            value={caseType}
            onChange={(event) => setCaseType(event.target.value)}
            className="ffo-portal-input mt-2 w-full rounded-2xl px-4 py-3 text-sm text-forne-ink outline-none"
          >
            {incidentTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wide text-forne-muted">Prioridad</span>
          <select
            value={priority}
            onChange={(event) => setPriority(event.target.value)}
            className="ffo-portal-input mt-2 w-full rounded-2xl px-4 py-3 text-sm text-forne-ink outline-none"
          >
            {priorities.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-4 rounded-[26px] border border-forne-line bg-[linear-gradient(180deg,#f8fbff_0%,#f2f7fd_100%)] p-4">
        <div className="text-xs font-semibold uppercase tracking-[0.22em] text-forne-muted">
          Recomendaciones para una gestión más rápida
        </div>
        <div className="mt-3 grid gap-2 lg:grid-cols-3">
          {practicalTips.map((item) => (
            <div key={item} className="rounded-2xl bg-white px-3 py-3 text-sm leading-6 text-forne-muted shadow-sm">
              <span className="inline-flex items-start gap-2">
                <BrandIcon name="clarity" className="mt-1 h-3.5 w-3.5 text-[#1b6fd8]" />
                <span>{item}</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wide text-forne-muted">Título</span>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="ffo-portal-input mt-2 w-full rounded-2xl px-4 py-3 text-sm text-forne-ink outline-none"
            placeholder="Ej. Fuga de agua en cocina"
            required
            maxLength={120}
          />
        </label>

        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wide text-forne-muted">Teléfono</span>
          <input
            value={contactPhone}
            onChange={(event) => setContactPhone(event.target.value)}
            className="ffo-portal-input mt-2 w-full rounded-2xl px-4 py-3 text-sm text-forne-ink outline-none"
            placeholder="Teléfono de contacto"
            required
            maxLength={40}
          />
        </label>
      </div>

      <label className="mt-4 block">
        <span className="text-xs font-semibold uppercase tracking-wide text-forne-muted">Descripción</span>
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          className="ffo-portal-input mt-2 min-h-36 w-full rounded-2xl px-4 py-3 text-sm leading-6 text-forne-ink outline-none"
          placeholder="Describe qué ocurre, desde cuándo, y cualquier detalle útil para resolverlo."
          required
          maxLength={4000}
        />
      </label>

      <label className="mt-4 block">
        <span className="text-xs font-semibold uppercase tracking-wide text-forne-muted">Adjuntos</span>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
          onChange={(event) => setFiles(Array.from(event.target.files || []))}
          className="ffo-portal-input mt-2 block w-full rounded-2xl px-4 py-3 text-sm text-forne-ink outline-none file:mr-4 file:rounded-xl file:border-0 file:bg-[#1b6fd8] file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white"
        />
        <div className="mt-2 text-xs text-forne-muted">
          Hasta 5 archivos. Formatos habituales de imagen y documento.
        </div>
        {files.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {files.map((file) => (
              <span
                key={`${file.name}-${file.size}-${file.lastModified}`}
                className="inline-flex rounded-full border border-forne-line bg-forne-cloud px-3 py-1 text-xs font-medium text-forne-ink"
              >
                {file.name}
              </span>
            ))}
          </div>
        ) : null}
      </label>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-xs text-forne-muted">{message.length}/4000 caracteres</div>
        <button
          type="submit"
          disabled={status === "sending"}
          className="ffo-portal-button rounded-2xl bg-forne-ink px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_36px_-24px_rgba(7,11,26,0.8)] transition hover:bg-forne-ink/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "sending" ? "Enviando..." : "Enviar alta"}
        </button>
      </div>

      {status === "sent" ? (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          Incidencia registrada correctamente en Business Central.
        </div>
      ) : null}

      {warning ? (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          {warning}
        </div>
      ) : null}

      {status === "error" ? (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}
    </form>
  );
}
