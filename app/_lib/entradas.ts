export type EntradaPayload = {
  hamaca_variante_id: number;
  usuario_id: number;
  ubicacion_id: number;
  cantidad: number;
  fecha?: string;
};

type EntradaInput = {
  hamacaVarianteId: number;
  usuarioId: number;
  ubicacionId: number;
  cantidad: number;
  fecha?: string;
};

export function buildEntradaPayload({
  hamacaVarianteId,
  usuarioId,
  ubicacionId,
  cantidad,
  fecha,
}: EntradaInput): EntradaPayload {
  const payload: EntradaPayload = {
    hamaca_variante_id: hamacaVarianteId,
    usuario_id: usuarioId,
    ubicacion_id: ubicacionId,
    cantidad,
  };

  if (fecha) {
    payload.fecha = fecha;
  }

  return payload;
}
