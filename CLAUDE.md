# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build (adapter-node)
npm run preview      # Preview production build
npm run check        # Type-check with svelte-check
npm run lint         # Check formatting with Prettier
npm run format       # Auto-fix formatting
npm run test         # Run tests once
npm run test:unit    # Run tests in watch mode
```

## Environment

Copy `.env.example` to `.env` and fill in your LiveKit credentials:

```
LIVEKIT_URL="wss://your.livekit.url"
LIVEKIT_API_KEY="..."
LIVEKIT_API_SECRET="..."
LIVEKIT_BROADCASTING_USER="..."   # identity used for broadcaster/ingress tokens
```

These are consumed via SvelteKit's `$env/static/private` — only accessible server-side.

## Architecture

This is a **SvelteKit** app (Svelte 5, adapter-node, TailwindCSS v4) that acts as a control panel for managing LiveKit rooms and broadcasts.

### Data flow

- `+page.server.ts` fetches the initial room list server-side using `RoomServiceClient` and passes it as `data.rooms` (JSON string) to the page.
- The client page (`+page.svelte`) owns a `livekit-client` `Room` instance as Svelte 5 `$state`. It connects as a **viewer** (subscribe-only token) on room selection.
- `RoomItem.svelte` can escalate from viewer to **broadcaster**: it disconnects the viewer room and reconnects with a publish-capable token from `/api/livekitBroadcasterToken`.

### API endpoints (all GET, server-side only)

| Route | Purpose |
|---|---|
| `/api/livekit-rooms` | Lists all LiveKit rooms via `RoomServiceClient` |
| `/api/livekit-token` | Issues a viewer JWT (subscribe-only, 10 min TTL). Params: `participantName`, `room` |
| `/api/livekitBroadcasterToken` | Issues a broadcaster JWT (canPublish, fixed identity from `LIVEKIT_BROADCASTING_USER`). Param: `room` |
| `/api/livekit-ingest-token` | Creates a WHIP ingress via `IngressClient` and returns ingress data. Param: `room` |

### Component tree

```
+layout.svelte          # Header bar only
+page.svelte            # Owns Room state, token fetching, room selection logic
  RoomList.svelte       # Left panel: room list + refresh + create room input
    roomListItem.svelte # Single room button showing name, live indicator, participant count
  roomItem.svelte       # Right panel: video screen, participant list, broadcaster controls
```

State is passed down as props; callbacks (`selectRoom`, `refreshRooms`) are passed up from `+page.svelte`.

### LiveKit token roles

- **Viewer** token: `canPublish: false`, random `Viewer-<guid>` identity
- **Broadcaster** token: `canPublish: true`, fixed identity from `LIVEKIT_BROADCASTING_USER` env var
- The `becomeBroadcaster()` flow in `roomItem.svelte` only proceeds if `numPublishers === 0` (room is not already live)
