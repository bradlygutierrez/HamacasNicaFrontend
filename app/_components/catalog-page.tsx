'use client';

import { apiFetch } from '@/app/_lib/api';
import {
  buildCatalogPayload,
  getApiValidationMessage,
} from '@/app/_lib/catalogos';
import { Check, Pencil, Plus, RotateCcw, Search, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

type CatalogItem = {
  id: number;
  nombre: string;
  descripcion?: string | null;
  created_at?: string | null;
};

type CatalogPageProps = {
  title: string;
  description: string;
  endpoint: string;
  supportsDescription?: boolean;
  namePlaceholder: string;
  descriptionPlaceholder?: string;
};

const EMPTY_FORM = {
  nombre: '',
  descripcion: '',
};

function formatDate(value?: string | null) {
  if (!value) return 'Sin fecha';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Sin fecha';

  return new Intl.DateTimeFormat('es-NI', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export default function CatalogPage({
  title,
  description,
  endpoint,
  supportsDescription = true,
  namePlaceholder,
  descriptionPlaceholder = 'Descripción opcional',
}: CatalogPageProps) {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingItem, setEditingItem] = useState<CatalogItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadItems = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await apiFetch(endpoint);
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      setItems(data?.data ?? []);
    } catch (err) {
      console.error(err);
      setError('No se pudo cargar el catálogo.');
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      loadItems().catch(console.error);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadItems]);

  const filteredItems = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    if (!term) return items;

    return items.filter((item) =>
      `${item.nombre} ${item.descripcion ?? ''}`.toLowerCase().includes(term)
    );
  }, [items, searchTerm]);

  function resetForm() {
    setForm(EMPTY_FORM);
    setEditingItem(null);
    setError('');
    setMessage('');
  }

  function startEdit(item: CatalogItem) {
    setEditingItem(item);
    setForm({
      nombre: item.nombre ?? '',
      descripcion: item.descripcion ?? '',
    });
    setError('');
    setMessage('');
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!form.nombre.trim()) {
      setError('El nombre es obligatorio.');
      return;
    }

    setSaving(true);
    setError('');
    setMessage('');

    try {
      const payload = buildCatalogPayload({
        nombre: form.nombre,
        descripcion: form.descripcion,
        includeDescription: supportsDescription,
      });

      const response = await apiFetch(
        editingItem ? `${endpoint}/${editingItem.id}` : endpoint,
        {
          method: editingItem ? 'PUT' : 'POST',
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json().catch(() => null);

      if (response.status === 422) {
        setError(getApiValidationMessage(data, 'Datos inválidos.'));
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      setMessage(editingItem ? 'Registro actualizado.' : 'Registro creado.');
      setForm(EMPTY_FORM);
      setEditingItem(null);
      await loadItems();
    } catch (err) {
      console.error(err);
      setError('No se pudo guardar el registro. Verificá tu sesión y rol.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="w-full max-w-full overflow-x-hidden bg-[#456f89] px-3 py-4 text-[#08264d] sm:px-8 sm:py-7">
      <header className="mb-6 flex flex-col gap-4 lg:mb-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-[42px] font-extrabold leading-none text-white sm:text-[56px]">
            {title}
          </h1>
          <p className="max-w-3xl text-sm font-medium text-white/85 sm:text-base">
            {description}
          </p>
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative h-[46px] w-full lg:max-w-[650px]">
            <Search className="absolute left-4 top-1/2 h-6 w-6 -translate-y-1/2 text-[#08264d]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder={`Buscar ${title.toLowerCase()}`}
              className="h-full w-full rounded-[8px] bg-[#f7f7f7] pl-14 pr-4 text-base text-[#08264d] outline-none sm:text-xl"
            />
          </div>

          <button
            type="button"
            onClick={resetForm}
            className="flex h-[44px] w-full items-center justify-center gap-2 rounded-[10px] bg-[#f7f7f7] px-5 text-base font-medium text-black shadow-md sm:w-fit sm:text-lg lg:ml-auto"
          >
            <Plus className="h-5 w-5" />
            Nuevo
          </button>
        </div>
      </header>

      <main className="grid gap-5 xl:grid-cols-[420px_minmax(0,1fr)]">
        <form
          onSubmit={handleSubmit}
          className="rounded-[8px] bg-[#e9eef1] p-5 shadow-lg sm:p-6"
        >
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#456f89]">
                {editingItem ? 'Editar registro' : 'Crear registro'}
              </p>
              <h2 className="mt-1 text-2xl font-extrabold text-[#08264d]">
                {editingItem?.nombre ?? title}
              </h2>
            </div>

            {editingItem ? (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-full p-2 text-[#08264d] transition hover:bg-[#123852]/10"
                aria-label="Cancelar edición"
              >
                <X className="h-5 w-5" />
              </button>
            ) : null}
          </div>

          <div className="space-y-4">
            <label className="block">
              <span className="mb-1 block text-[11px] font-bold uppercase tracking-[0.12em] text-[#123852]">
                Nombre
              </span>
              <input
                type="text"
                value={form.nombre}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, nombre: event.target.value }))
                }
                placeholder={namePlaceholder}
                className="h-11 w-full rounded-[8px] border border-[#123852]/20 bg-white px-3 text-sm text-[#08264d] outline-none focus:ring-2 focus:ring-[#123852]/20"
              />
            </label>

            {supportsDescription ? (
              <label className="block">
                <span className="mb-1 block text-[11px] font-bold uppercase tracking-[0.12em] text-[#123852]">
                  Descripción
                </span>
                <textarea
                  value={form.descripcion}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      descripcion: event.target.value,
                    }))
                  }
                  placeholder={descriptionPlaceholder}
                  rows={4}
                  className="w-full resize-y rounded-[8px] border border-[#123852]/20 bg-white px-3 py-2 text-sm text-[#08264d] outline-none focus:ring-2 focus:ring-[#123852]/20"
                />
              </label>
            ) : null}
          </div>

          {error ? (
            <p className="mt-4 rounded-[8px] bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
              {error}
            </p>
          ) : null}

          {message ? (
            <p className="mt-4 rounded-[8px] bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
              {message}
            </p>
          ) : null}

          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <button
              type="submit"
              disabled={saving}
              className="flex h-11 flex-1 items-center justify-center gap-2 rounded-[8px] bg-[#123852] px-4 text-sm font-bold text-white transition hover:bg-[#08264d] disabled:opacity-60"
            >
              <Check className="h-4 w-4" />
              {saving ? 'Guardando...' : editingItem ? 'Actualizar' : 'Crear'}
            </button>

            <button
              type="button"
              onClick={resetForm}
              disabled={saving}
              className="flex h-11 items-center justify-center gap-2 rounded-[8px] border border-[#123852]/30 px-4 text-sm font-bold text-[#123852] transition hover:bg-[#123852]/10 disabled:opacity-60"
            >
              <RotateCcw className="h-4 w-4" />
              Limpiar
            </button>
          </div>
        </form>

        <section className="rounded-[8px] bg-[#e9eef1] p-4 shadow-lg sm:p-5">
          <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#456f89]">
                Registros
              </p>
              <h2 className="text-2xl font-extrabold text-[#08264d]">
                {filteredItems.length} encontrados
              </h2>
            </div>
          </div>

          {loading ? (
            <div className="rounded-[8px] bg-white px-4 py-6 text-center text-sm font-semibold text-[#456f89]">
              Cargando catálogo...
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="rounded-[8px] bg-white px-4 py-6 text-center text-sm font-semibold text-[#456f89]">
              No hay registros para mostrar.
            </div>
          ) : (
            <div className="grid gap-3 lg:grid-cols-2">
              {filteredItems.map((item) => (
                <article
                  key={item.id}
                  className="rounded-[8px] bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="break-words text-xl font-extrabold text-[#08264d]">
                        {item.nombre}
                      </h3>
                      {supportsDescription ? (
                        <p className="mt-1 line-clamp-3 text-sm font-medium text-[#456f89]">
                          {item.descripcion || 'Sin descripción'}
                        </p>
                      ) : null}
                    </div>

                    <button
                      type="button"
                      onClick={() => startEdit(item)}
                      className="shrink-0 rounded-full p-2 text-[#08264d] transition hover:bg-[#123852]/10"
                      aria-label={`Editar ${item.nombre}`}
                    >
                      <Pencil className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="mt-4 flex items-center justify-between rounded-[8px] bg-[#123852] px-3 py-2 text-xs font-bold uppercase tracking-[0.08em] text-white">
                    <span>ID {item.id}</span>
                    <span>{formatDate(item.created_at)}</span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
