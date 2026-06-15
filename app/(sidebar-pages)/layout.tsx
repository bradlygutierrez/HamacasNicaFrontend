'use client';
import { SideBar } from "../_components/sideBar";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";


export default function SidebarLayout({

  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/");
      queueMicrotask(() => setLoading(false));
      return;
    }

    queueMicrotask(() => setLoading(false));
  }, [router]);

  // ⏳ Mientras valida
  if (loading) {
    return <p className="text-center mt-20">Verificando sesión...</p>;
  }

  return (

    <div className="flex min-h-screen flex-col bg-[var(--color-background)] md:flex-row">
      <SideBar />
      <main className="flex-1 px-4 pb-8 pt-16 md:pl-[19rem] md:pr-6 md:pt-6">
        {children}
      </main>
    </div>
  );
}
