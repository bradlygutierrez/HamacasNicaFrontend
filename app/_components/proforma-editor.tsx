"use client";

import { useCatalogCapabilities } from "@/app/_components/catalog-permissions-provider";
import { apiFetch } from "@/app/_lib/api";
import ProformaServiceCard from "@/app/_components/proforma-service-card";
import { calculateAdditionalServiceSubtotal, calculateBreakdownPricing, validateAdditionalServiceField } from "@/app/_lib/proforma-services";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

type Product = { id: number; nombre: string; categoria?: string | null; tamano?: string | null; colores?: string[]; precio?: string | number; tiene_receta_activa?: boolean };
type Service = { id: number; nombre: string; metodo_calculo: string; alcance: string; precio_venta_actual: string | number };
type Client = { id: number; nombre: string; ruc?: string | null; direccion?: string | null; telefono?: string | null; correo?: string | null };
type BreakdownLine = { descripcion: string; monto: string; orden: number };
type ServiceLine = { service: Service; cantidad: string; detalle: string; precio_unitario: string; descuento: string; costo_base_unitario_override: string; desglose: BreakdownLine[] };
type ProductLine = { product: Product; cantidad: string; precio_unitario: string; descuento: string; services: ServiceLine[] };
type Preview = { values: Record<string, string | number>; analisis_interno?: { costo_total_estimado: string; costo_compra_estimado: string; monto_comision_vendedor: string; utilidad_estimada: string; materiales_agrupados?: Array<{ nombre: string; cantidad_requerida: string; cantidad_compra: number; unidad_compra: string; costo_consumo: string; costo_compra: string }> } };
type ErrorPayload = { message?: string; errors?: Record<string, string[]> };

const getMessage = (data: ErrorPayload | null, fallback: string) => data?.message ?? Object.values(data?.errors ?? {})[0]?.[0] ?? fallback;
const productLabel = (product: Product) => product.nombre + (product.colores?.length ? ` · ${product.colores.join(" / ")}` : "");
const SUMMARY_FIELDS = [
  { key: "subtotal_productos", label: "Productos" },
  { key: "subtotal_servicios", label: "Servicios adicionales" },
  { key: "subtotal_bruto", label: "Subtotal bruto" },
  { key: "descuento_lineas", label: "Descuentos por líneas" },
  { key: "descuento_global", label: "Descuento global" },
  { key: "base_neta", label: "Base neta" },
  { key: "monto_iva", label: "IVA" },
  { key: "monto_ir", label: "IR" },
  { key: "total", label: "Total" },
] as const;

export default function ProformaEditor() {
  const { id } = useParams<{ id?: string }>();
  const routeId = id && id !== "nueva" ? id : null;
  const router = useRouter();
  const { canEdit } = useCatalogCapabilities("/proformas");
  const [role, setRole] = useState("");
  const [currentUserName, setCurrentUserName] = useState("");
  const [assignedSellerName, setAssignedSellerName] = useState("");
  const [state, setState] = useState("borrador");
  const [number, setNumber] = useState<string | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const selectedClientRef = useRef<number | null>(null);
  const [manualClient, setManualClient] = useState<Client>({ id: 0, nombre: "" });
  const [clientSearch, setClientSearch] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [quickClientOpen, setQuickClientOpen] = useState(false);
  const [quickClient, setQuickClient] = useState({ nombre: "", ruc: "", telefono: "", correo: "", direccion: "" });
  const [sellerId, setSellerId] = useState("");
  const [sellers, setSellers] = useState<Array<{ id: number; nombre: string }>>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [productServices, setProductServices] = useState<Service[]>([]);
  const [productServiceSearch, setProductServiceSearch] = useState("");
  const [orderServices, setOrderServices] = useState<Service[]>([]);
  const [orderServiceSearch, setOrderServiceSearch] = useState("");
  const [lines, setLines] = useState<ProductLine[]>([]);
  const [generalServices, setGeneralServices] = useState<ServiceLine[]>([]);
  const [discount, setDiscount] = useState("0");
  const [commissionRate, setCommissionRate] = useState("5");
  const [iva, setIva] = useState(false);
  const [ir, setIr] = useState(false);
  const [ivaRate, setIvaRate] = useState("15");
  const [irRate, setIrRate] = useState("2");
  const [validUntil, setValidUntil] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [preview, setPreview] = useState<Preview | null>(null);
  const [error, setError] = useState("");
  const [emitConfirmOpen, setEmitConfirmOpen] = useState(false);
  const editable = state === "borrador" && canEdit;

  useEffect(() => { if (selectedClientId !== null) selectedClientRef.current = selectedClientId; }, [selectedClientId]);
  useEffect(() => { if (selectedClientId === null && selectedClientRef.current !== null) setSelectedClientId(selectedClientRef.current); }, [manualClient.nombre, selectedClientId]);

  useEffect(() => { void (async () => { const response = await apiFetch("/me"); const data = await response.json().catch(() => null); const me = data?.data; setRole(me?.rol ?? ""); setCurrentUserName(me?.nombre ?? ""); if (me?.id && !routeId) setSellerId(String(me.id)); if (me?.rol === "admin") { const users = await apiFetch("/usuarios?per_page=100"); const usersData = await users.json().catch(() => null); setSellers((usersData?.data ?? []).filter((item: { rol: string }) => ["admin", "vendedor"].includes(item.rol))); } })(); }, [routeId]);
  useEffect(() => { const timer = window.setTimeout(async () => { const response = await apiFetch(`/clientes?search=${encodeURIComponent(clientSearch)}&per_page=20`); const data = await response.json().catch(() => null); setClients(response.ok ? data?.data ?? [] : []); }, 250); return () => window.clearTimeout(timer); }, [clientSearch]);
  useEffect(() => { const timer = window.setTimeout(async () => { const response = await apiFetch(`/proformas/productos?search=${encodeURIComponent(productSearch)}&per_page=20`); const data = await response.json().catch(() => null); setProducts(response.ok ? data?.data ?? [] : []); }, 250); return () => window.clearTimeout(timer); }, [productSearch]);
  useEffect(() => { const timer = window.setTimeout(async () => { const response = await apiFetch(`/servicios-adicionales?search=${encodeURIComponent(productServiceSearch)}&alcance=producto&per_page=20`); const data = await response.json().catch(() => null); setProductServices(response.ok ? data?.data ?? [] : []); }, 250); return () => window.clearTimeout(timer); }, [productServiceSearch]);
  useEffect(() => { const timer = window.setTimeout(async () => { const response = await apiFetch(`/servicios-adicionales?search=${encodeURIComponent(orderServiceSearch)}&alcance=pedido&per_page=20`); const data = await response.json().catch(() => null); setOrderServices(response.ok ? data?.data ?? [] : []); }, 250); return () => window.clearTimeout(timer); }, [orderServiceSearch]);

  useEffect(() => {
    if (!routeId) return;
    void (async () => {
      const response = await apiFetch(`/proformas/${routeId}`);
      const json = await response.json().catch(() => null);
      if (!response.ok) { setError("No se pudo cargar la proforma."); return; }
      const item = json.data;
      setState(item.estado); setNumber(item.numero); setSelectedClientId(item.cliente_id ?? null);
      setAssignedSellerName(item.vendedor?.nombre ?? ""); setSellerId(String(item.vendedor_id));
      setManualClient({ id: item.cliente_id ?? 0, nombre: item.nombre_cliente, ruc: item.ruc, direccion: item.direccion, telefono: item.telefono, correo: item.correo });
      setDiscount(String(item.descuento_global ?? item.descuento ?? 0)); setCommissionRate(String(item.tasa_comision_vendedor ?? 5));
      setIva(Boolean(item.aplica_iva)); setIr(Boolean(item.aplica_ir)); setIvaRate(String(item.tasa_iva ?? 15)); setIrRate(String(item.tasa_ir ?? 2));
      setValidUntil(item.valida_hasta ?? ""); setObservaciones(item.observaciones ?? "");
      setPreview({ values: { subtotal_productos: item.subtotal_productos, subtotal_servicios: item.subtotal_servicios, subtotal_bruto: item.subtotal_bruto, descuento_global: item.descuento_global ?? item.descuento, descuento_lineas: item.descuento_lineas ?? 0, base_neta: item.base_neta, tasa_iva: item.tasa_iva, monto_iva: item.monto_iva, tasa_ir: item.tasa_ir, monto_ir: item.monto_ir, total: item.total, tasa_comision_vendedor: item.tasa_comision_vendedor, monto_comision_vendedor: item.monto_comision_vendedor }, analisis_interno: item.analisis_interno });
      setLines((item.detalles ?? []).map((line: { hamaca_id: number; nombre: string; hamaca_nombre_snapshot?: string; hamaca?: { nombre?: string; colores?: Array<{ nombre: string }> }; colores?: Array<{ nombre: string }>; cantidad: number; precio_unitario: string; descuento: string; servicios?: Array<{ servicio_adicional_id: number; nombre: string; cantidad: string; detalle?: string; precio_unitario: string; descuento: string; desglose?: BreakdownLine[] }> }) => ({ product: { id: line.hamaca_id, nombre: line.nombre ?? line.hamaca_nombre_snapshot ?? line.hamaca?.nombre ?? "Hamaca", colores: (line.hamaca?.colores ?? line.colores ?? []).map((color) => color.nombre) }, cantidad: String(line.cantidad), precio_unitario: String(line.precio_unitario), descuento: String(line.descuento), services: (line.servicios ?? []).map((service) => ({ service: { id: service.servicio_adicional_id, nombre: service.nombre, alcance: "producto", metodo_calculo: "manual", precio_venta_actual: service.precio_unitario }, cantidad: String(service.cantidad), detalle: service.detalle ?? "", precio_unitario: String(service.precio_unitario), descuento: String(service.descuento), costo_base_unitario_override: "", desglose: (service.desglose ?? []).map((row) => ({ ...row, monto: String(row.monto) })) })) })));
      setGeneralServices((item.servicios_pedido ?? []).map((service: { servicio_adicional_id: number; nombre: string; cantidad: string; detalle?: string; precio_unitario: string; descuento: string; costo_base_unitario_override?: string; desglose?: BreakdownLine[] }) => ({ service: { id: service.servicio_adicional_id, nombre: service.nombre, alcance: "pedido", metodo_calculo: "manual", precio_venta_actual: service.precio_unitario }, cantidad: String(service.cantidad), detalle: service.detalle ?? "", precio_unitario: String(service.precio_unitario), descuento: String(service.descuento), costo_base_unitario_override: service.costo_base_unitario_override ?? "", desglose: (service.desglose ?? []).map((row) => ({ ...row, monto: String(row.monto) })) })));
    })();
  }, [routeId]);

  const serializeService = (item: ServiceLine) => ({ servicio_adicional_id: item.service.id, cantidad: Number(item.cantidad), detalle: item.detalle, precio_unitario: item.precio_unitario === "" ? null : Number(item.precio_unitario), descuento: Number(item.descuento || 0), desglose: item.desglose.map((row) => ({ descripcion: row.descripcion, monto: Number(row.monto || 0), orden: row.orden })) });
  const payload = () => ({ cliente_id: selectedClientId, nombre_cliente: manualClient.nombre || undefined, ruc: manualClient.ruc ?? null, direccion: manualClient.direccion ?? null, telefono: manualClient.telefono ?? null, correo: manualClient.correo ?? null, vendedor_id: Number(sellerId), valida_hasta: validUntil || null, observaciones, descuento_global: Number(discount || 0), tasa_comision_vendedor: role === "admin" ? Number(commissionRate || 0) : undefined, aplica_iva: iva, tasa_iva: Number(ivaRate || 0), aplica_ir: ir, tasa_ir: Number(irRate || 0), detalles: lines.map((line) => ({ hamaca_id: line.product.id, cantidad: Number(line.cantidad), precio_unitario: line.precio_unitario === "" ? null : Number(line.precio_unitario), descuento: Number(line.descuento || 0), servicios: line.services.map(serializeService) })), servicios_pedido: generalServices.map((item) => ({ ...serializeService(item), costo_base_unitario_override: role === "admin" && item.costo_base_unitario_override ? Number(item.costo_base_unitario_override) : null })) });
  async function calculate() { if (!lines.length) return; const response = await apiFetch("/proformas/calcular", { method: "POST", body: JSON.stringify(payload()) }); const data = await response.json().catch(() => null); if (!response.ok) { setError(getMessage(data, "No se pudo calcular la proforma.")); return; } setError(""); setPreview(data.data); }
  async function save() { if (!editable) return; const response = await apiFetch(routeId ? `/proformas/${routeId}` : "/proformas", { method: routeId ? "PUT" : "POST", body: JSON.stringify(payload()) }); const data = await response.json().catch(() => null); if (!response.ok) { setError(getMessage(data, "No se pudo guardar el borrador.")); return; } toast.success("Borrador guardado."); router.push(`/proformas/${data.data.id}`); }
  async function emit() { if (!routeId || !editable) return; const response = await apiFetch(`/proformas/${routeId}/emitir`, { method: "POST" }); const data = await response.json().catch(() => null); if (!response.ok) { setError(getMessage(data, "No se pudo emitir la proforma.")); return; } setState(data.data.estado); setNumber(data.data.numero); setEmitConfirmOpen(false); toast.success("Proforma emitida."); }
  async function changeStatus(next: string) { if (!routeId || role === "socio") return; const response = await apiFetch(`/proformas/${routeId}/estado`, { method: "POST", body: JSON.stringify({ estado: next }) }); const data = await response.json().catch(() => null); if (!response.ok) { setError(getMessage(data, "No se pudo cambiar el estado.")); return; } setState(data.data.estado); toast.success("Estado actualizado."); }
  async function registerClient() {
    if (!quickClient.nombre.trim()) { setError("El nombre del cliente es obligatorio."); return; }
    const response = await apiFetch("/clientes", { method: "POST", body: JSON.stringify({ ...quickClient, ruc: quickClient.ruc || null, telefono: quickClient.telefono || null, correo: quickClient.correo || null, direccion: quickClient.direccion || null }) });
    const data = await response.json().catch(() => null);
    if (!response.ok) { setError(getMessage(data, "No se pudo registrar el cliente.")); return; }
    const client = data.data as Client;
    selectedClientRef.current = client.id;
    setSelectedClientId(client.id);
    setManualClient(client);
    setClientSearch("");
    setQuickClient({ nombre: "", ruc: "", telefono: "", correo: "", direccion: "" });
    setQuickClientOpen(false);
    setError("");
    toast.success("Cliente registrado correctamente.");
  }
  const updateLine = (index: number, patch: Partial<ProductLine>) => setLines(lines.map((line, i) => i === index ? { ...line, ...patch } : line));
  const addProduct = (product: Product) => { if (!lines.some((line) => line.product.id === product.id)) setLines([...lines, { product, cantidad: "1", precio_unitario: String(product.precio ?? ""), descuento: "0", services: [] }]); setProductSearch(""); };
  const addService = (index: number | null, service: Service) => { const line = { service, cantidad: "1", detalle: "", precio_unitario: String(service.precio_venta_actual), descuento: "0", costo_base_unitario_override: "", desglose: [] as BreakdownLine[] }; if (index === null) { if (!generalServices.some((item) => item.service.id === service.id)) setGeneralServices([...generalServices, line]); setOrderServiceSearch(""); return; } setLines(lines.map((row, i) => i === index && !row.services.some((item) => item.service.id === service.id) ? { ...row, services: [...row.services, line] } : row)); setProductServiceSearch(""); };
  const prepareServicePatch = (item: ServiceLine, patch: Partial<ServiceLine>): ServiceLine => {
    const next = { ...item, ...patch };
    if (next.desglose.length && ("desglose" in patch || "cantidad" in patch || "descuento" in patch)) {
      const pricing = calculateBreakdownPricing(next.desglose, next.cantidad, next.descuento);
      next.precio_unitario = pricing.unitPrice;
      next.desglose = pricing.lines.map((row, index) => ({ ...row, monto: String(row.monto), orden: index + 1 }));
    }
    return next;
  };
  const updateService = (lineIndex: number, serviceIndex: number, patch: Partial<ServiceLine>) => updateLine(lineIndex, { services: lines[lineIndex].services.map((item, i) => i === serviceIndex ? prepareServicePatch(item, patch) : item) });
  const updateGeneralService = (serviceIndex: number, patch: Partial<ServiceLine>) => setGeneralServices(generalServices.map((item, i) => i === serviceIndex ? prepareServicePatch(item, patch) : item));
  const selectClient = (item: Client) => { selectedClientRef.current = item.id; setSelectedClientId(item.id); setManualClient({ ...item }); setClientSearch(""); };
  const statusOptions: Record<string, string[]> = { emitida: ["enviada", "aceptada", "rechazada", "vencida"], enviada: ["aceptada", "rechazada", "vencida"] };

  return <div className="w-full min-w-0 max-w-full overflow-x-hidden bg-[#002060] px-3 py-4 text-[#002060] sm:px-8 sm:py-7">{emitConfirmOpen ? <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4"><div role="dialog" aria-modal="true" aria-labelledby="emit-proforma-title" className="w-full max-w-md rounded-xl bg-white p-6 text-slate-900 shadow-2xl"><h2 id="emit-proforma-title" className="text-xl font-extrabold">Confirmar emisión</h2><p className="mt-3 text-sm text-slate-600">¿Emitir esta proforma? Después no podrá editarse.</p><div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button type="button" onClick={() => setEmitConfirmOpen(false)} className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-bold">Cancelar</button><button type="button" onClick={() => void emit()} className="rounded-lg bg-[#123852] px-4 py-2.5 text-sm font-bold text-white">Confirmar emisión de proforma</button></div></div></div> : null}<header className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div className="flex min-w-0 items-center gap-3"><Image src="/Logo.svg" alt="Hamacas Nica" width={58} height={58} className="h-12 w-12 shrink-0 object-contain" /><div className="min-w-0"><h1 className="break-words text-3xl font-extrabold text-white sm:text-5xl">{number ?? "Nueva proforma"}</h1><p className="text-sm text-white/85">Estado: <span className="capitalize">{state}</span></p></div></div><Link href="/proformas" className="w-fit self-end rounded bg-white px-3 py-2 text-center text-sm font-bold sm:self-auto">Volver</Link></header>{error ? <p className="mb-4 rounded bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p> : null}<div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_360px]"><main className="min-w-0 space-y-5">
    <section className="rounded bg-[#f4f4f4] p-3 shadow-lg sm:p-5"><h2 className="mb-3 text-xl font-extrabold">Cliente y vendedor</h2>{editable ? <><div className="flex min-w-0 flex-col gap-2 sm:flex-row"><input value={clientSearch} onChange={(event) => setClientSearch(event.target.value)} placeholder="Buscar cliente" className="h-10 w-full min-w-0 flex-1 rounded bg-white px-3 text-sm sm:w-auto" /><button type="button" onClick={() => setQuickClientOpen(true)} className="w-full shrink-0 rounded bg-[#002060] px-3 py-2 text-xs font-bold text-white sm:w-auto">+ Registrar cliente</button></div>{clients.map((item) => <button type="button" key={item.id} onClick={() => selectClient(item)} className="mr-2 mt-2 max-w-full break-words rounded bg-white px-2 py-1 text-left text-xs">{item.nombre}</button>)}<input value={manualClient.nombre} onChange={(event) => { setManualClient({ ...manualClient, nombre: event.target.value }); }} placeholder="Nombre del cliente" className="mt-3 h-10 w-full rounded bg-white px-3 text-sm" /><div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2"><input value={manualClient.ruc ?? ""} onChange={(event) => setManualClient({ ...manualClient, ruc: event.target.value })} placeholder="RUC" className="h-10 w-full min-w-0 rounded bg-white px-3 text-sm" /><input value={manualClient.telefono ?? ""} onChange={(event) => setManualClient({ ...manualClient, telefono: event.target.value })} placeholder="Teléfono" className="h-10 w-full min-w-0 rounded bg-white px-3 text-sm" /><input value={manualClient.direccion ?? ""} onChange={(event) => setManualClient({ ...manualClient, direccion: event.target.value })} placeholder="Dirección" className="h-10 w-full min-w-0 rounded bg-white px-3 text-sm" /><input value={manualClient.correo ?? ""} onChange={(event) => setManualClient({ ...manualClient, correo: event.target.value })} placeholder="Correo" className="h-10 w-full min-w-0 rounded bg-white px-3 text-sm" /></div>{role === "admin" ? <select value={sellerId} onChange={(event) => setSellerId(event.target.value)} className="mt-3 h-10 w-full rounded bg-white px-3 text-sm"><option value="">Seleccionar vendedor</option>{sellers.map((seller) => <option key={seller.id} value={seller.id}>{seller.nombre}</option>)}</select> : <p className="mt-3 text-sm">Vendedor: {assignedSellerName || currentUserName}</p>}</> : <div className="text-sm"><b>{manualClient.nombre}</b><p>{manualClient.ruc} · {manualClient.telefono}</p><p>{manualClient.direccion} · {manualClient.correo}</p><p>Vendedor: {assignedSellerName || currentUserName}</p></div>}</section>
    {quickClientOpen ? <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"><div className="max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto rounded bg-[#f4f4f4] p-3 shadow-xl sm:p-5"><div className="flex items-center justify-between"><h2 className="text-xl font-extrabold">Registrar cliente</h2><button type="button" onClick={() => setQuickClientOpen(false)} aria-label="Cerrar">✕</button></div><div className="mt-4 grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">{([['nombre', 'Nombre *'], ['ruc', 'RUC'], ['telefono', 'Teléfono'], ['correo', 'Correo'], ['direccion', 'Dirección']] as const).map(([key, label]) => <label key={key} className="text-xs font-bold sm:col-span-1">{label}<input type={key === "correo" ? "email" : "text"} value={quickClient[key]} onChange={(event) => setQuickClient({ ...quickClient, [key]: event.target.value })} className="mt-1 h-10 w-full rounded bg-white px-3 text-sm font-normal" /></label>)}</div><div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button type="button" onClick={() => setQuickClientOpen(false)} className="w-full rounded border px-4 py-2 text-sm font-bold sm:w-auto">Cancelar</button><button type="button" onClick={() => void registerClient()} className="w-full rounded bg-[#002060] px-4 py-2 text-sm font-bold text-white sm:w-auto">Guardar cliente</button></div></div></div> : null}
    <section className="rounded bg-[#f4f4f4] p-3 shadow-lg sm:p-5">
      <h2 className="mb-3 text-xl font-extrabold">Productos</h2>
      {editable ? <input value={productSearch} onChange={(event) => setProductSearch(event.target.value)} placeholder="Buscar hamaca con fórmula activa" className="h-10 w-full min-w-0 rounded bg-white px-3 text-sm" /> : null}
      {editable ? products.map((product) => <button type="button" key={product.id} onClick={() => addProduct(product)} className="mr-2 mt-2 max-w-full break-words rounded bg-white px-2 py-1 text-left text-xs">{productLabel(product)}</button>) : null}
      {lines.map((line, index) => {
        const quantityError = validateAdditionalServiceField("cantidad", line.cantidad);
        const priceError = validateAdditionalServiceField("precio_unitario", line.precio_unitario);
        const discountError = validateAdditionalServiceField("descuento", line.descuento, line.cantidad, line.precio_unitario);
        const lineSubtotal = calculateAdditionalServiceSubtotal(line.cantidad, line.precio_unitario, line.descuento);
        return <div key={line.product.id} className="mt-3 min-w-0 rounded bg-white p-3 sm:p-4">
          <div className="flex min-w-0 items-start justify-between gap-2"><b className="min-w-0 break-words">{productLabel(line.product)}</b>{editable ? <button type="button" onClick={() => setLines(lines.filter((_, i) => i !== index))} className="shrink-0 text-sm font-semibold text-red-600">Quitar</button> : null}</div>
          {editable ? <div className="mt-3 grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-3">
            <label className="min-w-0 text-xs font-bold">Cantidad<input type="number" min="1" step="1" value={line.cantidad} onChange={(event) => updateLine(index, { cantidad: event.target.value })} aria-invalid={Boolean(quantityError)} className={`mt-1 h-10 w-full min-w-0 rounded border bg-white px-3 text-sm ${quantityError ? "border-red-600" : "border-[#002060]/30"}`} />{quantityError ? <span role="alert" className="mt-1 block text-xs font-normal text-red-700">{quantityError}</span> : null}</label>
            <label className="min-w-0 text-xs font-bold">Precio unitario (C$)<input type="number" min="0" step="0.01" value={line.precio_unitario} onChange={(event) => updateLine(index, { precio_unitario: event.target.value })} aria-invalid={Boolean(priceError)} className={`mt-1 h-10 w-full min-w-0 rounded border bg-white px-3 text-sm ${priceError ? "border-red-600" : "border-[#002060]/30"}`} />{priceError ? <span role="alert" className="mt-1 block text-xs font-normal text-red-700">{priceError}</span> : null}</label>
            <label className="min-w-0 text-xs font-bold">Descuento del producto (C$)<input type="number" min="0" step="0.01" value={line.descuento} onChange={(event) => updateLine(index, { descuento: event.target.value })} aria-invalid={Boolean(discountError)} className={`mt-1 h-10 w-full min-w-0 rounded border bg-white px-3 text-sm ${discountError ? "border-red-600" : "border-[#002060]/30"}`} />{discountError ? <span role="alert" className="mt-1 block text-xs font-normal text-red-700">{discountError}</span> : null}<span className="mt-1 block text-xs font-normal text-[#002060]">Descuento aplicado solo a este producto.</span></label>
          </div> : <p className="mt-2 text-sm">{line.cantidad} × C$ {line.precio_unitario} · Descuento C$ {line.descuento}</p>}
          <p className="mt-3 text-right text-sm font-bold text-[#002060]">Subtotal de línea: C$ {lineSubtotal.toFixed(2)}</p>
          <div className="mt-4 border-t border-[#002060]/15 pt-3">
            {editable ? <><label className="text-xs font-bold">Buscar servicio adicional<input value={productServiceSearch} onChange={(event) => setProductServiceSearch(event.target.value)} placeholder="Buscar servicio adicional" className="mt-1 h-10 w-full min-w-0 rounded border bg-white px-3 text-sm" /></label><p className="mt-1 text-xs text-[#002060]">Se aplica a esta hamaca.</p>{productServices.map((service) => <button type="button" key={service.id} onClick={() => addService(index, service)} className="mr-2 mt-2 max-w-full break-words rounded bg-[#f4f4f4] px-3 py-2 text-left text-xs">+ {service.nombre}</button>)}</> : null}
            <div className="mt-3 space-y-2">{line.services.map((item, serviceIndex) => <ProformaServiceCard key={item.service.id} item={item} editable={editable} showInternalCost={false} onChange={(patch) => updateService(index, serviceIndex, patch)} onRemove={() => updateLine(index, { services: line.services.filter((_, i) => i !== serviceIndex) })} />)}</div>
          </div>
        </div>;
      })}
    </section>
    <section className="rounded bg-[#f4f4f4] p-3 shadow-lg sm:p-5">
      <h2 className="text-xl font-extrabold">Servicios adicionales</h2>
      <p className="mt-1 text-sm text-[#002060]">Agregá servicios que aplican al pedido completo, como envío, personalización o trabajos adicionales.</p>
      {editable ? <div className="mt-3"><label className="text-xs font-bold">Buscar servicio adicional<input value={orderServiceSearch} onChange={(event) => setOrderServiceSearch(event.target.value)} placeholder="Buscar servicio adicional" className="mt-1 h-10 w-full min-w-0 rounded border bg-white px-3 text-sm" /></label><p className="mt-1 text-xs text-[#002060]">Estos servicios se aplican al pedido completo.</p></div> : null}
      {editable ? orderServices.map((service) => <button type="button" key={service.id} onClick={() => addService(null, service)} className="mr-2 mt-2 max-w-full break-words rounded bg-white px-3 py-2 text-left text-xs">+ {service.nombre}</button>) : null}
      <div className="mt-3 space-y-2">{generalServices.map((item, index) => <ProformaServiceCard key={item.service.id} item={item} editable={editable} showInternalCost={role === "admin"} onChange={(patch) => updateGeneralService(index, patch)} onRemove={() => setGeneralServices(generalServices.filter((_, i) => i !== index))} />)}</div>
    </section>{editable ? <section className="rounded bg-[#f4f4f4] p-3 shadow-lg sm:p-5"><textarea value={observaciones} onChange={(event) => setObservaciones(event.target.value)} placeholder="Observaciones" className="min-h-24 w-full min-w-0 rounded bg-white p-3 text-sm" /><input type="date" value={validUntil} onChange={(event) => setValidUntil(event.target.value)} className="mt-3 h-10 w-full min-w-0 rounded bg-white px-3 text-sm" /></section> : <section className="rounded bg-[#f4f4f4] p-3 shadow-lg sm:p-5"><p>Válida hasta: {validUntil || "—"}</p><p>Observaciones: {observaciones || "—"}</p></section>}</main>
    <aside className="min-w-0 rounded bg-[#f4f4f4] p-3 shadow-lg sm:p-5">
      <h2 className="text-xl font-extrabold">Resumen</h2>
      {preview ? <div className="mt-4 space-y-2 text-sm">{SUMMARY_FIELDS.map(({ key, label }) => <p key={key} className={`flex min-w-0 flex-wrap justify-between gap-x-3 ${key === "total" ? "mt-3 border-t border-[#002060]/30 pt-3 text-lg font-bold" : ""}`}><span className="break-words">{label}</span><b className="shrink-0">C$ {Number(preview.values[key] ?? 0).toFixed(2)}</b></p>)}<p className="pt-2">Comisión del vendedor: {Number(preview.values.tasa_comision_vendedor ?? 0).toFixed(2)}% · C$ {Number(preview.values.monto_comision_vendedor ?? 0).toFixed(2)}</p>{preview.analisis_interno ? <div className="border-t pt-3"><p>Costo interno: C$ {Number(preview.analisis_interno.costo_total_estimado).toFixed(2)}</p><p>Compra materiales: C$ {Number(preview.analisis_interno.costo_compra_estimado).toFixed(2)}</p><p>Utilidad: C$ {Number(preview.analisis_interno.utilidad_estimada).toFixed(2)}</p><h3 className="mt-3 font-bold">Materiales agrupados</h3>{preview.analisis_interno.materiales_agrupados?.map((item) => <p key={item.nombre} className="break-words text-xs">{item.nombre}: {item.cantidad_requerida} · {item.cantidad_compra} {item.unidad_compra} · C$ {item.costo_consumo} / C$ {item.costo_compra}</p>)}</div> : null}</div> : <p className="mt-3 text-sm">Sin resumen calculado.</p>}
      {editable ? <>
        <div className="mt-4 border-t border-[#002060]/20 pt-4"><h3 className="font-bold">Descuento de la proforma</h3><label className="mt-2 block text-xs font-bold">Descuento global (C$)<input type="number" min="0" step="0.01" value={discount} onChange={(event) => { setDiscount(event.target.value); setPreview(null); }} placeholder="0.00" className="mt-1 h-10 w-full min-w-0 rounded border border-[#002060]/30 bg-white px-3 text-sm" /></label><p className="mt-1 text-xs text-[#002060]">Se aplica al total de la proforma antes de impuestos.</p></div>
        <div className="mt-4 grid min-w-0 grid-cols-1 gap-3 border-t border-[#002060]/20 pt-4 sm:grid-cols-2">
          <div><label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" checked={iva} onChange={(event) => setIva(event.target.checked)} />Aplicar IVA</label><label className="mt-2 block text-xs font-bold">Tasa IVA (%)<input type="number" min="0" step="0.01" value={ivaRate} readOnly={role !== "admin"} onChange={(event) => setIvaRate(event.target.value)} className="mt-1 h-10 w-full min-w-0 rounded border bg-white px-3 text-sm" /></label></div>
          <div><label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" checked={ir} onChange={(event) => setIr(event.target.checked)} />Aplicar IR</label><label className="mt-2 block text-xs font-bold">Tasa IR (%)<input type="number" min="0" step="0.01" value={irRate} readOnly={role !== "admin"} onChange={(event) => setIrRate(event.target.value)} className="mt-1 h-10 w-full min-w-0 rounded border bg-white px-3 text-sm" /></label></div>
          <label className="min-w-0 text-xs font-bold sm:col-span-2">Comisión del vendedor (%)<input type="number" min="0" step="0.01" value={commissionRate} readOnly={role !== "admin"} onChange={(event) => setCommissionRate(event.target.value)} className="mt-1 h-10 w-full min-w-0 rounded border bg-white px-3 text-sm" /></label>
        </div>
        <button type="button" onClick={() => void calculate()} className="mt-4 w-full rounded bg-[#002060] px-3 py-2 text-sm font-bold text-white">Recalcular</button><button type="button" onClick={() => void save()} className="mt-2 w-full rounded bg-[#002060] px-3 py-2 text-sm font-bold text-white">Guardar borrador</button>{routeId ? <button type="button" onClick={() => setEmitConfirmOpen(true)} className="mt-2 w-full rounded bg-emerald-700 px-3 py-2 text-sm font-bold text-white">Emitir proforma</button> : null}
      </> : null}
      {statusOptions[state] && role !== "socio" ? <div className="mt-5 border-t pt-4"><p className="mb-2 text-sm font-bold">Cambiar estado</p>{statusOptions[state].map((next) => <button key={next} onClick={() => void changeStatus(next)} className="mr-2 mb-2 rounded bg-white px-2 py-1 text-xs capitalize">{next}</button>)}</div> : null}
    </aside></div></div>;
}
