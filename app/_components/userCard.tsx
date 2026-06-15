import { Pencil, Trash } from "lucide-react";

interface UserCardProps {
    username: string;
    rol: string;
    correo: string;
    imgUrl: string;
    onEdit?: () => void;
    onDelete?: () => void;
}

export default function UserCard({
    username,
    imgUrl,
    rol,
    correo,
    onEdit,
    onDelete
}: UserCardProps) {

    return (
        <div className="
            w-full max-w-sm
            mx-auto
            bg-[var(--color-background-secondary)]
            rounded-xl
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
            <div className="
                w-24 h-24 md:w-32 md:h-32
                rounded-full
                overflow-hidden
                bg-[var(--color-foreground)]
            ">
                <img
                    src={imgUrl || "/assets/default-user.png"}
                    className="w-full h-full object-cover"
                    alt={username}
                />
            </div>

            {/* INFO */}
            <div className="text-center">
                <h1 className="text-lg md:text-xl font-bold">
                    {username}
                </h1>

                <p className="text-sm md:text-base opacity-70">
                    {rol}
                </p>

                <p className="text-xs md:text-sm opacity-60 break-words">
                    {correo}
                </p>
            </div>

        </div>
    );
}
