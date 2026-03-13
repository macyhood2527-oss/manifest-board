export const ui = {
  pageShell: 'min-h-screen bg-app-canvas p-2 text-[var(--color-text)] sm:p-3 lg:py-4 lg:pr-5 xl:pr-6',
  pageContainer: 'flex w-full flex-col gap-4 sm:gap-6',
  panel:
    'rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-surface-soft)] shadow-paper',
  panelStrong:
    'rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-surface-soft)] shadow-soft',
  card:
    'rounded-[1rem] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] shadow-card',
  buttonPrimary:
    'inline-flex items-center justify-center rounded-full border border-[var(--color-primary)] bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-[var(--color-primary-contrast)] shadow-paper transition duration-200 hover:-translate-y-0.5 hover:bg-[var(--color-primary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70',
  buttonSecondary:
    'inline-flex items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-5 py-3 text-sm font-semibold text-[var(--color-text)] shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2',
  buttonTint:
    'inline-flex items-center justify-center rounded-full border border-[var(--color-accent)] bg-[var(--color-success-soft)] px-5 py-3 text-sm font-semibold text-[var(--color-success)] shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-[var(--color-accent-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70',
  fieldLabel: 'text-sm font-semibold text-[var(--color-text)]',
  fieldInput:
    'w-full rounded-[1.35rem] border border-[var(--color-border)] bg-[var(--color-bg-soft)] px-4 py-3.5 text-[var(--color-heading)] outline-none transition duration-200 placeholder:text-[var(--color-text-soft)] focus:border-[var(--color-primary)] focus:bg-[var(--color-surface-elevated)] focus:ring-4 focus:ring-[var(--color-accent-soft)]',
  fieldTextarea:
    'w-full rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-bg-soft)] px-4 py-3.5 text-[var(--color-heading)] outline-none transition duration-200 placeholder:text-[var(--color-text-soft)] focus:border-[var(--color-primary)] focus:bg-[var(--color-surface-elevated)] focus:ring-4 focus:ring-[var(--color-accent-soft)]',
  chip:
    'inline-flex items-center whitespace-nowrap rounded-full border px-4 py-2.5 text-sm font-medium transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2',
  sectionBoard:
    'rounded-[2rem] border border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-surface-soft)_88%,white)] p-2.5 min-[420px]:p-3.5',
  errorPanel:
    'rounded-[1.5rem] border border-[var(--color-danger)] bg-[var(--color-danger-soft)] px-4 py-3 text-sm text-[var(--color-danger)]',
  infoPanel:
    'rounded-[1.4rem] border border-[var(--color-border)] bg-[var(--color-info-soft)] px-4 py-3 text-sm text-[var(--color-info)] shadow-sm',
}
