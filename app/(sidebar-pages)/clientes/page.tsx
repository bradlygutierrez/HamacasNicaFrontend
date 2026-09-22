"use client";

import { useCatalogCapabilities } from "@/app/_components/catalog-permissions-provider";
import { apiFetch } from "@/app/_lib/api";
import { Pencil, RotateCcw, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

type Cliente = { id: number; nombre: string; ruc?: string | null; telefono?: string | null; correo?: string | null; direccion?: string | null; state?: boolean };
type FormState = Omit<Cliente, "id" | "state">;
type Meta = { current_page: number; last_page: number; total: number };
type ErrorPayload = { message?: string; errors?: Record<string, string[]> };

const emptyForm: FormState = { nombre: "", ruc: "", telefono: "", correo: "", direccion: "" };
const messageFrom = (data: ErrorPayload | null, fallback: string) => data?.message ?? Object.values(data?.errors ?? {})[0]?.[0] ?? fallback;

export default function ClientesPage() {
  const { canCreate, canEdit, canDelete } = useCatalogCapabilities("/clientes");
  const [items, setItems] = useState<Cliente[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editing, setEditing] = useState<Cliente | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<Meta>({ current_page: 1, last_page: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const response = await apiFetch(`/clientes?search=${encodeURIComponent(search)}&page=${page}&per_page=15`);
        const data = await response.json().catch(() => null);
        if (!response.ok) throw new Error("load");
        setItems(Array.isArray(data?.data) ? data.data : []);
        setMeta(data?.meta ?? { current_page: page, last_page: 1, total: 0 });
      } catch {
        setError("No se pudieron cargar los clientes.");
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => window.clearTimeout(timer);
  }, [page, search]);

  function resetForm() {
    setForm(emptyForm);
    setEditing(null);
    setError("");
  }

  function startEdit(item: Cliente) {
    setEditing(item);
    setForm({ nombre: item.nombre, ruc: item.ruc ?? "", telefono: item.telefono ?? "", correo: item.correo ?? "", direccion: item.direccion ?? "" });
    setError("");
  }

  async function save() {
    if (editing ? !canEdit : !canCreate) return;
    setSaving(true);
    setError("");
    try {
      const response = await apiFetch(editing ? `/clientes/${editing.id}` : "/clientes", { method: editing ? "PUT" : "POST", body: JSON.stringify({ ...form, ruc: form.ruc || null, telefono: form.telefono || null, correo: form.correo || null, direccion: form.direccion || null }) });
      const data = await response.json().catch(() => null);
      if (!response.ok) { setError(messageFrom(data, "No se pudo guardar el cliente.")); return; }
      toast.success(editing ? "Cliente actualizado correctamente." : "Cliente registrado correctamente.");
      resetForm();
      setPage(1);
      const refreshed = await apiFetch(`/clientes?search=${encodeURIComponent(search)}&page=1&per_page=15`);
      const refreshedData = await refreshed.json().catch(() => null);
      if (refreshed.ok) { setItems(refreshedData?.data ?? []); setMeta(refreshedData?.meta ?? { current_page: 1, last_page: 1, total: 0 }); }
    } catch { setError("No se pudo conectar con el servicio de clientes."); } finally { setSaving(false); }
  }

  async function deactivate(item: Cliente) {
    if (!canDelete || !window.confirm("¿Desactivar este cliente?")) return;
    const response = await apiFetch(`/clientes/${item.id}`, { method: "DELETE" });
    const data = await response.json().catch(() => null);
    if (!response.ok) { setError(messageFrom(data, "No se pudo desactivar el cliente.")); return; }
    toast.success("Cliente desactivado correctamente.");
    setItems(items.filter((current) => current.id !== item.id));
  }

  return <div className="w-full max-w-full overflow-x-hidden bg-[#456f89] px-3 py-4 text-[#08264d] sm:px-8 sm:py-7"><header className="mb-6 flex flex-col gap-4 lg:mb-8"><div><h1 className="text-[42px] font-extrabold leading-none text-white sm:text-[56px]">Clientes</h1><p className="mt-2 text-sm font-medium text-white/85">Registra y administra clientes para tus proformas.</p></div><div className="flex flex-col gap-3 sm:flex-row"><div className="relative h-[46px] flex-1 lg:max-w-[650px]"><Search className="absolute left-4 top-1/2 h-6 w-6 -translate-y-1/2" /><input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Buscar por nombre, RUC, teléfono o correo" className="h-full w-full rounded-[8px] bg-[#f7f7f7] pl-14 pr-4 text-base outline-none sm:text-lg" /></div></div></header>{error ? <p role="alert" className="mb-4 rounded bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p> : null}<main className="grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">{canCreate || (editing && canEdit) ? <section className="rounded-[8px] bg-[#e9eef1] p-5 shadow-lg"><div className="mb-5 flex items-start justify-between"><div><p className="text-xs font-bold uppercase text-[#456f89]">{editing ? "Editar cliente" : "Nuevo cliente"}</p><h2 className="text-2xl font-extrabold">{editing?.nombre ?? "Cliente"}</h2></div>{editing ? <button type="button" onClick={resetForm} aria-label="Cancelar edición"><X /></button> : null}</div><div className="space-y-3">{([['nombre', 'Nombre', true], ['ruc', 'RUC', false], ['telefono', 'Teléfono', false], ['correo', 'Correo', false], ['direccion', 'Dirección', false]] as Array<[keyof FormState, string, boolean]>).map(([key, label, required]) => <label key={key} className="block text-xs font-bold uppercase text-[#123852]">{label}{required ? " *" : ""}<input type={key === "correo" ? "email" : "text"} required={required} value={form[key] ?? ""} onChange={(event) => setForm({ ...form, [key]: event.target.value })} className="mt-1 h-11 w-full rounded-[8px] border border-[#123852]/20 bg-white px-3 text-sm font-normal normal-case" /></label>)}</div><div className="mt-5 flex gap-2"><button type="button" onClick={() => void save()} disabled={saving} className="flex-1 rounded-[8px] bg-[#123852] px-4 py-2 font-bold text-white">{saving ? "Guardando..." : editing ? "Actualizar" : "Guardar"}</button><button type="button" onClick={resetForm} className="rounded-[8px] border border-[#123852]/30 px-4"><RotateCcw className="h-4 w-4" /></button></div></section> : null}<section className="rounded-[8px] bg-[#e9eef1] p-5 shadow-lg"><h2 className="mb-4 text-2xl font-extrabold">{meta.total} clientes</h2>{loading ? <p className="rounded bg-white p-5">Cargando clientes...</p> : <div className="grid gap-3 lg:grid-cols-2">{items.map((item) => <article key={item.id} className="rounded-[8px] bg-white p-4"><div className="flex items-start justify-between gap-3"><div><h3 className="text-xl font-extrabold">{item.nombre}</h3><p className="text-sm text-[#456f89]">RUC: {item.ruc || "—"}</p></div><div className="flex gap-1">{canEdit ? <button type="button" onClick={() => startEdit(item)} aria-label={`Editar ${item.nombre}`} className="rounded-full p-2"><Pencil className="h-5 w-5" /></button> : null}{canDelete ? <button type="button" onClick={() => void deactivate(item)} aria-label={`Desactivar ${item.nombre}`} className="rounded-full p-2 text-red-700"><X className="h-5 w-5" /></button> : null}</div></div><div className="mt-3 grid gap-2 text-sm sm:grid-cols-2"><p><b>Teléfono:</b> {item.telefono || "—"}</p><p><b>Correo:</b> {item.correo || "—"}</p><p className="sm:col-span-2"><b>Dirección:</b> {item.direccion || "—"}</p></div><div className="mt-3 rounded bg-[#123852] px-3 py-2 text-xs font-bold uppercase text-white">Estado: {item.state === false ? "Inactivo" : "Activo"}</div></article>)}</div>}{!loading ? <nav className="mt-5 flex items-center justify-between text-sm font-bold"><button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)} className="rounded bg-[#123852] px-3 py-2 text-white disabled:opacity-40">Anterior</button><span>Página {meta.current_page} de {meta.last_page}</span><button type="button" disabled={page >= meta.last_page} onClick={() => setPage(page + 1)} className="rounded bg-[#123852] px-3 py-2 text-white disabled:opacity-40">Siguiente</button></nav> : null}</section></main></div>;
}
