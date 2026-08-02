import { test, after } from "node:test";
import assert from "node:assert/strict";
import { fetchWithRetry } from "../fetchWithRetry.ts";

const originalFetch = globalThis.fetch;
// Keep tests fast -- real backoff timing isn't what's under test here.
const FAST = { initialDelayMs: 1 };

after(() => {
  globalThis.fetch = originalFetch;
});

test("fetchWithRetry returns immediately on a successful first attempt", async () => {
  let calls = 0;
  globalThis.fetch = async () => {
    calls++;
    return new Response("ok", { status: 200 });
  };

  const response = await fetchWithRetry("https://example.com", undefined, FAST);

  assert.equal(response.status, 200);
  assert.equal(calls, 1);
});

test("fetchWithRetry retries on a thrown network error and succeeds once the network recovers", async () => {
  let calls = 0;
  globalThis.fetch = async () => {
    calls++;
    if (calls < 3) {
      throw new TypeError("fetch failed");
    }
    return new Response("ok", { status: 200 });
  };

  const response = await fetchWithRetry("https://example.com", undefined, FAST);

  assert.equal(response.status, 200);
  assert.equal(calls, 3);
});

test("fetchWithRetry retries on 5xx and 429 responses", async () => {
  let calls = 0;
  globalThis.fetch = async () => {
    calls++;
    if (calls === 1) return new Response("", { status: 503 });
    if (calls === 2) return new Response("", { status: 429 });
    return new Response("ok", { status: 200 });
  };

  const response = await fetchWithRetry("https://example.com", undefined, FAST);

  assert.equal(response.status, 200);
  assert.equal(calls, 3);
});

test("fetchWithRetry does NOT retry a non-retryable 4xx -- returns it immediately", async () => {
  let calls = 0;
  globalThis.fetch = async () => {
    calls++;
    return new Response("not found", { status: 404 });
  };

  const response = await fetchWithRetry("https://example.com", undefined, FAST);

  assert.equal(response.status, 404);
  assert.equal(calls, 1);
});

test("fetchWithRetry throws after exhausting all retries on persistent failures", async () => {
  let calls = 0;
  globalThis.fetch = async () => {
    calls++;
    throw new TypeError("fetch failed");
  };

  await assert.rejects(() => fetchWithRetry("https://example.com", undefined, { ...FAST, retries: 2 }));
  // Initial attempt + 2 retries = 3 total calls.
  assert.equal(calls, 3);
});

test("fetchWithRetry throws after exhausting retries on persistent 5xx", async () => {
  let calls = 0;
  globalThis.fetch = async () => {
    calls++;
    return new Response("", { status: 500 });
  };

  await assert.rejects(() => fetchWithRetry("https://example.com", undefined, { ...FAST, retries: 1 }));
  assert.equal(calls, 2);
});
