import { getFileUrl, pb } from './pocketbase'

const COLLECTION_NAME = 'manifests'

function ensurePocketBase() {
  if (!pb) {
    throw new Error('PocketBase is not configured. Add VITE_POCKETBASE_URL to your environment.')
  }
}

function mapManifest(record) {
  return {
    id: record.id,
    title: record.title,
    notes: record.notes ?? '',
    category: record.category ?? '',
    status: record.status,
    achievedAt: record.achievedAt ?? null,
    image: record.image ?? '',
    imageUrl: getFileUrl(record, record.image),
    sortOrder: Number(record.sortOrder ?? 0),
    board: Array.isArray(record.board) ? record.board[0] ?? '' : record.board ?? '',
    created: record.created,
    updated: record.updated,
  }
}

function buildManifestPayload(values) {
  const payload = {
    title: values.title,
    notes: values.notes || '',
    category: values.category || '',
    status: values.status,
    sortOrder: Number(values.sortOrder ?? Date.now()),
    board: values.board || '',
  }

  // Keep achievedAt in sync with the selected status.
  payload.achievedAt = values.status === 'achieved'
    ? values.achievedAt || new Date().toISOString()
    : ''

  if (values.image instanceof File) {
    payload.image = values.image
  }

  return payload
}

export async function getAllManifests(boardId) {
  ensurePocketBase()
  const records = await pb.collection(COLLECTION_NAME).getFullList({
    filter: boardId ? `board = "${boardId}"` : '',
    sort: '-sortOrder,-created',
  })

  return records.map(mapManifest)
}

export async function getActiveManifests(boardId) {
  ensurePocketBase()
  const records = await pb.collection(COLLECTION_NAME).getFullList({
    filter: boardId
      ? `status != "achieved" && board = "${boardId}"`
      : 'status != "achieved"',
    sort: '-sortOrder,-created',
  })

  return records.map(mapManifest)
}

export async function getAchievedManifests(boardId) {
  ensurePocketBase()
  const records = await pb.collection(COLLECTION_NAME).getFullList({
    filter: boardId
      ? `status = "achieved" && board = "${boardId}"`
      : 'status = "achieved"',
    sort: '-achievedAt,-updated',
  })

  return records.map(mapManifest)
}

export async function getManifestById(id) {
  ensurePocketBase()
  const record = await pb.collection(COLLECTION_NAME).getOne(id)
  return mapManifest(record)
}

export async function createManifest(values) {
  ensurePocketBase()
  const record = await pb.collection(COLLECTION_NAME).create(buildManifestPayload(values))
  return mapManifest(record)
}

export async function updateManifest(id, values) {
  ensurePocketBase()
  const record = await pb.collection(COLLECTION_NAME).update(id, buildManifestPayload(values))
  return mapManifest(record)
}

export async function markManifestAchieved(id) {
  ensurePocketBase()
  const record = await pb.collection(COLLECTION_NAME).update(id, {
    status: 'achieved',
    achievedAt: new Date().toISOString(),
  })

  return mapManifest(record)
}

export async function deleteManifest(id) {
  ensurePocketBase()
  await pb.collection(COLLECTION_NAME).delete(id)
}

export async function saveManifestOrder(manifests) {
  ensurePocketBase()

  const total = manifests.length

  await Promise.all(
    manifests.map((manifest, index) => pb.collection(COLLECTION_NAME).update(manifest.id, {
      sortOrder: total - index,
    })),
  )
}

export async function assignBoardToUnassignedManifests(boardId) {
  ensurePocketBase()

  const records = await pb.collection(COLLECTION_NAME).getFullList({
    filter: 'board = "" || board = null',
    sort: '-created',
  })

  if (records.length === 0) {
    return
  }

  await Promise.all(
    records.map((record, index) => pb.collection(COLLECTION_NAME).update(record.id, {
      board: boardId,
      sortOrder: Number(record.sortOrder ?? records.length - index),
    })),
  )
}
