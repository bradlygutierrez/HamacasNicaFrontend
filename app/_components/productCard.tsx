import { Pencil, Trash } from "lucide-react";

interface ProductCardProps {
    nombre: string;
    urlImg: string;
    descripcion: string;
    categoria: string;
    ubicacion: string;
    tamano: string;
    cantidad: number;
    precio: number;
    onEdit?: () => void;
    onDelete?: () => void;
}

export default function ProductCard({
    nombre,
    descripcion,
    categoria,
    ubicacion,
    tamano,
    cantidad,
    precio,
    urlImg,
    onEdit,
    onDelete
}: ProductCardProps) {

    return (
        <div className="
            w-full md:w-[calc(50%-1rem)] xl:w-[calc(33.333%-1rem)]
            bg-[var(--color-background-secondary)]
            rounded-lg
            shadow-lg
            flex flex-col
            items-center
            gap-4
            p-4
            mt-8
        ">

            {/* ICONOS */}
            <div className="flex w-full justify-end gap-3">
                <Pencil
                    className="h-5 w-5 md:h-6 md:w-6 text-[var(--color-foreground)] cursor-pointer"
                    onClick={onEdit}
                />
                <Trash
                    className="h-5 w-5 md:h-6 md:w-6 text-[var(--color-foreground)] cursor-pointer"
                    onClick={onDelete}
                />
            </div>

            {/* AVATAR */}
            <div className="h-40 w-full overflow-hidden rounded-xl bg-[var(--color-foreground)]">
                <img
                    src={urlImg || "/assets/default-user.png"}
                    className="w-full h-full object-cover"
                    alt={nombre}
                />
            </div>

            {/* INFO */}
            <div className="w-full space-y-2 text-center">
                <h1 className="rounded-lg bg-[var(--color-background)] px-2 py-1 text-sm font-bold text-[var(--color-foreground-secondary)] md:text-lg">
                    {nombre}
                </h1>
                <h1 className="rounded-lg bg-[var(--color-buttons)] px-2 py-1 text-sm font-bold text-[var(--color-foreground-secondary)] md:text-lg">
                    cantidad: {cantidad}
                </h1>

                <p className="text-sm md:text-base opacity-70">
                    {descripcion}
                </p>

                <p className="text-xs md:text-sm opacity-60 break-words">
                    {categoria} - {ubicacion} - {tamano} - Precio: ${precio}
                </p>
            </div>

        </div>
    );
}
