import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { getCatalogCapabilities } from "../app/_lib/permissions.ts";

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
  assert.match(source, /aria-label="Canal"/);
  assert.match(source, /value="pos"/);
  assert.match(source, /value="ecommerce"/);
  assert.match(source, /canal: channel/);
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
  assert.match(source, /RUC cliente/);
  assert.match(source, /Teléfono cliente/);
  assert.match(source, /Correo cliente/);
  assert.match(source, /Dirección cliente/);
  assert.match(source, /updateManualClient/);
});

test("ventas invalidates stale previews and requires a current calculation", () => {
  assert.match(source, /const invalidatePreview = \(\) => setPreview\(null\)/);
  assert.match(source, /cantidad: Number\(event\.target\.value\).*invalidatePreview\(\)/);
  assert.match(source, /setItems\(items\.filter\(\(_, itemIndex\) => itemIndex !== index\)\); invalidatePreview\(\)/);
  assert.match(source, /setDiscount\(event\.target\.value\); invalidatePreview\(\)/);
  assert.match(source, /setAppliesIva\(event\.target\.checked\); invalidatePreview\(\)/);
  assert.match(source, /setAppliesIr\(event\.target\.checked\); invalidatePreview\(\)/);
  assert.match(source, /disabled=\{saving \|\| !preview\}/);
});

test("ventas resets filters and sale fields after a successful sale", () => {
  assert.match(source, /setSearch\(""\)/);
  assert.match(source, /setOrigin\("venta_directa"\)/);
  assert.match(source, /setPage\(1\)/);
  assert.match(source, /setChannel\("pos"\)/);
  assert.match(source, /setPaymentMethod\("efectivo"\)/);
  assert.match(source, /setAppliesIva\(true\)/);
  assert.match(source, /setAppliesIr\(false\)/);
  assert.match(source, /loadInvoices\(data\?\.data\?\.id, "", "venta_directa", 1\)/);
});

test("ventas POS capabilities allow creation for admin and vendedor, not socio", () => {
  assert.equal(getCatalogCapabilities("/ventas", { id: 1, nombre: "Admin", rol: "admin" }, []).canCreate, true);
  assert.equal(getCatalogCapabilities("/ventas", { id: 2, nombre: "Vendedor", rol: "vendedor" }, [{ pantalla: { ruta: "/ventas" }, permiso: { slug: "ver" } }, { pantalla: { ruta: "/ventas" }, permiso: { slug: "crear" } }]).canCreate, true);
  assert.equal(getCatalogCapabilities("/ventas", { id: 3, nombre: "Socio", rol: "socio" }, [{ pantalla: { ruta: "/ventas" }, permiso: { slug: "ver" } }]).canCreate, false);
});
