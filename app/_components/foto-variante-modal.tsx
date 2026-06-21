"use client";

import { apiFetch } from "@/app/_lib/api";
import {
  buildVarianteFotoPayload,
  normalizePhotoRoutes,
} from "@/app/_lib/hamacas";
import { Camera, Copy, Download, Plus, Trash, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type Foto = {
  id: number;
  ruta: string;
};

type FotoVarianteModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  hamacaNombre: string;
  varianteId: number | null;
  initialFotos?: Foto[];
};

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://127.0.0.1:8000";

function imageUrl(path?: string) {
  if (!path) return "";

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  if (path.startsWith("/storage/")) {
    return `${BACKEND_URL}${path}`;
  }

  return `${BACKEND_URL}/storage/${path}`;
}

function openImage(url: string) {
  const link = document.createElement("a");

  link.href = url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";

  document.body.appendChild(link);
  link.click();
  link.remove();
}

export default function FotoVarianteModal({
  isOpen,
  onClose,
  onSuccess,
  hamacaNombre,
  varianteId,
  initialFotos = [],
}: FotoVarianteModalProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [copiedFotoId, setCopiedFotoId] = useState<number | null>(null);
  const [photoRoutes, setPhotoRoutes] = useState<string[]>([""]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    setPhotoRoutes([""]);
    setSelectedFiles([]);
    setDragActive(false);
    setCopiedFotoId(null);
    setError("");
  }, [isOpen]);

  if (!isOpen) return null;

  function handlePhotoChange(index: number, value: string) {
    setPhotoRoutes((prev) =>
      prev.map((route, routeIndex) =>
        routeIndex === index ? value : route
      )
    );
  }

  function handleAddInput() {
    setPhotoRoutes((prev) => [...prev, ""]);
  }

  function handleRemoveInput(index: number) {
    setPhotoRoutes((prev) => {
      const next = prev.filter((_, routeIndex) => routeIndex !== index);
      return next.length > 0 ? next : [""];
    });
  }

  function addFiles(files: FileList | File[]) {
    const imageFiles = Array.from(files).filter((file) =>
      file.type.startsWith("image/")
    );

    setSelectedFiles((prev) => [...prev, ...imageFiles]);
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

  async function copyImageToClipboard(fotoId: number, fallbackUrl: string) {
  try {
    if (
      !navigator.clipboard ||
      typeof ClipboardItem === "undefined" ||
      typeof createImageBitmap === "undefined"
    ) {
      await navigator.clipboard.writeText(fallbackUrl);
      setError("Tu navegador no permite copiar imágenes. Se copió el link.");
      return;
    }

    const response = await apiFetch(`/fotos/${fotoId}/copy-source`);

    if (!response.ok) {
      const data = await response.json().catch(() => null);

      console.error("Error copy-source:", {
        status: response.status,
        data,
      });

      await navigator.clipboard.writeText(fallbackUrl);
      setError(
        `No se pudo copiar la imagen. Se copió el link. Error HTTP ${response.status}`
      );
      return;
    }

    const originalBlob = await response.blob();
    const imageBitmap = await createImageBitmap(originalBlob);
    const canvas = document.createElement("canvas");

    canvas.width = imageBitmap.width;
    canvas.height = imageBitmap.height;

    const context = canvas.getContext("2d");

    if (!context) {
      await navigator.clipboard.writeText(fallbackUrl);
      setError("No se pudo preparar la imagen. Se copió el link.");
      return;
    }

    context.drawImage(imageBitmap, 0, 0);

    const pngBlob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error("No se pudo convertir la imagen."));
          return;
        }

        resolve(blob);
      }, "image/png");
    });

    await navigator.clipboard.write([
      new ClipboardItem({
        "image/png": pngBlob,
      }),
    ]);

    setCopiedFotoId(fotoId);
    setError("");

    window.setTimeout(() => {
      setCopiedFotoId(null);
    }, 1500);
  } catch (error) {
    console.error("Error copiando imagen:", error);

    try {
      await navigator.clipboard.writeText(fallbackUrl);
      setError("No se pudo copiar la imagen. Se copió el link.");
    } catch {
      setError("No se pudo copiar la imagen ni el link.");
    }
  }
}

  async function uploadFile(file: File, selectedVarianteId: number) {
    const formData = new FormData();

    formData.append("foto", file);
    formData.append("hamaca_variante_ids[]", String(selectedVarianteId));

    const response = await apiFetch("/fotos", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      throw new Error(data?.message ?? `HTTP ${response.status}`);
    }
  }

  async function uploadRoute(route: string, selectedVarianteId: number) {
    const response = await apiFetch("/fotos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        buildVarianteFotoPayload({
          hamacaVarianteId: selectedVarianteId,
          ruta: route,
        })
      ),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      throw new Error(data?.message ?? `HTTP ${response.status}`);
    }
  }

  async function handleSubmit() {
    if (varianteId === null) {
      setError("No se encontró la variante.");
      return;
    }

    const selectedVarianteId = varianteId;
    const routes = normalizePhotoRoutes(photoRoutes);

    if (routes.length === 0 && selectedFiles.length === 0) {
      setError("Agrega al menos una foto o una ruta.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await Promise.all([
        ...selectedFiles.map((file) => uploadFile(file, selectedVarianteId)),
        ...routes.map((route) => uploadRoute(route, selectedVarianteId)),
      ]);

      onSuccess();
      onClose();
    } catch (err) {
      console.error("Error guardando fotos:", err);
      setError("No se pudieron guardar las fotos.");
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
            Fotos de {hamacaNombre}
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
          <section>
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-[#1a3a5c]">
              Fotos actuales
            </h3>

            {initialFotos.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {initialFotos.map((foto) => {
                  const url = imageUrl(foto.ruta);

                  return (
                    <div
                      key={foto.id}
                      className="overflow-hidden rounded-[8px] bg-white shadow"
                    >
                      <div className="h-32 overflow-hidden">
                        <img
                          src={url}
                          alt={hamacaNombre}
                          className="h-full w-full object-cover"
                        />
                      </div>

                      <div className="grid grid-cols-2">
                        <button
                          type="button"
                          onClick={() => openImage(url)}
                          className="flex items-center justify-center gap-2 bg-[#1a3a5c] px-3 py-2 text-sm font-semibold text-white"
                        >
                          <Download className="h-4 w-4" />
                          Abrir
                        </button>

                        <button
                          type="button"
                          onClick={() => copyImageToClipboard(foto.id, url)}
                          className="flex items-center justify-center gap-2 bg-[#456f89] px-3 py-2 text-sm font-semibold text-white"
                        >
                          <Copy className="h-4 w-4" />
                          {copiedFotoId === foto.id ? "Copiada" : "Copiar imagen"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex h-32 items-center justify-center rounded-[8px] bg-white">
                <Camera className="h-12 w-12 text-[#123852]" />
              </div>
            )}
          </section>

          <section>
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-[#1a3a5c]">
              Subir fotos
            </h3>

            <input
              ref={inputRef}
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
              onClick={() => inputRef.current?.click()}
              className={`flex cursor-pointer flex-col items-center justify-center rounded-[10px] border-2 border-dashed p-6 text-center transition ${
                dragActive
                  ? "border-[#1a3a5c] bg-[#1a3a5c]/10"
                  : "border-[#1a3a5c]/30 bg-white"
              }`}
            >
              <Upload className="mb-2 h-10 w-10 text-[#1a3a5c]" />
              <p className="font-semibold text-[#1a3a5c]">
                Arrastrá fotos aquí o tocá para abrir la galería
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
                      className="ml-3 text-red-600"
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
              <h3 className="text-sm font-bold uppercase tracking-wide text-[#1a3a5c]">
                O agregar ruta manual
              </h3>

              <button
                type="button"
                onClick={handleAddInput}
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
                      handlePhotoChange(index, event.target.value)
                    }
                    placeholder="fotos/familiar-roja.jpg o https://..."
                    className="min-w-0 flex-1 rounded-md border border-[#1a3a5c]/25 bg-white px-3 py-2 text-sm text-[#1a3a5c] outline-none"
                  />

                  <button
                    type="button"
                    onClick={() => handleRemoveInput(index)}
                    className="rounded-md border border-[#1a3a5c]/25 px-3 text-[#1a3a5c]"
                  >
                    <Trash className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            {error ? (
              <p className="mt-3 text-sm font-semibold text-red-600">
                {error}
              </p>
            ) : null}
          </section>
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
            {loading ? "Guardando..." : "Guardar fotos"}
          </button>
        </div>
      </div>
    </div>
  );
}