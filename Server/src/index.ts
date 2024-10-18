import { WebSocketServer } from 'ws';
import { GameManager } from './GameFiles/Manager';

const wss = new WebSocketServer({ port: 8080 });
console.log("Server is listening on port 8080");

const gameManager = new GameManager();

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
