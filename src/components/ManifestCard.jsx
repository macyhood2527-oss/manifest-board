import { Link } from 'react-router-dom'
import { StatusBadge } from './StatusBadge'

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80'

function getDecorationVariant(manifest) {
  const seedSource = `${manifest.id}-${manifest.status}-${manifest.title}`
  const seed = seedSource.split('').reduce((total, character) => total + character.charCodeAt(0), 0)

  const variants = ['tape-center', 'tape-tilt', 'pin-center', 'pin-left']

  return variants[seed % variants.length]
}

function getPinColor(manifest) {
  const seedSource = `${manifest.title}-${manifest.category || 'general'}-${manifest.status}`
  const seed = seedSource.split('').reduce((total, character) => total + character.charCodeAt(0), 0)

  const pinColors = [
    'var(--color-pin)',
    'color-mix(in srgb, var(--color-primary) 72%, white)',
    'color-mix(in srgb, var(--color-accent) 78%, white)',
    'color-mix(in srgb, var(--color-heading) 50%, white)',
  ]

  return pinColors[seed % pinColors.length]
}

function getRotation(manifest) {
  const seedSource = `${manifest.id}-${manifest.category || 'general'}-${manifest.title}`
  const seed = seedSource.split('').reduce((total, character) => total + character.charCodeAt(0), 0)
  const rotations = [0, 0, 0, -1.1, -0.55, 0.45, 0.95]

  return rotations[seed % rotations.length]
}

export function ManifestCard({
  manifest,
  isNewlyAdded = false,
  draggable = false,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  isDragging = false,
}) {
  const decorationVariant = getDecorationVariant(manifest)
  const pinColor = getPinColor(manifest)
  const rotation = getRotation(manifest)

  return (
    <article
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      className={[
        'group relative overflow-visible px-1 pb-1 pt-5 transition duration-300 hover:-translate-y-1',
        draggable ? 'cursor-grab active:cursor-grabbing' : '',
        isDragging ? 'scale-[0.985] opacity-60' : '',
        isNewlyAdded ? 'manifest-card-enter' : '',
      ].join(' ')}
    >
      <Link
        to={`/manifests/${manifest.id}`}
        className="relative block pt-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2"
      >
        {decorationVariant === 'tape-center' ? (
          <div
            className={`absolute left-1/2 top-0 z-20 h-5 w-16 -translate-x-1/2 rounded-[0.2rem] border shadow-sm ${isNewlyAdded ? 'manifest-card-enter-tape' : ''}`}
            aria-hidden="true"
            style={{
              backgroundColor: 'var(--color-tape)',
              borderColor: 'color-mix(in srgb, var(--color-paper-border) 52%, transparent)',
              transform: 'translateX(-50%) rotate(-1.8deg)',
            }}
          />
        ) : null}

        {decorationVariant === 'tape-tilt' ? (
          <div
            className={`absolute left-1/2 top-0 z-20 h-5 w-[4.5rem] -translate-x-1/2 rounded-[0.2rem] border shadow-sm ${isNewlyAdded ? 'manifest-card-enter-tape' : ''}`}
            aria-hidden="true"
            style={{
              backgroundColor: 'var(--color-tape)',
              borderColor: 'color-mix(in srgb, var(--color-paper-border) 52%, transparent)',
              transform: 'translateX(-50%) rotate(3.5deg)',
            }}
          />
        ) : null}

        {decorationVariant === 'pin-center' ? (
          <div
            className={`absolute left-1/2 top-0 z-20 h-4 w-4 -translate-x-1/2 rounded-full border shadow-sm ${isNewlyAdded ? 'manifest-card-enter-pin' : ''}`}
            aria-hidden="true"
            style={{
              backgroundColor: pinColor,
              borderColor: 'color-mix(in srgb, var(--color-paper-strong) 72%, transparent)',
            }}
          />
        ) : null}

        {decorationVariant === 'pin-left' ? (
          <div
            className={`absolute left-7 top-0 z-20 h-4 w-4 rounded-full border shadow-sm ${isNewlyAdded ? 'manifest-card-enter-pin' : ''}`}
            aria-hidden="true"
            style={{
              backgroundColor: pinColor,
              borderColor: 'color-mix(in srgb, var(--color-paper-strong) 72%, transparent)',
            }}
          />
        ) : null}

        <div
          className={['rounded-[0.95rem] border p-3 shadow-paper', isNewlyAdded ? 'manifest-card-enter-paper' : ''].join(' ')}
          style={{
            backgroundColor: 'var(--color-paper-strong)',
            borderColor: 'var(--color-paper-border)',
            transform: `rotate(${rotation}deg)`,
          }}
        >
          <div className="relative aspect-[0.97] overflow-hidden rounded-[0.25rem] bg-[var(--color-card)]">
            <img
              src={manifest.imageUrl || FALLBACK_IMAGE}
              alt={manifest.title}
              className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
            />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-stone-950/10 to-transparent" />
          </div>
          <div className="space-y-3 px-1 pt-3.5">
            <div className="flex justify-start">
              <StatusBadge status={manifest.status} />
            </div>
            <h3 className="line-clamp-2 font-serif text-[1.05rem] leading-[1.1] text-[var(--color-heading)] sm:text-[1.2rem]">
              {manifest.title}
            </h3>
            <p className="line-clamp-3 text-[13px] leading-6 text-[var(--color-text-soft)] sm:text-sm">
              {manifest.notes || 'Save a photo and a few lines about the feeling, scene, or future moment you want to keep close.'}
            </p>
            {manifest.category ? (
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--color-text-soft)]/85">
                {manifest.category}
              </p>
            ) : null}
          </div>
        </div>
      </Link>
    </article>
  )
}
