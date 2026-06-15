'use client'
import { Camera } from "lucide-react";
import CustomInput from "./customInput";

export interface UserFormData {
    imgUrl: string | null;
    nombre: string;
    correo: string;
    password: string;
    confirmar: string;
    rol: string;
}

interface AddUserCardProps {
    onClick: () => void;
    inputRef?: React.RefObject<HTMLInputElement | null>;
    preview: string | null;
    handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    formData: UserFormData;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    handleSubmit: (e: React.FormEvent) => void;
    response: string | null;
    title?: string;
    buttonText?: string;
    onClose?: () => void;
}

const ROLES = [
    { value: "admin", label: "Admin" },
    { value: "vendedor", label: "Vendedor" },
    { value: "almacenista", label: "Almacenista" },
    { value: "socio", label: "Socio" }
];

export default function AddUserCard({
    onClick,
    inputRef,
    preview,
    handleFileChange,
    formData,
    handleChange,
    handleSubmit,
    response,
    title = "Crear usuario",
    buttonText = "Crear",
    onClose,
}: AddUserCardProps) {

    return (
        <div className="
            w-full max-w-md mx-auto
            bg-[var(--color-foreground-secondary)] rounded-xl shadow-xl
            p-5 md:p-6
            flex flex-col gap-4
            mt-10
        ">

            {/* HEADER */}
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-[var(--color-foreground)] md:text-2xl">
                    {title}
                </h2>

                {onClose && (
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-xl font-bold"
                    >
                        ×
                    </button>
                )}
            </div>

            {/* AVATAR */}
            <div
                onClick={onClick}
                className="
                    mx-auto
                    w-24 h-24 md:w-32 md:h-32
                    rounded-full
                    bg-[var(--color-background-secondary)]
                    flex items-center justify-center
                    cursor-pointer
                    overflow-hidden
                "
            >
                {preview ? (
                    <img src={preview} className="w-full h-full object-cover" alt="Vista previa" />
                ) : (
                    <Camera className="w-10 h-10 md:w-10 md:h-10 text-[var(--color-foreground)]" />
                )}

                <input
                    type="file"
                    className="hidden"
                    ref={inputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                />
            </div>

            {/* FORM */}
            <form
                onSubmit={handleSubmit}
                className="flex flex-col items-center gap-4 w-full"
            >
                <CustomInput
                    customPlaceholder="usuario"
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                />

                <CustomInput
                    customPlaceholder="contraseña"
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                />

                <CustomInput
                    customPlaceholder="confirmar contraseña"
                    type="password"
                    name="confirmar"
                    value={formData.confirmar}
                    onChange={handleChange}
                />

                <CustomInput
                    customPlaceholder="correo electrónico"
                    type="email"
                    name="correo"
                    value={formData.correo}
                    onChange={handleChange}
                />

                <select
                    name="rol"
                    value={formData.rol}
                    onChange={handleChange}
                    className="w-full p-3 rounded-md border border-gray-300"
                >
                    <option value="">Seleccionar rol</option>
                    {ROLES.map((rol) => (
                        <option key={rol.value} value={rol.value}>
                            {rol.label}
                        </option>
                    ))}
                </select>

                {/* BOTÓN */}
                <button
                    className="
                        w-full h-12
                        rounded-lg
                        bg-[var(--color-buttons)]
                        text-[var(--color-foreground-secondary)]
                        font-bold
                        text-base md:text-lg
                        mt-2
                    "
                >
                    {buttonText}
                </button>

                {/* RESPUESTA */}
                {response && (
                    <p className="text-center text-sm text-red-500">
                        {response}
                    </p>
                )}
            </form>
        </div>
    );
}
