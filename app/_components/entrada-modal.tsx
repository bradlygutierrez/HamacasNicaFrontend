"use client";

import { apiFetch } from "@/app/_lib/api";
import {
  buildEntradaInventarioPayload,
  buildEntradaMovimientoPayload,
} from "@/app/_lib/entradas";
import { X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type Color = {
  id: number;
  nombre: string;
};

type Hamaca = {
  id: number;
  nombre: string;
  precio: string | number;
};

type Variante = {
  id: number;
  nombre: string | null;
  hamaca_id: number;
  hamaca?: Hamaca | null;
  colores: Color[];
  fotos?: Array<{ id: number; ruta: string }>;
};

type Usuario = {
  id: number;
  nombre: string;
};

type Ubicacion = {
  id: number;
  nombre: string;
};

type FormData = {
  hamaca_variante_id: string;
  usuario_id: string;
  cantidad: string;
  fecha: string;
  ubicacion_id: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

const EMPTY_FORM: FormData = {
  hamaca_variante_id: "",
  usuario_id: "",
  cantidad: "",
  fecha: new Date().toISOString().slice(0, 10),
  ubicacion_id: "",
};

export default function EntradaModal({ isOpen, onClose, onSuccess }: Props) {
  const [variantes, setVariantes] = useState<Variante[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([]);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    async function loadCatalogos() {
      try {
        const [variantesRes, ubicacionesRes, meRes] = await Promise.all([
          apiFetch("/hamaca-variantes"),
          apiFetch("/ubicaciones"),
          apiFetch("/me"),
        ]);

        const variantesData = await variantesRes.json();
        const ubicacionesData = await ubicacionesRes.json();
        const meData = await meRes.json();

        setVariantes(variantesData.data ?? []);
        setUbicaciones(ubicacionesData.data ?? []);

        let loadedUsers: Usuario[] = [];

        try {
          const usuariosRes = await apiFetch("/usuarios");

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
        setError("No se pudieron cargar los datos del formulario.");
      }
    }

    setError("");
    setSearchTerm("");
    loadCatalogos();
  }, [isOpen]);

  const filteredVariantes = useMemo(() => {
    const query = searchTerm.toLowerCase().trim();

    if (!query) return variantes;

    return variantes.filter((variante) => {
      const text = `
        ${variante.hamaca?.nombre ?? ""}
        ${variante.nombre ?? ""}
        ${variante.colores.map((color) => color.nombre).join(" ")}
      `.toLowerCase();

      return text.includes(query);
    });
  }, [searchTerm, variantes]);

  if (!isOpen) return null;

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  }

  function validate() {
    if (!form.hamaca_variante_id) return "Selecciona una variante.";
    if (!form.usuario_id) return "Selecciona un usuario.";
    if (!form.cantidad || Number(form.cantidad) < 1)
      return "La cantidad debe ser mayor a 0.";
    if (!form.fecha) return "Selecciona una fecha.";
    if (!form.ubicacion_id) return "Selecciona una ubicación.";

    return "";
  }

  function getValidationMessage(data: unknown) {
    if (!data || typeof data !== "object") return "Datos inválidos.";

    const payload = data as {
      message?: unknown;
      errors?: Record<string, string[]>;
    };

    const firstError = payload.errors
      ? Object.values(payload.errors).flat()[0]
      : payload.message;

    return String(firstError ?? "Datos inválidos.");
  }

  async function handleSubmit() {
    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const response = await apiFetch("/inventario-hamacas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          buildEntradaInventarioPayload({
            hamacaVarianteId: Number(form.hamaca_variante_id),
            usuarioId: Number(form.usuario_id),
            ubicacionId: Number(form.ubicacion_id),
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
        throw new Error("La API no devolvió el inventario creado.");
      }

      const movimientoResponse = await apiFetch("/movimientos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

      setError("");
      await onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      setError("No se pudo registrar la entrada. Verifica tu sesión y rol.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-3xl overflow-hidden rounded-[14px] bg-[#f0f4f8] shadow-xl">
        <div className="flex items-center justify-between bg-[#1a3a5c] px-6 py-4">
          <h2 className="text-[18px] font-semibold text-white">
            Agregar Entrada
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="text-white/70 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid max-h-[80vh] gap-4 overflow-y-auto px-6 py-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-[#1a3a5c]">
              Buscar variante
            </label>

            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Buscar por hamaca o color"
              className="w-full rounded-md border border-[#1a3a5c]/25 bg-white px-3 py-2 text-sm text-[#1a3a5c] outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-[#1a3a5c]">
              Variante <span className="text-red-500">*</span>
            </label>

            <select
              name="hamaca_variante_id"
              value={form.hamaca_variante_id}
              onChange={handleChange}
              className="w-full rounded-md border border-[#1a3a5c]/25 bg-white px-3 py-2 text-sm text-[#1a3a5c] outline-none"
            >
              <option value="">Seleccionar variante...</option>

              {filteredVariantes.map((variante) => (
                <option key={variante.id} value={variante.id}>
                  {variante.hamaca?.nombre ?? "Hamaca"} -{" "}
                  {variante.colores.length > 0
                    ? variante.colores.map((color) => color.nombre).join(", ")
                    : "Sin colores"}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-[#1a3a5c]">
              Usuario <span className="text-red-500">*</span>
            </label>

            <select
              name="usuario_id"
              value={form.usuario_id}
              onChange={handleChange}
              className="w-full rounded-md border border-[#1a3a5c]/25 bg-white px-3 py-2 text-sm text-[#1a3a5c] outline-none"
            >
              <option value="">Seleccionar usuario...</option>
              {usuarios.map((usuario) => (
                <option key={usuario.id} value={usuario.id}>
                  {usuario.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-[#1a3a5c]">
              Ubicación <span className="text-red-500">*</span>
            </label>

            <select
              name="ubicacion_id"
              value={form.ubicacion_id}
              onChange={handleChange}
              className="w-full rounded-md border border-[#1a3a5c]/25 bg-white px-3 py-2 text-sm text-[#1a3a5c] outline-none"
            >
              <option value="">Seleccionar ubicación...</option>
              {ubicaciones.map((ubicacion) => (
                <option key={ubicacion.id} value={ubicacion.id}>
                  {ubicacion.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-[#1a3a5c]">
              Cantidad <span className="text-red-500">*</span>
            </label>

            <input
              type="number"
              name="cantidad"
              value={form.cantidad}
              onChange={handleChange}
              min={1}
              className="w-full rounded-md border border-[#1a3a5c]/25 bg-white px-3 py-2 text-sm text-[#1a3a5c] outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-[#1a3a5c]">
              Fecha <span className="text-red-500">*</span>
            </label>

            <input
              type="date"
              name="fecha"
              value={form.fecha}
              onChange={handleChange}
              className="w-full rounded-md border border-[#1a3a5c]/25 bg-white px-3 py-2 text-sm text-[#1a3a5c] outline-none"
            />
          </div>

          {error ? (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 md:col-span-2">
              {error}
            </p>
          ) : null}
        </div>

        <div className="flex justify-end gap-2 border-t border-[#1a3a5c]/12 bg-[#e8edf3] px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-[7px] border border-[#1a3a5c]/30 px-4 py-2 text-sm font-semibold text-[#1a3a5c]"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="rounded-[7px] bg-[#1a3a5c] px-5 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {loading ? "Guardando..." : "Agregar entrada"}
          </button>
        </div>
      </div>
    </div>
  );
}