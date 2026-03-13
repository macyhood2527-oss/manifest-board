const STATUS_STYLES = {
  dreaming: {
    '--badge-bg': 'color-mix(in srgb, var(--color-primary) 12%, white)',
    '--badge-border': 'color-mix(in srgb, var(--color-primary) 24%, var(--color-surface))',
    '--badge-text': 'color-mix(in srgb, var(--color-primary) 76%, var(--color-text))',
  },
  planning: {
    '--badge-bg': 'color-mix(in srgb, var(--color-accent) 12%, white)',
    '--badge-border': 'color-mix(in srgb, var(--color-accent) 26%, var(--color-surface))',
    '--badge-text': 'color-mix(in srgb, var(--color-accent) 72%, var(--color-text))',
  },
  inspiration: {
    '--badge-bg': 'color-mix(in srgb, var(--color-accent) 8%, color-mix(in srgb, var(--color-primary) 10%, white))',
    '--badge-border': 'color-mix(in srgb, var(--color-primary) 22%, var(--color-surface))',
    '--badge-text': 'color-mix(in srgb, var(--color-accent) 44%, color-mix(in srgb, var(--color-primary) 42%, var(--color-text)))',
  },
  achieved: {
    '--badge-bg': 'color-mix(in srgb, var(--color-accent) 16%, white)',
    '--badge-border': 'color-mix(in srgb, var(--color-accent) 30%, var(--color-surface))',
    '--badge-text': 'color-mix(in srgb, var(--color-accent) 80%, var(--color-text))',
  },
}

export function StatusBadge({ status }) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-semibold capitalize tracking-[0.12em] shadow-sm',
        'border-[var(--badge-border)] bg-[var(--badge-bg)] text-[var(--badge-text)]',
      ].join(' ')}
      style={STATUS_STYLES[status] ?? {
        '--badge-bg': 'var(--color-badge-bg)',
        '--badge-border': 'var(--color-border)',
        '--badge-text': 'var(--color-badge-text)',
      }}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" aria-hidden="true" />
      {status}
    </span>
  )
}
