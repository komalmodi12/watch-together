# WatchTogether: YouTube Watch Party

Watch YouTube videos together, perfectly in sync. Create a room, share the code or link, and everyone in the room sees the same video at the same second. The host decides who can control playback.

**Live app:** https://YOUR-CLIENT-NAME.onrender.com
**Backend health check:** https://YOUR-SERVER-NAME.onrender.com/health

> **Heads up:** the backend runs on Render's free plan. After about 15 minutes without traffic it goes to sleep, so the first connection can take up to a minute. Rooms are kept in memory and are lost when the server sleeps or restarts.

## Features

- **Rooms:** create a room (you become the Host) and join with a 6 character code or a shareable link
- **Real-time sync:** play, pause, seek and change video are identical for everyone, and late joiners start at the right second
- **Roles:** Host, Moderator and Participant. Every permission is checked on the server
- **Host tools:** promote or demote participants, remove people, transfer the host role
- **Approval flow:** a Participant cannot change playback directly. They send a request and the Host or a Moderator approves or rejects it
- **Live chat** with history for people who join late
- Accepts YouTube links in many formats (`watch?v=`, `youtu.be/`, `embed/`, `shorts/`)
- Automatic host hand-over when the host leaves

## Tech stack

| Layer | Technology | Used for |
|---|---|---|
| Frontend | React (Create React App), react-router-dom, CSS Modules | UI, routing, state shared through Context |
| Realtime | Socket.IO (WebSocket with automatic fallback and reconnect) | Two way communication between server and clients |
| Backend | Node.js, Express (ES modules) | HTTP server, room logic, Socket.IO server |
| Video | YouTube IFrame Player API | Embedded, controllable player |
| Storage | In-memory (`Map`) | Rooms, participants, chat history |
| Hosting | Render (Static Site + Web Service) | Public deployment |

## How it works

```
 Browser A (React + YouTube player)             Browser B
        |                                            |
        |  wss:// WebSocket (Socket.IO)              |
        +-----------------+--------------------------+
                          v
        +----------------------------------------------+
        |  Node + Express + Socket.IO (Render Web Svc) |
        |                                              |
        |   socket handlers ---> permission check      |
        |         |                                    |
        |         v                                    |
        |   RoomManager ---> Room ---> Participant     |
        +----------------------------------------------+
```

**The server is the single source of truth.** Clients never talk to each other and never trust each other. They send a request, the server validates it, updates the `Room`, and broadcasts the new state to everyone in that room.

Example: the host presses Pause

1. The client emits `pause` with its current player time.
2. The server reads the user's identity from its own record (`socket.data`), never from the message, and checks that the role is allowed to pause.
3. If not allowed, only that user gets an `error_message`. Nobody else sees anything.
4. If allowed, `Room.pause()` stores the new state and the server emits `sync_state` to the whole room (`io.to(roomId).emit`).
5. Every client moves its YouTube player to match.

### Sync details

- The server stores `currentTime` and the moment it was saved (`updatedAt`). It does not tick every second. When the video is playing, the real position is `currentTime` plus the time elapsed since `updatedAt`.
- Each client estimates the position with its **own** clock (time since it received the message), so server and browser clocks never have to agree.
- YouTube's native controls are hidden and a transparent layer covers the video. The only way to control playback is through our controls, which send requests to the server. This also prevents echo loops, because server updates only call `playVideo`, `pauseVideo` and `seekTo`, which never emit anything back.
- Drift correction: on every `sync_state` the player seeks if it is off by more than 1 second. While playing, a check every 5 seconds seeks if it is off by more than 2 seconds.
- If the browser blocks autoplay, a "Click to join playback" button appears.

## Roles and permissions

| Action | Host | Moderator | Participant |
|---|---|---|---|
| Play, pause, seek, change video | Yes | Yes | Sends a request |
| Approve or reject requests | Yes | Yes | No |
| Assign roles | Yes | No | No |
| Remove participants | Yes | No | No |
| Transfer host | Yes | No | No |
| Chat | Yes | Yes | Yes |

The creator of a room is the Host. Joiners start as Participants. When the Host transfers the role, the old Host becomes a Moderator. When the Host leaves, the server promotes a Moderator first, otherwise the longest-waiting Participant.

## WebSocket events

Events marked with * are extra events added on top of the suggested list.

**Client to server**

| Event | Payload | Who may send |
|---|---|---|
| `create_room` * | `{ username }` | Anyone |
| `join_room` | `{ roomId, username }` | Anyone |
| `leave_room` | none | Anyone in a room |
| `play` / `pause` | `{ currentTime }` | Host, Moderator |
| `seek` | `{ time }` | Host, Moderator |
| `change_video` | `{ videoId }` | Host, Moderator |
| `assign_role` | `{ userId, role }` | Host |
| `remove_participant` | `{ userId }` | Host |
| `transfer_host` * | `{ userId }` | Host |
| `chat_message` * | `{ text }` | Anyone in a room |
| `request_action` * | `{ type, time?, videoId? }` | Participant |
| `resolve_request` * | `{ requestId, approve }` | Host, Moderator |

**Server to client**

| Event | Payload | Sent to |
|---|---|---|
| `sync_state` | `{ videoId, playState, currentTime, serverTime }` | Room |
| `user_joined` | `{ username, userId, role, participants }` | Room, except the joiner |
| `user_left` | `{ username, userId, participants }` | Room |
| `role_assigned` | `{ userId, username, role, participants }` | Room |
| `participant_removed` | `{ userId, username, participants }` | Room, including the removed user |
| `chat_message` * | `{ id, userId, username, text, timestamp }` | Room |
| `chat_history` * | array of messages | The new joiner |
| `approval_requests` * | array of pending requests | Each user gets their own view |
| `request_result` * | `{ type, approved, by }` | The requester |
| `error_message` * | `{ action, message }` | The sender only |

Most client events also use Socket.IO **acknowledgements** (a callback), so the UI gets a direct `{ ok, message }` answer like a normal request and response.

## Project structure

```
watch-party/
├── client/                      React app
│   └── src/
│       ├── context/SocketContext.jsx   one socket, all server events, all actions
│       ├── pages/                      Home, Room
│       ├── components/                 one folder per component
│       ├── utils/                      YouTube URL parser, IFrame API loader, helpers
│       ├── data/mockData.js            sample content for the home page
│       └── styles/                     CSS variables and global styles
└── server/
    └── src/
        ├── index.js                    Express + HTTP + Socket.IO setup
        ├── models/                     Participant, Room (state and rules)
        ├── services/RoomManager.js     all rooms, room codes
        ├── sockets/                    room, playback, role, chat, approval handlers
        └── utils/                      permissions table, validators, helpers
```

## Run locally

Requirements: Node.js 18 or newer.

```bash
# 1. Backend
cd server
npm install
cp .env.example .env        # Windows: copy .env.example .env
npm run dev                 # http://localhost:5000

# 2. Frontend (a second terminal)
cd client
npm install
cp .env.example .env        # Windows: copy .env.example .env
npm start                   # http://localhost:3000
```

Open `http://localhost:3000` in two browser tabs. Each tab is a different user.

Frontend unit tests (YouTube URL parser):

```bash
cd client
npm test -- --watchAll=false
```

## Environment variables

| Where | Variable | Example | Notes |
|---|---|---|---|
| server | `PORT` | `5000` | Render sets this automatically in production |
| server | `CLIENT_URL` | `https://my-app.onrender.com` | Allowed origin for CORS. One or more origins separated by commas, with no trailing slash |
| client | `REACT_APP_SERVER_URL` | `https://my-server.onrender.com` | Backend URL. It is baked into the bundle at **build time**, so changing it needs a rebuild |

## Deployment (Render)

Two services from the same GitHub repository:

| | Backend | Frontend |
|---|---|---|
| Type | Web Service | Static Site |
| Root directory | `server` | `client` |
| Build command | `npm install` | `npm install && npm run build` |
| Start command / publish dir | `npm start` | `build` |
| Environment | `CLIENT_URL` | `REACT_APP_SERVER_URL` |
| Extra | Health check path `/health` | Rewrite rule `/*` to `/index.html` |

The rewrite rule is needed because the app uses client-side routing. Without it, opening or refreshing `/room/ABC123` returns a 404 instead of the app.

Order: deploy the backend first, copy its URL into the frontend's `REACT_APP_SERVER_URL`, deploy the frontend, then copy the frontend URL into the backend's `CLIENT_URL`.

## Design decisions and trade-offs

- **Server as the source of truth** keeps every client consistent and makes cheating impossible. The cost is that every action needs a round trip.
- **Identity is created by the server.** `userId` is generated on join and stored in `socket.data`. Handlers use that record, never a name or id sent by the client, so nobody can act as someone else.
- **One permissions table** (`utils/permissions.js`) maps each action to the roles allowed to do it, and every handler calls the same check first.
- **State is in memory.** It is simple and fast, but rooms are lost on restart and the app runs as a single instance.
- **Native YouTube controls are hidden** so playback can only be changed through the server, at the cost of losing YouTube's own quality and speed menus.
- **Rate limits:** chat is limited per socket (5 messages per 10 seconds) and requests have a 1 second cooldown.

## Known limitations

- Refreshing the page or losing the connection removes you from the room, and you join again as a new user.
- Requests waiting for approval do not expire.
- Some videos cannot be embedded (the owner disabled it). The player shows a message for those.
- Rate limits are per socket, not per IP or account.

## Future improvements

- Horizontal scaling with the Socket.IO Redis adapter and sticky sessions behind a load balancer
- Persistent rooms and chat in a database
- Login, and resuming a session after a refresh
- Emoji reactions
