import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

test("document helper uses authenticated blobs and supports view/download", () => {
  const source = readFileSync(resolve("app/_lib/documents.ts"), "utf8");
  assert.match(source, /apiFetch/);
  assert.match(source, /response\.blob\(\)/);
  assert.match(source, /URL\.createObjectURL/);
  assert.match(source, /URL\.revokeObjectURL/);
  assert.match(source, /download=1/);
  assert.match(source, /response\.ok/);
  assert.match(source, /window\.open\("about:blank", "_blank"\)/);
  assert.match(source, /tab\.opener = null/);
  assert.match(source, /tab\.location\.href/);
  assert.match(source, /tab\.close\(\)/);
});

test("PDF actions are available in proforma and factura detail", () => {
  const proforma = readFileSync(resolve("app/(sidebar-pages)/proformas/[id]/page.tsx"), "utf8");
  const ventas = readFileSync(resolve("app/(sidebar-pages)/ventas/page.tsx"), "utf8");
  assert.match(proforma, /PdfActions/);
  assert.match(proforma, /\/proformas\/\$\{id\}\/pdf/);
  assert.match(ventas, /PdfActions/);
  assert.match(ventas, /\/facturas\/\$\{selected\.id\}\/pdf/);
});
