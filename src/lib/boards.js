import {
  deleteFile,
  getAuthUserId,
  getStoragePublicUrl,
  supabase,
  uploadFile,
} from './supabase'

const TABLE_NAME = 'boards'
const MANIFESTS_TABLE = 'manifests'
const BOARD_COVERS_BUCKET = 'board-covers'

async function ensureAuthenticatedUser() {
  const userId = await getAuthUserId()

  if (!userId) {
    throw new Error('Sign in to access your boards.')
  }

  return userId
}

function ensureConfigured() {
  if (!supabase) {
    throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment.')
  }
}

function mapBoard(record) {
  return {
    id: record.id,
    name: record.name,
    emoji: record.emoji ?? '',
    owner: record.user_id ?? '',
    description: record.description ?? '',
    coverImage: record.cover_image_path ?? '',
    coverImageUrl: getStoragePublicUrl(BOARD_COVERS_BUCKET, record.cover_image_path),
    theme: record.theme ?? '',
    sortOrder: Number(record.sort_order ?? 0),
    created: record.created_at,
    updated: record.updated_at,
  }
}

async function buildBoardPayload(values, currentCoverImagePath = '') {
  const userId = await ensureAuthenticatedUser()
  const payload = {
    name: values.name,
    emoji: values.emoji || '',
    user_id: values.owner || userId,
    description: values.description || '',
    theme: values.theme || '',
    sort_order: Number(values.sortOrder ?? Date.now()),
  }

  if (values.coverImage instanceof File) {
    if (currentCoverImagePath) {
      await deleteFile(BOARD_COVERS_BUCKET, currentCoverImagePath)
    }

    payload.cover_image_path = await uploadFile({
      bucket: BOARD_COVERS_BUCKET,
      file: values.coverImage,
      userId,
      folder: 'boards',
    })
  } else if (currentCoverImagePath) {
    payload.cover_image_path = currentCoverImagePath
  }

  if (values.removeCoverImage) {
    await deleteFile(BOARD_COVERS_BUCKET, currentCoverImagePath)
    payload.cover_image_path = null
  }

  return payload
}

export async function getBoards() {
  ensureConfigured()
  const userId = await ensureAuthenticatedUser()
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .eq('user_id', userId)
    .order('sort_order', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return (data ?? []).map(mapBoard)
}

export async function createBoard(values) {
  ensureConfigured()
  const payload = await buildBoardPayload(values)
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert(payload)
    .select('*')
    .single()

  if (error) {
    throw error
  }

  return mapBoard(data)
}

export async function updateBoard(id, values) {
  ensureConfigured()
  const { data: currentBoard, error: fetchError } = await supabase
    .from(TABLE_NAME)
    .select('cover_image_path')
    .eq('id', id)
    .single()

  if (fetchError) {
    throw fetchError
  }

  const payload = await buildBoardPayload(values, currentBoard?.cover_image_path ?? '')
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .update(payload)
    .eq('id', id)
    .select('*')
    .single()

  if (error) {
    throw error
  }

  return mapBoard(data)
}

export async function deleteBoard(id, fallbackBoardId) {
  ensureConfigured()

  if (!fallbackBoardId || fallbackBoardId === id) {
    throw new Error('Choose another board to move manifests into before deleting this one.')
  }

  const { data: boardToDelete, error: boardError } = await supabase
    .from(TABLE_NAME)
    .select('cover_image_path')
    .eq('id', id)
    .single()

  if (boardError) {
    throw boardError
  }

  const { error: moveError } = await supabase
    .from(MANIFESTS_TABLE)
    .update({ board_id: fallbackBoardId })
    .eq('board_id', id)

  if (moveError) {
    throw moveError
  }

  if (boardToDelete?.cover_image_path) {
    await deleteFile(BOARD_COVERS_BUCKET, boardToDelete.cover_image_path)
  }

  const { error } = await supabase
    .from(TABLE_NAME)
    .delete()
    .eq('id', id)

  if (error) {
    throw error
  }
}

export async function ensureDefaultBoard() {
  ensureConfigured()
  const userId = await ensureAuthenticatedUser()

  const boards = await getBoards()

  if (boards.length > 0) {
    return {
      boards,
      defaultBoard: boards[0],
      created: false,
    }
  }

  const defaultBoard = await createBoard({
    name: 'My Board',
    emoji: '✨',
    owner: userId,
    description: 'A gentle board for the dreams you want to keep close.',
    sortOrder: 1,
  })

  return {
    boards: [defaultBoard],
    defaultBoard,
    created: true,
  }
}
