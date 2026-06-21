"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../_lib/api";

type UsuarioActual = {
  id: number;
  nombre: string;
  rol?: string;
  foto?: string | null;
  foto_url?: string | null;
  avatar?: string | null;
  avatar_url?: string | null;
  imagen?: string | null;
  picture?: string | null;
  photo?: string | null;
};

type NavItem = {
  label: string;
  href: string;
  icon: string;
  alt: string;
  customCatalogIcon?: boolean;
};

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://127.0.0.1:8000";

const ICON_BOX = "flex h-10 w-10 shrink-0 items-center justify-center";
const ICON_SIZE = "h-[28px] w-[28px] max-h-[28px] max-w-[28px] object-contain";

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: "/dashboard.svg",
    alt: "Dashboard",
  },
  {
    label: "Usuarios",
    href: "/usuarios",
    icon: "/users.svg",
    alt: "Usuarios",
  },
  {
    label: "Inventario",
    href: "/inventario-hamacas",
    icon: "/products.svg",
    alt: "Inventario",
  },
  {
    label: "Catálogo Hamacas",
    href: "/catalogo-hamacas",
    icon: "",
    alt: "Catálogo Hamacas",
    customCatalogIcon: true,
  },
  {
    label: "Entradas",
    href: "/entradas",
    icon: "/rightArrow.svg",
    alt: "Entradas",
  },
  {
    label: "Salidas",
    href: "/salidas",
    icon: "/leftArrow.svg",
    alt: "Salidas",
  },
  {
    label: "Ubicación",
    href: "/ubicacion",
    icon: "/location.svg",
    alt: "Ubicación",
  },
  {
    label: "Colores",
    href: "/colores",
    icon: "/colors.svg",
    alt: "Colores",
  },
  {
    label: "Tamaño",
    href: "/tamano",
    icon: "/size.svg",
    alt: "Tamaño",
  },
  {
    label: "Categoría",
    href: "/categoria",
    icon: "/category.svg",
    alt: "Categoría",
  },
  {
    label: "Ventas",
    href: "/ventas",
    icon: "/sales.svg",
    alt: "Ventas",
  },
];

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

function CatalogIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-[28px] w-[28px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.55"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="4.5" y="5" width="15" height="14" rx="2" />
      <path d="M8 9h8" />
      <path d="M8 13h5" />
      <path d="M15.5 16.5l1.3-1.3 2.2 2.2" />
    </svg>
  );
}

function SideBar() {
  const [open, setOpen] = useState(false);
  const [usuario, setUsuario] = useState<UsuarioActual | null>(null);
  const [photoError, setPhotoError] = useState(false);

  const router = useRouter();
  const pathname = usePathname();

  const userPhoto = useMemo(() => getUserPhoto(usuario), [usuario]);

  useEffect(() => {
    async function loadUser() {
      try {
        const response = await apiFetch("/me");

        if (!response.ok) return;

        const data = await response.json();
        setUsuario(data.data ?? data);
      } catch (error) {
        console.error("Error cargando usuario:", error);
      }
    }

    loadUser();
  }, []);

  async function handleLogout() {
    try {
      await apiFetch("/logout", {
        method: "POST",
      });
    } catch (error) {
      console.error(error);
    } finally {
      localStorage.removeItem("token");
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
        className={`sticky left-0 top-0 z-40 flex h-screen flex-col overflow-hidden bg-[var(--color-foreground-secondary)] p-1 transition-all duration-300 ${
          open ? "fixed w-72 md:sticky md:w-72 lg:w-80" : "w-14 md:w-16"
        }`}
      >
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="flex min-h-[44px] w-full cursor-pointer items-center gap-2 rounded-md px-1 transition hover:bg-white/10"
          aria-label="Abrir menú"
        >
          <span className={ICON_BOX}>
            <img src="/hamburger.svg" alt="Menu" className={ICON_SIZE} />
          </span>

          <span
            className={`whitespace-nowrap text-base font-semibold text-[var(--color-foreground)] transition-all duration-200 ${
              open
                ? "translate-x-0 opacity-100"
                : "pointer-events-none -translate-x-2 opacity-0"
            }`}
          >
            Menú
          </span>
        </button>

        <div className="mt-3 flex min-h-[52px] w-full items-center gap-2 rounded-md bg-white/5 px-1">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/10">
            {userPhoto && !photoError ? (
              <img
                src={userPhoto}
                alt={usuario?.nombre ?? "Usuario"}
                onError={() => setPhotoError(true)}
                className="h-full w-full object-cover"
              />
            ) : (
              <img src="/users.svg" alt="Usuario" className={ICON_SIZE} />
            )}
          </div>

          <div
            className={`min-w-0 transition-all duration-200 ${
              open
                ? "translate-x-0 opacity-100"
                : "pointer-events-none -translate-x-2 opacity-0"
            }`}
          >
            <p className="truncate text-sm font-semibold text-[var(--color-foreground)]">
              {usuario?.nombre ?? "Usuario"}
            </p>

            {usuario?.rol ? (
              <p className="truncate text-xs capitalize text-[var(--color-foreground)]/70">
                {usuario.rol}
              </p>
            ) : null}
          </div>
        </div>

        <nav className="mt-3 flex flex-1 flex-col gap-1.5 overflow-y-auto overflow-x-hidden pr-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {navItems.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => {
                  if (window.innerWidth < 768) setOpen(false);
                }}
                className={`flex min-h-[44px] w-full cursor-pointer items-center gap-2 rounded-md px-1 transition hover:bg-white/10 ${
                  active ? "bg-white/10" : ""
                }`}
                aria-label={item.alt}
              >
                <span className={`${ICON_BOX} text-[var(--color-foreground)]`}>
                  {item.customCatalogIcon ? (
                    <CatalogIcon />
                  ) : (
                    <img src={item.icon} alt={item.alt} className={ICON_SIZE} />
                  )}
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
            );
          })}
        </nav>

        <button
          type="button"
          onClick={handleLogout}
          className="mt-2 flex min-h-[44px] w-full cursor-pointer items-center gap-2 rounded-md px-1 transition hover:bg-white/10"
          aria-label="Cerrar sesión"
        >
          <span className={ICON_BOX}>
            <img src="/exit.svg" alt="Cerrar sesión" className={ICON_SIZE} />
          </span>

          <span
            className={`whitespace-nowrap text-base font-medium text-[var(--color-foreground)] transition-all duration-200 ${
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