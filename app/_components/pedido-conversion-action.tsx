"use client";

import { useCatalogCapabilities } from "@/app/_components/catalog-permissions-provider";
import { apiFetch } from "@/app/_lib/api";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

type PedidoRef = { id: number; numero: string | null };

export default function PedidoConversionAction() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { canCreate } = useCatalogCapabilities("/pedidos");
  const [state, setState] = useState("");
  const [pedido, setPedido] = useState<PedidoRef | null>(null);
  const [error, setError] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

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
    const response = await apiFetch("/proformas/" + id + "/pedido", { method: "POST" });
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      const message = data?.message ?? "No se pudo crear el pedido.";
      setError(message);
      toast.error(message);
      return;
    }
    toast.success("Pedido creado desde la proforma.");
    setConfirmOpen(false);
    router.push("/pedidos/" + data.data.id);
  }

  if (pedido) return <a href={"/pedidos/" + pedido.id} className="rounded bg-white px-3 py-2 text-sm font-bold">Ver pedido</a>;
  if (state !== "aceptada" || !canCreate) return error ? <span className="text-sm text-red-100">{error}</span> : null;
  return <>
    <button onClick={() => setConfirmOpen(true)} className="rounded bg-white px-3 py-2 text-sm font-bold">Crear pedido</button>
    {confirmOpen ? <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4"><div role="dialog" aria-modal="true" aria-labelledby="convert-pedido-title" className="w-full max-w-md rounded-xl bg-white p-6 text-slate-900 shadow-2xl"><h2 id="convert-pedido-title" className="text-xl font-extrabold">Crear pedido</h2><p className="mt-3 text-sm text-slate-600">¿Crear el pedido a partir de esta proforma aceptada?</p>{error ? <p role="alert" className="mt-3 text-sm text-red-700">{error}</p> : null}<div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button onClick={() => setConfirmOpen(false)} className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-bold">Cancelar</button><button onClick={() => void convert()} className="rounded-lg bg-[#123852] px-4 py-2.5 text-sm font-bold text-white">Crear pedido</button></div></div></div> : null}
  </>;
}
