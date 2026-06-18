export type EntradaMovimientoPayload = {
  inventario_hamaca_id: number;
  usuario_id: number;
  tipo: 'entrada';
  cantidad: number;
  fecha: string;
  ubicacion_destino_id?: number;
};

export type EntradaInventarioPayload = {
  hamaca_id: number;
  usuario_id: number;
  ubicacion_id: number;
  color_ids: number[];
  cantidad: number;
};

type EntradaInventarioInput = {
  hamacaId: number;
  usuarioId: number;
  ubicacionId: number;
  colorIds: number[];
  cantidad: number;
};

type EntradaMovimientoInput = {
  inventarioHamacaId: number;
  usuarioId: number;
  cantidad: number;
  fecha: string;
  ubicacionDestinoId?: number | null;
};

export function buildEntradaInventarioPayload({
  hamacaId,
  usuarioId,
  ubicacionId,
  colorIds,
  cantidad,
}: EntradaInventarioInput): EntradaInventarioPayload {
  return {
    hamaca_id: hamacaId,
    usuario_id: usuarioId,
    ubicacion_id: ubicacionId,
    color_ids: colorIds,
    cantidad,
  };
}

export function buildEntradaMovimientoPayload({
  inventarioHamacaId,
  usuarioId,
  cantidad,
  fecha,
  ubicacionDestinoId,
}: EntradaMovimientoInput): EntradaMovimientoPayload {
  const payload: EntradaMovimientoPayload = {
    inventario_hamaca_id: inventarioHamacaId,
    usuario_id: usuarioId,
    tipo: 'entrada',
    cantidad,
    fecha,
  };

  if (ubicacionDestinoId) {
    payload.ubicacion_destino_id = ubicacionDestinoId;
  }

  return payload;
}
