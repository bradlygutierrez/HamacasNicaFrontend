'use client'
import { use, useEffect, useState } from "react"
import CategoryDasboardSelector from "@/app/_components/category-dasboard-selector"
import { getEnabledCategories } from "trace_events"
import DashboardCard from "@/app/_components/dashboard-card"
import DashboardCardBlue from "@/app/_components/dashboard-card-blue"
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

export default function Dashboard() {
    const [categories, setCategory] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null); const [inventoryInitial, setInventoryInitial] = useState<number>(0);
    const [montlyEntries, setMontlyEntries] = useState<number>(0);
    const [montlyExits, setMontlyExits] = useState<number>(0);
    const [existence, setExistence] = useState<number>(0);
    const [chartData, setChartData] = useState<any[]>([]);
    const [stockMin, setStockMin] = useState(0);
    const [stockMax, setStockMax] = useState(0);
    const [totalProducts, setTotalProducts] = useState(0);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const resp = await fetch("http://127.0.0.1:8000/api/v1/categorias")


                const data = await resp.json();


                setCategory(data.data)

            }
            catch (error) {
                console.log(error)
            }
        };

        fetchCategories();
    }, [])


    useEffect(() => {
        const fetchInventoryInitial = async () => {
            try {
                const resp = await fetch("http://127.0.0.1:8000/api/v1/hamacas/monthly-inventory")
                const data = await resp.json()
                setInventoryInitial(data.total)
            }
            catch (error) {
                console.log(error)
            }
        }
        fetchInventoryInitial()
    }, [])


    useEffect(() => {

        const fetchMontlyEntries = async () => {
            try {
                const resp = await fetch("http://127.0.0.1:8000/api/v1/movimientos/monthly-entries")
                const data = await resp.json()
                setMontlyEntries(data.entries)
            }
            catch (error) {
                console.log(error)
            }
        }

        fetchMontlyEntries()
    }, [])


    useEffect(() => {
        const fetchMonthlyExits = async () => {
            try {
                const respt = await fetch("http://127.0.0.1:8000/api/v1/movimientos/monthly-exits")
                const data = await respt.json()
                setMontlyExits(data.exits)
            }
            catch (error) {
                console.log(error)
            }
        }
        fetchMonthlyExits()
    }, [])


    useEffect(() => {
        setExistence(inventoryInitial + montlyEntries - montlyExits)
    }, [inventoryInitial, montlyEntries, montlyExits])


    useEffect(() => {
        const fetchChartData = async () => {
            try {
                const resp = await fetch("http://127.0.0.1:8000/api/v1/dashboard/movements-by-category")
                const data = await resp.json()

                setChartData(data.data)
            } catch (error) {
                console.log(error)
            }
        }

        fetchChartData()
    }, [])


    useEffect(() => {
        if (!selectedCategory) return;

        const fetchCategoryStats = async () => {
            try {
                const resp = await fetch(`http://127.0.0.1:8000/api/v1/dashboard/category-stats/${selectedCategory}`)
                const data = await resp.json();

                setStockMin(data.stock_minimo || 0);
                setStockMax(data.stock_maximo || 0);
                setTotalProducts(data.total_productos || 0);

            } catch (error) {
                console.log(error);
            }
        }

        fetchCategoryStats();
    }, [selectedCategory]);

    return (
        <div className="flex flex-col  w-full h-full p-10">
            <header className="p-5">
                <h1 className="text-4xl  font-bold text-[var(--color-foreground-secondary)]">Panel de Control de Inventario</h1>
            </header>
            <section className="h-[30%] w-full flex flex-wrap justify-around">
                <DashboardCard cardTitle="Inventario inicial" cardScore={inventoryInitial.toString()} />
                <DashboardCard cardTitle="Entradas (Compras)" cardScore={montlyEntries.toString()} />
                <DashboardCard cardTitle="Salidas (Ventas)" cardScore={montlyExits.toString()} />
                <DashboardCard cardTitle="Existencia" cardScore={existence.toString()} />
            </section>

            <main className="w-full h-[50rem] flex flex-wrap">
                <section className=" p-3 w-1/2 flex flex-col" >
                    <h1 className="text-center p-2 w-[70%] rounded-[7px] 
                    bg-[var(--color-foreground-secondary)] 
                    text-3xl font-bold text-[var(--color-foreground)]">Análisis de Stock de Inventario</h1>
                    <nav className="w-full p-5">
                        <h2 className="italic text-2xl
                         font-medium text-[var(--color-foreground-secondary)]">Productos</h2>
                    </nav>
                    <nav className="flex flex-wrap gap-5 p-2">

                        {categories.map((cat: any) => (
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
                <section className="w-1/2 w-1/2 bg-[white] flex flex-col rounded-xl p-5">
                    <section className=" bg-[white] flex flex-col rounded-xl p-1 justify-center items-center">
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