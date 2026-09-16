import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildEntradaPayload,
} from '../app/_lib/entradas.ts';

test('builds one atomic entrada payload for the backend operation endpoint', () => {
  const payload = buildEntradaPayload({
    hamacaVarianteId: 8,
    usuarioId: 4,
    ubicacionId: 2,
    cantidad: 6,
    fecha: '2026-06-18',
  });

  assert.deepEqual(payload, {
    hamaca_variante_id: 8,
    usuario_id: 4,
    ubicacion_id: 2,
    cantidad: 6,
    fecha: '2026-06-18',
  });
});
