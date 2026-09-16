"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { SideBar } from "../_components/sideBar";
import { apiFetch } from "../_lib/api";
import {
    canAccessPath,
    filterNavItems,
    type CurrentPermission,
    type UsuarioActual,
} from "../_lib/permissions";

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

    const hasAccess = useMemo(() => {
        if (!authenticated) return false;
        if (usuario?.rol === "admin") return true;

        return canAccessPath(pathname, navItems);
    }, [authenticated, navItems, pathname, usuario]);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[var(--color-background)] text-[var(--color-foreground-secondary)]">
                Cargando sesión...
            </div>
        );
    }

    return (
        <div className="flex gap-2 min-h-screen">
            <SideBar usuario={usuario} navItems={navItems} />
            <main className="flex-1">
                {hasAccess ? (
                    children
                ) : (
                    <div className="flex min-h-screen flex-col items-center justify-center gap-2 px-4 text-center text-[var(--color-foreground-secondary)]">
                        <h1 className="text-3xl font-bold">Acceso denegado</h1>
                        <p className="max-w-md text-sm">
                            Tu rol no tiene permiso para ver esta pantalla.
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
}
