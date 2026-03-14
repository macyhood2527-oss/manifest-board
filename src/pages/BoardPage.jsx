import { useEffect, useState } from 'react'
import { ChevronDown, CloudMoon, Search, SunMedium, X } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useBoards } from '../boards/useBoards'
import { AppShell } from '../components/AppShell'
import { EmptyState } from '../components/EmptyState'
import { ManifestCard } from '../components/ManifestCard'
import { PageHeader } from '../components/PageHeader'
import { orderManifests, persistManifestOrder, reorderManifestList } from '../lib/manifestOrder'
import { getActiveManifests, saveManifestOrder } from '../lib/manifests'
import { mockManifests } from '../lib/mockManifests'
import { ui } from '../lib/ui'
import { useToast } from '../toast/useToast'

const FILTER_OPTIONS = ['all', 'dreaming', 'planning', 'inspiration']

function getBoardGreeting() {
  const hour = new Date().getHours()

  if (hour < 12) {
    return {
      Icon: SunMedium,
      text: 'Good morning, sunshine!',
    }
  }

  if (hour < 18) {
    return {
      Icon: SunMedium,
      text: 'Good afternoon, lovely dreamer!',
    }
  }

  return {
    Icon: CloudMoon,
    text: 'Good evening, soft soul!',
  }
}

export function BoardPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [manifests, setManifests] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [sourceLabel, setSourceLabel] = useState('Loading your board...')
  const [activeFilter, setActiveFilter] = useState('all')
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isBrowseCollapsed, setIsBrowseCollapsed] = useState(true)
  const [draggedManifestId, setDraggedManifestId] = useState('')
  const [newlyAddedManifestId, setNewlyAddedManifestId] = useState('')
  const [isUsingRemoteData, setIsUsingRemoteData] = useState(false)
  const { selectedBoard } = useBoards()
  const toast = useToast()
  const greeting = getBoardGreeting()

  useEffect(() => {
    let isMounted = true

    async function loadManifests() {
      setIsLoading(true)

      try {
        const records = await getActiveManifests(selectedBoard?.id === 'default-board' ? '' : selectedBoard?.id)

        if (!isMounted) {
          return
        }

        setManifests(records)
        setIsUsingRemoteData(true)
        setSourceLabel('Synced with Supabase')
      } catch {
        if (!isMounted) {
          return
        }

        setManifests(orderManifests(mockManifests))
        setIsUsingRemoteData(false)
        setSourceLabel('Showing starter manifests until Supabase is configured')
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadManifests()

    return () => {
      isMounted = false
    }
  }, [selectedBoard?.id])

  useEffect(() => {
    const nextManifestId = location.state?.newManifestId

    if (!nextManifestId) {
      return undefined
    }

    setNewlyAddedManifestId(nextManifestId)

    const timeoutId = window.setTimeout(() => {
      setNewlyAddedManifestId('')
      navigate(location.pathname, { replace: true, state: {} })
    }, 2200)

    return () => window.clearTimeout(timeoutId)
  }, [location.pathname, location.state, navigate])

  const categoryOptions = [
    'all',
    ...Array.from(
      new Set(
        manifests
          .map((manifest) => manifest.category?.trim())
          .filter(Boolean),
      ),
    ).sort((categoryA, categoryB) => categoryA.localeCompare(categoryB)),
  ]

  const normalizedSearchQuery = searchQuery.trim().toLowerCase()
  const filteredManifests = manifests.filter((manifest) => {
    const matchesStatus = activeFilter === 'all' ? true : manifest.status === activeFilter
    const matchesCategory = activeCategory === 'all' ? true : manifest.category === activeCategory
    const matchesSearch = normalizedSearchQuery
      ? [manifest.title, manifest.notes, manifest.category]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(normalizedSearchQuery))
      : true

    return matchesStatus && matchesCategory && matchesSearch
  })

  function handleDragStart(manifestId) {
    setDraggedManifestId(manifestId)
  }

  async function handleDrop(overManifestId) {
    let reorderedManifests = manifests

    setManifests((currentManifests) => {
      const nextManifests = reorderManifestList(currentManifests, draggedManifestId, overManifestId)
      reorderedManifests = nextManifests
      persistManifestOrder(nextManifests)
      return nextManifests
    })
    setDraggedManifestId('')

    if (!isUsingRemoteData) {
      return
    }

    try {
      await saveManifestOrder(reorderedManifests)
    } catch (error) {
      toast.error('Unable to save card order', error.message || 'Your board order could not be saved right now.')
    }
  }

  function handleDragEnd() {
    setDraggedManifestId('')
  }

  return (
    <AppShell>
      <div className={ui.pageContainer}>
        <PageHeader
          eyebrow="Visual intention board"
          title={selectedBoard?.name || 'A gentle place for your dreams'}
          coverImage={selectedBoard?.coverImageUrl || ''}
          description={(
            <span className="inline-flex items-center gap-2 text-[var(--color-text-soft)]">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--color-primary)_12%,white)] text-[var(--color-primary)] shadow-sm">
                <greeting.Icon className="h-[1.05rem] w-[1.05rem]" strokeWidth={2.1} />
              </span>
              <span>{greeting.text}</span>
            </span>
          )}
          action={
            <div className="flex flex-col items-stretch gap-3 sm:items-end">
              <div className={ui.infoPanel}>
                {sourceLabel}
              </div>
              <Link to="/manifests/new" className={`${ui.buttonPrimary} w-full sm:w-auto`}>
                Add Dream
              </Link>
            </div>
          }
        />

        <section className={`${ui.panelStrong} relative overflow-hidden px-4 py-4 sm:px-5`}>
          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[var(--color-heading)]">Browse the board</p>
                {!isBrowseCollapsed ? (
                  <p className="mt-1 text-sm text-[var(--color-text-soft)]">
                    Search by title, notes, or category, then refine by the energy you want to focus on today.
                  </p>
                ) : null}
                {isBrowseCollapsed ? (
                  <p className="mt-1.5 text-xs font-medium text-[var(--color-text-soft)]">
                    {activeFilter === 'all' ? 'All cards' : activeFilter}
                    {' · '}
                    {activeCategory === 'all' ? 'All categories' : activeCategory}
                    {searchQuery.trim() ? ` · “${searchQuery.trim()}”` : ''}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => setIsBrowseCollapsed((currentValue) => !currentValue)}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-bg-soft)] text-[var(--color-text-soft)] transition duration-200 hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface-elevated)] hover:text-[var(--color-heading)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2"
                aria-expanded={!isBrowseCollapsed}
                aria-label={isBrowseCollapsed ? 'Expand board filters' : 'Collapse board filters'}
              >
                <ChevronDown
                  className={`h-4 w-4 transition duration-200 ${isBrowseCollapsed ? 'rotate-180' : ''}`}
                  strokeWidth={1.9}
                />
              </button>
            </div>

            {!isBrowseCollapsed ? (
              <>
                <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
                  <label className="relative block">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-soft)]" strokeWidth={1.9} />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      placeholder="Search dreams, notes, or categories"
                      className="w-full rounded-[1.35rem] border border-[var(--color-border)] bg-[var(--color-bg-soft)] py-3 pl-11 pr-11 text-sm text-[var(--color-heading)] outline-none transition duration-200 placeholder:text-[var(--color-text-soft)] focus:border-[var(--color-primary)] focus:bg-[var(--color-surface-elevated)] focus:ring-4 focus:ring-[var(--color-accent-soft)]"
                    />
                    {searchQuery ? (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-[var(--color-text-soft)] transition hover:bg-[var(--color-surface-elevated)] hover:text-[var(--color-heading)]"
                        aria-label="Clear search"
                      >
                        <X className="h-4 w-4" strokeWidth={1.9} />
                      </button>
                    ) : null}
                  </label>

                  <div className="relative -mx-1 flex gap-2 overflow-x-auto px-1 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
                    {FILTER_OPTIONS.map((filter) => {
                      const isActive = activeFilter === filter

                      return (
                        <button
                          key={filter}
                          type="button"
                          onClick={() => setActiveFilter(filter)}
                          className={[
                            ui.chip,
                            isActive
                              ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-primary-contrast)] shadow-paper'
                              : 'border-[var(--color-border)] bg-[var(--color-bg-soft)] text-[var(--color-text)] hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface-elevated)] hover:text-[var(--color-heading)]',
                          ].join(' ')}
                        >
                          {filter === 'all' ? 'All cards' : filter}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="relative -mx-1 flex gap-2 overflow-x-auto px-1 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
                  {categoryOptions.map((category) => {
                    const isActive = activeCategory === category

                    return (
                      <button
                        key={category}
                        type="button"
                        onClick={() => setActiveCategory(category)}
                        className={[
                          ui.chip,
                          isActive
                            ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)] text-[var(--color-heading)] shadow-sm'
                            : 'border-[var(--color-border)] bg-[var(--color-surface-elevated)] text-[var(--color-text-soft)] hover:border-[var(--color-border-strong)] hover:text-[var(--color-heading)]',
                        ].join(' ')}
                      >
                        {category === 'all' ? 'All categories' : category}
                      </button>
                    )
                  })}
                </div>
              </>
            ) : null}
          </div>
        </section>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="aspect-[0.82] animate-pulse rounded-[1.75rem] bg-[var(--color-card-strong)] shadow-card"
              />
            ))}
          </div>
        ) : null}

        {!isLoading && manifests.length === 0 ? (
          <EmptyState
            title="Start your board with your first dream."
            description="Add one image card with a title, a few notes, and the feeling you want to keep in view."
            action={
              <Link to="/manifests/new" className={ui.buttonPrimary}>
                Add your first manifest
              </Link>
            }
          />
        ) : null}

        {!isLoading && manifests.length > 0 && filteredManifests.length === 0 ? (
          <EmptyState
            title="No cards match these filters yet"
            description="Try clearing the search, switching category or status filters, or add a new card that fits this board."
            action={
              <button
                type="button"
                onClick={() => {
                  setActiveFilter('all')
                  setActiveCategory('all')
                  setSearchQuery('')
                }}
                className={ui.buttonSecondary}
              >
                Reset filters
              </button>
            }
          />
        ) : null}

        {!isLoading && filteredManifests.length > 0 ? (
          <section className={`${ui.sectionBoard} grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5`}>
            {filteredManifests.map((manifest) => (
              <ManifestCard
                key={manifest.id}
                manifest={manifest}
                isNewlyAdded={newlyAddedManifestId === manifest.id}
                draggable
                isDragging={draggedManifestId === manifest.id}
                onDragStart={() => handleDragStart(manifest.id)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => handleDrop(manifest.id)}
                onDragEnd={handleDragEnd}
              />
            ))}
          </section>
        ) : null}
      </div>
    </AppShell>
  )
}
