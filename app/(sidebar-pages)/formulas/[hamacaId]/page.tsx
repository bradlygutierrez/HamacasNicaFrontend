"use client";

import { useCatalogCapabilities } from "@/app/_components/catalog-permissions-provider";
import { apiFetch } from "@/app/_lib/api";
import { Check, Plus, Trash2, X } from "lucide-react";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";

type Option = { id: number; nombre: string; unidad_consumo?: string; porcentaje_merma?: string | number };
type MaterialRow = { material_id: number; cantidad: string; porcentaje_merma: string };
type LaborRow = { proceso_produccion_id: number; costo_unitario: string; orden: string };
type Recipe = { id: number; version: number; estado: string; observaciones?: string | null; materiales?: Array<{ material_id: number; cantidad: string; porcentaje_merma: string | null }>; mano_obra?: Array<{ proceso_produccion_id: number; costo_unitario: string; orden: number | null }> };
type Costs = { resumen: { costo_materiales: string; costo_mano_obra: string; costo_produccion: string } };

const money = (value: string | number | undefined) => `C$ ${Number(value ?? 0).toFixed(2)}`;

export default function FormulaEditorPage() {
  const { hamacaId } = useParams<{ hamacaId: string }>();
  const { canCreate, canEdit, canDelete } = useCatalogCapabilities("/formulas");
  const [hamaca, setHamaca] = useState<{ nombre: string; precio?: string | number } | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [materials, setMaterials] = useState<Option[]>([]);
  const [processes, setProcesses] = useState<Option[]>([]);
  const [draft, setDraft] = useState<Recipe | null>(null);
  const [active, setActive] = useState<Recipe | null>(null);
  const [materialRows, setMaterialRows] = useState<MaterialRow[]>([]);
  const [laborRows, setLaborRows] = useState<LaborRow[]>([]);
  const [costs, setCosts] = useState<Costs | null>(null);
  const [error, setError] = useState("");
  const [materialSearch, setMaterialSearch] = useState("");
  const [processSearch, setProcessSearch] = useState("");

  const load = useCallback(async () => {
    const [hamacaResponse, recipesResponse, materialResponse, processResponse] = await Promise.all([
      apiFetch(`/hamacas/${hamacaId}`), apiFetch(`/hamacas/${hamacaId}/recetas`),
      apiFetch(`/materiales?search=${encodeURIComponent(materialSearch)}&per_page=100`), apiFetch(`/procesos-produccion?search=${encodeURIComponent(processSearch)}&per_page=100`),
    ]);
    const hamacaData = await hamacaResponse.json().catch(() => null);
    const recipesData = await recipesResponse.json().catch(() => null);
    const materialData = await materialResponse.json().catch(() => null);
    const processData = await processResponse.json().catch(() => null);
    if (!hamacaResponse.ok || !recipesResponse.ok) throw new Error("No se pudo cargar la fórmula");
    const loadedRecipes: Recipe[] = recipesData?.data ?? [];
    setHamaca(hamacaData?.data ?? null); setRecipes(loadedRecipes);
    const nextDraft = loadedRecipes.find((recipe) => recipe.estado === "borrador") ?? null;
    const nextActive = loadedRecipes.find((recipe) => recipe.estado === "activa") ?? null;
    setDraft(nextDraft); setActive(nextActive);
    const selected = nextDraft ?? nextActive;
    setMaterialRows((selected?.materiales ?? []).map((row) => ({ material_id: row.material_id, cantidad: row.cantidad, porcentaje_merma: row.porcentaje_merma ?? "" })));
    setLaborRows((selected?.mano_obra ?? []).map((row) => ({ proceso_produccion_id: row.proceso_produccion_id, costo_unitario: row.costo_unitario, orden: String(row.orden ?? "") })));
    setMaterials(materialData?.data ?? []); setProcesses(processData?.data ?? []);
    if (selected) {
      const costsResponse = await apiFetch(`/recetas-hamaca/${selected.id}/costos`);
      const costsData = costsResponse.ok ? await costsResponse.json().catch(() => null) : null;
      setCosts(costsData?.data ?? null);
    }
  }, [hamacaId, materialSearch, processSearch]);

  useEffect(() => {
    void Promise.resolve().then(load).catch(() => setError("No se pudo cargar la fórmula."));
  }, [load]);

  async function createDraft() { const response = await apiFetch(`/hamacas/${hamacaId}/recetas`, { method: "POST" }); if (!response.ok) { setError("No se pudo crear el borrador."); return; } await load(); }
  async function saveDraft() { if (!draft || !canEdit) return; const response = await apiFetch(`/recetas-hamaca/${draft.id}`, { method: "PUT", body: JSON.stringify({ materiales: materialRows.map((row) => ({ ...row, cantidad: Number(row.cantidad), porcentaje_merma: row.porcentaje_merma === "" ? null : Number(row.porcentaje_merma) })), mano_obra: laborRows.map((row) => ({ ...row, costo_unitario: Number(row.costo_unitario), orden: row.orden === "" ? null : Number(row.orden) })) }) }); if (!response.ok) { setError("No se pudo guardar el borrador."); return; } toast.success("Borrador guardado."); await load(); }
  async function activateDraft() { if (!draft || !canEdit) return; const response = await apiFetch(`/recetas-hamaca/${draft.id}/activar`, { method: "POST" }); if (!response.ok) { setError("No se pudo activar la receta."); return; } await load(); }
  async function discardDraft() { if (!draft || !canDelete) return; const response = await apiFetch(`/recetas-hamaca/${draft.id}/descartar`, { method: "POST" }); if (!response.ok) { setError("No se pudo descartar el borrador."); return; } await load(); }
  const selected = draft ?? active;

  return <div className="w-full max-w-full overflow-x-hidden bg-[#456f89] px-3 py-4 text-[#08264d] sm:px-8 sm:py-7"><header className="mb-6 flex items-start justify-between gap-4"><div><h1 className="text-[38px] font-extrabold leading-none text-white sm:text-[52px]">{hamaca?.nombre ?? "Fórmula"}</h1><p className="mt-2 text-sm font-medium text-white/85">Recetas versionadas y costo actual estimado.</p></div></header>{error ? <p className="mb-4 rounded bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p> : null}<div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]"><main className="space-y-5"><section className="rounded-[8px] bg-[#e9eef1] p-5 shadow-lg"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-extrabold">Receta {selected ? `v${selected.version}` : ""}</h2><p className="text-sm font-semibold text-[#456f89]">Activa: {active ? `v${active.version}` : "—"} · Borrador: {draft ? `v${draft.version}` : "—"}</p></div><div className="flex flex-wrap gap-2">{!draft && canCreate ? <button onClick={createDraft} className="rounded bg-[#123852] px-3 py-2 text-sm font-bold text-white">Crear versión</button> : null}{draft && canEdit ? <><button onClick={saveDraft} className="flex items-center gap-1 rounded bg-[#123852] px-3 py-2 text-sm font-bold text-white"><Check className="h-4 w-4" />Guardar</button><button onClick={activateDraft} className="rounded bg-emerald-700 px-3 py-2 text-sm font-bold text-white">Activar</button></> : null}{draft && canDelete ? <button onClick={discardDraft} className="rounded bg-red-700 px-3 py-2 text-sm font-bold text-white">Descartar</button> : null}</div></div></section>{draft && canEdit ? <section className="rounded-[8px] bg-[#e9eef1] p-5 shadow-lg"><div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-extrabold">Materiales</h2><button onClick={() => setMaterialRows([...materialRows, { material_id: materials[0]?.id ?? 0, cantidad: "", porcentaje_merma: "" }])} className="flex items-center gap-1 rounded bg-white px-3 py-2 text-sm font-bold"><Plus className="h-4 w-4" />Agregar</button></div><input value={materialSearch} onChange={(event) => setMaterialSearch(event.target.value)} placeholder="Buscar material" className="mb-3 h-10 w-full rounded bg-white px-3 text-sm" />{materialRows.map((row, index) => <div key={`${row.material_id}-${index}`} className="mb-2 grid gap-2 sm:grid-cols-[1fr_110px_110px_36px]"><select value={row.material_id} onChange={(event) => setMaterialRows(materialRows.map((item, rowIndex) => rowIndex === index ? { ...item, material_id: Number(event.target.value) } : item))} className="h-10 rounded bg-white px-2 text-sm">{materials.map((item) => <option key={item.id} value={item.id}>{item.nombre}</option>)}</select><input type="number" step="0.0001" value={row.cantidad} placeholder="Cantidad" onChange={(event) => setMaterialRows(materialRows.map((item, rowIndex) => rowIndex === index ? { ...item, cantidad: event.target.value } : item))} className="h-10 rounded bg-white px-2 text-sm" /><input type="number" step="0.01" value={row.porcentaje_merma} placeholder="Merma %" onChange={(event) => setMaterialRows(materialRows.map((item, rowIndex) => rowIndex === index ? { ...item, porcentaje_merma: event.target.value } : item))} className="h-10 rounded bg-white px-2 text-sm" /><button onClick={() => setMaterialRows(materialRows.filter((_, rowIndex) => rowIndex !== index))} className="rounded bg-white" aria-label="Quitar material"><X className="mx-auto h-4 w-4" /></button></div>)}</section> : null}{draft && canEdit ? <section className="rounded-[8px] bg-[#e9eef1] p-5 shadow-lg"><div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-extrabold">Mano de obra</h2><button onClick={() => setLaborRows([...laborRows, { proceso_produccion_id: processes[0]?.id ?? 0, costo_unitario: "", orden: "" }])} className="flex items-center gap-1 rounded bg-white px-3 py-2 text-sm font-bold"><Plus className="h-4 w-4" />Agregar</button></div><input value={processSearch} onChange={(event) => setProcessSearch(event.target.value)} placeholder="Buscar proceso" className="mb-3 h-10 w-full rounded bg-white px-3 text-sm" />{laborRows.map((row, index) => <div key={`${row.proceso_produccion_id}-${index}`} className="mb-2 grid gap-2 sm:grid-cols-[1fr_120px_80px_36px]"><select value={row.proceso_produccion_id} onChange={(event) => setLaborRows(laborRows.map((item, rowIndex) => rowIndex === index ? { ...item, proceso_produccion_id: Number(event.target.value) } : item))} className="h-10 rounded bg-white px-2 text-sm">{processes.map((item) => <option key={item.id} value={item.id}>{item.nombre}</option>)}</select><input type="number" step="0.01" value={row.costo_unitario} placeholder="Costo" onChange={(event) => setLaborRows(laborRows.map((item, rowIndex) => rowIndex === index ? { ...item, costo_unitario: event.target.value } : item))} className="h-10 rounded bg-white px-2 text-sm" /><input type="number" value={row.orden} placeholder="Orden" onChange={(event) => setLaborRows(laborRows.map((item, rowIndex) => rowIndex === index ? { ...item, orden: event.target.value } : item))} className="h-10 rounded bg-white px-2 text-sm" /><button onClick={() => setLaborRows(laborRows.filter((_, rowIndex) => rowIndex !== index))} className="rounded bg-white" aria-label="Quitar proceso"><Trash2 className="mx-auto h-4 w-4" /></button></div>)}</section> : null}</main><aside className="rounded-[8px] bg-[#e9eef1] p-5 shadow-lg"><h2 className="text-xl font-extrabold">Historial y costos</h2><div className="mt-4 space-y-2">{recipes.map((recipe) => <div key={recipe.id} className="rounded bg-white p-3 text-sm"><b>v{recipe.version}</b> <span className="capitalize">{recipe.estado}</span></div>)}</div><div className="mt-5 space-y-2 border-t border-[#123852]/20 pt-4 text-sm"> <p className="flex justify-between"><span>Materiales</span><b>{money(costs?.resumen.costo_materiales)}</b></p><p className="flex justify-between"><span>Mano de obra</span><b>{money(costs?.resumen.costo_mano_obra)}</b></p><p className="flex justify-between text-base"><span>Producción</span><b>{money(costs?.resumen.costo_produccion)}</b></p><p className="flex justify-between"><span>Precio venta</span><b>{money(hamaca?.precio)}</b></p></div></aside></div></div>;
}
