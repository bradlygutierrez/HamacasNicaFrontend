import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  buildFotoPayload,
  buildHamacaPayload,
  normalizePhotoRoutes,
} from '../app/_lib/hamacas.ts';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

test('hamaca catalog links each model to its contextual production formula action', () => {
  const page = readFileSync(resolve(root, 'app/(sidebar-pages)/catalogo-hamacas/page.tsx'), 'utf8');
  const card = readFileSync(resolve(root, 'app/_components/catalogo-hamaca-card.tsx'), 'utf8');
  const modal = readFileSync(resolve(root, 'app/_components/hamaca-modal.tsx'), 'utf8');

  assert.match(page, /\/formulas\//);
  assert.match(card, /Fórmula de producción/);
  assert.match(page, /Configurar fórmula/);
  assert.match(page, /Continuar fórmula/);
  assert.match(page, /Ver fórmula/);
  assert.doesNotMatch(modal, /fórmula|receta|\/formulas/i);
});

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
