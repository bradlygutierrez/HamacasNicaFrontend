import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getFormulaUiState } from '../app/_lib/formula-ui.ts';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

test('formula UI maps the four recipe states to explicit labels and actions', () => {
  assert.deepEqual(getFormulaUiState({ hasActive: false, hasDraft: false, canCreate: true }), {
    statusLabel: 'Sin fórmula',
    canContinue: false,
    canView: false,
    canCreate: true,
    canCreateVersion: false,
  });
  assert.deepEqual(getFormulaUiState({ hasActive: false, hasDraft: true, canCreate: true }), {
    statusLabel: 'Borrador',
    canContinue: true,
    canView: false,
    canCreate: false,
    canCreateVersion: false,
  });
  assert.deepEqual(getFormulaUiState({ hasActive: true, hasDraft: false, canCreate: true }), {
    statusLabel: 'Activa',
    canContinue: false,
    canView: true,
    canCreate: false,
    canCreateVersion: true,
  });
  assert.deepEqual(getFormulaUiState({ hasActive: true, hasDraft: true, canCreate: true }), {
    statusLabel: 'Activa + borrador',
    canContinue: true,
    canView: false,
    canCreate: false,
    canCreateVersion: false,
  });
});

test('formula UI is read-only when creation is not allowed', () => {
  assert.deepEqual(getFormulaUiState({ hasActive: false, hasDraft: false, canCreate: false }), {
    statusLabel: 'Sin fórmula',
    canContinue: false,
    canView: false,
    canCreate: false,
    canCreateVersion: false,
  });
  assert.deepEqual(getFormulaUiState({ hasActive: true, hasDraft: false, canCreate: false }), {
    statusLabel: 'Activa',
    canContinue: false,
    canView: true,
    canCreate: false,
    canCreateVersion: false,
  });
});

test('formula UI uses view labels for read-only drafts', () => {
  assert.deepEqual(getFormulaUiState({ hasActive: false, hasDraft: true, canCreate: false, canEdit: false }), {
    statusLabel: 'Borrador',
    canContinue: false,
    canView: true,
    canCreate: false,
    canCreateVersion: false,
  });
  assert.deepEqual(getFormulaUiState({ hasActive: true, hasDraft: true, canCreate: false, canEdit: false }), {
    statusLabel: 'Activa + borrador',
    canContinue: false,
    canView: true,
    canCreate: false,
    canCreateVersion: false,
  });
});

test('formula UI keeps continuation labels for editors', () => {
  assert.equal(getFormulaUiState({ hasActive: false, hasDraft: true, canCreate: true, canEdit: true }).canContinue, true);
  assert.equal(getFormulaUiState({ hasActive: true, hasDraft: true, canCreate: true, canEdit: true }).canContinue, true);
});

test('formula pages use versioning, cost and service formula endpoints', () => {
  const list = readFileSync(resolve(root, 'app/(sidebar-pages)/formulas/page.tsx'), 'utf8');
  const editor = readFileSync(resolve(root, 'app/(sidebar-pages)/formulas/[hamacaId]/page.tsx'), 'utf8');
  const service = readFileSync(resolve(root, 'app/(sidebar-pages)/servicios-adicionales/[id]/formula/page.tsx'), 'utf8');
  const selector = readFileSync(resolve(root, 'app/_components/async-catalog-selector.tsx'), 'utf8');

  assert.match(list, /\/formulas/);
  assert.match(list, /import \{ useCatalogCapabilities \} from "@\/app\/_components\/catalog-permissions-provider"/);
  assert.match(list, /const \{ canCreate, canEdit \} = useCatalogCapabilities\("\/formulas"\)/);
  assert.match(list, /import \{ getFormulaUiState, type FormulaUiState \} from "@\/app\/_lib\/formula-ui"/);
  assert.match(list, /getFormulaUiState\(\{ hasActive, hasDraft, canCreate, canEdit \}\)/);
  assert.match(list, /uiState\.canCreateVersion/);
  assert.match(list, /apiFetch\(`\/hamacas\/\$\{hamacaIdOf\(item\)\}\/recetas`, \{ method: "POST"/);
  assert.doesNotMatch(list, /variante|hamaca-variantes|source_variant_id/);
  assert.match(list, /source_hamaca_id/);
  assert.match(list, /Versiones y costos estimados de producción por hamaca/);
  assert.match(list, /const hasActive = Boolean\(item\.receta_activa\)/);
  assert.match(list, /const hasDraft = Boolean\(item\.receta_borrador\)/);
  assert.match(list, /uiState\.statusLabel\}/);
  assert.match(list, /Activa v\{item\.receta_activa\?\.version\}/);
  assert.match(list, /Borrador v\{item\.receta_borrador\?\.version\}/);
  assert.match(list, /uiState\.canCreate \? <button[^>]+>[\s\S]*Crear fórmula/);
  assert.match(list, /uiState\.canContinue \? <Link[^>]+>\{uiState\.statusLabel === "Activa \+ borrador" \? "Continuar borrador" : "Continuar fórmula"\}/);
  assert.match(list, /hasActive \? "Ver fórmula" : "Ver borrador"/);
  assert.match(list, /uiState\.canView \? <><Link[^>]+>\{hasActive \?/);
  assert.match(list, /uiState\.canView \? <><Link[^>]+>[\s\S]*uiState\.canCreateVersion \? <button[^>]+>[\s\S]*Nueva versión/);
  assert.match(list, /POST/);
  assert.match(list, /router\.push\(`\/formulas\/\$\{hamacaIdOf\(item\)\}`\)/);
  assert.match(list, /response\.ok/);
  assert.match(list, /useRef/);
  assert.match(list, /mutationInFlight/);
  assert.match(list, /if \(mutationInFlight\.current\) return/);
  assert.match(list, /role="alert"/);
  assert.match(list, /aria-live="assertive"/);
  assert.match(list, /aria-hidden="true"/);
  assert.match(list, /htmlFor="formula-search"/);
  assert.match(list, /id="formula-search"/);
  assert.match(list, /Record<string, string \| string\[]>/);
  assert.match(list, /Array\.isArray\(fieldError\)/);
  assert.match(editor, /\/hamacas\/\$\{hamacaId\}\/recetas/);
  assert.match(editor, /Categoría:/);
  assert.doesNotMatch(editor, /variante|hamaca-variantes/);
  assert.match(editor, /\/costos/);
  assert.match(editor, /\/activar/);
  assert.match(editor, /Crear fórmula de producción/);
  assert.match(editor, /Definí los materiales y procesos necesarios/);
  assert.match(editor, /1\. Materiales/);
  assert.match(editor, /2\. Mano de obra/);
  assert.match(editor, /3\. Resumen/);
  assert.match(editor, /Cantidad por hamaca/);
  assert.match(editor, /Merma %/);
  assert.match(editor, /Costo por hamaca/);
  assert.match(editor, /Guardar borrador/);
  assert.match(editor, /Activar fórmula/);
  assert.match(editor, /Descartar borrador/);
  assert.match(editor, /¿Activar esta fórmula\?/);
  assert.match(editor, /Fórmula activada correctamente\./);
  assert.doesNotMatch(editor, /placeholder="Costo"/);
  assert.doesNotMatch(editor, />Crear versión</);
  assert.match(editor, /material\?\.nombre/);
  assert.match(editor, /proceso\?\.nombre/);
  assert.match(editor, /Costo estimado con precios actuales/);
  assert.match(editor, /Observaciones/);
  assert.match(service, /\/formula/);
  assert.match(service, /\/costos/);
  assert.match(selector, /search/);
  assert.match(selector, /per_page=20/);
});

test('formula list uses the helper state for status and actions', () => {
  const list = readFileSync(resolve(root, 'app/(sidebar-pages)/formulas/page.tsx'), 'utf8');

  assert.match(list, /uiState\.statusLabel/);
  assert.match(list, /uiState\.canContinue/);
  assert.match(list, /uiState\.canView/);
  assert.match(list, /uiState\.canCreate \? <button/);
  assert.match(list, /uiState\.canCreateVersion/);
  assert.match(list, /!hasActive && !hasDraft/);
  assert.match(list, /hasActive && hasDraft/);
});

test('formula UI gates mutations and does not introduce phase five links', () => {
  const editor = readFileSync(resolve(root, 'app/(sidebar-pages)/formulas/[hamacaId]/page.tsx'), 'utf8');
  const service = readFileSync(resolve(root, 'app/(sidebar-pages)/servicios-adicionales/[id]/formula/page.tsx'), 'utf8');
  const permissions = readFileSync(resolve(root, 'app/_lib/permissions.ts'), 'utf8');

  assert.match(editor, /useCatalogCapabilities/);
  assert.match(editor, /canCreate/);
  assert.match(editor, /canEdit/);
  assert.match(editor, /canDelete/);
  assert.match(service, /canEdit/);
  assert.match(editor, /inspectHistory/);
  assert.match(editor, /editable = Boolean/);
  assert.match(editor, /historyRecipe\.materiales/);
  assert.match(service, /Quitar material/);
  assert.match(service, /Quitar proceso/);
  assert.doesNotMatch(permissions, /href: "\/facturar"/);
});
