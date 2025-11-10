## Chess.io — Realtime Chess Server and Web Client

This repository contains a realtime multiplayer chess experience:

- Client (Vite + React + TypeScript + Tailwind) in `Client/`
- Server (Node.js + Express + WebSocket + TypeScript + MongoDB/Mongoose) in `Server/`

The server exposes a REST API for persistence (users, games, moves) and a WebSocket gateway for realtime gameplay and lightweight signaling. Move validation runs in a Worker thread using `chess.js` to keep the event loop responsive under load.


## Key features

- Realtime chess over WebSockets (one game per two connected peers)
- Deterministic server-side move validation with `chess.js` executed in a worker thread
- Game lifecycle: create, add moves, finish (checkmate/stalemate/draw or resignation)
- MongoDB persistence for users, games, and moves
- REST API for authentication, profile, game detail lookups, and game/move writes
- Email notifications (welcome email and OTP template via Nodemailer/Gmail)
- CORS configured to allow a separate frontend origin with credentials


## Architecture overview

- HTTP: Express app mounted on port 3000
	- REST routes under `/api/*`
	- CORS restricted to `CLIENT_URL`
- WebSocket: `ws` server bound to the same HTTP server (port 3000)
	- `GameManager` matches users pairwise and orchestrates a `Game`
	- `Game` coordinates two players, validates moves via Worker, persists via REST
- Worker thread: validates candidate moves with `chess.js` to avoid blocking the main thread
- Persistence: MongoDB via Mongoose (Users, Games, Moves)


## Server folder structure

```
Server/
	package.json
	tsconfig.json
	src/
		index.ts                # Express app + WebSocket server, route wiring
		database.ts             # Mongoose connection
		GameFiles/
			Game.ts               # Orchestrates a chess match between two sockets
			Manager.ts            # Matches users and routes socket messages to a Game
			Messages.ts           # String constants for WS message types
			Worker.ts             # Worker thread entrypoint for move validation
			Types/
				GameTypes.ts        # Shared types for game and players
				WorkerTypes.ts      # Messages exchanged with the worker
			utils/
				AxiosConfig.ts      # Axios instance that calls REST endpoints
		REST/
			routes/               # Express routers (auth, user, game)
			controllers/          # Handlers for the REST routes
			models/               # Mongoose schemas (user, game, move)
			types/                # API request/response TypeScript types
			utils/mailConfig.ts   # Nodemailer transport + email templates
```


## Environment variables

Create `Server/.env` with:

- `MONGODB_URL` — MongoDB connection string
- `CLIENT_URL` — exact origin of the frontend (e.g., `http://localhost:5173` or deployed URL) used by CORS
- `API_URL` — base URL that the game logic (server-side Axios) uses to call REST endpoints, typically `http://localhost:3000/api` in local dev
- `MAILER_AUTH_USER` — Gmail address used by Nodemailer
- `MAILER_AUTH_PASS` — Gmail app password (use an App Password; plain passwords are not supported on most accounts)

Example `.env` (development):

```
MONGODB_URL=mongodb://127.0.0.1:27017/chessio
CLIENT_URL=http://localhost:5173
API_URL=http://localhost:3000/api
MAILER_AUTH_USER=your.email@gmail.com
MAILER_AUTH_PASS=your-app-password
```


## Running locally

1) Install dependencies and start the server

```
cd Server
npm install
npm run dev
```

- The script compiles TypeScript to `dist/` and runs `node dist/index.js`
- HTTP and WebSocket servers listen on port `3000`

2) Run the client (optional, for a full local experience)

```
cd Client
npm install
npm run dev
```

Set `VITE_API_URL` in the client to match the server if needed, and ensure `CLIENT_URL` in the server `.env` matches the client dev origin.


## REST API

Base URL: `${API_URL}` (e.g., `http://localhost:3000/api`)

Auth
- POST `/auth/login`
	- Body: `{ username: string, email: string, photo: string }`
	- Effect: creates the user if not present; sends a welcome email
	- Response: `{ success: boolean, message: string }`

User
- POST `/user/profile`
	- Body: `{ email: string }`
	- Response: `{ success, message, data?: { username, photo, rating, gamesPlayed, gamesWon, games: [...]} }`

- GET `/user/game/:id`
	- Response: `{ success, message, data?: { id, player1, player2, moves: [{from,to,promotion}], winner, reason } }`

Game
- POST `/game/create`
	- Body: `{ player1: string, player2: string }` (usernames)
	- Response: `{ success, message, gameId?: string }`

- POST `/game/move`
	- Body: `{ from: string, to: string, promotion: string, gameId: string }`
	- Response: `{ success, message }`

- POST `/game/over`
	- Body: `{ gameId: string, email: string, reason: string }` (email identifies the winner)
	- Response: `{ success, message }`

Notes
- Unknown routes return `404` JSON: `{ success: false, message: "404 Route not found" }`
- CORS: Only `CLIENT_URL` is allowed, credentials enabled, headers `Content-Type, Authorization`


## WebSocket protocol

Connect to: `ws://<server-host>:3000`

Client → Server messages
- `init_game`
	- Shape: `{ type: "init_game", username: string, email: string }`
	- Behavior: first user is kept pending; when a second user connects and also sends `init_game`, a `Game` is created

- `move`
	- Shape: `{ type: "move", move: { from: string, to: string, promotion?: string } }`
	- Behavior: forwarded to the worker for validation; if valid, persisted and relayed to the opponent

- `player_resign`
	- Shape: `{ type: "player_resign" }`
	- Behavior: marks game over; opponent wins; persisted and both clients notified

- `web_stream`
	- Shape: `{ type: "web_stream", data: any }`
	- Behavior: relayed to the opponent as-is (used as lightweight signaling/data channel)

Server → Client messages
- `init_game`
	- Payload: `{ color: "w" | "b", oppName: string }`

- `move`
	- Payload: `{ from, to, promotion? }` — opponent’s accepted move

- `invalid_move`
	- Payload: `{ reason: string }`

- `game_over`
	- Payload: `{ winner: "w" | "b", reason: string }`


## Data models

User (`REST/models/user.ts`)
- `username: string`
- `email: string` (unique)
- `picture: string`
- `friends: ObjectId[]`
- `games: ObjectId[]` (refs Game)
- `gamesWon: number` (default 0)
- `rating: number` (default 500)

Game (`REST/models/game.ts`)
- `player1: ObjectId` (ref User)
- `player2: ObjectId` (ref User)
- `moves: ObjectId[]` (refs Move)
- `isGameOver: boolean` (default false)
- `winner: ObjectId` (ref User)
- `reason: string`

Move (`REST/models/move.ts`)
- `from: string`
- `to: string`
- `promotion: string` (optional)


## How a game flows

1) Two clients connect via WebSocket and each sends `init_game` `{ username, email }`.
2) `GameManager` pairs the first waiting user with the next; a `Game` is constructed.
3) `Game`:
	 - Assigns colors (first joined gets white), notifies each client with `init_game` payload.
	 - Creates a DB game via REST `POST /game/create`.
	 - On each candidate `move`, posts to the Worker for validation using `chess.js`.
	 - If valid: persists via `POST /game/move` and relays to opponent.
	 - After each move, checks if the game is over (`checkmate`, `stalemate`, or `draw`).
	 - On finish or `player_resign`, persists via `POST /game/over`, notifies both clients with `game_over`, and terminates the worker.


## Development notes

- Build output goes to `Server/dist`. The worker is loaded via `path.join(__dirname, "Worker.js")`, so ensure `Worker.ts` compiles to `dist/GameFiles/Worker.js`.
- Set `API_URL` so the server’s internal Axios client can call its own REST API (e.g., `http://localhost:3000/api`).
- For Gmail: use an App Password with `MAILER_AUTH_PASS` when 2FA is enabled.
- Authentication: `POST /auth/login` currently creates/logs-in users and sends a welcome email. JWT scaffolding is present but not active; you can add token issuance and middleware later if needed.


## Scripts (Server)

`npm run dev`
- Compiles TypeScript (`tsc -b`) and runs `node ./dist/index.js`