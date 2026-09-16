export type SalidaPayload = {
  inventario_hamaca_id: number;
  cantidad: number;
  fecha?: string;
};

type SalidaInput = {
  inventarioHamacaId: number;
  cantidad: number;
  fecha?: string;
};

export function buildSalidaPayload({
  inventarioHamacaId,
  cantidad,
  fecha,
}: SalidaInput): SalidaPayload {
  const payload: SalidaPayload = {
    inventario_hamaca_id: inventarioHamacaId,
    cantidad,
  };

  if (fecha) {
    payload.fecha = fecha;
  }

  return payload;
}
