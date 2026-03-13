import { getAuthUserId, getFileUrl, pb } from './pocketbase'

const COLLECTION_NAME = 'boards'
const MANIFESTS_COLLECTION = 'manifests'

function ensurePocketBase() {
  if (!pb) {
    throw new Error('PocketBase is not configured. Add VITE_POCKETBASE_URL to your environment.')
  }
}

function ensureAuthenticatedUser() {
  const userId = getAuthUserId()

  if (!userId) {
    throw new Error('Sign in to access your boards.')
  }

  return userId
}

function mapBoard(record) {
  return {
    id: record.id,
    name: record.name,
    emoji: record.emoji ?? '',
    owner: Array.isArray(record.owner) ? record.owner[0] ?? '' : record.owner ?? '',
    description: record.description ?? '',
    coverImage: record.coverImage ?? '',
    coverImageUrl: getFileUrl(record, record.coverImage),
    theme: record.theme ?? '',
    sortOrder: Number(record.sortOrder ?? 0),
    created: record.created,
    updated: record.updated,
  }
}

function buildBoardPayload(values) {
  const userId = ensureAuthenticatedUser()
  const payload = {
    name: values.name,
    emoji: values.emoji || '',
    owner: values.owner || userId,
    description: values.description || '',
    theme: values.theme || '',
    sortOrder: Number(values.sortOrder ?? Date.now()),
  }

  if (values.coverImage instanceof File) {
    payload.coverImage = values.coverImage
  }

  if (values.removeCoverImage) {
    payload.coverImage = null
  }

  return payload
}

export async function getBoards() {
  ensurePocketBase()
  const userId = ensureAuthenticatedUser()
  const records = await pb.collection(COLLECTION_NAME).getFullList({
    filter: `owner = "${userId}"`,
    sort: '-sortOrder,-created',
  })

  return records.map(mapBoard)
}

export async function createBoard(values) {
  ensurePocketBase()
  const record = await pb.collection(COLLECTION_NAME).create(buildBoardPayload(values))
  return mapBoard(record)
}

export async function updateBoard(id, values) {
  ensurePocketBase()
  const record = await pb.collection(COLLECTION_NAME).update(id, buildBoardPayload(values))
  return mapBoard(record)
}

export async function deleteBoard(id, fallbackBoardId) {
  ensurePocketBase()

  if (!fallbackBoardId || fallbackBoardId === id) {
    throw new Error('Choose another board to move manifests into before deleting this one.')
  }

  const manifests = await pb.collection(MANIFESTS_COLLECTION).getFullList({
    filter: `board = "${id}"`,
    sort: '-sortOrder,-created',
  })

  if (manifests.length > 0) {
    await Promise.all(
      manifests.map((manifest) => pb.collection(MANIFESTS_COLLECTION).update(manifest.id, {
        board: fallbackBoardId,
      })),
    )
  }

  await pb.collection(COLLECTION_NAME).delete(id)
}

export async function ensureDefaultBoard() {
  ensurePocketBase()
  const userId = ensureAuthenticatedUser()

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
