# To-do Backend (Opção A)

Backend estilo Trello enxuto: **boards → lists → cards**, com monólito modular em Node.js (Fastify + Neon Postgres).

Sem auth, membros, comments, labels ou WebSocket.

## Documentação

| Doc | Conteúdo |
|---|---|
| [`docs/uso.md`](./docs/uso.md) | Instalação, scripts, contrato da API, erros, deploy |
| [`docs/tecnica.md`](./docs/tecnica.md) | Arquitetura, domínio, DI, persistência, testes |
| [`docs/estrutura.md`](./docs/estrutura.md) | Mapa pasta/arquivo |

## Setup rápido

```bash
cd To-Do-Backend
npm install
cp .env.example .env   # edite DATABASE_URL
npm run db:create
npm run dev
```

API em `http://localhost:3334` · QA: `https://to-do-backend-c6t5.onrender.com`

## Endpoints (resumo)

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

Smoke: [`routes.http`](./routes.http). Detalhes e exemplos: [`docs/uso.md`](./docs/uso.md).

## Testes

```bash
npm run test
npm run test:watch
npm run test:coverage
```

- Unitários: domain, use cases, schemas Zod, errors, event-bus
- Regressão HTTP: `app.inject()` (sem porta/rede)
- Integração Neon: só com `DATABASE_URL` definido

## Arquitetura (resumo)

`HTTP → routes → schemas (Zod) → controller → use case → domain → repository (Postgres)`

Detalhes em [`docs/tecnica.md`](./docs/tecnica.md).
