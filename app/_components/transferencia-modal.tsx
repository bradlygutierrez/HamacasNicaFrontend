'use client';

import { apiFetch } from '@/app/_lib/api';
import { buildTransferenciaPayload } from '@/app/_lib/transferencias';
import { ArrowRightLeft, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';

type Inventario = {
  id: number;
  cantidad: number;
  hamaca?: {
    id: number;
    nombre: string;
  };
  ubicacion?: {
    id: number;
    nombre: string;
  };
  colores?: Array<{
    id: number;
    nombre: string;
  }>;
};

type Ubicacion = {
  id: number;
  nombre: string;
};

type FormData = {
  inventario_hamaca_id: string;
  ubicacion_destino_id: string;
  cantidad: string;
  fecha: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void | Promise<void>;
  initialInventarioId?: number | null;
};

const EMPTY_FORM: FormData = {
  inventario_hamaca_id: '',
  ubicacion_destino_id: '',
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

export default function TransferenciaModal({
  isOpen,
  onClose,
  onSuccess,
  initialInventarioId = null,
}: Props) {
  const [inventarios, setInventarios] = useState<Inventario[]>([]);
  const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([]);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    async function loadCatalogos() {
      try {
        const [inventariosRes, ubicacionesRes] = await Promise.all([
          apiFetch('/inventario-hamacas'),
          apiFetch('/ubicaciones'),
        ]);

        const inventariosData = await inventariosRes.json();
        const ubicacionesData = await ubicacionesRes.json();
        const availableInventarios = (inventariosData.data ?? []).filter(
          (inventario: Inventario) => Number(inventario.cantidad) > 0
        );

        setInventarios(availableInventarios);
        setUbicaciones(ubicacionesData.data ?? []);
        setError('');
        setForm({
          ...EMPTY_FORM,
          inventario_hamaca_id:
            initialInventarioId &&
            availableInventarios.some(
              (inventario: Inventario) => inventario.id === initialInventarioId
            )
              ? String(initialInventarioId)
              : '',
          fecha: new Date().toISOString().slice(0, 10),
        });
      } catch (err) {
        console.error(err);
        setError('No se pudieron cargar los datos del formulario.');
        toast.error('No se pudieron cargar los datos para reubicar.');
      }
    }

    loadCatalogos();
  }, [isOpen, initialInventarioId]);

  const selectedInventario = useMemo(() => {
    return inventarios.find((inventario) => inventario.id === Number(form.inventario_hamaca_id));
  }, [form.inventario_hamaca_id, inventarios]);

  const destinationOptions = useMemo(() => {
    return ubicaciones.filter(
      (ubicacion) => ubicacion.id !== selectedInventario?.ubicacion?.id
    );
  }, [selectedInventario?.ubicacion?.id, ubicaciones]);

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'inventario_hamaca_id' ? { ubicacion_destino_id: '' } : {}),
    }));

    setError('');
  }

  function validate() {
    if (!form.inventario_hamaca_id) return 'Seleccioná un producto del inventario.';
    if (!form.ubicacion_destino_id) return 'Seleccioná una ubicación destino.';
    if (!form.cantidad || Number(form.cantidad) < 1) return 'La cantidad debe ser mayor a 0.';
    if (!form.fecha) return 'Seleccioná una fecha.';

    if (!selectedInventario) return 'El inventario seleccionado no está disponible.';

    if (Number(form.cantidad) > Number(selectedInventario.cantidad)) {
      return `Solo hay ${selectedInventario.cantidad} unidades disponibles.`;
    }

    if (Number(form.ubicacion_destino_id) === selectedInventario.ubicacion?.id) {
      return 'La ubicación destino debe ser diferente a la ubicación actual.';
    }

    return '';
  }

  async function handleSubmit() {
    const validationError = validate();

    if (validationError) {
      setError(validationError);
      toast.error(validationError);
      return;
    }

    setLoading(true);

    try {
      const response = await apiFetch('/inventario/transferencias', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(
          buildTransferenciaPayload({
            inventarioHamacaId: Number(form.inventario_hamaca_id),
            ubicacionDestinoId: Number(form.ubicacion_destino_id),
            cantidad: Number(form.cantidad),
            fecha: form.fecha,
          })
        ),
      });

      const data = await response.json().catch(() => null);

      if (response.status === 409 || response.status === 422) {
        const message = getValidationMessage(data);
        setError(message);
        toast.error(message);
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      setForm({
        ...EMPTY_FORM,
        fecha: new Date().toISOString().slice(0, 10),
      });
      setError('');
      toast.success('Hamaca reubicada correctamente.');
      await onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      setError('No se pudo reubicar la hamaca. Verificá tu sesión, rol y stock.');
      toast.error('No se pudo reubicar la hamaca.');
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
          Reubicar hamaca
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
              name="ubicacion_destino_id"
              value={form.ubicacion_destino_id}
              onChange={handleChange}
              className="h-[46px] w-full border border-black bg-[#f7f7f7] px-4 text-base text-[#08264d] outline-none sm:px-7 sm:text-xl"
            >
              <option value="">Ubicación destino</option>
              {destinationOptions.map((ubicacion) => (
                <option key={ubicacion.id} value={ubicacion.id}>
                  {ubicacion.nombre}
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
                Ubicación actual: {selectedInventario.ubicacion?.nombre ?? 'Sin ubicación'}
                <br />
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
              <ArrowRightLeft className="h-5 w-5" />
              {loading ? 'Guardando' : 'Reubicar'}
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
