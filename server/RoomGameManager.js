import { Piece } from '../Chess/js/classes/pieces/Piece.js';
import ClassicalVariant from '../Chess/js/classes/variants/ClassicalVariant.js';
import TwoQueenVariant from '../Chess/js/classes/variants/TwoQueenVariant.js';
import Move from '../Chess/js/classes/Move.js';
import Socket from '../Chess/js/classes/sockets/Socket.js';
import FileRankFactory from '../Chess/js/classes/FileRankFactory.js';
import { Game } from '../Chess/js/classes/Game.js';
import { Player } from '../Chess/js/classes/players/Player.js';

export default class RoomGameManager {

    #room;
    #game;

    #socketAndColourMap;

    #remainingColours;

    constructor(room, variant) {
        this.#room = room;
        this.#socketAndColourMap = new Map();

        this.#remainingColours = [Piece.COLOUR.WHITE, Piece.COLOUR.BLACK];

        this.setSocketColour(this.#room.getRoomCreator(), this.#remainingColours.shift());
        
        this.createGame(variant);

        this.emitGameCreatedEvent(this.#room.getRoomCreator());

        this.addListeners();


    }
    
    emitGameCreatedEvent(socket) {
        socket.emit(Socket.EVENTS.GAME_CREATED, { 
            message: "Game Created",
            colour: this.#socketAndColourMap.get(socket.id) || null
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
        if(remainingColour)
        this.setSocketColour(socket, remainingColour);
        
        this.emitGameCreatedEvent(socket);
    }

    createGame(variant = null) {
        this.#game = new Game(RoomGameManager.getGameVariantObject(variant));

        this.#game.addPlayer(new Player(Piece.COLOUR.WHITE));
        this.#game.addPlayer(new Player(Piece.COLOUR.BLACK));
    }


    static getGameVariantObject(variant) {
        switch(variant) {
            case "two-queen":
                return new TwoQueenVariant();
                break;
            default:
                return new ClassicalVariant();
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