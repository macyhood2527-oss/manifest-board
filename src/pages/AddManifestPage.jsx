import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useBoards } from '../boards/useBoards'
import { AppShell } from '../components/AppShell'
import { ManifestForm } from '../components/ManifestForm'
import { PageHeader } from '../components/PageHeader'
import { createManifest } from '../lib/manifests'
import { STARTER_MANIFESTS } from '../lib/onboarding'
import { ui } from '../lib/ui'
import { useToast } from '../toast/useToast'

export function AddManifestPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { selectedBoard } = useBoards()
  const toast = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const starterTitle = searchParams.get('title') || ''
  const starterCategory = searchParams.get('category') || ''
  const starterNotes = searchParams.get('notes') || ''
  const hasStarterValues = Boolean(starterTitle || starterCategory || starterNotes)

  async function handleSubmit(values) {
    setIsSubmitting(true)
    setErrorMessage('')

    try {
      const manifest = await createManifest(values)
      toast.success('Dream added to Manifest Board', `"${manifest.title}" is now part of your board.`)
      navigate('/', {
        replace: true,
        state: {
          newManifestId: manifest.id,
          celebration: {
            tone: 'dream',
            title: `"${manifest.title}" is on your board now.`,
            description: 'A small step still counts. Let this new card hold the feeling of what you are calling in.',
          },
        },
      })
    } catch (error) {
      setErrorMessage(error.message || 'Unable to create the manifest right now.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 sm:gap-8">
        <PageHeader
          eyebrow="Add manifest"
          title={`Add a new note to ${selectedBoard?.name || 'your board'}`}
          description="Create a fresh clipping for something you want to call in, explore, or move closer to. Keep it visual, warm, and simple."
        />

        {errorMessage ? (
          <div className={`${ui.panelStrong} border-[var(--color-danger)] bg-paper-blush px-4 py-3 text-sm text-[var(--color-danger)]`}>
            {errorMessage}
          </div>
        ) : null}

        {hasStarterValues ? (
          <section className={`${ui.panelStrong} bg-paper-note px-4 py-4 sm:px-5`}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--color-text-soft)]">
              Gentle starting point
            </p>
            <h2 className="mt-2 font-serif text-2xl text-[var(--color-heading)]">
              We filled in a first idea for you
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-text-soft)]">
              Treat this like a sketch, not a rule. Change the title, swap the category, or rewrite the notes until it feels like your own dream card.
            </p>
          </section>
        ) : null}

        {!hasStarterValues ? (
          <section className={`${ui.panelStrong} bg-paper-note px-4 py-4 sm:px-5`}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--color-text-soft)]">
              Need inspiration?
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {STARTER_MANIFESTS.map((starter) => (
                <button
                  key={starter.title}
                  type="button"
                  onClick={() => navigate(`/manifests/new?title=${encodeURIComponent(starter.title)}&category=${encodeURIComponent(starter.category)}&notes=${encodeURIComponent(starter.notes)}`, { replace: true })}
                  className={ui.buttonSecondary}
                >
                  {starter.title}
                </button>
              ))}
            </div>
          </section>
        ) : null}

        <ManifestForm
          initialValues={{
            title: starterTitle,
            category: starterCategory,
            notes: starterNotes,
          }}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </div>
    </AppShell>
  )
}
