import {
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
      : 'border-[#456f89]/30 focus:border-[#123852] focus:ring-2 focus:ring-[#123852]/15'
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
  const discountError = validateAdditionalServiceField(
    'descuento',
    item.descuento,
    item.cantidad,
    item.precio_unitario
  );
  const subtotal = calculateAdditionalServiceSubtotal(
    item.cantidad,
    item.precio_unitario,
    item.descuento
  );

  return (
    <article className="min-w-0 rounded border border-[#456f89]/20 bg-white p-3 sm:p-4">
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
            Precio unitario (C$)
            <input
              type="number"
              min="0"
              step="0.01"
              value={item.precio_unitario}
              onChange={(event) => onChange({ precio_unitario: event.target.value })}
              aria-invalid={Boolean(unitPriceError)}
              className={inputClass(Boolean(unitPriceError))}
              placeholder="Ej. 150"
            />
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
              <span className="mt-1 block text-xs font-normal text-[#456f89]">Solo visible para administración. Dejalo vacío para usar el costo configurado.</span>
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
        <div className="mt-2 space-y-1 break-words text-sm text-[#456f89]">
          <p>{item.cantidad} × C$ {item.precio_unitario} · Descuento C$ {item.descuento}</p>
          {item.detalle ? <p>Detalle: {item.detalle}</p> : null}
        </div>
      )}

      <p className="mt-3 border-t border-[#456f89]/15 pt-3 text-sm font-bold">
        Subtotal estimado: C$ {Number.isFinite(subtotal) ? subtotal.toFixed(2) : '0.00'}
      </p>
    </article>
  );
}
