import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('inventory cards expose relocation action wired to transfer modal', () => {
  const page = readFileSync('app/(sidebar-pages)/inventario-hamacas/page.tsx', 'utf8');
  const card = readFileSync('app/_components/inventario-hamaca-card.tsx', 'utf8');

  assert.match(card, /onCreateTransfer/);
  assert.match(card, /Reubicar/);
  assert.match(page, /TransferenciaModal/);
  assert.match(page, /setSelectedTransferInventarioId\(item\.id\)/);
  assert.match(page, /initialInventarioId=\{selectedTransferInventarioId\}/);
});

test('inventory view requests up to 100 rows instead of hiding later pages', () => {
  const page = readFileSync('app/(sidebar-pages)/inventario-hamacas/page.tsx', 'utf8');
  assert.match(page, /inventario-hamacas\?per_page=100/);
});
