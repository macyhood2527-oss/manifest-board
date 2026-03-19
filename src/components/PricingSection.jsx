import { Crown, Sparkles, WandSparkles } from 'lucide-react'
import { useState } from 'react'
import { ui } from '../lib/ui'

const billingOptions = [
  {
    id: 'monthly',
    label: 'Monthly',
    price: '$5.99',
    cadence: '/month',
    helper: 'A gentle monthly plan for a deeper vision space.',
  },
  {
    id: 'yearly',
    label: 'Yearly',
    price: '$49',
    cadence: '/year',
    helper: 'Save more if Manifest Board becomes part of your rhythm.',
    badge: 'Best value',
  },
]

const planDetails = {
  free: {
    name: 'Free',
    eyebrow: 'Core experience',
    description:
      'A calm space to revisit your dreams, build boards, and return whenever you need perspective.',
    ctaLabel: 'Current foundation',
    ctaClassName: ui.buttonSecondary,
    highlightClassName:
      'border-[color-mix(in_srgb,var(--color-border)_54%,white)] bg-[color-mix(in_srgb,var(--color-paper-strong)_82%,var(--color-bg-soft))] shadow-[0_18px_42px_rgba(var(--color-shadow-rgb),0.08)]',
    featureGroups: [
      'Up to 3 boards',
      'Manifest creation and editing',
      'Board cover images',
      'Achieved page and quotes',
      'Basic themes and PWA install',
    ],
  },
  premium: {
    name: 'Premium',
    eyebrow: 'Deeper reflection',
    description:
      'For a richer, more personal vision practice with more expression, memory, and reflection built in.',
    ctaLabel: 'Upgrade coming soon',
    ctaClassName: ui.buttonPrimary,
    highlightClassName:
      'border-[color-mix(in_srgb,var(--color-primary)_16%,white)] bg-[color-mix(in_srgb,var(--color-primary)_8%,white)] shadow-[0_22px_50px_rgba(var(--color-shadow-rgb),0.1)]',
    featureGroups: [
      'Unlimited boards',
      'Premium visual themes and styles',
      'Reflection notes and future-self messages',
      'Memory resurfacing and timeline moments',
      'Gentle reminders and private rituals',
    ],
  },
}

const reassuranceItems = [
  'Cancel anytime when premium launches',
  'Your existing boards and memories stay intact',
  'Free remains generous and ad-free',
]

const freeCardStyle = {
  borderColor: 'color-mix(in srgb, var(--color-border) 42%, white)',
  background:
    'linear-gradient(180deg, color-mix(in srgb, var(--color-paper-strong) 99%, white) 0%, color-mix(in srgb, var(--color-bg-soft) 56%, white) 100%)',
  boxShadow: '0 20px 46px rgba(var(--color-shadow-rgb), 0.07)',
}

const premiumCardStyle = {
  borderColor: 'color-mix(in srgb, var(--color-primary) 24%, white)',
  background:
    'linear-gradient(180deg, color-mix(in srgb, var(--color-primary) 14%, white) 0%, color-mix(in srgb, var(--color-surface-soft) 42%, white) 100%)',
  boxShadow: '0 22px 50px rgba(var(--color-shadow-rgb), 0.09)',
}

function parsePriceAmount(price) {
  return Number(price.replace(/[^0-9.]/g, ''))
}

export function PricingSection({
  eyebrow = 'Premium preview',
  title = 'Keep the core soft. Charge for the deeper layer.',
  description = 'Free should already feel complete. Premium can add more reflection, beauty, memory, and personalization for the people who want Manifest Board to feel even more like home.',
  freeCtaLabel = planDetails.free.ctaLabel,
  premiumCtaLabel = planDetails.premium.ctaLabel,
  premiumFootnote = 'A gentle premium layer built around reflection, rituals, and deeper personalization.',
  onFreeClick,
  onPremiumClick,
  freeDisabled = true,
  premiumDisabled = true,
  asPanel = true,
  className = '',
}) {
  const [billingId, setBillingId] = useState('yearly')
  const activeBilling = billingOptions.find((option) => option.id === billingId) || billingOptions[0]
  const monthlyOption = billingOptions.find((option) => option.id === 'monthly')
  const yearlyOption = billingOptions.find((option) => option.id === 'yearly')
  const yearlySavings =
    monthlyOption && yearlyOption
      ? Math.round(
          ((parsePriceAmount(monthlyOption.price) * 12 - parsePriceAmount(yearlyOption.price)) /
            (parsePriceAmount(monthlyOption.price) * 12)) *
            100,
        )
      : null
  const wrapperClassName = asPanel
    ? `${ui.panelStrong} relative overflow-hidden p-5 sm:p-7 ${className}`.trim()
    : `relative overflow-hidden rounded-[2rem] px-5 py-7 sm:px-7 sm:py-8 ${className}`.trim()

  return (
    <section className={wrapperClassName}>
      <div className="absolute inset-x-0 top-0 h-32 bg-[radial-gradient(circle_at_top_left,color-mix(in_srgb,var(--color-primary)_16%,transparent),transparent_68%)]" />

      <div className="relative space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--color-text-soft)]">
              {eyebrow}
            </p>
            <h2 className="mt-2 font-serif text-3xl text-[var(--color-heading)] sm:text-[3rem]">
              {title}
            </h2>
            <p className="mt-3 text-sm leading-6 text-[var(--color-text-soft)] sm:text-[15px]">
              {description}
            </p>
          </div>

          <div className="inline-flex w-full max-w-sm rounded-full border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-1 shadow-sm">
            {billingOptions.map((option) => {
              const isActive = option.id === billingId

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setBillingId(option.id)}
                  className={[
                    'relative flex-1 rounded-full px-4 py-2.5 text-sm font-semibold transition duration-200',
                    isActive
                      ? 'bg-[var(--color-primary)] text-[var(--color-primary-contrast)] shadow-sm'
                      : 'text-[var(--color-text-soft)] hover:text-[var(--color-heading)]',
                  ].join(' ')}
                >
                  {option.label}
                  {option.badge ? (
                    <span className="ml-2 inline-flex rounded-full bg-white/18 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em]">
                      {option.badge}
                    </span>
                  ) : null}
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--color-text-soft)]">
          {billingId === 'yearly' && yearlySavings ? (
            <span className="inline-flex rounded-full border border-[#e2c2d2] bg-[#fff8fc] px-3 py-1.5 font-semibold text-[var(--color-heading)] shadow-sm">
              Save {yearlySavings}% with yearly billing
            </span>
          ) : null}
          <p>
            {billingId === 'yearly'
              ? 'Best for people who want Manifest Board to become part of their steady rhythm.'
              : 'A lighter way to try the deeper layer before committing to a full year.'}
          </p>
        </div>

        <div className="grid items-stretch gap-4 lg:grid-cols-[0.95fr_1.05fr]">
          <article
            className="relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border p-5 sm:p-6"
            style={freeCardStyle}
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),transparent)]" />
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-text-soft)]">
                  {planDetails.free.eyebrow}
                </p>
                <h3 className="mt-2 font-serif text-3xl text-[var(--color-heading)]">
                  {planDetails.free.name}
                </h3>
              </div>
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[color-mix(in_srgb,var(--color-border)_48%,white)] bg-[rgba(255,255,255,0.9)] text-[var(--color-heading)] shadow-sm">
                <Sparkles className="h-5 w-5" strokeWidth={1.9} />
              </span>
            </div>

            <p className="mt-4 text-sm leading-6 text-[var(--color-text-soft)]">
              {planDetails.free.description}
            </p>

            <p className="mt-3 text-sm font-medium text-[var(--color-heading)]">
              Best for people who want a calm, complete starter space.
            </p>

            <div className="mt-6">
              <p className="font-serif text-[2.5rem] leading-none text-[var(--color-heading)]">$0</p>
              <p className="mt-2 text-sm text-[var(--color-text-soft)]">Always generous on the essentials.</p>
            </div>

            <ul className="mt-6 flex-1 space-y-3 text-sm text-[var(--color-text-soft)]">
              {planDetails.free.featureGroups.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-2.5 w-2.5 rounded-full bg-[color-mix(in_srgb,var(--color-primary)_44%,white)]" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <div className="mt-7 pt-1">
              <button
                type="button"
                className={planDetails.free.ctaClassName}
                disabled={freeDisabled}
                onClick={onFreeClick}
              >
                {freeCtaLabel}
              </button>
            </div>
          </article>

          <article
            className="relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border p-5 sm:p-6"
            style={premiumCardStyle}
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[linear-gradient(180deg,rgba(255,255,255,0.9),transparent)]" />

            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--color-primary)_22%,white)] bg-[color-mix(in_srgb,var(--color-primary)_10%,white)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-heading)] shadow-sm">
                <Crown className="h-3.5 w-3.5" strokeWidth={2} />
                Most aligned
              </div>
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-[1.1rem] border border-[color-mix(in_srgb,var(--color-primary)_18%,white)] bg-[rgba(255,255,255,0.92)] text-[var(--color-primary)] shadow-sm">
                <WandSparkles className="h-5 w-5" strokeWidth={1.9} />
              </span>
            </div>

            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-text-soft)]">
                  {planDetails.premium.eyebrow}
                </p>
                <h3 className="mt-2 font-serif text-3xl text-[var(--color-heading)]">
                  {planDetails.premium.name}
                </h3>
              </div>
            </div>

            <p className="mt-4 text-sm leading-6 text-[var(--color-text-soft)]">
              {planDetails.premium.description}
            </p>

            <p className="mt-3 text-sm font-medium text-[var(--color-heading)]">
              Best for people who want richer reflection, beauty, and personal rituals.
            </p>

            <div className="mt-6 flex flex-wrap items-end gap-3">
              <div>
                <p className="font-serif text-[2.75rem] leading-none text-[var(--color-heading)]">
                  {activeBilling.price}
                  <span className="ml-1 text-lg text-[var(--color-text-soft)]">{activeBilling.cadence}</span>
                </p>
                <p className="mt-2 text-sm text-[var(--color-text-soft)]">{activeBilling.helper}</p>
              </div>
            </div>

            <div className="mt-5 rounded-[1.45rem] border border-[color-mix(in_srgb,var(--color-primary)_14%,white)] bg-[color-mix(in_srgb,var(--color-primary)_3%,white)] p-4 shadow-sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-text-soft)]">
                Launch perks
              </p>
              <div className="mt-3 flex flex-wrap gap-2 text-sm text-[var(--color-heading)]">
                <span className="rounded-full border border-[color-mix(in_srgb,var(--color-primary)_12%,white)] bg-[rgba(255,255,255,0.9)] px-3 py-1.5">Founding price</span>
                <span className="rounded-full border border-[color-mix(in_srgb,var(--color-primary)_12%,white)] bg-[rgba(255,255,255,0.9)] px-3 py-1.5">Priority access</span>
                <span className="rounded-full border border-[color-mix(in_srgb,var(--color-primary)_12%,white)] bg-[rgba(255,255,255,0.9)] px-3 py-1.5">Cancel anytime</span>
              </div>
            </div>

            <ul className="mt-6 flex-1 grid gap-3 text-sm text-[var(--color-text-soft)] sm:grid-cols-2">
              {planDetails.premium.featureGroups.map((feature) => (
                <li
                  key={feature}
                  className="rounded-[1.35rem] border border-[color-mix(in_srgb,var(--color-primary)_14%,white)] bg-[color-mix(in_srgb,var(--color-primary)_4%,white)] px-4 py-3"
                >
                  {feature}
                </li>
              ))}
            </ul>

            <div className="mt-7 flex flex-col gap-4 pt-1 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                className={planDetails.premium.ctaClassName}
                disabled={premiumDisabled}
                onClick={onPremiumClick}
              >
                {premiumCtaLabel}
              </button>
              <p className="max-w-xs text-sm leading-6 text-[var(--color-text-soft)]">
                {premiumFootnote}
              </p>
            </div>
          </article>
        </div>

        <div className="grid gap-3 rounded-[1.6rem] border border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-surface-elevated)_86%,white)] p-4 sm:grid-cols-3 sm:p-5">
          {reassuranceItems.map((item) => (
            <div key={item} className="rounded-[1.1rem] bg-white/70 px-4 py-3 text-sm text-[var(--color-text-soft)]">
              {item}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
