'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "../_lib/api";

export default function Home() {

  const router = useRouter();

  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setError(null);
    setLoading(true);

    try {
      const res = await apiFetch("/login", {
        method: "POST",
        body: JSON.stringify({
          correo,
          password
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Error al iniciar sesión");
        setLoading(false);
        return;
      }

      // ✅ Guardar token
      localStorage.setItem("token", data.access_token);

      // ✅ Redirigir al dashboard
      router.push("/dashboard");

    } catch (err) {
      console.error(err);
      setError("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full flex-col h-full p-0 justify-center font-sans min-h-screen items-center 
      bg-gradient-to-b from-[var(--color-buttons)] to-[var(--color-background)] text-[var(--color-foreground)]">

      {/* Logo */}
      <section className="w-full flex justify-center">
        <div className="bg-[url('/Logo.svg')] bg-center bg-cover bg-no-repeat w-[95%] md:w-[50%] h-[29vh]" />
      </section>

      {/* Formulario */}
      <section className="flex justify-center md:mt-9 mb-19 w-full h-[80vh]">
        <form 
          onSubmit={handleLogin}
          className="flex flex-col p-10 items-center gap-10 bg-[var(--color-foreground-secondary)] h-[87%] md:h-[80%] w-[90%] md:w-[40%] rounded-md shadow-2xl"
        >
          <h1 className="text-[var(--color-foreground)] text-4xl md:text-6xl font-bold font-poppins md:mb-10">
            Iniciar sesión
          </h1>

          {/* Input correo */}
          <input
            type="email"
            placeholder="correo"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            className="placeholder-[var(--color-foreground)] h-14 w-[90%] md:w-[70%] bg-white shadow-md rounded-md p-5 text-center text-2xl font-semibold"
          />

          {/* Input contraseña */}
          <input
            type="password"
            placeholder="contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-14 w-[90%] md:w-[70%] placeholder-[var(--color-foreground)] bg-white shadow-md rounded-md p-5 text-center text-2xl font-semibold"
          />

          {/* Botón */}
          <button
            type="submit"
            disabled={loading}
            className="text-center flex justify-center items-center text-2xl md:text-3xl font-bold text-[var(--color-foreground-secondary)] bg-[var(--color-buttons)] rounded-full w-[60%] md:w-[40%] h-14 shadow-md hover:bg-[var(--color-buttons-secondary)] transition-colors duration-300 disabled:opacity-50"
          >
            {loading ? "Cargando..." : "Entrar"}
          </button>

          {/* Error */}
          {error && (
            <p className="text-red-500 text-lg font-semibold text-center">
              {error}
            </p>
          )}
        </form>
      </section>
    </div>
  );
}
