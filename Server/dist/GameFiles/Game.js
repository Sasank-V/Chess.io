"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
const chess_js_1 = require("chess.js");
const Messages_1 = require("./Messages");
class Game {
    constructor(player1, player2) {
        this.player1 = player1;
        this.player2 = player2;
        this.board = new chess_js_1.Chess();
        this.startTime = new Date();
        this.player1.send(JSON.stringify({
            type: Messages_1.INIT_GAME,
            payload: {
                color: "w",
            }
        }));
        this.player2.send(JSON.stringify({
            type: Messages_1.INIT_GAME,
            payload: {
                color: "b",
            }
        }));
    }
    makeMove(socket, move) {
        var _a, _b, _c, _d, _e;
        //Validate user
        if (socket != this.player1 && socket != this.player2)
            return;
        if (socket == this.player1 && ((_a = this.board) === null || _a === void 0 ? void 0 : _a.turn()) == "b")
            return;
        if (socket == this.player2 && ((_b = this.board) === null || _b === void 0 ? void 0 : _b.turn()) == "w")
            return;
        //Validate move
        try {
            (_c = this.board) === null || _c === void 0 ? void 0 : _c.move(move);
            socket.send("");
        }
        catch (error) {
            console.log("Invalid move: ", error);
            return;
        }
        if ((_d = this.board) === null || _d === void 0 ? void 0 : _d.isGameOver()) {
            this.player1.send(JSON.stringify({
                type: Messages_1.GAME_OVER,
                payload: {
                    winner: this.board.turn() == "w" ? "b" : "w",
                }
            }));
            this.player2.send(JSON.stringify({
                type: Messages_1.GAME_OVER,
                payload: {
                    winner: this.board.turn() == "w" ? "b" : "w",
                }
            }));
            return;
        }
        if (((_e = this.board) === null || _e === void 0 ? void 0 : _e.turn()) == "b") {
            this.player2.send(JSON.stringify({
                type: Messages_1.MOVE,
                payload: move
            }));
        }
        else {
            this.player1.send(JSON.stringify({
                type: Messages_1.MOVE,
                payload: move
            }));
        }
    }
    handlePlayerResign(socket) {
        const oppSocket = this.player1 == socket ? this.player2 : this.player1;
        socket.send(JSON.stringify({
            type: Messages_1.GAME_OVER,
            payload: {
                winner: socket == this.player1 ? 'b' : 'w'
            }
        }));
        oppSocket.send(JSON.stringify({
            type: Messages_1.GAME_OVER,
            payload: {
                winner: socket == this.player1 ? 'b' : 'w'
            }
        }));
    }
}
exports.Game = Game;
