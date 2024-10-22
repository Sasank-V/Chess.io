"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const worker_threads_1 = require("worker_threads");
const chess_js_1 = require("chess.js");
const Messages_1 = require("./Messages");
worker_threads_1.parentPort === null || worker_threads_1.parentPort === void 0 ? void 0 : worker_threads_1.parentPort.on("message", (message) => {
    worker_threads_1.parentPort === null || worker_threads_1.parentPort === void 0 ? void 0 : worker_threads_1.parentPort.postMessage(handleValidateMove(message.data));
});
const handleValidateMove = (data) => {
    const board = new chess_js_1.Chess(data.board);
    try {
        board.move(data.move);
        return {
            type: Messages_1.VALIDATE_MOVE,
            move: data.move,
            isValid: true,
        };
    }
    catch (error) {
        console.log("Invalid move: ", error);
        return {
            type: Messages_1.VALIDATE_MOVE,
            move: data.move,
            isValid: false,
        };
    }
};
