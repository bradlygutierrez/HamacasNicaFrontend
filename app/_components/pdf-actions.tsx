"use client";

import { downloadPdf, openPdf } from "@/app/_lib/documents";
import { useState } from "react";
import { toast } from "react-toastify";

export default function PdfActions({ endpoint, filename }: { endpoint: string; filename?: string }) {
  const [busy, setBusy] = useState<"view" | "download" | null>(null);
  const [invoiceLanguage, setInvoiceLanguage] = useState<"es" | "en">("es");
  const isInvoice = endpoint.startsWith("/facturas/");
  const pdfEndpoint = isInvoice ? endpoint + (endpoint.includes("?") ? "&" : "?") + "lang=" + invoiceLanguage : endpoint;
  async function run(action: "view" | "download") {
    setBusy(action);
    try {
      if (action === "view") { await openPdf(pdfEndpoint); toast.success("PDF listo para consultar."); }
      else { await downloadPdf(pdfEndpoint, filename); toast.success("PDF descargado."); }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo obtener el PDF.");
    } finally {
      setBusy(null);
    }
  }
  return <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">{isInvoice ? <label className="flex min-h-10 w-full items-center gap-2 rounded border border-black/10 bg-white px-2 text-sm font-semibold text-[#123852] sm:w-auto"><span>Idioma</span><select aria-label="Idioma de la factura" value={invoiceLanguage} onChange={(event) => setInvoiceLanguage(event.target.value === "en" ? "en" : "es")} className="min-h-10 bg-transparent text-sm focus:outline-none"><option value="es">Español</option><option value="en">English</option></select></label> : null}<button type="button" disabled={busy !== null} onClick={() => void run("view")} className="min-h-10 w-full rounded bg-white px-3 py-2 text-sm font-bold text-[#123852] transition-colors hover:bg-[#e9eef1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#123852]/30 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto">{busy === "view" ? "Generando..." : "Ver PDF"}</button><button type="button" disabled={busy !== null} onClick={() => void run("download")} className="min-h-10 w-full rounded bg-white px-3 py-2 text-sm font-bold text-[#123852] transition-colors hover:bg-[#e9eef1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#123852]/30 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto">{busy === "download" ? "Generando..." : "Descargar PDF"}</button></div>;
}
