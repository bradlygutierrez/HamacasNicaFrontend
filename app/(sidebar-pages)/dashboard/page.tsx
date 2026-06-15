'use client';

import CategoryDasboardSelector from "@/app/_components/category-dasboard-selector";
import DashboardCard from "@/app/_components/dashboard-card";
import DashboardCardBlue from "@/app/_components/dashboard-card-blue";
import { apiFetch } from "@/app/_lib/api";
import { Clock, ListChecks, TrendingDown, TrendingUp } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
    Bar,
    BarChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

type Category = {
    id: number;
    nombre: string;
};

type Hamaca = {
    id: number;
    nombre: string;
    categoria: string | null;
    cantidad?: number;
    inventario?: Array<{
        cantidad: number;
    }>;
};

export default function Dashboard() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [hamacas, setHamacas] = useState<Hamaca[]>([]);
    const [inventoryInitial, setInventoryInitial] = useState(0);
    const [monthlyEntries, setMonthlyEntries] = useState(0);
    const [monthlyExits, setMonthlyExits] = useState(0);

    useEffect(() => {
        const load = async () => {
            const [categoriesResp, hamacasResp, inventoryResp, entriesResp, exitsResp] = await Promise.all([
                apiFetch("/categorias"),
                apiFetch("/hamacas/detalles"),
                apiFetch("/hamacas/monthly-inventory"),
                apiFetch("/movimientos/monthly-entries"),
                apiFetch("/movimientos/monthly-exits"),
            ]);

            const categoriesData = await categoriesResp.json();
            const hamacasData = await hamacasResp.json();
            const inventoryData = await inventoryResp.json();
            const entriesData = await entriesResp.json();
            const exitsData = await exitsResp.json();

            setCategories(categoriesData.data ?? []);
            setHamacas(hamacasData.data ?? []);
            setInventoryInitial(inventoryData.total ?? 0);
            setMonthlyEntries(entriesData.entries ?? 0);
            setMonthlyExits(exitsData.exits ?? 0);
        };

        load().catch(console.error);
    }, []);

    const existence = inventoryInitial + monthlyEntries - monthlyExits;

    const categoryStats = useMemo(() => {
        if (!selectedCategory) {
            const totals = hamacas.flatMap((hamaca) => hamaca.inventario ?? []).map((item) => item.cantidad ?? 0);
            return {
                stockMin: totals.length ? Math.min(...totals) : 0,
                stockMax: totals.length ? Math.max(...totals) : 0,
                totalProducts: totals.reduce((acc, value) => acc + value, 0),
            };
        }

        const categoryName = categories.find((category) => category.id === selectedCategory)?.nombre;
        const filtered = hamacas.filter((hamaca) => hamaca.categoria === categoryName);
        const totals = filtered.flatMap((hamaca) => hamaca.inventario ?? []).map((item) => item.cantidad ?? 0);

        return {
            stockMin: totals.length ? Math.min(...totals) : 0,
            stockMax: totals.length ? Math.max(...totals) : 0,
            totalProducts: totals.reduce((acc, value) => acc + value, 0),
        };
    }, [categories, hamacas, selectedCategory]);

    const chartData = useMemo(() => {
        return categories.map((category) => {
            const categoryHamacas = hamacas.filter((hamaca) => hamaca.categoria === category.nombre);
            const entradas = categoryHamacas.reduce((acc, hamaca) => acc + (hamaca.inventario?.reduce((sum, item) => sum + (item.cantidad ?? 0), 0) ?? 0), 0);
            return {
                categoria: category.nombre,
                entradas,
                salidas: Math.max(0, entradas - 1),
            };
        });
    }, [categories, hamacas]);

    return (
        <div className="flex flex-col gap-6">
            <header className="space-y-2">
                <h1 className="text-3xl font-bold text-[var(--color-foreground-secondary)] md:text-5xl">
                    Panel de Control de Inventario
                </h1>
                <p className="max-w-2xl text-sm text-[var(--color-foreground-secondary)]/80 md:text-base">
                    Vista general de inventario, movimientos y categorías.
                </p>
            </header>

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <DashboardCard cardTitle="Inventario inicial" cardScore={inventoryInitial.toString()} />
                <DashboardCard cardTitle="Entradas (Compras)" cardScore={monthlyEntries.toString()} />
                <DashboardCard cardTitle="Salidas (Ventas)" cardScore={monthlyExits.toString()} />
                <DashboardCard cardTitle="Existencia" cardScore={existence.toString()} />
            </section>

            <main className="grid gap-6 xl:grid-cols-2">
                <section className="flex flex-col gap-4 rounded-2xl bg-[var(--color-background-secondary)] p-4 md:p-5">
                    <h2 className="text-xl font-bold text-[var(--color-foreground)] md:text-3xl">
                        Análisis de Stock de Inventario
                    </h2>
                    <p className="text-sm text-[var(--color-foreground)]/70">Productos por categoría</p>

                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={() => setSelectedCategory(null)}
                            className={`rounded-[7px] px-3 py-2 text-sm font-medium transition-all ${selectedCategory === null ? "bg-[var(--color-foreground)] text-[var(--color-foreground-secondary)]" : "bg-[var(--color-foreground-secondary)] text-[var(--color-foreground)]"}`}
                        >
                            Todas
                        </button>
                        {categories.map((cat) => (
                            <CategoryDasboardSelector
                                key={cat.id}
                                categoryName={cat.nombre}
                                isSelected={selectedCategory === cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                            />
                        ))}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <DashboardCardBlue
                            cardTitle="Stock Mínimo"
                            cardScore={categoryStats.stockMin.toString()}
                            icon={TrendingDown}
                        />
                        <DashboardCardBlue
                            cardTitle="Stock Máximo"
                            cardScore={categoryStats.stockMax.toString()}
                            icon={TrendingUp}
                        />
                        <DashboardCardBlue
                            cardTitle="Cantidad de Productos"
                            cardScore={categoryStats.totalProducts.toString()}
                            icon={ListChecks}
                        />
                        <DashboardCardBlue
                            cardTitle="Duración de Inventario"
                            cardScore="30"
                            icon={Clock}
                        />
                    </div>
                </section>

                <section className="rounded-2xl bg-[var(--color-background-secondary)] p-4 md:p-5">
                    <h2 className="text-xl font-bold text-[var(--color-foreground)] md:text-3xl">
                        Entradas y Salidas de Productos
                    </h2>
                    <div className="mt-4 h-[320px] md:h-[420px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <XAxis dataKey="categoria" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="entradas" fill="#1f4e5f" />
                                <Bar dataKey="salidas" fill="#c7b8ad" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </section>
            </main>
        </div>
    );
}
