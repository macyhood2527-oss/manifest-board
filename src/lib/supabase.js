import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  })
  : null

export function ensureSupabase() {
  if (!supabase) {
    throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment.')
  }
}

export function mapAuthUser(user) {
  if (!user) {
    return null
  }

  return {
    id: user.id,
    email: user.email ?? '',
    name: user.user_metadata?.name ?? user.user_metadata?.full_name ?? '',
    rawUser: user,
  }
}

export async function getAuthUser() {
  ensureSupabase()
  const { data, error } = await supabase.auth.getUser()

  if (error) {
    throw error
  }

  return data.user ?? null
}

export async function getAuthUserId() {
  const user = await getAuthUser()
  return user?.id ?? ''
}

export function getStoragePublicUrl(bucket, filePath) {
  if (!supabase || !filePath) {
    return ''
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath)
  return data.publicUrl
}

export async function uploadFile({ bucket, file, userId, folder }) {
  ensureSupabase()

  if (!(file instanceof File)) {
    return ''
  }

  const safeFileName = file.name.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9._-]/g, '')
  const filePath = `${folder}/${userId}/${crypto.randomUUID()}-${safeFileName}`

  const { error } = await supabase.storage.from(bucket).upload(filePath, file, {
    cacheControl: '3600',
    upsert: false,
  })

  if (error) {
    throw error
  }

  return filePath
}

export async function deleteFile(bucket, filePath) {
  ensureSupabase()

  if (!filePath) {
    return
  }

  await supabase.storage.from(bucket).remove([filePath])
}
