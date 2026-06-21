import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildCatalogPayload,
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
