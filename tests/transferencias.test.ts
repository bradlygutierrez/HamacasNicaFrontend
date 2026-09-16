import test from 'node:test';
import assert from 'node:assert/strict';

import { buildTransferenciaPayload } from '../app/_lib/transferencias.ts';

test('builds one atomic transferencia payload for the backend operation endpoint', () => {
  const payload = buildTransferenciaPayload({
    inventarioHamacaId: 18,
    ubicacionDestinoId: 4,
    cantidad: 2,
    fecha: '2026-09-16',
  });

  assert.deepEqual(payload, {
    inventario_hamaca_id: 18,
    ubicacion_destino_id: 4,
    cantidad: 2,
    fecha: '2026-09-16',
  });
});
