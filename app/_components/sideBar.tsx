"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Fragment } from "react";
import { useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from "react";
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
import { toast } from "react-toastify";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://127.0.0.1:8000";

const ICON_BOX = "flex h-10 w-10 shrink-0 items-center justify-center";
const NAV_ICON_SIZE = "h-5 w-5 stroke-[1.8]";
const SECTION_ICON_SIZE = "h-3.5 w-3.5 stroke-[1.8]";
const SIDEBAR_MIN_WIDTH = 64;
const SIDEBAR_MAX_WIDTH = 320;
const SIDEBAR_WIDTH_STORAGE_KEY = "hamacas:sidebar-width";

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
  const [desktopWidth, setDesktopWidth] = useState(288);
  const [photoError, setPhotoError] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const resizeStart = useRef<{ x: number; width: number } | null>(null);

  const router = useRouter();
  const pathname = usePathname();

  const userPhoto = useMemo(() => getUserPhoto(usuario), [usuario]);

  useEffect(() => {
    const savedWidth = Number(window.localStorage.getItem(SIDEBAR_WIDTH_STORAGE_KEY));
    if (Number.isFinite(savedWidth) && savedWidth >= SIDEBAR_MIN_WIDTH && savedWidth <= SIDEBAR_MAX_WIDTH) {
      setDesktopWidth(savedWidth);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(SIDEBAR_WIDTH_STORAGE_KEY, String(desktopWidth));
  }, [desktopWidth]);

  function toggleSection(section: string) {
    setCollapsedSections((current) => ({
      ...current,
      [section]: !current[section],
    }));
  }

  function toggleOpen() {
    if (open) {
      setOpen(false);
      return;
    }
    setDesktopWidth(SIDEBAR_MAX_WIDTH);
    setOpen(true);
  }

  async function handleLogout() {
    try {
      const response = await apiFetch("/logout", {
        method: "POST",
      });
      if (response.ok) toast.success("Sesión cerrada correctamente.");
      else toast.error("No se pudo cerrar la sesión correctamente.");
    } catch (error) {
      console.error(error);
      toast.error("No se pudo conectar para cerrar la sesión.");
    } finally {
      router.push("/");
    }
  }

  function startResize(event: PointerEvent<HTMLDivElement>) {
    if (window.innerWidth < 768) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    resizeStart.current = { x: event.clientX, width: open ? desktopWidth : SIDEBAR_MIN_WIDTH };
    setOpen(true);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }

  function resize(event: PointerEvent<HTMLDivElement>) {
    if (!resizeStart.current) return;
    const nextWidth = Math.max(SIDEBAR_MIN_WIDTH, Math.min(SIDEBAR_MAX_WIDTH, resizeStart.current.width + event.clientX - resizeStart.current.x));
    setDesktopWidth(nextWidth);
    setOpen(nextWidth > SIDEBAR_MIN_WIDTH + 8);
  }

  function finishResize() {
    if (!resizeStart.current) return;
    resizeStart.current = null;
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  }

  function resizeWithKeyboard(event: KeyboardEvent<HTMLDivElement>) {
    const step = event.shiftKey ? 32 : 12;
    let nextWidth = desktopWidth;
    if (event.key === "ArrowLeft") nextWidth -= step;
    else if (event.key === "ArrowRight") nextWidth += step;
    else if (event.key === "Home") nextWidth = SIDEBAR_MIN_WIDTH;
    else if (event.key === "End") nextWidth = SIDEBAR_MAX_WIDTH;
    else return;
    event.preventDefault();
    nextWidth = Math.max(SIDEBAR_MIN_WIDTH, Math.min(SIDEBAR_MAX_WIDTH, nextWidth));
    setDesktopWidth(nextWidth);
    setOpen(nextWidth > SIDEBAR_MIN_WIDTH + 8);
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

      {!open ? (
        <button
          type="button"
          onClick={toggleOpen}
          aria-label="Abrir menú"
          aria-expanded={false}
          className="fixed left-3 top-3 z-50 flex h-10 w-10 items-center justify-center rounded-md bg-[var(--color-foreground-secondary)] text-[var(--color-foreground)] shadow-[0_4px_16px_rgba(8,38,77,0.22)] md:hidden"
        >
          <Menu className={NAV_ICON_SIZE} aria-hidden="true" />
        </button>
      ) : null}

      <aside
        style={{ "--sidebar-width": `${desktopWidth}px` } as CSSProperties}
        className={`relative z-40 flex flex-none flex-col overflow-hidden rounded-r-xl bg-[var(--color-foreground-secondary)] font-[var(--font-poppins)] shadow-[8px_0_24px_rgba(8,38,77,0.12)] transition-[width,background-color,border-radius] duration-200 md:my-2 md:top-2 md:h-[calc(100vh-1rem)] md:rounded-xl md:border md:border-white/10 md:bg-[var(--color-foreground-secondary)]/95 md:backdrop-blur-xl md:overflow-visible ${
          open
            ? "fixed inset-y-0 left-0 h-screen w-screen p-2 md:sticky md:bottom-auto md:top-2 md:left-auto md:h-[calc(100vh-1rem)] md:w-[var(--sidebar-width)] md:p-2"
            : "hidden fixed left-0 top-0 h-auto w-11 p-0.5 md:sticky md:flex md:h-[calc(100vh-1rem)] md:w-16 md:p-1"
        }`}
      >
        <button
          type="button"
          onClick={toggleOpen}
          className="mb-1 flex min-h-9 w-full cursor-pointer items-center gap-2 rounded-md px-0 transition hover:bg-white/10 md:mb-0 md:min-h-[44px] md:px-1"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={open}
        >
          <span className={`${ICON_BOX} h-8 w-8 md:h-10 md:w-10`}>
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
                    className={`flex min-h-[42px] w-full cursor-pointer items-center gap-2 rounded-lg px-1 text-sm transition-colors duration-200 hover:bg-white/10 md:ml-1 md:border-l-2 md:border-transparent md:pl-2 ${
                      active ? "border-l-[#e3b72e] bg-white/10 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]" : ""
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
        <div
          role="separator"
          aria-label="Ajustar ancho del menú"
          aria-orientation="vertical"
          aria-valuemin={SIDEBAR_MIN_WIDTH}
          aria-valuemax={SIDEBAR_MAX_WIDTH}
          aria-valuenow={open ? desktopWidth : SIDEBAR_MIN_WIDTH}
          aria-valuetext={`${open ? desktopWidth : SIDEBAR_MIN_WIDTH} píxeles`}
          tabIndex={0}
          onPointerDown={startResize}
          onPointerMove={resize}
          onPointerUp={finishResize}
          onPointerCancel={finishResize}
          onKeyDown={resizeWithKeyboard}
          className="group absolute right-[-5px] top-0 z-50 hidden h-full w-3 cursor-col-resize touch-none items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-[#e3b72e] focus-visible:ring-offset-2 md:flex"
        >
          <span className="h-12 w-[3px] rounded-full bg-white/15 transition-colors group-hover:bg-[#e3b72e] group-focus-visible:bg-[#e3b72e]" />
        </div>
      </aside>
    </>
  );
}

export { SideBar };
