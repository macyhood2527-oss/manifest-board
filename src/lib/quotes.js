import { getAuthUserId, supabase } from './supabase'

const TABLE_NAME = 'quotes'

function ensureConfigured() {
  if (!supabase) {
    throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment.')
  }
}

async function ensureAuthenticatedUser() {
  const userId = await getAuthUserId()

  if (!userId) {
    throw new Error('Sign in to keep your quote vault personal.')
  }

  return userId
}

function mapQuote(record) {
  return {
    id: record.id,
    quoteText: record.quote_text ?? '',
    author: record.author ?? '',
    note: record.note ?? '',
    isPinned: Boolean(record.is_pinned),
    sortOrder: Number(record.sort_order ?? 0),
    created: record.created_at,
    updated: record.updated_at,
  }
}

function buildQuotePayload(values, userId) {
  return {
    user_id: userId,
    quote_text: values.quoteText.trim(),
    author: values.author?.trim() || '',
    note: values.note?.trim() || '',
    is_pinned: Boolean(values.isPinned),
    sort_order: Number(values.sortOrder ?? Date.now()),
  }
}

export async function getQuotes() {
  ensureConfigured()
  const userId = await ensureAuthenticatedUser()
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .eq('user_id', userId)
    .order('is_pinned', { ascending: false })
    .order('sort_order', { ascending: false })
    .order('updated_at', { ascending: false })

  if (error) {
    throw error
  }

  return (data ?? []).map(mapQuote)
}

export async function createQuote(values) {
  ensureConfigured()
  const userId = await ensureAuthenticatedUser()
  const payload = buildQuotePayload(values, userId)
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert(payload)
    .select('*')
    .single()

  if (error) {
    throw error
  }

  return mapQuote(data)
}

export async function updateQuote(id, values) {
  ensureConfigured()
  const userId = await ensureAuthenticatedUser()
  const payload = buildQuotePayload(values, userId)
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .update(payload)
    .eq('id', id)
    .select('*')
    .single()

  if (error) {
    throw error
  }

  return mapQuote(data)
}

export async function deleteQuote(id) {
  ensureConfigured()
  const { error } = await supabase
    .from(TABLE_NAME)
    .delete()
    .eq('id', id)

  if (error) {
    throw error
  }
}
