import { Player } from "../Chess/js/classes/players/Player.js";

export default class ServerPlayer extends Player {

    #socket;

    constructor(color, socket) {
        super(color);
        this.#socket = socket;
    }

    getSocket() {
        return this.#socket;
    }
}