import PocketBase from 'pocketbase'

const pocketbaseUrl = import.meta.env.VITE_POCKETBASE_URL

// Keep one shared client for the whole frontend app.
export const pb = pocketbaseUrl ? new PocketBase(pocketbaseUrl) : null

export function getAuthUserId() {
  return pb?.authStore?.model?.id || ''
}

export function getFileUrl(record, fileName) {
  if (!pb || !record || !fileName) {
    return ''
  }

  return pb.files.getURL(record, fileName)
}
