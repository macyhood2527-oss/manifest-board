export function ThemeOption({
  theme,
  isActive,
  onSelect,
}) {
  const swatches = [
    theme.colors.background,
    theme.colors.surface,
    theme.colors.primary,
    theme.colors.accent,
    theme.colors.text,
  ]

  return (
    <button
      type="button"
      onClick={() => onSelect(theme.id)}
      aria-pressed={isActive}
      className={[
        'w-full rounded-[1.65rem] border p-4 text-left transition duration-200',
        isActive
          ? 'border-[var(--color-primary)] bg-[var(--color-surface-soft)] shadow-paper ring-1 ring-[color-mix(in_srgb,var(--color-primary)_22%,transparent)]'
          : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:-translate-y-0.5 hover:border-[var(--color-accent)] hover:bg-[var(--color-surface-soft)]',
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[var(--color-text)]">{theme.label}</p>
          <p className="mt-1 text-sm leading-6 text-[var(--color-muted)]">{theme.description}</p>
        </div>
        {isActive ? (
          <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-[var(--color-primary)] px-2 text-xs font-semibold text-[var(--color-primary-contrast)] shadow-sm">
            Active
          </span>
        ) : null}
      </div>

      <div
        className="mt-4 overflow-hidden rounded-[1.25rem] border border-black/5 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]"
        style={{
          background: `linear-gradient(180deg, ${theme.colors.background} 0%, ${theme.colors.surface} 100%)`,
        }}
        aria-hidden="true"
      >
        <div className="flex items-center justify-between">
          <span
            className="rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]"
            style={{
              backgroundColor: theme.colors.primary,
              color: theme.colors.background,
            }}
          >
            Theme
          </span>
          <span
            className="h-3.5 w-3.5 rounded-full shadow-sm"
            style={{ backgroundColor: theme.colors.accent }}
          />
        </div>

        <div
          className="mt-3 rounded-[1rem] p-3 shadow-sm"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.56)' }}
        >
          <div
            className="h-16 rounded-[0.85rem]"
            style={{ backgroundColor: theme.colors.surface }}
          />

          <div className="mt-3 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div
                className="h-3 rounded-full"
                style={{ width: '7rem', backgroundColor: theme.colors.text, opacity: 0.84 }}
              />
              <div
                className="mt-2 h-2 rounded-full"
                style={{ width: '5rem', backgroundColor: theme.colors.text, opacity: 0.28 }}
              />
            </div>

            <div
              className="rounded-full px-2.5 py-1 text-[10px] font-semibold"
              style={{
                backgroundColor: theme.colors.accent,
                color: theme.colors.background,
              }}
            >
              Soft
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        {swatches.map((swatch) => (
          <span
            key={swatch}
            className="h-7 w-7 rounded-full border border-black/5 shadow-sm"
            style={{ backgroundColor: swatch }}
            aria-hidden="true"
          />
        ))}
      </div>
    </button>
  )
}
