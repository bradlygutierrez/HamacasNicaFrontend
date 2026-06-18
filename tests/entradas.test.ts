import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildEntradaInventarioPayload,
  buildEntradaMovimientoPayload,
} from '../app/_lib/entradas.ts';

test('builds a movimiento payload for a saved entrada inventory record', () => {
  const payload = buildEntradaMovimientoPayload({
    inventarioHamacaId: 12,
    usuarioId: 4,
    cantidad: 3,
    fecha: '2026-06-18',
    ubicacionDestinoId: 2,
  });

  assert.deepEqual(payload, {
    inventario_hamaca_id: 12,
    usuario_id: 4,
    tipo: 'entrada',
    cantidad: 3,
    fecha: '2026-06-18',
    ubicacion_destino_id: 2,
  });
});

test('builds an inventory payload with multiple colors for one hammock entry', () => {
  const payload = buildEntradaInventarioPayload({
    hamacaId: 8,
    usuarioId: 4,
    ubicacionId: 2,
    colorIds: [1, 5],
    cantidad: 6,
  });

  assert.deepEqual(payload, {
    hamaca_id: 8,
    usuario_id: 4,
    ubicacion_id: 2,
    color_ids: [1, 5],
    cantidad: 6,
  });
});
