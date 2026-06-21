"use client";

import { apiFetch } from "@/app/_lib/api";
import { Plus, Trash, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type Hamaca = {
  id: number;
  nombre: string;
  precio: string | number;
};

type Color = {
  id: number;
  nombre: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

const EMPTY_ROUTES = [""];

export default function VarianteModal({ isOpen, onClose, onSuccess }: Props) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [hamacas, setHamacas] = useState<Hamaca[]>([]);
  const [colores, setColores] = useState<Color[]>([]);

  const [hamacaId, setHamacaId] = useState("");
  const [nombre, setNombre] = useState("");
  const [selectedColorIds, setSelectedColorIds] = useState<string[]>([]);

  const [photoRoutes, setPhotoRoutes] = useState<string[]>([...EMPTY_ROUTES]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    async function loadData() {
      try {
        const [hamacasRes, coloresRes] = await Promise.all([
          apiFetch("/hamacas"),
          apiFetch("/colores"),
        ]);

        const hamacasData = await hamacasRes.json();
        const coloresData = await coloresRes.json();

        setHamacas(hamacasData.data ?? []);
        setColores(coloresData.data ?? []);
      } catch (err) {
        console.error("Error cargando datos de variante:", err);
        setError("No se pudieron cargar los datos.");
      }
    }

    setHamacaId("");
    setNombre("");
    setSelectedColorIds([]);
    setPhotoRoutes([...EMPTY_ROUTES]);
    setSelectedFiles([]);
    setDragActive(false);
    setError("");

    loadData();
  }, [isOpen]);

  if (!isOpen) return null;

  function toggleColor(colorId: number) {
    const value = String(colorId);

    setSelectedColorIds((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    );

    setError("");
  }

  function addFiles(files: FileList | File[]) {
    const imageFiles = Array.from(files).filter((file) =>
      file.type.startsWith("image/")
    );

    setSelectedFiles((prev) => [...prev, ...imageFiles]);
    setError("");
  }

  function handleFileInput(event: React.ChangeEvent<HTMLInputElement>) {
    if (event.target.files) {
      addFiles(event.target.files);
    }

    event.target.value = "";
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragActive(false);

    if (event.dataTransfer.files) {
      addFiles(event.dataTransfer.files);
    }
  }

  function removeSelectedFile(index: number) {
    setSelectedFiles((prev) =>
      prev.filter((_, fileIndex) => fileIndex !== index)
    );
  }

  function handleRouteChange(index: number, value: string) {
    setPhotoRoutes((prev) =>
      prev.map((route, routeIndex) => (routeIndex === index ? value : route))
    );
  }

  function addRouteInput() {
    setPhotoRoutes((prev) => [...prev, ""]);
  }

  function removeRouteInput(index: number) {
    setPhotoRoutes((prev) => {
      const next = prev.filter((_, routeIndex) => routeIndex !== index);
      return next.length > 0 ? next : [...EMPTY_ROUTES];
    });
  }

  async function handleSubmit() {
    if (!hamacaId) {
      setError("Selecciona un modelo base.");
      return;
    }

    if (selectedColorIds.length === 0) {
      setError("Selecciona al menos un color.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();

      formData.append("hamaca_id", hamacaId);

      if (nombre.trim()) {
        formData.append("nombre", nombre.trim());
      }

      selectedColorIds.forEach((colorId) => {
        formData.append("color_ids[]", colorId);
      });

      photoRoutes
        .map((route) => route.trim())
        .filter(Boolean)
        .forEach((route) => {
          formData.append("rutas[]", route);
        });

      selectedFiles.forEach((file) => {
        formData.append("fotos[]", file);
      });

      const response = await apiFetch("/hamaca-variantes", {
        method: "POST",
        body: formData,
      });

      const data = await response.json().catch(() => null);

      if (response.status === 422) {
        const firstError = data?.errors
          ? Object.values(data.errors).flat()[0]
          : data?.message;

        setError(String(firstError ?? "Datos inválidos."));
        return;
      }

      if (!response.ok) {
        throw new Error(data?.message ?? `HTTP ${response.status}`);
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error("Error creando variante:", err);
      setError("No se pudo crear la variante.");
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
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[14px] bg-[#f0f4f8] shadow-xl">
        <div className="flex items-center justify-between bg-[#1a3a5c] px-6 py-4">
          <h2 className="text-[18px] font-semibold text-white">
            Agregar variante
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="text-white/70 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="space-y-5 px-6 py-5">
          <section className="space-y-3">
            <div>
              <label className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-[#1a3a5c]">
                Modelo base <span className="text-red-500">*</span>
              </label>

              <select
                value={hamacaId}
                onChange={(event) => setHamacaId(event.target.value)}
                className="w-full rounded-md border border-[#1a3a5c]/25 bg-white px-3 py-2 text-sm text-[#1a3a5c] outline-none"
              >
                <option value="">Seleccionar modelo...</option>
                {hamacas.map((hamaca) => (
                  <option key={hamaca.id} value={hamaca.id}>
                    {hamaca.nombre} - C$ {hamaca.precio}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-medium uppercase tracking-wider text-[#1a3a5c]">
                Nombre opcional
              </label>

              <input
                type="text"
                value={nombre}
                onChange={(event) => setNombre(event.target.value)}
                placeholder="Ej: Rojo con Verde"
                className="w-full rounded-md border border-[#1a3a5c]/25 bg-white px-3 py-2 text-sm text-[#1a3a5c] outline-none"
              />
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-[#1a3a5c]">
              Colores <span className="text-red-500">*</span>
            </h3>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {colores.map((color) => {
                const selected = selectedColorIds.includes(String(color.id));

                return (
                  <button
                    key={color.id}
                    type="button"
                    onClick={() => toggleColor(color.id)}
                    className={`rounded-md border px-3 py-2 text-sm font-semibold ${
                      selected
                        ? "border-[#1a3a5c] bg-[#1a3a5c] text-white"
                        : "border-[#1a3a5c]/25 bg-white text-[#1a3a5c]"
                    }`}
                  >
                    {color.nombre}
                  </button>
                );
              })}
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-[#1a3a5c]">
              Fotos de la variante
            </h3>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileInput}
            />

            <div
              onDragOver={(event) => {
                event.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`flex cursor-pointer flex-col items-center justify-center rounded-[10px] border-2 border-dashed p-6 text-center transition ${
                dragActive
                  ? "border-[#1a3a5c] bg-[#1a3a5c]/10"
                  : "border-[#1a3a5c]/30 bg-white"
              }`}
            >
              <Upload className="mb-2 h-10 w-10 text-[#1a3a5c]" />
              <p className="font-semibold text-[#1a3a5c]">
                Arrastra fotos aquí o toca para abrir la galería
              </p>
              <p className="mt-1 text-sm text-[#4a6a8a]">
                En celular abre la galería. En PC permite seleccionar archivos.
              </p>
            </div>

            {selectedFiles.length > 0 ? (
              <div className="mt-3 space-y-2">
                {selectedFiles.map((file, index) => (
                  <div
                    key={`${file.name}-${index}`}
                    className="flex items-center justify-between rounded-md bg-white px-3 py-2 text-sm text-[#1a3a5c]"
                  >
                    <span className="truncate">{file.name}</span>

                    <button
                      type="button"
                      onClick={() => removeSelectedFile(index)}
                      className="ml-3 font-semibold text-red-600"
                    >
                      Quitar
                    </button>
                  </div>
                ))}
              </div>
            ) : null}
          </section>

          <section>
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wide text-[#1a3a5c]">
                  Rutas manuales
                </h3>
                <p className="text-xs text-[#4a6a8a]">
                  Opcional, para imágenes ya existentes.
                </p>
              </div>

              <button
                type="button"
                onClick={addRouteInput}
                className="flex items-center gap-2 rounded-[7px] bg-[#1a3a5c] px-3 py-2 text-xs font-semibold text-white"
              >
                <Plus className="h-4 w-4" />
                Agregar
              </button>
            </div>

            <div className="space-y-2">
              {photoRoutes.map((route, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={route}
                    onChange={(event) =>
                      handleRouteChange(index, event.target.value)
                    }
                    placeholder="fotos/hamaca-roja.jpg o https://..."
                    className="min-w-0 flex-1 rounded-md border border-[#1a3a5c]/25 bg-white px-3 py-2 text-sm text-[#1a3a5c] outline-none"
                  />

                  <button
                    type="button"
                    onClick={() => removeRouteInput(index)}
                    className="rounded-md border border-[#1a3a5c]/25 px-3 text-[#1a3a5c]"
                  >
                    <Trash className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {error ? (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
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
            {loading ? "Guardando..." : "Crear variante"}
          </button>
        </div>
      </div>
    </div>
  );
}