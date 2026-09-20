"use client";

import SectionPage from "@/app/_components/section-page";
import { apiFetch } from "@/app/_lib/api";
import { useEffect, useState } from "react";

type Detalle = {
    id: number;
    hamaca_nombre?: string;
    cantidad: number;
    precio_unitario: string | number;
    subtotal: string | number;
    servicios?: Array<{
        id: number;
        nombre: string;
        detalle?: string | null;
        cantidad: string;
        precio_unitario: string | number;
        descuento?: string | number;
        subtotal: string | number;
    }>;
};

type Factura = {
    id: number;
    numero: string;
    nombre_cliente: string;
    metodo_pago?: string | null;
    subtotal: string | number;
    descuento: string | number;
    monto_iva: string | number;
    monto_ir: string | number;
    total: string | number;
    fecha: string;
    origen?: string;
    pedido_numero?: string | null;
    detalles?: Detalle[];
    servicios?: Array<{ id: number; nombre: string; detalle?: string | null; cantidad: string; precio_unitario: string | number; subtotal: string | number }>;
};

function money(value: string | number) {
    return Number(value ?? 0).toLocaleString("es-NI", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

export default function VentasPage() {
    const [facturas, setFacturas] = useState<Factura[]>([]);
    const [selected, setSelected] = useState<Factura | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadFacturas() {
            try {
                const response = await apiFetch("/facturas");
                const data = await response.json().catch(() => null);

                if (!response.ok) {
                    throw new Error(data?.message ?? `HTTP ${response.status}`);
                }

                const items = data.data ?? [];
                setFacturas(items);
                setSelected(items[0] ?? null);
            } catch (err) {
                console.error(err);
                setError("No se pudieron cargar las facturas.");
            } finally {
                setLoading(false);
            }
        }

        loadFacturas();
    }, []);

    return (
        <SectionPage
            title="Ventas"
            description="Consulta de facturas emitidas por ventas directas y pedidos."
        >
            {loading ? (
                <p className="text-sm font-semibold text-[var(--color-foreground-secondary)]">
                    Cargando facturas...
                </p>
            ) : error ? (
                <p className="text-sm font-semibold text-red-700">{error}</p>
            ) : (
                <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
                    <section className="overflow-hidden rounded-md border border-black/10 bg-white">
                        <div className="grid grid-cols-[120px_1fr_120px] gap-3 bg-[#08264d] px-4 py-3 text-sm font-semibold text-white">
                            <span>Número</span>
                            <span>Cliente</span>
                            <span className="text-right">Total</span>
                        </div>

                        {facturas.length === 0 ? (
                            <p className="px-4 py-6 text-sm text-[#08264d]">
                                No hay facturas registradas.
                            </p>
                        ) : (
                            facturas.map((factura) => (
                                <button
                                    key={factura.id}
                                    type="button"
                                    onClick={() => setSelected(factura)}
                                    className={`grid w-full grid-cols-[120px_1fr_120px] gap-3 border-t border-black/10 px-4 py-3 text-left text-sm text-[#08264d] transition hover:bg-[#e8edf3] ${
                                        selected?.id === factura.id ? "bg-[#e8edf3]" : "bg-white"
                                    }`}
                                >
                                    <span className="font-semibold">{factura.numero}</span>
                                    <span className="truncate">{factura.nombre_cliente} · {factura.origen === "pedido" ? `Pedido ${factura.pedido_numero ?? ""}` : "Venta directa"}</span>
                                    <span className="text-right font-semibold">C$ {money(factura.total)}</span>
                                </button>
                            ))
                        )}
                    </section>

                    <aside className="rounded-md border border-black/10 bg-white p-4 text-[#08264d]">
                        {selected ? (
                            <div className="space-y-4">
                                <div>
                                    <h2 className="text-xl font-bold">{selected.numero}</h2>
                                    <p className="text-sm">{selected.nombre_cliente}</p>
                                    <p className="text-xs text-[#08264d]/70">{selected.fecha}</p>
                                    <p className="text-xs font-semibold">{selected.origen === "pedido" ? `Pedido: ${selected.pedido_numero ?? "—"}` : "Venta directa"}</p>
                                </div>

                                {(selected.servicios ?? []).length > 0 ? <div className="space-y-2 border-t border-black/10 pt-3 text-sm"><p className="font-semibold">Servicios</p>{selected.servicios?.map((service) => <div key={service.id} className="rounded-md bg-[#f2f5f8] p-3"><p>{service.nombre}</p><p>{service.cantidad} x C$ {money(service.precio_unitario)}</p><p className="font-semibold">C$ {money(service.subtotal)}</p></div>)}</div> : null}

                                <div className="space-y-2 text-sm">
                                    {(selected.detalles ?? []).map((detalle) => (
                                        <div key={detalle.id} className="rounded-md bg-[#f2f5f8] p-3">
                                            <p className="font-semibold">{detalle.hamaca_nombre ?? "Producto"}</p>
                                            <p>
                                                {detalle.cantidad} x C$ {money(detalle.precio_unitario)}
                                            </p>
                                            <p className="font-semibold">C$ {money(detalle.subtotal)}</p>
                                            {(detalle.servicios ?? []).length > 0 ? <div className="mt-2 border-t border-black/10 pt-2"><p className="font-semibold">Servicios del producto</p>{detalle.servicios?.map((service) => <div key={service.id} className="mt-1 text-sm"><p>{service.nombre}{service.detalle ? ` · ${service.detalle}` : ""}</p><p>{service.cantidad} x C$ {money(service.precio_unitario)} · C$ {money(service.subtotal)}</p></div>)}</div> : null}
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-1 border-t border-black/10 pt-3 text-sm">
                                    <p className="flex justify-between"><span>Subtotal</span><span>C$ {money(selected.subtotal)}</span></p>
                                    <p className="flex justify-between"><span>Descuento</span><span>C$ {money(selected.descuento)}</span></p>
                                    <p className="flex justify-between"><span>IVA</span><span>C$ {money(selected.monto_iva)}</span></p>
                                    <p className="flex justify-between"><span>IR</span><span>C$ {money(selected.monto_ir)}</span></p>
                                    <p className="flex justify-between text-base font-bold"><span>Total</span><span>C$ {money(selected.total)}</span></p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm">Selecciona una factura.</p>
                        )}
                    </aside>
                </div>
            )}
        </SectionPage>
    );
}
