"use client";
import { translateText } from "@/app/_lib/localization";

import { apiFetch } from "@/app/_lib/api";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

export type EditableMovimiento = {
  id: number;
  tipo: "entrada" | "salida";
  cantidad: number;
  fecha: string;
};

type Props = {
  movimiento: EditableMovimiento | null;
  onClose: () => void;
  onSuccess: () => Promise<void>;
};

function getErrorMessage(data: unknown) {
  if (!data || typeof data !== "object") return "No se pudo actualizar el movimiento.";

  const payload = data as {
    message?: unknown;
    errors?: Record<string, unknown[]>;
  };
  const firstError = payload.errors
    ? Object.values(payload.errors).flat()[0]
    : payload.message;

  return String(firstError ?? "No se pudo actualizar el movimiento.");
}

function toDateInputValue(value: string) {
  const datePart = value.match(/^\d{4}-\d{2}-\d{2}/)?.[0];
  if (datePart) return datePart;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
}

export default function EditMovimientoModal({
  movimiento,
  onClose,
  onSuccess,
}: Props) {
  const [cantidad, setCantidad] = useState("");
  const [fecha, setFecha] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!movimiento) return;

    setCantidad(String(movimiento.cantidad));
    setFecha(toDateInputValue(movimiento.fecha));
    setError("");
  }, [movimiento]);

  useEffect(() => {
    if (!movimiento) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [movimiento]);

  if (!movimiento) return null;

  async function handleSubmit() {
    const currentMovimiento = movimiento;
    if (!currentMovimiento) return;

    const parsedCantidad = Number(cantidad);
    if (!Number.isInteger(parsedCantidad) || parsedCantidad < 1) {
      setError("La cantidad debe ser un número entero mayor a 0.");
      return;
    }
    if (!fecha) {
      setError("Selecciona una fecha.");
      return;
    }

    setLoading(true);

    try {
      const response = await apiFetch(`/movimientos/${currentMovimiento.id}`, {
        method: "PATCH",
        body: JSON.stringify({ cantidad: parsedCantidad, fecha }),
      });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const message = getErrorMessage(data);
        setError(message);
        toast.error(message);
        return;
      }

      await onSuccess();
      toast.success("Movimiento actualizado.");
      onClose();
    } catch (err) {
      console.error(err);
      setError("No se pudo actualizar el movimiento. Verifica tu sesión y permisos.");
      toast.error("No se pudo actualizar el movimiento. Verifica tu sesión y permisos.");
    } finally {
      setLoading(false);
    }
  }

  const tipoLabel = movimiento.tipo === "entrada" ? "entrada" : "salida";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-4"
      onClick={(event) => {
        if (event.target === event.currentTarget && !loading) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-movimiento-title"
        className="w-full max-w-lg overflow-hidden rounded-lg bg-[#f7f7f7] text-[#08264d] shadow-xl"
      >
        <header className="flex items-center justify-between border-b border-[#08264d]/15 px-4 py-4 sm:px-6">
          <h2 id="edit-movimiento-title" className="text-lg font-semibold">
            {translateText("Editar ")}{tipoLabel}
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            aria-label={translateText("Cerrar modal")}
            className="rounded p-1 hover:bg-[#08264d]/10 disabled:opacity-60"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="grid gap-4 px-4 py-5 sm:px-6">
          <label className="grid gap-1 text-sm font-medium">
            {translateText("Cantidad\r\n            ")}<input
              type="number"
              min={1}
              step={1}
              value={cantidad}
              onChange={(event) => {
                setCantidad(event.target.value);
                setError("");
              }}
              className="h-11 rounded border border-[#08264d]/30 bg-white px-3 text-sm outline-none focus:border-[#08264d]"
            />
          </label>

          <label className="grid gap-1 text-sm font-medium">
            {translateText("Fecha\r\n            ")}<input
              type="date"
              value={fecha}
              onChange={(event) => {
                setFecha(event.target.value);
                setError("");
              }}
              className="h-11 rounded border border-[#08264d]/30 bg-white px-3 text-sm outline-none focus:border-[#08264d]"
            />
          </label>

          {error ? (
            <p className="rounded status-danger px-3 py-2 text-sm font-medium status-danger-text">
              {error}
            </p>
          ) : null}
        </div>

        <footer className="flex flex-col-reverse gap-2 border-t border-[#08264d]/15 px-4 py-4 sm:flex-row sm:justify-end sm:px-6">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded border border-[#08264d]/30 px-4 py-2 text-sm font-semibold disabled:opacity-60"
          >
            {translateText("Cancelar\r\n          ")}</button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="rounded bg-[#08264d] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {loading ? "Guardando..." : "Guardar cambios"}
          </button>
        </footer>
      </section>
    </div>
  );
}
