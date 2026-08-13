export function makeListBoards({ repository }) {
  return async function listBoardsUseCase() {
    return repository.listBoards()
  }
}
