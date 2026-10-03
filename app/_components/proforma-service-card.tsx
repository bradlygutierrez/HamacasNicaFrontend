import {
  calculateBreakdownPricing,
  calculateAdditionalServiceSubtotal,
  validateAdditionalServiceField,
} from '@/app/_lib/proforma-services';

type ServiceLine = {
  service: {
    id: number;
    nombre: string;
    metodo_calculo: string;
    alcance: string;
    precio_venta_actual: string | number;
  };
  cantidad: string;
  detalle: string;
  precio_unitario: string;
  descuento: string;
  costo_base_unitario_override: string;
  desglose: Array<{ descripcion: string; monto: string; orden: number }>;
};

type Props = {
  item: ServiceLine;
  editable: boolean;
  showInternalCost: boolean;
  onChange: (patch: Partial<ServiceLine>) => void;
  onRemove: () => void;
};

function inputClass(hasError: boolean) {
  return `mt-1 h-10 w-full min-w-0 rounded border bg-white px-3 text-sm outline-none ${
    hasError
      ? 'border-red-600 focus:ring-2 focus:ring-red-200'
      : 'border-[#002060]/30 focus:border-[#002060] focus:ring-2 focus:ring-[#002060]/15'
  }`;
}

export default function ProformaServiceCard({
  item,
  editable,
  showInternalCost,
  onChange,
  onRemove,
}: Props) {
  const quantityError = validateAdditionalServiceField('cantidad', item.cantidad);
  const unitPriceError = validateAdditionalServiceField('precio_unitario', item.precio_unitario);
  const breakdownPricing = item.desglose.length
    ? calculateBreakdownPricing(item.desglose, item.cantidad, item.descuento)
    : null;
  const discountError = validateAdditionalServiceField(
    'descuento',
    item.descuento,
    item.cantidad,
    item.precio_unitario,
    breakdownPricing?.gross
  );
  const subtotal = calculateAdditionalServiceSubtotal(
    item.cantidad,
    item.precio_unitario,
    item.descuento
  );
  const breakdownTotal = breakdownPricing?.gross ?? 0;
  const displayedSubtotal = breakdownPricing?.subtotal ?? subtotal;
  const updateBreakdown = (index: number, patch: Partial<ServiceLine['desglose'][number]>) => {
    onChange({ desglose: item.desglose.map((row, rowIndex) => rowIndex === index ? { ...row, ...patch } : row) });
  };

  return (
    <article className="min-w-0 rounded border border-[#002060]/15 bg-white p-3 sm:p-4">
      <div className="flex min-w-0 items-start justify-between gap-3">
        <h3 className="min-w-0 break-words font-bold">{item.service.nombre}</h3>
        {editable ? (
          <button
            type="button"
            onClick={onRemove}
            className="shrink-0 rounded px-2 py-1 text-xs font-semibold text-red-600 transition hover:bg-red-50"
          >
            Quitar
          </button>
        ) : null}
      </div>

      {editable ? (
        <div className="mt-3 grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="min-w-0 text-xs font-bold">
            Cantidad
            <input
              type="number"
              min="0.0001"
              step="0.0001"
              value={item.cantidad}
              onChange={(event) => onChange({ cantidad: event.target.value })}
              aria-invalid={Boolean(quantityError)}
              className={inputClass(Boolean(quantityError))}
              placeholder="Ej. 1"
            />
            {quantityError ? <span role="alert" className="mt-1 block text-xs font-medium text-red-700">{quantityError}</span> : null}
          </label>

          <label className="min-w-0 text-xs font-bold">
            {item.desglose.length ? 'Precio unitario aproximado (C$)' : 'Precio unitario (C$)'}
            <input
              type="number"
              min="0"
              step="0.01"
              value={item.precio_unitario}
              readOnly={item.desglose.length > 0}
              onChange={(event) => onChange({ precio_unitario: event.target.value })}
              aria-invalid={Boolean(unitPriceError)}
              className={inputClass(Boolean(unitPriceError))}
              placeholder="Ej. 150"
            />
            {item.desglose.length ? <span className="mt-1 block text-xs font-normal text-[#002060]">Importe bruto exacto según desglose: C$ {breakdownTotal.toFixed(2)}. El precio por unidad se redondea a centavos.</span> : null}
            {unitPriceError ? <span role="alert" className="mt-1 block text-xs font-medium text-red-700">{unitPriceError}</span> : null}
          </label>

          <label className="min-w-0 text-xs font-bold">
            Descuento del servicio (C$)
            <input
              type="number"
              min="0"
              step="0.01"
              value={item.descuento}
              onChange={(event) => onChange({ descuento: event.target.value })}
              aria-invalid={Boolean(discountError)}
              className={inputClass(Boolean(discountError))}
              placeholder="Ej. 0"
            />
            {discountError ? <span role="alert" className="mt-1 block text-xs font-medium text-red-700">{discountError}</span> : null}
          </label>

          {showInternalCost ? (
            <label className="min-w-0 text-xs font-bold">
              Costo interno personalizado (C$)
              <input
                type="number"
                min="0"
                step="0.01"
                value={item.costo_base_unitario_override}
                onChange={(event) => onChange({ costo_base_unitario_override: event.target.value })}
                className={inputClass(false)}
                placeholder="Dejar vacío para usar el costo configurado"
              />
              <span className="mt-1 block text-xs font-normal text-[#002060]">Solo visible para administración. Dejalo vacío para usar el costo configurado.</span>
            </label>
          ) : null}

          <label className="min-w-0 text-xs font-bold sm:col-span-2">
            Detalle (opcional)
            <input
              type="text"
              value={item.detalle}
              onChange={(event) => onChange({ detalle: event.target.value })}
              className={inputClass(false)}
              placeholder="Ej. Nombre personalizado, diseño especial, color, etc."
            />
          </label>
        </div>
      ) : (
        <div className="mt-2 space-y-1 break-words text-sm text-[#002060]">
          {breakdownPricing ? <p>Cantidad: {item.cantidad} · Importe bruto según desglose: C$ {breakdownTotal.toFixed(2)} · Precio unitario aprox.: C$ {item.precio_unitario} · Descuento: C$ {item.descuento}</p> : <p>{item.cantidad} × C$ {item.precio_unitario} · Descuento C$ {item.descuento}</p>}
          {item.detalle ? <p>Detalle: {item.detalle}</p> : null}
        </div>
      )}

      {item.desglose.length ? <section className="mt-3 border-t border-[#002060]/10 pt-3" aria-label={`Desglose de ${item.service.nombre}`}>
        <h4 className="text-xs font-bold uppercase tracking-wide text-[#002060]">Desglose</h4>
        <div className="mt-2 space-y-2">{item.desglose.map((row, index) => <div key={`${row.orden}-${index}`} className="grid grid-cols-[minmax(0,1fr)_110px_auto] items-center gap-2">
          {editable ? <><input aria-label="Descripción del concepto" value={row.descripcion} onChange={(event) => updateBreakdown(index, { descripcion: event.target.value })} placeholder="Descripción" className="h-9 min-w-0 rounded border border-[#002060]/20 px-2 text-sm" /><input aria-label="Monto del concepto" type="number" min="0" step="0.01" value={row.monto} onChange={(event) => updateBreakdown(index, { monto: event.target.value })} className="h-9 min-w-0 rounded border border-[#002060]/20 px-2 text-right text-sm" /><button type="button" aria-label="Eliminar concepto" onClick={() => onChange({ desglose: item.desglose.filter((_, rowIndex) => rowIndex !== index).map((value, order) => ({ ...value, orden: order + 1 })) })} className="rounded px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-50">Quitar</button></> : <><span className="break-words text-sm">{row.descripcion}</span><span className="text-right text-sm tabular-nums">C$ {Number(row.monto).toFixed(2)}</span><span /></>}
        </div>)}</div>
        {editable ? <button type="button" onClick={() => onChange({ desglose: [...item.desglose, { descripcion: '', monto: '0', orden: item.desglose.length + 1 }] })} className="mt-2 rounded px-2 py-1 text-xs font-bold text-[#002060] hover:bg-[#002060]/5">+ Agregar concepto</button> : null}
        <p className="mt-2 flex justify-between border-t border-[#002060]/10 pt-2 text-sm font-bold"><span>Total del desglose</span><span className="tabular-nums">C$ {breakdownTotal.toFixed(2)}</span></p>
      </section> : editable ? <button type="button" onClick={() => onChange({ desglose: [{ descripcion: '', monto: '0', orden: 1 }] })} className="mt-3 rounded px-2 py-1 text-xs font-bold text-[#002060] hover:bg-[#002060]/5">+ Agregar desglose</button> : null}

      <p className="mt-3 border-t border-[#002060]/15 pt-3 text-sm font-bold">
        Subtotal estimado: C$ {Number.isFinite(displayedSubtotal) ? displayedSubtotal.toFixed(2) : '0.00'}
      </p>
    </article>
  );
}
