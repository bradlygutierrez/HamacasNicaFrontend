"use client";

import { apiFetch } from "@/app/_lib/api";
import { fetchAllCatalogItems, getApiValidationMessage } from "@/app/_lib/catalogos";
import { translateText } from "@/app/_lib/localization";
import { toast } from "react-toastify";
import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";

export interface RoleOption {
    id: number;
    nombre: string;
    slug: string;
    es_sistema: boolean;
}

interface Screen {
    id: number;
    nombre: string;
    ruta: string | null;
    state?: boolean;
}

interface Permission {
    id: number;
    nombre: string;
    slug: string;
}

interface RoleScreenPermission {
    id: number;
    pantalla_id: number;
    permiso_id: number;
}

interface RolePermissionsPanelProps {
    onRolesChange: (roles: RoleOption[]) => void;
}

export default function RolePermissionsPanel({ onRolesChange }: RolePermissionsPanelProps) {
    const [roles, setRoles] = useState<RoleOption[]>([]);
    const [screens, setScreens] = useState<Screen[]>([]);
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [accesses, setAccesses] = useState<RoleScreenPermission[]>([]);
    const [selectedRole, setSelectedRole] = useState("");
    const [newRoleName, setNewRoleName] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
    const [pendingAccess, setPendingAccess] = useState<string | null>(null);
    const [accessRefresh, setAccessRefresh] = useState(0);

    useEffect(() => {
        let isActive = true;

        void (async () => {
            try {
                const loadedRoles = await fetchAllCatalogItems<RoleOption>("/roles", apiFetch);
                if (!isActive) return;
                setRoles(loadedRoles);
                onRolesChange(loadedRoles);

                const meResponse = await apiFetch("/me");
                if (!meResponse.ok) {
                    throw new Error(`HTTP ${meResponse.status}`);
                }
                const meData = await meResponse.json();
                const currentUser = meData.data ?? meData;
                const canManageRoles = currentUser.rol === "admin";
                setIsAdmin(canManageRoles);
                if (!canManageRoles || !isActive) return;

                const [loadedScreens, loadedPermissions] = await Promise.all([
                    fetchAllCatalogItems<Screen>("/pantallas", apiFetch),
                    fetchAllCatalogItems<Permission>("/permisos", apiFetch),
                ]);
                if (!isActive) return;
                setScreens(loadedScreens.filter((screen) => screen.state !== false));
                setPermissions(loadedPermissions);
                setSelectedRole((current) => current || loadedRoles[0]?.slug || "");
            } catch (error) {
                if (isActive) {
                    console.error(error);
                    toast.error(translateText("No se pudieron cargar los roles y permisos."));
                }
            } finally {
                if (isActive) setIsLoading(false);
            }
        })();

        return () => {
            isActive = false;
        };
    }, [onRolesChange]);

    useEffect(() => {
        let isActive = true;
        if (isAdmin !== true || !selectedRole) {
            setAccesses([]);
            return () => {
                isActive = false;
            };
        }

        setAccesses([]);
        void fetchAllCatalogItems<RoleScreenPermission>(
            `/pantalla-permiso-roles?rol=${encodeURIComponent(selectedRole)}`,
            apiFetch
        )
            .then((roleAccesses) => {
                if (isActive) setAccesses(roleAccesses);
            })
            .catch((error: unknown) => {
                if (!isActive) return;
                console.error(error);
                toast.error(translateText("No se pudieron cargar los permisos del rol."));
            });

        return () => {
            isActive = false;
        };
    }, [accessRefresh, isAdmin, selectedRole]);

    const accessByKey = useMemo(
        () => new Map(accesses.map((access) => [`${access.pantalla_id}:${access.permiso_id}`, access])),
        [accesses]
    );

    const handleCreateRole = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const name = newRoleName.trim();
        if (!name) return;

        try {
            const response = await apiFetch("/roles", {
                method: "POST",
                body: JSON.stringify({ nombre: name }),
            });
            const data = await response.json().catch(() => null);

            if (!response.ok) {
                throw new Error(getApiValidationMessage(data, translateText("No se pudo crear el rol.")));
            }

            const createdRole = (data as { data?: RoleOption } | null)?.data;
            if (!createdRole) {
                throw new Error(translateText("La respuesta de la API no contiene el rol creado."));
            }

            const updatedRoles = [...roles, createdRole].sort((a, b) => a.nombre.localeCompare(b.nombre));
            setRoles(updatedRoles);
            onRolesChange(updatedRoles);
            setSelectedRole(createdRole.slug);
            setNewRoleName("");
            toast.success(translateText("Rol creado correctamente."));
        } catch (error) {
            toast.error(error instanceof Error ? error.message : translateText("No se pudo crear el rol."));
        }
    };

    const handleAccessChange = async (screen: Screen, permission: Permission, checked: boolean) => {
        if (!selectedRole) return;

        const key = `${screen.id}:${permission.id}`;
        const existing = accessByKey.get(key);
        setPendingAccess(key);

        try {
            const response = checked
                ? await apiFetch("/pantalla-permiso-roles", {
                    method: "POST",
                    body: JSON.stringify({
                        pantalla_id: screen.id,
                        permiso_id: permission.id,
                        rol: selectedRole,
                    }),
                })
                : existing
                    ? await apiFetch(`/pantalla-permiso-roles/${existing.id}`, { method: "DELETE" })
                    : null;

            if (response && !response.ok) {
                const data = await response.json().catch(() => null);
                throw new Error(getApiValidationMessage(data, translateText("No se pudo actualizar el permiso.")));
            }

            setAccessRefresh((current) => current + 1);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : translateText("No se pudo actualizar el permiso."));
        } finally {
            setPendingAccess(null);
        }
    };

    if (!isLoading && isAdmin === false) return null;

    return (
        <section className="flex flex-col gap-5 rounded-xl bg-[var(--color-foreground-secondary)] p-5 shadow-lg md:p-6">
            <header>
                <h2 className="text-2xl font-bold text-[var(--color-foreground)]">{translateText("Roles y permisos por pantalla")}</h2>
                <p className="mt-1 text-sm text-[var(--color-foreground)]/70">
                    {translateText("Crea roles y define qué acciones puede realizar cada uno en las pantallas.")}
                </p>
            </header>

            <form onSubmit={handleCreateRole} className="flex flex-col gap-3 sm:flex-row">
                <input
                    aria-label={translateText("Nombre del nuevo rol")}
                    className="min-w-0 flex-1 rounded-md border border-gray-300 p-3 text-gray-900"
                    maxLength={100}
                    onChange={(event) => setNewRoleName(event.target.value)}
                    placeholder={translateText("Nombre del nuevo rol")}
                    value={newRoleName}
                />
                <button
                    className="rounded-md bg-[var(--color-buttons)] px-5 py-3 font-semibold text-[var(--color-foreground-secondary)] disabled:opacity-50"
                    disabled={!newRoleName.trim()}
                    type="submit"
                >
                    {translateText("Crear rol")}
                </button>
            </form>

            {isLoading ? (
                <p role="status">{translateText("Cargando roles y permisos...")}</p>
            ) : roles.length === 0 ? (
                <p>{translateText("No hay roles disponibles.")}</p>
            ) : (
                <>
                    <label className="flex max-w-md flex-col gap-2 font-medium">
                        {translateText("Rol a configurar")}
                        <select
                            className="rounded-md border border-gray-300 p-3 text-gray-900"
                            onChange={(event) => setSelectedRole(event.target.value)}
                            value={selectedRole}
                        >
                            {roles.map((role) => (
                                <option key={role.slug} value={role.slug}>
                                    {role.nombre}{role.es_sistema ? ` (${translateText("predeterminado")})` : ""}
                                </option>
                            ))}
                        </select>
                    </label>

                    {selectedRole === "admin" && (
                        <p className="text-sm text-[var(--color-foreground)]/70">
                            {translateText("El rol admin conserva acceso total y no se restringe desde esta matriz.")}
                        </p>
                    )}

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[640px] border-collapse text-left">
                            <thead>
                                <tr className="border-b border-gray-300">
                                    <th className="p-3">{translateText("Pantalla")}</th>
                                    {permissions.map((permission) => (
                                        <th className="p-3 text-center" key={permission.id}>{permission.nombre}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {screens.map((screen) => (
                                    <tr className="border-b border-gray-200" key={screen.id}>
                                        <th className="p-3 font-medium">{screen.nombre}</th>
                                        {permissions.map((permission) => {
                                            const key = `${screen.id}:${permission.id}`;
                                            return (
                                                <td className="p-3 text-center" key={permission.id}>
                                                    <input
                                                        aria-label={translateText(`${permission.nombre} - ${screen.nombre}`)}
                                                        checked={accessByKey.has(key)}
                                                        disabled={!selectedRole || selectedRole === "admin" || pendingAccess !== null}
                                                        onChange={(event) => {
                                                            void handleAccessChange(screen, permission, event.target.checked);
                                                        }}
                                                        type="checkbox"
                                                    />
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </section>
    );
}
