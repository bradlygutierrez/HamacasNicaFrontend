"use client";

import { apiFetch } from "@/app/_lib/api";
import { buildHamacaPayload } from "@/app/_lib/hamacas";
import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";

type Categoria = {
  id: number;
  nombre: string;
};

type Tamano = {
  id: number;
  nombre: string;
};

type Hamaca = {
  id: number;
  nombre: string;
  descripcion: string | null;
  categoria_id: number;
  tamano_id: number;
  precio: number | string;
};

type HamacaFormData = {
  nombre: string;
  descripcion: string;
  categoria_id: string;
  tamano_id: string;
  precio: string;
};

type FormErrors = Partial<Record<keyof HamacaFormData, string>>;

type Mode = "crear" | "editar";

type HamacaModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  hamacaToEdit?: Hamaca | null;
};

const EMPTY_FORM: HamacaFormData = {
  nombre: "",
  descripcion: "",
  categoria_id: "",
  tamano_id: "",
  precio: "",
};

export default function HamacaModal({
  isOpen,
  onClose,
  onSuccess,
  hamacaToEdit = null,
}: HamacaModalProps) {
  const [mode, setMode] = useState<Mode>(hamacaToEdit ? "editar" : "crear");

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [tamanos, setTamanos] = useState<Tamano[]>([]);
  const [hamacas, setHamacas] = useState<Hamaca[]>([]);

  const [selectedHamacaId, setSelectedHamacaId] = useState<string>(
    hamacaToEdit ? String(hamacaToEdit.id) : ""
  );

  const [form, setForm] = useState<HamacaFormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [generalError, setGeneralError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    async function loadCatalogos() {
      try {
        const [catRes, tamRes, hamRes] = await Promise.all([
          apiFetch("/categorias"),
          apiFetch("/tamanos"),
          apiFetch("/hamacas"),
        ]);

        const catData = await catRes.json();
        const tamData = await tamRes.json();
        const hamData = await hamRes.json();

        setCategorias(catData.data ?? []);
        setTamanos(tamData.data ?? []);
        setHamacas(hamData.data ?? []);
      } catch (err) {
        console.error("Error cargando catálogos:", err);
        setGeneralError("No se pudieron cargar los datos del formulario.");
      }
    }

    loadCatalogos();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    if (hamacaToEdit) {
      setMode("editar");
      setSelectedHamacaId(String(hamacaToEdit.id));
      fillForm(hamacaToEdit);
    } else {
      setMode("crear");
      setSelectedHamacaId("");
      setForm(EMPTY_FORM);
    }

    setErrors({});
    setGeneralError("");
  }, [hamacaToEdit, isOpen]);

  function fillForm(hamaca: Hamaca) {
    setForm({
      nombre: hamaca.nombre,
      descripcion: hamaca.descripcion ?? "",
      categoria_id: String(hamaca.categoria_id),
      tamano_id: String(hamaca.tamano_id),
      precio: String(hamaca.precio),
    });
  }

  function handleHamacaSelect(event: ChangeEvent<HTMLSelectElement>) {
    const id = event.target.value;

    setSelectedHamacaId(id);
    setErrors({});
    setGeneralError("");

    if (!id) {
      setForm(EMPTY_FORM);
      return;
    }

    const found = hamacas.find((hamaca) => String(hamaca.id) === id);

    if (found) {
      fillForm(found);
    }
  }

  function handleModeChange(newMode: Mode) {
    setMode(newMode);
    setForm(EMPTY_FORM);
    setSelectedHamacaId("");
    setErrors({});
    setGeneralError("");
  }

  function handleChange(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: undefined,
    }));

    setGeneralError("");
  }

  function validate(): boolean {
    const newErrors: FormErrors = {};

    if (!form.nombre.trim()) {
      newErrors.nombre = "El nombre es obligatorio.";
    } else if (form.nombre.trim().length > 100) {
      newErrors.nombre = "Máximo 100 caracteres.";
    }

    if (!form.categoria_id) {
      newErrors.categoria_id = "Selecciona una categoría.";
    }

    if (!form.tamano_id) {
      newErrors.tamano_id = "Selecciona un tamaño.";
    }

    const precio = Number.parseFloat(form.precio);

    if (!form.precio || Number.isNaN(precio) || precio < 0) {
      newErrors.precio = "Ingresa un precio válido.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  }

  function getValidationMessage(data: unknown): string {
    if (!data || typeof data !== "object") {
      return "Datos inválidos.";
    }

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
    if (!validate()) return;

    if (mode === "editar" && !selectedHamacaId) {
      setGeneralError("Selecciona un modelo para editar.");
      return;
    }

    setLoading(true);
    setGeneralError("");

    const payload = buildHamacaPayload({
      nombre: form.nombre,
      descripcion: form.descripcion,
      categoriaId: Number.parseInt(form.categoria_id),
      tamanoId: Number.parseInt(form.tamano_id),
      precio: Number.parseFloat(form.precio),
    });

    try {
      const response =
        mode === "crear"
          ? await apiFetch("/hamacas", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            })
          : await apiFetch(`/hamacas/${selectedHamacaId}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });

      const data = await response.json().catch(() => null);

      if (response.status === 422) {
        const serverErrors: FormErrors = {};

        if (data?.errors) {
          Object.entries(data.errors).forEach(([key, msgs]) => {
            serverErrors[key as keyof HamacaFormData] = (msgs as string[])[0];
          });
        }

        setErrors(serverErrors);
        setGeneralError(getValidationMessage(data));
        return;
      }

      if (!response.ok) {
        throw new Error(data?.message ?? `HTTP ${response.status}`);
      }

      setForm(EMPTY_FORM);
      setSelectedHamacaId("");
      setErrors({});
      setGeneralError("");

      onSuccess();
      onClose();
    } catch (err) {
      console.error("Error guardando modelo:", err);
      setGeneralError("Ocurrió un error al guardar. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (mode !== "editar" || !selectedHamacaId) {
      setGeneralError("Selecciona un modelo para eliminar.");
      return;
    }

    const selectedModel = hamacas.find(
      (hamaca) => String(hamaca.id) === selectedHamacaId
    );

    const confirmed = window.confirm(
      `¿Seguro que querés eliminar el modelo "${
        selectedModel?.nombre ?? selectedHamacaId
      }"? Esto lo ocultará del sistema, pero no borrará el historial.`
    );

    if (!confirmed) return;

    setLoading(true);
    setGeneralError("");

    try {
      const response = await apiFetch(`/hamacas/${selectedHamacaId}`, {
        method: "DELETE",
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message ?? `HTTP ${response.status}`);
      }

      setForm(EMPTY_FORM);
      setSelectedHamacaId("");
      setErrors({});
      setGeneralError("");

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error eliminando modelo:", error);
      setGeneralError("No se pudo eliminar el modelo.");
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setForm(EMPTY_FORM);
    setErrors({});
    setGeneralError("");

    if (mode === "editar") {
      setSelectedHamacaId("");
    }
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[14px] bg-[#f0f4f8] shadow-xl">
        <div className="flex items-center justify-between bg-[#1a3a5c] px-6 py-4">
          <h2 className="text-[17px] font-medium text-white">
            {mode === "crear" ? "Agregar modelo" : "Editar modelo"}
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="text-white/70 transition-colors hover:text-white"
            aria-label="Cerrar modal"
          >
            ✕
          </button>
        </div>

        <div className="flex gap-2 px-6 pt-4">
          <button
            type="button"
            onClick={() => handleModeChange("crear")}
            className={`rounded-full border px-4 py-1 text-sm font-medium transition-all ${
              mode === "crear"
                ? "border-[#1a3a5c] bg-[#1a3a5c] text-white"
                : "border-[#1a3a5c]/30 bg-transparent text-[#4a6a8a] hover:bg-[#1a3a5c]/10"
            }`}
          >
            Crear
          </button>

          <button
            type="button"
            onClick={() => handleModeChange("editar")}
            className={`rounded-full border px-4 py-1 text-sm font-medium transition-all ${
              mode === "editar"
                ? "border-[#1a3a5c] bg-[#1a3a5c] text-white"
                : "border-[#1a3a5c]/30 bg-transparent text-[#4a6a8a] hover:bg-[#1a3a5c]/10"
            }`}
          >
            Editar
          </button>
        </div>

        <div className="flex flex-col gap-4 px-6 py-5">
          {mode === "editar" ? (
            <div className="rounded-lg border border-[#1a3a5c]/15 bg-[#1a3a5c]/[0.06] p-3">
              <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-[#1a3a5c]">
                Modelo a editar
              </p>

              <select
                value={selectedHamacaId}
                onChange={handleHamacaSelect}
                className="w-full rounded-md border border-[#1a3a5c]/25 bg-white px-3 py-2 text-sm text-[#1a3a5c] focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]/20"
              >
                <option value="">Seleccionar modelo...</option>
                {hamacas.map((hamaca) => (
                  <option key={hamaca.id} value={hamaca.id}>
                    {hamaca.nombre}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-medium uppercase tracking-wider text-[#1a3a5c]">
              Nombre <span className="text-red-500">*</span>
            </label>

            <input
              type="text"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              placeholder="Ej: Hamaca Matrimonial"
              maxLength={100}
              className={`rounded-md border bg-white px-3 py-2 text-sm text-[#1a3a5c] placeholder-[#9ab]/60 focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]/20 ${
                errors.nombre ? "border-red-400" : "border-[#1a3a5c]/25"
              }`}
            />

            {errors.nombre ? (
              <span className="text-[11px] text-red-600">
                {errors.nombre}
              </span>
            ) : null}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-medium uppercase tracking-wider text-[#1a3a5c]">
              Descripción
            </label>

            <textarea
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              placeholder="Descripción opcional del modelo"
              rows={3}
              className="resize-y rounded-md border border-[#1a3a5c]/25 bg-white px-3 py-2 text-sm text-[#1a3a5c] placeholder-[#9ab]/60 focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]/20"
            />
          </div>

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
                  errors.categoria_id
                    ? "border-red-400"
                    : "border-[#1a3a5c]/25"
                }`}
              >
                <option value="">Seleccionar...</option>
                {categorias.map((categoria) => (
                  <option key={categoria.id} value={categoria.id}>
                    {categoria.nombre}
                  </option>
                ))}
              </select>

              {errors.categoria_id ? (
                <span className="text-[11px] text-red-600">
                  {errors.categoria_id}
                </span>
              ) : null}
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
                  errors.tamano_id ? "border-red-400" : "border-[#1a3a5c]/25"
                }`}
              >
                <option value="">Seleccionar...</option>
                {tamanos.map((tamano) => (
                  <option key={tamano.id} value={tamano.id}>
                    {tamano.nombre}
                  </option>
                ))}
              </select>

              {errors.tamano_id ? (
                <span className="text-[11px] text-red-600">
                  {errors.tamano_id}
                </span>
              ) : null}
            </div>
          </div>

          <div className="flex max-w-[200px] flex-col gap-1">
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
                  errors.precio ? "border-red-400" : "border-[#1a3a5c]/25"
                }`}
              />
            </div>

            {errors.precio ? (
              <span className="text-[11px] text-red-600">
                {errors.precio}
              </span>
            ) : null}
          </div>

          {generalError ? (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
              {generalError}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap justify-end gap-2 border-t border-[#1a3a5c]/12 bg-[#e8edf3] px-6 py-4">
          {mode === "editar" && selectedHamacaId ? (
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="mr-auto rounded-[7px] bg-red-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-800 disabled:opacity-50"
            >
              Eliminar modelo
            </button>
          ) : null}

          <button
            type="button"
            onClick={handleReset}
            disabled={loading}
            className="flex items-center gap-2 rounded-[7px] border border-[#1a3a5c]/30 bg-transparent px-4 py-2 text-sm font-medium text-[#1a3a5c] transition hover:bg-[#1a3a5c]/10 disabled:opacity-50"
          >
            Limpiar
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 rounded-[7px] bg-[#1a3a5c] px-5 py-2 text-sm font-medium text-white transition hover:bg-[#143050] disabled:cursor-not-allowed disabled:bg-[#6a8aaa]"
          >
            {loading ? (
              <>
                <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Guardando...
              </>
            ) : mode === "crear" ? (
              "Crear modelo"
            ) : (
              "Guardar cambios"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}