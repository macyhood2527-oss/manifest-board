import {
  deleteFile,
  getAuthUserId,
  getStoragePublicUrl,
  supabase,
  uploadFile,
} from './supabase'

const TABLE_NAME = 'manifests'
const MANIFEST_IMAGES_BUCKET = 'manifest-images'

function ensureConfigured() {
  if (!supabase) {
    throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment.')
  }
}

function mapManifest(record) {
  return {
    id: record.id,
    title: record.title,
    notes: record.notes ?? '',
    category: record.category ?? '',
    status: record.status,
    achievedAt: record.achieved_at ?? null,
    image: record.image_path ?? '',
    imageUrl: getStoragePublicUrl(MANIFEST_IMAGES_BUCKET, record.image_path),
    sortOrder: Number(record.sort_order ?? 0),
    board: record.board_id ?? '',
    created: record.created_at,
    updated: record.updated_at,
  }
}

async function buildManifestPayload(values, currentImagePath = '') {
  const userId = await getAuthUserId()

  if (!userId) {
    throw new Error('Sign in to manage manifests.')
  }

  const payload = {
    title: values.title,
    notes: values.notes || '',
    category: values.category || '',
    status: values.status,
    sort_order: Number(values.sortOrder ?? Date.now()),
    board_id: values.board || null,
    user_id: userId,
    achieved_at: values.status === 'achieved'
      ? values.achievedAt || new Date().toISOString()
      : null,
  }

  if (values.image instanceof File) {
    if (currentImagePath) {
      await deleteFile(MANIFEST_IMAGES_BUCKET, currentImagePath)
    }

    payload.image_path = await uploadFile({
      bucket: MANIFEST_IMAGES_BUCKET,
      file: values.image,
      userId,
      folder: 'manifests',
    })
  } else if (currentImagePath) {
    payload.image_path = currentImagePath
  }

  return payload
}

export async function getAllManifests(boardId) {
  ensureConfigured()
  const userId = await getAuthUserId()
  let query = supabase
    .from(TABLE_NAME)
    .select('*')
    .eq('user_id', userId)
    .order('sort_order', { ascending: false })
    .order('created_at', { ascending: false })

  if (boardId) {
    query = query.eq('board_id', boardId)
  }

  const { data, error } = await query

  if (error) {
    throw error
  }

  return (data ?? []).map(mapManifest)
}

export async function getActiveManifests(boardId) {
  ensureConfigured()
  const userId = await getAuthUserId()
  let query = supabase
    .from(TABLE_NAME)
    .select('*')
    .eq('user_id', userId)
    .neq('status', 'achieved')
    .order('sort_order', { ascending: false })
    .order('created_at', { ascending: false })

  if (boardId) {
    query = query.eq('board_id', boardId)
  }

  const { data, error } = await query

  if (error) {
    throw error
  }

  return (data ?? []).map(mapManifest)
}

export async function getAchievedManifests(boardId) {
  ensureConfigured()
  const userId = await getAuthUserId()
  let query = supabase
    .from(TABLE_NAME)
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'achieved')
    .order('achieved_at', { ascending: false })
    .order('updated_at', { ascending: false })

  if (boardId) {
    query = query.eq('board_id', boardId)
  }

  const { data, error } = await query

  if (error) {
    throw error
  }

  return (data ?? []).map(mapManifest)
}

export async function getManifestById(id) {
  ensureConfigured()
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    throw error
  }

  return mapManifest(data)
}

export async function createManifest(values) {
  ensureConfigured()
  const payload = await buildManifestPayload(values)
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert(payload)
    .select('*')
    .single()

  if (error) {
    throw error
  }

  return mapManifest(data)
}

export async function updateManifest(id, values) {
  ensureConfigured()
  const { data: currentManifest, error: fetchError } = await supabase
    .from(TABLE_NAME)
    .select('image_path')
    .eq('id', id)
    .single()

  if (fetchError) {
    throw fetchError
  }

  const payload = await buildManifestPayload(values, currentManifest?.image_path ?? '')
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .update(payload)
    .eq('id', id)
    .select('*')
    .single()

  if (error) {
    throw error
  }

  return mapManifest(data)
}

export async function markManifestAchieved(id) {
  ensureConfigured()
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .update({
      status: 'achieved',
      achieved_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('*')
    .single()

  if (error) {
    throw error
  }

  return mapManifest(data)
}

export async function deleteManifest(id) {
  ensureConfigured()
  const { data: manifest, error: fetchError } = await supabase
    .from(TABLE_NAME)
    .select('image_path')
    .eq('id', id)
    .single()

  if (fetchError) {
    throw fetchError
  }

  if (manifest?.image_path) {
    await deleteFile(MANIFEST_IMAGES_BUCKET, manifest.image_path)
  }

  const { error } = await supabase
    .from(TABLE_NAME)
    .delete()
    .eq('id', id)

  if (error) {
    throw error
  }
}

export async function saveManifestOrder(manifests) {
  ensureConfigured()

  const total = manifests.length

  await Promise.all(
    manifests.map((manifest, index) => supabase
      .from(TABLE_NAME)
      .update({
        sort_order: total - index,
      })
      .eq('id', manifest.id)),
  )
}

export async function assignBoardToUnassignedManifests(boardId) {
  ensureConfigured()
  const userId = await getAuthUserId()
  const { data: records, error } = await supabase
    .from(TABLE_NAME)
    .select('id, sort_order')
    .eq('user_id', userId)
    .is('board_id', null)
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  if (!records || records.length === 0) {
    return
  }

  await Promise.all(
    records.map((record, index) => supabase
      .from(TABLE_NAME)
      .update({
        board_id: boardId,
        sort_order: Number(record.sort_order ?? records.length - index),
      })
      .eq('id', record.id)),
  )
}
