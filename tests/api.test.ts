import test from 'node:test';
import assert from 'node:assert/strict';

import { authHeaders, csrfCookie } from '../app/_lib/api.ts';

test('requires an API URL in production', async () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const originalApiUrl = process.env.NEXT_PUBLIC_API_URL;

  try {
    process.env.NODE_ENV = 'production';
    process.env.NEXT_PUBLIC_API_URL = '';

    await assert.rejects(
      import('../app/_lib/api.ts?production-validation'),
      /NEXT_PUBLIC_API_URL debe estar configurada para producción/
    );
  } finally {
    if (originalNodeEnv === undefined) {
      delete process.env.NODE_ENV;
    } else {
      process.env.NODE_ENV = originalNodeEnv;
    }

    if (originalApiUrl === undefined) {
      delete process.env.NEXT_PUBLIC_API_URL;
    } else {
      process.env.NEXT_PUBLIC_API_URL = originalApiUrl;
    }
  }
});

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

test('sends the XSRF cookie only with state-changing requests', () => {
  const originalDocument = Object.getOwnPropertyDescriptor(globalThis, 'document');

  try {
    Object.defineProperty(globalThis, 'document', {
      configurable: true,
      value: { cookie: 'theme=dark; XSRF-TOKEN=encoded%3Dtoken' },
    });

    const getHeaders = authHeaders();
    const postHeaders = authHeaders(undefined, true, 'POST');

    assert.equal(getHeaders.has('X-XSRF-TOKEN'), false);
    assert.equal(postHeaders.get('X-XSRF-TOKEN'), 'encoded=token');
    assert.equal(postHeaders.has('X-CSRF-TOKEN'), false);
  } finally {
    if (originalDocument) {
      Object.defineProperty(globalThis, 'document', originalDocument);
    } else {
      delete (globalThis as typeof globalThis & { document?: Document }).document;
    }
  }
});
