export type UsuarioActual = {
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

export type NavItem = {
  label: string;
  href: string;
  icon: string;
  alt: string;
  customCatalogIcon?: boolean;
  permissionRoutes: string[];
};

export type CurrentPermission = {
  pantalla?: {
    slug?: string | null;
    ruta?: string | null;
  } | null;
  permiso?: {
    slug?: string | null;
  } | null;
};

export const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: "/dashboard.svg",
    alt: "Dashboard",
    permissionRoutes: ["/dashboard"],
  },
  {
    label: "Usuarios",
    href: "/usuarios",
    icon: "/users.svg",
    alt: "Usuarios",
    permissionRoutes: ["/usuarios"],
  },
  {
    label: "Inventario",
    href: "/inventario-hamacas",
    icon: "/products.svg",
    alt: "Inventario",
    permissionRoutes: ["/inventario", "/inventario-hamacas"],
  },
  {
    label: "Catálogo Hamacas",
    href: "/catalogo-hamacas",
    icon: "",
    alt: "Catálogo Hamacas",
    customCatalogIcon: true,
    permissionRoutes: ["/inventario", "/catalogo-hamacas"],
  },
  {
    label: "Entradas",
    href: "/entradas",
    icon: "/rightArrow.svg",
    alt: "Entradas",
    permissionRoutes: ["/inventario", "/entradas"],
  },
  {
    label: "Salidas",
    href: "/salidas",
    icon: "/leftArrow.svg",
    alt: "Salidas",
    permissionRoutes: ["/inventario", "/salidas"],
  },
  {
    label: "Ubicación",
    href: "/ubicacion",
    icon: "/location.svg",
    alt: "Ubicación",
    permissionRoutes: ["/inventario", "/ubicacion"],
  },
  {
    label: "Colores",
    href: "/colores",
    icon: "/colors.svg",
    alt: "Colores",
    permissionRoutes: ["/inventario", "/colores"],
  },
  {
    label: "Tamaño",
    href: "/tamano",
    icon: "/size.svg",
    alt: "Tamaño",
    permissionRoutes: ["/inventario", "/tamano"],
  },
  {
    label: "Categoría",
    href: "/categoria",
    icon: "/category.svg",
    alt: "Categoría",
    permissionRoutes: ["/inventario", "/categoria"],
  },
  {
    label: "Ventas",
    href: "/ventas",
    icon: "/sales.svg",
    alt: "Ventas",
    permissionRoutes: ["/ventas"],
  },
];

export function filterNavItems(
  usuario: UsuarioActual | null,
  permissions: CurrentPermission[]
): NavItem[] {
  if (usuario?.rol === "admin" && permissions.length === 0) {
    return NAV_ITEMS;
  }

  const viewRoutes = new Set(
    permissions
      .filter((item) => item.permiso?.slug === "ver")
      .map((item) => item.pantalla?.ruta)
      .filter((route): route is string => Boolean(route))
  );

  if (usuario?.rol === "admin") {
    return NAV_ITEMS;
  }

  return NAV_ITEMS.filter((item) =>
    item.permissionRoutes.some((route) => viewRoutes.has(route))
  );
}

export function canAccessPath(pathname: string, navItems: NavItem[]): boolean {
  return navItems.some((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));
}
