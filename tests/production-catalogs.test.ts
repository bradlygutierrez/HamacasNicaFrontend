import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getCatalogCapabilities } from '../app/_lib/permissions.ts';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

test('production catalog pages use the new API resources', () => {
  const materials = readFileSync(resolve(root, 'app/(sidebar-pages)/materiales/page.tsx'), 'utf8');
  const processes = readFileSync(resolve(root, 'app/(sidebar-pages)/procesos-produccion/page.tsx'), 'utf8');
  const services = readFileSync(resolve(root, 'app/(sidebar-pages)/servicios-adicionales/page.tsx'), 'utf8');

  assert.match(materials, /endpoint="\/materiales"/);
  assert.match(processes, /endpoint="\/procesos-produccion"/);
  assert.match(processes, /El costo de este proceso se define por hamaca dentro de la fórmula de producción/);
  assert.match(services, /endpoint="\/servicios-adicionales"/);
});

test('managed catalog page supports editing, deactivation and validation responses', () => {
  const source = readFileSync(resolve(root, 'app/_components/managed-catalog-page.tsx'), 'utf8');

  assert.match(source, /method: editingItem \? 'PUT' : 'POST'/);
  assert.match(source, /method: 'DELETE'/);
  assert.match(source, /response\.status === 422/);
  assert.match(source, /toast\.success/);
});

test('managed catalog page hides mutations when permissions are read-only', () => {
  const source = readFileSync(resolve(root, 'app/_components/managed-catalog-page.tsx'), 'utf8');
  const materials = readFileSync(resolve(root, 'app/(sidebar-pages)/materiales/page.tsx'), 'utf8');
  const permissions = readFileSync(resolve(root, 'app/_lib/permissions.ts'), 'utf8');

  assert.match(source, /canCreate/);
  assert.match(source, /canEdit/);
  assert.match(source, /canDelete/);
  assert.match(source, /useCatalogCapabilities/);
  assert.match(source, /canCreate \?/);
  assert.match(source, /canEdit/);
  assert.match(source, /canDelete &&/);
  assert.match(materials, /screenPath="\/materiales"/);
  assert.match(permissions, /getCatalogCapabilities/);
});

test('catalog capabilities distinguish read-only users from administrators', () => {
  const readOnly = getCatalogCapabilities('/materiales', { id: 2, nombre: 'Socio', rol: 'socio' }, [
    { pantalla: { ruta: '/materiales' }, permiso: { slug: 'ver' } },
  ]);
  const admin = getCatalogCapabilities('/materiales', { id: 1, nombre: 'Admin', rol: 'admin' }, []);

  assert.deepEqual(readOnly, { canView: true, canCreate: false, canEdit: false, canDelete: false });
  assert.deepEqual(admin, { canView: true, canCreate: true, canEdit: true, canDelete: true });
});

test('inventory screen permissions also control inventory catalog mutations', () => {
  const capabilities = getCatalogCapabilities(
    '/colores',
    { id: 3, nombre: 'Gestor', rol: 'gestor' },
    [
      { pantalla: { ruta: '/inventario' }, permiso: { slug: 'ver' } },
      { pantalla: { ruta: '/inventario' }, permiso: { slug: 'crear' } },
    ]
  );

  assert.deepEqual(capabilities, { canView: true, canCreate: true, canEdit: false, canDelete: false });
});

test('users page provides dynamic role creation and per-screen permission controls', () => {
  const panel = readFileSync(resolve(root, 'app/_components/rolePermissionsPanel.tsx'), 'utf8');
  const userForm = readFileSync(resolve(root, 'app/_components/addUserCard.tsx'), 'utf8');

  assert.match(panel, /apiFetch\("\/roles"/);
  assert.match(panel, /pantalla-permiso-roles\?rol=/);
  assert.match(panel, /aria-label=\{translateText\(\`\$\{permission\.nombre\} - \$\{screen\.nombre\}\`\)\}/);
  assert.match(userForm, /roles\.map\(\(role\)/);
  assert.doesNotMatch(userForm, /const ROLES =/);
});

test('sidebar groups catalog links without adding future broken routes', () => {
  const source = readFileSync(resolve(root, 'app/_lib/permissions.ts'), 'utf8');
  const sidebar = readFileSync(resolve(root, 'app/_components/sideBar.tsx'), 'utf8');

  assert.match(source, /href: "\/materiales"/);
  assert.match(source, /href: "\/procesos-produccion"/);
  assert.match(source, /href: "\/servicios-adicionales"/);
  assert.match(source, /href: "\/formulas"/);
  assert.match(source, /href: "\/proformas"/);
  assert.doesNotMatch(source, /href: "\/facturar"/);
  assert.match(sidebar, /collapsedSections/);
  assert.match(sidebar, /aria-expanded/);
  assert.match(sidebar, /toggleSection/);
  assert.match(sidebar, /font-\[var\(--font-poppins\)\]/);
  assert.match(sidebar, /md:ml-1 md:border-l/);
  assert.match(sidebar, /text-sm font-medium/);
  assert.match(sidebar, /getNavIcon/);
  assert.match(sidebar, /getSectionIcon/);
  assert.match(sidebar, /<SectionIcon/);
  assert.match(sidebar, /<NavIcon/);
  assert.match(sidebar, /<LogOut/);
});

test('mobile sidebar header remains fixed outside layout overflow clipping', () => {
  const layout = readFileSync(resolve(root, 'app/(sidebar-pages)/layout.tsx'), 'utf8');
  const sidebar = readFileSync(resolve(root, 'app/_components/app-header.tsx'), 'utf8');
  const sidebarComponent = readFileSync(resolve(root, 'app/_components/sideBar.tsx'), 'utf8');

  assert.match(layout, /min-h-screen w-full min-w-0 gap-2 md:overflow-x-clip/);
  assert.match(sidebar, /className="fixed inset-x-0 top-0 z-50/);
  assert.doesNotMatch(sidebarComponent, /className=\{\`relative z-40/);
  assert.match(sidebarComponent, /"fixed inset-y-0 left-0 h-screen w-screen/);
});
