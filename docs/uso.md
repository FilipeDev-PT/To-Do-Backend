# Documentação de uso — To-Do Backend

Guia prático para instalar, configurar, subir a API e consumir os endpoints.

## Visão geral

API REST estilo Trello enxuto: **boards → lists → cards**.

| Item | Valor |
|---|---|
| Stack | Node.js, Fastify, Zod, Neon Postgres |
| Porta padrão | `3334` |
| Auth | Nenhuma |
| QA (Render) | `https://to-do-backend-c6t5.onrender.com` |

Sem membros, comments, labels ou WebSocket.

## Pré-requisitos

- Node.js 20+ (recomendado 22)
- Conta/projeto [Neon](https://neon.tech) (ou Postgres compatível) com connection string SSL

## Instalação

```bash
cd To-Do-Backend
npm install
cp .env.example .env
```

Edite `.env`:

```env
DATABASE_URL=postgresql://user:password@host/db?sslmode=require
PORT=3334
```

Crie as tabelas (idempotente):

```bash
npm run db:create
```

## Subir o servidor

```bash
# desenvolvimento (reload com --watch)
npm run dev

# produção / estilo deploy
npm start
```

Health check:

```bash
curl http://localhost:3334/healthz
# {"status":"ok"}
```

Todas as respostas incluem o header `x-request-id` (eco do request ou UUID gerado).

## Scripts

| Script | Descrição |
|---|---|
| `npm run dev` | Sobe a API com watch |
| `npm start` | Sobe a API sem watch |
| `npm run db:create` | Cria tabelas `boards`, `lists`, `cards` |
| `npm run test` | Vitest (unitário + HTTP inject; repo Neon se houver `DATABASE_URL`) |
| `npm run test:watch` | Vitest em modo watch |
| `npm run test:coverage` | Coverage (meta ≥ 70% lines) |

## Fluxo típico de uso da API

1. Criar um board  
2. Criar lists (colunas) no board  
3. Criar cards nas lists  
4. Mover cards entre lists  
5. Atualizar / apagar conforme necessário  

Smoke manual: abra [`../routes.http`](../routes.http) no cliente HTTP do editor.

### Exemplo rápido

```bash
BASE=http://localhost:3334

# 1) Board
curl -s -X POST "$BASE/boards" -H "Content-Type: application/json" \
  -d '{"title":"Sprint"}'

# 2) List (troque :boardId)
curl -s -X POST "$BASE/boards/:boardId/lists" -H "Content-Type: application/json" \
  -d '{"title":"To Do"}'

# 3) Card (troque :listId)
curl -s -X POST "$BASE/lists/:listId/cards" -H "Content-Type: application/json" \
  -d '{"title":"Implementar login","description":""}'

# 4) Board completo
curl -s "$BASE/boards/:boardId"

# 5) Mover card
curl -s -X POST "$BASE/cards/:cardId/move" -H "Content-Type: application/json" \
  -d '{"listId":":targetListId","position":0}'
```

## Contrato dos endpoints

IDs são UUIDs. Bodies JSON. Campos em **camelCase**.

### Health

| Método | Path | Resposta |
|---|---|---|
| `GET` | `/healthz` | `200` `{ "status": "ok" }` |

### Boards

| Método | Path | Body | Sucesso |
|---|---|---|---|
| `POST` | `/boards` | `{ "title": string }` | `201` Board |
| `GET` | `/boards` | — | `200` `Board[]` (mais recentes primeiro) |
| `GET` | `/boards/:boardId` | — | `200` Board + lists + cards |
| `PATCH` | `/boards/:boardId` | `{ "title": string }` | `200` Board |
| `DELETE` | `/boards/:boardId` | — | `204` (cascade lists/cards) |

**Board**

```json
{ "id": "uuid", "title": "string", "createdAt": "ISO-8601" }
```

**Board detalhado** (`GET /boards/:boardId`)

```json
{
  "id": "uuid",
  "title": "string",
  "createdAt": "ISO-8601",
  "lists": [
    {
      "id": "uuid",
      "boardId": "uuid",
      "title": "string",
      "position": 0,
      "cards": [
        {
          "id": "uuid",
          "listId": "uuid",
          "title": "string",
          "description": "string",
          "position": 0
        }
      ]
    }
  ]
}
```

Lists e cards vêm ordenados por `position` ASC.

### Lists

| Método | Path | Body | Sucesso |
|---|---|---|---|
| `POST` | `/boards/:boardId/lists` | `{ "title": string, "position"?: number }` | `201` List |
| `PATCH` | `/lists/:listId` | `{ "title"?: string, "position"?: number }` (≥1 campo) | `200` List |
| `DELETE` | `/lists/:listId` | — | `204` (cascade cards) |

Se `position` for omitido na criação, a list é anexada ao final.

### Cards

| Método | Path | Body | Sucesso |
|---|---|---|---|
| `POST` | `/lists/:listId/cards` | `{ "title": string, "description"?: string, "position"?: number }` | `201` Card |
| `PATCH` | `/cards/:cardId` | `{ "title"?: string, "description"?: string }` (≥1 campo) | `200` Card |
| `DELETE` | `/cards/:cardId` | — | `204` |
| `POST` | `/cards/:cardId/move` | `{ "listId": uuid, "position": number }` | `200` Card |

- `description` omitido na criação → `""`
- `position` omitido na criação → final da list
- Move só é permitido **dentro do mesmo board**; caso contrário `422`

## Erros

Formato comum:

```json
{
  "error": "ValidationError",
  "code": "VALIDATION_ERROR",
  "message": "...",
  "details": []
}
```

| Status | `code` | Quando |
|---|---|---|
| `400` | `VALIDATION_ERROR` | Body/params inválidos (Zod) |
| `404` | `NOT_FOUND` | Board/list/card inexistente |
| `422` | `DOMAIN_ERROR` | Regra de domínio (ex.: move cross-board) |
| `500` | `INTERNAL_ERROR` | Erro inesperado (`message` genérico) |

## CORS

CORS liberado com `origin: true` (reflete o `Origin` do request). O frontend em GitHub Pages ou Vite local consegue chamar a API diretamente.

## Deploy (Render)

A instância de QA está em:

`https://to-do-backend-c6t5.onrender.com`

Na primeira request após idle, o serviço pode ter **cold start** (alguns segundos). Use `/healthz` para “acordar” o serviço antes de fluxos sensíveis (ex.: E2E).

Variáveis no host de deploy: `DATABASE_URL` (obrigatória) e opcionalmente `PORT`.

## Testes (uso rápido)

```bash
npm run test
```

Com `.env` contendo `DATABASE_URL`, a suíte de integração do repositório Postgres também executa.

## Limitações conhecidas

- Sem autenticação / multi-tenant
- Sem reordenação dedicada de lists via DnD na API além de `PATCH` com `position`
- Event bus publica `CardMoved`, mas não há subscribers em produção hoje

Documentação técnica: [`tecnica.md`](./tecnica.md).
