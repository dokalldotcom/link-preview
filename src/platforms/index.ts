import {
  isInstagramUrl,
  isRedditUrl,
  isSpotifyUrl,
  isThreadsUrl,
  isTikTokUrl,
  isXUrl,
  isYoutubeUrl,
} from "@/lib";
import type { FetchLinkPreviewOptions, LinkPreviewData } from "@/types";
import { fetchInstagramPreview, fetchThreadsPreview } from "./instagram";
import { fetchRedditPreview } from "./reddit";
import { fetchSpotifyPreview } from "./spotify";
import { fetchTikTokPreview } from "./tiktok";
import { fetchXPreview } from "./x";
import { fetchYoutubePreview } from "./youtube";

export async function tryDedicatedPlatformPreview(
  inputUrl: string,
  options?: FetchLinkPreviewOptions,
): Promise<LinkPreviewData | null> {
  if (isXUrl(inputUrl)) return fetchXPreview(inputUrl, options);
  if (isYoutubeUrl(inputUrl)) return fetchYoutubePreview(inputUrl, options);
  if (isTikTokUrl(inputUrl)) return fetchTikTokPreview(inputUrl, options);
  if (isInstagramUrl(inputUrl)) return fetchInstagramPreview(inputUrl, options);
  if (isThreadsUrl(inputUrl)) return fetchThreadsPreview(inputUrl, options);
  if (isRedditUrl(inputUrl)) return fetchRedditPreview(inputUrl, options);
  if (isSpotifyUrl(inputUrl)) return fetchSpotifyPreview(inputUrl, options);
  return null;
}

export { fetchFacebookPreview } from "./facebook";
export { fetchTikTokPreview } from "./tiktok";
export { fetchInstagramPreview, fetchThreadsPreview } from "./instagram";
export { fetchLinkedInPreview } from "./linkedin";
