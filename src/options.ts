import { ERROR_MESSAGES } from "@/constants";
import type { FetchLinkPreviewOptions, LinkPreviewResponse } from "@/types";

export type FetchLike = typeof globalThis.fetch;

export function resolveAbortSignal(
  timeoutMs: number,
  signal?: AbortSignal,
): AbortSignal {
  const timeoutSignal = AbortSignal.timeout(timeoutMs);
  if (!signal) return timeoutSignal;

  if (typeof AbortSignal.any === "function") {
    return AbortSignal.any([timeoutSignal, signal]);
  }

  const controller = new AbortController();
  const abortWith = (reason: unknown) => {
    if (!controller.signal.aborted) {
      controller.abort(reason);
    }
  };

  if (signal.aborted) {
    abortWith(signal.reason);
    return controller.signal;
  }
  if (timeoutSignal.aborted) {
    abortWith(timeoutSignal.reason);
    return controller.signal;
  }

  const onExternalAbort = () => abortWith(signal.reason);
  const onTimeoutAbort = () => abortWith(timeoutSignal.reason);
  const cleanup = () => {
    signal.removeEventListener("abort", onExternalAbort);
    timeoutSignal.removeEventListener("abort", onTimeoutAbort);
  };

  signal.addEventListener("abort", onExternalAbort);
  timeoutSignal.addEventListener("abort", onTimeoutAbort);
  // Timeout always settles → listeners are removed even if fetch already finished.
  controller.signal.addEventListener("abort", cleanup, { once: true });

  return controller.signal;
}

export function resolveTimeoutMs(
  options: FetchLinkPreviewOptions | undefined,
  defaultMs: number,
): number {
  return options?.timeoutMs ?? defaultMs;
}

export function resolveSignal(
  options: FetchLinkPreviewOptions | undefined,
  defaultTimeoutMs: number,
): AbortSignal {
  return resolveAbortSignal(resolveTimeoutMs(options, defaultTimeoutMs), options?.signal);
}

export function resolveFetch(options?: FetchLinkPreviewOptions): FetchLike {
  return options?.fetch ?? globalThis.fetch;
}

/** Explicit `userAgent`, or `User-Agent` / `user-agent` from `headers`. */
export function resolveUserAgent(options?: FetchLinkPreviewOptions): string | undefined {
  if (options?.userAgent) return options.userAgent;
  const headers = options?.headers;
  if (!headers) return undefined;
  return headers["User-Agent"] ?? headers["user-agent"];
}

export function resolveHeaders(
  base: Record<string, string>,
  options?: FetchLinkPreviewOptions,
): Record<string, string> {
  const headers = { ...base, ...options?.headers };
  const userAgent = resolveUserAgent(options);
  if (userAgent) {
    headers["User-Agent"] = userAgent;
  }
  return headers;
}

export function shouldUseFallback(options?: FetchLinkPreviewOptions): boolean {
  return options?.fallback !== false;
}

export function shouldUsePlatforms(options?: FetchLinkPreviewOptions): boolean {
  return options?.platforms !== false;
}

export function noPreviewResponse(): LinkPreviewResponse {
  return { ok: false, message: ERROR_MESSAGES.NO_PREVIEW_METADATA };
}
