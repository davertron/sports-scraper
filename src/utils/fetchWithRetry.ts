// Retries transient failures (network errors, 5xx, 429) with exponential
// backoff + jitter. Doesn't retry other 4xx responses -- those won't fix
// themselves on retry.
export type RetryOptions = {
  retries?: number;
  initialDelayMs?: number;
};

function isRetryableStatus(status: number): boolean {
  return status === 429 || status >= 500;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchWithRetry(
  input: RequestInfo | URL,
  init?: RequestInit,
  { retries = 3, initialDelayMs = 1000 }: RetryOptions = {}
): Promise<Response> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(input, init);
      if (response.ok || !isRetryableStatus(response.status)) {
        return response;
      }
      lastError = new Error(`Fetch failed with status ${response.status} ${response.statusText}`);
    } catch (error) {
      lastError = error;
    }

    if (attempt < retries) {
      const backoff = initialDelayMs * 2 ** attempt;
      const jitter = backoff * (0.8 + Math.random() * 0.4); // +/-20%
      console.warn(
        `Fetch to ${input} failed (attempt ${attempt + 1}/${retries + 1}), retrying in ${Math.round(jitter)}ms:`,
        lastError
      );
      await sleep(jitter);
    }
  }

  throw lastError;
}
