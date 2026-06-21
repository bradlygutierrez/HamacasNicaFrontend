export type HamacaPayload = {
  nombre: string;
  descripcion: string | null;
  categoria_id: number;
  tamano_id: number;
  precio: number;
};

export type HamacaFotoPayload = {
  ruta: string;
  hamaca_ids: number[];
};

export type VarianteFotoPayload = {
  ruta: string;
  hamaca_variante_ids: number[];
};

type BuildHamacaPayloadInput = {
  nombre: string;
  descripcion: string;
  categoriaId: number;
  tamanoId: number;
  precio: number;
};

type BuildHamacaFotoPayloadInput = {
  hamacaId: number;
  ruta: string;
};

type BuildVarianteFotoPayloadInput = {
  hamacaVarianteId: number;
  ruta: string;
};

export function buildHamacaPayload({
  nombre,
  descripcion,
  categoriaId,
  tamanoId,
  precio,
}: BuildHamacaPayloadInput): HamacaPayload {
  return {
    nombre: nombre.trim(),
    descripcion: descripcion.trim() || null,
    categoria_id: categoriaId,
    tamano_id: tamanoId,
    precio,
  };
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

export function buildVarianteFotoPayload({
  hamacaVarianteId,
  ruta,
}: BuildVarianteFotoPayloadInput): VarianteFotoPayload {
  return {
    ruta: ruta.trim(),
    hamaca_variante_ids: [hamacaVarianteId],
  };
}

