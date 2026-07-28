import type { FetchLinkPreviewOptions, LinkPreviewResponse } from "@/types";
import { isFacebookUrl } from "@/lib";
import { noPreviewResponse, shouldUseFallback, shouldUsePlatforms } from "@/options";
import { fetchFacebookPreview } from "./platforms";

export function buildUrlOnlyPreview(inputUrl: string): LinkPreviewResponse {
  let siteName: string | undefined;
  try {
    siteName = new URL(inputUrl).hostname.replace(/^www\./, "");
  } catch {
    siteName = undefined;
  }

  return {
    ok: true,
    preview: { url: inputUrl, finalUrl: inputUrl, title: inputUrl, siteName },
  };
}

export async function buildFinalFallback(
  inputUrl: string,
  options?: FetchLinkPreviewOptions,
): Promise<LinkPreviewResponse> {
  if (!shouldUseFallback(options)) {
    return noPreviewResponse();
  }

  if (shouldUsePlatforms(options) && isFacebookUrl(inputUrl)) {
    return fetchFacebookPreview(inputUrl, options);
  }

  return buildUrlOnlyPreview(inputUrl);
}
