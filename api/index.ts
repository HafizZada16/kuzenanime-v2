import { handle } from 'hono/vercel'
import app from '../server/index'

// Error logging for Vercel
app.onError((err, c) => {
  console.error(`[API Error]: ${err.message}`, err.stack)
  return c.json({ error: 'Internal Server Error', message: err.message }, 500)
})

export const GET = handle(app)
export const POST = handle(app)
export const PUT = handle(app)
export const DELETE = handle(app)
export const PATCH = handle(app)
export const OPTIONS = handle(app)
export default handle(app)
