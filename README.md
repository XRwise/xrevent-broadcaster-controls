# xrevent-broadcaster-controls

A SvelteKit control panel for managing [LiveKit](https://livekit.io) rooms and broadcasts. Connect as a viewer to monitor rooms, escalate to broadcaster to publish webcam or screen share, and create RTMP/WHIP ingress links for external streaming tools.

## Prerequisites

- Node.js 22+
- Docker (only needed for local LiveKit — Option A below)

## Quick start

### Option A — Local LiveKit (no cloud account needed)

Run a LiveKit server locally via Docker, then start the app:

```bash
cp .env.local.example .env.local
npm run dev:local
```

`npm run dev:local` starts the LiveKit container (detached) and then launches the Vite dev server. The app is available at **http://localhost:5173**.

To stop the LiveKit container when you are done:

```bash
docker compose -f docker-compose.livekit-local.yml down
```

### Option B — Self-hosted or production LiveKit

If you have a LiveKit server (self-hosted or LiveKit Cloud):

```bash
cp .env.example .env.local
# Edit .env.local with your server URL, API key, API secret, and broadcaster identity
npm run dev
```

## Switching environments

Vite loads env files in priority order: `.env.local` → `.env.[mode]` → `.env`. Switching is purely file-based — no code flags, no restarts of the LiveKit server itself:

| Target | `.env.local` content | Dev command |
|---|---|---|
| Local Docker LiveKit | Copy from `.env.local.example` | `npm run dev:local` |
| Self-hosted dev server | Copy from `.env.example`, fill real creds | `npm run dev` |
| Production LiveKit | Delete `.env.local` (falls back to `.env`) | `npm run dev` |

> **Important:** `$env/static/private` vars are baked into the app at Vite startup time, not at runtime. After editing `.env.local` you must restart `npm run dev` — a hot reload is not enough.

## Environment variables

All variables are server-side only (`$env/static/private`). They are never sent to the browser.

| Variable | Purpose | Local dev value |
|---|---|---|
| `LIVEKIT_URL` | WebSocket URL of the LiveKit server | `ws://localhost:7880` ⚠️ |
| `LIVEKIT_API_KEY` | Server SDK authentication key | `devkey` |
| `LIVEKIT_API_SECRET` | Server SDK authentication secret | `secret` |
| `LIVEKIT_BROADCASTING_USER` | Fixed identity used for broadcaster tokens | `local-broadcaster` |

⚠️ Local dev uses `ws://` (plain WebSocket), not `wss://`. The local server has no TLS certificate — using `wss://` will cause a connection error.

## Local LiveKit notes and limitations

The local server (`docker-compose.livekit-local.yml`) runs `livekit/livekit-server --dev`.

**Ports used** (via `network_mode: host` on Linux):
- `7880` — HTTP / WebSocket
- `7881` — TCP (WebRTC)
- `7882/udp` — WebRTC media

**Limitation — ingress route:** The `/api/livekit-ingest-token` endpoint (used for RTMP/WHIP ingress) requires a separate `livekit-ingress` daemon. It **will not work** with this local setup. The other three API routes (room list, viewer token, broadcaster token) work normally.

**macOS / Windows:** `network_mode: host` is Linux-only. On Docker Desktop, edit `docker-compose.livekit-local.yml` and replace `network_mode: host` with explicit port mappings, and add `--node-ip=host.docker.internal` to the command:

```yaml
services:
  livekit:
    image: livekit/livekit-server:latest
    command: --dev --bind 0.0.0.0 --node-ip=host.docker.internal
    ports:
      - "7880:7880"
      - "7881:7881"
      - "7882:7882/udp"
```

## npm scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run dev:local` | Start local LiveKit container then Vite dev server |
| `npm run build` | Production build (adapter-node) |
| `npm run preview` | Preview production build |
| `npm run check` | Type-check with svelte-check |
| `npm run lint` | Check formatting with Prettier |
| `npm run format` | Auto-fix formatting |
| `npm run test` | Run tests once |
| `npm run test:unit` | Run tests in watch mode |

## Production deployment

`docker-compose.yml` deploys the SvelteKit app via adapter-node on port 4173. It reads credentials from `.env`. LiveKit server is expected to be externally hosted (LiveKit Cloud or self-managed).

```bash
cp .env.example .env
# Fill in production credentials
docker compose up -d
```

## Architecture

### Data flow

- `+page.server.ts` fetches the initial room list server-side using `RoomServiceClient` and passes it as `data.rooms` to the page.
- The client (`+page.svelte`) owns a `livekit-client` `Room` instance as Svelte 5 `$state`. It connects as a **viewer** (subscribe-only) on room selection.
- `roomItem.svelte` can escalate to **broadcaster**: it disconnects the viewer room and reconnects with a publish-capable token from `/api/livekitBroadcasterToken`.

### API endpoints

All routes are GET, server-side only.

| Route | Purpose |
|---|---|
| `/api/livekit-rooms` | Lists all LiveKit rooms via `RoomServiceClient` |
| `/api/livekit-token` | Issues viewer JWT (subscribe-only, 10 min TTL). Params: `participantName`, `room` |
| `/api/livekitBroadcasterToken` | Issues broadcaster JWT (`canPublish`, fixed identity). Param: `room` |
| `/api/livekit-ingest-token` | Creates a WHIP ingress via `IngressClient`. Param: `room` |

### Token roles

- **Viewer**: random `Viewer-<guid>` identity, `canPublish: false`
- **Broadcaster**: fixed `LIVEKIT_BROADCASTING_USER` identity, `canPublish: true`. Only proceeds if `numPublishers === 0`.

### Component tree

```
+layout.svelte          # Header bar
+page.svelte            # Owns Room state, token fetching, room selection
  RoomList.svelte       # Left panel: room list + refresh + create room
    roomListItem.svelte # Single room button: name, live indicator, participant count
  roomItem.svelte       # Right panel: video screen, participant list, broadcaster controls
```
