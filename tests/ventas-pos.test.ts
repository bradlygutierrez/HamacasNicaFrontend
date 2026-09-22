import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve("app/(sidebar-pages)/ventas/page.tsx"), "utf8");

test("ventas POS exposes the direct sale flow and permission gate", () => {
  assert.match(source, /useCatalogCapabilities\("\/ventas"\)/);
  assert.match(source, /canCreate \?[\s\S]*Nueva venta/);
  assert.match(source, /\/inventario-hamacas/);
  assert.match(source, /cantidad > Number\(item\.inventory\.cantidad\)/);
  assert.match(source, /\/pos\/ventas\/calcular/);
  assert.match(source, /\/pos\/ventas"/);
  assert.match(source, /inventario_hamaca_id: item\.inventory\.id/);
  assert.match(source, /toast\.success\("Venta registrada correctamente\."/);
  assert.doesNotMatch(source, /precio_unitario: item\.inventory/);
});

test("ventas keeps invoice filters, pagination, detail loading and client modes", () => {
  assert.match(source, /search=/);
  assert.match(source, /origen=/);
  assert.match(source, /page=/);
  assert.match(source, /\/facturas\/" \+ id/);
  assert.match(source, /Registrar cliente/);
  assert.match(source, /Consumidor final/);
  assert.match(source, /Servicios del producto/);
  assert.match(source, /Venta directa/);
  assert.match(source, /Pedido/);
});
