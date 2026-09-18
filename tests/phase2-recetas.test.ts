import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

test('formula pages use versioning, cost and service formula endpoints', () => {
  const list = readFileSync(resolve(root, 'app/(sidebar-pages)/formulas/page.tsx'), 'utf8');
  const editor = readFileSync(resolve(root, 'app/(sidebar-pages)/formulas/[hamacaId]/page.tsx'), 'utf8');
  const service = readFileSync(resolve(root, 'app/(sidebar-pages)/servicios-adicionales/[id]/formula/page.tsx'), 'utf8');
  const selector = readFileSync(resolve(root, 'app/_components/async-catalog-selector.tsx'), 'utf8');

  assert.match(list, /\/formulas/);
  assert.doesNotMatch(list, /\/hamacas\/\$\{.*\}\/recetas/);
  assert.match(editor, /\/recetas/);
  assert.match(editor, /\/costos/);
  assert.match(editor, /\/activar/);
  assert.match(editor, /material\?\.nombre/);
  assert.match(editor, /proceso\?\.nombre/);
  assert.match(editor, /Costo estimado con precios actuales/);
  assert.match(editor, /Observaciones/);
  assert.match(service, /\/formula/);
  assert.match(service, /\/costos/);
  assert.match(selector, /search/);
  assert.match(selector, /per_page=20/);
});

test('formula UI gates mutations and does not introduce phase three links', () => {
  const editor = readFileSync(resolve(root, 'app/(sidebar-pages)/formulas/[hamacaId]/page.tsx'), 'utf8');
  const service = readFileSync(resolve(root, 'app/(sidebar-pages)/servicios-adicionales/[id]/formula/page.tsx'), 'utf8');
  const permissions = readFileSync(resolve(root, 'app/_lib/permissions.ts'), 'utf8');

  assert.match(editor, /useCatalogCapabilities/);
  assert.match(editor, /canCreate/);
  assert.match(editor, /canEdit/);
  assert.match(editor, /canDelete/);
  assert.match(service, /canEdit/);
  assert.match(editor, /inspectHistory/);
  assert.match(editor, /editable = Boolean/);
  assert.match(editor, /historyRecipe\.materiales/);
  assert.match(service, /Quitar material/);
  assert.match(service, /Quitar proceso/);
  assert.doesNotMatch(permissions, /href: "\/pedidos"/);
});
