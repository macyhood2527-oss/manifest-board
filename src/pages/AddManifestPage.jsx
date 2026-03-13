import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBoards } from '../boards/useBoards'
import { AppShell } from '../components/AppShell'
import { ManifestForm } from '../components/ManifestForm'
import { PageHeader } from '../components/PageHeader'
import { createManifest } from '../lib/manifests'
import { ui } from '../lib/ui'
import { useToast } from '../toast/useToast'

export function AddManifestPage() {
  const navigate = useNavigate()
  const { selectedBoard } = useBoards()
  const toast = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

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

        <ManifestForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      </div>
    </AppShell>
  )
}
