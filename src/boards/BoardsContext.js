import { createContext } from 'react'

export const BoardsContext = createContext({
  boards: [],
  selectedBoardId: '',
  selectedBoard: null,
  isLoadingBoards: true,
  boardErrorMessage: '',
  createBoard: async () => {},
  updateBoard: async () => {},
  deleteBoard: async () => {},
  selectBoard: () => {},
  refreshBoards: async () => {},
})
