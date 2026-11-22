import { Piece } from '../Chess/js/classes/pieces/Piece.js';
import ClassicalVariant from '../Chess/js/classes/variants/ClassicalVariant.js';
import TwoQueenVariant from '../Chess/js/classes/variants/TwoQueenVariant.js';
import FourOFourVariant from '../Chess/js/classes/variants/FourOFourVariant.js';
import Move from '../Chess/js/classes/Move.js';
import Socket from '../Chess/js/classes/sockets/Socket.js';
import FileRankFactory from '../Chess/js/classes/FileRankFactory.js';
import { Game } from '../Chess/js/classes/Game.js';
import { Player } from '../Chess/js/classes/players/Player.js';
import { createClockForTimeControl } from '../Chess/js/classes/clock/TimeControls.js';

export default class RoomGameManager {

    #room;
    #game;

    #socketAndColourMap;

    #remainingColours;
    #settings;
    #started = false;

    constructor(room, settings = {}) {
        this.#room = room;
        this.#settings = {
            variant: ['classical', 'two-queen', '404-variant'].includes(settings.variant) ? settings.variant : 'classical',
            timeControl: ['none', '3+2', '5+0', '10+0', '15+10'].includes(settings.timeControl) ? settings.timeControl : 'none',
        };
        this.#socketAndColourMap = new Map();

        this.#remainingColours = [Piece.COLOUR.WHITE, Piece.COLOUR.BLACK];

        this.setSocketColour(this.#room.getRoomCreator(), this.#remainingColours.shift());
        
        this.createGame(this.#settings.variant);

        this.emitGameCreatedEvent(this.#room.getRoomCreator());

        this.addListeners();


    }
    
    emitGameCreatedEvent(socket) {
        socket.emit(Socket.EVENTS.GAME_CREATED, { 
            message: "Game Created",
            colour: this.#socketAndColourMap.get(socket.id) || null,
            ...this.#settings,
         });
    }

    addListeners() {
        this.#game.moveEventListeners.addListener((event) => {
            this.#room.sendEventToAll(Socket.EVENTS.MOVE_PIECE, {
                from: event.requestedMove.getFrom(),
                to: event.requestedMove.getTo(),
                promotionPieceType: event.requestedMove.getPromotionPieceType(),
                playerColour: event.player.getColour()
            });
        });
    }

    movePiece(socket, data) {
        if (!this.#started) {
            socket.emit(Socket.EVENTS.MOVE_INVALID, { message: "The game has not started yet." });
            return;
        }
        const socketColour = this.#socketAndColourMap.get(socket.id);
        const currentPlayerColour = this.#game.getCurrentPlayer().getColour();

        if(socketColour !== currentPlayerColour) {
            socket.emit(Socket.EVENTS.MOVE_INVALID, {
                message: "Can't move other players piece"
            });
            return;
        }

        const from = FileRankFactory.getFileRank(data.from.col, data.from.row);
        const to = FileRankFactory.getFileRank(data.to.col, data.to.row);

        const move = new Move(from, to, {
            promotionPieceType: data.promotionPieceType
        });
       
        try {
            this.#game.movePiece(move);
        }catch(err) {
            console.log(err);
            socket.emit(Socket.EVENTS.MOVE_INVALID, {
                message: "Invalid Move!"
            })
        }

    }

    newSocketJoinedRoom(socket) {
        const remainingColour = this.#remainingColours.shift();
        if (!remainingColour) return null;
        this.setSocketColour(socket, remainingColour);
        return { colour: remainingColour, ...this.#settings };
    }

    startWhenReady() {
        if (this.#started || this.#room.getRoomSize() !== 2) return false;
        this.#started = true;
        const clock = createClockForTimeControl(this.#settings.timeControl);
        if (clock) this.#game.setClock(clock);
        if (clock) this.#game.startClock();
        this.#room.sendEventToAll(Socket.EVENTS.GAME_STARTED, this.#settings);
        return true;
    }

    createGame(variant = null) {
        this.#game = new Game(RoomGameManager.getGameVariantObject(variant));

        this.#game.addPlayer(new Player(Piece.COLOUR.WHITE));
        this.#game.addPlayer(new Player(Piece.COLOUR.BLACK));
    }


    static getGameVariantObject(variant) {
        switch(variant) {
            case "two-queen":
                return new TwoQueenVariant("two-queen");
                break;
            case "404-variant":
                return new FourOFourVariant("404-variant");
                break;
            default:
                return new ClassicalVariant("classical");
                break;
        }
    }
    

    getRoom() {
        return this.#room;
    }

    getGame() {
        return this.#game;
    }

    setSocketColour(socket, colour) {
        this.#socketAndColourMap.set(socket.id, colour);
    }
}
