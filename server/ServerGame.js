import { Game } from "../Chess/js/classes/Game.js";
import ServerPlayer from "./ServerPlayer.js";

export default class ServerGame extends Game {


    #players;


    constructor(variant) {
        super(variant);
        this.#players = new Map();
    }

    addPlayer(socket, color) {
        const player = new ServerPlayer(color, socket);
        this.#players.set(socket.id, {
            player: player,
            socket: socket
        });

        super.addPlayer(player);
    }
}