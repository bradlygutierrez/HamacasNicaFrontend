import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildSalidaMovimientoPayload,
  buildSalidaTransferPayload,
} from '../app/_lib/salidas.ts';

test('builds a movimiento payload for an inventory exit', () => {
  const payload = buildSalidaMovimientoPayload({
    inventarioHamacaId: 18,
    usuarioId: 4,
    cantidad: 2,
    fecha: '2026-06-18',
    ubicacionOrigenId: 3,
  });

  assert.deepEqual(payload, {
    inventario_hamaca_id: 18,
    usuario_id: 4,
    tipo: 'salida',
    cantidad: 2,
    fecha: '2026-06-18',
    ubicacion_origen_id: 3,
  });
});

test('builds a transfer payload that discounts stock for an exit', () => {
  const payload = buildSalidaTransferPayload({
    inventarioHamacaId: 18,
    cantidad: 2,
  });

  assert.deepEqual(payload, {
    inventario_hamaca_id: 18,
    cantidad: 2,
  });
});
