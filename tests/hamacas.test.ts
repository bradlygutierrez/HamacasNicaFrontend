import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  buildHamacaFotoPayload,
  buildHamacaPayload,
  suggestHamacaName,
  normalizePhotoRoutes,
} from '../app/_lib/hamacas.ts';
import { addImageFiles } from '../app/_lib/hamaca-photo-files.ts';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

test('hamaca catalog links each model to its contextual production formula action', () => {
  const page = readFileSync(resolve(root, 'app/(sidebar-pages)/catalogo-hamacas/page.tsx'), 'utf8');
  const card = readFileSync(resolve(root, 'app/_components/catalogo-hamaca-card.tsx'), 'utf8');
  const modal = readFileSync(resolve(root, 'app/_components/hamaca-modal.tsx'), 'utf8');

  assert.match(page, /\/formulas\//);
  assert.match(card, /Fórmula de producción/);
  assert.match(page, /Configurar fórmula/);
  assert.match(page, /Continuar fórmula/);
  assert.match(page, /Ver fórmula/);
  assert.doesNotMatch(modal, /fórmula|receta|\/formulas/i);
});

test('builds a hamaca payload with trimmed text and nullable description', () => {
  const payload = buildHamacaPayload({
    nombre: '  Hamaca Familiar  ',
    descripcion: '   ',
    categoriaId: 2,
    tamanoId: 3,
    precio: 1500,
  });

  assert.deepEqual(payload, {
    nombre: 'Hamaca Familiar',
    descripcion: null,
    categoria_id: 2,
    tamano_id: 3,
    precio: 1500,
  });
});

test('normalizes multiple photo routes before saving', () => {
  const routes = normalizePhotoRoutes([
    ' https://cdn.test/uno.jpg ',
    '',
    '   ',
    '/uploads/dos.jpg',
  ]);

  assert.deepEqual(routes, ['https://cdn.test/uno.jpg', '/uploads/dos.jpg']);
});

test('builds a foto payload attached to one hamaca', () => {
  const payload = buildHamacaFotoPayload({
    hamacaId: 8,
    ruta: ' /uploads/hamaca.jpg ',
  });

  assert.deepEqual(payload, {
    ruta: '/uploads/hamaca.jpg',
    hamaca_ids: [8],
  });
});

test('suggests a product name from category, size, and selected colors', () => {
  assert.equal(suggestHamacaName('Hamaca con palo', 'Familiar', ['Azul', 'Blanco']), 'Hamaca con palo Familiar - Azul / Blanco');
  assert.equal(suggestHamacaName('Hamaca con palo', 'Familiar', []), 'Hamaca con palo Familiar');
  assert.equal(Array.from(suggestHamacaName('é'.repeat(50), 'ñ'.repeat(50), ['ó'.repeat(50)] )).length, 150);
  const modal = readFileSync(resolve(root, 'app/_components/hamaca-modal.tsx'), 'utf8');
  assert.match(modal, /maxLength=\{150\}/);
  assert.match(modal, /Máximo 150 caracteres\./);
  assert.match(modal, /newErrors\.nombre = "Máximo 150 caracteres\."/);
});

test('creates one complete Hamaca and supports automatic name reset', () => {
  const modal = readFileSync(resolve(root, 'app/_components/hamaca-modal.tsx'), 'utf8');
  const picker = readFileSync(resolve(root, 'app/_components/hamaca-photo-picker.tsx'), 'utf8');
  const catalog = readFileSync(resolve(root, 'app/(sidebar-pages)/catalogo-hamacas/page.tsx'), 'utf8');

  assert.match(catalog, /Nueva hamaca/);
  assert.doesNotMatch(catalog, /VarianteModal|variante/);
  assert.match(modal, /color_ids\[\]/);
  assert.match(modal, /fotos\[\]/);
  assert.match(modal, /if \(mode !== "crear" \|\| nameWasEdited\) return/);
  assert.match(modal, /Usar nombre sugerido/);
  assert.match(modal, /setNameWasEdited\(true\)/);
  assert.match(picker, /type="file"[\s\S]*?accept="image\/\*"[\s\S]*?multiple/);
  assert.match(picker, /onDragOver=\{handleDragOver\}/);
  assert.match(picker, /onDrop=\{handleDrop\}/);
  assert.match(picker, /Arrastrá fotos aquí o tocá para abrir la galería/);
  assert.match(modal, /photoFiles\.forEach\(\(file\) => requestBody\.append\("fotos\[\]", file\)\)/);
  assert.match(picker, /removeSelectedFile/);
  assert.match(picker, /URL\.createObjectURL/);
  assert.match(picker, /URL\.revokeObjectURL/);
  assert.match(modal, /setPhotoFiles\(\[\]\)/);
});

test('reuses the shared photo picker from photo management', () => {
  const modal = readFileSync(resolve(root, 'app/_components/foto-hamaca-modal.tsx'), 'utf8');
  assert.match(modal, /<HamacaPhotoPicker files=\{selectedFiles\} onFilesChange=\{setSelectedFiles\}/);
});

test('shows current photos when editing a Hamaca', () => {
  const modal = readFileSync(resolve(root, 'app/_components/hamaca-modal.tsx'), 'utf8');
  assert.match(modal, /fotos\?: Array<\{ id: number; ruta: string \}>/);
  assert.match(modal, /Fotos actuales/);
  assert.match(modal, /currentHamaca\.fotos\.map/);
});

test('clears pending photos and routes whenever the selected Hamaca changes', () => {
  const modal = readFileSync(resolve(root, 'app/_components/hamaca-modal.tsx'), 'utf8');
  const handler = modal.match(/function handleHamacaSelect\([\s\S]*?\n  }/)?.[0] ?? '';

  assert.match(handler, /setSelectedHamacaId\(id\);[\s\S]*setPhotoFiles\(\[\]\);[\s\S]*setPhotoRoutes\(\[\]\);[\s\S]*setPhotoPickerResetKey\(\(key\) => key \+ 1\);[\s\S]*if \(!id\)/);
});

test('builds the direct Hamaca create payload with selected color IDs', () => {
  assert.deepEqual(buildHamacaPayload({
    nombre: '', descripcion: '', categoriaId: 2, tamanoId: 3, precio: 1500,
    colorIds: [4, 5], suggestedName: 'Hamaca con palo Familiar - Azul / Blanco',
  }), {
    nombre: 'Hamaca con palo Familiar - Azul / Blanco', descripcion: null,
    categoria_id: 2, tamano_id: 3, precio: 1500, color_ids: [4, 5],
  });
});

test('adds unique images up to 4 MB and reports rejected files', () => {
  const makeFile = (name: string, size: number, type = 'image/jpeg', lastModified = 1) =>
    Object.assign(new Blob([new Uint8Array(size)], { type }), { name, lastModified }) as File;
  const first = makeFile('foto.jpg', 10);
  const duplicate = makeFile('foto.jpg', 10);
  const tooLarge = makeFile('grande.jpg', 4 * 1024 * 1024 + 1);
  const notImage = makeFile('texto.txt', 2, 'text/plain');

  assert.deepEqual(addImageFiles([first], [duplicate, tooLarge, notImage]), {
    files: [first],
    rejectedTooLarge: true,
    rejectedNotImage: true,
  });
});
