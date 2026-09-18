"use client";

import { useCatalogCapabilities } from "@/app/_components/catalog-permissions-provider";
import { apiFetch } from "@/app/_lib/api";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";

type Row = { material_id?: number; proceso_produccion_id?: number; cantidad?: string | number; costo_unitario?: string | number; porcentaje_merma?: string | number | null; orden?: number | null };
type Option = { id: number; nombre: string };
type Service = { nombre: string; metodo_calculo: string; precio_venta_actual: string | number; costo_actual: string | number };
type ServiceCosts = { resumen?: { costo_materiales?: string; costo_mano_obra?: string; costo_total?: string } };

export default function ServicioFormulaPage() {
  const { id } = useParams<{ id: string }>();
  const { canEdit } = useCatalogCapabilities("/servicios-adicionales");
  const [service, setService] = useState<Service | null>(null);
  const [materials, setMaterials] = useState<Option[]>([]);
  const [processes, setProcesses] = useState<Option[]>([]);
  const [materialRows, setMaterialRows] = useState<Row[]>([]);
  const [laborRows, setLaborRows] = useState<Row[]>([]);
  const [costs, setCosts] = useState<ServiceCosts | null>(null);

  const load = useCallback(async () => {
    const [formulaResponse, costsResponse, materialsResponse, processesResponse] = await Promise.all([apiFetch(`/servicios-adicionales/${id}/formula`), apiFetch(`/servicios-adicionales/${id}/costos`), apiFetch("/materiales?per_page=100"), apiFetch("/procesos-produccion?per_page=100")]);
    const formula = await formulaResponse.json().catch(() => null); const costData = await costsResponse.json().catch(() => null); const materialData = await materialsResponse.json().catch(() => null); const processData = await processesResponse.json().catch(() => null);
    if (!formulaResponse.ok) throw new Error("No autorizado");
    setService(formula?.data); setCosts(costData?.data ?? null); setMaterials(materialData?.data ?? []); setProcesses(processData?.data ?? []); setMaterialRows(formula?.data?.materiales ?? []); setLaborRows(formula?.data?.mano_obra ?? []);
  }, [id]);
  useEffect(() => { void Promise.resolve().then(load); }, [load]);

  async function save() {
    if (!canEdit) return;
    const response = await apiFetch(`/servicios-adicionales/${id}/formula`, { method: "PUT", body: JSON.stringify({ materiales: materialRows, mano_obra: laborRows }) });
    if (!response.ok) return;
    toast.success("Costos productivos guardados."); await load();
  }

  return <div className="w-full max-w-full overflow-x-hidden bg-[#456f89] px-3 py-4 text-[#08264d] sm:px-8 sm:py-7"><h1 className="text-[38px] font-extrabold leading-none text-white sm:text-[52px]">{service?.nombre ?? "Costos del servicio"}</h1><p className="mt-2 text-sm font-medium text-white/85">Método: {service?.metodo_calculo ?? "—"} · Precio cliente: C$ {Number(service?.precio_venta_actual ?? 0).toFixed(2)}</p><div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]"><main className="space-y-5"><section className="rounded-[8px] bg-[#e9eef1] p-5 shadow-lg"><div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-extrabold">Materiales adicionales</h2>{canEdit ? <button onClick={() => setMaterialRows([...materialRows, { material_id: materials[0]?.id, cantidad: "", porcentaje_merma: null }])} className="rounded bg-white px-3 py-2 text-sm font-bold">+ Agregar</button> : null}</div>{materialRows.map((row, index) => <div key={index} className="mb-2 grid gap-2 sm:grid-cols-[1fr_120px]"><select disabled={!canEdit} value={row.material_id} onChange={(event) => setMaterialRows(materialRows.map((item, itemIndex) => itemIndex === index ? { ...item, material_id: Number(event.target.value) } : item))} className="h-10 rounded bg-white px-2 text-sm">{materials.map((item) => <option key={item.id} value={item.id}>{item.nombre}</option>)}</select><input disabled={!canEdit} type="number" step="0.0001" value={row.cantidad ?? ""} placeholder="Cantidad" onChange={(event) => setMaterialRows(materialRows.map((item, itemIndex) => itemIndex === index ? { ...item, cantidad: event.target.value } : item))} className="h-10 rounded bg-white px-2 text-sm" /></div>)}</section><section className="rounded-[8px] bg-[#e9eef1] p-5 shadow-lg"><div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-extrabold">Mano de obra adicional</h2>{canEdit ? <button onClick={() => setLaborRows([...laborRows, { proceso_produccion_id: processes[0]?.id, costo_unitario: "" }])} className="rounded bg-white px-3 py-2 text-sm font-bold">+ Agregar</button> : null}</div>{laborRows.map((row, index) => <div key={index} className="mb-2 grid gap-2 sm:grid-cols-[1fr_120px]"><select disabled={!canEdit} value={row.proceso_produccion_id} onChange={(event) => setLaborRows(laborRows.map((item, itemIndex) => itemIndex === index ? { ...item, proceso_produccion_id: Number(event.target.value) } : item))} className="h-10 rounded bg-white px-2 text-sm">{processes.map((item) => <option key={item.id} value={item.id}>{item.nombre}</option>)}</select><input disabled={!canEdit} type="number" step="0.01" value={row.costo_unitario ?? ""} placeholder="Costo" onChange={(event) => setLaborRows(laborRows.map((item, itemIndex) => itemIndex === index ? { ...item, costo_unitario: event.target.value } : item))} className="h-10 rounded bg-white px-2 text-sm" /></div>)}</section>{canEdit ? <button onClick={save} className="rounded bg-[#123852] px-4 py-2 text-sm font-bold text-white">Guardar costos</button> : null}</main><aside className="rounded-[8px] bg-[#e9eef1] p-5 shadow-lg"><h2 className="text-xl font-extrabold">Resumen por unidad</h2><div className="mt-4 space-y-2 text-sm"><p className="flex justify-between"><span>Costo base</span><b>C$ {Number(service?.costo_actual ?? 0).toFixed(2)}</b></p><p className="flex justify-between"><span>Materiales</span><b>C$ {Number(costs?.resumen?.costo_materiales ?? 0).toFixed(2)}</b></p><p className="flex justify-between"><span>Mano de obra</span><b>C$ {Number(costs?.resumen?.costo_mano_obra ?? 0).toFixed(2)}</b></p><p className="flex justify-between text-base font-bold"><span>Costo interno</span><b>C$ {Number(costs?.resumen?.costo_total ?? 0).toFixed(2)}</b></p></div></aside></div></div>;
}
