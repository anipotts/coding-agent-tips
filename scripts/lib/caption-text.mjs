import { parseFragment } from 'parse5';

// Plain text for caption comparisons, never sanitized HTML for rendering.
export function captionText(html) {
  const text = (node) => {
    if (node.nodeName === '#text') return node.value;
    if (['script', 'style', 'template'].includes(node.tagName)) return '';
    return (node.childNodes ?? []).map(text).join('');
  };
  return text(parseFragment(html)).replace(/\s+/g, ' ').trim();
}
