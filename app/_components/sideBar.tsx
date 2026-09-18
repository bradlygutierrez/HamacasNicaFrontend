"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Fragment } from "react";
import { useMemo, useState } from "react";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  BookOpen,
  Boxes,
  BriefcaseBusiness,
  ChevronDown,
  CircleUserRound,
  Hammer,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  Palette,
  Package,
  Ruler,
  Settings2,
  ShoppingCart,
  Tags,
  Users,
  type LucideIcon,
} from "lucide-react";
import { apiFetch } from "../_lib/api";
import type { NavItem, UsuarioActual } from "../_lib/permissions";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://127.0.0.1:8000";

const ICON_BOX = "flex h-10 w-10 shrink-0 items-center justify-center";
const NAV_ICON_SIZE = "h-5 w-5 stroke-[1.8]";
const SECTION_ICON_SIZE = "h-3.5 w-3.5 stroke-[1.8]";

const NAV_ICONS: Record<string, LucideIcon> = {
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

const SECTION_ICONS: Record<string, LucideIcon> = {
  General: LayoutDashboard,
  "Productos e inventario": Boxes,
  Producción: Hammer,
  Comercial: ShoppingCart,
  "Catálogos / configuración": Settings2,
  Administración: Users,
};

function imageUrl(path?: string | null) {
  if (!path) return "";

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  if (path.startsWith("/storage/")) {
    return `${BACKEND_URL}${path}`;
  }

  if (path.startsWith("storage/")) {
    return `${BACKEND_URL}/${path}`;
  }

  return `${BACKEND_URL}/storage/${path}`;
}

function getUserPhoto(usuario: UsuarioActual | null) {
  if (!usuario) return "";

  return imageUrl(
    usuario.foto ??
      usuario.foto_url ??
      usuario.avatar ??
      usuario.avatar_url ??
      usuario.imagen ??
      usuario.picture ??
      usuario.photo ??
      ""
  );
}

type Props = {
  usuario: UsuarioActual | null;
  navItems: NavItem[];
};

function SideBar({ usuario, navItems }: Props) {
  const [open, setOpen] = useState(false);
  const [photoError, setPhotoError] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  const router = useRouter();
  const pathname = usePathname();

  const userPhoto = useMemo(() => getUserPhoto(usuario), [usuario]);

  function toggleSection(section: string) {
    setCollapsedSections((current) => ({
      ...current,
      [section]: !current[section],
    }));
  }

  async function handleLogout() {
    try {
      await apiFetch("/logout", {
        method: "POST",
      });
    } catch (error) {
      console.error(error);
    } finally {
      router.push("/");
    }
  }

  return (
    <>
      {open ? (
        <button
          type="button"
          aria-label="Cerrar menú"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-30 cursor-pointer bg-black/30 md:hidden"
        />
      ) : null}

      <aside
        className={`z-40 flex flex-col overflow-hidden bg-[var(--color-foreground-secondary)] p-1 font-[var(--font-poppins)] transition-all duration-300 ${
          open
            ? "fixed inset-y-0 left-0 h-screen w-full md:sticky md:w-72 lg:w-80"
            : "fixed left-0 top-0 h-auto w-14 md:sticky md:h-screen md:w-16"
        }`}
      >
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="flex min-h-[44px] w-full cursor-pointer items-center gap-2 rounded-md px-1 transition hover:bg-white/10"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
        >
          <span className={ICON_BOX}>
            <Menu className={NAV_ICON_SIZE} aria-hidden="true" />
          </span>

          <span
            className={`whitespace-nowrap text-sm font-semibold text-[var(--color-foreground)] transition-all duration-200 ${
              open
                ? "translate-x-0 opacity-100"
                : "pointer-events-none -translate-x-2 opacity-0"
            }`}
          >
            Menú
          </span>
        </button>

        <div
          className={`${open ? "flex" : "hidden md:flex"} mt-3 min-h-[52px] w-full items-center gap-2 rounded-md bg-white/5 px-1`}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/10">
            {userPhoto && !photoError ? (
              <img
                src={userPhoto}
                alt={usuario?.nombre ?? "Usuario"}
                onError={() => setPhotoError(true)}
                className="h-full w-full object-cover"
              />
            ) : (
              <CircleUserRound className="h-6 w-6 stroke-[1.7]" aria-hidden="true" />
            )}
          </div>

          <div
            className={`min-w-0 transition-all duration-200 ${
              open
                ? "translate-x-0 opacity-100"
                : "pointer-events-none -translate-x-2 opacity-0"
            }`}
          >
            <p className="truncate text-xs font-semibold text-[var(--color-foreground)]">
              {usuario?.nombre ?? "Usuario"}
            </p>

            {usuario?.rol ? (
              <p className="truncate text-[11px] capitalize text-[var(--color-foreground)]/70">
                {usuario.rol}
              </p>
            ) : null}
          </div>
        </div>

        <nav
          className={`${open ? "flex" : "hidden md:flex"} mt-3 flex-1 flex-col gap-1.5 overflow-y-auto overflow-x-hidden pr-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden`}
        >
          {navItems.map((item, index) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            const previousItem = navItems[index - 1];
            const showSection = item.section && item.section !== previousItem?.section;
            const sectionCollapsed = item.section ? collapsedSections[item.section] === true : false;

            return (
              <Fragment key={item.href}>
                {showSection && open ? (
                  <button
                    type="button"
                    onClick={() => toggleSection(item.section ?? "")}
                    className="flex w-full items-center justify-between px-2 pt-3 pb-1 text-left text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--color-foreground)]/50 transition hover:text-[var(--color-foreground)]"
                    aria-expanded={!sectionCollapsed}
                  >
                    <span className="flex items-center gap-1.5">
                      {(() => {
                        const SectionIcon = SECTION_ICONS[item.section ?? ""] ?? Settings2;
                        return <SectionIcon className={SECTION_ICON_SIZE} aria-hidden="true" />;
                      })()}
                      <span>{item.section}</span>
                    </span>
                    <ChevronDown className={`h-3.5 w-3.5 stroke-[1.8] transition-transform ${sectionCollapsed ? "-rotate-90" : ""}`} />
                  </button>
                ) : null}
                {!sectionCollapsed ? (
                  <Link
                    href={item.href}
                    onClick={() => {
                      if (window.innerWidth < 768) setOpen(false);
                    }}
                    className={`flex min-h-[42px] w-full cursor-pointer items-center gap-2 rounded-md px-1 text-sm transition hover:bg-white/10 md:ml-2 md:border-l md:border-[var(--color-foreground)]/10 md:pl-3 ${
                      active ? "bg-white/10" : ""
                    }`}
                    aria-label={item.alt}
                  >
                    <span className={`${ICON_BOX} text-[var(--color-foreground)]`}>
                      {(() => {
                        const NavIcon = NAV_ICONS[item.href] ?? Package;
                        return <NavIcon className={NAV_ICON_SIZE} aria-hidden="true" />;
                      })()}
                    </span>

                    <span
                      className={`whitespace-nowrap text-sm font-medium text-[var(--color-foreground)] transition-all duration-200 ${
                        open
                          ? "translate-x-0 opacity-100"
                          : "pointer-events-none -translate-x-2 opacity-0"
                      }`}
                    >
                      {item.label}
                    </span>
                  </Link>
                ) : null}
              </Fragment>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={handleLogout}
          className={`${open ? "flex" : "hidden md:flex"} mt-2 min-h-[42px] w-full cursor-pointer items-center gap-2 rounded-md px-1 text-sm transition hover:bg-white/10`}
          aria-label="Cerrar sesión"
        >
          <span className={ICON_BOX}>
            <LogOut className={NAV_ICON_SIZE} aria-hidden="true" />
          </span>

          <span
            className={`whitespace-nowrap text-sm font-medium text-[var(--color-foreground)] transition-all duration-200 ${
              open
                ? "translate-x-0 opacity-100"
                : "pointer-events-none -translate-x-2 opacity-0"
            }`}
          >
            Cerrar sesión
          </span>
        </button>
      </aside>
    </>
  );
}

export { SideBar };
