import { ui } from '../lib/ui'

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
  coverImage,
}) {
  return (
    <section className={`${ui.panelStrong} relative overflow-hidden px-4 py-5 sm:px-6 sm:py-6`}>
      {coverImage ? (
        <>
          <div className="absolute inset-0">
            <img
              src={coverImage}
              alt=""
              className="h-full w-full object-cover opacity-[0.38]"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-[color-mix(in_srgb,var(--color-bg)_64%,transparent)] via-[color-mix(in_srgb,var(--color-bg-soft)_26%,transparent)] to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[color-mix(in_srgb,var(--color-surface-soft)_36%,transparent)] via-[color-mix(in_srgb,var(--color-bg-soft)_10%,transparent)] to-transparent" />
        </>
      ) : null}
      <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="relative min-w-0 flex-1">
          {eyebrow ? (
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--color-text-soft)]">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="mt-2 overflow-hidden text-ellipsis whitespace-nowrap font-serif text-[clamp(2rem,4.4vw,3.85rem)] leading-[0.98] text-[var(--color-heading)]">
            {title}
          </h2>
          {description ? (
            <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--color-text-soft)] sm:text-[15px]">
              {description}
            </p>
          ) : null}
        </div>
        {action ? <div className="relative w-full shrink-0 lg:w-auto lg:pb-1">{action}</div> : null}
      </div>
    </section>
  )
}
