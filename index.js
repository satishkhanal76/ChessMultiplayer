import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import SocketManager from './server/SocketManager.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.configDotenv();

// Initialize Express
const app = express();

app.use(cors());

const chessStaticDir = path.join(__dirname, 'Chess');
app.use(express.static(chessStaticDir));

// Serve the chess app entry point
app.get('/', (req, res) => {
  res.sendFile(path.join(chessStaticDir, 'index.html'));
});

// Create an HTTP server
const server = http.createServer(app);

const socketManager = new SocketManager(server);

const PORT = Number(process.env.SERVER_PORT || 4001);

server.listen(PORT, () => {
  console.log('Server is running on http://localhost:' + PORT);
});