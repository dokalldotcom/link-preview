import {
  BROWSER_USER_AGENT,
  JSON_ACCEPT_HEADER,
  OEMBED_TIMEOUT_MS,
  PLATFORM_DEFAULTS,
  buildXOEmbedUrl,
  buildXSyndicationUrl,
} from "@/constants";
import { pickString, stripHtmlTags, xTweetId } from "@/lib";
import type { LinkPreviewData } from "@/types";
import { fetchOEmbedJson } from "./oembed";

const X_DEFAULTS = PLATFORM_DEFAULTS.x;

interface XSyndicationTweet {
  text?: string;
  user?: { name?: string; screen_name?: string; profile_image_url_https?: string };
  photos?: Array<{ url?: string }>;
  mediaDetails?: Array<{ media_url_https?: string }>;
}

async function fetchXSyndicationPreview(
  inputUrl: string,
  tweetId: string,
): Promise<LinkPreviewData | null> {
  try {
    const response = await fetch(buildXSyndicationUrl(tweetId), {
      headers: { Accept: JSON_ACCEPT_HEADER, "User-Agent": BROWSER_USER_AGENT },
      signal: AbortSignal.timeout(OEMBED_TIMEOUT_MS),
    });

    if (!response.ok) return null;

    const data = (await response.json()) as XSyndicationTweet;
    const description = pickString(data.text);
    const name = pickString(data.user?.name);
    const screenName = pickString(data.user?.screen_name);
    const image =
      pickString(data.photos?.[0]?.url) ||
      pickString(data.mediaDetails?.[0]?.media_url_https);
    const favicon = pickString(data.user?.profile_image_url_https);

    if (!description && !name && !image) return null;

    const title = name && screenName ? `${name} (@${screenName})` : name || screenName;

    return {
      url: inputUrl,
      finalUrl: inputUrl,
      title,
      description,
      image,
      siteName: X_DEFAULTS.siteName,
      type: X_DEFAULTS.type,
      favicon,
    };
  } catch {
    return null;
  }
}

async function fetchXOEmbedPreview(inputUrl: string): Promise<LinkPreviewData | null> {
  const data = await fetchOEmbedJson(buildXOEmbedUrl(inputUrl));
  if (!data) return null;

  const title = pickString(data.author_name);
  const description = data.html ? stripHtmlTags(data.html) : undefined;

  if (!title && !description) return null;

  return {
    url: inputUrl,
    finalUrl: inputUrl,
    title,
    description,
    siteName: pickString(data.provider_name) || X_DEFAULTS.siteName,
    type: X_DEFAULTS.type,
    favicon: X_DEFAULTS.favicon,
  };
}

export async function fetchXPreview(inputUrl: string): Promise<LinkPreviewData | null> {
  const tweetId = xTweetId(inputUrl);
  if (tweetId) {
    const syndication = await fetchXSyndicationPreview(inputUrl, tweetId);
    if (syndication) return syndication;
  }

  return fetchXOEmbedPreview(inputUrl);
}
