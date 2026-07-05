# Chess.io

A production-oriented real-time multiplayer chess platform built with modern TypeScript technologies.

Chess.io demonstrates how to build a scalable real-time application by separating concerns into independent services for the frontend, REST API, WebSocket gateway, and shared packages. The project focuses on clean architecture, strong typing, low-latency communication, and maintainability.

---

# Features

- Real-time multiplayer chess using WebSockets
- Server-side move validation using `chess.js`
- Persistent game history stored in MongoDB
- User authentication and profile management
- Game replay support
- Resignation and game-over handling
- Shared TypeScript types across frontend and backend
- Monorepo powered by pnpm Workspaces and Turborepo
- Modular service-oriented backend architecture

---

# Tech Stack

## Frontend

- React
- TypeScript
- Vite
- Tailwind CSS

## Backend

- Node.js
- Express
- WebSocket (`ws`)
- MongoDB
- Mongoose

## Shared Infrastructure

- pnpm Workspaces
- Turborepo
- TypeScript Project References

---

# Repository Structure

```text
Chess.io/

apps/
├── api-service/          REST API
├── ws-service/           WebSocket Gateway
└── web-client/           React Frontend

packages/
└── shared-types/         Shared request/response & websocket types
```

---

# Architecture

```text
                 React Client
                       │
         ┌─────────────┴─────────────┐
         │                           │
         ▼                           ▼
 REST API (Express)          WebSocket Gateway
         │                           │
         └─────────────┬─────────────┘
                       │
                 MongoDB Database
```

### API Service

Responsible for:

- Authentication
- User profiles
- Game persistence
- Move persistence
- Match history

### WebSocket Service

Responsible for:

- Matchmaking
- Live gameplay
- Move synchronization
- Game state management
- Real-time signaling

### Shared Types

A dedicated package contains:

- API request types
- API response types
- WebSocket message types

This guarantees type safety across every application in the monorepo.

---

# Game Flow

1. Two players connect to the WebSocket server.
2. The matchmaking service pairs waiting players.
3. A new game is created through the REST API.
4. Players exchange moves over WebSockets.
5. Every move is validated on the server.
6. Valid moves are persisted to MongoDB.
7. Opponents receive updates instantly.
8. When the game finishes, the result is stored and both clients are notified.

---

# Project Structure

```text
apps/

api-service/
├── controllers/
├── models/
├── repositories/
├── routes/
├── middleware/
└── server.ts

ws-service/
├── core/
├── services/
├── repositories/
├── websocket/
└── server.ts

web-client/
├── components/
├── pages/
├── hooks/
├── services/
└── utils/

packages/

shared-types/
└── src/
```

---

# Environment Variables

## API Service

```env
PORT=3000
MONGODB_URL=
CLIENT_URL=
JWTSECRET_KEY=
MAILER_AUTH_USER=
MAILER_AUTH_PASS=
NODE_ENV=
ACCESS_TOKEN_EXPIRY=1h
REFRESH_TOKEN_EXPIRY=1d
```

## WebSocket Service

```env
PORT=8080
API_URL=http://localhost:3000/api
```

## Web Client

```env
VITE_OAUTH_CLIENT_ID=
VITE_OAUTH_CLIENT_SECRET=
VITE_API_URL=http://localhost:3000/api
VITE_SOCKET_URL=ws://localhost:8080
```

---

# Running Locally

Clone the repository

```bash
git clone https://github.com/<username>/Chess.io.git

cd Chess.io
```

Install dependencies

```bash
pnpm install
```

Run every application

```bash
pnpm dev
```

Or run individual services

```bash
pnpm --filter api-service dev

pnpm --filter ws-service dev

pnpm --filter web-client dev
```

---

# Build

Build every workspace

```bash
pnpm build
```

Build a single application

```bash
pnpm --filter api-service build
```

---

# Monorepo

The repository uses **pnpm Workspaces** and **Turborepo**.

Benefits include:

- Shared dependencies
- Incremental builds
- Cached builds
- Shared TypeScript packages
- Consistent tooling across every application

---

# Current Capabilities

- User authentication
- Player matchmaking
- Real-time gameplay
- Move validation
- Persistent game storage
- User profiles
- Match history
- Game replay
- Shared type-safe API contracts

---

# Planned Improvements

- Chess clocks
- Spectator mode
- Draw offers
- ELO rating system
- Reconnection support
- Matchmaking queues
- Friend system
- Puzzle mode
- Tournament support
- Redis for distributed matchmaking
- Docker deployment
- Kubernetes deployment
- CI/CD pipeline
- Horizontal WebSocket scaling

---

# Learning Objectives

This project explores:

- Real-time distributed systems
- WebSocket architecture
- Service-oriented backend design
- Type-safe APIs
- Monorepo development
- Backend scalability
- Production-ready TypeScript
- Database modeling
- Event-driven programming

---

# License

This project is licensed under the MIT License.
