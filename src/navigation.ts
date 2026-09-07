import { sectionIndex } from './agent-index.mjs';
import type { HandbookEntry } from './content';

type TocNode = { depth: number; slug: string; text: string; children: TocNode[] };

/** Canonical headings are available before a reader opens another chapter. */
export function chapterOutline(page: HandbookEntry) {
  if (page.data.completion === 'outline') return [];
  return sectionIndex(page.body ?? '').sections
    .filter(({ depth }) => depth === 2 || depth === 3)
    .map(({ anchor, title, depth }) => ({ slug: anchor, text: title, depth }));
}

/** Both navigation surfaces use the same Starlight heading order and depth. */
export function pageOutline(items: TocNode[] = [], isOutline = false) {
  const flatten = (nodes: TocNode[]): Omit<TocNode, 'children'>[] => nodes.flatMap(({ children, ...heading }) => [
    heading,
    ...flatten(children),
  ]);
  return isOutline ? [] : flatten(items).filter(({ slug, depth }) => slug !== '_top' && depth <= 3);
}
