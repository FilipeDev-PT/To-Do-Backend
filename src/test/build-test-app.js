import { buildApp } from '../app.js'
import { makeCreateBoard } from '../modules/boards/application/create-board.js'
import { makeListBoards } from '../modules/boards/application/list-boards.js'
import { makeGetBoard } from '../modules/boards/application/get-board.js'
import { makeUpdateBoard } from '../modules/boards/application/update-board.js'
import { makeDeleteBoard } from '../modules/boards/application/delete-board.js'
import { makeCreateList } from '../modules/boards/application/create-list.js'
import { makeUpdateList } from '../modules/boards/application/update-list.js'
import { makeDeleteList } from '../modules/boards/application/delete-list.js'
import { makeCreateCard } from '../modules/boards/application/create-card.js'
import { makeUpdateCard } from '../modules/boards/application/update-card.js'
import { makeDeleteCard } from '../modules/boards/application/delete-card.js'
import { makeMoveCard } from '../modules/boards/application/move-card.js'
import { createBoardsController } from '../modules/boards/infrastructure/http/boards.controller.js'
import { createEventBus } from './create-event-bus.js'
import { createInMemoryBoardRepository } from './in-memory-board.repository.js'

export async function buildTestApp({ repository, eventBus } = {}) {
  const resolvedRepository = repository ?? createInMemoryBoardRepository()
  const resolvedEventBus = eventBus ?? createEventBus()

  const useCases = {
    createBoard: makeCreateBoard({ repository: resolvedRepository }),
    listBoards: makeListBoards({ repository: resolvedRepository }),
    getBoard: makeGetBoard({ repository: resolvedRepository }),
    updateBoard: makeUpdateBoard({ repository: resolvedRepository }),
    deleteBoard: makeDeleteBoard({ repository: resolvedRepository }),
    createList: makeCreateList({ repository: resolvedRepository }),
    updateList: makeUpdateList({ repository: resolvedRepository }),
    deleteList: makeDeleteList({ repository: resolvedRepository }),
    createCard: makeCreateCard({ repository: resolvedRepository }),
    updateCard: makeUpdateCard({ repository: resolvedRepository }),
    deleteCard: makeDeleteCard({ repository: resolvedRepository }),
    moveCard: makeMoveCard({ repository: resolvedRepository, eventBus: resolvedEventBus }),
  }

  const boardsController = createBoardsController(useCases)
  const app = await buildApp({ boardsController, logger: false })
  await app.ready()

  return {
    app,
    repository: resolvedRepository,
    eventBus: resolvedEventBus,
    useCases,
  }
}
