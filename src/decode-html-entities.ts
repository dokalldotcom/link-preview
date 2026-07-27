/**
 * Decode HTML/XML entities in preview text (og:title, descriptions, etc.).
 * Iterates until stable so double-encoded values like &amp;apos; decode correctly.
 */

import namedHtmlEntities from "../maps/entities.json";

const NAMED_HTML_ENTITIES = namedHtmlEntities as Record<string, string>;

const MAX_DECODE_PASSES = 4;
const NAMED_ENTITY_PATTERN = /&([a-z][a-z0-9]{1,31});/gi;
const HEX_ENTITY_PATTERN = /&#x([0-9a-f]+);/gi;
const DEC_ENTITY_PATTERN = /&#(\d+);/g;

function codePointToString(codePoint: number): string | null {
  if (!Number.isFinite(codePoint) || codePoint < 0 || codePoint > 0x10ffff) return null;
  if (codePoint >= 0xd800 && codePoint <= 0xdfff) return null;
  try {
    return String.fromCodePoint(codePoint);
  } catch {
    return null;
  }
}

function decodeHtmlEntitiesOnce(value: string): string {
  let out = value.replace(HEX_ENTITY_PATTERN, (_, hex: string) => {
    const cp = Number.parseInt(hex, 16);
    return codePointToString(cp) ?? `&#x${hex};`;
  });

  out = out.replace(DEC_ENTITY_PATTERN, (_, digits: string) => {
    const cp = Number(digits);
    return codePointToString(cp) ?? `&#${digits};`;
  });

  out = out.replace(NAMED_ENTITY_PATTERN, (entity, name: string) => {
    return NAMED_HTML_ENTITIES[name] ?? entity;
  });

  return out;
}

/** Decode HTML entities; repeats until stable (handles &amp;apos;, &amp;#39;, etc.). */
export function decodeHtmlEntities(value: string): string {
  let out = value;
  for (let pass = 0; pass < MAX_DECODE_PASSES; pass++) {
    const next = decodeHtmlEntitiesOnce(out);
    if (next === out) break;
    out = next;
  }
  return out;
}

/** Entity-like sequences still present after decode (for QA). */
export function findUnresolvedHtmlEntities(value: string): string[] {
  const matches = value.match(/&(?:#[xX][0-9a-fA-F]+|#\d+|[a-z][a-z0-9]{1,31});/g);
  return matches ? [...new Set(matches)] : [];
}

/** Names we decode explicitly (for parity tests). */
export function listSupportedNamedEntities(): string[] {
  return Object.keys(NAMED_HTML_ENTITIES);
}

/** Strip simple tags and normalize whitespace for preview title/description. */
export function cleanPreviewText(value: string): string {
  const decoded = decodeHtmlEntities(value);
  return decoded
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\u00A0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
