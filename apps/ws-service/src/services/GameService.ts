import { Game } from "@/core/Game";
import { activeGames } from "@/metrics/websocket";
import { publishGameEvent } from "@/queue/GameEventQueue";
import { RedisGameStateRepository } from "@/repositories/redis/RedisGameRepository";
import { Move, Player, Side } from "@/types/GameTypes";
import { GameMessenger } from "@/websocket/GameMessenger";
import { WebSocket } from "ws";

class GameService {
  private gameId = "";
  private isGameOver = false;

  private readonly game: Game;
  private readonly messenger: GameMessenger;
  private readonly repository: RedisGameStateRepository;

  constructor(
    player1: Player,
    player2: Player,
    messenger: GameMessenger,
    repository: RedisGameStateRepository,
  ) {
    this.game = new Game(player1, player2);
    this.messenger = messenger;
    this.repository = repository;
  }

  hasPlayer(socket: WebSocket): boolean {
    return (
      this.game.player1.socket === socket || this.game.player2.socket === socket
    );
  }

  private getPlayers(socket: WebSocket): [Player, Player] {
    return socket === this.game.player1.socket
      ? [this.game.player1, this.game.player2]
      : [this.game.player2, this.game.player1];
  }

  private getSides(socket: WebSocket): [Side, Side] {
    return socket === this.game.player1.socket ? ["w", "b"] : ["b", "w"];
  }
  async initializeGame(): Promise<string> {
    if (this.isGameOver) return "";
    this.gameId = this.game.gameId;
    await this.repository.createGame(this.gameId);
    await publishGameEvent({
      type: "CREATE_GAME",
      gameId: this.gameId,
      player1: this.game.player1.email,
      player2: this.game.player2.email,
    });
    this.messenger.sendInit(this.game.player1, this.game.player2);
    return this.gameId;
  }

  async handleMove(socket: WebSocket, move: Move): Promise<void> {
    if (this.isGameOver) return;

    const validMove = this.game.makeMove(socket, move);
    const [currentPlayer, opponent] = this.getPlayers(socket);

    if (!validMove) {
      this.messenger.sendInvalidMove(currentPlayer);
      return;
    }
    await this.repository.appendMove(this.gameId, move);
    await publishGameEvent({
      type: "ADD_MOVE",
      gameId: this.gameId,
      move,
    });
    this.messenger.sendMove(opponent, move);

    const result = this.game.checkGameOver();
    if (result.isGameOver && result.winnerPlayer && result.loserPlayer) {
      await this.repository.setGameOver(
        this.gameId,
        result.winnerPlayer.email,
        result.reason,
      );

      await publishGameEvent({
        type: "GAME_OVER",
        gameId: this.gameId,
        winnerEmail: result.winnerPlayer.email,
        reason: result.reason,
      });

      this.messenger.broadcastGameOver(
        result.winnerPlayer,
        result.loserPlayer,
        result.winnerSide,
        result.reason,
        result.reason,
      );
      activeGames.dec();
      this.isGameOver = true;
    }
  }

  async handlePlayerResign(socket: WebSocket): Promise<void> {
    if (this.isGameOver) return;

    const [player, opponent] = this.getPlayers(socket);
    const [, winnerSide] = this.getSides(socket);

    await this.repository.setGameOver(
      this.gameId,
      opponent.email,
      `${player.email} Resigned`,
    );

    await publishGameEvent({
      type: "GAME_OVER",
      gameId: this.gameId,
      winnerEmail: opponent.email,
      reason: `${player.email} Resigned`,
    });

    this.messenger.broadcastGameOver(
      player,
      opponent,
      winnerSide,
      "You Resigned",
      "Opponent Resigned",
    );

    this.isGameOver = true;
  }

  handleWebStream(socket: WebSocket, data: unknown): void {
    const [, opponent] = this.getPlayers(socket);
    this.messenger.forwardStream(opponent, data);
  }
}

export default GameService;
