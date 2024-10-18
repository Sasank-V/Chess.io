"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const Manager_1 = require("./GameFiles/Manager");
const wss = new ws_1.WebSocketServer({ port: 8080 });
console.log("Server is listening on port 8080");
const gameManager = new Manager_1.GameManager();
wss.on('connection', function connection(ws) {
    console.log("User Connected");
    gameManager.addUser(ws);
    // Handle client disconnection
    ws.on('close', () => {
        console.log("User Disconnected");
        gameManager.removeUser(ws);
    });
    // Handle errors
    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        gameManager.removeUser(ws);
    });
});
