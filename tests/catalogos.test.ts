import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildCatalogPayload,
  fetchAllCatalogItems,
  getApiValidationMessage,
} from '../app/_lib/catalogos.ts';

test('builds a catalog payload with a nullable trimmed description', () => {
  const payload = buildCatalogPayload({
    nombre: '  Familiar  ',
    descripcion: '   ',
  });

  assert.deepEqual(payload, {
    nombre: 'Familiar',
    descripcion: null,
  });
});

test('builds a color catalog payload without description', () => {
  const payload = buildCatalogPayload({
    nombre: '  Azul  ',
    includeDescription: false,
  });

  assert.deepEqual(payload, {
    nombre: 'Azul',
  });
});

test('gets the first validation message from an API error payload', () => {
  const message = getApiValidationMessage(
    {
      errors: {
        nombre: ['El nombre es obligatorio.'],
      },
    },
    'Datos inválidos.'
  );

  assert.equal(message, 'El nombre es obligatorio.');
});

test('fetches every page of a paginated catalog', async () => {
  const pages = new Map([
    [1, { data: [{ id: 20, nombre: 'Azul' }], meta: { last_page: 2 } }],
    [2, { data: [{ id: 1, nombre: 'Azulina' }], meta: { last_page: 2 } }],
  ]);

  const items = await fetchAllCatalogItems('/colores', async (path) => {
    const page = Number(new URL(path, 'http://localhost').searchParams.get('page'));
    return {
      ok: true,
      status: 200,
      json: async () => pages.get(page),
    };
  });

  assert.deepEqual(items, [
    { id: 20, nombre: 'Azul' },
    { id: 1, nombre: 'Azulina' },
  ]);
});

test('removes records repeated across catalog pages by id', async () => {
  const pages = new Map([
    [1, { data: [{ id: 48, nombre: 'Hamaca' }], meta: { last_page: 2 } }],
    [2, { data: [{ id: '48', nombre: 'Hamaca repetida' }, { id: 49, nombre: 'Otra hamaca' }], meta: { last_page: 2 } }],
  ]);

  const items = await fetchAllCatalogItems('/hamacas/detalles', async (path) => {
    const page = Number(new URL(path, 'http://localhost').searchParams.get('page'));
    return {
      ok: true,
      status: 200,
      json: async () => pages.get(page),
    };
  });

  assert.deepEqual(items, [
    { id: 48, nombre: 'Hamaca' },
    { id: 49, nombre: 'Otra hamaca' },
  ]);
});
