import { fetchLinkPreviewDirectOnly, validateDirectPreviewUrl } from "../dist/index.js";

const url = process.argv[2] ?? "https://github.com/dokalldotcom/link-preview";

const validation = validateDirectPreviewUrl(url);
if (!validation.ok) {
  console.error("Invalid URL:", validation.error);
  process.exit(1);
}

console.log("Fetching preview for:", validation.url);

const result = await fetchLinkPreviewDirectOnly(validation.url);

if (!result.ok) {
  console.error("Preview failed:", result.message ?? "unknown error");
  process.exit(1);
}

console.log(JSON.stringify(result.preview, null, 2));
