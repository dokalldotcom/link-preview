# @dokall/link-preview

Fetch link preview metadata (title, description, image, favicon) by unfurling URLs directly — Open Graph / Twitter cards, plus platform-specific oEmbed fallbacks. No Microlink, no Iframely, no paid preview API.

Built for [Dokall Link Preview](https://dokall.com/tools/link-preview) and extracted as a standalone, zero-dependency library for Node.js 18+ and Cloudflare Workers.

## Features

- **Direct HTML crawl** — parses `og:*`, `twitter:*`, `<title>`, favicon, canonical URL
- **Platform handlers** — YouTube, X/Twitter, TikTok, Instagram, Threads, Reddit, Spotify, Facebook, LinkedIn
- **Bot rotation** — tries multiple crawler user-agents when sites block generic fetchers
- **SSRF guard** — blocks private IPs, localhost, and internal hostnames before fetching
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

### Validate URL (SSRF-safe)

```ts
import { validateDirectPreviewUrl } from "@dokall/link-preview";

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

    const result = await getLinkPreview(validation.url);
    return Response.json(result);
  },
};
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

**Bot rotation** (cycling crawler user-agents) improves success on many pages but is **best-effort only** — it does not bypass rate limits, IP reputation checks, or bot detection. For production at scale, add **rate limiting**, **caching**, and consider a proxy or dedicated preview API for hard targets.

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
