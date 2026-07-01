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
import { fetchLinkPreviewDirectOnly } from "@dokall/link-preview";

const result = await fetchLinkPreviewDirectOnly("https://example.com");

if (result.ok && result.preview) {
  console.log(result.preview.title);
  console.log(result.preview.description);
  console.log(result.preview.image);
}
```

### Validate URL (SSRF-safe)

```ts
import { validateDirectPreviewUrl } from "@dokall/link-preview";

const check = validateDirectPreviewUrl("https://example.com");
if (check.ok) {
  console.log(check.url);
} else {
  console.error(check.error);
}
```

## API

### `fetchLinkPreviewDirectOnly(url, options?)`

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

### `validateDirectPreviewUrl(input)`

Returns `{ ok: true, url }` or `{ ok: false, error }`.

### `assertSafeTargetUrl(rawUrl)`

Throws if the URL is invalid or targets a blocked host (use before custom fetch logic).

## Cloudflare Workers

Works in Workers — no Node-only APIs. Example route handler:

```ts
import { fetchLinkPreviewDirectOnly, validateDirectPreviewUrl } from "@dokall/link-preview";

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url).searchParams.get("url");
    if (!url) return Response.json({ ok: false, message: "Missing url" }, { status: 400 });

    const validation = validateDirectPreviewUrl(url);
    if (!validation.ok) {
      return Response.json({ ok: false, message: validation.error }, { status: 400 });
    }

    const result = await fetchLinkPreviewDirectOnly(validation.url);
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

- Some sites block crawlers or require JavaScript — previews may be incomplete
- Facebook / Instagram / TikTok can change without notice; platform handlers are best-effort
- Always validate user-supplied URLs with `validateDirectPreviewUrl` before fetching

## Related

- [Dokall](https://dokall.com) — free online developer tools
- [Link Preview tool](https://dokall.com/tools/link-preview) — live demo of this library

## License

[MIT](./LICENSE) © [Dokall](https://dokall.com)
