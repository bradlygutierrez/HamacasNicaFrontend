import test from 'node:test';
import assert from 'node:assert/strict';

import {
  calculateBreakdownTotal,
  calculateBreakdownPricing,
  calculateAdditionalServiceSubtotal,
  validateAdditionalServiceField,
} from '../app/_lib/proforma-services.ts';

test('calculates the live total of an optional service breakdown', () => {
  assert.equal(calculateBreakdownTotal([
    { descripcion: 'Transporte Taller → Aeropuerto', monto: '75' },
    { descripcion: '2% Total Factura', monto: '28' },
    { descripcion: 'Agencia Aduanera', monto: '220' },
    { descripcion: 'Impuesto por Factura > USD 500', monto: '25' },
    { descripcion: 'Advance Commercial Information (ACI)', monto: '35' },
    { descripcion: 'Terminal Fee (CH)', monto: '30' },
    { descripcion: 'Fuel Surcharge', monto: '258' },
    { descripcion: 'Flete', monto: '1290' },
  ]), 1961);
});

test('service discounts reduce subtotal without changing gross breakdown amounts', () => {
  const lines = [
    { descripcion: 'Primer concepto', monto: '150.00' },
    { descripcion: 'Flete', monto: '40.00' },
  ];
  const pricing = calculateBreakdownPricing(lines, 3, 10);
  const largerDiscount = calculateBreakdownPricing(lines, 3, 20);
  assert.equal(pricing.unitPrice, '63.33');
  assert.equal(pricing.lines[1].monto, '40.00');
  assert.equal(pricing.subtotal, 180);
  assert.equal(calculateBreakdownTotal(pricing.lines), 190);
  assert.deepEqual(largerDiscount.lines, lines);
  assert.equal(largerDiscount.subtotal, 170);
  assert.equal(largerDiscount.unitPrice, pricing.unitPrice);
  assert.equal(pricing.gross, 190);
  assert.equal(validateAdditionalServiceField('descuento', '190', '3', '63.33', pricing.gross), null);
  assert.equal(validateAdditionalServiceField('descuento', '190.01', '3', '63.33', pricing.gross), 'El descuento no puede superar el subtotal de este elemento.');
});

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
