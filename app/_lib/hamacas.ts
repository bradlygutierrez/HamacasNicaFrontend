export type HamacaPayload = {
  nombre: string;
  descripcion: string | null;
  categoria_id: number;
  tamano_id: number;
  precio: number;
  color_ids?: number[];
};

export type HamacaFotoPayload = {
  ruta: string;
  hamaca_ids: number[];
};

type BuildHamacaPayloadInput = {
  nombre: string;
  descripcion: string;
  categoriaId: number;
  tamanoId: number;
  precio: number;
  colorIds?: number[];
  suggestedName?: string;
};

type BuildHamacaFotoPayloadInput = {
  hamacaId: number;
  ruta: string;
};

export function buildHamacaPayload({
  nombre,
  descripcion,
  categoriaId,
  tamanoId,
  precio,
  colorIds,
  suggestedName,
}: BuildHamacaPayloadInput): HamacaPayload {
  return {
    nombre: nombre.trim() || suggestedName?.trim() || "",
    descripcion: descripcion.trim() || null,
    categoria_id: categoriaId,
    tamano_id: tamanoId,
    precio,
    ...(colorIds ? { color_ids: colorIds } : {}),
  };
}

export function suggestHamacaName(category: string, size: string, colors: string[]): string {
  const product = [category.trim(), size.trim()].filter(Boolean).join(" ");
  const colorNames = colors.map((color) => color.trim()).filter(Boolean);
  return product + (colorNames.length ? ` - ${colorNames.join(" / ")}` : "");
}

export function normalizePhotoRoutes(routes: string[]): string[] {
  const cleanedRoutes = routes
    .map((route) => route.trim())
    .filter(Boolean);

  return Array.from(new Set(cleanedRoutes));
}

export function buildHamacaFotoPayload({
  hamacaId,
  ruta,
}: BuildHamacaFotoPayloadInput): HamacaFotoPayload {
  return {
    ruta: ruta.trim(),
    hamaca_ids: [hamacaId],
  };
}
