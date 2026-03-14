import { useEffect, useState } from 'react'
import { ImageOff } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useBoards } from '../boards/useBoards'
import { AppShell } from '../components/AppShell'
import { ManifestForm } from '../components/ManifestForm'
import { PageHeader } from '../components/PageHeader'
import { StatusBadge } from '../components/StatusBadge'
import {
  deleteManifest,
  getManifestById,
  markManifestAchieved,
  updateManifest,
} from '../lib/manifests'
import { ui } from '../lib/ui'
import { useToast } from '../toast/useToast'

export function ManifestDetailPage() {
  const { manifestId } = useParams()
  const navigate = useNavigate()
  const { selectedBoard } = useBoards()
  const toast = useToast()
  const [manifest, setManifest] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isMarkingAchieved, setIsMarkingAchieved] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadManifest() {
      setIsLoading(true)
      setErrorMessage('')

      try {
        const record = await getManifestById(manifestId)

        if (isMounted) {
          setManifest(record)
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error.message || 'Unable to load this manifest.')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadManifest()

    return () => {
      isMounted = false
    }
  }, [manifestId])

  async function handleSubmit(values) {
    setIsSubmitting(true)
    setErrorMessage('')

    try {
      const updatedManifest = await updateManifest(manifestId, values)
      setManifest(updatedManifest)
      toast.success('Changes saved in Manifest Board', `"${updatedManifest.title}" has been updated.`)
    } catch (error) {
      setErrorMessage(error.message || 'Unable to save your changes.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleMarkAchieved() {
    setIsMarkingAchieved(true)
    setErrorMessage('')

    try {
      const updatedManifest = await markManifestAchieved(manifestId)
      setManifest(updatedManifest)
      toast.success('Dream achieved', `"${updatedManifest.title}" moved to your Achieved page.`)
      navigate('/achieved', {
        state: {
          celebration: {
            tone: 'achieved',
            title: `"${updatedManifest.title}" became real.`,
            description: 'This one belongs on your celebration wall now. Let yourself notice the progress you made.',
          },
        },
      })
    } catch (error) {
      setErrorMessage(error.message || 'Unable to mark this manifest as achieved.')
    } finally {
      setIsMarkingAchieved(false)
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm('Delete this manifest card? This cannot be undone.')

    if (!confirmed) {
      return
    }

    try {
      const title = manifest?.title || 'This manifest'
      await deleteManifest(manifestId)
      toast.info('Dream removed from Manifest Board', `${title} was removed from your board.`)
      navigate('/')
    } catch (error) {
      setErrorMessage(error.message || 'Unable to delete this manifest.')
    }
  }

  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 sm:gap-8">
        <PageHeader
          eyebrow="Manifest detail"
          title={manifest?.title || 'Manifest details'}
          description="Edit the story behind this card, replace the image, or move it into your achieved collection when the moment becomes real."
          action={
            manifest ? (
              <div className="flex flex-wrap items-center gap-3">
                <StatusBadge status={manifest.status} />
                {manifest.status !== 'achieved' ? (
                  <button
                    type="button"
                    onClick={handleMarkAchieved}
                    disabled={isMarkingAchieved}
                    className={ui.buttonTint}
                  >
                    {isMarkingAchieved ? 'Updating...' : 'Mark achieved'}
                  </button>
                ) : null}
              </div>
            ) : null
          }
        />

        {errorMessage ? (
          <div className={ui.errorPanel}>
            {errorMessage}
          </div>
        ) : null}

        {isLoading ? (
          <div className="h-96 animate-pulse rounded-[2rem] bg-[var(--color-card-strong)] shadow-soft" />
        ) : null}

        {!isLoading && manifest ? (
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div className={`${ui.panelStrong} overflow-hidden p-4`}>
              {manifest.imageUrl ? (
                <img
                  src={manifest.imageUrl}
                  alt={manifest.title}
                  className="h-full max-h-[520px] w-full rounded-[1.5rem] object-cover"
                />
              ) : (
                <div className="flex min-h-[24rem] w-full flex-col items-center justify-center rounded-[1.5rem] bg-[color-mix(in_srgb,var(--color-paper)_92%,white)] px-6 text-center">
                  <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--color-primary)_12%,white)] text-[var(--color-primary)]">
                    <ImageOff className="h-6 w-6" strokeWidth={1.9} />
                  </span>
                  <h3 className="mt-4 font-serif text-2xl text-[var(--color-heading)]">
                    No image added yet
                  </h3>
                  <p className="mt-2 max-w-sm text-sm leading-6 text-[var(--color-text-soft)]">
                    You can keep this dream card simple for now, or upload an image later when the right inspiration comes to you.
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <ManifestForm
                key={`${manifest.id}-${manifest.updated ?? 'draft'}`}
                initialValues={manifest}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                submitLabel="Save changes"
              />

              <div className="sticky bottom-0 -mx-1 flex flex-col gap-3 border-t border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-surface-soft)_92%,white)] px-1 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-4 backdrop-blur-sm sm:static sm:mx-0 sm:flex-row sm:flex-wrap sm:border-t-0 sm:bg-transparent sm:px-0 sm:pb-0 sm:pt-0">
                <Link to="/" className={`${ui.buttonSecondary} w-full sm:w-auto`}>
                  Back to {selectedBoard?.name || 'board'}
                </Link>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="inline-flex w-full items-center justify-center rounded-full border border-[var(--color-danger)] bg-[var(--color-bg-soft)] px-5 py-3 text-sm font-semibold text-[var(--color-danger)] sm:w-auto"
                >
                  Delete manifest
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </AppShell>
  )
}
