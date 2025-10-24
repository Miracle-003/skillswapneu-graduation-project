import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import routes from './routes'

export function createServer() {
  const app = express()

  app.use(helmet())
  app.use(cors({ origin: '*' }))
  app.use(express.json())
  app.use(morgan('dev'))

  app.get('/health', (_req: express.Request, res: express.Response) => res.json({ ok: true }))

  app.use('/api', routes)

  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  })

  return app
}
