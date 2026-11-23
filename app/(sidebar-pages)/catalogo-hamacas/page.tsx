"use client";
import { translateText } from "@/app/_lib/localization";

import CatalogoHamacaCard from "@/app/_components/catalogo-hamaca-card";
import FotoHamacaModal from "@/app/_components/foto-hamaca-modal";
import HamacaModal from "@/app/_components/hamaca-modal";
import { useCatalogCapabilities } from "@/app/_components/catalog-permissions-provider";
import { apiFetch } from "@/app/_lib/api";
import { Plus, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { BACKEND_BASE_URL } from "@/app/_lib/api";
type Color = {
  id: number;
  nombre: string;
};

type Foto = {
  id: number;
  ruta: string;
};

type Inventario = {
  id: number;
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
  categoria_id: number;
  tamano_id: number;
  categoria: string | { id?: number; nombre: string } | null;
  tamano: string | { id?: number; nombre: string } | null;
  precio: string | number;
  fotos?: Foto[];
  colores?: Color[];
  inventario?: Inventario[];
};

type FormulaSummary = {
  id?: number;
  hamaca_id?: number;
  hamaca?: { id: number };
  receta_activa?: { version: number } | null;
  receta_borrador?: { version: number } | null;
};

type AvailabilityFilter = "todas" | "disponibles" | "agotadas";
type CatalogMeta = { current_page: number; last_page: number; total: number };
const PAGE_SIZE = 15;


function imageUrl(path?: string) {
  if (!path) return "";

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  if (path.startsWith("/storage/")) {
    return `${BACKEND_BASE_URL}${path}`;
  }

  return `${BACKEND_BASE_URL}/storage/${path}`;
}

function uniqueValues(values: Array<string | null | undefined>): string[] {
  return Array.from(new Set(values.filter(Boolean) as string[]));
}

function relationName(value: string | { nombre: string } | null): string | null {
  return typeof value === "string" ? value : value?.nombre ?? null;
}

export default function CatalogoHamacasPage() {
  const router = useRouter();
  const { canCreate: canCreateFormula, canView: canViewFormula } =
    useCatalogCapabilities("/formulas");

  const [hamacas, setHamacas] = useState<Hamaca[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [availabilityFilter, setAvailabilityFilter] =
    useState<AvailabilityFilter>("todas");
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<CatalogMeta>({ current_page: 1, last_page: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [formulaByHamaca, setFormulaByHamaca] = useState<Record<number, FormulaSummary>>({});

  const [hamacaModalOpen, setHamacaModalOpen] = useState(false);
  const [selectedHamacaToEdit, setSelectedHamacaToEdit] =
    useState<Hamaca | null>(null);

  const [fotoModalOpen, setFotoModalOpen] = useState(false);
  const [selectedFotoData, setSelectedFotoData] = useState<{
    hamacaId: number;
    hamacaNombre: string;
    fotos: Foto[];
  } | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);

    try {
      const params = new URLSearchParams({
        page: String(page),
        per_page: String(PAGE_SIZE),
        search: searchTerm,
        disponibilidad: availabilityFilter,
      });
      const response = await apiFetch(`/hamacas/detalles?${params.toString()}`);
      const data = await response.json().catch(() => null);

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const currentHamacas = Array.isArray(data?.data) ? data.data as Hamaca[] : [];
      setHamacas(currentHamacas);
      setMeta(data?.meta ?? { current_page: page, last_page: 1, total: currentHamacas.length });

      if (canViewFormula && currentHamacas.length > 0) {
        const formulaResults = await Promise.all(currentHamacas.map(async (hamaca) => {
          const formulaResponse = await apiFetch(`/formulas?hamaca_id=${hamaca.id}&per_page=1`);
          const formulaData = await formulaResponse.json().catch(() => null);
          if (!formulaResponse.ok) throw new Error(`HTTP ${formulaResponse.status}`);
          return [hamaca.id, Array.isArray(formulaData?.data) ? formulaData.data[0] : undefined] as const;
        }));
        setFormulaByHamaca(Object.fromEntries(formulaResults.filter(([, formula]) => formula)));
      } else {
        setFormulaByHamaca({});
      }
    } catch (error) {
      console.error("Error cargando catálogo:", error);
      toast.error("No se pudo cargar el catálogo.");
    } finally {
      setLoading(false);
    }
  }, [availabilityFilter, canViewFormula, page, searchTerm]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadData();
    }, searchTerm.trim() ? 250 : 0);

    return () => window.clearTimeout(timer);
  }, [loadData]);

  const catalogItems = useMemo(() => {
    return hamacas.map((hamaca) => {
        const inventarios = hamaca.inventario ?? [];
        const disponible = inventarios.reduce(
          (sum, inventario) => sum + Number(inventario.cantidad ?? 0),
          0
        );

        const fotos = hamaca.fotos ?? [];

        return {
          key: String(hamaca.id),
          hamaca,
          hamacaId: hamaca.id,
          nombre: hamaca.nombre,
          descripcion: hamaca.descripcion,
          categoria: relationName(hamaca.categoria),
          tamano: relationName(hamaca.tamano),
          precio: hamaca.precio,
          colores: (hamaca.colores ?? []).map((color) => color.nombre),
          disponible,
          ubicaciones: uniqueValues(
            inventarios.map(
              (inventario) => inventario.ubicacion?.nombre
            )
          ),
          propietarios: uniqueValues(
            inventarios.map(
              (inventario) => inventario.usuario?.nombre
            )
          ),
          imageUrls: fotos.map((foto) => imageUrl(foto.ruta)),
          rawFotos: fotos,
        };
      });
  }, [hamacas]);

  return (
    <div className="w-full max-w-full overflow-x-hidden bg-[var(--page-background)] px-3 py-4 text-[#08264d] sm:px-8 sm:py-7">
      <header className="mb-6 flex flex-col gap-4 lg:mb-10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-6">
          <h1 className="text-[41px] font-extrabold leading-none text-white sm:text-[55px]">
            {translateText("Catálogo\n          ")}</h1>

          <div className="relative h-[46px] w-full lg:max-w-[650px]">
            <Search className="absolute left-4 top-1/2 h-6 w-6 -translate-y-1/2 text-[#08264d]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setPage(1);
              }}
              placeholder={translateText("Buscar por hamaca, color, tamaño o ubicación")}
              className="h-full w-full rounded-[8px] bg-[#f7f7f7] pl-14 pr-4 text-lg text-[#08264d] outline-none sm:text-xl"
            />
          </div>

          <button
            type="button"
            onClick={() => setHamacaModalOpen(true)}
            className="flex h-[46px] items-center justify-center gap-2 rounded-[8px] bg-[#f7f7f7] px-5 text-base font-semibold text-[#08264d] shadow-md sm:text-lg"
          >
            <Plus className="h-5 w-5" />
            {translateText("Nueva hamaca\n          ")}</button>
        </div>

        <div className="grid grid-cols-3 gap-3 sm:flex sm:flex-wrap">
          {(["todas", "disponibles", "agotadas"] as AvailabilityFilter[]).map(
            (filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => {
                  setAvailabilityFilter(filter);
                  setPage(1);
                }}
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
        <p className="text-xl font-semibold text-white">{translateText("Cargando catálogo...")}</p>
      ) : null}

      {!loading && catalogItems.length === 0 ? (
        <p className="text-xl font-semibold text-white">
          {translateText("No hay hamacas para mostrar. Crea una nueva hamaca.\n        ")}</p>
      ) : null}

      <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {catalogItems.map((item) => (
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
            formulaActiveVersion={formulaByHamaca[item.hamacaId]?.receta_activa?.version}
            formulaDraftVersion={formulaByHamaca[item.hamacaId]?.receta_borrador?.version}
            formulaActionLabel={(() => {
              const formula = formulaByHamaca[item.hamacaId];
              const hasActive = Boolean(formula?.receta_activa);
              const hasDraft = Boolean(formula?.receta_borrador);

              if (hasActive && hasDraft) {
                return canCreateFormula ? "Continuar borrador" : "Ver fórmula / borrador";
              }

              if (hasDraft) {
                return canCreateFormula ? "Continuar fórmula" : "Ver borrador";
              }

              if (hasActive) return "Ver fórmula";
              return "Configurar fórmula";
            })()}
            showFormulaAction={Boolean(
              canViewFormula &&
                (canCreateFormula ||
                  formulaByHamaca[item.hamacaId]?.receta_activa ||
                  formulaByHamaca[item.hamacaId]?.receta_borrador)
            )}
            onFormulaAction={() => router.push(`/formulas/${item.hamacaId}`)}
            onEdit={() => {
              setSelectedHamacaToEdit(item.hamaca);
              setHamacaModalOpen(true);
            }}
            onViewPhotos={() => {
              setSelectedFotoData({
                hamacaId: item.hamacaId,
                hamacaNombre: item.nombre,
                fotos: item.rawFotos,
              });

              setFotoModalOpen(true);
            }}
            onViewInventory={() => {
              router.push(`/inventario-hamacas?hamacaId=${item.hamacaId}`);
            }}
          />
        ))}
      </section>

      {meta.last_page > 1 ? (
        <nav className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-2 rounded-[8px] bg-[#e9eef1] p-3 text-xs font-bold text-[#08264d] sm:flex sm:justify-between sm:text-sm">
          <button
            type="button"
            disabled={page <= 1 || loading}
            onClick={() => setPage((current) => current - 1)}
            className="justify-self-start rounded bg-white px-3 py-2 disabled:opacity-40"
          >
            {translateText("Anterior")}
          </button>
          <span className="whitespace-nowrap text-center">
            {translateText("Página ")}{meta.current_page} {translateText("de ")}{meta.last_page} · {meta.total} {translateText("hamacas")}
          </span>
          <button
            type="button"
            disabled={page >= meta.last_page || loading}
            onClick={() => setPage((current) => current + 1)}
            className="justify-self-end rounded bg-white px-3 py-2 disabled:opacity-40"
          >
            {translateText("Siguiente")}
          </button>
        </nav>
      ) : null}

      <HamacaModal
        isOpen={hamacaModalOpen}
        onClose={() => {
          setHamacaModalOpen(false);
          setSelectedHamacaToEdit(null);
        }}
        onSuccess={(createdHamacaId) => {
          void loadData();
          if (createdHamacaId) {
            toast.info("Hamaca creada. Configurar fórmula ahora", {
              onClick: () => router.push(`/formulas/${createdHamacaId}`),
            });
          }
        }}
        hamacaToEdit={selectedHamacaToEdit}
      />

      <FotoHamacaModal
        isOpen={fotoModalOpen}
        hamacaId={selectedFotoData?.hamacaId ?? null}
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
