"use client";

import { apiFetch } from "@/app/_lib/api";
import { todayLocalDate } from "@/app/_lib/date";
import { buildEntradaPayload } from "@/app/_lib/entradas";
import { X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type Color = {
  id: number;
  nombre: string;
};

type ProductoHamaca = {
  id: number;
  nombre: string | null;
  precio: string | number;
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
  hamaca_id: string;
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
  hamaca_id: "",
  usuario_id: "",
  cantidad: "",
  fecha: todayLocalDate(),
  ubicacion_id: "",
};

export default function EntradaModal({ isOpen, onClose, onSuccess }: Props) {
  const [hamacas, setHamacas] = useState<ProductoHamaca[]>([]);
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
        const [hamacasRes, ubicacionesRes, meRes] = await Promise.all([
          apiFetch("/hamacas?per_page=100"),
          apiFetch("/ubicaciones"),
          apiFetch("/me"),
        ]);

        const hamacasData = await hamacasRes.json();
        const ubicacionesData = await ubicacionesRes.json();
        const meData = await meRes.json();

        setHamacas(hamacasData.data ?? []);
        setUbicaciones(ubicacionesData.data ?? []);

        let loadedUsers: Usuario[] = [];

        try {
          const usuariosRes = await apiFetch("/usuarios/propietarios");
          const usuariosData = await usuariosRes.json().catch(() => null);

          if (!usuariosRes.ok) {
            throw new Error(usuariosData?.message ?? "No se pudieron cargar los propietarios.");
          }

          loadedUsers = Array.isArray(usuariosData?.data) ? usuariosData.data : [];
        } catch {
          loadedUsers = [];
        }

        setUsuarios(loadedUsers);

        if (meData.data) {
          const currentUserIsOwner = loadedUsers.some(
            (usuario) => usuario.id === meData.data.id
          );

          setForm((prev) => ({
            ...prev,
            usuario_id: currentUserIsOwner ? String(meData.data.id) : "",
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

  const filteredHamacas = useMemo(() => {
    const query = searchTerm.toLowerCase().trim();

    if (!query) return hamacas;

    return hamacas.filter((hamaca) => {
      const text = `${hamaca.nombre ?? ""} ${hamaca.colores.map((color) => color.nombre).join(" ")}`.toLowerCase();

      return text.includes(query);
    });
  }, [searchTerm, hamacas]);

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
    if (!form.hamaca_id) return "Selecciona una hamaca.";
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
      const response = await apiFetch("/inventario/entradas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          buildEntradaPayload({
            hamacaId: Number(form.hamaca_id),
            usuarioId: Number(form.usuario_id),
            ubicacionId: Number(form.ubicacion_id),
            cantidad: Number(form.cantidad),
            fecha: form.fecha,
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
        fecha: todayLocalDate(),
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
              Buscar hamaca
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
              Producto <span className="text-red-500">*</span>
            </label>

            <select
              name="hamaca_id"
              value={form.hamaca_id}
              onChange={handleChange}
              className="w-full rounded-md border border-[#1a3a5c]/25 bg-white px-3 py-2 text-sm text-[#1a3a5c] outline-none"
            >
              <option value="">Seleccionar hamaca...</option>

              {filteredHamacas.map((hamaca) => (
                <option key={hamaca.id} value={hamaca.id}>
                  {hamaca.nombre} · {hamaca.colores.map((color) => color.nombre).join(" / ") || "Sin colores"}
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
