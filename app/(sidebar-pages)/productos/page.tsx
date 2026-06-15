'use client';

import CategoryProductsSelector from "@/app/_components/category-products-selector";
import ProductCard from "@/app/_components/productCard";
import { apiFetch } from "@/app/_lib/api";
import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type Category = {
    id: number;
    nombre: string;
};

type Hamaca = {
    id: number;
    nombre: string;
    descripcion: string | null;
    categoria: string | null;
    ubicacion: string | null;
    tamano: string | null;
    precio: number;
    inventario?: Array<{
        cantidad: number;
        colores?: Array<{ nombre: string }>;
    }>;
    fotos?: Array<{ ruta: string }>;
};

export default function Productos() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [products, setProducts] = useState<Hamaca[]>([]);

    useEffect(() => {
        const load = async () => {
            const [categoriesResp, productsResp] = await Promise.all([
                apiFetch("/categorias"),
                apiFetch("/hamacas/detalles"),
            ]);

            const categoriesData = await categoriesResp.json();
            const productsData = await productsResp.json();

            setCategories(categoriesData.data ?? []);
            setProducts(productsData.data ?? []);
        };

        load().catch(console.error);
    }, []);

    const filteredProducts = useMemo(() => {
        return products.filter((product) => {
            const matchesCategory =
                selectedCategory === null ||
                categories.find((category) => category.id === selectedCategory)?.nombre === product.categoria;

            const matchesSearch =
                !searchTerm ||
                `${product.nombre} ${product.descripcion ?? ""} ${product.categoria ?? ""} ${product.ubicacion ?? ""} ${product.tamano ?? ""}`
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase());

            return matchesCategory && matchesSearch;
        });
    }, [categories, products, searchTerm, selectedCategory]);

    return (
        <div className="flex flex-col gap-6">
            <header className="space-y-3">
                <h1 className="text-3xl font-bold text-[var(--color-foreground-secondary)] md:text-5xl">
                    Hamacas
                </h1>
                <div className="relative w-full max-w-xl">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Buscar hamaca"
                        className="w-full rounded-md bg-white py-3 pl-10 pr-4 text-[var(--color-foreground)]"
                    />
                </div>
            </header>

            <section className="flex flex-wrap gap-2">
                <button
                    type="button"
                    onClick={() => setSelectedCategory(null)}
                    className={`rounded-[7px] px-3 py-2 text-sm font-medium transition-all ${selectedCategory === null ? "bg-[var(--color-foreground)] text-[var(--color-foreground-secondary)]" : "bg-[var(--color-background-secondary)] text-[var(--color-foreground)]"}`}
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
            </section>

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filteredProducts.map((prod) => (
                    <ProductCard
                        key={prod.id}
                        nombre={prod.nombre}
                        descripcion={prod.descripcion ?? ""}
                        categoria={prod.categoria ?? ""}
                        ubicacion={prod.ubicacion ?? ""}
                        tamano={prod.tamano ?? ""}
                        cantidad={prod.inventario?.reduce((sum, item) => sum + (item.cantidad ?? 0), 0) ?? 0}
                        precio={prod.precio}
                        urlImg={prod.fotos?.[0]?.ruta ?? ""}
                    />
                ))}
            </section>
        </div>
    );
}
