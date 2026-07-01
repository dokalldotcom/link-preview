import { PLATFORM_DEFAULTS, buildYoutubeOEmbedUrl } from "@/constants";
import { pickString } from "@/lib";
import type { LinkPreviewData, OEmbedPayload } from "@/types";
import { buildOEmbedPreview, fetchOEmbedJson } from "./oembed";

const YOUTUBE_DEFAULTS = PLATFORM_DEFAULTS.youtube;

export async function fetchYoutubePreview(inputUrl: string): Promise<LinkPreviewData | null> {
  const data = await fetchOEmbedJson(buildYoutubeOEmbedUrl(inputUrl));
  if (!data) return null;

  return buildOEmbedPreview(
    inputUrl,
    data,
    YOUTUBE_DEFAULTS,
    (payload: OEmbedPayload) => ({
      siteName: pickString(payload.author_name) || pickString(payload.provider_name),
    }),
  );
}
