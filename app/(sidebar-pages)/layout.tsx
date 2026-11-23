"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { SideBar } from "../_components/sideBar";
import { CatalogPermissionsProvider } from "../_components/catalog-permissions-provider";
import { usePreferences } from "../_components/preferences-provider";
import { apiFetch } from "../_lib/api";
import {
    NAV_ITEMS,
    canAccessPath,
    filterNavItems,
    type CurrentPermission,
    type UsuarioActual,
} from "../_lib/permissions";

const SECTION_BACKGROUNDS: Record<string, string> = {
    General: "var(--color-background)",
    "Productos e inventario": "var(--page-background-inventory)",
    Producción: "var(--page-background-production)",
    Comercial: "var(--page-background-commercial)",
    "Catálogos / configuración": "var(--page-background-catalogs)",
    Administración: "var(--page-background-admin)",
};

export default function SidebarLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const [usuario, setUsuario] = useState<UsuarioActual | null>(null);
    const [permissions, setPermissions] = useState<CurrentPermission[]>([]);
    const [loading, setLoading] = useState(true);
    const [authenticated, setAuthenticated] = useState(false);
    const { t } = usePreferences();

    useEffect(() => {
        let active = true;

        async function loadSession() {
            try {
                const meResponse = await apiFetch("/me");

                if (meResponse.status === 401) {
                    if (active) setLoading(false);
                    router.replace("/");
                    return;
                }

                if (!meResponse.ok) {
                    throw new Error(`HTTP ${meResponse.status}`);
                }

                const meData = await meResponse.json();
                const currentUser = meData.data ?? meData;

                const permissionsResponse = await apiFetch("/pantalla-permiso-roles/current");
                const permissionsData = permissionsResponse.ok
                    ? await permissionsResponse.json()
                    : { data: [] };

                if (!active) return;

                setUsuario(currentUser);
                setPermissions(permissionsData.data ?? []);
                setAuthenticated(true);
            } catch (error) {
                console.error("Error validando sesión:", error);
                router.replace("/");
            } finally {
                if (active) setLoading(false);
            }
        }

        loadSession();

        function handleUnauthorized() {
            router.replace("/");
        }

        window.addEventListener("hamacas:unauthorized", handleUnauthorized);

        return () => {
            active = false;
            window.removeEventListener("hamacas:unauthorized", handleUnauthorized);
        };
    }, [router]);

    const navItems = useMemo(
        () => filterNavItems(usuario, permissions),
        [permissions, usuario]
    );
    const currentNavItem = NAV_ITEMS.find(
        (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
    );
    const pageBackground = pathname.startsWith("/proformas")
        ? "var(--page-background-proformas)"
        : SECTION_BACKGROUNDS[currentNavItem?.section ?? ""] ?? "var(--color-background)";
    const isMovementPage = pathname === "/entradas" || pathname === "/salidas";
    const isPreferencesPage = pathname === "/preferencias";

    const hasAccess = useMemo(() => {
        if (!authenticated) return false;
        if (isPreferencesPage) return true;
        if (usuario?.rol === "admin") return true;

        return canAccessPath(pathname, navItems);
    }, [authenticated, isPreferencesPage, navItems, pathname, usuario]);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[var(--color-background)] text-[var(--color-foreground-secondary)]">
                {t("Cargando sesión...")}
            </div>
        );
    }

    return (
        <div className="flex min-h-screen w-full min-w-0 gap-2 md:overflow-x-clip">
            <SideBar usuario={usuario} navItems={navItems} />
            <main
                style={{
                    "--page-background": pageBackground,
                    backgroundColor: "var(--page-background)",
                } as CSSProperties}
                className={`min-h-screen min-w-0 flex-1 overflow-x-clip pb-[16px] pt-[calc(2.75rem+1rem)] sm:pb-[24px] sm:pt-[calc(2.75rem+1.5rem)] ${
                    isMovementPage ? "px-0" : "px-[16px] sm:px-[24px]"
                }`}
            >
                {hasAccess ? (
                    <CatalogPermissionsProvider usuario={usuario} permissions={permissions}>
                        {children}
                    </CatalogPermissionsProvider>
                ) : (
                    <div className="flex min-h-screen flex-col items-center justify-center gap-2 px-4 text-center text-[var(--color-foreground-secondary)]">
                        <h1 className="text-3xl font-bold">{t("Acceso denegado")}</h1>
                        <p className="max-w-md text-sm">
                            {t("Tu rol no tiene permiso para ver esta pantalla.")}
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
}
