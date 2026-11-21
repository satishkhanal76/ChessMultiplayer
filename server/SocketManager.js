import { Server } from 'socket.io';
import Socket from '../Chess/js/classes/sockets/Socket.js';
import RoomsManager from './RoomsManager.js';
import RoomGameManager from './RoomGameManager.js';

export default class SocketManager {
    #io; //socket io
    #roomsManger; //RoomsManager
    #roomGameManagers; //RoomGameManagers


    constructor(server) {     
        this.#io = new Server(server, {
            // Chess events only carry small room and move payloads.
            maxHttpBufferSize: 16 * 1024,
        });
        this.addConnectionEvents();

        this.#roomsManger = new RoomsManager();
        this.#roomGameManagers = new Map();

    }

    addConnectionEvents() {
        this.#io.on(Socket.EVENTS.USER_CONNECTION, (socket) => {
            console.log('A user connected', socket.id);
            this.addSocketEvents(socket);
        });
    }

    addSocketEvents(socket) {
        // Socket disconnect Event
        socket.on(Socket.EVENTS.USER_DISCONNECTION, () => {
            console.log('A user disconnected', socket.id);
            const destroyedRoomIds = this.#roomsManger.socketDisconnect(socket);
            destroyedRoomIds.forEach((roomId) => this.#roomGameManagers.delete(roomId));
        });

        // Create Room Event
        socket.on(Socket.EVENTS.CREATE_ROOM, () => this.#roomsManger.createRoom(socket));

        // Join Room Event
        socket.on(Socket.EVENTS.JOIN_ROOM, (roomId) => {
            if (typeof roomId !== 'string' || !this.#roomsManger.joinRoom(socket, roomId)) return;
            const roomGame = this.#roomGameManagers.get(roomId);
            if(!roomGame) return;
            roomGame.newSocketJoinedRoom(socket);
        });


        // Create Game Event
        socket.on(Socket.EVENTS.CREATE_GAME, (gameData) => {
            if (!gameData || typeof gameData !== 'object' || typeof gameData.roomId !== 'string') return;
            const { roomId, variant } = gameData;
            if (this.#roomGameManagers.has(roomId)) return; // Prevent duplicate creation
            const room = this.#roomsManger.getRoom(roomId);
            if (room) {
                const roomGameManager = new RoomGameManager(room, variant);
                this.#roomGameManagers.set(roomId, roomGameManager);
            }
        });

        socket.on(Socket.EVENTS.MOVE_PIECE, (data) => {
            if (!data || typeof data.roomId !== 'string' ||
                !data.from || !data.to ||
                !Number.isInteger(data.from.col) || !Number.isInteger(data.from.row) ||
                !Number.isInteger(data.to.col) || !Number.isInteger(data.to.row) ||
                data.from.col < 0 || data.from.col > 7 || data.from.row < 0 || data.from.row > 7 ||
                data.to.col < 0 || data.to.col > 7 || data.to.row < 0 || data.to.row > 7) return;

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
