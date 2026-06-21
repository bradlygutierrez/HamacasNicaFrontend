"use client";

import CatalogoHamacaCard from "@/app/_components/catalogo-hamaca-card";
import FotoVarianteModal from "@/app/_components/foto-variante-modal";
import HamacaModal from "@/app/_components/hamaca-modal";
import VarianteModal from "@/app/_components/variante-modal";
import { apiFetch } from "@/app/_lib/api";
import { Layers, Plus, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

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
  hamaca_id: number;
  colores: Color[];
  fotos: Foto[];
};

type Inventario = {
  id: number;
  hamaca_variante_id: number | null;
  cantidad: number;
  ubicacion: {
    id: number;
    nombre: string;
  } | null;
  usuario: {
    id: number;
    nombre: string;
    rol?: string;
  } | null;
};

type Hamaca = {
  id: number;
  nombre: string;
  descripcion: string | null;
  categoria: string | null;
  tamano: string | null;
  precio: string | number;
  fotos?: Foto[];
  variantes?: Variante[];
  inventario?: Inventario[];
};

type AvailabilityFilter = "todas" | "disponibles" | "agotadas";

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

function uniqueValues(values: Array<string | null | undefined>): string[] {
  return Array.from(new Set(values.filter(Boolean) as string[]));
}

export default function CatalogoHamacasPage() {
  const router = useRouter();

  const [hamacas, setHamacas] = useState<Hamaca[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [availabilityFilter, setAvailabilityFilter] =
    useState<AvailabilityFilter>("todas");
  const [loading, setLoading] = useState(true);

  const [hamacaModalOpen, setHamacaModalOpen] = useState(false);
  const [varianteModalOpen, setVarianteModalOpen] = useState(false);

  const [fotoModalOpen, setFotoModalOpen] = useState(false);
  const [selectedFotoData, setSelectedFotoData] = useState<{
    varianteId: number;
    hamacaNombre: string;
    fotos: Foto[];
  } | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);

    try {
      const response = await apiFetch("/hamacas/detalles");
      const data = await response.json();

      setHamacas(data.data ?? []);
    } catch (error) {
      console.error("Error cargando catálogo:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const catalogItems = useMemo(() => {
    return hamacas.flatMap((hamaca) => {
      const variantes = hamaca.variantes ?? [];

      return variantes.map((variante) => {
        const inventariosDeVariante = (hamaca.inventario ?? []).filter(
          (inventario) => inventario.hamaca_variante_id === variante.id
        );

        const disponible = inventariosDeVariante.reduce(
          (sum, inventario) => sum + Number(inventario.cantidad ?? 0),
          0
        );

        const fotos =
          variante.fotos.length > 0 ? variante.fotos : hamaca.fotos ?? [];

        return {
          key: `${hamaca.id}-${variante.id}`,
          hamacaId: hamaca.id,
          varianteId: variante.id,
          nombre: hamaca.nombre,
          descripcion: hamaca.descripcion,
          categoria: hamaca.categoria,
          tamano: hamaca.tamano,
          precio: hamaca.precio,
          colores: variante.colores.map((color) => color.nombre),
          disponible,
          ubicaciones: uniqueValues(
            inventariosDeVariante.map(
              (inventario) => inventario.ubicacion?.nombre
            )
          ),
          propietarios: uniqueValues(
            inventariosDeVariante.map(
              (inventario) => inventario.usuario?.nombre
            )
          ),
          imageUrls: fotos.map((foto) => imageUrl(foto.ruta)),
          rawFotos: fotos,
        };
      });
    });
  }, [hamacas]);

  const filteredItems = useMemo(() => {
    const query = searchTerm.toLowerCase().trim();

    return catalogItems.filter((item) => {
      const matchesAvailability =
        availabilityFilter === "todas" ||
        (availabilityFilter === "disponibles" && item.disponible > 0) ||
        (availabilityFilter === "agotadas" && item.disponible <= 0);

      const searchableText = `
        ${item.nombre}
        ${item.descripcion ?? ""}
        ${item.categoria ?? ""}
        ${item.tamano ?? ""}
        ${item.colores.join(" ")}
        ${item.ubicaciones.join(" ")}
        ${item.propietarios.join(" ")}
      `.toLowerCase();

      const matchesSearch = !query || searchableText.includes(query);

      return matchesAvailability && matchesSearch;
    });
  }, [availabilityFilter, catalogItems, searchTerm]);

  return (
    <div className="w-full max-w-full overflow-x-hidden bg-[#456f89] px-3 py-4 text-[#08264d] sm:px-8 sm:py-7">
      <header className="mb-6 flex flex-col gap-4 lg:mb-10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-6">
          <h1 className="text-[42px] font-extrabold leading-none text-white sm:text-[56px]">
            Catálogo
          </h1>

          <div className="relative h-[46px] w-full lg:max-w-[650px]">
            <Search className="absolute left-4 top-1/2 h-6 w-6 -translate-y-1/2 text-[#08264d]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Buscar por hamaca, color, tamaño o ubicación"
              className="h-full w-full rounded-[8px] bg-[#f7f7f7] pl-14 pr-4 text-lg text-[#08264d] outline-none sm:text-xl"
            />
          </div>

          <button
            type="button"
            onClick={() => setHamacaModalOpen(true)}
            className="flex h-[46px] items-center justify-center gap-2 rounded-[8px] bg-[#f7f7f7] px-5 text-base font-semibold text-[#08264d] shadow-md sm:text-lg"
          >
            <Plus className="h-5 w-5" />
            Modelo
          </button>

          <button
            type="button"
            onClick={() => setVarianteModalOpen(true)}
            className="flex h-[46px] items-center justify-center gap-2 rounded-[8px] bg-[#123852] px-5 text-base font-semibold text-white shadow-md sm:text-lg"
          >
            <Layers className="h-5 w-5" />
            Variante
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3 sm:flex sm:flex-wrap">
          {(["todas", "disponibles", "agotadas"] as AvailabilityFilter[]).map(
            (filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setAvailabilityFilter(filter)}
                className={`h-[42px] rounded-[8px] px-4 text-sm font-semibold capitalize shadow-md sm:min-w-[170px] sm:text-base ${
                  availabilityFilter === filter
                    ? "bg-[#123852] text-white"
                    : "bg-[#f7f7f7] text-[#08264d]"
                }`}
              >
                {filter}
              </button>
            )
          )}
        </div>
      </header>

      {loading ? (
        <p className="text-xl font-semibold text-white">Cargando catálogo...</p>
      ) : null}

      {!loading && filteredItems.length === 0 ? (
        <p className="text-xl font-semibold text-white">
          No hay variantes para mostrar. Crea un modelo y luego una variante.
        </p>
      ) : null}

      <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {filteredItems.map((item) => (
          <CatalogoHamacaCard
            key={item.key}
            nombre={item.nombre}
            categoria={item.categoria}
            tamano={item.tamano}
            precio={item.precio}
            colores={item.colores}
            disponible={item.disponible}
            ubicaciones={item.ubicaciones}
            propietarios={item.propietarios}
            imageUrls={item.imageUrls}
            onViewPhotos={() => {
              setSelectedFotoData({
                varianteId: item.varianteId,
                hamacaNombre: item.nombre,
                fotos: item.rawFotos,
              });

              setFotoModalOpen(true);
            }}
            onViewInventory={() => {
              router.push(`/inventario-hamacas?varianteId=${item.varianteId}`);
            }}
          />
        ))}
      </section>

      <HamacaModal
        isOpen={hamacaModalOpen}
        onClose={() => setHamacaModalOpen(false)}
        onSuccess={loadData}
      />

      <VarianteModal
        isOpen={varianteModalOpen}
        onClose={() => setVarianteModalOpen(false)}
        onSuccess={loadData}
      />

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
    </div>
  );
}