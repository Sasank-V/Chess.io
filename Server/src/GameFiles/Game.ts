import { WebSocket } from "ws";
import { Chess } from "chess.js";
import {
  GAME_OVER,
  INIT_GAME,
  INVALID_MOVE,
  MOVE,
  VALIDATE_MOVE,
} from "./Messages";

import { Worker } from "worker_threads";
import { Move, GameOverReply, Player } from "./Types/GameTypes";
import { WorkerMoveReply } from "./Types/WorkerTypes";
import path from "path";
import { axiosC } from "./utils/AxiosConfig";
import { AddMoveRequest, AddMoveResponse, CreateGameResponse, GameOverResponse } from "../REST/types/game";
import { Axios } from "axios";

export class Game {
  public player1: Player;
  public player2: Player;
  private board: Chess | null;
  private startTime: Date;
  private worker: Worker;
  private gameId: String;

  constructor(player1: Player, player2: Player) {
    this.player1 = player1;
    this.player2 = player2;
    this.board = new Chess();
    this.startTime = new Date();
    const workerPath = path.join(__dirname, "Worker.js");
    this.worker = new Worker(workerPath);
    this.gameId ="";
    this.createGame();

    // Setup worker message listener only once in the constructor
    this.worker.on("message", (message: WorkerMoveReply) => {
      this.handleWorkerMessage(message);
    });

    this.player1.socket.send(
      JSON.stringify({
        type: INIT_GAME,
        payload: {
          color: "w",
          oppName: this.player2.username
        },
      })
    );
    this.player2.socket.send(
      JSON.stringify({
        type: INIT_GAME,
        payload: {
          color: "b",
          oppName: this.player1.username
        },
      })
    );
  }

  async createGame(){
    try{
      const response = await axiosC.post<CreateGameResponse>("/game/create",{
        player1:this.player1.username,
        player2:this.player2.username
      });
      const res = response.data;
      if(res.success && res.gameId) this.gameId = res.gameId;
    }catch(error){
      console.log("error while creating game in Game.ts",error);
    }
  }

  validateUser(socket: WebSocket): boolean {
    if (socket != this.player1.socket && socket != this.player2.socket) return false;
    if (socket == this.player1.socket && this.board?.turn() == "b") return false;
    if (socket == this.player2.socket && this.board?.turn() == "w") return false;
    return true;
  }

  checkGameover(): GameOverReply {
    if (this.board?.isGameOver()) {
      let reason = "";
      if (this.board.isCheckmate()) reason = "Checkmate";
      else if (this.board.isStalemate()) reason = "Stalemate";
      else if (this.board.isDraw()) reason = "Draw";
      let winner = this.board.turn() == "w" ? "b" : "w";
      return {
        isGameOver: true,
        winner: winner,
        reason: reason,
      };
    } else {
      return {
        isGameOver: false,
        winner: "TBD",
        reason: "TBD",
      };
    }
  }

  async handleGameOver() {
    const { isGameOver, winner, reason } = this.checkGameover();
    if (isGameOver) {
      try {
        if(this.gameId){
          const response = await axiosC.post<GameOverResponse>("/game/over",{
            gameId:this.gameId,
            winnerUsername: (winner == 'w') ? this.player1.username : this.player2.username,
            reason
          });
          const res = response.data;
          if(!res.success) console.log(res.message);
        }
      } catch (error) {
        console.log("Error while handling Gameover",error);
      }finally{
        this.player1.socket.send(
          JSON.stringify({
            type: GAME_OVER,
            payload: {
              winner,
              reason,
            },
          })
        );
        this.player2.socket.send(
          JSON.stringify({
            type: GAME_OVER,
            payload: {
              winner,
              reason,
            },
          })
        );
        // Terminate worker after the game is over
        this.worker.terminate();
      }
    }
  }

  async sendValidMove(socket: WebSocket, move: Move) {
    const oppPlayer = socket == this.player1.socket ? this.player2 : this.player1;
    this.board?.move(move);
    try {
      if(this.gameId){
        const response = await axiosC.post<AddMoveResponse>("/game/move",{
          from:move.from,
          to:move.to,
          promotion: move.promotion || "",
          gameId:this.gameId,
        });
        const res = response.data;
        if(!res.success) console.log(res.message);
      }
    } catch (error) {
      console.log("Error while adding Move",error);
    }finally{
      oppPlayer.socket.send(
        JSON.stringify({
          type: MOVE,
          payload: move,
        })
      );
    }

  }

  makeMove(socket: WebSocket, move: Move) {
    // Validate user
    const isValidUser = this.validateUser(socket);
    if (!isValidUser) return;

    // Validate move using worker threads
    this.worker.postMessage({
      type: VALIDATE_MOVE,
      data: {
        move,
        board: this.board?.fen(),
      },
    });
  }

  handleWorkerMessage(message: WorkerMoveReply) {
    const { move, isValid } = message;
    const player = this.board?.turn() === 'w' ? this.player1 : this.player2;

    if (isValid) {
      // Send valid move to opponent
      this.sendValidMove(player.socket, move);
      this.handleGameOver();
    } else {
      player.socket.send(
        JSON.stringify({
          type: INVALID_MOVE,
          payload: {
            reason: "Invalid move",
          },
        })
      );
      console.log("Invalid Move");
    }
  }

  async handlePlayerResign(socket: WebSocket) {
    const oppPlayer = this.player1.socket == socket ? this.player2 : this.player1;
    try {
      if(this.gameId){
        const response = await axiosC.post<GameOverResponse>("/game/over",{
          gameId:this.gameId,
          winnerUsername: oppPlayer == this.player1 ? this.player1.username : this.player1.username,
          reason: `${oppPlayer == this.player1 ? this.player2.username : this.player1.username} Resigned` 
        });
        const res = response.data;
        if(!res.success) console.log(res.message);
      }
    } catch (error) {
      console.log("Error while handling Gameover",error);
    }finally{
      socket.send(
        JSON.stringify({
          type: GAME_OVER,
          payload: {
            winner: socket == this.player1.socket ? "b" : "w",
            reason: "You resigned",
          },
        })
      );
      oppPlayer.socket.send(
        JSON.stringify({
          type: GAME_OVER,
          payload: {
            winner: socket == this.player1.socket ? "b" : "w",
            reason: "Opponent resigned",
          },
        })
      );
      this.worker.terminate();
    }
  }
}
