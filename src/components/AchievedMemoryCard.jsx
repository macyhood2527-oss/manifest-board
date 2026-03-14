import { CalendarDays, ImageOff, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

function formatAchievedDate(value) {
  if (!value) {
    return 'A beautiful moment'
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}

export function AchievedMemoryCard({ manifest }) {
  const reflection = manifest.achievedReflection?.trim()

  return (
    <article className="group relative overflow-visible px-1 pb-1 pt-5 transition duration-300 hover:-translate-y-1">
      <Link
        to={`/manifests/${manifest.id}`}
        className="relative block pt-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2"
      >
        <div
          className="absolute left-1/2 top-0 z-20 h-5 w-[4.8rem] -translate-x-1/2 rounded-[0.22rem] border shadow-sm"
          aria-hidden="true"
          style={{
            backgroundColor: 'color-mix(in srgb, var(--color-accent) 16%, white)',
            borderColor: 'color-mix(in srgb, var(--color-paper-border) 52%, transparent)',
            transform: 'translateX(-50%) rotate(-1.8deg)',
          }}
        />

        <div
          className="rounded-[1.15rem] border p-3 shadow-paper"
          style={{
            background: 'linear-gradient(180deg, color-mix(in srgb, var(--color-paper-strong) 96%, white), color-mix(in srgb, var(--color-accent) 6%, var(--color-paper)))',
            borderColor: 'color-mix(in srgb, var(--color-accent) 16%, var(--color-paper-border))',
            transform: 'rotate(-0.65deg)',
          }}
        >
          <div className="relative aspect-[0.98] overflow-hidden rounded-[0.35rem] bg-[var(--color-card)]">
            {manifest.imageUrl ? (
              <>
                <img
                  src={manifest.imageUrl}
                  alt={manifest.title}
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
                />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-stone-950/10 to-transparent" />
              </>
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-[color-mix(in_srgb,var(--color-paper)_92%,white)] px-6 text-center">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--color-accent)_14%,white)] text-[var(--color-accent)]">
                  <ImageOff className="h-5 w-5" strokeWidth={1.9} />
                </span>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-[var(--color-heading)]">
                    Saved as a memory
                  </p>
                  <p className="text-xs leading-5 text-[var(--color-text-soft)]">
                    Even without a photo, this moment still belongs in your keepsake wall.
                  </p>
                </div>
              </div>
            )}

            <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-[color-mix(in_srgb,var(--color-accent)_24%,white)] bg-[rgba(255,253,249,0.92)] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--color-success)] shadow-sm backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5" strokeWidth={1.8} />
              Achieved
            </div>
          </div>

          <div className="space-y-3 px-1 pt-3.5">
            <div className="inline-flex items-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--color-border)_88%,white)] bg-[color-mix(in_srgb,var(--color-accent)_8%,white)] px-3 py-1.5 text-[11px] font-medium text-[var(--color-text-soft)] shadow-sm">
              <CalendarDays className="h-3.5 w-3.5 text-[var(--color-accent)]" strokeWidth={1.8} />
              {formatAchievedDate(manifest.achievedAt)}
            </div>

            <h3 className="line-clamp-2 font-serif text-[1.15rem] leading-[1.08] text-[var(--color-heading)] sm:text-[1.3rem]">
              {manifest.title}
            </h3>

            {reflection ? (
              <div className="rounded-[1rem] border border-[color-mix(in_srgb,var(--color-accent)_12%,var(--color-border))] bg-[color-mix(in_srgb,var(--color-accent)_6%,white)] px-3 py-3 shadow-sm">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-text-soft)]">
                  Reflection
                </p>
                <p className="mt-2 line-clamp-4 text-[13px] leading-6 text-[var(--color-text-soft)] sm:text-sm">
                  {reflection}
                </p>
              </div>
            ) : (
              <p className="line-clamp-4 text-[13px] leading-6 text-[var(--color-text-soft)] sm:text-sm">
                {manifest.notes || 'A quiet piece of proof that this vision found its way into real life.'}
              </p>
            )}

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
