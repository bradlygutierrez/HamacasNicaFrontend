import { strict as assert } from "node:assert";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const root = resolve(process.cwd());

test("pedidos pages and permission navigation exist without a new route", () => {
  assert.equal(existsSync(resolve(root, "app/(sidebar-pages)/pedidos/page.tsx")), true);
  assert.equal(existsSync(resolve(root, "app/(sidebar-pages)/pedidos/[id]/page.tsx")), true);
  assert.equal(existsSync(resolve(root, "app/(sidebar-pages)/pedidos/nuevo/page.tsx")), false);
  const permissions = readFileSync(resolve(root, "app/_lib/permissions.ts"), "utf8");
  assert.match(permissions, /href: "\/pedidos"/);
});

test("pedido frontend uses conversion, billing and no PDF actions", () => {
  const listing = readFileSync(resolve(root, "app/(sidebar-pages)/pedidos/page.tsx"), "utf8");
  const detail = readFileSync(resolve(root, "app/(sidebar-pages)/pedidos/[id]/page.tsx"), "utf8");
  const conversion = readFileSync(resolve(root, "app/_components/pedido-conversion-action.tsx"), "utf8");
  assert.match(conversion, /\/pedido/);
  assert.match(listing, /per_page=15/);
  assert.match(detail, /Facturar pedido/);
  assert.match(detail, /facturar/);
  assert.match(detail, /ubicaciones/);
  assert.doesNotMatch(detail, /PDF|pdf|Descargar/);
  assert.doesNotMatch(permissionsSource(), /href: "\/pedidos\/nuevo"/);
});

test("pedido frontend separates internal analysis and operational controls", () => {
  const detail = readFileSync(resolve(root, "app/(sidebar-pages)/pedidos/[id]/page.tsx"), "utf8");
  const conversion = readFileSync(resolve(root, "app/_components/pedido-conversion-action.tsx"), "utf8");
  assert.match(detail, /analisis_interno/);
  assert.match(detail, /materiales/);
  assert.match(detail, /procesos/);
  assert.match(detail, /materiales \?\? \[\]/);
  assert.match(detail, /procesos \?\? \[\]/);
  assert.match(conversion, /window\.confirm/);
  assert.match(detail, /Guardar logística/);
  assert.match(detail, /costo_compra_real/);
  assert.match(detail, /item\.estado !== "completado"/);
  assert.match(detail, /cancelado/);
});

test("ventas identifies direct and pedido invoices without PDF actions", () => {
  const ventas = readFileSync(resolve(root, "app/(sidebar-pages)/ventas/page.tsx"), "utf8");
  assert.match(ventas, /ventas directas y pedidos/);
  assert.match(ventas, /pedido_numero/);
  assert.match(ventas, /servicios/);
  assert.doesNotMatch(ventas, /Descargar|PDF|pdf/);
});

function permissionsSource(): string {
  return readFileSync(resolve(root, "app/_lib/permissions.ts"), "utf8");
}
