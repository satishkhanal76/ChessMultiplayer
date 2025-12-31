import { Server } from 'socket.io';
import Socket from '../Chess/js/classes/sockets/Socket.js';
import RoomsManager from './RoomsManager.js';
import RoomGameManager from './RoomGameManager.js';

export default class SocketManager {
    #io; //socket io
    #connectedSockets; //Map of connected sockets


    #roomsManger; //RoomsManager

    #roomGameManagers; //RoomGameManagers


    constructor(server) {     
        this.#io = new Server(server);

        this.#connectedSockets = new Map();
        this.addConnectionEvents();

        this.#roomsManger = new RoomsManager();
        this.#roomGameManagers = new Map();

    }

    addConnectionEvents() {
        this.#io.on(Socket.EVENTS.USER_CONNECTION, (socket) => {
            console.log('A user connected', socket.id);
            this.#connectedSockets.set(socket.id, socket);
            this.addSocketEvents(socket);
        });
    }

    addSocketEvents(socket) {
        // Socket disconnect Event
        socket.on(Socket.EVENTS.USER_DISCONNECTION, () => {
            console.log('A user disconnected', socket.id);
            this.#connectedSockets.delete(socket.id);
            this.#roomsManger.socketDisconnect(socket);
        });

        // Create Room Event
        socket.on(Socket.EVENTS.CREATE_ROOM, () => this.#roomsManger.createRoom(socket));

        // Join Room Event
        socket.on(Socket.EVENTS.JOIN_ROOM, (roomId) => {
            this.#roomsManger.joinRoom(socket, roomId);
            const roomGame = this.#roomGameManagers.get(roomId);
            if(!roomGame) return;
            roomGame.newSocketJoinedRoom(socket);
        });


        // Create Game Event
        socket.on(Socket.EVENTS.CREATE_GAME, (gameData) => {
            const { roomId, variant } = gameData;
            if (this.#roomGameManagers.has(roomId)) return; // Prevent duplicate creation
            const room = this.#roomsManger.getRoom(roomId);
            if (room) {
                const roomGameManager = new RoomGameManager(room, variant);
                this.#roomGameManagers.set(roomId, roomGameManager);
            }
        });

        socket.on(Socket.EVENTS.MOVE_PIECE, (data) => {
            
            const roomGameManager = this.#roomGameManagers.get(data.roomId);

            if (roomGameManager) {
                roomGameManager.movePiece(socket, data);
            }
        });
    }

    getIo() {
        return this.#io;
    }
}