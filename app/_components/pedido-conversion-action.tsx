"use client";

import { useCatalogCapabilities } from "@/app/_components/catalog-permissions-provider";
import { apiFetch } from "@/app/_lib/api";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { downloadPdf } from "@/app/_lib/documents";

type PedidoRef = { id: number; numero: string | null };

export default function PedidoConversionAction() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { canCreate } = useCatalogCapabilities("/pedidos");
  const [state, setState] = useState("");
  const [pedido, setPedido] = useState<PedidoRef | null>(null);
  const [error, setError] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void (async () => {
      const response = await apiFetch("/proformas/" + id);
      const data = await response.json().catch(() => null);
      if (response.ok) {
        setState(data?.data?.estado ?? "");
        setPedido(data?.data?.pedido ?? null);
      }
    })();
  }, [id]);

  async function convert() {
    setBusy(true);
    try {
      const response = await apiFetch("/proformas/" + id + "/pedido", { method: "POST" });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        const message = data?.message ?? "No se pudo crear el pedido.";
        setError(message);
        toast.error(message);
        return;
      }
      setError("");
      if (response.status === 201) {
        toast.success("Pedido creado desde la proforma. Preparando la lista de compra.");
        try {
          await downloadPdf(`/pedidos/${data.data.id}/materiales/pdf`, `Lista-de-compra-${data.data.numero ?? data.data.id}.pdf`);
          toast.success("Lista de compra descargada.");
        } catch (downloadError) {
          toast.error(downloadError instanceof Error ? `El pedido se creó, pero ${downloadError.message.toLowerCase()}` : "El pedido se creó, pero no se pudo descargar la lista de compra.");
        }
      } else {
        toast.info("Este pedido ya existía. Te llevo al pedido.");
      }
      setConfirmOpen(false);
      router.push("/pedidos/" + data.data.id);
    } catch {
      const message = "No se pudo conectar para crear el pedido.";
      setError(message);
      toast.error(message);
    } finally {
      setBusy(false);
    }
  }

  if (pedido) return <a href={"/pedidos/" + pedido.id} className="inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-base font-extrabold text-emerald-900 shadow-sm transition hover:bg-emerald-100 sm:w-auto">Ver pedido creado</a>;
  if (state !== "aceptada" || !canCreate) return error ? <span className="text-sm text-red-100">{error}</span> : null;
  return <>
    <section className="flex min-w-0 flex-1 flex-col justify-between gap-4 rounded-xl border border-emerald-200 bg-white p-4 shadow-md sm:flex-row sm:items-center sm:p-5">
      <div className="min-w-0"><span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-extrabold text-emerald-900"><span aria-hidden="true">✓</span> Proforma aceptada</span><p className="mt-2 text-sm text-slate-600">Todo listo para continuar con la preparación del pedido.</p></div>
      <button onClick={() => setConfirmOpen(true)} className="min-h-14 w-full shrink-0 rounded-xl bg-[#e3b72e] px-6 py-3 text-lg font-extrabold text-[#08264d] shadow-sm transition hover:-translate-y-0.5 hover:bg-[#f0c842] hover:shadow-md active:translate-y-0 sm:w-auto">Crear pedido <span aria-hidden="true">→</span></button>
    </section>
    {confirmOpen ? <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4"><div role="dialog" aria-modal="true" aria-labelledby="convert-pedido-title" className="w-full max-w-md rounded-xl bg-white p-6 text-slate-900 shadow-2xl"><h2 id="convert-pedido-title" className="text-xl font-extrabold">Crear pedido</h2><p className="mt-3 text-sm text-slate-600">¿Crear el pedido a partir de esta proforma aceptada? Al continuar, se descargará la lista de compra de materiales.</p>{error ? <p role="alert" className="mt-3 text-sm text-red-700">{error}</p> : null}<div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button disabled={busy} onClick={() => setConfirmOpen(false)} className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-bold disabled:opacity-50">Cancelar</button><button disabled={busy} onClick={() => void convert()} className="rounded-lg bg-[#123852] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60">{busy ? "Creando pedido…" : "Confirmar y crear pedido"}</button></div></div></div> : null}
  </>;
}
