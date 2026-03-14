import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useBoards } from '../boards/useBoards'
import { AppShell } from '../components/AppShell'
import { CelebrationMoment } from '../components/CelebrationMoment'
import { EmptyState } from '../components/EmptyState'
import { ManifestCard } from '../components/ManifestCard'
import { PageHeader } from '../components/PageHeader'
import { getAchievedManifests } from '../lib/manifests'
import { ui } from '../lib/ui'

export function AchievedPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { selectedBoard } = useBoards()
  const [manifests, setManifests] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [celebration, setCelebration] = useState(() => location.state?.celebration || null)

  useEffect(() => {
    const nextCelebration = location.state?.celebration

    if (!nextCelebration) {
      return undefined
    }

    setCelebration(nextCelebration)

    const timeoutId = window.setTimeout(() => {
      setCelebration(null)
      navigate(location.pathname, { replace: true, state: {} })
    }, 2800)

    return () => window.clearTimeout(timeoutId)
  }, [location.pathname, location.state, navigate])

  useEffect(() => {
    let isMounted = true

    async function loadAchievedManifests() {
      setIsLoading(true)
      setErrorMessage('')

      try {
        const records = await getAchievedManifests(selectedBoard?.id === 'default-board' ? '' : selectedBoard?.id)

        if (isMounted) {
          setManifests(records)
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error.message || 'Unable to load achieved manifests.')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadAchievedManifests()

    return () => {
      isMounted = false
    }
  }, [selectedBoard?.id])

  return (
    <AppShell>
      <div className={ui.pageContainer}>
        <PageHeader
          eyebrow="Celebration wall"
          title={`${selectedBoard?.name || 'Your board'} wins`}
          description="A scrapbook-style wall for the visions, milestones, and little manifestations that are now part of your real life."
          action={
            <div className="rounded-[1.4rem] border border-[var(--color-accent)] bg-paper-sage px-4 py-3 text-sm text-[var(--color-success)] shadow-paper">
              {manifests.length} completed {manifests.length === 1 ? 'card' : 'cards'}
            </div>
          }
        />

        {errorMessage ? (
          <div className={`${ui.panelStrong} border-[var(--color-danger)] bg-paper-blush px-4 py-3 text-sm text-[var(--color-danger)]`}>
            {errorMessage}
          </div>
        ) : null}

        {celebration ? (
          <CelebrationMoment
            tone="achieved"
            eyebrow="A real-life win"
            title={celebration.title}
            description={celebration.description}
          />
        ) : null}

        {isLoading ? (
          <div className="grid grid-cols-1 gap-3.5 min-[420px]:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="aspect-[0.82] animate-pulse rounded-[1.75rem] bg-white/75 shadow-card"
              />
            ))}
          </div>
        ) : null}

        {!isLoading && manifests.length === 0 ? (
          <EmptyState
            tone="achieved"
            title="Your future wins will appear here."
            description="When you mark a manifest as achieved, it moves into this calm archive of progress and quiet celebration."
            action={
              <Link to="/" className={ui.buttonPrimary}>
                Return to board
              </Link>
            }
          />
        ) : null}

        {!isLoading && manifests.length > 0 ? (
          <section className={`${ui.sectionBoard} grid grid-cols-1 gap-3.5 min-[420px]:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4`}>
            {manifests.map((manifest) => (
              <ManifestCard key={manifest.id} manifest={manifest} />
            ))}
          </section>
        ) : null}
      </div>
    </AppShell>
  )
}
