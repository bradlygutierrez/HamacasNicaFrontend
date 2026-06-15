'use client';

import AddUserCard from "@/app/_components/addUserCard";
import UserCard from "@/app/_components/userCard";
import { apiFetch } from "@/app/_lib/api";
import { useEffect, useRef, useState } from "react";

interface UsuarioForm {
    imgUrl: string | null;
    nombre: string;
    correo: string;
    password: string;
    confirmar: string;
    rol: string;
}

interface UsuarioApi {
    id: number;
    nombre: string;
    correo: string;
    foto: string | null;
    rol: string;
}

const emptyUserData: UsuarioForm = {
    imgUrl: null,
    nombre: "",
    correo: "",
    password: "",
    confirmar: "",
    rol: "",
};

export default function Usuarios() {
    const [createUserData, setCreateUserData] = useState<UsuarioForm>(emptyUserData);
    const [createPreview, setCreatePreview] = useState<string | null>(null);
    const [createSelectedFile, setCreateSelectedFile] = useState<File | null>(null);
    const [createResponse, setCreateResponse] = useState<string | null>(null);
    const [users, setUsers] = useState<UsuarioApi[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUserId, setEditingUserId] = useState<number | null>(null);
    const [editUserData, setEditUserData] = useState<UsuarioForm>(emptyUserData);
    const [editPreview, setEditPreview] = useState<string | null>(null);
    const [editSelectedFile, setEditSelectedFile] = useState<File | null>(null);
    const [editResponse, setEditResponse] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const loadUsers = async () => {
        const res = await apiFetch("/usuarios");
        const data = await res.json();
        setUsers(data.data ?? []);
    };

    useEffect(() => {
        void (async () => {
            try {
                const res = await apiFetch("/usuarios");
                const data = await res.json();
                setUsers(data.data ?? []);
            } catch (error) {
                console.error(error);
            }
        })();
    }, []);

    const resetCreateForm = () => {
        setCreateUserData(emptyUserData);
        setCreatePreview(null);
        setCreateSelectedFile(null);
        setCreateResponse(null);
    };

    const resetEditForm = () => {
        setEditUserData(emptyUserData);
        setEditPreview(null);
        setEditSelectedFile(null);
        setEditResponse(null);
        setEditingUserId(null);
    };

    const handleCreateClick = () => fileInputRef.current?.click();
    const handleEditClick = () => fileInputRef.current?.click();

    const openEditModal = (user: UsuarioApi) => {
        setEditingUserId(user.id);
        setEditUserData({
            imgUrl: user.foto ?? null,
            nombre: user.nombre ?? "",
            correo: user.correo ?? "",
            password: "",
            confirmar: "",
            rol: user.rol ?? "",
        });
        setEditPreview(user.foto ?? null);
        setEditSelectedFile(null);
        setEditResponse(null);
        setIsModalOpen(true);
    };

    const handleCreateChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setCreateUserData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setEditUserData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleCreateFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const imgUrl = URL.createObjectURL(file);
        setCreatePreview(imgUrl);
        setCreateUserData((prev) => ({ ...prev, imgUrl }));
        setCreateSelectedFile(file);
    };

    const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const imgUrl = URL.createObjectURL(file);
        setEditPreview(imgUrl);
        setEditUserData((prev) => ({ ...prev, imgUrl }));
        setEditSelectedFile(file);
    };

    const handleCreateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (createUserData.password !== createUserData.confirmar) {
            setCreateResponse("Las contraseñas no coinciden");
            return;
        }

        const formData = new FormData();
        formData.append("nombre", createUserData.nombre);
        formData.append("correo", createUserData.correo);
        formData.append("rol", createUserData.rol);
        formData.append("password", createUserData.password);
        if (createSelectedFile) {
            formData.append("foto", createSelectedFile);
        }

        const res = await apiFetch("/usuarios", {
            method: "POST",
            body: formData,
        });

        const data = await res.json();
        setCreateResponse(data.message);

        if (res.ok) {
            await loadUsers();
            resetCreateForm();
        }
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (editUserData.password || editUserData.confirmar) {
            if (editUserData.password !== editUserData.confirmar) {
                setEditResponse("Las contraseñas no coinciden");
                return;
            }
        }

        if (!editingUserId) return;

        const formData = new FormData();
        formData.append("nombre", editUserData.nombre);
        formData.append("correo", editUserData.correo);
        formData.append("rol", editUserData.rol);
        if (editUserData.password) {
            formData.append("password", editUserData.password);
        }
        if (editSelectedFile) {
            formData.append("foto", editSelectedFile);
        }
        formData.append("_method", "PUT");

        const res = await apiFetch(`/usuarios/${editingUserId}`, {
            method: "POST",
            body: formData,
        });

        const data = await res.json();
        setEditResponse(data.message);

        if (res.ok) {
            await loadUsers();
        }
    };

    const handleDeleteUser = async (id: number) => {
        const confirmDelete = confirm("¿Estás seguro de eliminar este usuario?");
        if (!confirmDelete) return;

        const res = await apiFetch(`/usuarios/${id}`, {
            method: "DELETE",
        });

        if (res.ok) {
            await loadUsers();
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <header className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold text-[var(--color-foreground-secondary)] md:text-5xl">
                    Usuarios
                </h1>
                <p className="max-w-2xl text-sm text-[var(--color-foreground-secondary)]/80 md:text-base">
                    Administra accesos administrativos, roles y fotos del personal.
                </p>
            </header>

            <main className="grid gap-6 lg:grid-cols-[420px_minmax(0,1fr)]">
                <AddUserCard
                    onClick={handleCreateClick}
                    inputRef={fileInputRef}
                    preview={createPreview}
                    handleFileChange={handleCreateFileChange}
                    formData={createUserData}
                    handleChange={handleCreateChange}
                    handleSubmit={handleCreateSubmit}
                    response={createResponse}
                    buttonText="Crear usuario"
                />

                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {users.map((user) => (
                        <UserCard
                            key={user.id}
                            username={user.nombre}
                            rol={user.rol}
                            correo={user.correo}
                            imgUrl={user.foto ?? ""}
                            onEdit={() => openEditModal(user)}
                            onDelete={() => handleDeleteUser(user.id)}
                        />
                    ))}
                </section>
            </main>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md">
                        <AddUserCard
                            onClick={handleEditClick}
                            inputRef={fileInputRef}
                            preview={editPreview}
                            handleFileChange={handleEditFileChange}
                            formData={editUserData}
                            handleChange={handleEditChange}
                            handleSubmit={handleEditSubmit}
                            response={editResponse}
                            title="Editar usuario"
                            buttonText="Actualizar"
                            onClose={() => {
                                setIsModalOpen(false);
                                resetEditForm();
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
