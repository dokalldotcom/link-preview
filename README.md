# @dokall/link-preview [![npm](https://img.shields.io/npm/v/@dokall/link-preview.svg)](https://www.npmjs.com/package/@dokall/link-preview)

Fetch link preview metadata (title, description, image, favicon) by unfurling URLs directly — Open Graph / Twitter cards, plus platform-specific oEmbed fallbacks. No Microlink, no Iframely, no paid preview API.

Built for [Dokall Link Preview](https://dokall.com/tools/link-preview) and extracted as a standalone, zero-dependency library for Node.js 18+ and Cloudflare Workers.

## Features

- **Direct HTML crawl** — parses `og:*`, `twitter:*`, `<title>`, favicon, canonical URL
- **Platform handlers** — YouTube, X/Twitter, TikTok, Instagram, Threads, Reddit, Spotify, Facebook, LinkedIn
- **Bot rotation** — tries multiple crawler user-agents when sites block generic fetchers
- **SSRF guard** — blocks private IPs, localhost, and internal hostnames before fetching
- **Configurable** — timeout, AbortSignal, headers, User-Agent, custom `fetch`, platform/fallback toggles
- **Zero runtime dependencies** — uses native `fetch` only

## Install

```bash
npm install @dokall/link-preview
```

## Quick start

```ts
import { getLinkPreview, validateLinkPreview } from "@dokall/link-preview";

const result = await getLinkPreview("https://example.com");

if (result.ok && result.preview) {
  console.log(result.preview.title);
  console.log(result.preview.description);
  console.log(result.preview.image);
}
```

### With options

```ts
const controller = new AbortController();

const result = await getLinkPreview("https://example.com", {
  timeoutMs: 8_000,
  signal: controller.signal,
  userAgent: "MyAppBot/1.0",
  headers: { "Accept-Language": "vi-VN,vi;q=0.9" },
  fallback: false, // fail instead of url-only preview
  platforms: true, // dedicated oEmbed / platform handlers (default)
});
```

### Validate URL (SSRF-safe)

```ts
import { validateLinkPreview } from "@dokall/link-preview";

const check = validateLinkPreview("https://example.com");
if (check.ok) {
  console.log(check.url);
} else {
  console.error(check.error);
}
```

## API

### `getLinkPreview(url, options?)`

Returns `Promise<LinkPreviewResponse>`:

```ts
interface LinkPreviewResponse {
  ok: boolean;
  message?: string;
  preview?: LinkPreviewData;
}

interface LinkPreviewData {
  url: string;
  finalUrl?: string;
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
  type?: string;
  favicon?: string;
}
```

#### Options (`FetchLinkPreviewOptions`)

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `timeoutMs` | `number` | Path-dependent (8–20s) | Override request timeout for all outgoing fetches |
| `signal` | `AbortSignal` | — | Cancel in-flight requests; combined with `timeoutMs` |
| `headers` | `Record<string, string>` | — | Extra headers merged into requests. A `User-Agent` here also pins the UA and skips rotation |
| `userAgent` | `string` | Bot rotation | Custom `User-Agent`; skips crawler/platform UA rotation when set (wins over `headers`) |
| `fallback` | `boolean` | `true` | When `false`, return `{ ok: false }` instead of a url-only preview |
| `platforms` | `boolean` | `true` | When `false`, skip dedicated platform/oEmbed handlers and only crawl HTML |
| `fetch` | `typeof fetch` | `globalThis.fetch` | Custom fetch (proxy, undici Agent, etc.) |

**How `fallback` works:** if the library cannot extract title/description/image, it normally still returns `ok: true` with a minimal preview (`title` = URL, `siteName` = hostname). Set `fallback: false` when you want a hard failure instead.

**How `platforms` works:** dedicated handlers (YouTube oEmbed, X syndication, TikTok, Instagram, Facebook, LinkedIn, …) run first when enabled. Disable them to force a plain Open Graph HTML crawl only.

### `validateLinkPreview(input)`

Returns `{ ok: true, url }` or `{ ok: false, error }`.

### `assertSafeTargetUrl(rawUrl)`

Throws if the URL is invalid or targets a blocked host (use before custom fetch logic).

## Cloudflare Workers

Works in Workers — no Node-only APIs. Example route handler:

```ts
import { getLinkPreview, validateLinkPreview } from "@dokall/link-preview";

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url).searchParams.get("url");
    if (!url) return Response.json({ ok: false, message: "Missing url" }, { status: 400 });

    const validation = validateLinkPreview(url);
    if (!validation.ok) {
      return Response.json({ ok: false, message: validation.error }, { status: 400 });
    }

    const result = await getLinkPreview(validation.url, {
      timeoutMs: 10_000,
      fallback: false,
    });
    return Response.json(result);
  },
};
```

### Custom fetch (proxy)

```ts
const result = await getLinkPreview(url, {
  fetch: (input, init) =>
    fetch(input, {
      ...init,
      // e.g. route through your Worker binding / proxy
    }),
});
```

## Local example

```bash
git clone https://github.com/dokalldotcom/link-preview.git
cd link-preview
npm install
npm run example
# or with a custom URL:
npm run build && node examples/basic.mjs https://dokall.com
```

## Limitations

This library unfurls URLs with **plain `fetch` + HTML/oEmbed parsing** — no headless browser, no paid proxy API. Set expectations accordingly.

### IP blocking at scale

Traffic is sent **directly from your server** (or Worker), not through a residential proxy or paid unfurl service. At high volume, especially when repeatedly fetching the same hosts (Facebook, LinkedIn, Instagram, etc.), those sites may return **403**, **login walls**, or **CAPTCHA** challenges.

**Bot rotation** (cycling crawler user-agents) improves success on many pages but is **best-effort only** — it does not bypass rate limits, IP reputation checks, or bot detection. For production at scale, add **rate limiting**, **caching**, and consider a proxy or dedicated preview API for hard targets. Pass a custom `fetch` if you already have a proxy layer.

### No JavaScript rendering

The library **does not execute JavaScript**. It only reads HTML returned by the initial HTTP response and platform oEmbed endpoints.

Sites that are **client-rendered SPAs** without server-side Open Graph tags will often return empty or minimal metadata (blank shell HTML). Previews work best when the target page exposes **`og:*` / `twitter:*` meta tags** in the raw HTML, or when a platform oEmbed API is available.

### Other notes

- Facebook / Instagram / TikTok change frequently; platform handlers are maintained on a best-effort basis
- Always validate user-supplied URLs with `validateLinkPreview` before fetching (SSRF protection)

## Related

- [Dokall](https://dokall.com) — free online developer tools
- [Link Preview tool](https://dokall.com/tools/link-preview) — live demo of this library

## License

[MIT](./LICENSE) © [Dokall](https://dokall.com)
