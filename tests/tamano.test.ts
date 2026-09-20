import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

test("Tamaños usa el CRUD compartido de catálogos", () => {
  const source = readFileSync(resolve(process.cwd(), "app/(sidebar-pages)/tamano/page.tsx"), "utf8");
  assert.match(source, /import CatalogPage/);
  assert.match(source, /endpoint="\/tamanos"/);
  assert.doesNotMatch(source, /SectionPage/);
  assert.doesNotMatch(source, /Módulo en construcción/);
});
