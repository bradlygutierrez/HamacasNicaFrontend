"use client";

import { apiFetch } from "@/app/_lib/api";
import { buildHamacaPayload, suggestHamacaName } from "@/app/_lib/hamacas";
import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import { toast } from "react-toastify";

type Categoria = {
  id: number;
  nombre: string;
};

type Tamano = {
  id: number;
  nombre: string;
};

type Color = { id: number; nombre: string };

type Hamaca = {
  id: number;
  nombre: string;
  descripcion: string | null;
  categoria_id: number;
  tamano_id: number;
  precio: number | string;
  colores?: Color[];
};

type HamacaFormData = {
  nombre: string;
  descripcion: string;
  categoria_id: string;
  tamano_id: string;
  precio: string;
};

type FormErrors = Partial<Record<keyof HamacaFormData | "color_ids", string>>;

type Mode = "crear" | "editar";

type HamacaModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (createdHamacaId?: number) => void;
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
  const [colores, setColores] = useState<Color[]>([]);
  const [hamacas, setHamacas] = useState<Hamaca[]>([]);

  const [selectedHamacaId, setSelectedHamacaId] = useState<string>(
    hamacaToEdit ? String(hamacaToEdit.id) : ""
  );

  const [form, setForm] = useState<HamacaFormData>(EMPTY_FORM);
  const [selectedColorIds, setSelectedColorIds] = useState<number[]>([]);
  const [nameWasEdited, setNameWasEdited] = useState(false);
  const [photoRoutes, setPhotoRoutes] = useState<string[]>([]);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [generalError, setGeneralError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    async function loadCatalogos() {
      try {
        const [catRes, tamRes, hamRes, colorRes] = await Promise.all([
          apiFetch("/categorias"),
          apiFetch("/tamanos"),
          apiFetch("/hamacas"),
          apiFetch("/colores"),
        ]);

        const catData = await catRes.json();
        const tamData = await tamRes.json();
        const hamData = await hamRes.json();
        const colorData = await colorRes.json();

        setCategorias(catData.data ?? []);
        setTamanos(tamData.data ?? []);
        setHamacas(hamData.data ?? []);
        setColores(colorData.data ?? []);
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
      setSelectedColorIds([]);
      setNameWasEdited(false);
      setPhotoRoutes([]);
      setPhotoFiles([]);
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
    setSelectedColorIds((hamaca.colores ?? []).map((color) => color.id));
    setNameWasEdited(true);
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
    setSelectedColorIds([]);
    setPhotoRoutes([]);
    setPhotoFiles([]);
    setNameWasEdited(false);
  }

  function handleChange(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (name === "nombre") setNameWasEdited(true);

    setErrors((prev) => ({
      ...prev,
      [name]: undefined,
    }));

    setGeneralError("");
  }

  const suggestedName = suggestHamacaName(
    categorias.find((item) => String(item.id) === form.categoria_id)?.nombre ?? "",
    tamanos.find((item) => String(item.id) === form.tamano_id)?.nombre ?? "",
    selectedColorIds.map((id) => colores.find((item) => item.id === id)?.nombre ?? "")
  );

  useEffect(() => {
    if (mode !== "crear" || nameWasEdited) return;
    setForm((current) => ({ ...current, nombre: suggestedName }));
  }, [mode, nameWasEdited, suggestedName]);

  function toggleColor(colorId: number) {
    setSelectedColorIds((current) => current.includes(colorId)
      ? current.filter((id) => id !== colorId)
      : [...current, colorId]);
  }

  function validate(): boolean {
    const newErrors: FormErrors = {};
    const name = form.nombre.trim() || suggestedName.trim();

    if (!name) {
      newErrors.nombre = "El nombre es obligatorio.";
    } else if (name.length > 150) {
      newErrors.nombre = "Máximo 100 caracteres.";
    }

    if (!form.categoria_id) {
      newErrors.categoria_id = "Selecciona una categoría.";
    }

    if (!form.tamano_id) {
      newErrors.tamano_id = "Selecciona un tamaño.";
    }
    if (selectedColorIds.length < 1) newErrors.color_ids = "Selecciona al menos un color.";

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
      setGeneralError("Selecciona un hamaca para editar.");
      toast.error("Selecciona un hamaca para editar.");
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
      colorIds: selectedColorIds,
      suggestedName,
    });
    const requestBody = new FormData();
    requestBody.append("nombre", payload.nombre);
    requestBody.append("descripcion", payload.descripcion ?? "");
    requestBody.append("categoria_id", String(payload.categoria_id));
    requestBody.append("tamano_id", String(payload.tamano_id));
    requestBody.append("precio", String(payload.precio));
    selectedColorIds.forEach((colorId) => requestBody.append("color_ids[]", String(colorId)));
    photoRoutes.map((route) => route.trim()).filter(Boolean).forEach((route) => requestBody.append("rutas[]", route));
    photoFiles.forEach((file) => requestBody.append("fotos[]", file));
    if (mode === "editar") requestBody.append("_method", "PUT");

    try {
      const response =
        mode === "crear"
          ? await apiFetch("/hamacas", {
              method: "POST",
              body: requestBody,
            })
          : await apiFetch(`/hamacas/${selectedHamacaId}`, {
              method: "POST",
              body: requestBody,
            });

      const data = await response.json().catch(() => null);

      if (response.status === 422) {
        const serverErrors: FormErrors = {};

        if (data?.errors) {
          Object.entries(data.errors).forEach(([key, msgs]) => {
            serverErrors[key as keyof HamacaFormData | "color_ids"] = (msgs as string[])[0];
          });
        }

        setErrors(serverErrors);
        setGeneralError(getValidationMessage(data));
        toast.error(getValidationMessage(data));
        return;
      }

      if (!response.ok) {
        throw new Error(data?.message ?? `HTTP ${response.status}`);
      }

      setForm(EMPTY_FORM);
      setSelectedHamacaId("");
      setSelectedColorIds([]);
      setPhotoFiles([]);
      setPhotoRoutes([]);
      setErrors({});
      setGeneralError("");

      toast.success(
        mode === "crear"
          ? "Hamaca creado correctamente."
          : "Hamaca actualizado correctamente."
      );
      onSuccess(mode === "crear" ? Number(data?.data?.id) : undefined);
      onClose();
    } catch (err) {
      console.error("Error guardando hamaca:", err);
      setGeneralError("Ocurrió un error al guardar. Intenta de nuevo.");
      toast.error("Ocurrió un error al guardar. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (mode !== "editar" || !selectedHamacaId) {
      setGeneralError("Selecciona un hamaca para eliminar.");
      toast.error("Selecciona un hamaca para eliminar.");
      return;
    }

    const selectedModel = hamacas.find(
      (hamaca) => String(hamaca.id) === selectedHamacaId
    );

    const confirmed = window.confirm(
      `¿Seguro que querés eliminar el hamaca "${
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

      toast.success("Hamaca eliminado correctamente.");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error eliminando hamaca:", error);
      setGeneralError("No se pudo eliminar el hamaca.");
      toast.error("No se pudo eliminar el hamaca.");
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
            {mode === "crear" ? "Nueva hamaca" : "Editar hamaca"}
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
                Hamaca a editar
              </p>

              <select
                value={selectedHamacaId}
                onChange={handleHamacaSelect}
                className="w-full rounded-md border border-[#1a3a5c]/25 bg-white px-3 py-2 text-sm text-[#1a3a5c] focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]/20"
              >
                <option value="">Seleccionar hamaca...</option>
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
              placeholder="Ej: Hamaca con palo Familiar - Azul / Blanco"
              maxLength={150}
              className={`rounded-md border bg-white px-3 py-2 text-sm text-[#1a3a5c] placeholder-[#9ab]/60 focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]/20 ${
                errors.nombre ? "border-red-400" : "border-[#1a3a5c]/25"
              }`}
            />

            <div className="flex justify-end">
              <button type="button" onClick={() => { setNameWasEdited(false); setForm((current) => ({ ...current, nombre: suggestedName })); }} className="text-xs font-semibold text-[#123852] underline">Usar nombre sugerido</button>
            </div>

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
              placeholder="Descripción opcional del hamaca"
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

          <fieldset>
            <legend className="mb-2 text-[11px] font-medium uppercase tracking-wider text-[#1a3a5c]">Colores *</legend>
            <div className="flex flex-wrap gap-2">
              {colores.map((color) => <label key={color.id} className="flex items-center gap-1 rounded border bg-white px-2 py-1 text-sm"><input type="checkbox" checked={selectedColorIds.includes(color.id)} onChange={() => toggleColor(color.id)} />{color.nombre}</label>)}
            </div>
            {selectedColorIds.length === 0 ? <p className="mt-1 text-xs text-red-700">Selecciona al menos un color.</p> : null}
            {errors.color_ids ? <p role="alert" className="mt-1 text-xs text-red-700">{errors.color_ids}</p> : null}
            <p className="mt-2 text-xs text-slate-600">Nombre sugerido: {suggestedName || "Seleccioná categoría, tamaño y colores"}</p>
          </fieldset>

          <fieldset className="space-y-2">
            <legend className="text-[11px] font-medium uppercase tracking-wider text-[#1a3a5c]">Fotos</legend>
            <input aria-label="Subir fotos de hamaca" type="file" accept="image/*" multiple onChange={(event) => setPhotoFiles((current) => [...current, ...Array.from(event.target.files ?? [])])} className="block w-full text-sm" />
            <textarea aria-label="Rutas de fotos" value={photoRoutes.join("\n")} onChange={(event) => setPhotoRoutes(event.target.value.split("\n"))} placeholder="Rutas de fotos, una por línea" className="w-full rounded border bg-white p-2 text-sm" />
            {photoFiles.length ? <p className="text-xs">{photoFiles.length} foto(s) seleccionada(s)</p> : null}
          </fieldset>

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
              Eliminar hamaca
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
              "Crear hamaca"
            ) : (
              "Guardar cambios"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
