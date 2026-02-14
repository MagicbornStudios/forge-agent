import * as React from 'react';

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&#(\d+);/g, (_, decimal: string) => {
      const code = Number.parseInt(decimal, 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : '';
    })
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) => {
      const code = Number.parseInt(hex, 16);
      return Number.isFinite(code) ? String.fromCodePoint(code) : '';
    });
}

function stripHtml(value: string): string {
  const withoutTags = value
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ');
  return normalizeWhitespace(decodeHtmlEntities(withoutTags));
}

function extractPlainText(node: React.ReactNode): string {
  if (node == null || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number' || typeof node === 'bigint') {
    return String(node);
  }
  if (Array.isArray(node)) {
    return normalizeWhitespace(node.map((child) => extractPlainText(child)).join(' '));
  }
  if (!React.isValidElement(node)) {
    return '';
  }

  const props = (node.props ?? {}) as {
    children?: React.ReactNode;
    dangerouslySetInnerHTML?: { __html?: unknown };
  };

  const html = props.dangerouslySetInnerHTML?.__html;
  const htmlText = typeof html === 'string' ? stripHtml(html) : '';
  const childText = extractPlainText(props.children);
  return normalizeWhitespace([htmlText, childText].filter(Boolean).join(' '));
}

export function toPlainText(node: React.ReactNode, fallback = ''): string {
  const text = normalizeWhitespace(extractPlainText(node));
  return text.length > 0 ? text : fallback;
}

function titleCase(value: string): string {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function toTitleFromHref(href: string, fallback: string): string {
  if (!href) return fallback;

  const path = href.split('#')[0]?.split('?')[0] ?? '';
  const segment = path
    .split('/')
    .filter(Boolean)
    .pop();

  if (!segment) return fallback;

  const decoded = decodeURIComponent(segment)
    .replace(/\.[a-z0-9]+$/i, '')
    .replace(/^\d+[-_.\s]*/, '')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[-_.]+/g, ' ');

  const titled = titleCase(normalizeWhitespace(decoded));
  return titled.length > 0 ? titled : fallback;
}
