import { Camera, Pencil, Trash } from "lucide-react";

interface ProductCardProps {
  nombre: string;
  urlImg: string;
  imageUrls?: string[];
  cantidad: number;
  color: string;
  propietario: string;
  ubicacion: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function ProductCard({
  nombre,
  cantidad,
  color,
  propietario,
  ubicacion,
  urlImg,
  imageUrls = [],
  onEdit,
  onDelete,
}: ProductCardProps) {
  const visibleImages = imageUrls.filter(Boolean).slice(0, 4);
  const remainingImages = Math.max(imageUrls.filter(Boolean).length - visibleImages.length, 0);

  return (
    <article className="w-full rounded-[8px] bg-[#e9eef1] p-5 shadow-lg sm:min-h-[600px] sm:p-8">
      <div className="mb-4 flex justify-end gap-4 sm:mb-5 sm:gap-5">
        <button type="button" onClick={onEdit} aria-label="Editar hamaca">
          <Pencil className="h-7 w-7 text-[#08264d] sm:h-8 sm:w-8" />
        </button>

        <button type="button" onClick={onDelete} aria-label="Eliminar hamaca">
          <Trash className="h-7 w-7 text-[#08264d] sm:h-8 sm:w-8" />
        </button>
      </div>

      <div className="mb-4 flex h-[170px] items-center justify-center overflow-hidden rounded-[8px] bg-[#f7f7f7] sm:h-[220px]">
        {urlImg ? (
          <img
            src={urlImg}
            alt={nombre}
            className="h-full w-full object-cover"
          />
        ) : (
          <Camera className="h-14 w-14 text-[#123852] sm:h-16 sm:w-16" />
        )}
      </div>

      {visibleImages.length > 1 ? (
        <div className="mb-4 grid grid-cols-4 gap-2">
          {visibleImages.map((imageUrl, index) => (
            <div
              key={`${imageUrl}-${index}`}
              className="relative h-14 overflow-hidden rounded-[8px] bg-[#f7f7f7]"
            >
              <img
                src={imageUrl}
                alt={`${nombre} foto ${index + 1}`}
                className="h-full w-full object-cover"
              />
              {remainingImages > 0 && index === visibleImages.length - 1 ? (
                <div className="absolute inset-0 flex items-center justify-center bg-[#08264d]/70 text-sm font-bold text-white">
                  +{remainingImages}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}

      <div className="space-y-3 text-[20px] font-bold sm:text-[26px]">
        <div className="rounded-[8px] bg-[#123852] px-3 py-1 text-center text-white sm:px-4">
          {nombre}
        </div>

        <div className="rounded-[8px] bg-[#456f89] px-3 py-1 text-center text-white sm:px-4">
          Cantidad: {cantidad}
        </div>

        <div className="pt-2">
          <p className="mb-1 text-[#155b72]">Color:</p>
          <div className="break-words rounded-[8px] bg-[#155b72] px-4 py-2 text-white sm:px-5">
            {color}
          </div>
        </div>

        <div>
          <p className="mb-1 text-[#155b72]">Propietario:</p>
          <div className="break-words rounded-[8px] bg-[#155b72] px-4 py-2 text-white sm:px-5">
            {propietario}
          </div>
        </div>

        <div>
          <p className="mb-1 text-[#155b72]">Ubicación:</p>
          <div className="break-words rounded-[8px] bg-[#155b72] px-4 py-2 text-white sm:px-5">
            {ubicacion}
          </div>
        </div>
      </div>
    </article>
  );
}
