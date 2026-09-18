"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { apiFetch } from "@/app/_lib/api";

type FormulaSummary = { id: number; nombre: string; categoria?: string | null; tamano?: string | null; precio?: string | number; receta_activa?: { id: number; version: number } | null; receta_borrador?: { id: number; version: number } | null; costo_produccion?: string | null };
type Meta = { current_page: number; last_page: number; total: number };

export default function FormulasPage() {
  const [items, setItems] = useState<FormulaSummary[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<Meta>({ current_page: 1, last_page: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      setLoading(true); setError("");
      try {
        const response = await apiFetch(`/formulas?search=${encodeURIComponent(search)}&page=${page}&per_page=15`);
        const data = await response.json().catch(() => null);
        if (!response.ok) throw new Error("formula list failed");
        setItems(Array.isArray(data?.data) ? data.data : []);
        setMeta(data?.meta ?? { current_page: page, last_page: 1, total: 0 });
      } catch { setError("No se pudieron cargar las fórmulas."); } finally { setLoading(false); }
    }, 250);
    return () => window.clearTimeout(timer);
  }, [search, page]);

  return (
    <div className="w-full max-w-full overflow-x-hidden bg-[#456f89] px-3 py-4 text-[#08264d] sm:px-8 sm:py-7">
      <header className="mb-6 flex flex-col gap-4 lg:mb-8"><div><h1 className="text-[42px] font-extrabold leading-none text-white sm:text-[56px]">Fórmulas</h1><p className="mt-2 text-sm font-medium text-white/85">Versiones y costos estimados de producción por modelo.</p></div><div className="relative h-[46px] w-full lg:max-w-[650px]"><Search className="absolute left-4 top-1/2 h-6 w-6 -translate-y-1/2 text-[#08264d]" /><input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Buscar modelo" className="h-full w-full rounded-[8px] bg-[#f7f7f7] pl-14 pr-4 text-base text-[#08264d] outline-none sm:text-xl" /></div></header>
      {error ? <p className="mb-4 rounded bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</p> : null}
      {loading ? <p className="rounded bg-white p-5 text-sm font-semibold">Cargando modelos...</p> : <section className="grid gap-4 lg:grid-cols-2">{items.map((item) => <article key={item.id} className="rounded-[8px] bg-[#e9eef1] p-5 shadow-lg"><h2 className="text-2xl font-extrabold">{item.nombre}</h2><p className="text-sm font-semibold text-[#456f89]">{item.categoria ?? "Sin categoría"} · {item.tamano ?? "Sin tamaño"}</p><div className="mt-4 grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-3"><div className="rounded bg-white p-3"><b>Activa</b><br />{item.receta_activa ? `v${item.receta_activa.version}` : "Sin receta"}</div><div className="rounded bg-white p-3"><b>Borrador</b><br />{item.receta_borrador ? `v${item.receta_borrador.version}` : "—"}</div><div className="rounded bg-white p-3"><b>Precio venta</b><br />C$ {Number(item.precio ?? 0).toFixed(2)}</div><div className="rounded bg-white p-3"><b>Costo producción</b><br />{item.costo_produccion ? `C$ ${Number(item.costo_produccion).toFixed(2)}` : "—"}</div></div><Link href={`/formulas/${item.id}`} className="mt-4 inline-flex rounded-[8px] bg-[#123852] px-4 py-2 text-sm font-bold !text-white">Ver / configurar</Link></article>)}</section>}
      {!loading ? <nav className="mt-5 flex items-center justify-between rounded bg-[#e9eef1] p-3 text-sm font-bold"><button type="button" disabled={page <= 1} onClick={() => setPage((value) => value - 1)} className="rounded bg-[#123852] px-3 py-2 text-white disabled:opacity-40">Anterior</button><span>Página {meta.current_page} de {meta.last_page}</span><button type="button" disabled={page >= meta.last_page} onClick={() => setPage((value) => value + 1)} className="rounded bg-[#123852] px-3 py-2 text-white disabled:opacity-40">Siguiente</button></nav> : null}
    </div>
  );
}
