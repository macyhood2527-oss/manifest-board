import { useEffect, useMemo, useState } from 'react'
import { Bookmark, ChevronDown, PencilLine, Quote, Sparkles, Trash2 } from 'lucide-react'
import { AppShell } from '../components/AppShell'
import { EmptyState } from '../components/EmptyState'
import { PageHeader } from '../components/PageHeader'
import { createQuote, deleteQuote, getQuotes, updateQuote } from '../lib/quotes'
import { ui } from '../lib/ui'
import { useToast } from '../toast/useToast'

function getInitialQuoteValues(quote = null) {
  return {
    quoteText: quote?.quoteText ?? '',
    author: quote?.author ?? '',
    note: quote?.note ?? '',
    isPinned: quote?.isPinned ?? false,
  }
}

function QuoteForm({ values, onChange, onSubmit, onCancel, isSubmitting, submitLabel, isEditing }) {
  return (
    <form onSubmit={onSubmit} className={`${ui.panelStrong} space-y-5 px-4 py-5 sm:px-5`}>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-text-soft)]">
          {isEditing ? 'Edit keepsake' : 'Save a line'}
        </p>
        <h2 className="mt-1 font-serif text-3xl text-[var(--color-heading)]">
          {isEditing ? 'Refine this quote' : 'Start your quote vault'}
        </h2>
        <p className="mt-2 text-sm leading-6 text-[var(--color-text-soft)]">
          Keep the words that steady you, soften you, or make something click again when you read them back.
        </p>
      </div>

      <label className={`block space-y-2 ${ui.fieldLabel}`}>
        <span>Quote</span>
        <textarea
          required
          name="quoteText"
          rows="4"
          value={values.quoteText}
          onChange={onChange}
          placeholder="Write the quote that hit you here."
          className={ui.fieldTextarea}
        />
      </label>

      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto]">
        <label className={`space-y-2 ${ui.fieldLabel}`}>
          <span>Author or source</span>
          <input
            type="text"
            name="author"
            value={values.author}
            onChange={onChange}
            placeholder="Optional"
            className={ui.fieldInput}
          />
        </label>

        <label className="flex items-end">
          <span className="inline-flex w-full items-center gap-3 rounded-[1.35rem] border border-[var(--color-border)] bg-[var(--color-bg-soft)] px-4 py-3.5 text-sm text-[var(--color-heading)] shadow-sm">
            <input
              type="checkbox"
              name="isPinned"
              checked={values.isPinned}
              onChange={onChange}
              className="h-4 w-4 rounded border-[var(--color-border-strong)] text-[var(--color-primary)] focus:ring-[var(--color-accent)]"
            />
            Pin this quote
          </span>
        </label>
      </div>

      <label className={`block space-y-2 ${ui.fieldLabel}`}>
        <span>Why it matters to me</span>
        <textarea
          name="note"
          rows="4"
          value={values.note}
          onChange={onChange}
          placeholder="Optional. What does this line remind you of, or why do you want to keep it close?"
          className={ui.fieldTextarea}
        />
      </label>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <p className="max-w-md text-sm leading-6 text-[var(--color-text-soft)]">
          Pinned quotes stay at the top so the lines you need most are always easy to find again.
        </p>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          {isEditing ? (
            <button type="button" onClick={onCancel} className={`${ui.buttonSecondary} w-full sm:w-auto`}>
              Cancel
            </button>
          ) : null}
          <button type="submit" disabled={isSubmitting} className={`${ui.buttonPrimary} w-full sm:w-auto`}>
            {isSubmitting ? 'Saving...' : submitLabel}
          </button>
        </div>
      </div>
    </form>
  )
}

function QuoteCard({ quote, onEdit, onDelete, onTogglePin, isSubmittingId }) {
  return (
    <article className="group relative overflow-visible px-1 pb-1 pt-5 transition duration-300 hover:-translate-y-1">
      <div
        className="absolute left-1/2 top-0 z-20 h-5 w-[4.8rem] -translate-x-1/2 rounded-[0.22rem] border shadow-sm"
        aria-hidden="true"
        style={{
          backgroundColor: quote.isPinned
            ? 'color-mix(in srgb, var(--color-primary) 14%, white)'
            : 'color-mix(in srgb, var(--color-accent) 10%, white)',
          borderColor: 'color-mix(in srgb, var(--color-paper-border) 52%, transparent)',
          transform: `translateX(-50%) rotate(${quote.isPinned ? '-2.2deg' : '2deg'})`,
        }}
      />

      <div className="rounded-[1.15rem] border border-[var(--color-paper-border)] bg-[var(--color-paper-strong)] p-4 shadow-paper">
        <div className="flex items-start justify-between gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--color-border)_84%,white)] bg-[color-mix(in_srgb,var(--color-bg-soft)_72%,white)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-text-soft)]">
            <Quote className="h-3.5 w-3.5 text-[var(--color-primary)]" strokeWidth={1.9} />
            {quote.isPinned ? 'Pinned line' : 'Saved line'}
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onTogglePin(quote)}
              disabled={isSubmittingId === quote.id}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[var(--color-text-soft)] transition hover:bg-[var(--color-surface-elevated)] hover:text-[var(--color-heading)]"
              aria-label={quote.isPinned ? 'Unpin quote' : 'Pin quote'}
            >
              <Bookmark
                className={`h-4 w-4 ${quote.isPinned ? 'fill-current text-[var(--color-primary)]' : ''}`}
                strokeWidth={1.9}
              />
            </button>
            <button
              type="button"
              onClick={() => onEdit(quote)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[var(--color-text-soft)] transition hover:bg-[var(--color-surface-elevated)] hover:text-[var(--color-heading)]"
              aria-label="Edit quote"
            >
              <PencilLine className="h-4 w-4" strokeWidth={1.9} />
            </button>
            <button
              type="button"
              onClick={() => onDelete(quote)}
              disabled={isSubmittingId === quote.id}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[var(--color-text-soft)] transition hover:bg-[var(--color-danger-soft)] hover:text-[var(--color-danger)]"
              aria-label="Delete quote"
            >
              <Trash2 className="h-4 w-4" strokeWidth={1.9} />
            </button>
          </div>
        </div>

        <blockquote className="mt-4 font-serif text-[1.5rem] leading-[1.3] text-[var(--color-heading)]">
          “{quote.quoteText}”
        </blockquote>

        {quote.author ? (
          <p className="mt-4 text-sm font-medium text-[var(--color-text-soft)]">
            {quote.author}
          </p>
        ) : null}

        {quote.note ? (
          <div className="mt-4 rounded-[1rem] border border-[color-mix(in_srgb,var(--color-border)_84%,white)] bg-[color-mix(in_srgb,var(--color-bg-soft)_72%,white)] px-3 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-text-soft)]">
              Why I kept this
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--color-text-soft)]">
              {quote.note}
            </p>
          </div>
        ) : null}
      </div>
    </article>
  )
}

export function QuotesPage() {
  const toast = useToast()
  const [quotes, setQuotes] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [formValues, setFormValues] = useState(() => getInitialQuoteValues())
  const [editingQuoteId, setEditingQuoteId] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeQuoteId, setActiveQuoteId] = useState('')
  const [isComposerOpen, setIsComposerOpen] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function loadQuotes() {
      setIsLoading(true)
      setErrorMessage('')

      try {
        const records = await getQuotes()

        if (isMounted) {
          setQuotes(records)
          setIsComposerOpen(records.length === 0)
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error.message || 'Unable to load your quote vault right now.')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadQuotes()

    return () => {
      isMounted = false
    }
  }, [])

  const pinnedQuotes = useMemo(
    () => quotes.filter((quote) => quote.isPinned),
    [quotes],
  )

  const otherQuotes = useMemo(
    () => quotes.filter((quote) => !quote.isPinned),
    [quotes],
  )

  function handleChange(event) {
    const { name, value, type, checked } = event.target

    setFormValues((currentValues) => ({
      ...currentValues,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  function resetForm() {
    setFormValues(getInitialQuoteValues())
    setEditingQuoteId('')
    setIsComposerOpen(quotes.length === 0)
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!formValues.quoteText.trim()) {
      setErrorMessage('Add the quote line you want to keep first.')
      return
    }

    setIsSubmitting(true)
    setErrorMessage('')

    try {
      if (editingQuoteId) {
        const updatedQuote = await updateQuote(editingQuoteId, {
          ...formValues,
          sortOrder: Date.now(),
        })
        setQuotes((currentQuotes) => currentQuotes
          .map((quote) => (quote.id === updatedQuote.id ? updatedQuote : quote))
          .sort((quoteA, quoteB) => Number(quoteB.isPinned) - Number(quoteA.isPinned) || quoteB.sortOrder - quoteA.sortOrder))
        toast.success('Quote updated', 'Your keepsake line has been refreshed.')
      } else {
        const createdQuote = await createQuote({
          ...formValues,
          sortOrder: Date.now(),
        })
        setQuotes((currentQuotes) => [createdQuote, ...currentQuotes]
          .sort((quoteA, quoteB) => Number(quoteB.isPinned) - Number(quoteA.isPinned) || quoteB.sortOrder - quoteA.sortOrder))
        toast.success('Quote saved', 'A new line is now tucked into your vault.')
      }

      resetForm()
      setIsComposerOpen(false)
    } catch (error) {
      setErrorMessage(error.message || 'Unable to save this quote right now.')
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleEdit(quote) {
    setEditingQuoteId(quote.id)
    setFormValues(getInitialQuoteValues(quote))
    setErrorMessage('')
    setIsComposerOpen(true)
  }

  async function handleDelete(quote) {
    const confirmed = window.confirm('Delete this saved quote?')

    if (!confirmed) {
      return
    }

    setActiveQuoteId(quote.id)
    setErrorMessage('')

    try {
      await deleteQuote(quote.id)
      setQuotes((currentQuotes) => currentQuotes.filter((currentQuote) => currentQuote.id !== quote.id))
      if (editingQuoteId === quote.id) {
        resetForm()
      }
      toast.info('Quote removed', 'That line has been removed from your vault.')
    } catch (error) {
      setErrorMessage(error.message || 'Unable to delete this quote right now.')
    } finally {
      setActiveQuoteId('')
    }
  }

  async function handleTogglePin(quote) {
    setActiveQuoteId(quote.id)
    setErrorMessage('')

    try {
      const updatedQuote = await updateQuote(quote.id, {
        quoteText: quote.quoteText,
        author: quote.author,
        note: quote.note,
        isPinned: !quote.isPinned,
        sortOrder: Date.now(),
      })
      setQuotes((currentQuotes) => currentQuotes
        .map((currentQuote) => (currentQuote.id === updatedQuote.id ? updatedQuote : currentQuote))
        .sort((quoteA, quoteB) => Number(quoteB.isPinned) - Number(quoteA.isPinned) || quoteB.sortOrder - quoteA.sortOrder))
      toast.success(
        updatedQuote.isPinned ? 'Quote pinned' : 'Quote unpinned',
        updatedQuote.isPinned
          ? 'This line will stay near the top of your vault.'
          : 'This line will move back into your saved stack.',
      )
      if (editingQuoteId === updatedQuote.id) {
        setFormValues(getInitialQuoteValues(updatedQuote))
      }
    } catch (error) {
      setErrorMessage(error.message || 'Unable to update this quote right now.')
    } finally {
      setActiveQuoteId('')
    }
  }

  return (
    <AppShell>
      <div className={ui.pageContainer}>
        <PageHeader
          eyebrow="Quote vault"
          title="Words to keep close"
          description="A drawer for the lines that steady you, soften you, or keep finding their way back to your heart."
          action={(
            <div className="flex flex-col items-stretch gap-3 sm:items-end">
              <div className="rounded-[1.4rem] border border-[color-mix(in_srgb,var(--color-primary)_18%,var(--color-border))] bg-paper-note px-4 py-3 text-sm text-[var(--color-info)] shadow-paper">
                {quotes.length === 0 ? 'Ready for your first saved line' : `${quotes.length} saved ${quotes.length === 1 ? 'quote' : 'quotes'}`}
              </div>
              {quotes.length > 0 ? (
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage('')
                    setEditingQuoteId('')
                    setFormValues(getInitialQuoteValues())
                    setIsComposerOpen((currentValue) => !currentValue)
                  }}
                  className={`${ui.buttonPrimary} w-full sm:w-auto`}
                >
                  {isComposerOpen ? 'Hide quote panel' : 'Add new quote'}
                </button>
              ) : null}
            </div>
          )}
        />

        {errorMessage ? (
          <div className={ui.errorPanel}>
            {errorMessage}
          </div>
        ) : null}

        {quotes.length === 0 || isComposerOpen || editingQuoteId ? (
          <QuoteForm
            values={formValues}
            onChange={handleChange}
            onSubmit={handleSubmit}
            onCancel={resetForm}
            isSubmitting={isSubmitting}
            submitLabel={editingQuoteId ? 'Save quote' : 'Add to vault'}
            isEditing={Boolean(editingQuoteId)}
          />
        ) : (
          <section className={`${ui.panelStrong} overflow-hidden px-4 py-4 sm:px-5`}>
            <button
              type="button"
              onClick={() => setIsComposerOpen(true)}
              className="flex w-full items-center justify-between gap-3 text-left"
            >
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-text-soft)]">
                  Start your quote vault
                </p>
                <h2 className="mt-1 font-serif text-2xl text-[var(--color-heading)]">
                  Save another line to keep close
                </h2>
                <p className="mt-2 text-sm leading-6 text-[var(--color-text-soft)]">
                  Open the panel when a new quote finds you and you want to keep it here.
                </p>
              </div>
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface-elevated)] text-[var(--color-text-soft)] shadow-sm">
                <ChevronDown className="h-4 w-4 -rotate-90" strokeWidth={1.9} />
              </span>
            </button>
          </section>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-64 animate-pulse rounded-[1.75rem] bg-[var(--color-card-strong)] shadow-card" />
            ))}
          </div>
        ) : null}

        {!isLoading && quotes.length === 0 ? (
          <EmptyState
            title="Start your quote vault with one line that stays with you."
            description="Save words that calm you, guide you, or make something click again whenever you reread them."
            action={(
              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-4 py-2 text-sm text-[var(--color-text-soft)] shadow-sm">
                <Sparkles className="h-4 w-4 text-[var(--color-primary)]" strokeWidth={1.9} />
                Your saved lines will appear here.
              </div>
            )}
          />
        ) : null}

        {!isLoading && pinnedQuotes.length > 0 ? (
          <section className={ui.sectionBoard}>
            <div className="relative overflow-hidden pb-4">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[color-mix(in_srgb,var(--color-primary)_14%,white)] to-transparent" />
              <div className="relative">
                <h2
                  className="font-serif text-2xl"
                  style={{ color: 'color-mix(in srgb, var(--color-primary) 66%, var(--color-heading))' }}
                >
                  Pinned lines
                </h2>
                <p className="mt-1 max-w-2xl text-sm leading-6 text-[var(--color-text-soft)]">
                  The words you want easiest to reach when you need them again.
                </p>
                <div
                  className="mt-4 h-px w-full"
                  aria-hidden="true"
                  style={{
                    background: 'linear-gradient(90deg, color-mix(in srgb, var(--color-primary) 34%, var(--color-border-strong)), color-mix(in srgb, var(--color-primary) 12%, transparent) 68%, transparent)',
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {pinnedQuotes.map((quote) => (
                <QuoteCard
                  key={quote.id}
                  quote={quote}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onTogglePin={handleTogglePin}
                  isSubmittingId={activeQuoteId}
                />
              ))}
            </div>
          </section>
        ) : null}

        {!isLoading && otherQuotes.length > 0 ? (
          <section className={ui.sectionBoard}>
            <div className="relative overflow-hidden pb-4">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[color-mix(in_srgb,var(--color-accent)_12%,white)] to-transparent" />
              <div className="relative">
                <h2
                  className="font-serif text-2xl"
                  style={{ color: 'color-mix(in srgb, var(--color-accent) 58%, var(--color-heading))' }}
                >
                  Saved lines
                </h2>
                <p className="mt-1 max-w-2xl text-sm leading-6 text-[var(--color-text-soft)]">
                  A softer stack of words you wanted to keep, even if they are not pinned right now.
                </p>
                <div
                  className="mt-4 h-px w-full"
                  aria-hidden="true"
                  style={{
                    background: 'linear-gradient(90deg, color-mix(in srgb, var(--color-accent) 26%, var(--color-border-strong)), color-mix(in srgb, var(--color-accent) 10%, transparent) 68%, transparent)',
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {otherQuotes.map((quote) => (
                <QuoteCard
                  key={quote.id}
                  quote={quote}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onTogglePin={handleTogglePin}
                  isSubmittingId={activeQuoteId}
                />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </AppShell>
  )
}
