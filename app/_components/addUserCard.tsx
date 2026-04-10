import { Camera } from "lucide-react";
import CustomInput from "./customInput";


interface AddUserCardProps {
    onClick: () => void;
    inputRef ?: React.RefObject<HTMLInputElement | null>;
    preview: string | null;
    handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function AddUserCard({ onClick, inputRef, preview, handleFileChange }: AddUserCardProps) {
    return (
        <div className="flex flex-col mt-[5rem] w-[23vw] rounded-lg h-[65vh] bg-[var(--color-background-secondary)] overflow-visible shadow-xl">
            <div className="relative top-[-4rem] mx-auto w-[12rem] h-[12rem] rounded-[80%] bg-[var(--color-foreground-secondary)] shadow-xl cursor-pointer" onClick={onClick}>

                {preview ? (
                    <img
                        src={preview}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <Camera
                        className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 text-[var(--color-foreground)]"
                        aria-hidden="true"
                    />
                )}

                <input type="file" className="hidden" ref={inputRef} onChange={handleFileChange} accept="image/*" />
            </div>

            <form action="" className="h-[50%] flex flex-col gap-7 items-center justify-end">

                <CustomInput customPlaceholder={"usuario"} type="text" />
                <CustomInput customPlaceholder={"contraseña"} type="password" />
                <button className="rounded-full bg-[var(--color-buttons)] text-[var(--color-foreground-secondary)] font-bold text-xl cursor-pointer mt-4 w-[50%] h-[3rem]">
                    Crear
                </button>
            </form>
        </div>
    );

}