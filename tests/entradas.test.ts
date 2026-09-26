import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import {
  buildEntradaPayload,
} from '../app/_lib/entradas.ts';

test('builds one atomic entrada payload for the backend operation endpoint', () => {
  const payload = buildEntradaPayload({
    hamacaId: 8,
    usuarioId: 4,
    ubicacionId: 2,
    cantidad: 6,
    fecha: '2026-06-18',
  });

  assert.deepEqual(payload, {
    hamaca_id: 8,
    usuario_id: 4,
    ubicacion_id: 2,
    cantidad: 6,
    fecha: '2026-06-18',
  });
});

test('entrada modal selects a Hamaca directly and excludes variant fields', () => {
  const modal = readFileSync('app/_components/entrada-modal.tsx', 'utf8');
  assert.match(modal, /apiFetch\("\/hamacas\?per_page=100"\)/);
  assert.match(modal, /hamaca_id/);
  assert.doesNotMatch(modal, /hamaca-variantes|hamaca_variante_id|variante/);
});
