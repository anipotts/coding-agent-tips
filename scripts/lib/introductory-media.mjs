import { parseFragment } from 'parse5';

export function introductoryMediaError(html) {
  const firstMedia = (node) => {
    if (node.tagName === 'img' || node.tagName === 'video') return node;
    for (const child of node.childNodes ?? []) {
      const media = firstMedia(child);
      if (media) return media;
    }
  };
  const media = firstMedia(parseFragment(html));
  if (!media) return 'introductory product visual must include an image or recording';
  const attributes = Object.fromEntries(media.attrs.map(({ name, value }) => [name, value]));
  if (media.tagName === 'img') {
    if (attributes.loading !== 'eager' || attributes.fetchpriority !== 'high') {
      return 'introductory product visual must prioritize the first image';
    }
  } else {
    if (!attributes.src || !attributes.poster || !(Number(attributes.width) > 0) || !(Number(attributes.height) > 0)) {
      return 'introductory recording must include its source, poster, and reserved dimensions';
    }
    if (!['auto', 'metadata'].includes(attributes.preload)) {
      return 'introductory recording must preload its media or metadata';
    }
  }
  return null;
}
