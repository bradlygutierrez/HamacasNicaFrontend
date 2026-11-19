import { translateText } from "@/app/_lib/localization";
import { Pencil } from 'lucide-react';

export type EntradaRow = {
  id: number;
  editable: boolean;
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
  onEdit: (row: EntradaRow) => void;
};

const stripedRow = "border-b border-[var(--color-table-border)] odd:bg-[var(--color-table-row-odd)] even:bg-[var(--color-table-row-even)]";

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

function EditButton({ row, onEdit }: { row: EntradaRow; onEdit: (row: EntradaRow) => void }) {
  const label = row.editable ? "Editar entrada" : "Las entradas vinculadas a ventas o pedidos no se pueden editar";

  return (
    <button
      type="button"
      onClick={() => onEdit(row)}
      disabled={!row.editable}
      title={label}
      aria-label={label}
      className="inline-flex h-9 w-9 items-center justify-center rounded text-[#08264d] hover:bg-[#08264d]/10 disabled:cursor-not-allowed disabled:opacity-40"
    >
      <Pencil className="h-5 w-5" />
    </button>
  );
}

export default function EntradasTable({ rows, onEdit }: Props) {
  return (
    <section className="w-full min-w-0 max-w-full overflow-hidden rounded-[4px] bg-[var(--color-table-background)] shadow-lg">
      <div className="space-y-3 p-3 md:hidden">
        {rows.length === 0 ? (
          <div className="rounded-md bg-[var(--color-table-row-odd)] px-4 py-8 text-center text-sm font-semibold text-[#08264d]">
            {translateText("No hay entradas registradas.\n          ")}</div>
        ) : rows.map((row) => (
          <article key={row.id} className="min-w-0 rounded-md border border-[var(--color-table-border)] bg-[var(--color-table-card)] p-4 text-[#08264d] shadow-sm">
            <h2 className="break-words text-base font-bold">{row.producto}</h2>
            <dl className="mt-3 grid min-w-0 grid-cols-2 gap-x-3 gap-y-3">
              <div className="min-w-0">
                <dt className="text-xs text-[var(--color-text-muted)]">{translateText("Usuario")}</dt>
                <dd className="break-words text-sm font-medium">{row.usuario}</dd>
              </div>
              <div className="min-w-0">
                <dt className="text-xs text-[var(--color-text-muted)]">{translateText("Fecha")}</dt>
                <dd className="break-words text-sm font-medium">{formatDate(row.fecha)}</dd>
              </div>
              <div className="min-w-0">
                <dt className="text-xs text-[var(--color-text-muted)]">{translateText("Cantidad")}</dt>
                <dd className="break-words text-sm font-medium">{row.cantidad}</dd>
              </div>
              <div className="min-w-0">
                <dt className="text-xs text-[var(--color-text-muted)]">{translateText("Ubicación")}</dt>
                <dd className="break-words text-sm font-medium">{row.ubicacion}</dd>
              </div>
              <div className="min-w-0">
                <dt className="text-xs text-[var(--color-text-muted)]">{translateText("Total")}</dt>
                <dd className="break-words text-sm font-medium">{translateText("C$ ")}{formatMoney(row.total)}</dd>
              </div>
            </dl>
            <div className="mt-3 flex justify-end">
              <div className="flex items-center gap-2">
                <span className={`${row.estatus === "Aplicado" ? "status-success" : "status-danger"} inline-flex max-w-full justify-center break-words rounded-full px-3 py-1 text-xs font-semibold`}>
                  {row.estatus}
                </span>
                <EditButton row={row} onEdit={onEdit} />
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="hidden w-full min-w-0 overflow-x-auto md:block">
        <table className="w-full min-w-[980px] border-collapse text-[#08264d]">
          <thead>
            <tr className="bg-[var(--color-table-header)] text-sm font-bold sm:text-base">
              <th className="border-r border-[var(--color-table-border)] px-4 py-3 text-center">{translateText("Producto")}</th>
              <th className="border-r border-[var(--color-table-border)] px-4 py-3 text-center">{translateText("Usuario")}</th>
              <th className="border-r border-[var(--color-table-border)] px-4 py-3 text-center">{translateText("Fecha")}</th>
              <th className="border-r border-[var(--color-table-border)] px-4 py-3 text-center">{translateText("#Cantidad")}</th>
              <th className="border-r border-[var(--color-table-border)] px-4 py-3 text-center">{translateText("Ubicación")}</th>
              <th className="border-r border-[var(--color-table-border)] px-4 py-3 text-center">{translateText("Total")}</th>
              <th className="border-r border-[var(--color-table-border)] px-4 py-3 text-center">{translateText("Estatus")}</th>
              <th className="px-2 py-3 text-center">{translateText("Editar")}</th>
            </tr>
          </thead>
          <tbody className="text-sm sm:text-base">
            {rows.map((row) => (
              <tr key={row.id} className={stripedRow}>
                <td className="px-4 py-2">{row.producto}</td>
                <td className="px-4 py-2">{row.usuario}</td>
                <td className="px-4 py-2 text-center">{formatDate(row.fecha)}</td>
                <td className="px-4 py-2 text-center">{row.cantidad}</td>
                <td className="px-4 py-2 text-center">{row.ubicacion}</td>
                <td className="px-4 py-2 text-center">{formatMoney(row.total)}</td>
                <td className="px-4 py-2 text-center">
                  <span className={`${row.estatus === "Aplicado" ? "status-success" : "status-danger"} inline-flex min-w-[110px] justify-center rounded-full px-4 py-1 text-sm font-semibold`}>{row.estatus}</span>
                </td>
                <td className="px-2 py-2 text-center"><EditButton row={row} onEdit={onEdit} /></td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={8} className="bg-[var(--color-table-row-odd)] px-4 py-10 text-center text-sm font-semibold">{translateText("No hay entradas registradas.")}</td></tr>
            )}
            {Array.from({ length: 8 }).map((_, index) => (
              <tr key={`empty-${index}`} className={stripedRow}>
                <td colSpan={8} className="h-[46px]" />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
