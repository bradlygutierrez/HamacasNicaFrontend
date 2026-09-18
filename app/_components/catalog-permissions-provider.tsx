"use client";

import {
  createContext,
  useContext,
  type ReactNode,
} from "react";
import {
  getCatalogCapabilities,
  type CatalogCapabilities,
  type CurrentPermission,
  type UsuarioActual,
} from "../_lib/permissions";

type CatalogPermissionsContextValue = {
  usuario: UsuarioActual | null;
  permissions: CurrentPermission[];
};

const CatalogPermissionsContext = createContext<CatalogPermissionsContextValue>({
  usuario: null,
  permissions: [],
});

type Props = CatalogPermissionsContextValue & {
  children: ReactNode;
};

export function CatalogPermissionsProvider({ usuario, permissions, children }: Props) {
  return (
    <CatalogPermissionsContext.Provider value={{ usuario, permissions }}>
      {children}
    </CatalogPermissionsContext.Provider>
  );
}

export function useCatalogCapabilities(pathname: string): CatalogCapabilities {
  const { usuario, permissions } = useContext(CatalogPermissionsContext);

  return getCatalogCapabilities(pathname, usuario, permissions);
}
