import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { generateManifestDraft } from './server/manifestAssist.js'

function manifestAssistDevPlugin() {
  return {
    name: 'manifest-assist-dev-api',
    configureServer(server) {
      server.middlewares.use('/api/manifest-assist', async (req, res, next) => {
        if (req.method !== 'POST') {
          return next()
        }

        try {
          const body = await new Promise((resolve, reject) => {
            let data = ''
            req.on('data', (chunk) => {
              data += chunk
            })
            req.on('end', () => resolve(data))
            req.on('error', reject)
          })

          const payload = body ? JSON.parse(body) : {}
          const authorizationHeader = req.headers.authorization || ''
          const accessToken = authorizationHeader.startsWith('Bearer ')
            ? authorizationHeader.slice('Bearer '.length)
            : ''
          const draft = await generateManifestDraft({
            apiKey: process.env.OPENAI_API_KEY,
            accessToken,
            prompt: payload.prompt,
            tone: payload.tone,
            mode: payload.mode,
            currentValues: payload.currentValues,
          })

          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ draft }))
        } catch (error) {
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({
            error: error.message || 'Unable to generate a manifest draft right now.',
          }))
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  process.env.OPENAI_API_KEY = env.OPENAI_API_KEY || process.env.OPENAI_API_KEY || ''

  return {
    plugins: [react(), manifestAssistDevPlugin()],
  }
})
