import { useEffect, useRef, useState } from 'react'
import { useBoards } from '../boards/useBoards'
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
  const { boards, selectedBoardId } = useBoards()
  const [formValues, setFormValues] = useState(() => getInitialFormValues(initialValues))
  const [previewUrl, setPreviewUrl] = useState(initialValues?.imageUrl ?? '')
  const [cropDraft, setCropDraft] = useState(null)
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
      className={`${ui.panelStrong} relative space-y-6 overflow-hidden px-5 py-6 sm:px-7`}
    >
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
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-[var(--color-text)]">Upload cover image</p>
                <p className="text-xs text-[var(--color-text-soft)]">PNG, JPG, or WEBP work nicely here.</p>
              </div>
              <label className={`${ui.buttonSecondary} cursor-pointer px-4 py-2.5 text-[13px]`}>
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
          rows="5"
          value={formValues.notes}
          onChange={handleChange}
          placeholder="Why does this matter to me? What feeling or future moment am I manifesting?"
          className={ui.fieldTextarea}
        />
      </label>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--color-border)] pt-4">
        <p className="max-w-md text-sm leading-6 text-[var(--color-text-soft)]">
          Keep it simple: a title, one image, and a few warm notes are enough to make the card feel alive. You can also drag cards around on the board to shape the story visually.
        </p>
        <button
          type="submit"
          disabled={isSubmitting}
          className={ui.buttonPrimary}
        >
          {isSubmitting ? 'Saving...' : submitLabel}
        </button>
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
