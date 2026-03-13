import { CheckCircle2, Info, TriangleAlert, X } from 'lucide-react'
import { useCallback, useMemo, useRef, useState } from 'react'
import { ToastContext } from './ToastContext'

const TOAST_DURATION = 3600
const TOAST_LIMIT = 3

const POSITION_CLASSES = {
  'top-right':
    'pointer-events-none fixed inset-x-3 top-3 z-[80] flex flex-col gap-3 sm:inset-x-auto sm:right-4 sm:w-[min(26rem,calc(100vw-2rem))]',
  'bottom-center':
    'pointer-events-none fixed inset-x-3 bottom-3 z-[80] flex flex-col gap-3 sm:left-1/2 sm:right-auto sm:w-[min(28rem,calc(100vw-2rem))] sm:-translate-x-1/2',
}

const TOAST_STYLES = {
  success: {
    panel:
      'border-[color-mix(in_srgb,var(--color-success)_28%,white)] bg-[color-mix(in_srgb,var(--color-success-soft)_86%,white)] text-[var(--color-heading)]',
    icon:
      'bg-[color-mix(in_srgb,var(--color-success)_14%,white)] text-[var(--color-success)]',
    Icon: CheckCircle2,
  },
  info: {
    panel:
      'border-[color-mix(in_srgb,var(--color-info)_24%,white)] bg-[color-mix(in_srgb,var(--color-info-soft)_88%,white)] text-[var(--color-heading)]',
    icon:
      'bg-[color-mix(in_srgb,var(--color-info)_14%,white)] text-[var(--color-info)]',
    Icon: Info,
  },
  error: {
    panel:
      'border-[color-mix(in_srgb,var(--color-danger)_30%,white)] bg-[color-mix(in_srgb,var(--color-danger-soft)_90%,white)] text-[var(--color-heading)]',
    icon:
      'bg-[color-mix(in_srgb,var(--color-danger)_14%,white)] text-[var(--color-danger)]',
    Icon: TriangleAlert,
  },
}

export function ToastProvider({ children, position = 'bottom-center' }) {
  const [toasts, setToasts] = useState([])
  const timeoutIds = useRef(new Map())

  const dismissToast = useCallback((id) => {
    const timeoutId = timeoutIds.current.get(id)

    if (timeoutId) {
      window.clearTimeout(timeoutId)
      timeoutIds.current.delete(id)
    }

    setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback(({ title, description = '', tone = 'success' }) => {
    const id = crypto.randomUUID()
    const nextToast = {
      id,
      title,
      description,
      tone,
    }

    setToasts((currentToasts) => [...currentToasts.slice(-(TOAST_LIMIT - 1)), nextToast])

    const timeoutId = window.setTimeout(() => {
      dismissToast(id)
    }, TOAST_DURATION)

    timeoutIds.current.set(id, timeoutId)
  }, [dismissToast])

  const value = useMemo(() => ({
    showToast,
    success: (title, description) => showToast({ title, description, tone: 'success' }),
    info: (title, description) => showToast({ title, description, tone: 'info' }),
    error: (title, description) => showToast({ title, description, tone: 'error' }),
  }), [showToast])

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div
        aria-live="polite"
        aria-atomic="true"
        className={POSITION_CLASSES[position] ?? POSITION_CLASSES['bottom-center']}
      >
        {toasts.map((toast) => {
          const style = TOAST_STYLES[toast.tone] ?? TOAST_STYLES.success
          const Icon = style.Icon

          return (
            <div
              key={toast.id}
              className={[
                'toast-enter pointer-events-auto rounded-[1.45rem] border p-3.5 shadow-[0_18px_45px_rgba(var(--color-shadow-rgb),0.16)] backdrop-blur-sm',
                style.panel,
              ].join(' ')}
              role="status"
            >
              <div className="flex items-start gap-3">
                <span className={['inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl', style.icon].join(' ')}>
                  <Icon className="h-[1.05rem] w-[1.05rem]" strokeWidth={2} />
                </span>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[var(--color-heading)]">
                    {toast.title}
                  </p>
                  {toast.description ? (
                    <p className="mt-1 text-sm leading-5 text-[var(--color-text-soft)]">
                      {toast.description}
                    </p>
                  ) : null}
                </div>

                <button
                  type="button"
                  onClick={() => dismissToast(toast.id)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-xl text-[var(--color-text-soft)] transition hover:bg-white/60 hover:text-[var(--color-heading)]"
                  aria-label="Dismiss toast"
                >
                  <X className="h-4 w-4" strokeWidth={2} />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}
