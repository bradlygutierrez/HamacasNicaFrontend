"use client";

import { downloadPdf, openPdf } from "@/app/_lib/documents";
import { useState } from "react";
import { toast } from "react-toastify";

export default function PdfActions({ endpoint, filename }: { endpoint: string; filename?: string }) {
  const [busy, setBusy] = useState<"view" | "download" | null>(null);
  async function run(action: "view" | "download") {
    setBusy(action);
    try {
      if (action === "view") await openPdf(endpoint);
      else await downloadPdf(endpoint, filename);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo obtener el PDF.");
    } finally {
      setBusy(null);
    }
  }
  return <div className="flex flex-wrap gap-2"><button type="button" disabled={busy !== null} onClick={() => void run("view")} className="rounded bg-white px-3 py-2 text-sm font-bold text-[#123852] transition-colors hover:bg-[#e9eef1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#123852]/30 disabled:cursor-not-allowed disabled:opacity-60">{busy === "view" ? "Generando..." : "Ver PDF"}</button><button type="button" disabled={busy !== null} onClick={() => void run("download")} className="rounded bg-white px-3 py-2 text-sm font-bold text-[#123852] transition-colors hover:bg-[#e9eef1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#123852]/30 disabled:cursor-not-allowed disabled:opacity-60">{busy === "download" ? "Generando..." : "Descargar PDF"}</button></div>;
}
