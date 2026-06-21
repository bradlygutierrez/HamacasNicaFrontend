import { Camera, Eye, LogOut } from "lucide-react";

type InventarioHamacaCardProps = {
  nombre: string;
  cantidad: number;
  colores: string[];
  propietario: string;
  ubicacion: string;
  precio: string | number;
  imageUrls?: string[];
  onViewPhotos?: () => void;
  onCreateExit?: () => void;
};

export default function InventarioHamacaCard({
  nombre,
  cantidad,
  colores,
  propietario,
  ubicacion,
  precio,
  imageUrls = [],
  onViewPhotos,
  onCreateExit,
}: InventarioHamacaCardProps) {
  const visibleImages = imageUrls.filter(Boolean);
  const mainImage = visibleImages[0];

  return (
    <article className="w-full rounded-[10px] bg-[#e9eef1] p-5 shadow-lg">
      <div className="mb-4 flex h-[180px] items-center justify-center overflow-hidden rounded-[8px] bg-[#f7f7f7]">
        {mainImage ? (
          <img
            src={mainImage}
            alt={nombre}
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

        <div className="rounded-[8px] bg-[#456f89] px-4 py-2 text-center text-lg font-bold text-white">
          Disponible: {cantidad}
        </div>

        <div>
          <p className="mb-1 text-lg font-bold text-[#155b72]">Colores:</p>
          <div className="rounded-[8px] bg-[#155b72] px-4 py-2 text-white">
            {colores.length > 0 ? colores.join(", ") : "Sin color"}
          </div>
        </div>

        <div>
          <p className="mb-1 text-lg font-bold text-[#155b72]">Propietario:</p>
          <div className="rounded-[8px] bg-[#155b72] px-4 py-2 text-white">
            {propietario}
          </div>
        </div>

        <div>
          <p className="mb-1 text-lg font-bold text-[#155b72]">Ubicación:</p>
          <div className="rounded-[8px] bg-[#155b72] px-4 py-2 text-white">
            {ubicacion}
          </div>
        </div>

        <div>
          <p className="mb-1 text-lg font-bold text-[#155b72]">Precio:</p>
          <div className="rounded-[8px] bg-[#155b72] px-4 py-2 text-white">
            C$ {precio}
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onViewPhotos}
          className="flex items-center justify-center gap-2 rounded-[8px] bg-white px-3 py-2 font-semibold text-[#08264d] shadow"
        >
          Fotos
        </button>

        <button
          type="button"
          onClick={onCreateExit}
          className="flex items-center justify-center gap-2 rounded-[8px] bg-[#123852] px-3 py-2 font-semibold text-white shadow"
        >
          <LogOut className="h-5 w-5" />
          Salida
        </button>
      </div>
    </article>
  );
}