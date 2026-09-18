'use client';

import { apiFetch } from '@/app/_lib/api';
import { getApiValidationMessage } from '@/app/_lib/catalogos';
import { Check, Pencil, Plus, RotateCcw, Search, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';

type CatalogField = {
  key: string;
  label: string;
  type?: 'text' | 'number' | 'select';
  placeholder?: string;
  required?: boolean;
  step?: string;
  options?: Array<{ value: string; label: string }>;
};

type CatalogItem = {
  id: number;
  nombre: string;
  codigo?: string | null;
  descripcion?: string | null;
  state?: boolean;
  [key: string]: unknown;
};

type ManagedCatalogPageProps = {
  title: string;
  description: string;
  endpoint: string;
  fields: CatalogField[];
  summaryFields: string[];
};

function emptyForm(fields: CatalogField[]): Record<string, string> {
  return Object.fromEntries(fields.map((field) => [field.key, '']));
}

function displayValue(value: unknown): string {
  if (value === null || value === undefined || value === '') return '—';
  return String(value);
}

export default function ManagedCatalogPage({
  title,
  description,
  endpoint,
  fields,
  summaryFields,
}: ManagedCatalogPageProps) {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [form, setForm] = useState<Record<string, string>>(() => emptyForm(fields));
  const [editingItem, setEditingItem] = useState<CatalogItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadItems = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await apiFetch(endpoint);
      const data = await response.json().catch(() => null);

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      setItems(Array.isArray(data?.data) ? data.data : []);
    } catch (err) {
      console.error(err);
      setError('No se pudo cargar el catálogo. Verificá tu sesión y rol.');
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    void loadItems();
  }, [loadItems]);

  const filteredItems = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    if (!term) return items;

    return items.filter((item) =>
      fields
        .map((field) => displayValue(item[field.key]))
        .join(' ')
        .toLowerCase()
        .includes(term)
    );
  }, [fields, items, searchTerm]);

  function resetForm() {
    setForm(emptyForm(fields));
    setEditingItem(null);
    setError('');
  }

  function startEdit(item: CatalogItem) {
    setEditingItem(item);
    setForm(
      Object.fromEntries(
        fields.map((field) => [field.key, displayValue(item[field.key]) === '—' ? '' : String(item[field.key] ?? '')])
      )
    );
    setError('');
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const missingField = fields.find((field) => field.required && !form[field.key]?.trim());
    if (missingField) {
      setError(`${missingField.label} es obligatorio.`);
      return;
    }

    setSaving(true);
    setError('');

    try {
      const response = await apiFetch(
        editingItem ? `${endpoint}/${editingItem.id}` : endpoint,
        {
          method: editingItem ? 'PUT' : 'POST',
          body: JSON.stringify(
            Object.fromEntries(
              Object.entries(form).map(([key, value]) => [key, value.trim() === '' ? null : value])
            )
          ),
        }
      );
      const data = await response.json().catch(() => null);

      if (response.status === 422) {
        setError(getApiValidationMessage(data, 'Datos inválidos.'));
        return;
      }

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      toast.success(editingItem ? 'Registro actualizado.' : 'Registro creado.');
      resetForm();
      await loadItems();
    } catch (err) {
      console.error(err);
      setError('No se pudo guardar el registro. Verificá tu sesión y rol.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeactivate(item: CatalogItem) {
    if (!window.confirm(`¿Desactivar ${item.nombre}?`)) return;

    setError('');

    try {
      const response = await apiFetch(`${endpoint}/${item.id}`, { method: 'DELETE' });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        if (response.status === 422) {
          setError(getApiValidationMessage(data, 'No se pudo desactivar el registro.'));
          return;
        }

        throw new Error(`HTTP ${response.status}`);
      }

      toast.success('Registro desactivado.');
      await loadItems();
    } catch (err) {
      console.error(err);
      setError('No se pudo desactivar el registro. Verificá tu sesión y rol.');
    }
  }

  return (
    <div className="w-full max-w-full overflow-x-hidden bg-[#456f89] px-3 py-4 text-[#08264d] sm:px-8 sm:py-7">
      <header className="mb-6 flex flex-col gap-4 lg:mb-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-[42px] font-extrabold leading-none text-white sm:text-[56px]">{title}</h1>
          <p className="max-w-3xl text-sm font-medium text-white/85 sm:text-base">{description}</p>
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
        <form onSubmit={handleSubmit} className="rounded-[8px] bg-[#e9eef1] p-5 shadow-lg sm:p-6">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#456f89]">
                {editingItem ? 'Editar registro' : 'Crear registro'}
              </p>
              <h2 className="mt-1 text-2xl font-extrabold text-[#08264d]">{editingItem?.nombre ?? title}</h2>
            </div>
            {editingItem ? (
              <button type="button" onClick={resetForm} className="rounded-full p-2 text-[#08264d] transition hover:bg-[#123852]/10" aria-label="Cancelar edición">
                <X className="h-5 w-5" />
              </button>
            ) : null}
          </div>

          <div className="space-y-4">
            {fields.map((field) => (
              <label key={field.key} className="block">
                <span className="mb-1 block text-[11px] font-bold uppercase tracking-[0.12em] text-[#123852]">
                  {field.label}{field.required ? ' *' : ''}
                </span>
                {field.type === 'select' ? (
                  <select
                    value={form[field.key] ?? ''}
                    onChange={(event) => setForm((prev) => ({ ...prev, [field.key]: event.target.value }))}
                    className="h-11 w-full rounded-[8px] border border-[#123852]/20 bg-white px-3 text-sm text-[#08264d] outline-none focus:ring-2 focus:ring-[#123852]/20"
                  >
                    <option value="">Seleccionar...</option>
                    {field.options?.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </select>
                ) : (
                  <input
                    type={field.type ?? 'text'}
                    step={field.step}
                    value={form[field.key] ?? ''}
                    onChange={(event) => setForm((prev) => ({ ...prev, [field.key]: event.target.value }))}
                    placeholder={field.placeholder}
                    className="h-11 w-full rounded-[8px] border border-[#123852]/20 bg-white px-3 text-sm text-[#08264d] outline-none focus:ring-2 focus:ring-[#123852]/20"
                  />
                )}
              </label>
            ))}
          </div>

          {error ? <p className="mt-4 rounded-[8px] bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{error}</p> : null}

          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <button type="submit" disabled={saving} className="flex h-11 flex-1 items-center justify-center gap-2 rounded-[8px] bg-[#123852] px-4 text-sm font-bold text-white transition hover:bg-[#08264d] disabled:opacity-60">
              <Check className="h-4 w-4" />
              {saving ? 'Guardando...' : editingItem ? 'Actualizar' : 'Crear'}
            </button>
            <button type="button" onClick={resetForm} disabled={saving} className="flex h-11 items-center justify-center gap-2 rounded-[8px] border border-[#123852]/30 px-4 text-sm font-bold text-[#123852] transition hover:bg-[#123852]/10 disabled:opacity-60">
              <RotateCcw className="h-4 w-4" />
              Limpiar
            </button>
          </div>
        </form>

        <section className="rounded-[8px] bg-[#e9eef1] p-4 shadow-lg sm:p-5">
          <div className="mb-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#456f89]">Registros</p>
            <h2 className="text-2xl font-extrabold text-[#08264d]">{filteredItems.length} encontrados</h2>
          </div>

          {loading ? (
            <div className="rounded-[8px] bg-white px-4 py-6 text-center text-sm font-semibold text-[#456f89]">Cargando catálogo...</div>
          ) : filteredItems.length === 0 ? (
            <div className="rounded-[8px] bg-white px-4 py-6 text-center text-sm font-semibold text-[#456f89]">No hay registros para mostrar.</div>
          ) : (
            <div className="grid gap-3 lg:grid-cols-2">
              {filteredItems.map((item) => (
                <article key={item.id} className="rounded-[8px] bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="break-words text-xl font-extrabold text-[#08264d]">{item.nombre}</h3>
                      <p className="text-sm font-semibold text-[#456f89]">{item.codigo || 'Sin código'}</p>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <button type="button" onClick={() => startEdit(item)} className="rounded-full p-2 text-[#08264d] transition hover:bg-[#123852]/10" aria-label={`Editar ${item.nombre}`}>
                        <Pencil className="h-5 w-5" />
                      </button>
                      {item.state !== false ? (
                        <button type="button" onClick={() => handleDeactivate(item)} className="rounded-full p-2 text-[#08264d] transition hover:bg-red-100 hover:text-red-700" aria-label={`Desactivar ${item.nombre}`}>
                          <X className="h-5 w-5" />
                        </button>
                      ) : null}
                    </div>
                  </div>

                  {item.descripcion ? <p className="mt-1 line-clamp-2 text-sm font-medium text-[#456f89]">{item.descripcion}</p> : null}

                  <div className="mt-4 grid gap-2 text-sm text-[#08264d] sm:grid-cols-2">
                    {summaryFields.map((key) => (
                      <div key={key} className="rounded-[8px] bg-[#f0f4f6] px-3 py-2">
                        <span className="block text-[10px] font-bold uppercase tracking-[0.08em] text-[#456f89]">{fields.find((field) => field.key === key)?.label ?? key}</span>
                        <span className="font-semibold">{displayValue(item[key])}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 rounded-[8px] bg-[#123852] px-3 py-2 text-xs font-bold uppercase tracking-[0.08em] text-white">
                    Estado: {item.state === false ? 'Inactivo' : 'Activo'}
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
