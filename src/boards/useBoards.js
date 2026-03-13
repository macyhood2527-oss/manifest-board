import { useContext } from 'react'
import { BoardsContext } from './BoardsContext'

export function useBoards() {
  return useContext(BoardsContext)
}
