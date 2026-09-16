import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildSalidaPayload,
} from '../app/_lib/salidas.ts';

test('builds one atomic salida payload for the backend operation endpoint', () => {
  const payload = buildSalidaPayload({
    inventarioHamacaId: 18,
    cantidad: 2,
    fecha: '2026-06-18',
  });

  assert.deepEqual(payload, {
    inventario_hamaca_id: 18,
    cantidad: 2,
    fecha: '2026-06-18',
  });
});
