import { ui } from '../lib/ui'

export function EmptyState({
  title,
  description,
  action,
  tone = 'default',
}) {
  const toneStyles = {
    default: 'bg-paper-note',
    achieved: 'bg-paper-sage',
  }

  return (
    <section className={`${ui.panelStrong} relative overflow-hidden px-6 py-9 text-center sm:px-10 sm:py-10`}>
      <div className={`${toneStyles[tone]} absolute inset-4 rounded-[1.6rem] border border-[var(--color-border)]`} />
      <div className="relative mx-auto mb-5 flex h-[3.75rem] w-[3.75rem] items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface-elevated)] text-[22px] text-[var(--color-primary)] shadow-paper">
        ✦
      </div>
      <h2 className="relative font-serif text-3xl text-[var(--color-heading)] sm:text-4xl">{title}</h2>
      <p className="relative mx-auto mt-3 max-w-md text-sm leading-6 text-[var(--color-text-soft)]">
        {description}
      </p>
      {action ? <div className="relative mt-6">{action}</div> : null}
    </section>
  )
}
