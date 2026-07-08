import { messagesSent } from "@/metrics/websocket";
import { Move, Player, Side } from "@/types/GameTypes";
import {
  INIT_GAME,
  MOVE,
  INVALID_MOVE,
  GAME_OVER,
  WEB_STREAM,
} from "@chess.io/shared-types";

export class GameMessenger {
  sendInit(player: Player, opponent: Player) {
    messagesSent.inc({ type: INIT_GAME });
    player.socket.send(
      JSON.stringify({
        type: INIT_GAME,
        payload: {
          color: "w",
          oppName: opponent.username,
        },
      }),
    );
    opponent.socket.send(
      JSON.stringify({
        type: INIT_GAME,
        payload: {
          color: "b",
          oppName: player.username,
        },
      }),
    );
  }
  sendMove(player: Player, move: Move) {
    messagesSent.inc({ type: MOVE });
    player.socket.send(
      JSON.stringify({
        type: MOVE,
        payload: move,
      }),
    );
  }
  sendInvalidMove(player: Player) {
    messagesSent.inc({ type: INVALID_MOVE });
    player.socket.send(
      JSON.stringify({
        type: INVALID_MOVE,
        payload: {
          reason: "Invalid move",
        },
      }),
    );
  }
  broadcastGameOver(
    p1: Player,
    p2: Player,
    winner: Side,
    p1_reason: string,
    p2_reason: string,
  ) {
    messagesSent.inc({ type: GAME_OVER });
    p1.socket.send(
      JSON.stringify({
        type: GAME_OVER,
        payload: {
          winner,
          p1_reason,
        },
      }),
    );
    p2.socket.send(
      JSON.stringify({
        type: GAME_OVER,
        payload: {
          winner,
          p2_reason,
        },
      }),
    );
  }
  forwardStream(player: Player, data: any) {
    messagesSent.inc({ type: WEB_STREAM });
    player.socket.send(
      JSON.stringify({
        type: WEB_STREAM,
        data,
      }),
    );
  }
}
