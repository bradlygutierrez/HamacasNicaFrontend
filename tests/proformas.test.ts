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
  assert.match(editor, /hamaca_id: line\.product\.id/);
  assert.match(editor, /line\.hamaca\?\.colores/);
  assert.match(editor, /nombre: line\.nombre \?\? line\.hamaca_nombre_snapshot/);
  assert.match(editor, /productLabel/);
  assert.doesNotMatch(editor, /variante|hamaca_variante/);
  assert.match(editor, /selectedClientId/);
  assert.match(editor, /commissionRate/);
  assert.match(editor, /materiales_agrupados/);
  assert.match(editor, /Precio unitario/);
  assert.match(editor, /Descuento/);
  assert.match(editor, /ProformaServiceCard/);
  assert.doesNotMatch(editor, /Costo interno override/);
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

test('proforma editor labels all discount levels and renders human summary labels', () => {
  const editor = readFileSync(resolve(root, 'app/_components/proforma-editor.tsx'), 'utf8');
  const serviceCard = readFileSync(resolve(root, 'app/_components/proforma-service-card.tsx'), 'utf8');

  assert.match(editor, /Descuento global \(C\$\)/);
  assert.match(editor, /descuento_global: Number\(discount \|\| 0\)/);
  assert.match(editor, /setDiscount\(event\.target\.value\); setPreview\(null\)/);
  assert.match(editor, /Descuento del producto \(C\$\)/);
  assert.match(serviceCard, /Precio unitario \(C\$\)/);
  assert.match(serviceCard, /Descuento del servicio \(C\$\)/);
  assert.match(serviceCard, /Detalle \(opcional\)/);
  assert.match(serviceCard, /Costo interno personalizado \(C\$\)/);
  assert.match(serviceCard, /Solo visible para administración\. Dejalo vacío para usar el costo configurado\./);
  assert.match(serviceCard, /subtotal estimado/i);
  assert.match(serviceCard, /Agregar desglose/);
  assert.match(serviceCard, /Total del desglose/);
  assert.match(serviceCard, /Descripción del concepto/);
  assert.match(editor, /Servicios adicionales/);
  assert.doesNotMatch(editor, /Servicios generales/);
  assert.match(editor, /servicios_pedido:/);
  assert.match(editor, /Aplicar IVA/);
  assert.match(editor, /Tasa IVA \(%\)/);
  assert.match(editor, /Aplicar IR/);
  assert.match(editor, /Comisión del vendedor \(%\)/);
  assert.match(editor, /Subtotal bruto/);
  assert.match(editor, /Descuentos por líneas/);
  assert.match(editor, /Descuento global/);
  assert.match(editor, /desglose: item\.desglose\.map/);
  assert.doesNotMatch(editor, /<span>\{key\}<\/span>/);
});

test('new proforma editor keeps its header, fields and quick-client dialog usable on mobile', () => {
  const editor = readFileSync(resolve(root, 'app/_components/proforma-editor.tsx'), 'utf8');

  assert.match(editor, /w-full min-w-0 max-w-full overflow-x-hidden/);
  assert.match(editor, /header className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"/);
  assert.match(editor, /className="flex min-w-0 flex-col gap-2 sm:flex-row"/);
  assert.match(editor, /h-10 w-full min-w-0 flex-1/);
  assert.match(editor, /grid min-w-0 gap-5 xl:grid-cols-\[minmax\(0,1fr\)_360px\]/);
  assert.match(editor, /max-h-\[calc\(100dvh-2rem\)\][^\"]*overflow-y-auto/);
  assert.match(editor, /flex flex-col-reverse gap-2 sm:flex-row sm:justify-end/);
});

test('proforma list stacks its header and keeps filters, cards and pagination inside mobile width', () => {
  const list = readFileSync(resolve(root, 'app/(sidebar-pages)/proformas/page.tsx'), 'utf8');

  assert.match(list, /flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between/);
  assert.match(list, /w-fit self-end rounded bg-white px-4 py-2 text-center[^\"]*sm:w-auto/);
  assert.match(list, /relative h-11 w-full min-w-0 flex-1/);
  assert.match(list, /h-11 w-full min-w-0 rounded bg-white/);
  assert.match(list, /min-w-0 flex-1/);
  assert.match(list, /break-words font-bold/);
  assert.match(list, /grid grid-cols-\[1fr_auto_1fr\][^\"]*sm:flex/);
});

test('proforma routes exist and phase five links are absent', () => {
  assert.ok(readFileSync(resolve(root, 'app/(sidebar-pages)/proformas/nueva/page.tsx'), 'utf8'));
  assert.ok(readFileSync(resolve(root, 'app/(sidebar-pages)/proformas/[id]/page.tsx'), 'utf8'));
  const permissions = readFileSync(resolve(root, 'app/_lib/permissions.ts'), 'utf8');
  assert.match(permissions, /href: "\/proformas"/);
  assert.doesNotMatch(permissions, /href: "\/facturar"/);
});
