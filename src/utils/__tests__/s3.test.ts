import { test, after } from "node:test";
import assert from "node:assert/strict";

// s3.ts reads AWS_* env vars at module-load time (to build the AwsClient
// instances), so these must be set before it's imported. A static top-level
// `import` would be hoisted ahead of this assignment, so we set the env vars
// first and then dynamically import.
process.env.AWS_REGION = "us-east-1";
process.env.AWS_ACCESS_KEY_ID = "test-access-key-id";
process.env.AWS_SECRET_ACCESS_KEY = "test-secret-access-key";
process.env.AWS_BUCKET_NAME = "test-bucket.example.com";
process.env.DATA_CLOUDFRONT_DISTRIBUTION_ID = "TESTDISTRIBUTION123";

const { uploadToS3, uploadCalendarToS3, getFromS3 } = await import("../s3.ts");

type CapturedRequest = { url: string; method: string; headers: Headers; body: string };

const originalFetch = globalThis.fetch;
let captured: CapturedRequest[] = [];
// Maps "METHOD url-substring" -> Response to return; falls back to `ok: true`.
let responseOverrides: { match: (url: string, method: string) => boolean; response: () => Response }[] = [];

function installMockFetch() {
  captured = [];
  responseOverrides = [];
  globalThis.fetch = async (input: RequestInfo | URL) => {
    const req = input as Request;
    const body = req.body ? await req.text() : "";
    captured.push({ url: req.url, method: req.method, headers: req.headers, body });

    const override = responseOverrides.find(o => o.match(req.url, req.method));
    if (override) {
      return override.response();
    }
    return new Response("{}", { status: 200 });
  };
}

test("getFromS3 issues a path-style GET and parses the JSON body", async () => {
  installMockFetch();
  responseOverrides.push({
    match: () => true,
    response: () => new Response(JSON.stringify({ hello: "world" }), { status: 200 }),
  });

  const data = await getFromS3("hockey-games/latest.json");

  assert.deepEqual(data, { hello: "world" });
  assert.equal(captured.length, 1);
  assert.equal(captured[0].method, "GET");
  // Path-style (s3.<region>.amazonaws.com/<bucket>/<key>), not virtual-hosted
  // style -- the dotted bucket name breaks TLS SNI under virtual-hosted style.
  assert.equal(captured[0].url, "https://s3.us-east-1.amazonaws.com/test-bucket.example.com/hockey-games/latest.json");
});

test("uploadToS3 skips the upload when the key already exists (HEAD is ok)", async () => {
  installMockFetch();
  responseOverrides.push({ match: (_url, method) => method === "HEAD", response: () => new Response(null, { status: 200 }) });

  const uploaded = await uploadToS3({ some: "data" }, "hockey-games/existing.json");

  assert.equal(uploaded, false);
  assert.equal(captured.length, 1);
  assert.equal(captured[0].method, "HEAD");
});

test("uploadToS3 PUTs new data, then copies it to latest.json, then invalidates CloudFront", async () => {
  installMockFetch();
  responseOverrides.push({ match: (_url, method) => method === "HEAD", response: () => new Response(null, { status: 404 }) });

  const uploaded = await uploadToS3([{ id: 1 }], "hockey-games/newhash.json");

  assert.equal(uploaded, true);
  assert.equal(captured.length, 4);

  const [head, put, copy, invalidate] = captured;

  assert.equal(head.method, "HEAD");

  assert.equal(put.method, "PUT");
  assert.equal(put.url, "https://s3.us-east-1.amazonaws.com/test-bucket.example.com/hockey-games/newhash.json");
  assert.equal(put.headers.get("content-type"), "application/json");
  assert.equal(put.body, JSON.stringify([{ id: 1 }]));

  // Copy to latest.json is unconditional -- this is exactly the step that
  // bit us in production when testing against a scratch key, so pin it down.
  assert.equal(copy.method, "PUT");
  assert.equal(copy.url, "https://s3.us-east-1.amazonaws.com/test-bucket.example.com/hockey-games/latest.json");
  assert.equal(copy.headers.get("x-amz-copy-source"), "/test-bucket.example.com/hockey-games/newhash.json");

  assert.equal(invalidate.method, "POST");
  assert.equal(invalidate.url, "https://cloudfront.amazonaws.com/2020-05-31/distribution/TESTDISTRIBUTION123/invalidation");
  assert.match(invalidate.body, /<Path>\/hockey-games\/latest\.json<\/Path>/);
});

test("uploadToS3 throws if the PUT fails, without attempting the latest.json copy", async () => {
  installMockFetch();
  responseOverrides.push({ match: (_url, method) => method === "HEAD", response: () => new Response(null, { status: 404 }) });
  // 400, not 500 -- aws4fetch retries 5xx/429 internally by design, which
  // would make this test slow and the request count assertion below wrong.
  // A 400 is treated as a non-retryable client error and returned immediately.
  responseOverrides.push({ match: (_url, method) => method === "PUT", response: () => new Response("nope", { status: 400 }) });

  await assert.rejects(() => uploadToS3({}, "hockey-games/willfail.json"));

  // Only HEAD + the failed PUT -- no copy-to-latest, no invalidation.
  assert.equal(captured.length, 2);
});

test("uploadCalendarToS3 PUTs with text/calendar and invalidates the calendar's own path (not latest.json)", async () => {
  installMockFetch();

  const uploaded = await uploadCalendarToS3("BEGIN:VCALENDAR...", "hockey-calendar/ice-pack-schedule.ics");

  assert.equal(uploaded, true);
  assert.equal(captured.length, 2);

  const [put, invalidate] = captured;
  assert.equal(put.method, "PUT");
  assert.equal(put.headers.get("content-type"), "text/calendar");
  assert.equal(put.body, "BEGIN:VCALENDAR...");

  assert.match(invalidate.body, /<Path>\/hockey-calendar\/ice-pack-schedule\.ics<\/Path>/);
});

test("uploadToS3 and uploadCalendarToS3 skip CloudFront invalidation when no distribution ID is configured", async () => {
  const originalDistId = process.env.DATA_CLOUDFRONT_DISTRIBUTION_ID;
  delete process.env.DATA_CLOUDFRONT_DISTRIBUTION_ID;
  try {
    // Cache-bust the module specifier so s3.ts re-evaluates with the
    // distribution ID unset (module-level state is otherwise cached).
    // TS can't resolve the ?query suffix at the type level; it's a Node
    // runtime-only module-identity trick.
    // @ts-expect-error -- see comment above
    const fresh = await import("../s3.ts?no-cloudfront-dist");
    installMockFetch();
    responseOverrides.push({ match: (_url, method) => method === "HEAD", response: () => new Response(null, { status: 404 }) });

    await fresh.uploadToS3({}, "hockey-games/nocdn.json");

    // HEAD + PUT + copy-to-latest, but no POST to CloudFront.
    assert.equal(captured.length, 3);
    assert.ok(captured.every(c => c.method !== "POST"));
  } finally {
    if (originalDistId) {
      process.env.DATA_CLOUDFRONT_DISTRIBUTION_ID = originalDistId;
    }
  }
});

after(() => {
  globalThis.fetch = originalFetch;
});
