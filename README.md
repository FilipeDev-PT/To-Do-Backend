# To-do Backend (Opção A)

Backend estilo Trello enxuto: **boards → lists → cards**, com monólito modular em Node.js (Fastify + Neon Postgres).

Sem auth, membros, comments, labels ou WebSocket.

## Setup

```bash
cd To-Do-Backend
npm install
cp .env.example .env   # se ainda não tiver .env
# edite DATABASE_URL
npm run db:create   # roda create-table.js (boards, lists, cards)
npm run dev
```

API em `http://localhost:3334` (porta padrão).

## Endpoints

| Método | Path | Ação |
|---|---|---|
| GET | `/healthz` | health check |
| POST | `/boards` | criar board |
| GET | `/boards` | listar boards |
| GET | `/boards/:boardId` | board + lists + cards |
| PATCH | `/boards/:boardId` | atualizar título |
| DELETE | `/boards/:boardId` | apagar board |
| POST | `/boards/:boardId/lists` | criar list |
| PATCH | `/lists/:listId` | atualizar list |
| DELETE | `/lists/:listId` | apagar list |
| POST | `/lists/:listId/cards` | criar card |
| PATCH | `/cards/:cardId` | atualizar card |
| DELETE | `/cards/:cardId` | apagar card |
| POST | `/cards/:cardId/move` | mover card `{ listId, position }` |

Use [`routes.http`](./routes.http) para smoke tests manuais.

## Testes

Stack: **Vitest** + Fastify `inject()` (regressão HTTP) + repositório in-memory.

```bash
npm run test
npm run test:watch
npm run test:coverage
```

- Unitários: domain, use cases, schemas Zod, errors, event-bus
- Regressão HTTP: contrato das rotas via `app.inject()` (sem porta/rede)
- Integração Postgres/Neon: roda **somente** se `DATABASE_URL` estiver definido (ex.: via `.env`)

```bash
# com .env contendo DATABASE_URL, a suíte de repository também executa
npm run test
```

## Arquitetura

Veja o mapa completo em [`docs/estrutura.md`](./docs/estrutura.md).

Resumo do fluxo:

`HTTP → routes → schemas (Zod) → controller → use case → domain → repository (Postgres)`
