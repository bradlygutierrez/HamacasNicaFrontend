export type AdditionalServiceField = 'cantidad' | 'precio_unitario' | 'descuento';
export type BreakdownAmount = { descripcion: string; monto: string | number };

export function calculateBreakdownTotal(lines: BreakdownAmount[]) {
  return lines.reduce((total, line) => {
    const amount = Number(line.monto);
    return total + (Number.isFinite(amount) ? amount : 0);
  }, 0);
}

export function calculateBreakdownPricing<T extends BreakdownAmount>(lines: T[], quantity: string | number, discount: string | number = 0) {
  const quantityValue = Number(quantity);
  const totalCents = Math.round(calculateBreakdownTotal(lines) * 100);
  const discountCents = Math.round(Number(discount || 0) * 100);
  if (!Number.isFinite(quantityValue) || quantityValue <= 0 || lines.length === 0) {
    return { unitPrice: '0.00', lines, subtotal: (totalCents - discountCents) / 100 };
  }
  const priceCents = Math.round((totalCents / 100 / quantityValue) * 100);
  return { unitPrice: (priceCents / 100).toFixed(2), lines, subtotal: (totalCents - discountCents) / 100 };
}

export function calculateAdditionalServiceSubtotal(
  quantity: string | number,
  unitPrice: string | number,
  discount: string | number = 0
) {
  const parsedQuantity = Number(quantity);
  const parsedUnitPrice = Number(unitPrice);
  const parsedDiscount = Number(discount);

  if (!Number.isFinite(parsedQuantity) || !Number.isFinite(parsedUnitPrice) || !Number.isFinite(parsedDiscount)) {
    return 0;
  }

  return parsedQuantity * parsedUnitPrice - parsedDiscount;
}

export function validateAdditionalServiceField(
  field: AdditionalServiceField,
  value: string,
  quantity?: string | number,
  unitPrice?: string | number
) {
  const parsedValue = Number(value);

  if (field === 'cantidad' && (!value.trim() || !Number.isFinite(parsedValue) || parsedValue <= 0)) {
    return 'Ingresá una cantidad mayor que 0.';
  }

  if (field === 'precio_unitario' && value.trim() && (!Number.isFinite(parsedValue) || parsedValue < 0)) {
    return 'El precio no puede ser menor que 0.';
  }

  if (field === 'descuento' && value.trim() && (!Number.isFinite(parsedValue) || parsedValue < 0)) {
    return 'El descuento debe ser C$ 0.00 o mayor.';
  }

  if (field === 'descuento' && quantity !== undefined && unitPrice !== undefined) {
    const subtotal = Number(quantity) * Number(unitPrice);
    if (Number.isFinite(subtotal) && parsedValue > subtotal) {
      return 'El descuento no puede superar el subtotal de este elemento.';
    }
  }

  return null;
}
