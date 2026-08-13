import { createBoard } from '../domain/board.js'

export function makeCreateBoard({ repository }) {
  return async function createBoardUseCase({ title }) {
    const board = createBoard({ title })
    return repository.saveBoard(board)
  }
}
