import { CancellablePromise, Cancellation } from "real-cancellable-promise";

// Cancellable Fetch
export function simpleFetch<T>(
  input: RequestInfo,
  init: RequestInit = {}
): CancellablePromise<T> {
  const controller = new AbortController();

  const promise = window
    .fetch(input, {
      ...init,
      signal: controller.signal,
    })
    .then((response) => {
      if (!response.ok) {
        // Duck type the return value so the error can be handled just
        // like a 200 response from the server:
        return {
          status: "error",
          reason: `fetch failed with status code ${response.status}`,
          // Forward the status code
          code: response.status,
        };
      }

      if (response.headers.get("content-type")?.includes("application/json")) {
        return response.json();
      } else {
        return response.text();
      }
    })
    .catch((e) => {
      if (e.name === "AbortError") {
        throw new Cancellation();
      } else {
        // rethrow the original error
        throw e;
      }
    });

  return new CancellablePromise<T>(promise, () => controller.abort());
}
