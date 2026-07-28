import {
  CHATGPT_PRIORITY_UAS,
  CLOUDFLARE_PRIORITY_UAS,
  CRAWLER_FETCH_TIMEOUT_MS,
  CRAWLER_PARALLEL_WAVE_SIZE,
  DEFAULT_ACCEPT_LANGUAGE,
  DEFAULT_HTML_HEADERS,
  FACEBOOK_BOT_UA,
  FETCH_TIMEOUT_MS,
} from "@/constants";
import { buildPreviewFromHtml, isChatGptUrl, isCloudflareBlocked, isJunkCloudflarePreview, readHtmlResponse } from "@/lib";
import {
  resolveFetch,
  resolveHeaders,
  resolveSignal,
  resolveUserAgent,
} from "@/options";
import type { FetchLinkPreviewOptions, HtmlFetchResult, LinkPreviewResponse } from "@/types";
import { acceptHeaderForUserAgent, buildDirectPreviewUserAgents } from "./user-agents";

export type { HtmlFetchResult } from "@/types";

export async function fetchHtml(
  inputUrl: string,
  headers: Record<string, string>,
  options?: FetchLinkPreviewOptions,
  defaultTimeoutMs = FETCH_TIMEOUT_MS,
): Promise<HtmlFetchResult | null> {
  try {
    const response = await resolveFetch(options)(inputUrl, {
      method: "GET",
      redirect: "follow",
      headers: resolveHeaders(headers, options),
      signal: resolveSignal(options, defaultTimeoutMs),
    });

    if (!response.ok) return null;

    const html = await response.text();
    if (!html) return null;

    return { response, html };
  } catch {
    return null;
  }
}

export async function fetchHtmlWithBot(
  inputUrl: string,
  options?: FetchLinkPreviewOptions & {
    rejectSubstrings?: string[];
    rejectFinalUrl?: (url: string) => boolean;
  },
): Promise<HtmlFetchResult | null> {
  const fetched = await fetchHtml(
    inputUrl,
    {
      ...DEFAULT_HTML_HEADERS,
      "Accept-Language": DEFAULT_ACCEPT_LANGUAGE,
      "User-Agent": FACEBOOK_BOT_UA,
    },
    options,
    FETCH_TIMEOUT_MS,
  );

  if (!fetched) return null;
  if (options?.rejectFinalUrl?.(fetched.response.url)) return null;
  if (options?.rejectSubstrings?.some((s) => fetched.html.includes(s))) return null;

  return fetched;
}

async function fetchHtmlPreviewAttempt(
  inputUrl: string,
  userAgent: string,
  options?: FetchLinkPreviewOptions,
): Promise<HtmlFetchResult | null> {
  try {
    const response = await resolveFetch(options)(inputUrl, {
      method: "GET",
      redirect: "follow",
      headers: resolveHeaders(
        {
          Accept: acceptHeaderForUserAgent(userAgent),
          "Accept-Language": DEFAULT_HTML_HEADERS["Accept-Language"],
          "User-Agent": userAgent,
          "Cache-Control": DEFAULT_HTML_HEADERS["Cache-Control"],
        },
        options,
      ),
      signal: resolveSignal(options, CRAWLER_FETCH_TIMEOUT_MS),
    });

    if (!response.ok) return null;

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html") && !contentType.includes("application/xhtml")) {
      return null;
    }

    const html = await readHtmlResponse(response);
    if (!html) return null;
    if (isCloudflareBlocked(response, html)) return null;

    return { response, html };
  } catch {
    return null;
  }
}

async function tryDirectPreviewFromHtml(
  inputUrl: string,
  userAgent: string,
  options?: FetchLinkPreviewOptions,
): Promise<LinkPreviewResponse | null> {
  const attempt = await fetchHtmlPreviewAttempt(inputUrl, userAgent, options);
  if (!attempt) return null;

  const preview = buildPreviewFromHtml(inputUrl, attempt.response, attempt.html);
  if (!preview.ok || !preview.preview) return null;
  if (isJunkCloudflarePreview(preview.preview)) return null;

  return preview;
}

async function tryPreviewWave(
  inputUrl: string,
  wave: readonly string[],
  options?: FetchLinkPreviewOptions,
): Promise<LinkPreviewResponse | null> {
  if (wave.length === 1) {
    return tryDirectPreviewFromHtml(inputUrl, wave[0], options);
  }

  const results = await Promise.all(
    wave.map((userAgent: string) => tryDirectPreviewFromHtml(inputUrl, userAgent, options)),
  );
  return results.find((preview: LinkPreviewResponse | null) => preview?.ok) ?? null;
}

export async function fetchDirectPreviewWithCrawlers(
  inputUrl: string,
  options?: FetchLinkPreviewOptions,
): Promise<LinkPreviewResponse | null> {
  const pinnedUserAgent = resolveUserAgent(options);
  if (pinnedUserAgent) {
    return tryDirectPreviewFromHtml(inputUrl, pinnedUserAgent, options);
  }

  const agents = buildDirectPreviewUserAgents(inputUrl);
  const priorityWaveSize = isChatGptUrl(inputUrl)
    ? CHATGPT_PRIORITY_UAS.length
    : CLOUDFLARE_PRIORITY_UAS.length;

  const priorityHit = await tryPreviewWave(
    inputUrl,
    agents.slice(0, priorityWaveSize),
    options,
  );
  if (priorityHit) return priorityHit;

  for (let i = priorityWaveSize; i < agents.length; i += CRAWLER_PARALLEL_WAVE_SIZE) {
    const hit = await tryPreviewWave(
      inputUrl,
      agents.slice(i, i + CRAWLER_PARALLEL_WAVE_SIZE),
      options,
    );
    if (hit) return hit;
  }

  return null;
}
