import { useEffect, useState } from 'react'
import { ImagePlus, PencilLine, Trash2 } from 'lucide-react'
import { useBoards } from '../boards/useBoards'
import { AppShell } from '../components/AppShell'
import { PageHeader } from '../components/PageHeader'
import { ThemeOption } from '../components/settings/ThemeOption'
import { useTheme } from '../context/useTheme'
import { useToast } from '../toast/useToast'
import { ui } from '../lib/ui'

export function SettingsPage() {
  const { currentTheme, themes, setTheme } = useTheme()
  const { boards, createBoard, updateBoard, deleteBoard, selectedBoardId, selectBoard } = useBoards()
  const toast = useToast()
  const [boardName, setBoardName] = useState('')
  const [boardEmoji, setBoardEmoji] = useState('✨')
  const [boardDescription, setBoardDescription] = useState('')
  const [boardCoverFile, setBoardCoverFile] = useState(null)
  const [boardCoverPreview, setBoardCoverPreview] = useState('')
  const [isCreatingBoard, setIsCreatingBoard] = useState(false)
  const [boardErrorMessage, setBoardErrorMessage] = useState('')
  const [editingBoardId, setEditingBoardId] = useState('')
  const [editingBoardName, setEditingBoardName] = useState('')
  const [editingBoardEmoji, setEditingBoardEmoji] = useState('✨')
  const [editingBoardDescription, setEditingBoardDescription] = useState('')
  const [editingBoardCoverFile, setEditingBoardCoverFile] = useState(null)
  const [editingBoardCoverPreview, setEditingBoardCoverPreview] = useState('')
  const [removeEditingBoardCover, setRemoveEditingBoardCover] = useState(false)
  const [isSavingBoard, setIsSavingBoard] = useState(false)
  const [isDeletingBoardId, setIsDeletingBoardId] = useState('')
  const isEditingBoard = Boolean(editingBoardId)
  const boardPanelTitle = isEditingBoard ? 'Edit board' : 'Create a board'
  const boardPanelDescription = isEditingBoard
    ? 'Refresh the board name, description, or emoji without losing any of its manifests.'
    : 'Start a new space for a theme, season, or specific life area you want to focus on.'

  useEffect(() => {
    if (!boardCoverFile) {
      return undefined
    }

    const previewUrl = URL.createObjectURL(boardCoverFile)
    setBoardCoverPreview(previewUrl)

    return () => URL.revokeObjectURL(previewUrl)
  }, [boardCoverFile])

  useEffect(() => {
    if (!editingBoardCoverFile) {
      return undefined
    }

    const previewUrl = URL.createObjectURL(editingBoardCoverFile)
    setEditingBoardCoverPreview(previewUrl)

    return () => URL.revokeObjectURL(previewUrl)
  }, [editingBoardCoverFile])

  async function handleCreateBoard(event) {
    event.preventDefault()
    setIsCreatingBoard(true)
    setBoardErrorMessage('')

    try {
      const board = await createBoard({
        name: boardName.trim(),
        emoji: boardEmoji.trim(),
        description: boardDescription.trim(),
        coverImage: boardCoverFile,
        sortOrder: Date.now(),
      })
      setBoardName('')
      setBoardEmoji('✨')
      setBoardDescription('')
      setBoardCoverFile(null)
      setBoardCoverPreview('')
      toast.success('New board created', `"${board.name}" is ready for your next chapter.`)
    } catch (error) {
      setBoardErrorMessage(error.message || 'Unable to create a board right now.')
    } finally {
      setIsCreatingBoard(false)
    }
  }

  function startEditingBoard(board) {
    setEditingBoardId(board.id)
    setEditingBoardName(board.name)
    setEditingBoardEmoji(board.emoji || '✨')
    setEditingBoardDescription(board.description || '')
    setEditingBoardCoverFile(null)
    setEditingBoardCoverPreview(board.coverImageUrl || '')
    setRemoveEditingBoardCover(false)
    setBoardErrorMessage('')
  }

  function stopEditingBoard() {
    setEditingBoardId('')
    setEditingBoardName('')
    setEditingBoardEmoji('✨')
    setEditingBoardDescription('')
    setEditingBoardCoverFile(null)
    setEditingBoardCoverPreview('')
    setRemoveEditingBoardCover(false)
    setBoardErrorMessage('')
  }

  async function handleSaveBoard(event) {
    event.preventDefault()

    if (!editingBoardId) {
      return
    }

    setIsSavingBoard(true)
    setBoardErrorMessage('')

    try {
      const board = await updateBoard(editingBoardId, {
        name: editingBoardName.trim(),
        emoji: editingBoardEmoji.trim(),
        description: editingBoardDescription.trim(),
        coverImage: editingBoardCoverFile,
        removeCoverImage: removeEditingBoardCover,
        sortOrder: Date.now(),
      })
      toast.success('Board updated', `"${board.name}" now feels more like you.`)
      stopEditingBoard()
    } catch (error) {
      setBoardErrorMessage(error.message || 'Unable to update this board right now.')
    } finally {
      setIsSavingBoard(false)
    }
  }

  async function handleDeleteBoard(board) {
    const confirmed = window.confirm(`Delete "${board.name}"? Its manifests will move into another board.`)

    if (!confirmed) {
      return
    }

    setIsDeletingBoardId(board.id)
    setBoardErrorMessage('')

    try {
      await deleteBoard(board.id)
      toast.info('Board removed', `"${board.name}" was deleted and its manifests were moved safely.`)
      if (editingBoardId === board.id) {
        stopEditingBoard()
      }
    } catch (error) {
      setBoardErrorMessage(error.message || 'Unable to delete this board right now.')
    } finally {
      setIsDeletingBoardId('')
    }
  }

  function renderBoardVisual(board, sizeClass = 'h-10 w-10') {
    if (board.coverImageUrl) {
      return (
        <img
          src={board.coverImageUrl}
          alt=""
          className={`${sizeClass} rounded-2xl object-cover shadow-sm`}
        />
      )
    }

    return (
      <span className={`inline-flex ${sizeClass} items-center justify-center rounded-2xl bg-[var(--color-surface-elevated)] text-lg shadow-sm`}>
        {board.emoji || '✨'}
      </span>
    )
  }

  function renderCoverPreview(previewUrl, fallbackEmoji) {
    if (previewUrl) {
      return <img src={previewUrl} alt="" className="h-full w-full object-cover" />
    }

    return (
      <div className="flex h-full w-full items-center justify-center bg-[color-mix(in_srgb,var(--color-surface)_74%,white)] text-4xl">
        {fallbackEmoji || '✨'}
      </div>
    )
  }

  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 sm:gap-8">
        <PageHeader
          eyebrow="Settings"
          title="Choose your board mood"
          description="Switch the app palette instantly. Your selected theme is saved automatically and stays active when you come back."
        />

        <section className={`${ui.panelStrong} p-5 sm:p-7`}>
          <div className="mb-5">
            <h2 className="font-serif text-3xl text-[var(--color-heading)]">
              Theme palette
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--color-text-soft)]">
              Pick the one that best matches how you want Manifest Board to feel today.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {themes.map((theme) => (
              <ThemeOption
                key={theme.id}
                theme={theme}
                isActive={currentTheme.id === theme.id}
                onSelect={setTheme}
              />
            ))}
          </div>
        </section>

        <section className={`${ui.panelStrong} p-5 sm:p-7`}>
          <div className="mb-5">
            <h2 className="font-serif text-3xl text-[var(--color-heading)]">
              Boards
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--color-text-soft)]">
              Split your dreams into dedicated spaces like travel, home, yearly visions, or soft life goals.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3 rounded-[1.35rem] border border-[var(--color-border)] bg-[var(--color-surface-soft)] px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-[var(--color-heading)]">Your boards</p>
                  <p className="mt-1 text-xs leading-5 text-[var(--color-text-soft)]">
                    Select a board to use it, or edit one from the list.
                  </p>
                </div>
                <button type="button" onClick={stopEditingBoard} className={ui.buttonSecondary}>
                  New board
                </button>
              </div>

              {boards.map((board) => (
                <div
                  key={board.id}
                  className={[
                    'rounded-[1.5rem] border px-4 py-4 text-left transition duration-200',
                    selectedBoardId === board.id
                      ? 'border-[var(--color-primary)] bg-[color-mix(in_srgb,var(--color-primary)_10%,white)] shadow-paper'
                      : 'border-[var(--color-border)] bg-[var(--color-bg-soft)]',
                  ].join(' ')}
                >
                  <div className="flex items-start justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => selectBoard(board.id)}
                      className="min-w-0 flex-1 text-left"
                    >
                      <div className="flex items-center gap-3">
                        {renderBoardVisual(board)}
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-[var(--color-heading)]">{board.name}</p>
                          {board.description ? (
                            <p className="mt-1 text-sm leading-6 text-[var(--color-text-soft)]">{board.description}</p>
                          ) : null}
                        </div>
                      </div>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => startEditingBoard(board)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] text-[var(--color-text-soft)] transition hover:text-[var(--color-heading)]"
                        aria-label={`Edit ${board.name}`}
                      >
                        <PencilLine className="h-4 w-4" strokeWidth={1.9} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteBoard(board)}
                        disabled={boards.length <= 1 || isDeletingBoardId === board.id}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--color-danger)]/40 bg-[var(--color-surface-elevated)] text-[var(--color-danger)] transition hover:bg-[var(--color-danger-soft)] disabled:cursor-not-allowed disabled:opacity-45"
                        aria-label={`Delete ${board.name}`}
                      >
                        <Trash2 className="h-4 w-4" strokeWidth={1.9} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:sticky lg:top-4">
              <form
                onSubmit={isEditingBoard ? handleSaveBoard : handleCreateBoard}
                className="space-y-4 rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-bg-soft)] p-4"
              >
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-serif text-2xl text-[var(--color-heading)]">{boardPanelTitle}</h3>
                    {isEditingBoard ? (
                      <span className="inline-flex items-center rounded-full bg-[var(--color-badge-bg)] px-3 py-1 text-xs font-semibold text-[var(--color-badge-text)]">
                        Editing
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[var(--color-text-soft)]">
                    {boardPanelDescription}
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-[6rem_1fr]">
                  <label className={`block space-y-2 ${ui.fieldLabel}`}>
                    <span>Emoji</span>
                    <input
                      type="text"
                      value={isEditingBoard ? editingBoardEmoji : boardEmoji}
                      onChange={(event) => (
                        isEditingBoard
                          ? setEditingBoardEmoji(event.target.value)
                          : setBoardEmoji(event.target.value)
                      )}
                      placeholder="✨"
                      maxLength={4}
                      className={`${ui.fieldInput} text-center text-xl`}
                    />
                  </label>

                  <label className={`block space-y-2 ${ui.fieldLabel}`}>
                    <span>Board name</span>
                    <input
                      required
                      type="text"
                      value={isEditingBoard ? editingBoardName : boardName}
                      onChange={(event) => (
                        isEditingBoard
                          ? setEditingBoardName(event.target.value)
                          : setBoardName(event.target.value)
                      )}
                      placeholder="Travel Board"
                      className={ui.fieldInput}
                    />
                  </label>
                </div>

                <div className="grid gap-4 sm:grid-cols-[12rem_1fr]">
                  <div className="space-y-2">
                    <p className={ui.fieldLabel}>Cover image</p>
                    <div className="overflow-hidden rounded-[1.35rem] border border-[var(--color-border)] bg-[var(--color-paper-strong)] shadow-sm">
                      <div className="aspect-[4/3]">
                        {renderCoverPreview(
                          isEditingBoard ? editingBoardCoverPreview : boardCoverPreview,
                          isEditingBoard ? editingBoardEmoji : boardEmoji,
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className={`block space-y-2 ${ui.fieldLabel}`}>
                      <span>Upload a board cover</span>
                      <label className="flex cursor-pointer items-center justify-center gap-2 rounded-[1.35rem] border border-dashed border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-4 py-4 text-sm font-medium text-[var(--color-text-soft)] transition duration-200 hover:border-[var(--color-border-strong)] hover:text-[var(--color-heading)]">
                        <ImagePlus className="h-4 w-4" strokeWidth={1.9} />
                        <span>Choose cover image</span>
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp,image/avif"
                          className="sr-only"
                          onChange={(event) => {
                            const nextFile = event.target.files?.[0] || null

                            if (isEditingBoard) {
                              setEditingBoardCoverFile(nextFile)
                              setRemoveEditingBoardCover(false)
                              if (!nextFile && !editingBoardCoverPreview) {
                                setEditingBoardCoverPreview('')
                              }
                            } else {
                              setBoardCoverFile(nextFile)
                              if (!nextFile) {
                                setBoardCoverPreview('')
                              }
                            }
                          }}
                        />
                      </label>
                    </div>

                    <p className="text-xs leading-5 text-[var(--color-text-soft)]">
                      A soft photo gives each board its own mood and makes the sidebar feel more personal.
                    </p>

                    {isEditingBoard && editingBoardCoverPreview ? (
                      <label className="inline-flex items-center gap-2 text-sm text-[var(--color-text-soft)]">
                        <input
                          type="checkbox"
                          checked={removeEditingBoardCover}
                          onChange={(event) => {
                            const shouldRemove = event.target.checked
                            setRemoveEditingBoardCover(shouldRemove)
                            if (shouldRemove) {
                              setEditingBoardCoverFile(null)
                              setEditingBoardCoverPreview('')
                            } else if (!editingBoardCoverFile) {
                              const currentBoard = boards.find((board) => board.id === editingBoardId)
                              setEditingBoardCoverPreview(currentBoard?.coverImageUrl || '')
                            }
                          }}
                          className="h-4 w-4 rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-accent)]"
                        />
                        <span>Remove current cover</span>
                      </label>
                    ) : null}
                  </div>
                </div>

                <label className={`block space-y-2 ${ui.fieldLabel}`}>
                  <span>Description</span>
                  <textarea
                    rows="4"
                    value={isEditingBoard ? editingBoardDescription : boardDescription}
                    onChange={(event) => (
                      isEditingBoard
                        ? setEditingBoardDescription(event.target.value)
                        : setBoardDescription(event.target.value)
                    )}
                    placeholder="Slow mornings, dream trips, and places I want to remember before I even arrive."
                    className={ui.fieldTextarea}
                  />
                </label>

                {boardErrorMessage ? (
                  <div className={ui.errorPanel}>
                    {boardErrorMessage}
                  </div>
                ) : null}

                <div className="flex flex-wrap gap-3">
                  <button
                    type="submit"
                    disabled={isEditingBoard ? isSavingBoard : isCreatingBoard}
                    className={ui.buttonPrimary}
                  >
                    {isEditingBoard
                      ? (isSavingBoard ? 'Saving...' : 'Save board changes')
                      : (isCreatingBoard ? 'Creating...' : 'Create board')}
                  </button>
                  {isEditingBoard ? (
                    <button type="button" onClick={stopEditingBoard} className={ui.buttonSecondary}>
                      Cancel
                    </button>
                  ) : null}
                </div>
              </form>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  )
}
