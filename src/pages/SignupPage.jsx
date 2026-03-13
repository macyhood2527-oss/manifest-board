import { Eye, EyeOff, Heart, UserPlus } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { ui } from '../lib/ui'

export function SignupPage() {
  const navigate = useNavigate()
  const { signup } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setErrorMessage('')

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match yet.')
      return
    }

    setIsSubmitting(true)

    try {
      await signup({ name: name.trim(), email: email.trim(), password })
      navigate('/', { replace: true })
    } catch (error) {
      setErrorMessage(error.message || 'Unable to create your account right now.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-app-canvas px-4 py-8 sm:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl items-center justify-center">
        <div className="grid w-full gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <section className={`${ui.panelStrong} hidden p-8 lg:block`}>
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-primary)] text-[var(--color-primary-contrast)] shadow-paper">
              <Heart className="h-5 w-5" strokeWidth={2} />
            </div>
            <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--color-text-soft)]">
              Create your space
            </p>
            <h1 className="mt-3 font-serif text-5xl leading-[0.95] text-[var(--color-heading)]">
              Start your own Manifest Board.
            </h1>
            <p className="mt-5 max-w-md text-sm leading-7 text-[var(--color-text-soft)]">
              Create a personal account so your boards, manifests, and gentle progress belong only to you.
            </p>
          </section>

          <section className={`${ui.panelStrong} p-6 sm:p-8`}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--color-text-soft)]">
              Manifest Board
            </p>
            <h2 className="mt-2 font-serif text-4xl text-[var(--color-heading)]">Create account</h2>
            <p className="mt-3 text-sm leading-6 text-[var(--color-text-soft)]">
              Use your email and password to create a private dream space.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <label className={`block space-y-2 ${ui.fieldLabel}`}>
                <span>Name</span>
                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Melissa"
                  className={ui.fieldInput}
                />
              </label>

              <label className={`block space-y-2 ${ui.fieldLabel}`}>
                <span>Email</span>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className={ui.fieldInput}
                />
              </label>

              <label className={`block space-y-2 ${ui.fieldLabel}`}>
                <span>Password</span>
                <div className="relative">
                  <input
                    required
                    minLength={8}
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="At least 8 characters"
                    className={`${ui.fieldInput} pr-12`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((currentValue) => !currentValue)}
                    className="absolute right-3 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-[var(--color-text-soft)] transition hover:bg-[var(--color-surface-elevated)] hover:text-[var(--color-heading)]"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" strokeWidth={1.9} /> : <Eye className="h-4 w-4" strokeWidth={1.9} />}
                  </button>
                </div>
              </label>

              <label className={`block space-y-2 ${ui.fieldLabel}`}>
                <span>Confirm password</span>
                <div className="relative">
                  <input
                    required
                    minLength={8}
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    placeholder="Repeat your password"
                    className={`${ui.fieldInput} pr-12`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((currentValue) => !currentValue)}
                    className="absolute right-3 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-[var(--color-text-soft)] transition hover:bg-[var(--color-surface-elevated)] hover:text-[var(--color-heading)]"
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" strokeWidth={1.9} /> : <Eye className="h-4 w-4" strokeWidth={1.9} />}
                  </button>
                </div>
              </label>

              {errorMessage ? <div className={ui.errorPanel}>{errorMessage}</div> : null}

              <button type="submit" disabled={isSubmitting} className={`${ui.buttonPrimary} w-full`}>
                <UserPlus className="mr-2 h-4 w-4" strokeWidth={1.9} />
                {isSubmitting ? 'Creating account...' : 'Create account'}
              </button>
            </form>

            <p className="mt-5 text-sm text-[var(--color-text-soft)]">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-hover)]">
                Sign in
              </Link>
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
