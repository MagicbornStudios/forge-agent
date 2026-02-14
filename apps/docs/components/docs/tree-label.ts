import type { ReactNode } from 'react';

function textFromNode(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(textFromNode).join('');
  if (node && typeof node === 'object' && 'props' in node) {
    const props = (node as { props?: { children?: ReactNode; dangerouslySetInnerHTML?: { __html?: string } } }).props;
    if (props?.children != null) return textFromNode(props.children);
    if (props?.dangerouslySetInnerHTML?.__html) return props.dangerouslySetInnerHTML.__html;
  }
  return '';
}

export function toPlainText(node: ReactNode, fallback: string): string {
  const text = textFromNode(node).trim();
  return text.length > 0 ? text : fallback;
}

export function toTitleFromHref(href: string, fallback: string): string {
  const cleaned = href.replace(/\/+$/, '').split('/').filter(Boolean).pop();
  if (!cleaned) return fallback;
  return cleaned
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
