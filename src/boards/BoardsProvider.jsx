import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  createBoard as createBoardRecord,
  deleteBoard as deleteBoardRecord,
  ensureDefaultBoard,
  getBoards,
  updateBoard as updateBoardRecord,
} from '../lib/boards'
import { assignBoardToUnassignedManifests } from '../lib/manifests'
import { useAuth } from '../context/useAuth'
import { BoardsContext } from './BoardsContext'

const SELECTED_BOARD_STORAGE_KEY = 'manifest-board-selected-board'
const FALLBACK_BOARD = {
  id: 'default-board',
  name: 'My Board',
  emoji: '✨',
  description: 'A gentle board for your dream notes.',
  coverImage: '',
  coverImageUrl: '',
  theme: '',
  sortOrder: 1,
}

function getStoredBoardId() {
  if (typeof window === 'undefined') {
    return ''
  }

  return window.localStorage.getItem(SELECTED_BOARD_STORAGE_KEY) || ''
}

function storeBoardId(boardId) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(SELECTED_BOARD_STORAGE_KEY, boardId)
}

export function BoardsProvider({ children }) {
  const { isAuthenticated, isLoadingAuth } = useAuth()
  const [boards, setBoards] = useState([])
  const [selectedBoardId, setSelectedBoardId] = useState(() => getStoredBoardId())
  const [isLoadingBoards, setIsLoadingBoards] = useState(true)
  const [boardErrorMessage, setBoardErrorMessage] = useState('')

  const selectBoard = useCallback((boardId) => {
    setSelectedBoardId(boardId)
    storeBoardId(boardId)
  }, [])

  const refreshBoards = useCallback(async () => {
    if (!isAuthenticated) {
      setBoards([])
      setSelectedBoardId('')
      setBoardErrorMessage('')
      setIsLoadingBoards(false)
      return
    }

    setIsLoadingBoards(true)
    setBoardErrorMessage('')

    try {
      const { boards: resolvedBoards, defaultBoard } = await ensureDefaultBoard()
      await assignBoardToUnassignedManifests(defaultBoard.id)
      const latestBoards = await getBoards()
      const nextBoards = latestBoards.length > 0 ? latestBoards : resolvedBoards

      setBoards(nextBoards)
      setSelectedBoardId((currentBoardId) => {
        const nextBoardId = nextBoards.some((board) => board.id === currentBoardId)
          ? currentBoardId
          : defaultBoard.id

        storeBoardId(nextBoardId)
        return nextBoardId
      })
    } catch (error) {
      setBoards([FALLBACK_BOARD])
      setSelectedBoardId(FALLBACK_BOARD.id)
      setBoardErrorMessage(error.message || 'Unable to load boards right now.')
    } finally {
      setIsLoadingBoards(false)
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (isLoadingAuth) {
      return
    }

    refreshBoards()
  }, [isLoadingAuth, refreshBoards])

  const createBoard = useCallback(async (values) => {
    const board = await createBoardRecord(values)
    setBoards((currentBoards) => [board, ...currentBoards.filter((item) => item.id !== board.id)])
    selectBoard(board.id)
    return board
  }, [selectBoard])

  const updateBoard = useCallback(async (boardId, values) => {
    const board = await updateBoardRecord(boardId, values)
    setBoards((currentBoards) => currentBoards.map((item) => (item.id === board.id ? board : item)))
    return board
  }, [])

  const deleteBoard = useCallback(async (boardId) => {
    if (boards.length <= 1) {
      throw new Error('You need at least one board in Manifest Board.')
    }

    const fallbackBoard = boards.find((board) => board.id !== boardId)

    if (!fallbackBoard) {
      throw new Error('Unable to find another board for your manifests.')
    }

    await deleteBoardRecord(boardId, fallbackBoard.id)

    const latestBoards = await getBoards()
    setBoards(latestBoards)
    selectBoard(fallbackBoard.id)
  }, [boards, selectBoard])

  const selectedBoard = boards.find((board) => board.id === selectedBoardId) || boards[0] || FALLBACK_BOARD

  const value = useMemo(() => ({
    boards,
    selectedBoardId: selectedBoard?.id || '',
    selectedBoard,
    isLoadingBoards,
    boardErrorMessage,
    createBoard,
    updateBoard,
    deleteBoard,
    selectBoard,
    refreshBoards,
  }), [boards, selectedBoard, isLoadingBoards, boardErrorMessage, createBoard, updateBoard, deleteBoard, selectBoard, refreshBoards])

  return (
    <BoardsContext.Provider value={value}>
      {children}
    </BoardsContext.Provider>
  )
}
