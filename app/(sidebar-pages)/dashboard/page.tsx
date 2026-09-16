'use client';

import CategoryDasboardSelector from "@/app/_components/category-dasboard-selector";
import DashboardCard from "@/app/_components/dashboard-card";
import DashboardCardBlue from "@/app/_components/dashboard-card-blue";
import { apiFetch } from "@/app/_lib/api";
import { ListChecks, TrendingDown, TrendingUp } from "lucide-react";
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
    categoria_id: number;
    categoria: string;
    stock: number;
};

type CategoryMovement = {
    categoria_id: number;
    categoria: string;
    entradas: number;
    salidas: number;
    transferencias: number;
};

type DashboardSummary = {
    existencia_actual_total: number;
    entradas_mes: number;
    salidas_mes: number;
    stock_minimo: number;
    stock_maximo: number;
    unidades_totales: number;
    stock_por_categoria: Category[];
    entradas_salidas_por_categoria: CategoryMovement[];
};

export default function Dashboard() {
    const [summary, setSummary] = useState<DashboardSummary | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [error, setError] = useState("");

    useEffect(() => {
        const load = async () => {
            const response = await apiFetch("/dashboard/summary");
            const data = await response.json().catch(() => null);

            if (!response.ok) {
                throw new Error(data?.message ?? `HTTP ${response.status}`);
            }

            setSummary(data.data);
        };

        load().catch((err) => {
            console.error(err);
            setError("No se pudieron cargar las métricas del dashboard.");
        });
    }, []);

    const categories = useMemo(() => summary?.stock_por_categoria ?? [], [summary]);

    const categoryStats = useMemo(() => {
        if (!summary) {
            return { stockMin: 0, stockMax: 0, totalProducts: 0 };
        }

        if (!selectedCategory) {
            return {
                stockMin: summary.stock_minimo,
                stockMax: summary.stock_maximo,
                totalProducts: summary.unidades_totales,
            };
        }

        const category = categories.find((item) => item.categoria_id === selectedCategory);
        const stock = Number(category?.stock ?? 0);
        return {
            stockMin: stock,
            stockMax: stock,
            totalProducts: stock,
        };
    }, [categories, selectedCategory, summary]);

    const chartData = useMemo(() => {
        return (summary?.entradas_salidas_por_categoria ?? []).map((item) => ({
            categoria: item.categoria,
            entradas: Number(item.entradas ?? 0),
            salidas: Number(item.salidas ?? 0),
        }));
    }, [summary]);

    if (error) {
        return <p className="text-sm font-semibold text-red-700">{error}</p>;
    }

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
                <DashboardCard cardTitle="Existencia actual" cardScore={(summary?.existencia_actual_total ?? 0).toString()} />
                <DashboardCard cardTitle="Entradas del mes" cardScore={(summary?.entradas_mes ?? 0).toString()} />
                <DashboardCard cardTitle="Salidas del mes" cardScore={(summary?.salidas_mes ?? 0).toString()} />
                <DashboardCard cardTitle="Unidades totales" cardScore={(summary?.unidades_totales ?? 0).toString()} />
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
                                key={cat.categoria_id}
                                categoryName={cat.categoria}
                                isSelected={selectedCategory === cat.categoria_id}
                                onClick={() => setSelectedCategory(cat.categoria_id)}
                            />
                        ))}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
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
