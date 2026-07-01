import type { FetchLinkPreviewOptions, LinkPreviewResponse } from "@/types";
import { isFacebookUrl } from "@/lib";
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
  _options?: FetchLinkPreviewOptions,
): Promise<LinkPreviewResponse> {
  if (isFacebookUrl(inputUrl)) {
    return fetchFacebookPreview(inputUrl);
  }

  return buildUrlOnlyPreview(inputUrl);
}
