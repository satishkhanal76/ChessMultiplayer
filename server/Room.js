import { Piece } from "../Chess/js/classes/pieces/Piece.js";
import { Player } from "../Chess/js/classes/players/Player.js";
import Socket from "../Chess/js/classes/sockets/Socket.js";

export default class Room {

    #roomId;
    #sockets;

    #roomCreatorSocket;

    constructor(socket) {
        this.#sockets = new Map();
        this.#roomCreatorSocket = socket;
        this.#sockets.set(socket.id, socket);

        this.#roomId = Math.random().toString(36).substring(7);
    }


    isRoomCreator(socket) {
        return this.#roomCreatorSocket ===
            socket;
    }

    getSocket(id) {
        return this.#sockets.get(id);
    }

    addSocket(socket) {
        this.#sockets.set(socket.id, socket);
    }

    removeSocket(id) {
        //if it is the creator of the room, destroy the room
        if(id === this.#roomCreatorSocket.id) {
            this.sendEventToAllExecpt(this.#roomCreatorSocket, Socket.EVENTS.ROOM_DESTROYED, { message: "Creator left the room!" });
            this.#sockets.clear();
            return;
        }
        this.#sockets.delete(id);
        this.sendEventToAll(Socket.EVENTS.ROOM_PLAYER_LEFT, { message: "A player left the room!" });
    }

    /**
     * Broadcasts an event to all sockets in the room except the one passed as a parameter
     * @param {Socket} socket socket to exclude in the broadcast
     * @param {String} event event name
     * @param {Object} data payload to brodcast
     */
    sendEventToAllExecpt(socket, event, data) {
        this.#sockets.forEach((s) => {
            if(s !== socket) {
                s.emit(event, data);
            }
        });
    }

    sendEventToSocket(socket, event, data) {
        socket.emit(event, data);
    }

    /**
     * Broadcasts an event to all sockets in the room
     * @param {String} event event name
     * @param {Object} data payload to brodcast
     */
    sendEventToAll(event, data) {
        this.#sockets.forEach((socket) => {
            socket.emit(event, data);
        });
    }

    getSockets() {
        return this.#sockets;
    }

    getRoomId() {
        return this.#roomId;
    }

    getRoomSize() {
        return this.#sockets.size;
    }

    getRoomCreator() {
        return this.#roomCreatorSocket
    }
}