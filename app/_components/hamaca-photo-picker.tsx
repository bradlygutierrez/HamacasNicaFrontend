"use client";

import { addImageFiles } from "@/app/_lib/hamaca-photo-files";
import { Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, DragEvent } from "react";
import { toast } from "react-toastify";

type HamacaPhotoPickerProps = {
  files: File[];
  onFilesChange: (files: File[]) => void;
};

export default function HamacaPhotoPicker({ files, onFilesChange }: HamacaPhotoPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [previews, setPreviews] = useState<Array<{ file: File; url: string }>>([]);

  useEffect(() => {
    const nextPreviews = files.map((file) => ({ file, url: URL.createObjectURL(file) }));
    // Preview URLs are browser resources, so synchronize them with the selected files.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPreviews(nextPreviews);
    return () => nextPreviews.forEach(({ url }) => URL.revokeObjectURL(url));
  }, [files]);

  function addFiles(incoming: FileList | File[]) {
    const result = addImageFiles(files, Array.from(incoming));
    onFilesChange(result.files);
    if (result.rejectedTooLarge) toast.error("Cada imagen debe pesar máximo 4 MB.");
    if (result.rejectedNotImage) toast.error("Solo se permiten archivos de imagen.");
  }

  function handleFileInput(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.files) addFiles(event.target.files);
    event.target.value = "";
  }

  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragActive(true);
  }

  function handleDragLeave() {
    setDragActive(false);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragActive(false);
    addFiles(event.dataTransfer.files);
  }

  function removeSelectedFile(file: File) {
    onFilesChange(files.filter((selected) => selected !== file));
  }

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={handleFileInput}
        aria-label="Subir fotos de hamaca"
      />
      <div
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-[10px] border-2 border-dashed p-6 text-center transition ${
          dragActive ? "border-[#1a3a5c] bg-[#1a3a5c]/10" : "border-[#1a3a5c]/30 bg-white hover:bg-[#1a3a5c]/[0.04]"
        }`}
      >
        <Upload className="mb-2 h-10 w-10 text-[#1a3a5c]" />
        <p className="font-semibold text-[#1a3a5c]">Arrastrá fotos aquí o tocá para abrir la galería</p>
        <p className="mt-1 text-sm text-[#4a6a8a]">En celular abre la galería. En PC permite seleccionar archivos.</p>
      </div>

      {previews.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {previews.map(({ file, url }) => (
            <div key={`${file.name}-${file.size}-${file.lastModified}`} className="overflow-hidden rounded-lg border border-[#1a3a5c]/15 bg-white">
              {/* Object URLs are local previews; the file is uploaded only with the form submit. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={file.name} className="h-28 w-full object-cover" />
              <div className="space-y-1 p-2">
                <p className="truncate text-xs text-[#1a3a5c]" title={file.name}>{file.name}</p>
                <button type="button" onClick={() => removeSelectedFile(file)} className="text-xs font-semibold text-red-600 hover:text-red-800">Quitar</button>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
