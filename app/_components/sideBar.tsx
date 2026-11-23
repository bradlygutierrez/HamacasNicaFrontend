"use client";
import { translateText } from "@/app/_lib/localization";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Fragment } from "react";
import { useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from "react";

import {
  NavArrowDown as ChevronDown,
  UserCircle as CircleUserRound,
  LogOut,
} from "iconoir-react";
import { Settings } from "lucide-react";

import { apiFetch, BACKEND_BASE_URL } from "@/app/_lib/api";
import { usePreferences } from "./preferences-provider";
import type { NavItem, UsuarioActual } from "../_lib/permissions";
import { AppHeader } from "./app-header";
import { getNavIcon, getSectionIcon, SideBarSearch } from "./sideBarSearch";
import { toast } from "react-toastify";


const ICON_BOX = "flex h-10 w-10 shrink-0 items-center justify-center";
const NAV_ICON_SIZE = "h-5 w-5 stroke-[1.4]";
const SECTION_ICON_SIZE = "h-4 w-4 stroke-[1.3]";
const SIDEBAR_MIN_WIDTH = 64;
const SIDEBAR_MAX_WIDTH = 320;
const SIDEBAR_WIDTH_STORAGE_KEY = "hamacas:sidebar-width";

function imageUrl(path?: string | null) {
  if (!path) return "";

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  if (path.startsWith("/storage/")) {
    return `${BACKEND_BASE_URL}${path}`;
  }

  if (path.startsWith("storage/")) {
    return `${BACKEND_BASE_URL}/${path}`;
  }

  return `${BACKEND_BASE_URL}/storage/${path}`;
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
  const { t } = usePreferences();

  const userPhoto = useMemo(() => getUserPhoto(usuario), [usuario]);
  const localizedNavItems = useMemo(
    () =>
      navItems.map((item) => ({
        ...item,
        label: t(item.label),
        alt: t(item.alt),
        section: item.section ? t(item.section) : undefined,
      })),
    [navItems, t]
  );

  useEffect(() => {
    const savedWidth = Number(window.localStorage.getItem(SIDEBAR_WIDTH_STORAGE_KEY));
    const hasSavedWidth =
      Number.isFinite(savedWidth) &&
      savedWidth >= SIDEBAR_MIN_WIDTH &&
      savedWidth <= SIDEBAR_MAX_WIDTH;

    if (hasSavedWidth) {
      setDesktopWidth(savedWidth);
    }

    if (window.innerWidth >= 768) {
      setOpen(!hasSavedWidth || savedWidth > SIDEBAR_MIN_WIDTH + 8);
    }
  }, []);

  useEffect(() => {
    const mobileQuery = window.matchMedia("(max-width: 767px)");
    let previousOverflow: string | null = null;

    function syncBodyScroll() {
      if (open && mobileQuery.matches && previousOverflow === null) {
        previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
      } else if ((!open || !mobileQuery.matches) && previousOverflow !== null) {
        document.body.style.overflow = previousOverflow;
        previousOverflow = null;
      }
    }

    syncBodyScroll();
    mobileQuery.addEventListener("change", syncBodyScroll);

    return () => {
      mobileQuery.removeEventListener("change", syncBodyScroll);
      if (previousOverflow !== null) {
        document.body.style.overflow = previousOverflow;
      }
    };
  }, [open]);

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
      let logoutCompleted = response.ok || response.status === 401;

      if (!logoutCompleted) {
        const sessionResponse = await apiFetch("/me");
        logoutCompleted = sessionResponse.status === 401;
      }

      if (logoutCompleted) toast.success("Sesión cerrada correctamente.");
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
      <AppHeader
        open={open}
        sidebarWidth={open ? desktopWidth : SIDEBAR_MIN_WIDTH}
        onToggle={toggleOpen}
      />

      {open ? (
        <button
          type="button"
          aria-label={translateText("Cerrar menú")}
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-30 cursor-pointer bg-black/30 md:hidden"
        />
      ) : null}

      <aside
        style={{ "--sidebar-width": `${desktopWidth}px` } as CSSProperties}
        className={`z-40 flex flex-none flex-col overflow-hidden rounded-none bg-[var(--color-foreground-secondary)] font-[var(--font-poppins)] shadow-[8px_0_24px_rgba(8,38,77,0.12)] transition-[width,background-color,border-radius] duration-200 md:my-0 md:top-0 md:h-screen md:rounded-tr-3xl md:border md:border-white/10 md:bg-[var(--color-foreground-secondary)]/95 md:backdrop-blur-xl md:overflow-visible ${
          open
            ? "fixed inset-y-0 left-0 h-screen w-screen p-2 pt-12 md:sticky md:bottom-auto md:left-auto md:w-[var(--sidebar-width)] md:p-2"
            : "hidden fixed left-0 top-0 h-auto w-11 p-0.5 md:sticky md:flex md:w-16 md:p-1"
        }`}
      >
        {open ? (
          <div className="mt-3 w-full md:ml-1 md:border-l-2 md:border-transparent md:pl-2">
            <SideBarSearch
              navItems={localizedNavItems}
              onNavigate={() => {
                if (window.innerWidth < 768) setOpen(false);
              }}
            />
          </div>
        ) : null}

        <nav
          className={`${open ? "flex" : "hidden md:flex"} mt-3 flex-1 flex-col gap-1 overflow-y-auto overflow-x-hidden overscroll-contain pr-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden`}
        >
          {localizedNavItems.map((item, index) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            const previousItem = navItems[index - 1];
            const showSection = item.section && item.section !== previousItem?.section;
            const lastInSection = Boolean(
              item.section && item.section !== navItems[index + 1]?.section
            );
            const sectionCollapsed = item.section ? collapsedSections[item.section] === true : false;

            return (
              <Fragment key={item.href}>
                {showSection && open ? (
                  <button
                    type="button"
                    onClick={() => toggleSection(item.section ?? "")}
                    className="flex w-full items-center justify-between px-1 pt-3 pb-1 text-left text-sm font-medium text-[var(--color-foreground)]/65 transition hover:text-[var(--color-foreground)] md:ml-1 md:border-l-2 md:border-transparent md:pl-2"
                    aria-expanded={!sectionCollapsed}
                  >
                    <span className="flex items-center gap-1.5">
                      <span className="flex h-5 w-10 shrink-0 items-center justify-center">
                        {(() => {
                          const SectionIcon = getSectionIcon(item.section ?? "");
                          return <SectionIcon className={SECTION_ICON_SIZE} aria-hidden="true" />;
                        })()}
                      </span>
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
                    className={`flex min-h-[42px] w-full cursor-pointer items-center gap-2 rounded-lg px-1 text-base transition-colors duration-200 hover:bg-white/10 md:ml-1 md:border-l-2 md:border-transparent md:pl-2 ${
                      active ? "border-l-[#e3b72e] bg-white/10 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]" : ""
                    } ${lastInSection ? "mb-3" : ""}`}
                    aria-label={item.alt}
                    title={!open && item.section ? item.section : item.label}
                  >
                    <span className={`${ICON_BOX} text-[var(--color-foreground)]`}>
                      {(() => {
                        const NavIcon = getNavIcon(item.href);
                        return <NavIcon className={NAV_ICON_SIZE} aria-hidden="true" />;
                      })()}
                    </span>

                    <span
                      className={`whitespace-nowrap text-base font-medium text-[var(--color-foreground)] transition-all duration-200 ${
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

        <div className={`${open ? "flex" : "hidden md:flex"} mt-auto w-full flex-col gap-1 border-t border-white/10 pt-2`}>
          <Link
            href="/preferencias"
            onClick={() => {
              if (window.innerWidth < 768) setOpen(false);
            }}
            className={`flex min-h-[46px] w-full items-center gap-2 rounded-md px-1 text-[var(--color-foreground)] transition hover:bg-white/10 md:ml-1 md:pl-2 ${
              pathname === "/preferencias" ? "bg-white/10" : ""
            }`}
            aria-label={t("Usuario y preferencias")}
            title={t("Usuario y preferencias")}
          >
            <span className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/10">
              {userPhoto && !photoError ? (
                <img
                  src={userPhoto}
                  alt={usuario?.nombre ?? t("Usuario")}
                  onError={() => setPhotoError(true)}
                  className="h-full w-full object-cover"
                />
              ) : (
                <CircleUserRound className="h-6 w-6 stroke-[1.7]" aria-hidden="true" />
              )}
            </span>
            <span
              className={`min-w-0 flex-1 whitespace-nowrap text-left text-sm font-medium transition-all duration-200 ${
                open ? "translate-x-0 opacity-100" : "pointer-events-none -translate-x-2 opacity-0"
              }`}
            >
              <span className="block truncate">{usuario?.nombre ?? t("Usuario")}</span>
              <span className="block truncate text-xs text-[var(--color-foreground)]/70">
                {t("Usuario y preferencias")}
              </span>
            </span>
            {open ? <Settings className="mr-2 h-4 w-4 shrink-0" aria-hidden="true" /> : null}
          </Link>

        <button
          type="button"
          onClick={handleLogout}
          className={`${open ? "flex" : "hidden md:flex"} mt-2 min-h-[42px] w-full cursor-pointer items-center gap-2 rounded-md px-1 text-base transition hover:bg-white/10 md:ml-1 md:border-l-2 md:border-transparent md:pl-2`}
          aria-label={t("Cerrar sesión")}
        >
          <span className={ICON_BOX}>
            <LogOut className={NAV_ICON_SIZE} aria-hidden="true" />
          </span>

          <span
            className={`whitespace-nowrap text-base font-medium text-[var(--color-foreground)] transition-all duration-200 ${
              open
                ? "translate-x-0 opacity-100"
                : "pointer-events-none -translate-x-2 opacity-0"
            }`}
          >
            {t("Cerrar sesión")}
          </span>
        </button>
        </div>
        <div
          role="separator"
          aria-label={translateText("Ajustar ancho del menú")}
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
