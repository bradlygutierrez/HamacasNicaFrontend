'use client';

import { apiFetch } from '@/app/_lib/api';
import {
  buildEntradaInventarioPayload,
  buildEntradaMovimientoPayload,
} from '@/app/_lib/entradas';
import { Plus, X } from 'lucide-react';
import { useEffect, useState } from 'react';

type Hamaca = {
  id: number;
  nombre: string;
};

type Usuario = {
  id: number;
  nombre: string;
};

type Ubicacion = {
  id: number;
  nombre: string;
};

type Color = {
  id: number;
  nombre: string;
};

type FormData = {
  hamaca_id: string;
  usuario_id: string;
  cantidad: string;
  fecha: string;
  ubicacion_id: string;
  color_ids: string[];
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

const EMPTY_FORM: FormData = {
  hamaca_id: '',
  usuario_id: '',
  cantidad: '',
  fecha: new Date().toISOString().slice(0, 10),
  ubicacion_id: '',
  color_ids: [],
};

export default function EntradaModal({ isOpen, onClose, onSuccess }: Props) {
  const [hamacas, setHamacas] = useState<Hamaca[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([]);
  const [colores, setColores] = useState<Color[]>([]);

  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    async function loadCatalogos() {
      try {
        const [hamacasRes, ubicacionesRes, coloresRes, meRes] = await Promise.all([
          apiFetch('/hamacas'),
          apiFetch('/ubicaciones'),
          apiFetch('/colores'),
          apiFetch('/me'),
        ]);

        const hamacasData = await hamacasRes.json();
        const ubicacionesData = await ubicacionesRes.json();
        const coloresData = await coloresRes.json();
        const meData = await meRes.json();

        setHamacas(hamacasData.data ?? []);
        setUbicaciones(ubicacionesData.data ?? []);
        setColores(coloresData.data ?? []);

        let loadedUsers: Usuario[] = [];

        try {
          const usuariosRes = await apiFetch('/usuarios');

          if (usuariosRes.ok) {
            const usuariosData = await usuariosRes.json();
            loadedUsers = usuariosData.data ?? [];
          }
        } catch {
          loadedUsers = [];
        }

        if (loadedUsers.length === 0 && meData.data) {
          loadedUsers = [
            {
              id: meData.data.id,
              nombre: meData.data.nombre,
            },
          ];
        }

        setUsuarios(loadedUsers);

        if (meData.data) {
          setForm((prev) => ({
            ...prev,
            usuario_id: String(meData.data.id),
          }));
        }
      } catch (err) {
        console.error(err);
        setError('No se pudieron cargar los datos del formulario.');
      }
    }

    loadCatalogos();
  }, [isOpen]);

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError('');
  }

  function handleColorToggle(colorId: number) {
    const value = String(colorId);

    setForm((prev) => {
      const isSelected = prev.color_ids.includes(value);

      return {
        ...prev,
        color_ids: isSelected
          ? prev.color_ids.filter((selectedId) => selectedId !== value)
          : [...prev.color_ids, value],
      };
    });

    setError('');
  }

  function validate() {
    if (!form.hamaca_id) return 'Seleccioná un producto.';
    if (!form.usuario_id) return 'Seleccioná un usuario.';
    if (!form.cantidad || Number(form.cantidad) < 1) return 'La cantidad debe ser mayor a 0.';
    if (!form.fecha) return 'Seleccioná una fecha.';
    if (!form.ubicacion_id) return 'Seleccioná una ubicación.';
    if (form.color_ids.length === 0) return 'Seleccioná al menos un color.';

    return '';
  }

  function getValidationMessage(data: unknown) {
    if (!data || typeof data !== 'object') return 'Datos inválidos.';

    const payload = data as {
      message?: unknown;
      errors?: Record<string, unknown[]>;
    };

    const firstError = payload.errors
      ? Object.values(payload.errors).flat()[0]
      : payload.message;

    return String(firstError ?? 'Datos inválidos.');
  }

  async function handleSubmit() {
    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const response = await apiFetch('/inventario-hamacas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(
          buildEntradaInventarioPayload({
            hamacaId: Number(form.hamaca_id),
            usuarioId: Number(form.usuario_id),
            ubicacionId: Number(form.ubicacion_id),
            colorIds: form.color_ids.map(Number),
            cantidad: Number(form.cantidad),
          })
        ),
      });

      const data = await response.json().catch(() => null);

      if (response.status === 422) {
        setError(getValidationMessage(data));
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const inventarioHamacaId = Number(data?.data?.id);

      if (!Number.isFinite(inventarioHamacaId) || inventarioHamacaId <= 0) {
        throw new Error('La API no devolvió el inventario creado.');
      }

      const movimientoResponse = await apiFetch('/movimientos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(
          buildEntradaMovimientoPayload({
            inventarioHamacaId,
            usuarioId: Number(form.usuario_id),
            ubicacionDestinoId: Number(form.ubicacion_id),
            cantidad: Number(form.cantidad),
            fecha: form.fecha,
          })
        ),
      });

      const movimientoData = await movimientoResponse.json().catch(() => null);

      if (movimientoResponse.status === 422) {
        setError(getValidationMessage(movimientoData));
        return;
      }

      if (!movimientoResponse.ok) {
        throw new Error(`HTTP ${movimientoResponse.status}`);
      }

      setForm({
        ...EMPTY_FORM,
        fecha: new Date().toISOString().slice(0, 10),
        usuario_id: form.usuario_id,
      });

      setError('');
      await onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      setError('No se pudo registrar la entrada. Verificá tu sesión y rol.');
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-y-0 right-0 left-[64px] z-40 flex items-center justify-center bg-black/20 px-3 py-6"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="max-h-[calc(100vh-32px)] w-full max-w-[620px] overflow-y-auto rounded-[10px] bg-[#f7f7f7] px-6 py-6 shadow-xl sm:px-9">
        <h2 className="mb-5 text-3xl font-medium text-black">
          Agregar Entrada
        </h2>

        <div className="grid gap-5 sm:grid-cols-[1fr_auto] sm:items-end">
          <div className="flex flex-col gap-4">
            <select
              name="hamaca_id"
              value={form.hamaca_id}
              onChange={handleChange}
              className="h-[46px] w-full border border-black bg-[#f7f7f7] px-7 text-xl text-[#08264d] outline-none"
            >
              <option value="">Producto</option>
              {hamacas.map((hamaca) => (
                <option key={hamaca.id} value={hamaca.id}>
                  {hamaca.nombre}
                </option>
              ))}
            </select>

            <select
              name="usuario_id"
              value={form.usuario_id}
              onChange={handleChange}
              className="h-[46px] w-full border border-black bg-[#f7f7f7] px-7 text-xl text-[#08264d] outline-none"
            >
              <option value="">Usuario</option>
              {usuarios.map((usuario) => (
                <option key={usuario.id} value={usuario.id}>
                  {usuario.nombre}
                </option>
              ))}
            </select>

            <input
              name="cantidad"
              type="number"
              min={1}
              value={form.cantidad}
              onChange={handleChange}
              placeholder="Cantidad"
              className="h-[46px] w-full border border-black bg-[#f7f7f7] px-7 text-xl text-[#08264d] outline-none"
            />

            <input
              name="fecha"
              type="date"
              value={form.fecha}
              onChange={handleChange}
              className="h-[46px] w-full border border-black bg-[#f7f7f7] px-7 text-xl text-[#08264d] outline-none"
            />

            <select
              name="ubicacion_id"
              value={form.ubicacion_id}
              onChange={handleChange}
              className="h-[46px] w-full border border-black bg-[#f7f7f7] px-7 text-xl text-[#08264d] outline-none"
            >
              <option value="">Ubicación</option>
              {ubicaciones.map((ubicacion) => (
                <option key={ubicacion.id} value={ubicacion.id}>
                  {ubicacion.nombre}
                </option>
              ))}
            </select>

            <fieldset className="w-full border border-black bg-[#f7f7f7] px-5 py-3 text-[#08264d]">
              <legend className="px-2 text-lg font-semibold">
                Colores
              </legend>
              <div className="grid max-h-[150px] gap-2 overflow-y-auto sm:grid-cols-2">
                {colores.map((color) => {
                  const colorId = String(color.id);

                  return (
                    <label
                      key={color.id}
                      className="flex min-h-[34px] items-center gap-3 text-lg"
                    >
                      <input
                        type="checkbox"
                        checked={form.color_ids.includes(colorId)}
                        onChange={() => handleColorToggle(color.id)}
                        className="h-5 w-5 accent-[#155b72]"
                      />
                      <span>{color.nombre}</span>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            {error && (
              <p className="rounded-md bg-red-100 px-3 py-2 text-sm font-semibold text-red-700">
                {error}
              </p>
            )}
          </div>

          <div className="flex gap-2 sm:flex-col">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="flex h-[38px] flex-1 items-center justify-center gap-2 rounded-[10px] bg-[#155b72] px-4 text-base font-bold text-white disabled:opacity-60 sm:flex-none"
            >
              <Plus className="h-5 w-5" />
              {loading ? 'Guardando' : 'Agregar'}
            </button>

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex h-[38px] flex-1 items-center justify-center gap-2 rounded-[10px] bg-[#08264d] px-4 text-base font-bold text-white disabled:opacity-60 sm:flex-none"
            >
              <X className="h-5 w-5" />
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
