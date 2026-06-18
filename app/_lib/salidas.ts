export type SalidaMovimientoPayload = {
  inventario_hamaca_id: number;
  usuario_id: number;
  tipo: 'salida';
  cantidad: number;
  fecha: string;
  ubicacion_origen_id?: number;
};

export type SalidaTransferPayload = {
  inventario_hamaca_id: number;
  cantidad: number;
};

type SalidaTransferInput = {
  inventarioHamacaId: number;
  cantidad: number;
};

type SalidaMovimientoInput = {
  inventarioHamacaId: number;
  usuarioId: number;
  cantidad: number;
  fecha: string;
  ubicacionOrigenId?: number | null;
};

export function buildSalidaTransferPayload({
  inventarioHamacaId,
  cantidad,
}: SalidaTransferInput): SalidaTransferPayload {
  return {
    inventario_hamaca_id: inventarioHamacaId,
    cantidad,
  };
}

export function buildSalidaMovimientoPayload({
  inventarioHamacaId,
  usuarioId,
  cantidad,
  fecha,
  ubicacionOrigenId,
}: SalidaMovimientoInput): SalidaMovimientoPayload {
  const payload: SalidaMovimientoPayload = {
    inventario_hamaca_id: inventarioHamacaId,
    usuario_id: usuarioId,
    tipo: 'salida',
    cantidad,
    fecha,
  };

  if (ubicacionOrigenId) {
    payload.ubicacion_origen_id = ubicacionOrigenId;
  }

  return payload;
}
