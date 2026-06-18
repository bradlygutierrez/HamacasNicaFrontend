import { Pencil } from 'lucide-react';

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

type Props = {
  rows: EntradaRow[];
};

function formatDate(value: string) {
  if (!value) return '';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('es-NI', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

function formatMoney(value: number) {
  return new Intl.NumberFormat('es-NI', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export default function EntradasTable({ rows }: Props) {
  return (
    <section className="w-full min-w-0 max-w-full overflow-hidden rounded-[4px] bg-[#f7f7f7] shadow-lg">
      <div className="w-full min-w-0 overflow-x-auto">
        <table className="w-full min-w-[980px] border-collapse text-[#08264d]">
          <thead>
            <tr className="bg-[#f7f7f7] text-lg font-bold sm:text-2xl">
              <th className="w-[54px] border-r border-[#08264d]/40 px-2 py-3" />
              <th className="border-r border-[#08264d]/40 px-4 py-3 text-center">Producto</th>
              <th className="border-r border-[#08264d]/40 px-4 py-3 text-center">Usuario</th>
              <th className="border-r border-[#08264d]/40 px-4 py-3 text-center">Fecha</th>
              <th className="border-r border-[#08264d]/40 px-4 py-3 text-center">#Cantidad</th>
              <th className="border-r border-[#08264d]/40 px-4 py-3 text-center">Ubicación</th>
              <th className="border-r border-[#08264d]/40 px-4 py-3 text-center">Total</th>
              <th className="px-4 py-3 text-center">Estatus</th>
            </tr>
          </thead>

          <tbody className="text-base sm:text-2xl">
            {rows.map((row, index) => (
              <tr
                key={row.id}
                className={index % 2 === 0 ? 'bg-[#dcdcdc]' : 'bg-[#f7f7f7]'}
              >
                <td className="px-3 py-2">
                  <Pencil className="h-6 w-6 text-[#08264d] sm:h-7 sm:w-7" />
                </td>
                <td className="px-4 py-2">{row.producto}</td>
                <td className="px-4 py-2">{row.usuario}</td>
                <td className="px-4 py-2 text-center">{formatDate(row.fecha)}</td>
                <td className="px-4 py-2 text-center">{row.cantidad}</td>
                <td className="px-4 py-2 text-center">{row.ubicacion}</td>
                <td className="px-4 py-2 text-center">{formatMoney(row.total)}</td>
                <td className="px-4 py-2 text-center">
                  <span className="inline-flex min-w-[110px] justify-center rounded-full bg-[#35bf49] px-4 py-1 text-sm font-semibold text-white">
                    {row.estatus}
                  </span>
                </td>
              </tr>
            ))}

            {rows.length === 0 && (
              <tr>
                <td colSpan={8} className="bg-[#dcdcdc] px-4 py-10 text-center text-lg font-semibold">
                  No hay entradas registradas.
                </td>
              </tr>
            )}

            {Array.from({ length: 8 }).map((_, index) => (
              <tr
                key={`empty-${index}`}
                className={index % 2 === 0 ? 'bg-[#dcdcdc]' : 'bg-[#f7f7f7]'}
              >
                <td colSpan={8} className="h-[46px]" />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}