'use client';

import { apiFetch } from '@/app/_lib/api';
import {
  buildSalidaMovimientoPayload,
  buildSalidaTransferPayload,
} from '@/app/_lib/salidas';
import { Plus, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

type Usuario = {
  id: number;
  nombre: string;
};

type Inventario = {
  id: number;
  cantidad: number;
  hamaca?: {
    id: number;
    nombre: string;
    precio?: number | string;
  };
  ubicacion?: {
    id: number;
    nombre: string;
  };
  usuario?: {
    id: number;
    nombre: string;
    rol: string;
  };
  colores?: Array<{
    id: number;
    nombre: string;
  }>;
};

type FormData = {
  inventario_hamaca_id: string;
  usuario_id: string;
  cantidad: string;
  fecha: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

const EMPTY_FORM: FormData = {
  inventario_hamaca_id: '',
  usuario_id: '',
  cantidad: '',
  fecha: new Date().toISOString().slice(0, 10),
};

function formatInventarioLabel(inventario: Inventario) {
  const producto = inventario.hamaca?.nombre ?? `INV-${inventario.id}`;
  const colores = inventario.colores?.map((color) => color.nombre).join(', ') || 'Sin color';
  const ubicacion = inventario.ubicacion?.nombre ?? 'Sin ubicación';

  return `${producto} - ${colores} - ${ubicacion} (${inventario.cantidad})`;
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

export default function SalidaModal({ isOpen, onClose, onSuccess }: Props) {
  const [inventarios, setInventarios] = useState<Inventario[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    async function loadCatalogos() {
      try {
        const [inventariosRes, meRes] = await Promise.all([
          apiFetch('/inventario-hamacas'),
          apiFetch('/me'),
        ]);

        const inventariosData = await inventariosRes.json();
        const meData = await meRes.json();
        const availableInventarios = (inventariosData.data ?? []).filter(
          (inventario: Inventario) => Number(inventario.cantidad) > 0
        );

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

        setInventarios(availableInventarios);
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

  const selectedInventario = useMemo(() => {
    return inventarios.find((inventario) => inventario.id === Number(form.inventario_hamaca_id));
  }, [form.inventario_hamaca_id, inventarios]);

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

  function validate() {
    if (!form.inventario_hamaca_id) return 'Seleccioná un producto del inventario.';
    if (!form.usuario_id) return 'Seleccioná un usuario.';
    if (!form.cantidad || Number(form.cantidad) < 1) return 'La cantidad debe ser mayor a 0.';
    if (!form.fecha) return 'Seleccioná una fecha.';

    if (!selectedInventario) return 'El inventario seleccionado no está disponible.';

    if (Number(form.cantidad) > Number(selectedInventario.cantidad)) {
      return `Solo hay ${selectedInventario.cantidad} unidades disponibles.`;
    }

    return '';
  }

  async function handleSubmit() {
    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    if (!selectedInventario) return;

    setLoading(true);

    try {
      const transferResponse = await apiFetch('/inventario-hamacas/transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(
          buildSalidaTransferPayload({
            inventarioHamacaId: Number(form.inventario_hamaca_id),
            cantidad: Number(form.cantidad),
          })
        ),
      });

      const transferData = await transferResponse.json().catch(() => null);

      if (transferResponse.status === 422) {
        setError(getValidationMessage(transferData));
        return;
      }

      if (!transferResponse.ok) {
        throw new Error(`HTTP ${transferResponse.status}`);
      }

      const response = await apiFetch('/movimientos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(
          buildSalidaMovimientoPayload({
            inventarioHamacaId: Number(form.inventario_hamaca_id),
            usuarioId: Number(form.usuario_id),
            cantidad: Number(form.cantidad),
            fecha: form.fecha,
            ubicacionOrigenId: selectedInventario.ubicacion?.id,
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
      setError('No se pudo registrar la salida. Verificá tu sesión, rol y stock.');
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
          Agregar Salida
        </h2>

        <div className="grid gap-5 sm:grid-cols-[1fr_auto] sm:items-end">
          <div className="flex flex-col gap-4">
            <select
              name="inventario_hamaca_id"
              value={form.inventario_hamaca_id}
              onChange={handleChange}
              className="h-[46px] w-full border border-black bg-[#f7f7f7] px-4 text-base text-[#08264d] outline-none sm:px-7 sm:text-xl"
            >
              <option value="">Producto en inventario</option>
              {inventarios.map((inventario) => (
                <option key={inventario.id} value={inventario.id}>
                  {formatInventarioLabel(inventario)}
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
              max={selectedInventario?.cantidad}
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

            {selectedInventario && (
              <div className="rounded-md border border-[#08264d]/30 bg-white px-4 py-3 text-sm font-semibold text-[#08264d]">
                Stock disponible: {selectedInventario.cantidad}
              </div>
            )}

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
