import test from 'node:test';
import assert from 'node:assert/strict';

import { authHeaders, csrfCookie } from '../app/_lib/api.ts';

test('requests the standard Sanctum csrf cookie endpoint', async () => {
  const originalFetch = globalThis.fetch;
  const requestedUrls: string[] = [];

  try {
    globalThis.fetch = (async (input) => {
      requestedUrls.push(String(input));

      return new Response(null, { status: 204 });
    }) as typeof fetch;

    await csrfCookie();

    assert.deepEqual(requestedUrls, ['http://localhost:8000/sanctum/csrf-cookie']);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('sends the XSRF cookie with the Laravel encrypted cookie header', () => {
  const originalDocument = Object.getOwnPropertyDescriptor(globalThis, 'document');

  try {
    Object.defineProperty(globalThis, 'document', {
      configurable: true,
      value: { cookie: 'theme=dark; XSRF-TOKEN=encoded%3Dtoken' },
    });

    const headers = authHeaders();

    assert.equal(headers.get('X-XSRF-TOKEN'), 'encoded=token');
    assert.equal(headers.has('X-CSRF-TOKEN'), false);
  } finally {
    if (originalDocument) {
      Object.defineProperty(globalThis, 'document', originalDocument);
    } else {
      delete (globalThis as typeof globalThis & { document?: Document }).document;
    }
  }
});
