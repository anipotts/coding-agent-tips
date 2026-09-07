import type { APIContext } from 'astro';
import { buildAgentIndex } from '../../agent-index.mjs';
import { contentKeyForRoute } from '../../agent-catalog.mjs';
import { AGENT_CATALOG_VERSION } from '../../agent-index-version.mjs';

export async function getStaticPaths() {
  const index = await buildAgentIndex(process.cwd());
  return index.pages.map((page) => ({ params: { page: contentKeyForRoute(page.route) }, props: { page } }));
}

export function GET({ props }: APIContext) {
  return new Response(`${JSON.stringify({ schemaVersion: AGENT_CATALOG_VERSION, page: props.page })}\n`, {
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'public, max-age=300' },
  });
}
