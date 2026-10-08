# ♟️ Chess Multiplayer

A real-time multiplayer chess application built with JavaScript, Node.js, Express, and Socket.IO.

Play locally in the browser or online with friends using private game rooms and server-authoritative multiplayer.

### 🌐 Live Demo

Try it here:

**https://satishkhanal.com/chess/**

---

## Features

- ♟️ Classic Chess
- 👑 Two Queen chess variant
- 🌐 Real-time multiplayer using Socket.IO
- 🏠 Private room system
- ⚖️ Server-authoritative game state
- 💻 Local browser play
- 🔄 Shared chess engine between client and server
- 🧩 Expandable architecture for adding new variants and features

---

## Project Philosophy

This project is divided into two layers:

### Chess Engine

The `Chess` directory contains the core chess engine and frontend application.

It is included as a Git submodule and can be cloned independently:

```text
Chess/
```

The engine contains:

- Board logic
- Pieces
- Move validation
- Game rules
- Variants
- Endgame validation
- Frontend rendering

The standalone `Chess` project can run directly in the browser for local play without requiring any backend.

### Multiplayer Layer

This repository adds:

- Express server
- Socket.IO networking
- Room management
- Player synchronization
- Server-side move validation

For online games, the server becomes the authoritative source of truth while still reusing the same chess engine logic.

This avoids duplicating rules between client and server and ensures that all game validation lives in a single place.

---

## Architecture

```text
Chess Engine
        │
        ├── Local Game (Browser Only)
        │
        └── Multiplayer Server
                  │
                  └── Socket.IO Clients
```

Because the game rules are separated from networking, the project is easy to expand with:

- New chess variants
- AI opponents
- Spectator mode
- Match history
- Timers
- Rankings
- Persistence
- Additional multiplayer features

---

## Getting Started

### Clone the repository

This project uses Git submodules.

```bash
git clone --recurse-submodules https://github.com/satishkhanal76/ChessMultiplayer.git
cd ChessMultiplayer
```

If you already cloned without submodules:

```bash
git submodule update --init --recursive
```

### Install dependencies

```bash
npm install
```

### Environment Variables

Create a `.env` file:

```env
SERVER_PORT=3000
```

### Start the server

```bash
npm start
```

Development mode:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

## Related Project

The core chess engine lives in a separate repository:

**Chess**

https://github.com/satishkhanal76/Chess

It can run independently in the browser and serves as the shared game logic for both local and multiplayer gameplay.

---

## Documentation

More technical details can be found in:

```text
docs/
├── architecture.md
├── multiplayer.md
```

---

## License

ISC License

---

## Author

Satish Khanal

GitHub:
https://github.com/satishkhanal76