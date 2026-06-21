export type EntradaMovimientoPayload = {
  inventario_hamaca_id: number;
  usuario_id: number;
  tipo: "entrada";
  cantidad: number;
  fecha: string;
  ubicacion_destino_id?: number;
};

export type EntradaInventarioPayload = {
  hamaca_variante_id: number;
  usuario_id: number;
  ubicacion_id: number;
  cantidad: number;
};

type EntradaInventarioInput = {
  hamacaVarianteId: number;
  usuarioId: number;
  ubicacionId: number;
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
  hamacaVarianteId,
  usuarioId,
  ubicacionId,
  cantidad,
}: EntradaInventarioInput): EntradaInventarioPayload {
  return {
    hamaca_variante_id: hamacaVarianteId,
    usuario_id: usuarioId,
    ubicacion_id: ubicacionId,
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
    tipo: "entrada",
    cantidad,
    fecha,
  };

  if (ubicacionDestinoId) {
    payload.ubicacion_destino_id = ubicacionDestinoId;
  }

  return payload;
}