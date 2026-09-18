import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

test('production catalog pages use the new API resources', () => {
  const materials = readFileSync(resolve(root, 'app/(sidebar-pages)/materiales/page.tsx'), 'utf8');
  const processes = readFileSync(resolve(root, 'app/(sidebar-pages)/procesos-produccion/page.tsx'), 'utf8');
  const services = readFileSync(resolve(root, 'app/(sidebar-pages)/servicios-adicionales/page.tsx'), 'utf8');

  assert.match(materials, /endpoint="\/materiales"/);
  assert.match(processes, /endpoint="\/procesos-produccion"/);
  assert.match(services, /endpoint="\/servicios-adicionales"/);
});

test('managed catalog page supports editing, deactivation and validation responses', () => {
  const source = readFileSync(resolve(root, 'app/_components/managed-catalog-page.tsx'), 'utf8');

  assert.match(source, /method: editingItem \? 'PUT' : 'POST'/);
  assert.match(source, /method: 'DELETE'/);
  assert.match(source, /response\.status === 422/);
  assert.match(source, /toast\.success/);
});

test('sidebar groups phase one catalog links without adding future broken routes', () => {
  const source = readFileSync(resolve(root, 'app/_lib/permissions.ts'), 'utf8');
  const sidebar = readFileSync(resolve(root, 'app/_components/sideBar.tsx'), 'utf8');

  assert.match(source, /href: "\/materiales"/);
  assert.match(source, /href: "\/procesos-produccion"/);
  assert.match(source, /href: "\/servicios-adicionales"/);
  assert.doesNotMatch(source, /href: "\/proformas"/);
  assert.doesNotMatch(source, /href: "\/pedidos"/);
  assert.match(sidebar, /collapsedSections/);
  assert.match(sidebar, /aria-expanded/);
  assert.match(sidebar, /toggleSection/);
  assert.match(sidebar, /font-\[var\(--font-poppins\)\]/);
  assert.match(sidebar, /md:ml-2 md:border-l/);
  assert.match(sidebar, /text-sm font-medium/);
});
