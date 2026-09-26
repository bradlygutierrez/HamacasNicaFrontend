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
  assert.match(source, /item\.hamaca\?\.colores/);
  assert.doesNotMatch(source, /variante|hamaca_variante/);
  assert.match(source, /toast\.success\("Venta registrada correctamente\."/);
  assert.doesNotMatch(source, /precio_unitario: item\.inventory/);
  assert.match(source, /aria-label="Canal"/);
  assert.match(source, /value="pos"/);
  assert.match(source, /value="ecommerce"/);
  assert.match(source, /canal: channel/);
  assert.match(source, /role="dialog"/);
  assert.match(source, /aria-modal="true"/);
  assert.match(source, /aria-label="Cerrar nueva venta"/);
  assert.match(source, /max-w-6xl/);
  assert.match(source, /overflow-y-auto/);
  assert.match(source, /\{error \? <p role="alert"/);
  assert.match(source, /document\.body\.style\.overflow = "hidden"/);
  assert.match(source, /document\.body\.style\.overflow = previousOverflow/);
  assert.match(source, /closeForm\(\); setItems\(\[\]\)/);
  assert.match(source, /role="dialog" aria-modal="true" aria-labelledby="register-client-title"/);
  assert.match(source, /id="register-client-title"/);
  assert.match(source, /if \(quickClientOpen\) \{ setError\(""\); setQuickClientOpen\(false\); \} else closeForm\(\)/);
  assert.match(source, /onClick=\{\(\) => \{ setError\(""\); setQuickClientOpen\(true\); \}\}/);
  assert.match(source, /<h2 id="register-client-title"[\s\S]*\{error \? <p role="alert"/);
  assert.match(source, /setManualClient\(client\); setError\(""\); setQuickClientOpen\(false\)/);
  assert.match(source, /onClick=\{\(\) => \{ setError\(""\); setQuickClientOpen\(false\); \}\} className="rounded border/);
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
  assert.match(source, /Método de pago/);
  assert.match(source, /Descuento \(C\$\)/);
  assert.match(source, /Impuestos/);
  assert.match(source, /Agrega el impuesto configurado/);
  assert.match(source, /Aplica la retención configurada/);
  assert.match(source, /isAdded/);
  assert.match(source, /\+ Agregar/);
  assert.match(source, /✓ Agregado/);
  assert.match(source, /Cantidad/);
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

test("ventas keeps mobile layouts from forcing horizontal overflow", () => {
  const pdfActions = readFileSync(resolve("app/_components/pdf-actions.tsx"), "utf8");
  assert.match(source, /ventas-page/);
  assert.match(source, /min-w-0/);
  assert.match(source, /flex-col gap-2 sm:flex-row/);
  assert.match(source, /h-\[100dvh\]/);
  assert.match(source, /max-h-\[100dvh\]/);
  assert.match(source, /grid-template-columns: minmax\(0, 1fr\)/);
  assert.match(source, /grid-template-columns: 1fr 1fr/);
  assert.match(source, /w-full min-w-0 gap-1/);
  assert.doesNotMatch(source, /grid min-w-\[260px\]/);
  assert.doesNotMatch(source, /grid-cols-\[120px_1fr_120px\]/);
  assert.match(pdfActions, /flex w-full flex-col gap-2 sm:w-auto sm:flex-row/);
  assert.match(pdfActions, /min-h-10 w-full/);
});
