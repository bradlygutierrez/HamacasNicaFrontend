"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/app/_lib/api";
import { getFormulaUiState, type FormulaUiState } from "@/app/_lib/formula-ui";
import { useCatalogCapabilities } from "@/app/_components/catalog-permissions-provider";

type FormulaSummary = { id: number; hamaca_id?: number; hamaca?: { id: number; nombre: string; categoria?: string | { nombre: string } | null; tamano?: string | { nombre: string } | null; precio?: string | number; colores?: Array<{ id: number; nombre: string }> }; nombre?: string; categoria?: string | null; tamano?: string | null; precio?: string | number; colores?: Array<{ id: number; nombre: string }>; receta_activa?: { id: number; version: number } | null; receta_borrador?: { id: number; version: number } | null; costo_produccion?: string | null };
type Meta = { current_page: number; last_page: number; total: number };
type ErrorPayload = { message?: string; errors?: Record<string, string | string[]> };

const firstError = (data: ErrorPayload | null, fallback: string) => {
  const fieldError = Object.values(data?.errors ?? {})[0];
  const firstFieldError = Array.isArray(fieldError) ? fieldError[0] : fieldError;
  return data?.message ?? firstFieldError ?? fallback;
};

const hamacaIdOf = (item: FormulaSummary) => item.hamaca?.id ?? item.hamaca_id ?? item.id;
const categoryOf = (item: FormulaSummary): string => { const value = item.hamaca?.categoria ?? item.categoria; return typeof value === "string" ? value : value?.nombre ?? ""; };
const sizeOf = (item: FormulaSummary): string => { const value = item.hamaca?.tamano ?? item.tamano; return typeof value === "string" ? value : value?.nombre ?? ""; };
const colorsOf = (item: FormulaSummary) => item.hamaca?.colores ?? item.colores ?? [];
const nameOf = (item: FormulaSummary) => item.hamaca?.nombre ?? item.nombre ?? "Hamaca";
const priceOf = (item: FormulaSummary) => item.hamaca?.precio ?? item.precio ?? 0;

export default function FormulasPage() {
  const router = useRouter();
  const { canCreate, canEdit } = useCatalogCapabilities("/formulas");
  const [items, setItems] = useState<FormulaSummary[]>([]);
  const [formulaCandidates, setFormulaCandidates] = useState<FormulaSummary[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<Meta>({ current_page: 1, last_page: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const mutationInFlight = useRef(false);
  const [mutationPending, setMutationPending] = useState(false);
  const [sourceHamaca, setSourceHamaca] = useState<Record<number, string>>({});

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

  useEffect(() => {
    void apiFetch("/formulas?per_page=100")
      .then((response) => response.json().catch(() => null))
      .then((data) => setFormulaCandidates(Array.isArray(data?.data) ? data.data : []))
      .catch(() => setFormulaCandidates([]));
  }, []);

  async function createFormula(item: FormulaSummary, uiState: FormulaUiState) {
    if (!uiState.canCreate && !uiState.canCreateVersion) return;
    if (mutationInFlight.current) return;
    mutationInFlight.current = true;
    setMutationPending(true);
    setError("");
    try {
      const body = sourceHamaca[hamacaIdOf(item)] ? JSON.stringify({ source_hamaca_id: Number(sourceHamaca[hamacaIdOf(item)]) }) : undefined;
      const response = await apiFetch(`/hamacas/${hamacaIdOf(item)}/recetas`, { method: "POST", ...(body ? { body } : {}) });
      const data = await response.json().catch(() => null) as ErrorPayload | null;
      if (!response.ok) {
        setError(response.status === 403 ? "No tenés permiso para crear esta fórmula." : firstError(data, response.status === 409 ? "Ya existe un borrador para esta fórmula." : "No se pudo crear la fórmula."));
        return;
      }
      router.push(`/formulas/${hamacaIdOf(item)}`);
    } catch {
      setError("No se pudo conectar con el servicio de fórmulas.");
    } finally {
      mutationInFlight.current = false;
      setMutationPending(false);
    }
  }

  return (
    <div className="w-full max-w-full overflow-x-hidden bg-[#456f89] px-3 py-4 text-[#08264d] sm:px-8 sm:py-7">
      <header className="mb-6 flex flex-col gap-4 lg:mb-8"><div><h1 className="text-[42px] font-extrabold leading-none text-white sm:text-[56px]">Fórmulas</h1><p className="mt-2 text-sm font-medium text-white/85">Versiones y costos estimados de producción por hamaca.</p></div><div className="relative h-[46px] w-full lg:max-w-[650px]"><Search aria-hidden="true" className="absolute left-4 top-1/2 h-6 w-6 -translate-y-1/2 text-[#08264d]" /><label htmlFor="formula-search" className="sr-only">Buscar hamaca</label><input id="formula-search" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Buscar hamaca, categoría, tamaño o color" className="h-full w-full rounded-[8px] bg-[#f7f7f7] pl-14 pr-4 text-base text-[#08264d] outline-none sm:text-xl" /></div></header>
      {error ? <p role="alert" aria-live="assertive" className="mb-4 rounded bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</p> : null}
      {loading ? <p className="rounded bg-white p-5 text-sm font-semibold">Cargando hamacas...</p> : <section className="grid gap-4 lg:grid-cols-2">{items.map((item) => {
        const hasActive = Boolean(item.receta_activa);
        const hasDraft = Boolean(item.receta_borrador);
        const uiState = getFormulaUiState({ hasActive, hasDraft, canCreate, canEdit });
        const actionClass = "rounded-[8px] bg-[#123852] px-4 py-2 text-sm font-bold !text-white";
        const sameModelActiveHamacas = formulaCandidates.filter((candidate) => hamacaIdOf(candidate) !== hamacaIdOf(item) && candidate.receta_activa && categoryOf(candidate) === categoryOf(item) && sizeOf(candidate) === sizeOf(item));
        return <article key={item.id} className="rounded-[8px] bg-[#e9eef1] p-5 shadow-lg"><h2 className="text-2xl font-extrabold">{nameOf(item)}</h2><p className="text-sm font-semibold text-[#456f89]">Colores: {colorsOf(item).map((color) => color.nombre).join(" / ") || "Sin colores"} · {categoryOf(item) || "Sin categoría"} · {sizeOf(item) || "Sin tamaño"}</p><div className="mt-4 grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-3"><div className="rounded bg-white p-3"><b>Estado de fórmula</b><br /><span aria-label={uiState.statusLabel}>{!hasActive && !hasDraft ? "Sin fórmula" : null}{hasActive ? <>Activa v{item.receta_activa?.version}</> : null}{hasActive && hasDraft ? <br /> : null}{hasDraft ? <>Borrador v{item.receta_borrador?.version}</> : null}</span></div><div className="rounded bg-white p-3"><b>Precio venta</b><br />C$ {Number(priceOf(item)).toFixed(2)}</div><div className="rounded bg-white p-3"><b>Costo producción</b><br />{item.costo_produccion ? `C$ ${Number(item.costo_produccion).toFixed(2)}` : "—"}</div></div><div className="mt-4 flex flex-wrap gap-2">{uiState.canCreate ? <button type="button" onClick={() => void createFormula(item, uiState)} disabled={mutationPending || !uiState.canCreate} className={actionClass}>{mutationPending ? "Creando..." : "Crear fórmula"}</button> : null}{uiState.canCreate && sameModelActiveHamacas.length ? <label className="flex items-center gap-2 text-sm font-semibold"><span className="sr-only">Copiar fórmula de otra hamaca similar</span><select aria-label="Copiar fórmula de otra hamaca similar" value={sourceHamaca[hamacaIdOf(item)] ?? ""} onChange={(event) => setSourceHamaca((current) => ({ ...current, [hamacaIdOf(item)]: event.target.value }))} className="rounded border px-2 py-2"><option value="">Crear vacía</option>{sameModelActiveHamacas.map((candidate) => <option key={hamacaIdOf(candidate)} value={hamacaIdOf(candidate)}>{nameOf(candidate)} · v{candidate.receta_activa?.version}</option>)}</select></label> : null}{uiState.canContinue ? <Link href={`/formulas/${hamacaIdOf(item)}`} className={actionClass}>{uiState.statusLabel === "Activa + borrador" ? "Continuar borrador" : "Continuar fórmula"}</Link> : null}{uiState.canView ? <><Link href={`/formulas/${hamacaIdOf(item)}`} className={actionClass}>{hasActive ? "Ver fórmula" : "Ver borrador"}</Link>{uiState.canCreateVersion ? <button type="button" onClick={() => void createFormula(item, uiState)} disabled={mutationPending || !uiState.canCreateVersion} className={actionClass}>{mutationPending ? "Creando..." : "Nueva versión"}</button> : null}</> : null}</div></article>;
      })}</section>}
      {!loading ? <nav className="mt-5 flex items-center justify-between rounded bg-[#e9eef1] p-3 text-sm font-bold"><button type="button" disabled={page <= 1} onClick={() => setPage((value) => value - 1)} className="rounded bg-[#123852] px-3 py-2 text-white disabled:opacity-40">Anterior</button><span>Página {meta.current_page} de {meta.last_page}</span><button type="button" disabled={page >= meta.last_page} onClick={() => setPage((value) => value + 1)} className="rounded bg-[#123852] px-3 py-2 text-white disabled:opacity-40">Siguiente</button></nav> : null}
    </div>
  );
}
