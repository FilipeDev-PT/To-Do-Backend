# Estrutura do projeto to-do

Documentação de cada pasta e arquivo do backend (Opção A — boards/lists/cards).

## Árvore

```
to-do/
├── package.json
├── .env.example
├── .gitignore
├── README.md
├── routes.http
├── create-table.js
├── docs/
│   ├── uso.md
│   ├── tecnica.md
│   └── estrutura.md
└── src/
    ├── server.js
    ├── app.js
    ├── composition-root.js
    ├── shared/
    │   ├── config.js
    │   ├── db.js
    │   ├── errors.js
    │   ├── event-bus.js
    │   └── http/
    │       ├── error-handler.js
    │       └── request-id.js
    └── modules/
        └── boards/
            ├── api/
            │   └── index.js
            ├── domain/
            │   ├── board.js
            │   ├── list.js
            │   ├── card.js
            │   └── ports.js
            ├── application/
            │   ├── create-board.js
            │   ├── list-boards.js
            │   ├── get-board.js
            │   ├── update-board.js
            │   ├── delete-board.js
            │   ├── create-list.js
            │   ├── update-list.js
            │   ├── delete-list.js
            │   ├── create-card.js
            │   ├── update-card.js
            │   ├── delete-card.js
            │   └── move-card.js
            └── infrastructure/
                ├── http/
                │   ├── boards.routes.js
                │   ├── boards.controller.js
                │   └── boards.schemas.js
                └── persistence/
                    └── postgres-board.repository.js
```

## Raiz do projeto `to-do/`

Pasta do backend isolado (não mistura com o CRUD de videos em `04 - Node`).

| Arquivo / pasta | Função |
|---|---|
| `package.json` | Nome do app, `"type": "module"`, dependências e scripts `dev` / `start` / `db:create`. |
| `.env.example` | Modelo de variáveis (`DATABASE_URL`, `PORT`) sem secrets. |
| `.gitignore` | Ignora `node_modules/`, `.env`, logs. |
| `README.md` | Como instalar, criar tabelas, subir o server e testar. |
| `routes.http` | Requests HTTP de exemplo para smoke test manual. |
| `create-table.js` | Cria tabelas `boards`, `lists`, `cards` com FKs, `position` e cascade (`npm run db:create`). |
| `docs/` | Documentação do projeto. |
| `docs/uso.md` | Guia de uso / API. |
| `docs/tecnica.md` | Arquitetura e decisões técnicas. |
| `docs/estrutura.md` | Este mapa. |
| `src/` | Código da aplicação em runtime. |

## `src/` — bootstrap

| Arquivo | Função |
|---|---|
| `src/server.js` | Entrada: config, app, `listen`, graceful shutdown. |
| `src/app.js` | Monta Fastify: CORS, request-id, error handler, rotas boards. Sem regra de negócio. |
| `src/composition-root.js` | Liga os fios: repository → use cases → controller. |

## `src/shared/` — transversal

Não conhece boards/lists/cards.

| Arquivo / pasta | Função |
|---|---|
| `shared/config.js` | Valida env no boot; exporta `{ port, databaseUrl }`. |
| `shared/db.js` | Client Neon (`@neondatabase/serverless`). |
| `shared/errors.js` | `AppError`, `NotFoundError`, `ValidationError`, `DomainError`. |
| `shared/event-bus.js` | Bus in-process (`publish` / `subscribe`). |
| `shared/http/error-handler.js` | Handler global: JSON de erro consistente. |
| `shared/http/request-id.js` | Propaga/gera `x-request-id`. |

## `src/modules/boards/`

Bounded context principal. Outros módulos só importam o que `api/` exporta.

### `api/`

| Arquivo | Função |
|---|---|
| `api/index.js` | API pública do módulo (ex.: evento `CARD_MOVED`). |

### `domain/` — regras puras

Sem Fastify, sem SQL, sem `req`/`res`.

| Arquivo | Função |
|---|---|
| `domain/board.js` | Criar/renomear board; título obrigatório. |
| `domain/list.js` | Criar/atualizar list; título e position. |
| `domain/card.js` | Criar/atualizar card; **`moveCard`**. |
| `domain/ports.js` | Contrato JSDoc do `BoardRepository`. |

### `application/` — use cases

Um arquivo ≈ um caso de uso. Input plain + deps. Sem HTTP.

| Arquivo | Função |
|---|---|
| `create-board.js` | Cria e persiste board. |
| `list-boards.js` | Lista boards (resumo). |
| `get-board.js` | Board + lists + cards ordenados. |
| `update-board.js` | Atualiza título. |
| `delete-board.js` | Remove board (cascade no DB). |
| `create-list.js` | Cria list no board. |
| `update-list.js` | Atualiza list. |
| `delete-list.js` | Remove list. |
| `create-card.js` | Cria card na list. |
| `update-card.js` | Atualiza card. |
| `delete-card.js` | Remove card. |
| `move-card.js` | Move card; publica `CardMoved`. |

### `infrastructure/`

| Arquivo | Função |
|---|---|
| `http/boards.routes.js` | Paths/métodos Fastify. |
| `http/boards.controller.js` | Extrai input, chama use case, status HTTP. |
| `http/boards.schemas.js` | Validação Zod na borda. |
| `persistence/postgres-board.repository.js` | SQL; implementa o port. |

## Quem importa quem

```
server.js → app.js + composition-root.js
app.js → routes → controller → use cases → domain
composition-root → repository concreto injetado nos use cases
repository → shared/db.js
move-card → event-bus
```

Regra: **domain não aponta para infrastructure**.

## Limites

| Pasta | Não deve |
|---|---|
| `domain/` | Importar Fastify, SQL, `process.env`, HTTP. |
| `application/` | Receber `request`/`reply`; montar SQL. |
| `infrastructure/http/` | Regra de negócio ou SQL. |
| `infrastructure/persistence/` | Status HTTP ou validar shape de request. |
| `shared/` | Conhecer board/list/card. |
| `api/` | Reexportar repository ou detalhes de infra. |
