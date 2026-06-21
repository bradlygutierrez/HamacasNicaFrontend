"use client";

import InventarioHamacaCard from "@/app/_components/inventario-hamaca-card";
import { apiFetch } from "@/app/_lib/api";
import { Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import SalidaModal from "@/app/_components/salida-modal";
import FotoVarianteModal from "@/app/_components/foto-variante-modal";

type Color = {
    id: number;
    nombre: string;
};

type Foto = {
    id: number;
    ruta: string;
};

type Variante = {
    id: number;
    nombre: string | null;
    colores: Color[];
    fotos: Foto[];
};

type Hamaca = {
    id: number;
    nombre: string;
    descripcion: string | null;
    precio: string | number;
    categoria?: {
        id: number;
        nombre: string;
    } | null;
    tamano?: {
        id: number;
        nombre: string;
    } | null;
    fotos?: Foto[];
};

type InventarioHamaca = {
    id: number;
    hamaca_id: number;
    hamaca_variante_id: number | null;
    cantidad: number;
    hamaca: Hamaca;
    variante: Variante | null;
    ubicacion: {
        id: number;
        nombre: string;
    } | null;
    usuario: {
        id: number;
        nombre: string;
        rol?: string;
    } | null;
    colores: Color[];
};

const BACKEND_URL =
    process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://127.0.0.1:8000";

function imageUrl(path?: string) {
    if (!path) return "";

    if (path.startsWith("http://") || path.startsWith("https://")) {
        return path;
    }

    if (path.startsWith("/storage/")) {
        return `${BACKEND_URL}${path}`;
    }

    return `${BACKEND_URL}/storage/${path}`;
}

export default function InventarioHamacasPage() {
    const [items, setItems] = useState<InventarioHamaca[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [salidaModalOpen, setSalidaModalOpen] = useState(false);
    const [selectedInventarioId, setSelectedInventarioId] = useState<number | null>(null);
    const [fotoModalOpen, setFotoModalOpen] = useState(false);
    const [selectedFotoData, setSelectedFotoData] = useState<{
        varianteId: number;
        hamacaNombre: string;
        fotos: Foto[];
    } | null>(null);

    const loadData = useCallback(async () => {
        setLoading(true);

        try {
            const response = await apiFetch("/inventario-hamacas");
            const data = await response.json();

            setItems(data.data ?? []);
        } catch (error) {
            console.error("Error cargando inventario:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const filteredItems = useMemo(() => {
        const query = searchTerm.toLowerCase().trim();

        if (!query) {
            return items.filter((item) => Number(item.cantidad) > 0);
        }

        return items.filter((item) => {
            const colores =
                item.variante?.colores?.map((color) => color.nombre).join(" ") ??
                item.colores?.map((color) => color.nombre).join(" ") ??
                "";

            const searchableText = `
        ${item.hamaca?.nombre ?? ""}
        ${item.hamaca?.descripcion ?? ""}
        ${colores}
        ${item.usuario?.nombre ?? ""}
        ${item.ubicacion?.nombre ?? ""}
      `.toLowerCase();

            return Number(item.cantidad) > 0 && searchableText.includes(query);
        });
    }, [items, searchTerm]);

    return (
        <div className="w-full max-w-full overflow-x-hidden bg-[#456f89] px-3 py-4 text-[#08264d] sm:px-8 sm:py-7">
            <header className="mb-6 flex flex-col gap-4 lg:mb-10">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-6">
                    <h1 className="text-[42px] font-extrabold leading-none text-white sm:text-[56px]">
                        Inventario
                    </h1>

                    <div className="relative h-[46px] w-full lg:max-w-[650px]">
                        <Search className="absolute left-4 top-1/2 h-6 w-6 -translate-y-1/2 text-[#08264d]" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                            placeholder="Buscar por hamaca, color, ubicación o propietario"
                            className="h-full w-full rounded-[8px] bg-[#f7f7f7] pl-14 pr-4 text-lg text-[#08264d] outline-none sm:text-xl"
                        />
                    </div>
                </div>
            </header>

            {loading ? (
                <p className="text-xl font-semibold text-white">Cargando inventario...</p>
            ) : null}

            {!loading && filteredItems.length === 0 ? (
                <p className="text-xl font-semibold text-white">
                    No hay inventario disponible.
                </p>
            ) : null}

            <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {filteredItems.map((item) => {
                    const varianteFotos = item.variante?.fotos ?? [];
                    const hamacaFotos = item.hamaca?.fotos ?? [];
                    const fotos = varianteFotos.length > 0 ? varianteFotos : hamacaFotos;

                    const colores =
                        item.variante?.colores?.length
                            ? item.variante.colores.map((color) => color.nombre)
                            : item.colores.map((color) => color.nombre);

                    return (
                        <InventarioHamacaCard
                            key={item.id}
                            nombre={item.hamaca?.nombre ?? "Sin nombre"}
                            cantidad={Number(item.cantidad ?? 0)}
                            colores={colores}
                            propietario={item.usuario?.nombre ?? "Sin propietario"}
                            ubicacion={item.ubicacion?.nombre ?? "Sin ubicación"}
                            precio={item.hamaca?.precio ?? "0.00"}
                            imageUrls={fotos.map((foto) => imageUrl(foto.ruta))}
                            onViewPhotos={() => {
                                const varianteId = item.hamaca_variante_id ?? item.variante?.id ?? null;

                                if (varianteId === null) {
                                    console.error("Este inventario no tiene variante asociada:", item);
                                    return;
                                }

                                setSelectedFotoData({
                                    varianteId,
                                    hamacaNombre: item.hamaca?.nombre ?? "Sin nombre",
                                    fotos: item.variante?.fotos ?? item.hamaca?.fotos ?? [],
                                });

                                setFotoModalOpen(true);
                            }}
                            onCreateExit={() => {
                                setSelectedInventarioId(item.id);
                                setSalidaModalOpen(true);
                            }}
                        />
                    );
                })}
            </section>

            <FotoVarianteModal
                isOpen={fotoModalOpen}
                varianteId={selectedFotoData?.varianteId ?? null}
                hamacaNombre={selectedFotoData?.hamacaNombre ?? ""}
                initialFotos={selectedFotoData?.fotos ?? []}
                onClose={() => {
                    setFotoModalOpen(false);
                    setSelectedFotoData(null);
                }}
                onSuccess={loadData}
            />
            <SalidaModal
                isOpen={salidaModalOpen}
                initialInventarioId={selectedInventarioId}
                onClose={() => {
                    setSalidaModalOpen(false);
                    setSelectedInventarioId(null);
                }}
                onSuccess={loadData}
            />
        </div>
    );
}