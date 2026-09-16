import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('catalog cards expose edit action wired to hamaca modal', () => {
  const page = readFileSync('app/(sidebar-pages)/catalogo-hamacas/page.tsx', 'utf8');

  assert.match(page, /selectedHamacaToEdit/);
  assert.match(page, /onEdit=\{\(\) =>/);
  assert.match(page, /setSelectedHamacaToEdit\(item\.hamaca\)/);
  assert.match(page, /hamacaToEdit=\{selectedHamacaToEdit\}/);
});

test('catalog page shows toast feedback for load failures', () => {
  const page = readFileSync('app/(sidebar-pages)/catalogo-hamacas/page.tsx', 'utf8');

  assert.match(page, /toast\.error\("No se pudo cargar el catálogo\."\)/);
});
