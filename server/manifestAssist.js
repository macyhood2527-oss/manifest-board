import { createClient } from '@supabase/supabase-js'

const OPENAI_API_URL = 'https://api.openai.com/v1/responses'
const DEFAULT_MODEL = 'gpt-5-mini'
const AI_USAGE_TABLE = 'ai_usage_events'
const DAILY_LIMIT = Number(process.env.AI_DAILY_LIMIT || 3)
const MONTHLY_LIMIT = Number(process.env.AI_MONTHLY_LIMIT || 30)

const TONE_INSTRUCTIONS = {
  dreamy: 'Use soft, aspirational language with a little warmth and visual imagination.',
  grounded: 'Use calm, concrete, believable language that feels practical and emotionally clear.',
  luxurious: 'Use elegant, abundant language while keeping it tasteful and specific.',
}

function getRequiredEnv(name) {
  const value = process.env[name]

  if (!value) {
    throw new Error(`${name} is required for the AI helper.`)
  }

  return value
}

function getStartOfDayIso() {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  return now.toISOString()
}

function getStartOfMonthIso() {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
}

function getSupabaseUserClient(accessToken) {
  const supabaseUrl = getRequiredEnv('VITE_SUPABASE_URL')
  const supabaseAnonKey = getRequiredEnv('VITE_SUPABASE_ANON_KEY')

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  })
}

async function requireAuthenticatedUser(accessToken) {
  if (!accessToken) {
    throw new Error('Sign in first before using the AI helper.')
  }

  const client = getSupabaseUserClient(accessToken)
  const { data, error } = await client.auth.getUser(accessToken)

  if (error || !data.user) {
    throw new Error('Your session expired. Please sign in again before using the AI helper.')
  }

  return { client, user: data.user }
}

async function enforceUsageLimits(client, userId) {
  const [{ count: dailyCount, error: dailyError }, { count: monthlyCount, error: monthlyError }] = await Promise.all([
    client
      .from(AI_USAGE_TABLE)
      .select('id', { head: true, count: 'exact' })
      .eq('user_id', userId)
      .gte('created_at', getStartOfDayIso()),
    client
      .from(AI_USAGE_TABLE)
      .select('id', { head: true, count: 'exact' })
      .eq('user_id', userId)
      .gte('created_at', getStartOfMonthIso()),
  ])

  if (dailyError || monthlyError) {
    throw new Error('Unable to verify AI usage limits right now.')
  }

  if ((dailyCount || 0) >= DAILY_LIMIT) {
    throw new Error(`You have reached the AI helper limit for today. Please try again tomorrow.`)
  }

  if ((monthlyCount || 0) >= MONTHLY_LIMIT) {
    throw new Error(`You have reached the AI helper limit for this month.`)
  }
}

async function recordUsage(client, userId, mode) {
  const { error } = await client
    .from(AI_USAGE_TABLE)
    .insert({
      user_id: userId,
      mode,
    })

  if (error) {
    throw new Error('Your draft was created, but usage tracking could not be recorded safely.')
  }
}

export async function generateManifestDraft({
  apiKey,
  accessToken,
  prompt = '',
  tone = 'dreamy',
  mode = 'generate',
  currentValues = {},
}) {
  if (!apiKey) {
    throw new Error('AI helper is not configured yet. Add OPENAI_API_KEY to your environment first.')
  }

  const normalizedPrompt = String(prompt).trim()

  if (!normalizedPrompt && mode === 'generate') {
    throw new Error('Share a little context before generating a manifest draft.')
  }

  if (mode === 'rewrite' && !currentValues.title && !currentValues.notes) {
    throw new Error('Write at least a title or notes first before asking for a rewrite.')
  }

  const { client, user } = await requireAuthenticatedUser(accessToken)
  await enforceUsageLimits(client, user.id)

  const instructions = [
    'You are helping a user write one short, emotionally clear manifest card.',
    'Return valid JSON only.',
    'Use this exact shape: {"title":"...","category":"...","notes":"..."}',
    'Keep title under 70 characters.',
    'Category must be one of: Travel, Home, Career, Wellness, Relationships, Lifestyle.',
    'Notes should be 2-4 warm sentences and concrete, not generic affirmations.',
    'Avoid markdown, bullet points, and extra keys.',
    TONE_INSTRUCTIONS[tone] || TONE_INSTRUCTIONS.dreamy,
  ].join(' ')

  const userInput = JSON.stringify({
    mode,
    prompt: normalizedPrompt,
    currentValues: {
      title: currentValues.title || '',
      category: currentValues.category || '',
      notes: currentValues.notes || '',
      status: currentValues.status || 'dreaming',
    },
  })

  const openAiResponse = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      input: [
        {
          role: 'system',
          content: [{ type: 'input_text', text: instructions }],
        },
        {
          role: 'user',
          content: [{ type: 'input_text', text: userInput }],
        },
      ],
    }),
  })

  const payload = await openAiResponse.json()

  if (!openAiResponse.ok) {
    throw new Error(payload?.error?.message || 'Unable to generate a manifest draft right now.')
  }

  const outputText = String(payload.output_text || '').trim()

  if (!outputText) {
    throw new Error('The AI helper returned an empty draft. Please try again.')
  }

  const parsedDraft = JSON.parse(outputText)

  await recordUsage(client, user.id, mode)

  return {
    title: String(parsedDraft.title || '').trim(),
    category: String(parsedDraft.category || '').trim(),
    notes: String(parsedDraft.notes || '').trim(),
  }
}
