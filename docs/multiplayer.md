# Multiplayer Architecture

The multiplayer system uses **Socket.IO** to maintain real-time communication between players and a Node.js server.

The server maintains the authoritative state of each active game while clients act primarily as interfaces to that state.

## Room-Based Games

Each multiplayer game exists inside a room.

A simplified representation is:

```text
Room
├── Player 1
├── Player 2
└── Game
```

Rooms are managed in memory by the server.

A player can create a room and receive a room code. Another player can use that code to join the same room.

Once both players are connected, the server creates the corresponding game.

## Server Components

The multiplayer server is divided into several classes.

### `SocketManager`

`SocketManager` is responsible for the Socket.IO layer.

It handles incoming connections and routes events related to:

- Room creation
- Room joining
- Game creation
- Moves
- Disconnects

It acts as the bridge between Socket.IO and the multiplayer domain logic.

### `RoomsManager`

`RoomsManager` maintains the collection of currently active rooms.

Its responsibilities include:

- Creating rooms
- Finding rooms
- Removing rooms
- Managing the lifetime of rooms

Rooms are currently stored in memory.

### `Room`

A `Room` represents a single multiplayer session.

It keeps track of the sockets associated with the room and provides the functionality required to communicate with players inside it.

A room is designed around two active players:

```text
Room
├── White
└── Black
```

### `RoomGameManager`

`RoomGameManager` connects the multiplayer room to the Chess engine.

It is responsible for coordinating:

- The server-side game
- Player assignments
- Move requests
- Move validation
- Game events
- Broadcasting accepted moves

The actual chess rules remain inside the Chess engine.

---

## Creating a Game

The general lifecycle of an online game is:

```text
1. Player creates room
          │
          ▼
2. Server generates room
          │
          ▼
3. Second player joins
          │
          ▼
4. Players are assigned sides
          │
          ▼
5. Server creates Chess game
          │
          ▼
6. Players exchange moves
          │
          ▼
7. Server validates moves
          │
          ▼
8. Valid moves are broadcast
```

## Move Lifecycle

A move originates on one client's board.

```text
Player
  │
  │ Move
  ▼
Client
  │
  │ Socket.IO event
  ▼
Server
  │
  ├── Is the player in this game?
  │
  ├── Is it this player's turn?
  │
  └── Is the move legal?
  │
  ▼
Chess Engine
  │
  │ Valid
  ▼
Game State Updated
  │
  ▼
Room Broadcast
  │
  ├──────────────► Player 1
  │
  └──────────────► Player 2
```

The server therefore prevents a client from simply declaring that a move happened.

The move must pass through the server's game instance before being accepted.

---

## Server Authority

The server is the authoritative source of game state during multiplayer games.

This is important because a client cannot be trusted to determine the outcome of an online game by itself.

For example, a client should not be able to:

```text
Client → "I moved this piece."
```

and have the server immediately tell every other client that the move happened.

Instead, the server processes the request through the game engine:

```text
Client
  │
  ▼
Move Request
  │
  ▼
Server
  │
  ▼
Chess Engine
  │
  ├── Invalid → Reject
  │
  └── Valid
        │
        ▼
   Update Game
        │
        ▼
     Broadcast
```

This also means that the multiplayer server and local game can share the same underlying rule implementation.

---

## Socket.IO

Socket.IO provides the real-time communication layer.

The application uses events for actions such as:

- Creating rooms
- Joining rooms
- Creating games
- Sending moves
- Reporting invalid moves
- Notifying clients when players leave

The exact event names and implementation are maintained in `SocketManager` and the associated room/game classes.

For a detailed reference of the current event flow, see the source code in:

```text
server/SocketManager.js
server/Room.js
server/RoomsManager.js
server/RoomGameManager.js
```

---

## Room Lifecycle

Rooms currently exist only in server memory.

A typical lifecycle is:

```text
              Create
                │
                ▼
        ┌───────────────┐
        │     Room      │
        │               │
        │   Player 1    │
        └───────┬───────┘
                │
             Join
                │
                ▼
        ┌───────────────┐
        │     Room      │
        │               │
        │   Player 1    │
        │   Player 2    │
        └───────┬───────┘
                │
          Game running
                │
        ┌───────┴───────┐
        │               │
     Player leaves   Player leaves
        │               │
        └───────┬───────┘
                ▼
          Room removed
```

Because room state is currently in memory, restarting the server removes all active rooms and games.

Persistent games would require an additional persistence layer.

---

## Future Multiplayer Extensions

The current architecture provides a foundation for features such as:

### Spectators

Additional sockets could join a room without being assigned a player.

### Matchmaking

A matchmaking layer could create rooms automatically rather than requiring players to exchange room codes.

### Persistent Games

A database could be introduced to store completed games and player history.

### Timers

A server-side clock could be associated with each game so that time cannot be manipulated by individual clients.

### Authentication

Player accounts could be added independently of the underlying Chess engine.

These features can be built around the existing room/game architecture without requiring the chess rules themselves to be rewritten.