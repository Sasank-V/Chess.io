"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameManager = void 0;
const Messages_1 = require("./Messages");
const Game_1 = require("./Game");
class GameManager {
    constructor() {
        this.games = [];
        this.pendingUser = null;
        this.users = [];
    }
    addUser(socket) {
        this.users.push(socket);
        this.addHandler(socket);
    }
    removeUser(socket) {
        this.users = this.users.filter((user) => user != socket);
        const game = this.findGameBySocket(socket);
        if (game)
            game.handlePlayerResign(socket);
    }
    findGameBySocket(socket) {
        const game = this.games.find(game => game.player1 === socket || game.player2 === socket);
        return game;
    }
    addHandler(socket) {
        socket.on("message", (data) => {
            const messsage = JSON.parse(data.toString());
            if (messsage.type == Messages_1.INIT_GAME) {
                if (this.pendingUser) {
                    const game = new Game_1.Game(this.pendingUser, socket);
                    this.games.push(game);
                    this.pendingUser = null;
                }
                else {
                    this.pendingUser = socket;
                }
            }
            if (messsage.type === Messages_1.MOVE) {
                const game = this.findGameBySocket(socket);
                if (socket == (game === null || game === void 0 ? void 0 : game.player1))
                    console.log("Player1");
                else
                    console.log("Player2");
                if (game) {
                    game.makeMove(socket, messsage.move);
                }
            }
            if (messsage.type == Messages_1.PLAYER_RESIGN) {
                const game = this.findGameBySocket(socket);
                if (game) {
                    game.handlePlayerResign(socket);
                }
            }
        });
    }
}
exports.GameManager = GameManager;
