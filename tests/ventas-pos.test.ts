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

test("ventas POS capabilities allow creation for admin and vendedor, not socio", () => {
  assert.equal(getCatalogCapabilities("/ventas", { id: 1, nombre: "Admin", rol: "admin" }, []).canCreate, true);
  assert.equal(getCatalogCapabilities("/ventas", { id: 2, nombre: "Vendedor", rol: "vendedor" }, [{ pantalla: { ruta: "/ventas" }, permiso: { slug: "ver" } }, { pantalla: { ruta: "/ventas" }, permiso: { slug: "crear" } }]).canCreate, true);
  assert.equal(getCatalogCapabilities("/ventas", { id: 3, nombre: "Socio", rol: "socio" }, [{ pantalla: { ruta: "/ventas" }, permiso: { slug: "ver" } }]).canCreate, false);
});
