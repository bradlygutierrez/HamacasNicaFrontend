"use client";

import { useCatalogCapabilities } from "@/app/_components/catalog-permissions-provider";
import { apiFetch } from "@/app/_lib/api";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type PedidoRef = { id: number; numero: string | null };

export default function PedidoConversionAction() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { canCreate } = useCatalogCapabilities("/pedidos");
  const [state, setState] = useState("");
  const [pedido, setPedido] = useState<PedidoRef | null>(null);
  const [error, setError] = useState("");

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
    if (!window.confirm("¿Crear el pedido a partir de esta proforma aceptada?")) return;
    const response = await apiFetch("/proformas/" + id + "/pedido", { method: "POST" });
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      setError(data?.message ?? "No se pudo crear el pedido.");
      return;
    }
    router.push("/pedidos/" + data.data.id);
  }

  if (pedido) return <a href={"/pedidos/" + pedido.id} className="rounded bg-white px-3 py-2 text-sm font-bold">Ver pedido</a>;
  if (state !== "aceptada" || !canCreate) return error ? <span className="text-sm text-red-100">{error}</span> : null;
  return <button onClick={() => void convert()} className="rounded bg-white px-3 py-2 text-sm font-bold">Crear pedido</button>;
}
