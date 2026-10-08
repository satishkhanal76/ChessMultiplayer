# Architecture

Chess Multiplayer is designed as a networking layer around the standalone [Chess](https://github.com/satishkhanal76/Chess) game engine.

The goal is to keep the rules and game logic independent from multiplayer functionality so that the same chess implementation can be used for both local and online games.

## High-Level Architecture

```text
                         ┌──────────────────────┐
                         │     Chess Engine     │
                         │                      │
                         │  Board               │
                         │  Pieces              │
                         │  Players             │
                         │  Move Validation     │
                         │  Game Rules          │
                         │  Game Variants       │
                         └──────────┬───────────┘
                                    │
                     ┌──────────────┴──────────────┐
                     │                             │
                     ▼                             ▼
             ┌───────────────┐           ┌────────────────┐
             │ Local Browser │           │ Multiplayer    │
             │               │           │ Server         │
             │ Game runs     │           │                │
             │ entirely      │           │ Authoritative  │
             │ client-side   │           │ game state     │
             └───────────────┘           └───────┬────────┘
                                                  │
                                             Socket.IO
                                                  │
                                      ┌───────────┴───────────┐
                                      │                       │
                                      ▼                       ▼
                                  Player 1                 Player 2
```

## Separation of Responsibilities

The project separates three main concerns.

### 1. Game Logic

The Chess repository contains the actual rules of the game.

This includes concepts such as:

- Boards
- Pieces
- Players
- Legal moves
- Turns
- Check and checkmate
- Stalemate and other game-ending conditions
- Chess variants
- Move validation

The multiplayer server does not reimplement these rules.

### 2. Multiplayer Networking

This repository adds the networking layer required to allow multiple clients to participate in the same game.

It is responsible for:

- Creating rooms
- Joining rooms
- Tracking connected players
- Assigning players to sides
- Synchronizing moves
- Handling disconnections
- Communicating game events through Socket.IO

### 3. Client Interface

The Chess frontend provides the board and user interface.

For a local game, the browser can interact directly with the game engine.

For an online game, the browser communicates with the server through Socket.IO.

---

## Why the Engine Is a Submodule

The `Chess` directory is a Git submodule pointing to the standalone Chess repository.

This allows the game engine to remain an independently usable project while also being consumed by the multiplayer application.

The engine can therefore be:

```text
Chess Repository
       │
       ├── Run independently
       │
       ├── Used for local browser games
       │
       └── Used by ChessMultiplayer
```

This avoids maintaining separate implementations of the same chess rules.

A change to the underlying engine can be developed and tested independently before being incorporated into the multiplayer project by updating the submodule.

---

## Authoritative Multiplayer Model

Local games and multiplayer games have different trust models.

In a local game, the browser can directly operate on the game state because all players are using the same client.

In multiplayer, the browser should not be treated as the authoritative source of game state.

Instead:

```text
Client
  │
  │ Move request
  ▼
Server
  │
  │ Validate through Chess engine
  ▼
Authoritative game state
  │
  │ Valid move
  ▼
Other clients
```

The server receives a move, verifies that the player is allowed to make it, passes it through the chess engine, and only then broadcasts the resulting move.

This provides a single authoritative game state for everyone connected to the room.

---

## Expandability

The architecture is intentionally designed so that new functionality can be added without changing the fundamental relationship between the chess engine and multiplayer layer.

For example, additional functionality could be implemented around the existing engine:

```text
                    Chess Engine
                         │
        ┌────────────────┼────────────────┐
        │                │                │
      Local          Multiplayer          AI
        │                │                │
     Browser          Socket.IO        AI Player
                         │
                  ┌──────┴──────┐
                  │             │
              Spectators     Matchmaking
```

Possible future additions include:

- Additional chess variants
- Chess AI
- Spectator mode
- Matchmaking
- Game persistence
- Timers
- Match history
- Player accounts
- Rankings

The important part is that these systems do not need to own the fundamental chess rules. They can build around the existing engine.

---

## Repository Relationship

```text
Chess
│
│  Core game engine
│
└──────────────┐
               │
               ▼
       ChessMultiplayer
               │
               │ Multiplayer layer
               │
               ├── Express
               ├── Socket.IO
               ├── Rooms
               └── Server-side games
```

The two repositories therefore have different responsibilities:

| Repository | Responsibility |
|---|---|
| `Chess` | Game engine and chess implementation |
| `ChessMultiplayer` | Networking and multiplayer application |

Keeping these responsibilities separate allows the Chess engine to remain useful outside of the multiplayer application.