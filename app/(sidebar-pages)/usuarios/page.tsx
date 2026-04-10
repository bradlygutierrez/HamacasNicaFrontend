'use client'
import CustomInput from "@/app/_components/customInput"
import AddUserCard from "@/app/_components/addUserCard"
import UserCard from "@/app/_components/userCard"
import { Camera } from "lucide-react"
import { useRef, useState } from "react";

interface UsuariosVariables {
    imgUrl: string | null;
    username: string;
    password: string;
}


export default function Usuarios() {
    const [userData, setUserData] = useState<UsuariosVariables>({
        imgUrl: null,
        username: '',
        password: '',
    });
    const [preview, setPreview] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const Icon = Camera;
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleClick = () => {
        fileInputRef.current?.click(); // abre el selector
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (file) {
            const imgUrl = URL.createObjectURL(file);
            setPreview(imgUrl);

            setUserData((prev) => ({
                ...prev,
                imgUrl: imgUrl,
            }));
            setSelectedFile(file);
        }

    };

    return (
        <div className="flex flex-col  w-full h-full p-10">
            <h1 className="text-[var(--color-foreground-secondary)] text-5xl font-bold">
                Usuarios
            </h1>
            <main className="flex flex-wrap gap-10">
                <AddUserCard onClick={handleClick} inputRef={fileInputRef} preview={preview} handleFileChange={handleFileChange} />
                <div className="flex-1">
                    <UserCard username={"Bradly"} imgUrl={"/assets/hamaca1.jpg"} />
                </div>
            </main>
        </div>
    )
}