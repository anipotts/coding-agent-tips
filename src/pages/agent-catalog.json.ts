import { buildAgentCatalog } from '../agent-catalog.mjs';

export async function GET() {
  return new Response(`${JSON.stringify(await buildAgentCatalog(process.cwd()))}\n`, {
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'public, max-age=300' },
  });
}
