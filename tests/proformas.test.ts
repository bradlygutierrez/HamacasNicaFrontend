import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

test('proforma pages and editor use backend pricing and no inventory mutations', () => {
  const list = readFileSync(resolve(root, 'app/(sidebar-pages)/proformas/page.tsx'), 'utf8');
  const editor = readFileSync(resolve(root, 'app/_components/proforma-editor.tsx'), 'utf8');
  assert.match(list, /proformas\?/);
  assert.match(editor, /POST.*proformas\/calcular|\/proformas\/calcular/);
  assert.match(editor, /proformas\/productos/);
  assert.match(editor, /hamaca_variante_id: line\.product\.id/);
  assert.match(editor, /productLabel/);
  assert.match(editor, /selectedClientId/);
  assert.match(editor, /commissionRate/);
  assert.match(editor, /materiales_agrupados/);
  assert.match(editor, /Precio unitario/);
  assert.match(editor, /Descuento/);
  assert.match(editor, /Costo interno override/);
  assert.match(editor, /currentUserName/);
  assert.match(editor, /assignedSellerName/);
  assert.match(editor, /nombre_cliente: manualClient\.nombre/);
  assert.match(editor, /ruc: manualClient\.ruc/);
  assert.match(editor, /selectedClientRef/);
  assert.match(editor, /assignedSellerName \|\| currentUserName/);
  assert.doesNotMatch(editor, /setSelectedClientId\(null\)/);
  assert.match(editor, /status/);
  assert.match(editor, /Guardar borrador/);
  assert.match(editor, /Emitir proforma/);
  assert.match(editor, /\+ Registrar cliente/);
  assert.match(editor, /setSelectedClientId\(client\.id\)/);
  assert.doesNotMatch(editor, /inventario|movimientos|facturas/);
});

test('proforma editor protects internal controls by role and supports removing services', () => {
  const editor = readFileSync(resolve(root, 'app/_components/proforma-editor.tsx'), 'utf8');
  assert.match(editor, /state === "borrador" && canEdit/);
  assert.match(editor, /costo_base_unitario_override/);
  assert.match(editor, /services\.filter/);
  assert.match(editor, /generalServices\.filter/);
  assert.match(editor, /readOnly={role !== "admin"}/);
});

test('proforma routes exist and phase five links are absent', () => {
  assert.ok(readFileSync(resolve(root, 'app/(sidebar-pages)/proformas/nueva/page.tsx'), 'utf8'));
  assert.ok(readFileSync(resolve(root, 'app/(sidebar-pages)/proformas/[id]/page.tsx'), 'utf8'));
  const permissions = readFileSync(resolve(root, 'app/_lib/permissions.ts'), 'utf8');
  assert.match(permissions, /href: "\/proformas"/);
  assert.doesNotMatch(permissions, /href: "\/facturar"/);
});
