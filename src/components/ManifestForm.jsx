import { Sparkles } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useBoards } from '../boards/useBoards'
import { supabase } from '../lib/supabase'
import { ImageCropModal } from './ImageCropModal'
import { ui } from '../lib/ui'

const STATUS_OPTIONS = ['dreaming', 'planning', 'inspiration', 'achieved']

const CATEGORY_OPTIONS = [
  'Travel',
  'Home',
  'Career',
  'Wellness',
  'Relationships',
  'Lifestyle',
]

function getInitialFormValues(initialValues) {
  return {
    title: initialValues?.title ?? '',
    image: null,
    imageUrl: initialValues?.imageUrl ?? '',
    notes: initialValues?.notes ?? '',
    achievedReflection: initialValues?.achievedReflection ?? '',
    category: initialValues?.category ?? '',
    status: initialValues?.status ?? 'dreaming',
    board: initialValues?.board ?? '',
  }
}

export function ManifestForm({
  initialValues,
  onSubmit,
  isSubmitting,
  submitLabel = 'Save Manifest',
}) {
  const isDev = import.meta.env.DEV
  const isAiHelperEnabled = import.meta.env.VITE_ENABLE_AI_HELPER === 'true'
  const { boards, selectedBoardId } = useBoards()
  const [formValues, setFormValues] = useState(() => getInitialFormValues(initialValues))
  const [previewUrl, setPreviewUrl] = useState(initialValues?.imageUrl ?? '')
  const [cropDraft, setCropDraft] = useState(null)
  const [assistantPrompt, setAssistantPrompt] = useState('')
  const [assistantTone, setAssistantTone] = useState('dreamy')
  const [assistantError, setAssistantError] = useState('')
  const [isGeneratingDraft, setIsGeneratingDraft] = useState(false)
  const previewObjectUrlRef = useRef('')
  const cropObjectUrlRef = useRef('')

  useEffect(() => () => {
    if (previewObjectUrlRef.current) {
      URL.revokeObjectURL(previewObjectUrlRef.current)
    }

    if (cropObjectUrlRef.current) {
      URL.revokeObjectURL(cropObjectUrlRef.current)
    }
  }, [])

  useEffect(() => {
    setFormValues(getInitialFormValues(initialValues))
    setPreviewUrl(initialValues?.imageUrl ?? '')
  }, [initialValues])

  async function requestAssistantDraft(mode = 'generate') {
    setAssistantError('')
    setIsGeneratingDraft(true)

    try {
      const sessionData = await supabase?.auth.getSession()
      const accessToken = sessionData?.data?.session?.access_token || ''
      const response = await fetch('/api/manifest-assist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          prompt: assistantPrompt,
          tone: assistantTone,
          mode,
          currentValues: formValues,
        }),
      })

      const rawText = await response.text()
      let payload = null

      try {
        payload = rawText ? JSON.parse(rawText) : null
      } catch {
        payload = null
      }

      if (!response.ok) {
        throw new Error(payload?.error || 'Unable to generate a manifest draft right now.')
      }

      if (!payload?.draft) {
        throw new Error(
          isDev
            ? 'The AI helper did not return usable JSON. Double-check that `OPENAI_API_KEY` is set and restart your local dev server.'
            : 'The AI helper returned an unexpected response. Please try again.',
        )
      }

      setFormValues((currentValues) => ({
        ...currentValues,
        title: payload.draft?.title || currentValues.title,
        category: payload.draft?.category || currentValues.category,
        notes: payload.draft?.notes || currentValues.notes,
      }))
    } catch (error) {
      if (String(error.message || '').includes('Unexpected end of JSON input')) {
        setAssistantError(
          isDev
            ? 'The AI route is likely not running cleanly yet. Restart `npm run dev` after adding `OPENAI_API_KEY` to your local env.'
            : 'The AI draft came back in an unexpected format. Please try again.',
        )
      } else {
        setAssistantError(error.message || 'Unable to generate a manifest draft right now.')
      }
    } finally {
      setIsGeneratingDraft(false)
    }
  }

  function handleChange(event) {
    const { name, value, files } = event.target
    const nextValue = files ? files[0] : value

    if (name === 'image' && files?.[0]) {
      if (cropObjectUrlRef.current) {
        URL.revokeObjectURL(cropObjectUrlRef.current)
      }

      const objectUrl = URL.createObjectURL(files[0])
      cropObjectUrlRef.current = objectUrl
      setCropDraft({
        file: files[0],
        sourceUrl: objectUrl,
      })

      return
    }

    setFormValues((currentValues) => ({
      ...currentValues,
      [name]: nextValue,
    }))
  }

  function handleCropCancel() {
    if (cropObjectUrlRef.current) {
      URL.revokeObjectURL(cropObjectUrlRef.current)
      cropObjectUrlRef.current = ''
    }

    setCropDraft(null)
  }

  function handleCropComplete(croppedFile) {
    if (previewObjectUrlRef.current) {
      URL.revokeObjectURL(previewObjectUrlRef.current)
    }

    const objectUrl = URL.createObjectURL(croppedFile)
    previewObjectUrlRef.current = objectUrl
    setPreviewUrl(objectUrl)
    setFormValues((currentValues) => ({
      ...currentValues,
      image: croppedFile,
    }))

    if (cropObjectUrlRef.current) {
      URL.revokeObjectURL(cropObjectUrlRef.current)
      cropObjectUrlRef.current = ''
    }

    setCropDraft(null)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    await onSubmit({
      ...formValues,
      board: formValues.board || selectedBoardId,
    })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`${ui.panelStrong} relative space-y-6 overflow-hidden px-4 py-5 sm:px-7 sm:py-6`}
    >
      {isAiHelperEnabled ? (
        <section className="space-y-3 rounded-[1.5rem] border border-[var(--color-border)] bg-paper-note px-4 py-4 shadow-sm">
          <div className="flex items-start gap-3">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--color-primary)_14%,white)] text-[var(--color-primary)] shadow-sm">
              <Sparkles className="h-4 w-4" strokeWidth={1.9} />
            </span>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--color-text-soft)]">
                AI manifest helper
              </p>
              <h2 className="mt-1 font-serif text-2xl text-[var(--color-heading)]">Turn a rough idea into a draft</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--color-text-soft)]">
                Describe the feeling, future scene, or goal you want to capture. We will draft a title, category, and a warmer notes section for you.
              </p>
              {isDev ? (
                <p className="mt-2 text-xs leading-5 text-[var(--color-text-soft)]">
                  Local note: this helper works in `npm run dev` too, as long as `OPENAI_API_KEY` is present in your local env before the dev server starts.
                </p>
              ) : null}
            </div>
          </div>

          <label className={`block space-y-2 ${ui.fieldLabel}`}>
            <span>What do you want help writing?</span>
            <textarea
              rows="3"
              value={assistantPrompt}
              onChange={(event) => setAssistantPrompt(event.target.value)}
              placeholder="Example: I want a manifest about living near the beach, working less frantically, and having slower mornings."
              className={ui.fieldTextarea}
            />
          </label>

          <label className={`block space-y-2 ${ui.fieldLabel}`}>
            <span>Tone</span>
            <select
              value={assistantTone}
              onChange={(event) => setAssistantTone(event.target.value)}
              className={ui.fieldInput}
            >
              <option value="dreamy">Dreamy</option>
              <option value="grounded">Grounded</option>
              <option value="luxurious">Luxurious</option>
            </select>
          </label>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              {[
                'A calmer lifestyle',
                'My dream home',
                'A healthier version of me',
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => setAssistantPrompt(suggestion)}
                  className={ui.buttonSecondary}
                >
                  {suggestion}
                </button>
              ))}
            </div>

            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap">
              <button
                type="button"
                onClick={() => requestAssistantDraft('generate')}
                disabled={isGeneratingDraft || !assistantPrompt.trim()}
                className={`${ui.buttonPrimary} w-full sm:w-auto`}
              >
                {isGeneratingDraft ? 'Writing draft...' : 'Generate with AI'}
              </button>
              <button
                type="button"
                onClick={() => requestAssistantDraft('rewrite')}
                disabled={isGeneratingDraft || (!formValues.title.trim() && !formValues.notes.trim())}
                className={`${ui.buttonSecondary} w-full sm:w-auto`}
              >
                Rewrite what I wrote
              </button>
            </div>
          </div>

          {assistantError ? (
            <div className={ui.errorPanel}>
              {assistantError}
            </div>
          ) : null}
        </section>
      ) : null}

      <div className="space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--color-text-soft)]">
          Gentle details
        </p>
        <h2 className="font-serif text-3xl text-[var(--color-heading)]">Shape this dream card</h2>
      </div>

      <div className="grid gap-4 sm:gap-5 md:grid-cols-2">
        <label className={`space-y-2 ${ui.fieldLabel}`}>
          <span>Title</span>
          <input
            required
            type="text"
            name="title"
            value={formValues.title}
            onChange={handleChange}
            placeholder="My dream beach house"
            className={ui.fieldInput}
          />
        </label>

        <label className={`space-y-2 ${ui.fieldLabel}`}>
          <span>Category</span>
          <input
            list="manifest-categories"
            type="text"
            name="category"
            value={formValues.category}
            onChange={handleChange}
            placeholder="Travel"
            className={ui.fieldInput}
          />
          <datalist id="manifest-categories">
            {CATEGORY_OPTIONS.map((option) => (
              <option key={option} value={option} />
            ))}
          </datalist>
        </label>

        <label className={`space-y-2 ${ui.fieldLabel}`}>
          <span>Board</span>
          <select
            required
            name="board"
            value={formValues.board || selectedBoardId}
            onChange={handleChange}
            className={ui.fieldInput}
          >
            {boards.map((board) => (
              <option key={board.id} value={board.id}>
                {board.name}
              </option>
            ))}
          </select>
        </label>

        <label className={`space-y-2 ${ui.fieldLabel}`}>
          <span>Status</span>
          <select
            required
            name="status"
            value={formValues.status}
            onChange={handleChange}
            className={ui.fieldInput}
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className={`space-y-2 md:col-span-2 ${ui.fieldLabel}`}>
          <span>Image</span>
          <div className="overflow-hidden rounded-[1.5rem] border border-dashed border-[var(--color-border-strong)] bg-[var(--color-bg-soft)] shadow-sm">
            <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--color-text)]">Upload cover image</p>
                <p className="text-xs text-[var(--color-text-soft)]">PNG, JPG, or WEBP work nicely here.</p>
              </div>
              <label className={`${ui.buttonSecondary} w-full cursor-pointer px-4 py-2.5 text-[13px] sm:w-auto`}>
                Choose file
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleChange}
                  className="sr-only"
                />
              </label>
            </div>
            {previewUrl ? (
              <div className="p-3 pt-0">
                <img
                  src={previewUrl}
                  alt="Manifest preview"
                  className="h-44 w-full rounded-[1.25rem] object-cover sm:h-48"
                />
              </div>
            ) : (
              <div className="px-4 pb-4 text-xs text-[var(--color-text-soft)]">
                No image selected yet. Your card can still be saved without one, but uploaded images now open in a quick crop step first.
              </div>
            )}
          </div>
          {formValues.imageUrl ? (
            <p className="text-xs text-[var(--color-text-soft)]">
              Current image is already saved. Upload a new file only if you want to replace it.
            </p>
          ) : null}
        </label>
      </div>

      <label className={`block space-y-2 ${ui.fieldLabel}`}>
        <span>Notes</span>
        <textarea
          name="notes"
          rows="6"
          value={formValues.notes}
          onChange={handleChange}
          placeholder="Why does this matter to me? What feeling or future moment am I manifesting?"
          className={ui.fieldTextarea}
        />
      </label>

      {formValues.status === 'achieved' ? (
        <label className={`block space-y-2 ${ui.fieldLabel}`}>
          <span>Reflection</span>
          <textarea
            name="achievedReflection"
            rows="4"
            value={formValues.achievedReflection}
            onChange={handleChange}
            placeholder="What changed, how did it happen, or what did this moment teach you?"
            className={ui.fieldTextarea}
          />
          <p className="text-xs leading-5 text-[var(--color-text-soft)]">
            Optional, but lovely for the keepsake wall later.
          </p>
        </label>
      ) : null}

      <div className="-mx-4 sticky bottom-0 border-t border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-surface-soft)_92%,white)] px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4 backdrop-blur-sm sm:static sm:mx-0 sm:bg-transparent sm:px-0 sm:pb-0">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <p className="max-w-md text-sm leading-6 text-[var(--color-text-soft)]">
            Keep it simple: a title, one image, and a few warm notes are enough to make the card feel alive. You can also drag cards around on the board to shape the story visually.
          </p>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`${ui.buttonPrimary} w-full sm:w-auto`}
          >
            {isSubmitting ? 'Saving...' : submitLabel}
          </button>
        </div>
      </div>

      {cropDraft ? (
        <ImageCropModal
          file={cropDraft.file}
          sourceUrl={cropDraft.sourceUrl}
          onCancel={handleCropCancel}
          onComplete={handleCropComplete}
        />
      ) : null}
    </form>
  )
}
