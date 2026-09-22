import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getCatalogCapabilities } from '../app/_lib/permissions.ts';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

test('clientes screen exists with CRUD fields, pagination and role actions', () => {
  const page = readFileSync(resolve(root, 'app/(sidebar-pages)/clientes/page.tsx'), 'utf8');
  const permissions = readFileSync(resolve(root, 'app/_lib/permissions.ts'), 'utf8');

  assert.match(page, /Clientes/);
  assert.doesNotMatch(page, /<Plus/);
  assert.match(page, /Nombre/);
  assert.match(page, /RUC/);
  assert.match(page, /Teléfono/);
  assert.match(page, /Correo/);
  assert.match(page, /Dirección/);
  assert.match(page, /page=/);
  assert.match(page, /Desactivar este cliente/);
  assert.match(permissions, /href: "\/clientes"/);
  assert.deepEqual(getCatalogCapabilities('/clientes', { id: 1, nombre: 'Admin', rol: 'admin' }, []), { canView: true, canCreate: true, canEdit: true, canDelete: true });
  assert.deepEqual(getCatalogCapabilities('/clientes', { id: 2, nombre: 'Vendedor', rol: 'vendedor' }, [{ pantalla: { ruta: '/clientes' }, permiso: { slug: 'ver' } }, { pantalla: { ruta: '/clientes' }, permiso: { slug: 'crear' } }, { pantalla: { ruta: '/clientes' }, permiso: { slug: 'editar' } }]), { canView: true, canCreate: true, canEdit: true, canDelete: false });
  assert.deepEqual(getCatalogCapabilities('/clientes', { id: 3, nombre: 'Socio', rol: 'socio' }, [{ pantalla: { ruta: '/clientes' }, permiso: { slug: 'ver' } }]), { canView: true, canCreate: false, canEdit: false, canDelete: false });
});

test('proforma can register a client without removing manual snapshots', () => {
  const editor = readFileSync(resolve(root, 'app/_components/proforma-editor.tsx'), 'utf8');
  assert.match(editor, /\+ Registrar cliente/);
  assert.match(editor, /apiFetch\("\/clientes", \{ method: "POST"/);
  assert.match(editor, /setSelectedClientId\(client\.id\)/);
  assert.match(editor, /setManualClient\(client\)/);
  assert.match(editor, /cliente_id: selectedClientId/);
  assert.match(editor, /nombre_cliente: manualClient\.nombre/);
});
