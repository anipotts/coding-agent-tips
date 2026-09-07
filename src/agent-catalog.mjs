import { buildAgentIndex } from './agent-index.mjs';
import { AGENT_CATALOG_VERSION } from './agent-index-version.mjs';

export const contentKeyForRoute = (route) => route === '/' ? 'index' : route.replace(/^\/|\/$/g, '');
export const contentUrlForRoute = (route) => `/agent-pages/${contentKeyForRoute(route)}.json`;

export async function buildAgentCatalog(rootDirectory) {
  const index = await buildAgentIndex(rootDirectory);
  return {
    schemaVersion: AGENT_CATALOG_VERSION,
    name: index.name,
    discovery: { ...index.discovery, catalog: '/agent-catalog.json' },
    pages: index.pages.map(({ text, sections, ...page }) => ({
      ...page,
      contentUrl: contentUrlForRoute(page.route),
      sections: sections.map(({ text, ...heading }) => heading),
    })),
    sources: index.sources,
  };
}
