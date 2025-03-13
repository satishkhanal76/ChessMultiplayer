import Socket from "../Chess/js/classes/sockets/Socket.js";
import Room from "./Room.js";

export default class RoomsManager {
    #rooms;

    constructor() {
        this.#rooms = new Map();
    }

    createRoom(socket) {
        const room = new Room(socket);
        this.#rooms.set(room.getRoomId(), room);
        socket.emit(Socket.EVENTS.ROOM_JOIN_SUCCESS, { roomId: room.getRoomId() });
    }

    joinRoom(socket, id) {
        const room = this.#rooms.get(id);
        if (room) {
            room.addSocket(socket);
            return socket.emit(Socket.EVENTS.ROOM_JOIN_SUCCESS, { roomId: room.getRoomId() });
        }
        socket.emit(Socket.EVENTS.ROOM_NOT_FOUND, { message: "Room not found" });
    }

    socketDisconnect(socket) {
        this.#rooms.forEach((room) => {
            if (room.getSocket(socket.id)) {
                room.removeSocket(socket.id);
                if (room.getRoomSize() === 0) {
                    this.deleteRoom(room.getRoomId());
                }
            } 
        });
    }

    getRoom(id) {
        return this.#rooms.get(id);
    }

    getRoomBySocket(socket) {
        let room;
        this.#rooms.forEach((r) => {
            if (r.getSocket(socket.id)) {
                room = r;
            }
        });
        return room;
    }

    deleteRoom(id) {
        this.#rooms.delete(id);
    }
}