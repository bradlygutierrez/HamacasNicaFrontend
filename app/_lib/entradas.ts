export type EntradaPayload = {
  hamaca_id: number;
  usuario_id: number;
  ubicacion_id: number;
  cantidad: number;
  fecha?: string;
};

type EntradaInput = {
  hamacaId: number;
  usuarioId: number;
  ubicacionId: number;
  cantidad: number;
  fecha?: string;
};

export function buildEntradaPayload({
  hamacaId,
  usuarioId,
  ubicacionId,
  cantidad,
  fecha,
}: EntradaInput): EntradaPayload {
  const payload: EntradaPayload = {
    hamaca_id: hamacaId,
    usuario_id: usuarioId,
    ubicacion_id: ubicacionId,
    cantidad,
  };

  if (fecha) {
    payload.fecha = fecha;
  }

  return payload;
}
