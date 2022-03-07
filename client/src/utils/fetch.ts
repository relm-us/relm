import { CancellablePromise, Cancellation } from "real-cancellable-promise";

// Cancellable Fetch
export function fetch<T>(
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
      // Handle the response object however you want
      if (!response.ok) {
        throw new Error(`Fetch failed with status code ${response.status}.`);
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
      }

      // rethrow the original error
      throw e;
    });

  return new CancellablePromise<T>(promise, () => controller.abort());
}
