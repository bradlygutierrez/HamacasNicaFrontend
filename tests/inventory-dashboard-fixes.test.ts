import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { todayLocalDate } from '../app/_lib/date.ts';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

test('todayLocalDate formats the local calendar date as YYYY-MM-DD', () => {
  const date = new Date(2026, 8, 17, 23, 59, 59);

  assert.equal(todayLocalDate(date), '2026-09-17');
});

test('todayLocalDate does not build dates through UTC serialization', () => {
  const utilitySource = readFileSync(resolve(projectRoot, 'app/_lib/date.ts'), 'utf8');

  assert.doesNotMatch(utilitySource, /toISOString/);
  assert.match(utilitySource, /getFullYear\(\)/);
  assert.match(utilitySource, /getMonth\(\)/);
  assert.match(utilitySource, /getDate\(\)/);
});

test('entrada loads only permitted inventory owners and never falls back to /me', () => {
  const source = readFileSync(
    resolve(projectRoot, 'app/_components/entrada-modal.tsx'),
    'utf8',
  );

  assert.match(source, /apiFetch\("\/usuarios\/propietarios"\)/);
  assert.doesNotMatch(source, /apiFetch\("\/usuarios"\)/);
  assert.doesNotMatch(source, /loadedUsers\.length === 0/);
});

test('dashboard loads category stats from the dedicated endpoint', () => {
  const source = readFileSync(
    resolve(projectRoot, 'app/(sidebar-pages)/dashboard/page.tsx'),
    'utf8',
  );

  assert.match(source, /\/dashboard\/categories\/\$\{selectedCategory\}\/stats/);
  assert.match(source, /stock_minimo: Number\(stats\.stock_minimo \?\? 0\)/);
  assert.match(source, /stock_maximo: Number\(stats\.stock_maximo \?\? 0\)/);
  assert.match(source, /unidades_totales: Number\(stats\.unidades_totales \?\? 0\)/);
  assert.doesNotMatch(source, /const stock = Number\(category\?\.stock \?\? 0\)/);
});
