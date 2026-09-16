export type TransferenciaPayload = {
  inventario_hamaca_id: number;
  ubicacion_destino_id: number;
  cantidad: number;
  fecha?: string;
};

type TransferenciaInput = {
  inventarioHamacaId: number;
  ubicacionDestinoId: number;
  cantidad: number;
  fecha?: string;
};

export function buildTransferenciaPayload({
  inventarioHamacaId,
  ubicacionDestinoId,
  cantidad,
  fecha,
}: TransferenciaInput): TransferenciaPayload {
  const payload: TransferenciaPayload = {
    inventario_hamaca_id: inventarioHamacaId,
    ubicacion_destino_id: ubicacionDestinoId,
    cantidad,
  };

  if (fecha) {
    payload.fecha = fecha;
  }

  return payload;
}
