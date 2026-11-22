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

type CatalogListResponse = {
  data?: unknown[];
  meta?: {
    last_page?: unknown;
  };
};

type CatalogPageFetcher = (path: string) => Promise<{
  ok: boolean;
  status: number;
  json: () => Promise<unknown>;
}>;

export async function fetchAllCatalogItems(
  endpoint: string,
  fetchPage: CatalogPageFetcher
): Promise<unknown[]> {
  const items: unknown[] = [];
  let page = 1;

  while (page <= 1000) {
    const separator = endpoint.includes('?') ? '&' : '?';
    const response = await fetchPage(`${endpoint}${separator}page=${page}`);
    const data = await response.json().catch(() => null) as CatalogListResponse | null;

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    if (Array.isArray(data?.data)) {
      items.push(...data.data);
    }

    const lastPage = Number(data?.meta?.last_page);
    if (Number.isInteger(lastPage) && lastPage >= page) {
      if (page >= lastPage) break;
    } else if (!Array.isArray(data?.data) || data.data.length === 0) {
      break;
    }

    page += 1;
  }

  return items;
}
