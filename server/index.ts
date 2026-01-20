import { serve } from '@hono/node-server'
import { getConnInfo } from '@hono/node-server/conninfo'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'

const app = new Hono()

app.use('*', cors())
app.use('*', async (c, next) => {
  const info = getConnInfo(c)
  const forwarded = c.req.header('x-forwarded-for')
  const realIp = c.req.header('x-real-ip')
  const socketIp = info.remote.address
  const ip = forwarded ? forwarded.split(',')[0].trim() : realIp || socketIp || 'unknown'
  console.log(`[request] ip=${ip} method=${c.req.method} path=${c.req.path}`)
  await next()
})
app.use('*', logger())

const SANKA_BASE_URL = 'https://www.sankavollerei.com/anime'
const ANIMEPLAY_BASE_URL = 'https://www.sankavollerei.com/movie/api/animeplay'
const RYZUMI_BASE_URL = 'https://backend.ryzumi.vip/anime'

// Helper to fetch and stream response
const proxyRequest = async (c: any, targetUrl: string) => {
  try {
    const headers: Record<string, string> = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/json, text/plain, */*',
    }

    // Forward relevant headers from client
    const headersToForward = ['authorization', 'content-type', 'x-token-ajaib', 'x-fid']
    headersToForward.forEach(h => {
      const val = c.req.header(h)
      if (val) headers[h] = val
    })

    const fetchOptions: any = {
      method: c.req.method,
      headers: headers,
    }

    // Forward body for non-GET requests
    if (c.req.method !== 'GET') {
      const body = await c.req.text()
      if (body) {
        fetchOptions.body = body
      }
    }

    const response = await fetch(targetUrl, fetchOptions)

    // Forward status
    c.status(response.status)

    // Forward content type
    const contentType = response.headers.get('content-type')
    if (contentType) {
      c.header('Content-Type', contentType)
    }

    // Return body
    const responseBody = await response.text()
    try {
        return c.json(JSON.parse(responseBody))
    } catch (e) {
        return c.body(responseBody)
    }
  } catch (error) {
    console.error('Proxy error:', error)
    return c.json({ error: 'Proxy failed', details: String(error) }, 500)
  }
}

app.get('/', (c) => {
  return c.text('Anime Proxy Server is running!')
})

// Sanka Routes
// Frontend: https://www.sankavollerei.com/anime/home -> /api/sanka/home
app.all('/api/sanka/*', async (c) => {
  const path = c.req.path.replace('/api/sanka', '')
  const query = c.req.query()
  const queryString = new URLSearchParams(query).toString()
  const targetUrl = `${SANKA_BASE_URL}${path}${queryString ? '?' + queryString : ''}`
  
  return proxyRequest(c, targetUrl)
})

// Animeplay Routes
app.all('/api/animeplay/*', async (c) => {
  const path = c.req.path.replace('/api/animeplay', '')
  const query = c.req.query()
  const queryString = new URLSearchParams(query).toString()
  const targetUrl = `${ANIMEPLAY_BASE_URL}${path}${queryString ? '?' + queryString : ''}`
  
  return proxyRequest(c, targetUrl)
})

// Ryzumi Routes
// Frontend: https://backend.ryzumi.vip/anime/episode/... -> /api/ryzumi/episode/...
app.all('/api/ryzumi/*', async (c) => {
  const path = c.req.path.replace('/api/ryzumi', '')
  const query = c.req.query()
  const queryString = new URLSearchParams(query).toString()
  const targetUrl = `${RYZUMI_BASE_URL}${path}${queryString ? '?' + queryString : ''}`

  return proxyRequest(c, targetUrl)
})

const port = 3051
console.log(`Server is running on port ${port}`)

serve({
  fetch: app.fetch,
  port
})
