# Documentação técnica — To-Do Backend

Arquitetura, domínio, persistência, DI, HTTP e testes.

Para instalar e consumir a API, veja [`uso.md`](./uso.md). Mapa arquivo-a-arquivo: [`estrutura.md`](./estrutura.md).

## Objetivo e escopo

Monólito modular que expõe CRUD + move de cards para um Kanban mínimo:

```
Board 1—* List 1—* Card
```

Fora de escopo: auth, membros, labels, comments, realtime.

## Stack

| Camada | Tecnologia |
|---|---|
| Runtime | Node.js (ESM) |
| HTTP | Fastify 5 |
| Validação | Zod |
| DB | Neon Postgres (`@neondatabase/serverless`) |
| Testes | Vitest + Fastify `inject()` |

## Arquitetura

Estilo **hexagonal enxuto** / ports & adapters dentro do módulo `boards`.

```
HTTP → routes → Zod schemas → controller → use case → domain → BoardRepository
                                                              ↑
                                                    Postgres (infra)
```

### Camadas

| Camada | Path | Responsabilidade |
|---|---|---|
| Bootstrap | `src/server.js`, `src/app.js`, `src/composition-root.js` | Listen, plugins Fastify, DI |
| Shared | `src/shared/` | Config, DB, errors, event bus, HTTP cross-cuts |
| Domain | `src/modules/boards/domain/` | Factories/updaters puros + port `BoardRepository` |
| Application | `src/modules/boards/application/` | Um use case por arquivo |
| HTTP | `.../infrastructure/http/` | Routes, schemas, controller |
| Persistence | `.../infrastructure/persistence/` | SQL Neon |
| Public API do módulo | `src/modules/boards/api/` | Reexporta o que outros módulos podem usar (`CARD_MOVED`) |

### Regra de dependência

- **Domain** não importa Fastify, SQL, `process.env` nem HTTP.
- **Application** não recebe `request`/`reply` e não monta SQL.
- **Infrastructure/http** não contém regra de negócio nem SQL.
- **Shared** não conhece board/list/card.

## Domínio

Arquivos: `domain/board.js`, `list.js`, `card.js`, `ports.js`.

| Entidade | Campos | Regras principais |
|---|---|---|
| Board | `id`, `title`, `createdAt` | Título obrigatório (trim); UUID via `randomUUID()` |
| List | `id`, `boardId`, `title`, `position` | `position` inteiro ≥ 0 |
| Card | `id`, `listId`, `title`, `description`, `position` | `description` default `""`; move atualiza list + position |

IDs são gerados no domínio (não pelo banco).

**Port** (`ports.js`): contrato JSDoc do repositório (CRUD + `moveCard` + contagens para append de position).

## Application (use cases)

Cada arquivo exporta uma factory `makeX({ repository, eventBus? })`.

| Use case | Notas |
|---|---|
| `create-board` … `delete-board` | CRUD de board |
| `list-boards` / `get-board` | Lista resumo vs detalhe aninhado |
| `create-list` … `delete-list` | Position default = `countListsByBoard` |
| `create-card` … `delete-card` | Position default = `countCardsByList` |
| `move-card` | Valida mesmo board; persiste; publica `CardMoved` |

## Composition root / DI

`src/composition-root.js` — `buildContainer({ repository?, eventBus? })`:

1. Default: Postgres repository + singleton `eventBus`
2. Instancia os 12 use cases
3. Cria `boardsController`
4. Retorna `{ eventBus, repository, useCases, boardsController }`

Produção: `server.js` → `buildContainer()` → `buildApp({ boardsController })`.

Testes: `src/test/build-test-app.js` com `InMemoryBoardRepository` e event bus isolado.

## HTTP

### App (`src/app.js`)

- `@fastify/cors` com `{ origin: true }`
- Plugin `request-id` registrado no app raiz (hooks globais)
- Error handler global
- Rotas do módulo boards + `GET /healthz`
- Logger Fastify ligado por padrão (`logger: false` nos testes)

### Request ID (`shared/http/request-id.js`)

Lê `x-request-id` ou gera UUID; grava em `request.requestId` e no header da resposta.

### Erros (`shared/errors.js` + `error-handler.js`)

| Classe | Status | `code` |
|---|---|---|
| `ValidationError` | 400 | `VALIDATION_ERROR` |
| `NotFoundError` | 404 | `NOT_FOUND` |
| `DomainError` | 422 | `DOMAIN_ERROR` |
| fallback | 500 | `INTERNAL_ERROR` |

Schemas Zod na borda (`boards.schemas.js`) usam `parseOrThrow` → `ValidationError` com `details` (issues Zod).

### Controller / routes

- Routes: mapeamento método/path → handler
- Controller: parse params/body → use case → status (`201` create, `204` delete, etc.)

## Persistência

### Schema (`create-table.js`)

Sem framework de migrations. DDL idempotente:

```sql
boards (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
)

lists (
  id TEXT PRIMARY KEY,
  board_id TEXT NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0
)

cards (
  id TEXT PRIMARY KEY,
  list_id TEXT NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  position INTEGER NOT NULL DEFAULT 0
)
```

### Repository (`postgres-board.repository.js`)

- Mapeia `snake_case` ↔ camelCase
- `moveCard`: fecha gap na list origem e desloca posições na destino
- Usa client Neon de `shared/db.js`

## Event bus

`shared/event-bus.js` — pub/sub in-process (`subscribe` / `publish` com `Promise.all`).

Único evento publicado hoje:

| Evento | Constante | Payload |
|---|---|---|
| `CardMoved` | `CARD_MOVED` (export em `modules/boards/api`) | `{ cardId, fromListId, toListId, position, boardId }` |

Sem subscribers no bootstrap de produção — infraestrutura pronta para reações cross-module.

## Configuração

`shared/config.js` (via `dotenv`):

| Var | Obrigatória | Default |
|---|---|---|
| `DATABASE_URL` | sim | — |
| `PORT` | não | `3334` |

Server escuta em `0.0.0.0`; shutdown graceful em `SIGTERM`/`SIGINT`.

## Estratégia de testes

| Tipo | Onde | Como |
|---|---|---|
| Unitário domínio | `domain/*.test.js` | Funções puras |
| Unitário use cases | `application/use-cases.test.js` | Repo in-memory + event bus |
| Schemas / errors / bus / handler | `*.test.js` em shared e schemas | Isolados |
| Regressão HTTP | `boards.routes.test.js` | `buildTestApp()` + `app.inject()` |
| Integração DB | `postgres-board.repository.test.js` | `describe.skipIf(!DATABASE_URL)` |

Coverage (Vitest): meta **70% lines** em domain/application/shared/http (exclui `src/test/**` e `*.test.js`).

Helpers:

- `src/test/in-memory-board.repository.js`
- `src/test/create-event-bus.js`
- `src/test/build-test-app.js`

## Extensões naturais

1. Subscriber de `CardMoved` (audit, websocket, métricas)
2. Auth / ownership de boards
3. Reordenação de lists com endpoint dedicado
4. Migrations versionadas no lugar de só `CREATE IF NOT EXISTS`

## Referências rápidas

| Concern | Arquivo |
|---|---|
| Entry | `src/server.js` |
| Fastify | `src/app.js` |
| DI | `src/composition-root.js` |
| Rotas | `.../http/boards.routes.js` |
| Schemas | `.../http/boards.schemas.js` |
| DDL | `create-table.js` |
| Smoke HTTP | `routes.http` |
