"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
const chess_js_1 = require("chess.js");
const Messages_1 = require("./Messages");
const worker_threads_1 = require("worker_threads");
const path_1 = __importDefault(require("path"));
class Game {
    constructor(player1, player2) {
        this.player1 = player1;
        this.player2 = player2;
        this.board = new chess_js_1.Chess();
        this.startTime = new Date();
        const workerPath = path_1.default.join(__dirname, "Worker.js");
        this.worker = new worker_threads_1.Worker(workerPath);
        // Setup worker message listener only once in the constructor
        this.worker.on("message", (message) => {
            this.handleWorkerMessage(message);
        });
        this.player1.send(JSON.stringify({
            type: Messages_1.INIT_GAME,
            payload: {
                color: "w",
            },
        }));
        this.player2.send(JSON.stringify({
            type: Messages_1.INIT_GAME,
            payload: {
                color: "b",
            },
        }));
    }
    validateUser(socket) {
        var _a, _b;
        if (socket != this.player1 && socket != this.player2)
            return false;
        if (socket == this.player1 && ((_a = this.board) === null || _a === void 0 ? void 0 : _a.turn()) == "b")
            return false;
        if (socket == this.player2 && ((_b = this.board) === null || _b === void 0 ? void 0 : _b.turn()) == "w")
            return false;
        return true;
    }
    checkGameover() {
        var _a;
        if ((_a = this.board) === null || _a === void 0 ? void 0 : _a.isGameOver()) {
            let reason = "";
            if (this.board.isCheckmate())
                reason = "Checkmate";
            else if (this.board.isStalemate())
                reason = "Stalemate";
            else if (this.board.isDraw())
                reason = "Draw";
            let winner = this.board.turn() == "w" ? "b" : "w";
            return {
                isGameOver: true,
                winner: winner,
                reason: reason,
            };
        }
        else {
            return {
                isGameOver: false,
                winner: "TBD",
                reason: "TBD",
            };
        }
    }
    handleGameOver() {
        const { isGameOver, winner, reason } = this.checkGameover();
        if (isGameOver) {
            this.player1.send(JSON.stringify({
                type: Messages_1.GAME_OVER,
                payload: {
                    winner,
                    reason,
                },
            }));
            this.player2.send(JSON.stringify({
                type: Messages_1.GAME_OVER,
                payload: {
                    winner,
                    reason,
                },
            }));
            // Terminate worker after the game is over
            this.worker.terminate();
        }
    }
    sendValidMove(socket, move) {
        var _a;
        const oppSocket = socket == this.player1 ? this.player2 : this.player1;
        (_a = this.board) === null || _a === void 0 ? void 0 : _a.move(move);
        oppSocket.send(JSON.stringify({
            type: Messages_1.MOVE,
            payload: move,
        }));
    }
    makeMove(socket, move) {
        var _a;
        // Validate user
        const isValidUser = this.validateUser(socket);
        if (!isValidUser)
            return;
        // Validate move using worker threads
        this.worker.postMessage({
            type: Messages_1.VALIDATE_MOVE,
            data: {
                move,
                board: (_a = this.board) === null || _a === void 0 ? void 0 : _a.fen(),
            },
        });
    }
    handleWorkerMessage(message) {
        var _a;
        const { move, isValid } = message;
        const socket = ((_a = this.board) === null || _a === void 0 ? void 0 : _a.turn()) === 'w' ? this.player1 : this.player2;
        if (isValid) {
            // Send valid move to opponent
            this.sendValidMove(socket, move);
            // Check for game over after the move is made
            this.handleGameOver();
        }
        else {
            // Handle invalid move case
            socket.send(JSON.stringify({
                type: Messages_1.INVALID_MOVE,
                payload: {
                    reason: "Invalid move",
                },
            }));
            console.log("Invalid Move");
        }
    }
    handlePlayerResign(socket) {
        const oppSocket = this.player1 == socket ? this.player2 : this.player1;
        socket.send(JSON.stringify({
            type: Messages_1.GAME_OVER,
            payload: {
                winner: socket == this.player1 ? "b" : "w",
                reason: "You resigned",
            },
        }));
        oppSocket.send(JSON.stringify({
            type: Messages_1.GAME_OVER,
            payload: {
                winner: socket == this.player1 ? "b" : "w",
                reason: "Opponent resigned",
            },
        }));
        this.worker.terminate();
    }
}
exports.Game = Game;
