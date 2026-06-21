export type HamacaPayload = {
  nombre: string;
  descripcion: string | null;
  categoria_id: number;
  tamano_id: number;
  precio: number;
};

type BuildHamacaPayloadInput = {
  nombre: string;
  descripcion: string;
  categoriaId: number;
  tamanoId: number;
  precio: number;
};

type BuildFotoPayloadInput = {
  hamacaId: number;
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

export function normalizePhotoRoutes(routes: string[]) {
  return routes.map((route) => route.trim()).filter(Boolean);
}

export function buildFotoPayload({ hamacaId, ruta }: BuildFotoPayloadInput) {
  return {
    ruta: ruta.trim(),
    hamaca_ids: [hamacaId],
  };
}
