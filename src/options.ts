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
  const abort = () => {
    if (!controller.signal.aborted) {
      controller.abort(signal.aborted ? signal.reason : timeoutSignal.reason);
    }
  };

  if (signal.aborted || timeoutSignal.aborted) {
    abort();
    return controller.signal;
  }

  signal.addEventListener("abort", abort, { once: true });
  timeoutSignal.addEventListener("abort", abort, { once: true });
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

export function resolveHeaders(
  base: Record<string, string>,
  options?: FetchLinkPreviewOptions,
): Record<string, string> {
  const headers = { ...base, ...options?.headers };
  if (options?.userAgent) {
    headers["User-Agent"] = options.userAgent;
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
