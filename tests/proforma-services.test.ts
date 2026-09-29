import test from 'node:test';
import assert from 'node:assert/strict';

import {
  calculateAdditionalServiceSubtotal,
  validateAdditionalServiceField,
} from '../app/_lib/proforma-services.ts';

test('calculates the estimated subtotal for an additional service', () => {
  assert.equal(calculateAdditionalServiceSubtotal('2', '150', '50'), 250);
  assert.equal(calculateAdditionalServiceSubtotal('1', '5', '1'), 4);
  assert.equal(calculateAdditionalServiceSubtotal('', '150', '0'), 0);
  assert.equal(calculateAdditionalServiceSubtotal('2', 'not a price', '0'), 0);
});

test('validates additional service quantity and unit price for inline feedback', () => {
  assert.equal(validateAdditionalServiceField('cantidad', '0'), 'Ingresá una cantidad mayor que 0.');
  assert.equal(validateAdditionalServiceField('cantidad', '-1'), 'Ingresá una cantidad mayor que 0.');
  assert.equal(validateAdditionalServiceField('cantidad', '1'), null);
  assert.equal(validateAdditionalServiceField('precio_unitario', '-0.01'), 'El precio no puede ser menor que 0.');
  assert.equal(validateAdditionalServiceField('precio_unitario', '0'), null);
  assert.equal(validateAdditionalServiceField('descuento', '-1'), 'El descuento debe ser C$ 0.00 o mayor.');
  assert.equal(validateAdditionalServiceField('descuento', '6', '2', '2'), 'El descuento no puede superar el subtotal de este elemento.');
  assert.equal(validateAdditionalServiceField('descuento', '1', '2', '2'), null);
});
