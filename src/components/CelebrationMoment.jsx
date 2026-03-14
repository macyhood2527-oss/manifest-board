import { Sparkles, Star } from 'lucide-react'

const CONFETTI_POSITIONS = [
  'left-[10%] top-4',
  'left-[28%] top-10',
  'left-[48%] top-3',
  'left-[68%] top-12',
  'left-[86%] top-5',
  'left-[18%] top-20',
  'left-[58%] top-24',
]

export function CelebrationMoment({
  eyebrow = 'Small celebration',
  title,
  description,
  tone = 'dream',
}) {
  const toneStyles = {
    dream: {
      panel: 'bg-paper-blush',
      iconWrap: 'bg-[color-mix(in_srgb,var(--color-primary)_14%,white)] text-[var(--color-primary)]',
      confetti: 'bg-[color-mix(in_srgb,var(--color-primary)_22%,white)]',
    },
    achieved: {
      panel: 'bg-paper-sage',
      iconWrap: 'bg-[color-mix(in_srgb,var(--color-accent)_18%,white)] text-[var(--color-success)]',
      confetti: 'bg-[color-mix(in_srgb,var(--color-accent)_20%,white)]',
    },
  }

  const style = toneStyles[tone] ?? toneStyles.dream

  return (
    <section className={`celebration-enter relative overflow-hidden rounded-[1.8rem] border border-[var(--color-border)] ${style.panel} px-4 py-5 shadow-paper sm:px-5`}>
      <div className="pointer-events-none absolute inset-0">
        {CONFETTI_POSITIONS.map((position, index) => (
          <span
            key={position}
            className={`celebration-confetti absolute inline-flex h-3 w-3 rounded-full ${style.confetti} ${position}`}
            style={{ animationDelay: `${index * 120}ms` }}
          />
        ))}
      </div>

      <div className="relative flex items-start gap-4">
        <span className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${style.iconWrap} shadow-sm`}>
          <Sparkles className="h-5 w-5" strokeWidth={2} />
        </span>

        <div className="min-w-0">
          <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-text-soft)]">
            <Star className="h-3.5 w-3.5" strokeWidth={1.9} />
            {eyebrow}
          </p>
          <h2 className="mt-2 font-serif text-2xl text-[var(--color-heading)] sm:text-[2rem]">
            {title}
          </h2>
          {description ? (
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-text-soft)]">
              {description}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  )
}
