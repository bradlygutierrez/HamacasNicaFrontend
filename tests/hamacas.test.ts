import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildFotoPayload,
  buildHamacaPayload,
  normalizePhotoRoutes,
} from '../app/_lib/hamacas.ts';

test('builds a hamaca payload with trimmed text and nullable description', () => {
  const payload = buildHamacaPayload({
    nombre: '  Hamaca Familiar  ',
    descripcion: '   ',
    categoriaId: 2,
    tamanoId: 3,
    precio: 1500,
  });

  assert.deepEqual(payload, {
    nombre: 'Hamaca Familiar',
    descripcion: null,
    categoria_id: 2,
    tamano_id: 3,
    precio: 1500,
  });
});

test('normalizes multiple photo routes before saving', () => {
  const routes = normalizePhotoRoutes([
    ' https://cdn.test/uno.jpg ',
    '',
    '   ',
    '/uploads/dos.jpg',
  ]);

  assert.deepEqual(routes, ['https://cdn.test/uno.jpg', '/uploads/dos.jpg']);
});

test('builds a foto payload attached to one hamaca', () => {
  const payload = buildFotoPayload({
    hamacaId: 8,
    ruta: ' /uploads/hamaca.jpg ',
  });

  assert.deepEqual(payload, {
    ruta: '/uploads/hamaca.jpg',
    hamaca_ids: [8],
  });
});
