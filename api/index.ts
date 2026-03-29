import { handle } from 'hono/vercel'
import app from '../server/index.js'

export const config = {
  runtime: 'edge'
}

export default handle(app)
