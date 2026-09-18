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
  section?: string;
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
    section: "General",
    permissionRoutes: ["/dashboard"],
  },
  {
    label: "Inventario",
    href: "/inventario-hamacas",
    icon: "/products.svg",
    alt: "Inventario",
    section: "Productos e inventario",
    permissionRoutes: ["/inventario", "/inventario-hamacas"],
  },
  {
    label: "Catálogo Hamacas",
    href: "/catalogo-hamacas",
    icon: "",
    alt: "Catálogo Hamacas",
    customCatalogIcon: true,
    section: "Productos e inventario",
    permissionRoutes: ["/inventario", "/catalogo-hamacas"],
  },
  {
    label: "Entradas",
    href: "/entradas",
    icon: "/rightArrow.svg",
    alt: "Entradas",
    section: "Productos e inventario",
    permissionRoutes: ["/inventario", "/entradas"],
  },
  {
    label: "Salidas",
    href: "/salidas",
    icon: "/leftArrow.svg",
    alt: "Salidas",
    section: "Productos e inventario",
    permissionRoutes: ["/inventario", "/salidas"],
  },
  {
    label: "Materiales",
    href: "/materiales",
    icon: "/products.svg",
    alt: "Materiales",
    section: "Producción",
    permissionRoutes: ["/materiales"],
  },
  {
    label: "Procesos de producción",
    href: "/procesos-produccion",
    icon: "/category.svg",
    alt: "Procesos de producción",
    section: "Producción",
    permissionRoutes: ["/procesos-produccion"],
  },
  {
    label: "Ventas",
    href: "/ventas",
    icon: "/sales.svg",
    alt: "Ventas",
    section: "Comercial",
    permissionRoutes: ["/ventas"],
  },
  {
    label: "Servicios adicionales",
    href: "/servicios-adicionales",
    icon: "/sales.svg",
    alt: "Servicios adicionales",
    section: "Comercial",
    permissionRoutes: ["/servicios-adicionales"],
  },
  {
    label: "Ubicación",
    href: "/ubicacion",
    icon: "/location.svg",
    alt: "Ubicación",
    section: "Catálogos / configuración",
    permissionRoutes: ["/inventario", "/ubicacion"],
  },
  {
    label: "Colores",
    href: "/colores",
    icon: "/colors.svg",
    alt: "Colores",
    section: "Catálogos / configuración",
    permissionRoutes: ["/inventario", "/colores"],
  },
  {
    label: "Tamaño",
    href: "/tamano",
    icon: "/size.svg",
    alt: "Tamaño",
    section: "Catálogos / configuración",
    permissionRoutes: ["/inventario", "/tamano"],
  },
  {
    label: "Categoría",
    href: "/categoria",
    icon: "/category.svg",
    alt: "Categoría",
    section: "Catálogos / configuración",
    permissionRoutes: ["/inventario", "/categoria"],
  },
  {
    label: "Usuarios",
    href: "/usuarios",
    icon: "/users.svg",
    alt: "Usuarios",
    section: "Administración",
    permissionRoutes: ["/usuarios"],
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
