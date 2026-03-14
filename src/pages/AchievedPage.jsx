import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useBoards } from '../boards/useBoards'
import { AchievedMemoryCard } from '../components/AchievedMemoryCard'
import { AppShell } from '../components/AppShell'
import { CelebrationMoment } from '../components/CelebrationMoment'
import { EmptyState } from '../components/EmptyState'
import { PageHeader } from '../components/PageHeader'
import { getAchievedManifests } from '../lib/manifests'
import { ui } from '../lib/ui'

function formatMonthGroup(value) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(value))
}

function formatLastAchieved(value) {
  if (!value) {
    return 'Your first finished dream will feel beautiful here.'
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}

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

  const latestAchievedAt = manifests[0]?.achievedAt ?? null
  const groupedManifests = manifests.reduce((groups, manifest) => {
    const groupKey = formatMonthGroup(manifest.achievedAt || manifest.updated || manifest.created)
    const existingGroup = groups.find((group) => group.key === groupKey)

    if (existingGroup) {
      existingGroup.manifests.push(manifest)
      return groups
    }

    groups.push({
      key: groupKey,
      manifests: [manifest],
    })

    return groups
  }, [])

  return (
    <AppShell>
      <div className={ui.pageContainer}>
        <PageHeader
          eyebrow="Celebration wall"
          title={`${selectedBoard?.name || 'Your board'} wins`}
          description="A scrapbook-style wall for the visions, milestones, and little manifestations that are now part of your real life."
          action={
            <div className="rounded-[1.55rem] border border-[color-mix(in_srgb,var(--color-accent)_20%,var(--color-border))] bg-paper-sage px-4 py-3 text-sm text-[var(--color-success)] shadow-paper">
              {manifests.length === 0
                ? 'Waiting for your first beautiful win'
                : `${manifests.length} achieved ${manifests.length === 1 ? 'moment' : 'moments'}`}
            </div>
          }
        />

        {!isLoading && manifests.length > 0 ? (
          <section className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-[1.7rem] border border-[color-mix(in_srgb,var(--color-accent)_16%,var(--color-border))] bg-paper-sage px-4 py-4 shadow-paper">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--color-text-soft)]">Keepsake wall</p>
              <p className="mt-2 font-serif text-3xl text-[var(--color-heading)]">
                {manifests.length}
              </p>
              <p className="mt-1 text-sm leading-6 text-[var(--color-text-soft)]">
                {manifests.length === 1 ? 'Dream already made real.' : 'Dreams already made real.'}
              </p>
            </div>

            <div className="rounded-[1.7rem] border border-[color-mix(in_srgb,var(--color-primary)_16%,var(--color-border))] bg-paper-blush px-4 py-4 shadow-paper">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--color-text-soft)]">Latest arrival</p>
              <p className="mt-2 font-serif text-[1.65rem] leading-none text-[var(--color-heading)]">
                {formatLastAchieved(latestAchievedAt)}
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--color-text-soft)]">
                The newest proof that your vision is moving in real life.
              </p>
            </div>

            <div className="rounded-[1.7rem] border border-[color-mix(in_srgb,var(--color-heading)_12%,var(--color-border))] bg-[color-mix(in_srgb,var(--color-paper)_88%,white)] px-4 py-4 shadow-paper">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--color-text-soft)]">A gentle reminder</p>
              <p className="mt-2 font-serif text-[1.45rem] leading-tight text-[var(--color-heading)]">
                Your future is already answering back.
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--color-text-soft)]">
                Each achieved card becomes a memory, not just a finished task.
              </p>
            </div>
          </section>
        ) : null}

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
          <div className="space-y-8">
            {groupedManifests.map((group) => (
              <section key={group.key} className={ui.sectionBoard}>
                <div className="relative overflow-hidden pb-4">
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[color-mix(in_srgb,var(--color-accent)_14%,white)] to-transparent" />
                  <div className="relative">
                    <h2
                      className="font-serif text-2xl"
                      style={{ color: 'color-mix(in srgb, var(--color-accent) 64%, var(--color-heading))' }}
                    >
                      {group.key}
                    </h2>
                    <p className="mt-1 max-w-2xl text-sm leading-6 text-[var(--color-text-soft)]">
                      A little chapter of real-life manifestations and meaningful moments.
                    </p>
                    <div
                      className="mt-4 h-px w-full"
                      aria-hidden="true"
                      style={{
                        background: 'linear-gradient(90deg, color-mix(in srgb, var(--color-accent) 30%, var(--color-border-strong)), color-mix(in srgb, var(--color-accent) 10%, transparent) 68%, transparent)',
                      }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3.5 min-[420px]:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
                  {group.manifests.map((manifest) => (
                    <AchievedMemoryCard key={manifest.id} manifest={manifest} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : null}
      </div>
    </AppShell>
  )
}
