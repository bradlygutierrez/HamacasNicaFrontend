"use client";

import Link from "next/link";
import { Search, Settings2 } from "lucide-react";
import { useEffect, useState } from "react";
import { apiFetch } from "@/app/_lib/api";

type Hamaca = { id: number; nombre: string; categoria?: string | null; tamano?: string | null; precio?: string | number };
type Recipe = { version: number; estado: string; resumen?: { costo_produccion?: string } };

export default function FormulasPage() {
  const [items, setItems] = useState<Array<Hamaca & { active?: Recipe; draft?: Recipe }>>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      try {
        const response = await apiFetch(`/hamacas?search=${encodeURIComponent(search)}&per_page=50`);
        const data = await response.json().catch(() => null);
        if (!response.ok) throw new Error("No se pudo cargar modelos");
        const hamacas: Hamaca[] = Array.isArray(data?.data) ? data.data : [];
        const enriched = await Promise.all(hamacas.map(async (hamaca) => {
          const recipesResponse = await apiFetch(`/hamacas/${hamaca.id}/recetas`);
          const recipesData = recipesResponse.ok ? await recipesResponse.json().catch(() => null) : null;
          const recipes: Recipe[] = Array.isArray(recipesData?.data) ? recipesData.data : [];
          return { ...hamaca, active: recipes.find((recipe) => recipe.estado === "activa"), draft: recipes.find((recipe) => recipe.estado === "borrador") };
        }));
        if (active) setItems(enriched);
      } catch (err) {
        console.error(err);
        if (active) setError("No se pudieron cargar las fórmulas.");
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => { active = false; };
  }, [search]);

  return (
    <div className="w-full max-w-full overflow-x-hidden bg-[#456f89] px-3 py-4 text-[#08264d] sm:px-8 sm:py-7">
      <header className="mb-6 flex flex-col gap-4 lg:mb-8">
        <div><h1 className="text-[42px] font-extrabold leading-none text-white sm:text-[56px]">Fórmulas</h1><p className="mt-2 text-sm font-medium text-white/85">Versiones y costos estimados de producción por modelo.</p></div>
        <div className="relative h-[46px] w-full lg:max-w-[650px]"><Search className="absolute left-4 top-1/2 h-6 w-6 -translate-y-1/2 text-[#08264d]" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar modelo" className="h-full w-full rounded-[8px] bg-[#f7f7f7] pl-14 pr-4 text-base text-[#08264d] outline-none sm:text-xl" /></div>
      </header>
      {loading ? <p className="rounded-[8px] bg-white p-5 text-sm font-semibold">Cargando modelos...</p> : error ? <p className="rounded-[8px] bg-red-50 p-5 text-sm font-semibold text-red-700">{error}</p> : <section className="grid gap-4 lg:grid-cols-2">{items.map((item) => <article key={item.id} className="rounded-[8px] bg-[#e9eef1] p-5 shadow-lg"><div className="flex items-start justify-between gap-4"><div><h2 className="text-2xl font-extrabold">{item.nombre}</h2><p className="text-sm font-semibold text-[#456f89]">{item.categoria ?? "Sin categoría"} · {item.tamano ?? "Sin tamaño"}</p></div><Settings2 className="h-6 w-6 text-[#456f89]" /></div><div className="mt-4 grid gap-2 text-sm sm:grid-cols-3"><div className="rounded bg-white p-3"><b>Activa</b><br />{item.active ? `v${item.active.version}` : "Sin receta"}</div><div className="rounded bg-white p-3"><b>Borrador</b><br />{item.draft ? `v${item.draft.version}` : "—"}</div><div className="rounded bg-white p-3"><b>Precio venta</b><br />C$ {Number(item.precio ?? 0).toFixed(2)}</div></div><Link href={`/formulas/${item.id}`} className="mt-4 inline-flex rounded-[8px] bg-[#123852] px-4 py-2 text-sm font-bold text-white">Ver / configurar</Link></article>)}</section>}
    </div>
  );
}
