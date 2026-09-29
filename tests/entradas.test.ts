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

test('entradas uses mobile cards and keeps the desktop table isolated at md and above', () => {
  const table = readFileSync('app/_components/entradas-table.tsx', 'utf8');
  assert.match(table, /md:hidden/);
  assert.match(table, /hidden[^\"]*md:block/);
  assert.match(table, /No hay entradas registradas\./);
  assert.match(table, /min-w-0/);
  assert.match(table, /min-w-\[980px\]/);
  assert.match(table, /hidden[^\"]*md:block[\s\S]*?min-w-\[980px\]/);
  assert.match(table, /rows\.length === 0/);
});

test('entrada page and modal constrain mobile width, height, and background scrolling', () => {
  const page = readFileSync('app/(sidebar-pages)/entradas/page.tsx', 'utf8');
  const modal = readFileSync('app/_components/entrada-modal.tsx', 'utf8');
  assert.match(page, /w-full[^\n]*max-w-full[^\n]*min-w-0[^\n]*overflow-x-hidden/);
  assert.match(page, /header className="[^"]*min-w-0/);
  assert.match(page, /w-full min-w-0/);
  assert.match(page, /w-full[^"]*sm:w-fit/);
  assert.match(modal, /max-h-\[calc\(100dvh-24px\)\]/);
  assert.match(modal, /document\.body\.style\.overflow = "hidden"/);
  assert.match(modal, /document\.body\.style\.overflow = previousOverflow/);
  assert.match(modal, /flex-col-reverse[\s\S]*sm:flex-row/);
});
