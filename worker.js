// Cloudflare Worker — secure API proxy for Greg's Personal Agent
// Deploy this at: Cloudflare Dashboard > Workers > Create Worker

const ALLOWED_ORIGIN = '*'; // Lock this down after setup — see README

export default {
  async fetch(request, env) {
    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'Content-Type, X-Agent-Token',
        }
      });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    // Simple token auth — set AGENT_TOKEN in Cloudflare Worker secrets
    const agentToken = request.headers.get('X-Agent-Token');
    if (!agentToken || agentToken !== env.AGENT_TOKEN) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Forward to Anthropic API using server-side key
    const body = await request.json();
    const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'mcp-client-2025-04-04',
      },
      body: JSON.stringify(body),
    });

    const data = await anthropicResponse.json();

    return new Response(JSON.stringify(data), {
      status: anthropicResponse.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
      }
    });
  }
};
