'use client'

import { useEffect, useMemo, useState } from "react"
import CategoryDasboardSelector from "@/app/_components/category-dasboard-selector"
import DashboardCard from "@/app/_components/dashboard-card"
import DashboardCardBlue from "@/app/_components/dashboard-card-blue"
import { apiFetch } from "@/app/_lib/api"
import { TrendingDown, TrendingUp, ListChecks, Clock } from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    ResponsiveContainer
} from "recharts";

type Category = {
    id: number;
    nombre: string;
};

type Hamaca = {
    id: number;
    nombre: string;
    categoria: string | null;
    inventario?: Array<{
        cantidad: number;
    }>;
};

export default function Dashboard() {
    const [categories, setCategory] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [inventoryInitial, setInventoryInitial] = useState<number>(0);
    const [montlyEntries, setMontlyEntries] = useState<number>(0);
    const [montlyExits, setMontlyExits] = useState<number>(0);
    const [hamacas, setHamacas] = useState<Hamaca[]>([]);

    useEffect(() => {
        const load = async () => {
            try {
                const [categoriesResp, inventoryResp, entriesResp, exitsResp, hamacasResp] = await Promise.all([
                    apiFetch("/categorias"),
                    apiFetch("/hamacas/monthly-inventory"),
                    apiFetch("/movimientos/monthly-entries"),
                    apiFetch("/movimientos/monthly-exits"),
                    apiFetch("/hamacas/detalles"),
                ]);

                const categoriesData = await categoriesResp.json();
                const inventoryData = await inventoryResp.json();
                const entriesData = await entriesResp.json();
                const exitsData = await exitsResp.json();
                const hamacasData = await hamacasResp.json();

                setCategory(categoriesData.data ?? []);
                setInventoryInitial(inventoryData.total ?? 0);
                setMontlyEntries(entriesData.entries ?? 0);
                setMontlyExits(exitsData.exits ?? 0);
                setHamacas(hamacasData.data ?? []);
            } catch (error) {
                console.log(error);
            }
        };

        load();
    }, []);

    const existence = inventoryInitial + montlyEntries - montlyExits;

    const { stockMin, stockMax, totalProducts, chartData } = useMemo(() => {
        const filteredHamacas = selectedCategory
            ? hamacas.filter((hamaca) => categories.find((category) => category.id === selectedCategory)?.nombre === hamaca.categoria)
            : hamacas;

        const totals = filteredHamacas.flatMap((hamaca) => hamaca.inventario ?? []).map((item) => item.cantidad ?? 0);
        const stockMinValue = totals.length ? Math.min(...totals) : 0;
        const stockMaxValue = totals.length ? Math.max(...totals) : 0;
        const totalProductsValue = totals.reduce((acc, value) => acc + value, 0);

        const data = categories.map((category) => {
            const categoryHamacas = hamacas.filter((hamaca) => hamaca.categoria === category.nombre);
            const entradas = categoryHamacas.reduce((acc, hamaca) => acc + (hamaca.inventario?.reduce((sum, item) => sum + (item.cantidad ?? 0), 0) ?? 0), 0);
            return {
                categoria: category.nombre,
                entradas,
                salidas: Math.max(0, entradas - 1),
            };
        });

        return {
            stockMin: stockMinValue,
            stockMax: stockMaxValue,
            totalProducts: totalProductsValue,
            chartData: data,
        };
    }, [categories, hamacas, selectedCategory]);

    return (
        <div className="flex flex-col w-full h-full p-10">
            <header className="p-5">
                <h1 className="text-4xl font-bold text-[var(--color-foreground-secondary)]">Panel de Control de Inventario</h1>
            </header>
            <section className="h-[30%] w-full flex flex-wrap justify-around">
                <DashboardCard cardTitle="Inventario inicial" cardScore={inventoryInitial.toString()} />
                <DashboardCard cardTitle="Entradas (Compras)" cardScore={montlyEntries.toString()} />
                <DashboardCard cardTitle="Salidas (Ventas)" cardScore={montlyExits.toString()} />
                <DashboardCard cardTitle="Existencia" cardScore={existence.toString()} />
            </section>

            <main className="w-full h-[50rem] flex flex-wrap">
                <section className="p-3 w-1/2 flex flex-col">
                    <h1 className="text-center p-2 w-[70%] rounded-[7px] bg-[var(--color-foreground-secondary)] text-3xl font-bold text-[var(--color-foreground)]">Análisis de Stock de Inventario</h1>
                    <nav className="w-full p-5">
                        <h2 className="italic text-2xl font-medium text-[var(--color-foreground-secondary)]">Productos</h2>
                    </nav>
                    <nav className="flex flex-wrap gap-5 p-2">
                        <button
                            type="button"
                            onClick={() => setSelectedCategory(null)}
                            className={`rounded-[7px] px-4 py-2 text-sm font-medium transition-colors ${selectedCategory === null ? "bg-[var(--color-foreground-secondary)] text-[var(--color-foreground)]" : "bg-[var(--color-background-secondary)] text-[var(--color-foreground-secondary)]"}`}
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
                    </nav>
                    <nav className="flex flex-col gap-6 mt-7">
                        <div className="flex flex-wrap gap-6">
                            <DashboardCardBlue
                                cardTitle="Stock Mínimo"
                                cardScore={stockMin.toString()}
                                icon={TrendingDown}
                            />

                            <DashboardCardBlue
                                cardTitle="Stock Máximo"
                                cardScore={stockMax.toString()}
                                icon={TrendingUp}
                            />
                        </div>
                        <div className="flex flex-wrap gap-6">
                            <DashboardCardBlue
                                cardTitle="Cantidad de Productos"
                                cardScore={totalProducts.toString()}
                                icon={ListChecks}
                            />

                            <DashboardCardBlue
                                cardTitle="Duración de Inventario (Días)"
                                cardScore="30"
                                icon={Clock}
                            />
                        </div>
                    </nav>
                </section>
                <section className="w-1/2 bg-[white] flex flex-col rounded-xl p-5">
                    <section className="bg-[white] flex flex-col rounded-xl p-1 justify-center items-center">
                        <h1 className="text-center p-2 w-[100%] rounded-[7px] text-3xl font-bold text-[var(--color-foreground)]">
                            Entradas y Salidas de Productos
                        </h1>

                        <div className="w-full h-[500px] mt-5">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <XAxis dataKey="categoria" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="entradas" fill="#1f4e5f" />
                                    <Bar dataKey="salidas" fill="#c7b8ad" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </section>
                </section>
            </main>
        </div>
    )
}
