'use client';

import EntradaModal from '@/app/_components/entrada-modal';
import EntradasTable from '@/app/_components/entradas-table';
import { apiFetch } from '@/app/_lib/api';
import { Plus, Search } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

type Movimiento = {
  id: number;
  usuario: string | null;
  inventario_hamaca_id: number;
  tipo: 'entrada' | 'salida' | 'transferencia';
  cantidad: number;
  fecha: string;
};

type Inventario = {
  id: number;
  cantidad: number;
  hamaca?: {
    id: number;
    nombre: string;
    precio: number | string;
  };
  ubicacion?: {
    id: number;
    nombre: string;
  };
  usuario?: {
    id: number;
    nombre: string;
    rol: string;
  };
};

export type EntradaRow = {
  id: number;
  producto: string;
  usuario: string;
  fecha: string;
  cantidad: number;
  ubicacion: string;
  total: number;
  estatus: 'Aplicado' | 'No Aplicado';
};

export default function EntradasPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [inventarios, setInventarios] = useState<Inventario[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const loadData = useCallback(async () => {
    const [movimientosRes, inventariosRes] = await Promise.all([
      apiFetch('/movimientos'),
      apiFetch('/inventario-hamacas'),
    ]);

    const movimientosData = await movimientosRes.json();
    const inventariosData = await inventariosRes.json();

    setMovimientos(movimientosData.data ?? []);
    setInventarios(inventariosData.data ?? []);
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      loadData().catch(console.error);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadData]);

  const rows = useMemo<EntradaRow[]>(() => {
    return movimientos
      .filter((mov) => mov.tipo === 'entrada')
      .map((mov) => {
        const inv = inventarios.find(
          (item) => item.id === mov.inventario_hamaca_id
        );

        const precio = Number(inv?.hamaca?.precio ?? 0);
        const total = precio * Number(mov.cantidad ?? 0);

        return {
          id: mov.id,
          producto: inv?.hamaca?.nombre ?? `INV-${mov.inventario_hamaca_id}`,
          usuario: mov.usuario ?? inv?.usuario?.nombre ?? 'Sin usuario',
          fecha: mov.fecha,
          cantidad: mov.cantidad,
          ubicacion: inv?.ubicacion?.nombre ?? 'Sin ubicación',
          total,
          estatus: 'Aplicado',
        };
      });
  }, [movimientos, inventarios]);

  const filteredRows = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();

    if (!term) return rows;

    return rows.filter((row) =>
      `${row.producto} ${row.usuario} ${row.fecha} ${row.ubicacion} ${row.estatus}`
        .toLowerCase()
        .includes(term)
    );
  }, [rows, searchTerm]);

  return (
    <div className="w-full max-w-full overflow-x-hidden bg-[#456f89] px-3 py-4 text-[#08264d] sm:px-8 sm:py-7">
      <header className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-8">
        <h1 className="text-[42px] font-extrabold leading-none text-white sm:text-[56px]">
          Entradas
        </h1>

        <div className="relative h-[46px] w-full lg:max-w-[650px]">
          <Search className="absolute left-4 top-1/2 h-6 w-6 -translate-y-1/2 text-[#08264d]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-full w-full rounded-[8px] bg-[#f7f7f7] pl-14 pr-4 text-base text-[#08264d] outline-none sm:text-xl"
          />
        </div>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="flex h-[42px] w-full items-center justify-center gap-2 rounded-[10px] bg-[#f7f7f7] px-5 text-base font-medium text-black shadow-md sm:w-fit sm:text-lg lg:ml-auto"
        >
          <Plus className="h-5 w-5" />
          Agregar
        </button>
      </header>

      <EntradasTable rows={filteredRows} />

      <EntradaModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={loadData}
      />
    </div>
  );
}
