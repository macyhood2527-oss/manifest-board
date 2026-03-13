import { useEffect, useRef, useState } from 'react'
import { Crop, X } from 'lucide-react'
import { ui } from '../lib/ui'

const PREVIEW_SIZE = 280
const OUTPUT_SIZE = 1200

function loadImage(sourceUrl) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = reject
    image.src = sourceUrl
  })
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function getPointerPosition(event) {
  return {
    x: event.clientX,
    y: event.clientY,
  }
}

function getCropMetrics(image, zoom) {
  const baseScale = Math.max(PREVIEW_SIZE / image.naturalWidth, PREVIEW_SIZE / image.naturalHeight)
  const effectiveScale = baseScale * zoom
  const cropWidth = OUTPUT_SIZE / effectiveScale
  const cropHeight = OUTPUT_SIZE / effectiveScale

  return {
    baseScale,
    effectiveScale,
    cropWidth,
    cropHeight,
    previewWidth: image.naturalWidth * effectiveScale,
    previewHeight: image.naturalHeight * effectiveScale,
  }
}

async function createCroppedFile(file, image, crop) {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')

  if (!context) {
    throw new Error('Unable to prepare the crop right now.')
  }

  canvas.width = OUTPUT_SIZE
  canvas.height = OUTPUT_SIZE

  const { previewWidth, previewHeight } = getCropMetrics(image, crop.zoom)
  const exportScale = OUTPUT_SIZE / PREVIEW_SIZE
  const drawWidth = previewWidth * exportScale
  const drawHeight = previewHeight * exportScale
  const drawX = ((OUTPUT_SIZE - drawWidth) / 2) + (crop.offsetX * exportScale)
  const drawY = ((OUTPUT_SIZE - drawHeight) / 2) + (crop.offsetY * exportScale)

  context.drawImage(image, drawX, drawY, drawWidth, drawHeight)

  const blob = await new Promise((resolve) => {
    canvas.toBlob(resolve, file.type || 'image/jpeg', 0.92)
  })

  if (!blob) {
    throw new Error('Unable to export the cropped image.')
  }

  return new File([blob], file.name, {
    type: blob.type || file.type || 'image/jpeg',
    lastModified: Date.now(),
  })
}

export function ImageCropModal({
  file,
  sourceUrl,
  onCancel,
  onComplete,
}) {
  const [zoom, setZoom] = useState(1)
  const [offsetX, setOffsetX] = useState(0)
  const [offsetY, setOffsetY] = useState(0)
  const [imageMeta, setImageMeta] = useState(null)
  const [isCropping, setIsCropping] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const dragStateRef = useRef(null)

  useEffect(() => {
    let isMounted = true

    async function prepareImage() {
      try {
        const image = await loadImage(sourceUrl)
        if (isMounted) {
          setImageMeta(image)
          setZoom(1)
          setOffsetX(0)
          setOffsetY(0)
        }
      } catch {
        if (isMounted) {
          setErrorMessage('Unable to load this image for cropping.')
        }
      }
    }

    prepareImage()

    return () => {
      isMounted = false
    }
  }, [sourceUrl])

  useEffect(() => {
    function handleEscape(event) {
      if (event.key === 'Escape') {
        onCancel()
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [onCancel])

  async function handleCrop() {
    setIsCropping(true)
    setErrorMessage('')

    try {
      if (!imageMeta) {
        throw new Error('Image is still loading for crop.')
      }

      const croppedFile = await createCroppedFile(file, imageMeta, {
        zoom,
        offsetX,
        offsetY,
      })

      onComplete(croppedFile)
    } catch (error) {
      setErrorMessage(error.message || 'Unable to crop this image right now.')
    } finally {
      setIsCropping(false)
    }
  }

  const metrics = imageMeta ? getCropMetrics(imageMeta, zoom) : null
  const maxOffsetX = metrics ? Math.max(0, (metrics.previewWidth - PREVIEW_SIZE) / 2) : 0
  const maxOffsetY = metrics ? Math.max(0, (metrics.previewHeight - PREVIEW_SIZE) / 2) : 0

  useEffect(() => {
    setOffsetX((currentValue) => clamp(currentValue, -maxOffsetX, maxOffsetX))
    setOffsetY((currentValue) => clamp(currentValue, -maxOffsetY, maxOffsetY))
  }, [maxOffsetX, maxOffsetY])

  function handlePointerDown(event) {
    if (!metrics) {
      return
    }

    const pointer = getPointerPosition(event)
    dragStateRef.current = {
      startX: pointer.x,
      startY: pointer.y,
      originX: offsetX,
      originY: offsetY,
    }
    setIsDragging(true)
    event.currentTarget.setPointerCapture?.(event.pointerId)
  }

  function handlePointerMove(event) {
    if (!dragStateRef.current) {
      return
    }

    const pointer = getPointerPosition(event)
    const deltaX = pointer.x - dragStateRef.current.startX
    const deltaY = pointer.y - dragStateRef.current.startY

    setOffsetX(clamp(dragStateRef.current.originX + deltaX, -maxOffsetX, maxOffsetX))
    setOffsetY(clamp(dragStateRef.current.originY + deltaY, -maxOffsetY, maxOffsetY))
  }

  function handlePointerUp(event) {
    dragStateRef.current = null
    setIsDragging(false)
    event.currentTarget.releasePointerCapture?.(event.pointerId)
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-3 sm:p-5">
      <button
        type="button"
        className="absolute inset-0 bg-stone-950/30 backdrop-blur-[2px]"
        onClick={onCancel}
        aria-label="Close crop image dialog"
      />

      <div className={`${ui.panelStrong} relative z-10 w-full max-w-3xl overflow-hidden px-5 py-5 sm:px-6`}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--color-text-soft)]">
              Image crop
            </p>
            <h3 className="mt-1 font-serif text-3xl text-[var(--color-heading)]">
              Frame your dream image
            </h3>
            <p className="mt-2 text-sm leading-6 text-[var(--color-text-soft)]">
              Adjust the crop so your card preview feels just right before saving it.
            </p>
          </div>

          <button
            type="button"
            onClick={onCancel}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-soft)] text-[var(--color-text-soft)] transition hover:bg-[var(--color-surface-elevated)] hover:text-[var(--color-heading)]"
            aria-label="Close crop modal"
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <div className="flex items-center justify-center rounded-[1.75rem] border border-[var(--color-border)] bg-[var(--color-bg-soft)] p-4">
            <div
              className={`relative overflow-hidden rounded-[1.35rem] border border-[var(--color-surface-elevated)] bg-[var(--color-surface-elevated)] shadow-paper touch-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
              style={{ width: PREVIEW_SIZE, height: PREVIEW_SIZE }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
            >
              {metrics ? (
                <img
                  src={sourceUrl}
                  alt="Crop preview"
                  className="pointer-events-none absolute left-1/2 top-1/2 max-w-none select-none"
                  style={{
                    width: metrics.previewWidth,
                    height: metrics.previewHeight,
                    transform: `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px))`,
                  }}
                />
              ) : null}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-bg-soft)] p-4">
              <div className="space-y-4">
                <label className="block space-y-2">
                  <span className={ui.fieldLabel}>Zoom</span>
                  <input
                    type="range"
                    min="1"
                    max="2.4"
                    step="0.01"
                    value={zoom}
                    onChange={(event) => setZoom(Number(event.target.value))}
                    className="w-full accent-[var(--color-primary)]"
                  />
                </label>

                <label className="block space-y-2">
                  <span className={ui.fieldLabel}>Move left / right</span>
                  <input
                    type="range"
                    min={-maxOffsetX}
                    max={maxOffsetX}
                    step="1"
                    value={offsetX}
                    onChange={(event) => setOffsetX(Number(event.target.value))}
                    className="w-full accent-[var(--color-primary)]"
                    disabled={!metrics}
                  />
                </label>

                <label className="block space-y-2">
                  <span className={ui.fieldLabel}>Move up / down</span>
                  <input
                    type="range"
                    min={-maxOffsetY}
                    max={maxOffsetY}
                    step="1"
                    value={offsetY}
                    onChange={(event) => setOffsetY(Number(event.target.value))}
                    className="w-full accent-[var(--color-primary)]"
                    disabled={!metrics}
                  />
                </label>
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-4 text-sm leading-6 text-[var(--color-text-soft)]">
              The cropped image will become your manifest cover. This keeps the board looking polished and consistent.
            </div>

            {errorMessage ? (
              <div className={ui.errorPanel}>
                {errorMessage}
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--color-border)] pt-4">
          <div className="inline-flex items-center gap-2 text-sm text-[var(--color-text-soft)]">
            <Crop className="h-4 w-4 text-[var(--color-primary)]" strokeWidth={1.9} />
            Square crop works best with the polaroid card layout.
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button type="button" onClick={onCancel} className={ui.buttonSecondary}>
              Cancel
            </button>
            <button type="button" onClick={handleCrop} disabled={isCropping || !imageMeta} className={ui.buttonPrimary}>
              {isCropping ? 'Cropping...' : !imageMeta ? 'Loading image...' : 'Use this crop'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
