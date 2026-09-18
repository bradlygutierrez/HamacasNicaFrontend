"use client";

import AsyncCatalogSelector, { type AsyncCatalogItem } from "@/app/_components/async-catalog-selector";
import { useCatalogCapabilities } from "@/app/_components/catalog-permissions-provider";
import { apiFetch } from "@/app/_lib/api";
import { Check, Plus, Trash2 } from "lucide-react";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";

type MaterialRow = { material_id: number; cantidad: string; porcentaje_merma: string };
type LaborRow = { proceso_produccion_id: number; costo_unitario: string; orden: string };
type Recipe = { id: number; version: number; estado: string; observaciones?: string | null; materiales?: Array<{ material_id: number; cantidad: string; porcentaje_merma: string | null }>; mano_obra?: Array<{ proceso_produccion_id: number; costo_unitario: string; orden: number | null }> };
type CostMaterial = { material_id: number; nombre: string; unidad_consumo: string; merma: string; costo: string };
type Costs = { materiales: CostMaterial[]; resumen: { costo_materiales: string; costo_mano_obra: string; costo_produccion: string } };

const money = (value: string | number | undefined) => `C$ ${Number(value ?? 0).toFixed(2)}`;
type ErrorPayload = { message?: string; errors?: Record<string, string[]> };
const firstError = (data: ErrorPayload | null, fallback: string) => data?.message ?? Object.values(data?.errors ?? {})[0]?.[0] ?? fallback;

export default function FormulaEditorPage() {
  const { hamacaId } = useParams<{ hamacaId: string }>();
  const { canCreate, canEdit, canDelete } = useCatalogCapabilities("/formulas");
  const [hamaca, setHamaca] = useState<{ nombre: string; precio?: string | number } | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [draft, setDraft] = useState<Recipe | null>(null);
  const [active, setActive] = useState<Recipe | null>(null);
  const [materialRows, setMaterialRows] = useState<MaterialRow[]>([]);
  const [laborRows, setLaborRows] = useState<LaborRow[]>([]);
  const [costs, setCosts] = useState<Costs | null>(null);
  const [historyRecipe, setHistoryRecipe] = useState<Recipe | null>(null);
  const [historyCosts, setHistoryCosts] = useState<Costs | null>(null);
  const [error, setError] = useState("");

  const loadRecipe = useCallback(async () => {
    try {
      const [hamacaResponse, recipesResponse] = await Promise.all([apiFetch(`/hamacas/${hamacaId}`), apiFetch(`/hamacas/${hamacaId}/recetas`)]);
      const hamacaData = await hamacaResponse.json().catch(() => null);
      const recipesData = await recipesResponse.json().catch(() => null);
      if (!hamacaResponse.ok || !recipesResponse.ok) throw new Error("load");
      const loaded: Recipe[] = Array.isArray(recipesData?.data) ? recipesData.data : [];
      const nextDraft = loaded.find((recipe) => recipe.estado === "borrador") ?? null;
      const nextActive = loaded.find((recipe) => recipe.estado === "activa") ?? null;
      const selected = nextDraft ?? nextActive;
      setHamaca(hamacaData?.data ?? null); setRecipes(loaded); setDraft(nextDraft); setActive(nextActive);
      setMaterialRows((nextDraft?.materiales ?? []).map((row) => ({ material_id: row.material_id, cantidad: row.cantidad, porcentaje_merma: row.porcentaje_merma ?? "" })));
      setLaborRows((nextDraft?.mano_obra ?? []).map((row) => ({ proceso_produccion_id: row.proceso_produccion_id, costo_unitario: row.costo_unitario, orden: String(row.orden ?? "") })));
      if (selected) { const costsResponse = await apiFetch(`/recetas-hamaca/${selected.id}/costos`); const costsData = await costsResponse.json().catch(() => null); setCosts(costsResponse.ok ? costsData?.data ?? null : null); } else setCosts(null);
    } catch { setError("No se pudo cargar la fórmula."); }
  }, [hamacaId]);

  useEffect(() => { void loadRecipe(); }, [loadRecipe]);

  async function handleAction(path: string, options: RequestInit, success?: string) {
    const response = await apiFetch(path, options); const data = await response.json().catch(() => null);
    if (!response.ok) { setError(response.status === 403 ? "No tenés permiso para esta acción." : firstError(data, response.status === 409 ? "La operación no es válida para el estado actual." : "No se pudo completar la operación.")); return false; }
    if (success) toast.success(success); setError(""); await loadRecipe(); return true;
  }

  async function saveDraft() {
    if (!draft || !canEdit) return;
    await handleAction(`/recetas-hamaca/${draft.id}`, { method: "PUT", body: JSON.stringify({ materiales: materialRows.map((row) => ({ material_id: row.material_id, cantidad: Number(row.cantidad), porcentaje_merma: row.porcentaje_merma === "" ? null : Number(row.porcentaje_merma) })), mano_obra: laborRows.map((row) => ({ proceso_produccion_id: row.proceso_produccion_id, costo_unitario: Number(row.costo_unitario), orden: row.orden === "" ? null : Number(row.orden) })) }) }, "Borrador guardado.");
  }
  async function createDraft() { if (canCreate) await handleAction(`/hamacas/${hamacaId}/recetas`, { method: "POST" }, "Borrador creado."); }
  async function activateDraft() { if (draft && canEdit) await handleAction(`/recetas-hamaca/${draft.id}/activar`, { method: "POST" }, "Receta activada."); }
  async function discardDraft() { if (draft && canDelete) await handleAction(`/recetas-hamaca/${draft.id}/descartar`, { method: "POST" }, "Borrador descartado."); }

  async function inspectHistory(recipe: Recipe) {
    if (recipe.estado === "borrador") return;
    const response = await apiFetch(`/recetas-hamaca/${recipe.id}`); const data = await response.json().catch(() => null);
    if (!response.ok) { setError("No se pudo consultar la versión histórica."); return; }
    setHistoryRecipe(data?.data ?? null); const costsResponse = await apiFetch(`/recetas-hamaca/${recipe.id}/costos`); const costsData = await costsResponse.json().catch(() => null); setHistoryCosts(costsResponse.ok ? costsData?.data ?? null : null);
  }

  const selectedIds = materialRows.map((row) => row.material_id);
  const laborIds = laborRows.map((row) => row.proceso_produccion_id);
  const activeCost = Number(hamaca?.precio ?? 0) - Number(costs?.resumen.costo_produccion ?? 0);
  const margin = Number(hamaca?.precio ?? 0) > 0 ? (activeCost / Number(hamaca?.precio ?? 0)) * 100 : 0;

  return <div className="w-full max-w-full overflow-x-hidden bg-[#456f89] px-3 py-4 text-[#08264d] sm:px-8 sm:py-7"><header className="mb-6"><h1 className="text-[38px] font-extrabold leading-none text-white sm:text-[52px]">{hamaca?.nombre ?? "Fórmula"}</h1><p className="mt-2 text-sm font-medium text-white/85">Recetas versionadas y costo actual estimado.</p></header>{error ? <p className="mb-4 rounded bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p> : null}<div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]"><main className="space-y-5"><section className="rounded-[8px] bg-[#e9eef1] p-5 shadow-lg"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-extrabold">{draft ? `Borrador v${draft.version}` : active ? `Activa v${active.version}` : "Sin fórmula"}</h2><p className="text-sm font-semibold text-[#456f89]">Activa: {active ? `v${active.version}` : "—"} · Borrador: {draft ? `v${draft.version}` : "—"}</p></div><div className="flex flex-wrap gap-2">{!draft && canCreate ? <button onClick={createDraft} className="rounded bg-[#123852] px-3 py-2 text-sm font-bold text-white">Crear versión</button> : null}{draft && canEdit ? <><button onClick={saveDraft} className="flex items-center gap-1 rounded bg-[#123852] px-3 py-2 text-sm font-bold text-white"><Check className="h-4 w-4" />Guardar</button><button onClick={activateDraft} className="rounded bg-emerald-700 px-3 py-2 text-sm font-bold text-white">Activar</button></> : null}{draft && canDelete ? <button onClick={discardDraft} className="rounded bg-red-700 px-3 py-2 text-sm font-bold text-white">Descartar</button> : null}</div></div></section>
      {draft && canEdit ? <section className="rounded-[8px] bg-[#e9eef1] p-5 shadow-lg"><div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-extrabold">Materiales</h2><Plus className="h-5 w-5" /></div><AsyncCatalogSelector endpoint="/materiales" placeholder="Buscar material" excludedIds={selectedIds} onSelect={(item: AsyncCatalogItem) => setMaterialRows([...materialRows, { material_id: item.id, cantidad: "", porcentaje_merma: "" }])} />{materialRows.map((row, index) => { const detail = costs?.materiales.find((item) => item.material_id === row.material_id); return <div key={`${row.material_id}-${index}`} className="mt-3 grid gap-2 rounded bg-white p-3 sm:grid-cols-[1fr_110px_130px_36px]"><div><p className="font-bold">{detail?.nombre ?? `Material #${row.material_id}`}</p><p className="text-xs text-[#456f89]">{row.cantidad || "—"} {detail?.unidad_consumo ?? "unidad"} · Merma: {row.porcentaje_merma === "" ? `Predeterminada (${detail?.merma ?? "0.00"}%)` : `${row.porcentaje_merma}%`}</p><p className="text-xs font-semibold">Costo: {detail ? money(detail.costo) : "se actualiza al consultar costos"}</p></div><input type="number" step="0.0001" value={row.cantidad} onChange={(event) => setMaterialRows(materialRows.map((item, i) => i === index ? { ...item, cantidad: event.target.value } : item))} placeholder="Cantidad" className="h-10 rounded border px-2 text-sm" /><input type="number" step="0.01" value={row.porcentaje_merma} onChange={(event) => setMaterialRows(materialRows.map((item, i) => i === index ? { ...item, porcentaje_merma: event.target.value } : item))} placeholder="Merma %" className="h-10 rounded border px-2 text-sm" /><button onClick={() => setMaterialRows(materialRows.filter((_, i) => i !== index))} className="rounded" aria-label="Quitar material"><Trash2 className="mx-auto h-4 w-4" /></button></div>; })}</section> : null}
      {draft && canEdit ? <section className="rounded-[8px] bg-[#e9eef1] p-5 shadow-lg"><h2 className="mb-4 text-xl font-extrabold">Mano de obra</h2><AsyncCatalogSelector endpoint="/procesos-produccion" placeholder="Buscar proceso" excludedIds={laborIds} onSelect={(item) => setLaborRows([...laborRows, { proceso_produccion_id: item.id, costo_unitario: "", orden: "" }])} />{laborRows.map((row, index) => <div key={`${row.proceso_produccion_id}-${index}`} className="mt-3 grid gap-2 sm:grid-cols-[1fr_120px_80px_36px]"><span className="rounded bg-white px-3 py-2 text-sm">Proceso #{row.proceso_produccion_id}</span><input type="number" step="0.01" value={row.costo_unitario} onChange={(event) => setLaborRows(laborRows.map((item, i) => i === index ? { ...item, costo_unitario: event.target.value } : item))} placeholder="Costo" className="h-10 rounded border px-2 text-sm" /><input type="number" value={row.orden} onChange={(event) => setLaborRows(laborRows.map((item, i) => i === index ? { ...item, orden: event.target.value } : item))} placeholder="Orden" className="h-10 rounded border px-2 text-sm" /><button onClick={() => setLaborRows(laborRows.filter((_, i) => i !== index))} aria-label="Quitar proceso"><Trash2 className="mx-auto h-4 w-4" /></button></div>)}</section> : null}
    </main><aside className="space-y-5"><section className="rounded-[8px] bg-[#e9eef1] p-5 shadow-lg"><h2 className="text-xl font-extrabold">Historial y costos</h2><div className="mt-4 space-y-2">{recipes.map((recipe) => <button type="button" key={recipe.id} onClick={() => void inspectHistory(recipe)} className="block w-full rounded bg-white p-3 text-left text-sm"><b>v{recipe.version}</b> <span className="capitalize">{recipe.estado}</span>{recipe.estado !== "borrador" ? " · Ver" : ""}</button>)}</div><div className="mt-5 space-y-2 border-t border-[#123852]/20 pt-4 text-sm"><p className="flex justify-between"><span>Materiales</span><b>{money(costs?.resumen.costo_materiales)}</b></p><p className="flex justify-between"><span>Mano de obra</span><b>{money(costs?.resumen.costo_mano_obra)}</b></p><p className="flex justify-between text-base"><span>Producción</span><b>{money(costs?.resumen.costo_produccion)}</b></p><p className="flex justify-between"><span>Precio venta</span><b>{money(hamaca?.precio)}</b></p><p className="flex justify-between"><span>Margen bruto</span><b>{money(activeCost)}</b></p><p className="flex justify-between"><span>Margen</span><b>{Number.isFinite(margin) ? `${margin.toFixed(2)}%` : "—"}</b></p></div></section>{historyRecipe ? <section className="rounded-[8px] bg-white p-5 shadow-lg"><h2 className="text-lg font-extrabold">Vista histórica v{historyRecipe.version}</h2><p className="text-sm capitalize">Estado: {historyRecipe.estado}</p><p className="mt-2 text-sm">Materiales: {historyRecipe.materiales?.length ?? 0} · Mano de obra: {historyRecipe.mano_obra?.length ?? 0}</p><p className="text-sm">Costo: {money(historyCosts?.resumen.costo_produccion)}</p></section> : null}</aside></div></div>;
}
