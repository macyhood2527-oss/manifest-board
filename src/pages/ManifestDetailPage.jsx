import { useEffect, useState } from 'react'
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
      navigate('/achieved')
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
              <img
                src={manifest.imageUrl || 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80'}
                alt={manifest.title}
                className="h-full max-h-[520px] w-full rounded-[1.5rem] object-cover"
              />
            </div>

            <div className="space-y-6">
              <ManifestForm
                key={`${manifest.id}-${manifest.updated ?? 'draft'}`}
                initialValues={manifest}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                submitLabel="Save changes"
              />

              <div className="flex flex-wrap items-center gap-3">
                <Link to="/" className={ui.buttonSecondary}>
                  Back to {selectedBoard?.name || 'board'}
                </Link>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="inline-flex items-center rounded-full border border-[var(--color-danger)] bg-[var(--color-bg-soft)] px-5 py-3 text-sm font-semibold text-[var(--color-danger)]"
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
