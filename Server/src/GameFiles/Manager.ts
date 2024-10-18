import { WebSocket } from "ws";
import { GAME_OVER, INIT_GAME, MOVE, PLAYER_RESIGN } from "./Messages";
import { Game } from "./Game";

export class GameManager{
    private games: Game[];
    private pendingUser: WebSocket | null;
    private users : WebSocket[];
    constructor() {
        this.games = [];
        this.pendingUser = null;
        this.users = [];
    }
    
    addUser(socket:WebSocket){
        this.users.push(socket);
        this.addHandler(socket);

    }
    removeUser(socket:WebSocket){
        this.users = this.users.filter((user)=> user!=socket);
    }
    private addHandler(socket:WebSocket){
        socket.on("message",(data)=>{
            const messsage = JSON.parse(data.toString());
            if(messsage.type == INIT_GAME){
                if(this.pendingUser){
                    const game = new Game(this.pendingUser,socket);
                    this.games.push(game);
                    this.pendingUser = null;
                }else{
                    this.pendingUser = socket;
                }
            }
            if(messsage.type === MOVE){
                const game = this.games.find(game=> game.player1 === socket || game.player2 === socket);
                if(game){
                    game.makeMove(socket,messsage.move);
                }
            }
            if(messsage.type == PLAYER_RESIGN){
                const game = this.games.find(game=> game.player1 === socket || game.player2 === socket);
                if(game){
                    game.handlePlayerResign(socket);
                }
            }
        })
    }
}