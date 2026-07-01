import {
  BROWSER_USER_AGENT,
  JSON_ACCEPT_HEADER,
  OEMBED_TIMEOUT_MS,
  PLATFORM_DEFAULTS,
  buildRedditOEmbedUrl,
} from "@/constants";
import { decodeHtmlEntities, isRedditUrl, pickString, stripHtmlTags } from "@/lib";
import type { LinkPreviewData } from "@/types";
import { fetchOEmbedJson } from "./oembed";

const REDDIT_DEFAULTS = PLATFORM_DEFAULTS.reddit;

interface RedditPostListing {
  data?: {
    children?: Array<{
      data?: {
        title?: string;
        selftext?: string;
        author?: string;
        subreddit_name_prefixed?: string;
        thumbnail?: string;
        preview?: { images?: Array<{ source?: { url?: string } }> };
      };
    }>;
  };
}

function redditJsonEndpoint(inputUrl: string) {
  try {
    const parsed = new URL(inputUrl);
    if (!isRedditUrl(inputUrl)) return undefined;

    let path = parsed.pathname.replace(/\/$/, "");
    if (path.endsWith(".json")) return parsed.href;
    if (!path.includes("/comments/")) return undefined;

    return `${parsed.origin}${path}.json`;
  } catch {
    return undefined;
  }
}

function decodeRedditPreviewImage(
  post: NonNullable<NonNullable<RedditPostListing["data"]>["children"]>[number]["data"],
) {
  const previewUrl = post?.preview?.images?.[0]?.source?.url;
  if (previewUrl) {
    return decodeHtmlEntities(previewUrl.replace(/&amp;/g, "&"));
  }

  const thumbnail = pickString(post?.thumbnail);
  if (thumbnail && /^https?:\/\//i.test(thumbnail)) return thumbnail;

  return undefined;
}

async function fetchRedditJsonPreview(inputUrl: string): Promise<LinkPreviewData | null> {
  const jsonUrl = redditJsonEndpoint(inputUrl);
  if (!jsonUrl) return null;

  try {
    const response = await fetch(jsonUrl, {
      headers: { Accept: JSON_ACCEPT_HEADER, "User-Agent": BROWSER_USER_AGENT },
      signal: AbortSignal.timeout(OEMBED_TIMEOUT_MS),
    });

    if (!response.ok) return null;

    const listings = (await response.json()) as RedditPostListing[];
    const post = listings[0]?.data?.children?.[0]?.data;
    if (!post) return null;

    const title = pickString(post.title);
    const description = pickString(post.selftext);
    const image = decodeRedditPreviewImage(post);

    if (!title && !description && !image) return null;

    return {
      url: inputUrl,
      finalUrl: inputUrl,
      title,
      description: description || undefined,
      image,
      siteName: pickString(post.subreddit_name_prefixed) || REDDIT_DEFAULTS.siteName,
      type: REDDIT_DEFAULTS.type,
      favicon: REDDIT_DEFAULTS.favicon,
    };
  } catch {
    return null;
  }
}

async function fetchRedditOEmbedPreview(inputUrl: string): Promise<LinkPreviewData | null> {
  const data = await fetchOEmbedJson(buildRedditOEmbedUrl(inputUrl));
  if (!data) return null;

  const title = pickString(data.title);
  const author = pickString(data.author_name);
  const image = pickString(data.thumbnail_url);
  const description = data.html ? stripHtmlTags(data.html) : undefined;

  if (!title && !author && !image && !description) return null;

  return {
    url: inputUrl,
    finalUrl: inputUrl,
    title: title || (author ? `Post by ${author}` : undefined),
    description,
    image,
    siteName: pickString(data.provider_name) || REDDIT_DEFAULTS.siteName,
    type: REDDIT_DEFAULTS.type,
    favicon: REDDIT_DEFAULTS.favicon,
  };
}

export async function fetchRedditPreview(inputUrl: string): Promise<LinkPreviewData | null> {
  return (await fetchRedditOEmbedPreview(inputUrl)) ?? fetchRedditJsonPreview(inputUrl);
}
