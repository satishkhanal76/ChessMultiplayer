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

// Project-specific 404 (serve 404.html for page-like requests)
app.use((req, res) => {
  const ext = path.extname(req.path);
  const isHtmlLike = ext === '' || ext === '.html';

  if (isHtmlLike) {
    return res.status(404).sendFile(path.join(chessStaticDir, '404.html'));
  }

  // For missing assets (.png/.js/.css/etc.), return a normal 404
  return res.status(404).end();
});

// Create an HTTP server
const server = http.createServer(app);

const socketManager = new SocketManager(server);

const PORT = Number(process.env.SERVER_PORT || 4001);

server.listen(PORT, () => {
  console.log('Server is running on http://localhost:' + PORT);
});