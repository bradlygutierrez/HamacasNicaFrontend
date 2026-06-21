"use client";

import { Camera, Images, PackageSearch } from "lucide-react";
import { useState } from "react";

type CatalogoHamacaCardProps = {
  nombre: string;
  categoria: string | null;
  tamano: string | null;
  precio: string | number;
  colores: string[];
  disponible: number;
  ubicaciones: string[];
  propietarios: string[];
  imageUrls?: string[];
  onViewPhotos?: () => void;
  onViewInventory?: () => void;
};

export default function CatalogoHamacaCard({
  nombre,
  categoria,
  tamano,
  precio,
  colores,
  disponible,
  ubicaciones,
  propietarios,
  imageUrls = [],
  onViewPhotos,
  onViewInventory,
}: CatalogoHamacaCardProps) {
  const [imageError, setImageError] = useState(false);

  const validImages = imageUrls.filter(Boolean);
  const mainImage = validImages[0];

  return (
    <article className="w-full rounded-[10px] bg-[#e9eef1] p-5 shadow-lg">
      <div className="mb-4 flex h-[190px] items-center justify-center overflow-hidden rounded-[8px] bg-[#f7f7f7]">
        {mainImage && !imageError ? (
          <img
            src={mainImage}
            alt={nombre}
            onError={() => setImageError(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <Camera className="h-14 w-14 text-[#123852]" />
        )}
      </div>

      <div className="space-y-3 text-[#08264d]">
        <div className="rounded-[8px] bg-[#123852] px-4 py-2 text-center text-xl font-bold text-white">
          {nombre}
        </div>

        <div
          className={`rounded-[8px] px-4 py-2 text-center text-lg font-bold text-white ${
            disponible > 0 ? "bg-[#456f89]" : "bg-red-700"
          }`}
        >
          {disponible > 0 ? `Disponible: ${disponible}` : "Agotada"}
        </div>

        <div>
          <p className="mb-1 text-lg font-bold text-[#155b72]">Colores:</p>
          <div className="rounded-[8px] bg-[#155b72] px-4 py-2 text-white">
            {colores.length > 0 ? colores.join(", ") : "Sin color"}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="mb-1 text-lg font-bold text-[#155b72]">Categoría:</p>
            <div className="rounded-[8px] bg-[#155b72] px-4 py-2 text-white">
              {categoria ?? "Sin categoría"}
            </div>
          </div>

          <div>
            <p className="mb-1 text-lg font-bold text-[#155b72]">Tamaño:</p>
            <div className="rounded-[8px] bg-[#155b72] px-4 py-2 text-white">
              {tamano ?? "Sin tamaño"}
            </div>
          </div>
        </div>

        <div>
          <p className="mb-1 text-lg font-bold text-[#155b72]">Precio:</p>
          <div className="rounded-[8px] bg-[#155b72] px-4 py-2 text-white">
            C$ {precio}
          </div>
        </div>

        <div>
          <p className="mb-1 text-lg font-bold text-[#155b72]">Ubicaciones:</p>
          <div className="rounded-[8px] bg-[#155b72] px-4 py-2 text-white">
            {ubicaciones.length > 0 ? ubicaciones.join(", ") : "Sin stock"}
          </div>
        </div>

        <div>
          <p className="mb-1 text-lg font-bold text-[#155b72]">
            Propietarios:
          </p>
          <div className="rounded-[8px] bg-[#155b72] px-4 py-2 text-white">
            {propietarios.length > 0 ? propietarios.join(", ") : "Sin stock"}
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onViewPhotos}
          className="flex items-center justify-center gap-2 rounded-[8px] bg-white px-3 py-2 font-semibold text-[#08264d] shadow"
        >
          <Images className="h-5 w-5" />
          Fotos
        </button>

        <button
          type="button"
          onClick={onViewInventory}
          className="flex items-center justify-center gap-2 rounded-[8px] bg-[#123852] px-3 py-2 font-semibold text-white shadow"
        >
          <PackageSearch className="h-5 w-5" />
          Inventario
        </button>
      </div>
    </article>
  );
}