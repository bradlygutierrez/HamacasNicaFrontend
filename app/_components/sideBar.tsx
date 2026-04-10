'use client';
import { sideBarButton } from "./sideBarButton"
import { useState } from "react";
import Link from "next/link";



function SideBar() {

    const [open, setOpen] = useState(false);
    const toggle = () => setOpen((v) => !v);
    return (
        <div className={`flex flex-col h-screen sticky p-2 gap-2 top-0 left-0  bg-[var(--color-foreground-secondary)] transition-all duration-300 overflow-hidden ${open ? 'w-56' : 'w-16'}`}>
            <div className="flex items-center gap-3">
                {sideBarButton({ photo: 'hamburger.svg', alt: 'Menu', hrefString: '#', onClick: toggle  })}
                <span className={`text-[var(--color-foreground)] transition-all duration-200 ${open ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 pointer-events-none'}`}>Menu</span>
            </div>

            <div className="mt-4 space-y-2">
                <div className="flex items-center gap-3">{sideBarButton({ photo: 'dashboard.svg', alt: 'Dashboard', hrefString: '/dashboard' })}<span className={`text-[var(--color-foreground)] transition-all duration-200 ${open ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 pointer-events-none'}`}> <Link href={"/dashboard"}>Dashboard</Link></span></div>

                <div className="flex items-center gap-3">{sideBarButton({ photo: 'users.svg', alt: 'Usuarios', hrefString: '/usuarios' })}<span className={`text-[var(--color-foreground)] transition-all duration-200 ${open ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 pointer-events-none'}`}> <Link href={"/usuarios"}>Usuarios</Link></span></div>

                <div className="flex items-center gap-3">{sideBarButton({ photo: 'products.svg', alt: 'Productos', hrefString: '#', })}<span className={`text-[var(--color-foreground)] transition-all duration-200 ${open ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 pointer-events-none'}`}>Productos</span></div>
                <div className="flex items-center gap-3">{sideBarButton({ photo: 'rightArrow.svg', alt: 'Entradas', hrefString: '#', })}<span className={`text-[var(--color-foreground)] transition-all duration-200 ${open ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 pointer-events-none'}`}>Entradas</span></div>
                <div className="flex items-center gap-3">{sideBarButton({ photo: 'leftArrow.svg', alt: 'Salidas', hrefString: '#', })}<span className={`text-[var(--color-foreground)] transition-all duration-200 ${open ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 pointer-events-none'}`}>Salidas</span></div>
                <div className="flex items-center gap-3">{sideBarButton({ photo: 'location.svg', alt: 'Ubicación', hrefString: '#', })}<span className={`text-[var(--color-foreground)] transition-all duration-200 ${open ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 pointer-events-none'}`}>Ubicación</span></div>
                <div className="flex items-center gap-3">{sideBarButton({ photo: 'colors.svg', alt: 'Colores', hrefString: '#', })}<span className={`text-[var(--color-foreground)] transition-all duration-200 ${open ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 pointer-events-none'}`}>Colores</span></div>
                <div className="flex items-center gap-3">{sideBarButton({ photo: 'size.svg', alt: 'Tamaño', hrefString: '#', })}<span className={`text-[var(--color-foreground)] transition-all duration-200 ${open ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 pointer-events-none'}`}>Tamaño</span></div>
                <div className="flex items-center gap-3">{sideBarButton({ photo: 'category.svg', alt: 'categoria', hrefString: '#', })}<span className={`text-[var(--color-foreground)] transition-all duration-200 ${open ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 pointer-events-none'}`}>categoria</span></div>
                <div className="flex items-center gap-3">{sideBarButton({ photo: 'sales.svg', alt: 'Ventas', hrefString: '#', })}<span className={`text-[var(--color-foreground)] transition-all duration-200 ${open ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 pointer-events-none'}`}>Ventas</span></div>
            </div>
        </div>
    );
}

export { SideBar }