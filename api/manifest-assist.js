import { generateManifestDraft } from '../server/manifestAssist.js'

function sendJson(response, statusCode, payload) {
  response.statusCode = statusCode
  response.setHeader('Content-Type', 'application/json')
  response.end(JSON.stringify(payload))
}

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST')
    return sendJson(response, 405, { error: 'Method not allowed.' })
  }

  const apiKey = process.env.OPENAI_API_KEY
  const authorizationHeader = request.headers.authorization || ''
  const accessToken = authorizationHeader.startsWith('Bearer ')
    ? authorizationHeader.slice('Bearer '.length)
    : ''

  if (!apiKey) {
    return sendJson(response, 500, {
      error: 'AI helper is not configured yet. Add OPENAI_API_KEY to your environment first.',
    })
  }

  try {
    const { prompt = '', tone = 'dreamy', mode = 'generate', currentValues = {} } = request.body || {}
    const parsedDraft = await generateManifestDraft({
      apiKey,
      accessToken,
      prompt,
      tone,
      mode,
      currentValues,
    })

    return sendJson(response, 200, {
      draft: {
        title: parsedDraft.title,
        category: parsedDraft.category,
        notes: parsedDraft.notes,
      },
    })
  } catch (error) {
    return sendJson(response, 500, {
      error: error.message || 'Unable to generate a manifest draft right now.',
    })
  }
}
