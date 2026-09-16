import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('login submit button keeps a stable height when errors render', () => {
  const page = readFileSync('app/(auth)/page.tsx', 'utf8');
  const buttonClass = page.match(/<button[\s\S]*?className="([^"]+)"/)?.[1] ?? '';

  assert.match(buttonClass, /\bmin-h-14\b/);
  assert.match(buttonClass, /\bshrink-0\b/);
});
