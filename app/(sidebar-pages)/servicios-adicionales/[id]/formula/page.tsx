"use client";

import AsyncCatalogSelector, { type AsyncCatalogItem } from "@/app/_components/async-catalog-selector";
import { useCatalogCapabilities } from "@/app/_components/catalog-permissions-provider";
import { apiFetch } from "@/app/_lib/api";
import { Trash2 } from "lucide-react";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";

type MaterialRow = { material_id: number; cantidad: string | number; porcentaje_merma?: string | number | null; nombre?: string };
type LaborRow = { proceso_produccion_id: number; costo_unitario: string | number; orden?: number | null; nombre?: string };
type Service = { nombre: string; metodo_calculo: string; precio_venta_actual: string | number; costo_actual: string | number };
type Costs = { resumen?: { costo_materiales?: string; costo_mano_obra?: string; costo_total?: string; precio_venta?: string } };
type ErrorPayload = { message?: string; errors?: Record<string, string[]> };
const firstError = (data: ErrorPayload | null, fallback: string) => data?.message ?? Object.values(data?.errors ?? {})[0]?.[0] ?? fallback;

export default function ServicioFormulaPage() {
  const { id } = useParams<{ id: string }>();
  const { canEdit } = useCatalogCapabilities("/servicios-adicionales");
  const [service, setService] = useState<Service | null>(null); const [materialRows, setMaterialRows] = useState<MaterialRow[]>([]); const [laborRows, setLaborRows] = useState<LaborRow[]>([]); const [costs, setCosts] = useState<Costs | null>(null); const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const [formulaResponse, costsResponse] = await Promise.all([apiFetch(`/servicios-adicionales/${id}/formula`), apiFetch(`/servicios-adicionales/${id}/costos`)]);
      const formula = await formulaResponse.json().catch(() => null); const costData = await costsResponse.json().catch(() => null);
      if (!formulaResponse.ok) throw new Error("load");
      setService(formula?.data); setCosts(costsResponse.ok ? costData?.data ?? null : null); setMaterialRows(formula?.data?.materiales ?? []); setLaborRows(formula?.data?.mano_obra ?? []);
    } catch { setError("No se pudo cargar la fórmula del servicio."); }
  }, [id]);
  useEffect(() => { void load(); }, [load]);

  async function save() {
    if (!canEdit) return;
    const response = await apiFetch(`/servicios-adicionales/${id}/formula`, { method: "PUT", body: JSON.stringify({ materiales: materialRows, mano_obra: laborRows }) }); const data = await response.json().catch(() => null);
    if (!response.ok) { setError(response.status === 403 ? "No tenés permiso para modificar costos." : firstError(data, response.status === 422 ? "Revisá los datos ingresados." : "No se pudo guardar la fórmula.")); return; }
    setError(""); toast.success("Costos productivos guardados."); await load();
  }
  const materialIds = materialRows.map((row) => row.material_id); const processIds = laborRows.map((row) => row.proceso_produccion_id); const price = Number(service?.precio_venta_actual ?? 0); const total = Number(costs?.resumen?.costo_total ?? 0); const margin = price > 0 ? ((price - total) / price) * 100 : 0;

  return <div className="w-full max-w-full overflow-x-hidden bg-[#456f89] px-3 py-4 text-[#08264d] sm:px-8 sm:py-7"><h1 className="text-[38px] font-extrabold leading-none text-white sm:text-[52px]">{service?.nombre ?? "Costos del servicio"}</h1><p className="mt-2 text-sm font-medium text-white/85">Método: {service?.metodo_calculo ?? "—"} · Precio cliente: C$ {price.toFixed(2)}</p>{error ? <p className="mt-4 rounded bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p> : null}<div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]"><main className="space-y-5"><section className="rounded-[8px] bg-[#e9eef1] p-5 shadow-lg"><div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-extrabold">Materiales adicionales</h2></div>{canEdit ? <AsyncCatalogSelector endpoint="/materiales" placeholder="Buscar material" excludedIds={materialIds} onSelect={(item: AsyncCatalogItem) => setMaterialRows([...materialRows, { material_id: item.id, cantidad: "", porcentaje_merma: null, nombre: item.nombre }])} /> : null}{materialRows.map((row, index) => <div key={`${row.material_id}-${index}`} className="mt-3 grid gap-2 sm:grid-cols-[1fr_120px_100px_36px]"><span className="rounded bg-white px-3 py-2 text-sm">{row.nombre ?? `Material #${row.material_id}`}</span><input disabled={!canEdit} type="number" step="0.0001" value={row.cantidad ?? ""} onChange={(event) => setMaterialRows(materialRows.map((item, i) => i === index ? { ...item, cantidad: event.target.value } : item))} className="h-10 rounded border px-2 text-sm" placeholder="Cantidad" /><input disabled={!canEdit} type="number" step="0.01" value={row.porcentaje_merma ?? ""} onChange={(event) => setMaterialRows(materialRows.map((item, i) => i === index ? { ...item, porcentaje_merma: event.target.value } : item))} className="h-10 rounded border px-2 text-sm" placeholder="Merma %" />{canEdit ? <button onClick={() => setMaterialRows(materialRows.filter((_, i) => i !== index))} aria-label="Quitar material"><Trash2 className="mx-auto h-4 w-4" /></button> : null}</div>)}</section><section className="rounded-[8px] bg-[#e9eef1] p-5 shadow-lg"><h2 className="mb-4 text-xl font-extrabold">Mano de obra adicional</h2>{canEdit ? <AsyncCatalogSelector endpoint="/procesos-produccion" placeholder="Buscar proceso" excludedIds={processIds} onSelect={(item) => setLaborRows([...laborRows, { proceso_produccion_id: item.id, costo_unitario: "", orden: undefined, nombre: item.nombre }])} /> : null}{laborRows.map((row, index) => <div key={`${row.proceso_produccion_id}-${index}`} className="mt-3 grid gap-2 sm:grid-cols-[1fr_120px_80px_36px]"><span className="rounded bg-white px-3 py-2 text-sm">{row.nombre ?? `Proceso #${row.proceso_produccion_id}`}</span><input disabled={!canEdit} type="number" step="0.01" value={row.costo_unitario ?? ""} onChange={(event) => setLaborRows(laborRows.map((item, i) => i === index ? { ...item, costo_unitario: event.target.value } : item))} className="h-10 rounded border px-2 text-sm" placeholder="Costo" /><input disabled={!canEdit} type="number" value={row.orden ?? ""} onChange={(event) => setLaborRows(laborRows.map((item, i) => i === index ? { ...item, orden: event.target.value === "" ? undefined : Number(event.target.value) } : item))} className="h-10 rounded border px-2 text-sm" placeholder="Orden" />{canEdit ? <button onClick={() => setLaborRows(laborRows.filter((_, i) => i !== index))} aria-label="Quitar proceso"><Trash2 className="mx-auto h-4 w-4" /></button> : null}</div>)}</section>{canEdit ? <button onClick={save} className="rounded bg-[#123852] px-4 py-2 text-sm font-bold text-white">Guardar costos</button> : null}</main><aside className="rounded-[8px] bg-[#e9eef1] p-5 shadow-lg"><h2 className="text-xl font-extrabold">Resumen por unidad</h2><div className="mt-4 space-y-2 text-sm"><p className="flex justify-between"><span>Costo base</span><b>C$ {Number(service?.costo_actual ?? 0).toFixed(2)}</b></p><p className="flex justify-between"><span>Materiales</span><b>C$ {Number(costs?.resumen?.costo_materiales ?? 0).toFixed(2)}</b></p><p className="flex justify-between"><span>Mano de obra</span><b>C$ {Number(costs?.resumen?.costo_mano_obra ?? 0).toFixed(2)}</b></p><p className="flex justify-between font-bold"><span>Costo interno</span><b>C$ {total.toFixed(2)}</b></p><p className="flex justify-between"><span>Margen</span><b>{Number.isFinite(margin) ? `${margin.toFixed(2)}%` : "—"}</b></p></div></aside></div></div>;
}
