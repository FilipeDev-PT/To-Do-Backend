/**
 * Port: BoardRepository
 *
 * Contrato que a application layer usa.
 * A implementação concreta vive em infrastructure/persistence.
 *
 * @typedef {object} Board
 * @property {string} id
 * @property {string} title
 * @property {string} [createdAt]
 *
 * @typedef {object} List
 * @property {string} id
 * @property {string} boardId
 * @property {string} title
 * @property {number} position
 *
 * @typedef {object} Card
 * @property {string} id
 * @property {string} listId
 * @property {string} title
 * @property {string} description
 * @property {number} position
 *
 * @typedef {object} BoardDetails
 * @property {string} id
 * @property {string} title
 * @property {string} createdAt
 * @property {Array<List & { cards: Card[] }>} lists
 *
 * @typedef {object} BoardRepository
 * @property {() => Promise<Board[]>} listBoards
 * @property {(id: string) => Promise<BoardDetails | null>} findBoardById
 * @property {(board: Board) => Promise<Board>} saveBoard
 * @property {(board: Board) => Promise<Board>} updateBoard
 * @property {(id: string) => Promise<boolean>} deleteBoard
 * @property {(listId: string) => Promise<(List & { boardId: string }) | null>} findListById
 * @property {(boardId: string) => Promise<number>} countListsByBoard
 * @property {(list: List) => Promise<List>} saveList
 * @property {(list: List) => Promise<List>} updateList
 * @property {(id: string) => Promise<boolean>} deleteList
 * @property {(cardId: string) => Promise<Card | null>} findCardById
 * @property {(listId: string) => Promise<number>} countCardsByList
 * @property {(card: Card) => Promise<Card>} saveCard
 * @property {(card: Card) => Promise<Card>} updateCard
 * @property {(id: string) => Promise<boolean>} deleteCard
 * @property {(input: { cardId: string, fromListId: string, toListId: string, toPosition: number }) => Promise<Card>} moveCard
 */

export {}
