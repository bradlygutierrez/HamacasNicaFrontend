"use client";
import { translateText } from "@/app/_lib/localization";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  DashboardDots as LayoutDashboard,
  Packages as Boxes,
  ViewGrid as BookOpen,
  ShoppingBagArrowDown as ArrowDownToLine,
  ShoppingBagArrowUp as ArrowUpFromLine,
  Cube as Package,
  Industry as Hammer,
  ShoppingBag as ShoppingCart,
  Tools as BriefcaseBusiness,
  MapPin,
  ColorFilter as Palette,
  Ruler,
  Label as Tags,
  Group as Users,
  Settings as Settings2,
} from "iconoir-react";
import { Search, X } from "lucide-react";

import type { NavItem } from "../_lib/permissions";

type IconType = typeof LayoutDashboard;

const NAV_ICONS: Record<string, IconType> = {
  "/dashboard": LayoutDashboard,
  "/inventario-hamacas": Boxes,
  "/catalogo-hamacas": BookOpen,
  "/entradas": ArrowDownToLine,
  "/salidas": ArrowUpFromLine,
  "/materiales": Package,
  "/procesos-produccion": Hammer,
  "/ventas": ShoppingCart,
  "/servicios-adicionales": BriefcaseBusiness,
  "/ubicacion": MapPin,
  "/colores": Palette,
  "/tamano": Ruler,
  "/categoria": Tags,
  "/usuarios": Users,
};

const SECTION_ICONS: Record<string, IconType> = {
  General: LayoutDashboard,
  "Productos e inventario": Boxes,
  Producción: Hammer,
  Comercial: ShoppingCart,
  "Catálogos / configuración": Settings2,
  Administración: Users,
};

const SEARCH_SHORTCUT = "Ctrl K";

function getNavIcon(href: string) {
  return NAV_ICONS[href] ?? Package;
}

function getSectionIcon(section: string) {
  return SECTION_ICONS[section] ?? Settings2;
}

type SideBarSearchProps = {
  navItems: NavItem[];
  onNavigate?: () => void;
};

function SideBarSearch({ navItems, onNavigate }: SideBarSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLInputElement>(null);

  const normalizedQuery = query.trim().toLocaleLowerCase();
  const results = navItems.filter((item) =>
    `${item.label} ${item.alt} ${item.section ?? ""}`
      .toLocaleLowerCase()
      .includes(normalizedQuery)
  );

  useEffect(() => {
    function handleShortcut(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setIsOpen((current) => !current);
      }
    }

    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  useEffect(() => {
    if (isOpen) searchInputRef.current?.focus();
  }, [isOpen]);

  function closeSearch() {
    setIsOpen(false);
    setQuery("");
    triggerRef.current?.focus();
  }

  return (
    <>
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-foreground)]/60"
          aria-hidden="true"
        />
        <input
          ref={triggerRef}
          type="text"
          readOnly
          placeholder={translateText("Buscar")}
          aria-label={translateText("Abrir búsqueda")}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          onClick={() => setIsOpen(true)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              setIsOpen(true);
            }
          }}
          className="h-10 w-full cursor-pointer rounded-lg border border-[var(--color-foreground)]/10 bg-white/5 pl-10 pr-16 text-base text-[var(--color-foreground)] outline-none placeholder:text-[var(--color-foreground)]/65 focus-visible:ring-2 focus-visible:ring-[var(--color-buttons)]"
        />
        <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded border border-[var(--color-foreground)]/10 bg-white/5 px-1.5 py-0.5 text-[9px] font-medium text-[var(--color-foreground)]/70">
          {SEARCH_SHORTCUT}
        </kbd>
      </div>

      {isOpen ? (
        <div
          className="fixed inset-0 z-[60] flex items-start justify-center bg-black/30 p-4 pt-[12vh] md:pt-[16vh]"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeSearch();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="sidebar-search-title"
            className="w-full max-w-xl overflow-hidden rounded-xl border border-[var(--color-foreground)]/10 bg-[var(--color-foreground-secondary)] text-[var(--color-foreground)] shadow-2xl"
            onKeyDown={(event) => {
              if (event.key === "Escape") closeSearch();
            }}
          >
            <h2 id="sidebar-search-title" className="sr-only">
              {translateText("Buscar una sección\r\n            ")}</h2>
            <div className="flex items-center gap-3 border-b border-[var(--color-foreground)]/10 px-4">
              <Search className="h-5 w-5 shrink-0 text-[var(--color-foreground)]/60" aria-hidden="true" />
              <input
                ref={searchInputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={translateText("Buscar secciones...")}
                aria-label={translateText("Buscar secciones")}
                className="h-14 min-w-0 flex-1 bg-transparent text-base text-[var(--color-foreground)] outline-none placeholder:text-[var(--color-foreground)]/60"
              />
              <button
                type="button"
                onClick={closeSearch}
                className="rounded-md p-1.5 text-[var(--color-foreground)]/70 transition hover:bg-[var(--color-foreground)]/10 hover:text-[var(--color-foreground)]"
                aria-label={translateText("Cerrar búsqueda")}
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div className="max-h-[55vh] overflow-y-auto p-2">
              {results.length ? (
                results.map((item) => {
                  const Icon = getNavIcon(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => {
                        closeSearch();
                        onNavigate?.();
                      }}
                      className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm transition hover:bg-[var(--color-foreground)]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-buttons)]"
                    >
                      <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                      <span className="min-w-0 flex-1 truncate">{item.label}</span>
                      {item.section ? (
                        <span className="hidden truncate text-xs text-[var(--color-foreground)]/60 sm:block">
                          {item.section}
                        </span>
                      ) : null}
                    </Link>
                  );
                })
              ) : (
                <p className="px-3 py-6 text-center text-sm text-[var(--color-foreground)]/70">
                  {translateText("No se encontraron secciones.\r\n                ")}</p>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

export { SideBarSearch, getNavIcon, getSectionIcon };
