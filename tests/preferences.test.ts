import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('hydration applies preferences without overwriting stored values', () => {
  const source = readFileSync('app/_components/preferences-provider.tsx', 'utf8');
  const effect = source.match(/useEffect\(\(\) => \{([\s\S]*?)\}, \[language, theme\]\);/)?.[1];

  assert.ok(effect);
  assert.match(effect, /document\.documentElement\.dataset\.theme = theme/);
  assert.doesNotMatch(effect, /localStorage\.setItem/);
  assert.match(source, /function updateStoredPreferences[\s\S]*?localStorage\.setItem\(LANGUAGE_STORAGE_KEY, next\.language\)[\s\S]*?localStorage\.setItem\(THEME_STORAGE_KEY, next\.theme\)/);
});
