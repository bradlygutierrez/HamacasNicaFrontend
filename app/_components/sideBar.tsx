'use client';

import Link from "next/link";
import { useState } from "react";

const ITEMS = [
    { href: "/dashboard", label: "Dashboard", photo: "dashboard.svg" },
    { href: "/usuarios", label: "Usuarios", photo: "users.svg" },
    { href: "/productos", label: "Productos", photo: "products.svg" },
    { href: "/entradas", label: "Entradas", photo: "rightArrow.svg" },
    { href: "/salidas", label: "Salidas", photo: "leftArrow.svg" },
    { href: "/ubicacion", label: "Ubicación", photo: "location.svg" },
    { href: "/colores", label: "Colores", photo: "colors.svg" },
    { href: "/tamano", label: "Tamaño", photo: "size.svg" },
    { href: "/categoria", label: "Categoría", photo: "category.svg" },
    { href: "/ventas", label: "Ventas", photo: "sales.svg" },
];

function Icon({ photo }: { photo: string }) {
    return (
        <span
            className="h-6 w-6 inline-block"
            style={{
                WebkitMaskImage: `url(${photo})`,
                WebkitMaskRepeat: "no-repeat",
                WebkitMaskSize: "contain",
                WebkitMaskPosition: "center",
                maskImage: `url(${photo})`,
                maskRepeat: "no-repeat",
                maskSize: "contain",
                maskPosition: "center",
                backgroundColor: "currentColor",
            }}
            aria-hidden="true"
        />
    );
}

function SideBar() {
    const [open, setOpen] = useState(false);

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="fixed left-3 top-3 z-40 rounded-full bg-[var(--color-foreground-secondary)] p-3 text-[var(--color-foreground)] shadow-lg md:hidden"
                aria-label="Abrir menú"
            >
                <Icon photo="hamburger.svg" />
            </button>

            {open && (
                <button
                    type="button"
                    aria-label="Cerrar menú"
                    onClick={() => setOpen(false)}
                    className="fixed inset-0 z-40 bg-black/40 md:hidden"
                />
            )}

            <aside
                className={`
                    fixed left-0 top-0 z-50 h-screen w-72 bg-[var(--color-foreground-secondary)] p-4 shadow-2xl transition-transform duration-300 md:sticky md:translate-x-0 md:w-72
                    ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
                `}
            >
                <div className="mb-6 flex items-center justify-between">
                    <Link href="/dashboard" className="flex items-center gap-3" onClick={() => setOpen(false)}>
                        <span className="h-10 w-10 rounded-full bg-[url('/Logo.svg')] bg-cover bg-center" />
                        <div>
                            <p className="text-sm font-semibold text-[var(--color-foreground)]">Hamacas Nica</p>
                            <p className="text-xs text-[var(--color-foreground)]/70">Panel administrativo</p>
                        </div>
                    </Link>

                    <button
                        type="button"
                        onClick={() => setOpen(false)}
                        className="rounded-full p-2 text-[var(--color-foreground)] md:hidden"
                        aria-label="Cerrar menú"
                    >
                        ×
                    </button>
                </div>

                <nav className="space-y-2">
                    {ITEMS.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setOpen(false)}
                            className="flex items-center gap-3 rounded-xl px-3 py-2 text-[var(--color-foreground)] transition-colors hover:bg-[var(--color-background-secondary)]"
                        >
                            <Icon photo={item.photo} />
                            <span className="text-sm font-medium">{item.label}</span>
                        </Link>
                    ))}
                </nav>
            </aside>
        </>
    );
}

export { SideBar };
