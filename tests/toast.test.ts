import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('root layout renders the global toast container', () => {
  const layout = readFileSync('app/layout.tsx', 'utf8');
  const provider = readFileSync('app/_components/toast-provider.tsx', 'utf8');

  assert.match(layout, /ToastProvider/);
  assert.match(layout, /react-toastify\/dist\/ReactToastify\.css/);
  assert.match(provider, /ToastContainer/);
});

test('photo upload modal reports success and failure through toasts', () => {
  const modal = readFileSync('app/_components/foto-hamaca-modal.tsx', 'utf8');

  assert.match(modal, /toast\.success\("Fotos guardadas correctamente\."\)/);
  assert.match(modal, /toast\.error\("No se pudieron guardar las fotos\."\)/);
});
