'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/app/_lib/api';
import {
  buildFotoPayload,
  buildHamacaPayload,
  normalizePhotoRoutes,
} from '@/app/_lib/hamacas';

// ─── Tipos ───────────────────────────────────────────────────────────────────

type Categoria = { id: number; nombre: string };
type Tamano    = { id: number; nombre: string };

type Hamaca = {
  id: number;
  nombre: string;
  descripcion: string | null;
  categoria_id: number;
  tamano_id: number;
  precio: number | string;
  fotos?: Array<{ id?: number; ruta: string }>;
};

type FormData = {
  nombre: string;
  descripcion: string;
  categoria_id: string;
  tamano_id: string;
  precio: string;
};

type FormErrors = Partial<Record<keyof FormData, string>>;

type Mode = 'crear' | 'editar';

// ─── Props ───────────────────────────────────────────────────────────────────

type HamacaModalProps = {
  isOpen: boolean;
  onClose: () => void;
  /** Llamada tras guardar exitosamente para refrescar la lista padre */
  onSuccess: () => void;
  /** Si se pasa, el modal abre directamente en modo editar con esa hamaca */
  hamacaToEdit?: Hamaca | null;
};

// ─── Estado inicial del formulario ───────────────────────────────────────────

const EMPTY_FORM: FormData = {
  nombre: '',
  descripcion: '',
  categoria_id: '',
  tamano_id: '',
  precio: '',
};

const EMPTY_PHOTOS = [''];

// ─── Componente ──────────────────────────────────────────────────────────────

export default function HamacaModal({
  isOpen,
  onClose,
  onSuccess,
  hamacaToEdit = null,
}: HamacaModalProps) {

  // Modo: crear o editar
  const [mode, setMode] = useState<Mode>(hamacaToEdit ? 'editar' : 'crear');

  // Catálogos para los selects
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [tamanos,    setTamanos]    = useState<Tamano[]>([]);
  const [hamacas,    setHamacas]    = useState<Hamaca[]>([]);

  // Hamaca seleccionada en modo editar (si no viene por prop)
  const [selectedHamacaId, setSelectedHamacaId] = useState<string>(
    hamacaToEdit ? String(hamacaToEdit.id) : ''
  );

  // Formulario y errores
  const [form,    setForm]    = useState<FormData>(EMPTY_FORM);
  const [photoRoutes, setPhotoRoutes] = useState<string[]>(EMPTY_PHOTOS);
  const [initialPhotoRoutes, setInitialPhotoRoutes] = useState<string[]>([]);
  const [errors,  setErrors]  = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  // ── Carga de catálogos al abrir ──────────────────────────────────────────

  useEffect(() => {
    if (!isOpen) return;

    const loadCatalogos = async () => {
      try {
        const [catRes, tamRes, hamRes] = await Promise.all([
          apiFetch('/categorias'),
          apiFetch('/tamanos'),
          apiFetch('/hamacas'),
        ]);

        const catData = await catRes.json();
        const tamData = await tamRes.json();
        const hamData = await hamRes.json();

        setCategorias(catData.data ?? []);
        setTamanos(tamData.data ?? []);
        setHamacas(hamData.data ?? []);
      } catch (err) {
        console.error('Error cargando catálogos:', err);
      }
    };

    loadCatalogos();
  }, [isOpen]);

  // ── Rellena el formulario cuando cambia hamacaToEdit o el modo ───────────

  useEffect(() => {
    if (hamacaToEdit) {
      setMode('editar');
      setSelectedHamacaId(String(hamacaToEdit.id));
      fillForm(hamacaToEdit);
      fillPhotos(hamacaToEdit);
    } else {
      setMode('crear');
      setSelectedHamacaId('');
      setForm(EMPTY_FORM);
      setPhotoRoutes(EMPTY_PHOTOS);
      setInitialPhotoRoutes([]);
    }
    setErrors({});
  }, [hamacaToEdit, isOpen]);

  // ── Rellena el form con los datos de una hamaca ──────────────────────────

  function fillForm(h: Hamaca) {
    setForm({
      nombre:       h.nombre,
      descripcion:  h.descripcion ?? '',
      categoria_id: String(h.categoria_id),
      tamano_id:    String(h.tamano_id),
      precio:       String(h.precio),
    });
  }

  function fillPhotos(h: Hamaca) {
    const routes = h.fotos?.map((foto) => foto.ruta).filter(Boolean) ?? [];

    setPhotoRoutes(routes.length > 0 ? routes : EMPTY_PHOTOS);
    setInitialPhotoRoutes(routes);
  }

  // ── Cuando se selecciona una hamaca en el select de edición ──────────────

  function handleHamacaSelect(e: React.ChangeEvent<HTMLSelectElement>) {
    const id = e.target.value;
    setSelectedHamacaId(id);
    setErrors({});

    if (!id) {
      setForm(EMPTY_FORM);
      return;
    }

    const found = hamacas.find((h) => String(h.id) === id);
    if (found) {
      fillForm(found);
      fillPhotos(found);
    }
  }

  // ── Cambio de modo ───────────────────────────────────────────────────────

  function handleModeChange(newMode: Mode) {
    setMode(newMode);
    setForm(EMPTY_FORM);
    setPhotoRoutes(EMPTY_PHOTOS);
    setInitialPhotoRoutes([]);
    setSelectedHamacaId('');
    setErrors({});
  }

  // ── Actualiza un campo del formulario ────────────────────────────────────

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  function handlePhotoRouteChange(index: number, value: string) {
    setPhotoRoutes((prev) =>
      prev.map((route, routeIndex) => (routeIndex === index ? value : route))
    );
  }

  function handleAddPhotoRoute() {
    setPhotoRoutes((prev) => [...prev, '']);
  }

  function handleRemovePhotoRoute(index: number) {
    setPhotoRoutes((prev) => {
      const next = prev.filter((_, routeIndex) => routeIndex !== index);
      return next.length > 0 ? next : EMPTY_PHOTOS;
    });
  }

  // ── Validación local (espeja las reglas del backend) ─────────────────────

  function validate(): boolean {
    const newErrors: FormErrors = {};

    if (!form.nombre.trim())
      newErrors.nombre = 'El nombre es obligatorio.';
    else if (form.nombre.trim().length > 100)
      newErrors.nombre = 'Máximo 100 caracteres.';

    if (!form.categoria_id)
      newErrors.categoria_id = 'Selecciona una categoría.';

    if (!form.tamano_id)
      newErrors.tamano_id = 'Selecciona un tamaño.';

    if (!form.precio || isNaN(parseFloat(form.precio)) || parseFloat(form.precio) < 0)
      newErrors.precio = 'Ingresa un precio válido.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  // ── Envío del formulario ─────────────────────────────────────────────────

  async function handleSubmit() {
    if (!validate()) return;

    if (mode === 'editar' && !selectedHamacaId) {
      setErrors({ nombre: 'Selecciona una hamaca para editar.' });
      return;
    }

    setLoading(true);

    const payload = buildHamacaPayload({
      nombre: form.nombre,
      descripcion: form.descripcion,
      categoriaId: parseInt(form.categoria_id),
      tamanoId: parseInt(form.tamano_id),
      precio: parseFloat(form.precio),
    });

    try {
      let response: Response;

      if (mode === 'crear') {
        response = await apiFetch('/hamacas', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify(payload),
        });
      } else {
        response = await apiFetch(`/hamacas/${selectedHamacaId}`, {
          method:  'PUT',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify(payload),
        });
      }

      // Errores de validación 422 del servidor
      const data = await response.json().catch(() => null);

      if (response.status === 422) {
        const serverErrors: FormErrors = {};

        if (data?.errors) {
          Object.entries(data.errors).forEach(([key, msgs]) => {
            serverErrors[key as keyof FormData] = (msgs as string[])[0];
          });
        }

        setErrors(serverErrors);
        return;
      }

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const savedHamacaId = Number(data?.data?.id ?? selectedHamacaId);

      if (!Number.isFinite(savedHamacaId) || savedHamacaId <= 0) {
        throw new Error('La API no devolvió la hamaca guardada.');
      }

      const routesToSave = normalizePhotoRoutes(photoRoutes).filter(
        (route) => !initialPhotoRoutes.includes(route)
      );

      await Promise.all(
        routesToSave.map((route) =>
          apiFetch('/fotos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(
              buildFotoPayload({
                hamacaId: savedHamacaId,
                ruta: route,
              })
            ),
          }).then((fotoResponse) => {
            if (!fotoResponse.ok) {
              throw new Error(`Foto HTTP ${fotoResponse.status}`);
            }
          })
        )
      );

      // Éxito
      setForm(EMPTY_FORM);
      setPhotoRoutes(EMPTY_PHOTOS);
      setInitialPhotoRoutes([]);
      setSelectedHamacaId('');
      setErrors({});
      onSuccess();
      onClose();

    } catch (err) {
      console.error('Error guardando hamaca:', err);
      setErrors({ nombre: 'Ocurrió un error al guardar. Intenta de nuevo.' });
    } finally {
      setLoading(false);
    }
  }

  // ── Limpiar formulario ───────────────────────────────────────────────────

  function handleReset() {
    setForm(EMPTY_FORM);
    setPhotoRoutes(EMPTY_PHOTOS);
    setInitialPhotoRoutes([]);
    setErrors({});
    if (mode === 'editar') setSelectedHamacaId('');
  }

  // ── No renderizar si está cerrado ────────────────────────────────────────

  if (!isOpen) return null;

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[14px] bg-[#f0f4f8] shadow-xl">

        {/* Header */}
        <div className="flex items-center justify-between bg-[#1a3a5c] px-6 py-4">
          <h2 className="text-white font-medium text-[17px]">
            {mode === 'crear' ? 'Agregar hamaca' : 'Editar hamaca'}
          </h2>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white transition-colors"
            aria-label="Cerrar modal"
          >
            ✕
          </button>
        </div>

        {/* Toggle de modo */}
        <div className="flex gap-2 px-6 pt-4">
          <button
            onClick={() => handleModeChange('crear')}
            className={`rounded-full px-4 py-1 text-sm font-medium border transition-all ${
              mode === 'crear'
                ? 'bg-[#1a3a5c] text-white border-[#1a3a5c]'
                : 'bg-transparent text-[#4a6a8a] border-[#1a3a5c]/30 hover:bg-[#1a3a5c]/10'
            }`}
          >
            Crear
          </button>
          <button
            onClick={() => handleModeChange('editar')}
            className={`rounded-full px-4 py-1 text-sm font-medium border transition-all ${
              mode === 'editar'
                ? 'bg-[#1a3a5c] text-white border-[#1a3a5c]'
                : 'bg-transparent text-[#4a6a8a] border-[#1a3a5c]/30 hover:bg-[#1a3a5c]/10'
            }`}
          >
            Editar
          </button>
        </div>

        {/* Cuerpo */}
        <div className="flex flex-col gap-4 px-6 py-5">

          {/* Selector de hamaca a editar */}
          {mode === 'editar' && (
            <div className="rounded-lg border border-[#1a3a5c]/15 bg-[#1a3a5c]/[0.06] p-3">
              <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-[#1a3a5c]">
                Hamaca a editar
              </p>
              <select
                value={selectedHamacaId}
                onChange={handleHamacaSelect}
                className="w-full rounded-md border border-[#1a3a5c]/25 bg-white px-3 py-2 text-sm text-[#1a3a5c] focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]/20"
              >
                <option value="">Seleccionar hamaca...</option>
                {hamacas.map((h) => (
                  <option key={h.id} value={h.id}>{h.nombre}</option>
                ))}
              </select>
            </div>
          )}

          {/* Nombre */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-medium uppercase tracking-wider text-[#1a3a5c]">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              placeholder="Ej: Hamaca Familiar"
              maxLength={100}
              className={`rounded-md border bg-white px-3 py-2 text-sm text-[#1a3a5c] placeholder-[#9ab]/60 focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]/20 ${
                errors.nombre ? 'border-red-400' : 'border-[#1a3a5c]/25'
              }`}
            />
            {errors.nombre && (
              <span className="text-[11px] text-red-600">{errors.nombre}</span>
            )}
          </div>

          {/* Descripción */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-medium uppercase tracking-wider text-[#1a3a5c]">
              Descripción
            </label>
            <textarea
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              placeholder="Descripción opcional de la hamaca"
              rows={3}
              className="resize-y rounded-md border border-[#1a3a5c]/25 bg-white px-3 py-2 text-sm text-[#1a3a5c] placeholder-[#9ab]/60 focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]/20"
            />
          </div>

          {/* Categoría + Tamaño */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-medium uppercase tracking-wider text-[#1a3a5c]">
                Categoría <span className="text-red-500">*</span>
              </label>
              <select
                name="categoria_id"
                value={form.categoria_id}
                onChange={handleChange}
                className={`rounded-md border bg-white px-3 py-2 text-sm text-[#1a3a5c] focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]/20 ${
                  errors.categoria_id ? 'border-red-400' : 'border-[#1a3a5c]/25'
                }`}
              >
                <option value="">Seleccionar...</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
              {errors.categoria_id && (
                <span className="text-[11px] text-red-600">{errors.categoria_id}</span>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-medium uppercase tracking-wider text-[#1a3a5c]">
                Tamaño <span className="text-red-500">*</span>
              </label>
              <select
                name="tamano_id"
                value={form.tamano_id}
                onChange={handleChange}
                className={`rounded-md border bg-white px-3 py-2 text-sm text-[#1a3a5c] focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]/20 ${
                  errors.tamano_id ? 'border-red-400' : 'border-[#1a3a5c]/25'
                }`}
              >
                <option value="">Seleccionar...</option>
                {tamanos.map((t) => (
                  <option key={t.id} value={t.id}>{t.nombre}</option>
                ))}
              </select>
              {errors.tamano_id && (
                <span className="text-[11px] text-red-600">{errors.tamano_id}</span>
              )}
            </div>
          </div>

          {/* Precio */}
          <div className="flex flex-col gap-1" style={{ maxWidth: '200px' }}>
            <label className="text-[11px] font-medium uppercase tracking-wider text-[#1a3a5c]">
              Precio (C$) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-[#4a6a8a]">
                C$
              </span>
              <input
                type="number"
                name="precio"
                value={form.precio}
                onChange={handleChange}
                placeholder="0.00"
                min={0}
                step={0.01}
                className={`w-full rounded-md border bg-white py-2 pl-9 pr-3 text-sm text-[#1a3a5c] focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]/20 ${
                  errors.precio ? 'border-red-400' : 'border-[#1a3a5c]/25'
                }`}
              />
            </div>
            {errors.precio && (
              <span className="text-[11px] text-red-600">{errors.precio}</span>
            )}
          </div>

          <div className="flex flex-col gap-2 rounded-lg border border-[#1a3a5c]/15 bg-white/60 p-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <label className="text-[11px] font-medium uppercase tracking-wider text-[#1a3a5c]">
                  Fotos
                </label>
                <p className="text-[11px] text-[#4a6a8a]">
                  Agrega una o varias rutas de imagen para esta hamaca.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddPhotoRoute}
                className="rounded-[7px] bg-[#1a3a5c] px-3 py-2 text-xs font-medium text-white transition hover:bg-[#143050]"
              >
                Agregar foto
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {photoRoutes.map((route, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={route}
                    onChange={(event) =>
                      handlePhotoRouteChange(index, event.target.value)
                    }
                    placeholder="https://... o /uploads/hamaca.jpg"
                    className="min-w-0 flex-1 rounded-md border border-[#1a3a5c]/25 bg-white px-3 py-2 text-sm text-[#1a3a5c] placeholder-[#9ab]/60 focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]/20"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemovePhotoRoute(index)}
                    className="rounded-md border border-[#1a3a5c]/25 px-3 text-sm font-medium text-[#1a3a5c] transition hover:bg-[#1a3a5c]/10"
                    aria-label="Quitar foto"
                  >
                    Quitar
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 border-t border-[#1a3a5c]/12 bg-[#e8edf3] px-6 py-4">
          <button
            onClick={handleReset}
            disabled={loading}
            className="flex items-center gap-2 rounded-[7px] border border-[#1a3a5c]/30 bg-transparent px-4 py-2 text-sm font-medium text-[#1a3a5c] transition hover:bg-[#1a3a5c]/10 disabled:opacity-50"
          >
            Limpiar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 rounded-[7px] bg-[#1a3a5c] px-5 py-2 text-sm font-medium text-white transition hover:bg-[#143050] disabled:cursor-not-allowed disabled:bg-[#6a8aaa]"
          >
            {loading ? (
              <>
                <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Guardando...
              </>
            ) : (
              mode === 'crear' ? 'Crear hamaca' : 'Guardar cambios'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
