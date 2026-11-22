import Socket from "../Chess/js/classes/sockets/Socket.js";
import Room from "./Room.js";

export default class RoomsManager {
    #rooms;
    #roomIdBySocket;

    constructor() {
        this.#rooms = new Map();
        this.#roomIdBySocket = new Map();
    }

    createRoom(socket) {
        const existingRoomId = this.#roomIdBySocket.get(socket.id);
        const existingRoom = existingRoomId && this.#rooms.get(existingRoomId);
        if (existingRoom) {
            socket.emit(Socket.EVENTS.ROOM_JOIN_SUCCESS, { roomId: existingRoomId, isCreator: true });
            return existingRoom;
        }

        const room = new Room(socket);
        this.#rooms.set(room.getRoomId(), room);
        this.#roomIdBySocket.set(socket.id, room.getRoomId());
        socket.emit(Socket.EVENTS.ROOM_JOIN_SUCCESS, { roomId: room.getRoomId(), isCreator: true });
        return room;
    }

    joinRoom(socket, id) {
        const room = this.#rooms.get(id);
        if (!room) {
            socket.emit(Socket.EVENTS.ROOM_NOT_FOUND, { message: "Room not found" });
            return false;
        }

        const currentRoomId = this.#roomIdBySocket.get(socket.id);
        if (currentRoomId && currentRoomId !== id && this.#rooms.has(currentRoomId)) {
            socket.emit(Socket.EVENTS.ROOM_NOT_FOUND, { message: "You are already in a room." });
            return false;
        }

        room.addSocket(socket);
        this.#roomIdBySocket.set(socket.id, room.getRoomId());
        return room;
    }

    socketDisconnect(socket) {
        const roomId = this.#roomIdBySocket.get(socket.id);
        this.#roomIdBySocket.delete(socket.id);
        if (!roomId) return [];

        const room = this.#rooms.get(roomId);
        if (!room) return [];

        // A creator leaving destroys the room and clears its members.
        const memberSocketIds = [...room.getSockets().keys()];
        room.removeSocket(socket.id);
        if (room.getRoomSize() !== 0) return [];

        this.#rooms.delete(roomId);
        memberSocketIds.forEach((id) => this.#roomIdBySocket.delete(id));
        return [roomId];
    }

    getRoom(id) {
        return this.#rooms.get(id);
    }

    getRoomBySocket(socket) {
        const roomId = this.#roomIdBySocket.get(socket.id);
        return roomId ? this.#rooms.get(roomId) : undefined;
    }

    deleteRoom(id) {
        const room = this.#rooms.get(id);
        if (room) {
            room.getSockets().forEach((socket) => this.#roomIdBySocket.delete(socket.id));
        }
        this.#rooms.delete(id);
    }
}
