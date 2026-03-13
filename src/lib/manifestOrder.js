const STORAGE_KEY = 'manifest-board-card-order'

function getStoredOrder() {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const storedValue = window.localStorage.getItem(STORAGE_KEY)

    if (!storedValue) {
      return []
    }

    const parsedValue = JSON.parse(storedValue)
    return Array.isArray(parsedValue) ? parsedValue : []
  } catch {
    return []
  }
}

function setStoredOrder(order) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(order))
}

export function orderManifests(manifests) {
  const storedOrder = getStoredOrder()
  const orderLookup = new Map(storedOrder.map((id, index) => [id, index]))
  return storedOrder.length === 0
    ? manifests
    : [...manifests].sort((manifestA, manifestB) => {
      const indexA = orderLookup.get(manifestA.id)
      const indexB = orderLookup.get(manifestB.id)

      if (indexA === undefined && indexB === undefined) {
        return 0
      }

      if (indexA === undefined) {
        return 1
      }

      if (indexB === undefined) {
        return -1
      }

      return indexA - indexB
    })
}

export function persistManifestOrder(manifests) {
  setStoredOrder(manifests.map((manifest) => manifest.id))
}

export function reorderManifestList(manifests, activeId, overId) {
  if (!activeId || !overId || activeId === overId) {
    return manifests
  }

  const nextManifests = [...manifests]
  const activeIndex = nextManifests.findIndex((manifest) => manifest.id === activeId)
  const overIndex = nextManifests.findIndex((manifest) => manifest.id === overId)

  if (activeIndex === -1 || overIndex === -1) {
    return manifests
  }

  const [movedManifest] = nextManifests.splice(activeIndex, 1)
  nextManifests.splice(overIndex, 0, movedManifest)

  return nextManifests
}
