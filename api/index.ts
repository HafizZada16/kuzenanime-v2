import { handle } from 'hono/vercel'
import app from '../server/index'

// The original app already has /api prefix in its routes, 
// so we don't need .basePath('/api') here.
export const GET = handle(app)
export const POST = handle(app)
export const PUT = handle(app)
export const DELETE = handle(app)
export const PATCH = handle(app)
export const OPTIONS = handle(app)
export default handle(app)
