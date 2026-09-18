'use client';

import { apiFetch } from '@/app/_lib/api';
import { useEffect, useState } from 'react';

export type AsyncCatalogItem = {
  id: number;
  nombre: string;
  unidad_consumo?: string | null;
  porcentaje_merma?: string | number | null;
};

type AsyncCatalogSelectorProps = {
  endpoint: string;
  placeholder: string;
  excludedIds?: number[];
  onSelect: (item: AsyncCatalogItem) => void;
};

export default function AsyncCatalogSelector({ endpoint, placeholder, excludedIds = [], onSelect }: AsyncCatalogSelectorProps) {
  const [search, setSearch] = useState('');
  const [items, setItems] = useState<AsyncCatalogItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const response = await apiFetch(`${endpoint}?search=${encodeURIComponent(search)}&per_page=20`);
        const data = await response.json().catch(() => null);
        setItems(response.ok && Array.isArray(data?.data) ? data.data : []);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => window.clearTimeout(timer);
  }, [endpoint, search]);

  const available = items.filter((item) => !excludedIds.includes(item.id));

  return (
    <div className="relative space-y-1">
      <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={placeholder} className="h-10 w-full rounded bg-white px-3 text-sm" />
      <div className="max-h-40 overflow-y-auto rounded bg-white shadow-sm">
        {loading ? <p className="p-2 text-xs text-[#456f89]">Buscando...</p> : null}
        {!loading && available.length === 0 ? <p className="p-2 text-xs text-[#456f89]">Sin resultados.</p> : null}
        {available.map((item) => (
          <button key={item.id} type="button" onClick={() => { onSelect(item); setSearch(''); }} className="block w-full px-3 py-2 text-left text-sm hover:bg-[#e9eef1]">
            {item.nombre}{item.unidad_consumo ? ` · ${item.unidad_consumo}` : ''}
          </button>
        ))}
      </div>
    </div>
  );
}
