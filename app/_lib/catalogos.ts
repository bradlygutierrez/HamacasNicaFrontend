export type CatalogPayload = {
  nombre: string;
  descripcion?: string | null;
};

type BuildCatalogPayloadInput = {
  nombre: string;
  descripcion?: string;
  includeDescription?: boolean;
};

export function buildCatalogPayload({
  nombre,
  descripcion = '',
  includeDescription = true,
}: BuildCatalogPayloadInput): CatalogPayload {
  const payload: CatalogPayload = {
    nombre: nombre.trim(),
  };

  if (includeDescription) {
    payload.descripcion = descripcion.trim() || null;
  }

  return payload;
}

export function getApiValidationMessage(data: unknown, fallback: string) {
  if (!data || typeof data !== 'object') return fallback;

  const payload = data as {
    message?: unknown;
    errors?: Record<string, unknown[]>;
  };

  const firstError = payload.errors
    ? Object.values(payload.errors).flat()[0]
    : payload.message;

  return String(firstError ?? fallback);
}
