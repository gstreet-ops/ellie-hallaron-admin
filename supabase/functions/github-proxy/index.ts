import { corsHeaders } from '../_shared/cors.ts'

const GITHUB_TOKEN = Deno.env.get('GITHUB_PAT')!
const REPO = 'gstreet-ops/ellie-hallaron-website'
const API_BASE = `https://api.github.com/repos/${REPO}/contents`

function githubHeaders() {
  return {
    Authorization: `Bearer ${GITHUB_TOKEN}`,
    Accept: 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)

    if (req.method === 'GET') {
      // GET /github-proxy?path=src/_data/site.json
      const path = url.searchParams.get('path')
      if (!path) {
        return new Response(JSON.stringify({ error: 'path parameter required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const res = await fetch(`${API_BASE}/${path}`, { headers: githubHeaders() })
      const data = await res.json()

      return new Response(JSON.stringify(data), {
        status: res.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (req.method === 'PUT') {
      // PUT /github-proxy  body: { path, content, sha, message }
      const body = await req.json()
      const { path, content, sha, message } = body

      if (!path || !content || !sha || !message) {
        return new Response(JSON.stringify({ error: 'path, content, sha, and message required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const res = await fetch(`${API_BASE}/${path}`, {
        method: 'PUT',
        headers: githubHeaders(),
        body: JSON.stringify({ message, content, sha }),
      })
      const data = await res.json()

      return new Response(JSON.stringify(data), {
        status: res.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
