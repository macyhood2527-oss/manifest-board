export const ONBOARDING_DISMISSED_KEY = 'manifestia-onboarding-dismissed'

export const STARTER_MANIFESTS = [
  {
    title: 'My soft morning routine',
    category: 'Lifestyle',
    notes: 'Slow mornings, clear energy, and a rhythm that makes the rest of the day feel grounded.',
  },
  {
    title: 'My next dream trip',
    category: 'Travel',
    notes: 'A place that feels expansive, beautiful, and worth remembering long before I arrive.',
  },
  {
    title: 'A healthier, calmer version of me',
    category: 'Wellness',
    notes: 'Small habits, better rest, and the kind of peace that shows up in everyday life.',
  },
]

export function isOnboardingDismissed() {
  if (typeof window === 'undefined') {
    return false
  }

  return window.localStorage.getItem(ONBOARDING_DISMISSED_KEY) === 'true'
}

export function dismissOnboarding() {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(ONBOARDING_DISMISSED_KEY, 'true')
}

export function clearOnboardingDismissal() {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.removeItem(ONBOARDING_DISMISSED_KEY)
}
