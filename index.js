import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import SocketManager from './server/SocketManager.js';

dotenv.configDotenv();

// Initialize Express
const app = express();

app.use(cors());

// Serve static files from the "public" directory
app.use(express.static('Chess'));

// Create an HTTP server
const server = http.createServer(app);

const socketManager = new SocketManager(server);

// Start the server
server.listen(process.env.SERVER_PORT, () => {
    console.log('Server is running on http://localhost:3000');
});