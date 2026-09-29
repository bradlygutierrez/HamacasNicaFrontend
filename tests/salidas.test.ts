import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

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

test('salidas uses mobile cards and keeps the desktop table isolated at md and above', () => {
  const table = readFileSync('app/_components/salidas-table.tsx', 'utf8');
  assert.match(table, /md:hidden/);
  assert.match(table, /hidden[^\"]*md:block/);
  assert.match(table, /No hay salidas registradas\./);
  assert.match(table, /min-w-0/);
  assert.match(table, /min-w-\[1120px\]/);
  assert.match(table, /hidden[^\"]*md:block[\s\S]*?min-w-\[1120px\]/);
  assert.match(table, /row\.colores/);
});

test('salidas page and modal constrain mobile layout and lock background scrolling', () => {
  const page = readFileSync('app/(sidebar-pages)/salidas/page.tsx', 'utf8');
  const modal = readFileSync('app/_components/salida-modal.tsx', 'utf8');
  assert.match(page, /w-full[^\n]*max-w-full[^\n]*min-w-0[^\n]*overflow-x-hidden/);
  assert.match(page, /header className="[^"]*min-w-0/);
  assert.match(page, /w-full min-w-0/);
  assert.match(page, /w-full[^"]*sm:w-fit/);
  assert.match(page, /\/inventario-hamacas\?per_page=100/);
  assert.match(modal, /\/inventario-hamacas\?per_page=100/);
  assert.doesNotMatch(modal, /left-\[64px\]/);
  assert.match(modal, /fixed inset-0/);
  assert.match(modal, /max-h-\[calc\(100dvh-24px\)\]/);
  assert.match(modal, /document\.body\.style\.overflow = 'hidden'/);
  assert.match(modal, /document\.body\.style\.overflow = previousOverflow/);
  assert.match(modal, /flex-col-reverse[\s\S]*sm:flex-row/);
});

test('salidas reads colors from the nested hamaca resource', () => {
  const page = readFileSync('app/(sidebar-pages)/salidas/page.tsx', 'utf8');
  const modal = readFileSync('app/_components/salida-modal.tsx', 'utf8');

  assert.match(page, /hamaca\?:\s*\{[\s\S]*?colores\?:\s*Array</);
  assert.doesNotMatch(page, /\n\s{2}colores\?:\s*Array</);
  assert.match(page, /inv\?\.hamaca\?\.colores\?\.map/);
  assert.match(modal, /hamaca\?:\s*\{[\s\S]*?colores\?:\s*Array</);
  assert.doesNotMatch(modal, /\n\s{2}colores\?:\s*Array</);
  assert.match(modal, /inventario\.hamaca\?\.colores\?\.map/);
  assert.match(page, /\/inventario-hamacas\?per_page=100/);
  assert.match(modal, /\/inventario-hamacas\?per_page=100/);
  assert.match(readFileSync('app/_components/salidas-table.tsx', 'utf8'), /md:hidden[\s\S]*hidden[^"]*md:block/);
});
