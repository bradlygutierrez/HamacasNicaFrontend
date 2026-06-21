'use client';

import CategoryProductsSelector from "@/app/_components/category-products-selector";
import ProductCard from "@/app/_components/productCard";
import HamacaModal from "@/app/_components/hamaca-modal";
import { apiFetch } from "@/app/_lib/api";
import { Plus, Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

type Category = {
    id: number;
    nombre: string;
};

type InventoryItem = {
    cantidad: number;
    ubicacion?: { id: number; nombre: string } | null;
    usuario?: { id: number; nombre: string } | null;
    colores?: Array<{ id: number; nombre: string }>;
};

type Hamaca = {
    id: number;
    nombre: string;
    descripcion: string | null;
    categoria: string | null;
    ubicacion?: string | null;
    tamano: string | null;
    precio: number;
    inventario?: InventoryItem[];
    inventarios?: InventoryItem[];
    fotos?: Array<{ ruta: string }>;
};

type BaseHamaca = {
    id: number;
    nombre: string;
    descripcion: string | null;
    categoria_id: number;
    tamano_id: number;
    precio: number | string;
    fotos?: Array<{ id?: number; ruta: string }>;
};

export default function Productos() {
    const [modalOpen, setModalOpen] = useState(false);
    const [hamacaToEdit, setHamacaToEdit] = useState<BaseHamaca | null>(null);

    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    const [products, setProducts] = useState<Hamaca[]>([]);
    const [baseProducts, setBaseProducts] = useState<BaseHamaca[]>([]);

    const loadData = useCallback(async () => {
        const [categoriesResp, detailsResp, baseResp] = await Promise.all([
            apiFetch("/categorias"),
            apiFetch("/hamacas/detalles"),
            apiFetch("/hamacas"),
        ]);

        const categoriesData = await categoriesResp.json();
        const detailsData = await detailsResp.json();
        const baseData = await baseResp.json();

        setCategories(categoriesData.data ?? []);
        setProducts(detailsData.data ?? []);
        setBaseProducts(baseData.data ?? []);
    }, []);

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            loadData().catch(console.error);
        }, 0);

        return () => window.clearTimeout(timeoutId);
    }, [loadData]);

    const filteredProducts = useMemo(() => {
        return products.filter((product) => {
            const categoryName = categories.find((cat) => cat.id === selectedCategory)?.nombre;

            const matchesCategory =
                selectedCategory === null || categoryName === product.categoria;

            const matchesSearch =
                !searchTerm ||
                `${product.nombre} ${product.descripcion ?? ""} ${product.categoria ?? ""} ${product.tamano ?? ""}`
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase());

            return matchesCategory && matchesSearch;
        });
    }, [categories, products, searchTerm, selectedCategory]);

    function handleCreate() {
        setHamacaToEdit(null);
        setModalOpen(true);
    }

    function handleEdit(productId: number) {
        const base = baseProducts.find((item) => item.id === productId);
        const detail = products.find((item) => item.id === productId);

        if (!base) return;

        setHamacaToEdit({
            ...base,
            fotos: detail?.fotos ?? [],
        });
        setModalOpen(true);
    }

    return (
        <div className="w-full max-w-full overflow-x-hidden bg-[#456f89] px-3 py-4 text-[#08264d] sm:px-8 sm:py-7">            <header className="mb-6 flex flex-col gap-4 lg:mb-10">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-6">
                <h1 className="text-[42px] font-extrabold leading-none text-white sm:text-[56px]">
                    Hamacas
                </h1>

                <div className="relative h-[46px] w-full lg:max-w-[650px]">
                    <Search className="absolute left-4 top-1/2 h-6 w-6 -translate-y-1/2 text-[#08264d]" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Buscar hamaca"
                        className="h-full w-full rounded-[8px] bg-[#f7f7f7] pl-14 pr-4 text-lg text-[#08264d] outline-none sm:text-xl"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:items-center sm:gap-8">
                <button
                    type="button"
                    onClick={() => setSelectedCategory(null)}
                    className={`h-[44px] w-full rounded-[8px] px-4 text-base font-semibold shadow-md transition sm:w-auto sm:min-w-[260px] sm:text-lg ${selectedCategory === null
                        ? "bg-[#123852] text-white"
                        : "bg-[#f7f7f7] text-[#08264d]"
                        }`}
                >
                    Todas
                </button>

                {categories.map((cat) => (
                    <CategoryProductsSelector
                        key={cat.id}
                        categoryName={cat.nombre}
                        isSelected={selectedCategory === cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                    />
                ))}

                <button
                    type="button"
                    onClick={handleCreate}
                    className="flex h-[44px] w-full items-center justify-center gap-2 rounded-[10px] bg-[#f7f7f7] px-4 text-base font-medium text-black shadow-md sm:ml-auto sm:w-auto sm:px-5 sm:text-lg"
                >
                    <Plus className="h-5 w-5" />
                    Agregar
                </button>
            </div>
        </header>

            <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {filteredProducts.map((prod) => {
                    const inventory = prod.inventario ?? prod.inventarios ?? [];
                    const firstInventory = inventory[0];

                    return (
                        <ProductCard
                            key={prod.id}
                            nombre={prod.nombre}
                            cantidad={inventory.reduce((sum, item) => sum + Number(item.cantidad ?? 0), 0)}
                            color={firstInventory?.colores?.[0]?.nombre ?? "Sin color"}
                            propietario={firstInventory?.usuario?.nombre ?? "Sin propietario"}
                            ubicacion={firstInventory?.ubicacion?.nombre ?? prod.ubicacion ?? "Sin ubicación"}
                            urlImg={prod.fotos?.[0]?.ruta ?? ""}
                            imageUrls={prod.fotos?.map((foto) => foto.ruta) ?? []}
                            onEdit={() => handleEdit(prod.id)}
                        />
                    );
                })}
            </section>

            <HamacaModal
                isOpen={modalOpen}
                onClose={() => {
                    setModalOpen(false);
                    setHamacaToEdit(null);
                }}
                onSuccess={loadData}
                hamacaToEdit={hamacaToEdit}
            />
        </div>
    );
}
