"use client";

import { useMemo, useState } from "react";
import type { FormEvent } from "react";

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

export default function NewIncidentForm({ contracts }: Props) {
  const [contractNo, setContractNo] = useState(contracts[0]?.contractNo || "");
  const [caseType, setCaseType] = useState("Problem");
  const [priority, setPriority] = useState("Normal");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  const selectedContract = useMemo(
    () => contracts.find((contract) => contract.contractNo === contractNo),
    [contractNo, contracts]
  );

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("sending");
    setError("");

    const res = await fetch("/api/incidents/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        requestType: "new",
        title,
        message,
        caseType,
        priority,
        contractNo,
        fixedRealEstateNo: selectedContract?.propertyNo || "",
        property: selectedContract?.property || selectedContract?.description || "",
        contactPhone
      })
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
    setCaseType("Problem");
    setPriority("Normal");
  };

  return (
    <form onSubmit={onSubmit} className="rounded-3xl border border-forne-line bg-white p-6 shadow-[0_28px_70px_-42px_rgba(15,23,42,0.28)]">
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
            className="mt-2 w-full rounded-2xl border border-forne-line bg-[#fcfdff] px-4 py-3 text-sm text-forne-ink outline-none transition focus:border-forne-ink focus:bg-white"
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
            className="mt-2 w-full rounded-2xl border border-forne-line bg-[#fcfdff] px-4 py-3 text-sm text-forne-ink outline-none transition focus:border-forne-ink focus:bg-white"
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
            className="mt-2 w-full rounded-2xl border border-forne-line bg-[#fcfdff] px-4 py-3 text-sm text-forne-ink outline-none transition focus:border-forne-ink focus:bg-white"
          >
            {priorities.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wide text-forne-muted">Título</span>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-forne-line bg-[#fcfdff] px-4 py-3 text-sm text-forne-ink outline-none transition focus:border-forne-ink focus:bg-white"
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
            className="mt-2 w-full rounded-2xl border border-forne-line bg-[#fcfdff] px-4 py-3 text-sm text-forne-ink outline-none transition focus:border-forne-ink focus:bg-white"
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
          className="mt-2 min-h-36 w-full rounded-2xl border border-forne-line bg-[#fcfdff] px-4 py-3 text-sm leading-6 text-forne-ink outline-none transition focus:border-forne-ink focus:bg-white"
          placeholder="Describe qué ocurre, desde cuándo, y cualquier detalle útil para resolverlo."
          required
          maxLength={4000}
        />
      </label>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-xs text-forne-muted">{message.length}/4000 caracteres</div>
        <button
          type="submit"
          disabled={status === "sending"}
          className="rounded-2xl bg-forne-ink px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_36px_-24px_rgba(7,11,26,0.8)] transition hover:bg-forne-ink/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "sending" ? "Enviando..." : "Enviar alta"}
        </button>
      </div>

      {status === "sent" ? (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          Incidencia registrada correctamente en Business Central.
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
