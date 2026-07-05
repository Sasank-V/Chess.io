import { Game } from "@/core/Game";
import GameRepository from "@/repositories/GameRepository";
import { Move, Player, Side } from "@/types/GameTypes";
import { GameMessenger } from "@/websocket/GameMessenger";
import { WebSocket } from "ws";

class GameService {
  private gameId = "";
  private isGameOver = false;

  private readonly game: Game;
  private readonly messenger: GameMessenger;
  private readonly repository: GameRepository;

  constructor(
    player1: Player,
    player2: Player,
    messenger: GameMessenger,
    repository: GameRepository,
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

  async initializeGame(): Promise<void> {
    if (this.isGameOver) return;
    this.gameId = await this.repository.addGame(
      this.game.player1,
      this.game.player2,
    );
    this.messenger.sendInit(this.game.player1, this.game.player2);
  }

  async handleMove(socket: WebSocket, move: Move): Promise<void> {
    if (this.isGameOver) return;

    const validMove = this.game.makeMove(socket, move);
    const [currentPlayer, opponent] = this.getPlayers(socket);

    if (!validMove) {
      this.messenger.sendInvalidMove(currentPlayer);
      return;
    }
    await this.repository.addMove(this.gameId, move);
    this.messenger.sendMove(opponent, move);

    const result = this.game.checkGameOver();
    if (result.isGameOver && result.winnerPlayer && result.loserPlayer) {
      await this.repository.setGameOver(
        this.gameId,
        result.winnerPlayer.email,
        result.reason,
      );
      this.messenger.broadcastGameOver(
        result.winnerPlayer,
        result.loserPlayer,
        result.winnerSide,
        result.reason,
        result.reason,
      );
      this.isGameOver = true;
    }
  }

  async handlePlayerResign(socket: WebSocket): Promise<void> {
    if (this.isGameOver) return;

    const [player, opponent] = this.getPlayers(socket);
    const [, winnerSide] = this.getSides(socket);

    this.messenger.broadcastGameOver(
      player,
      opponent,
      winnerSide,
      "You Resigned",
      "Opponent Resigned",
    );
    await this.repository.setGameOver(
      this.gameId,
      opponent.email,
      `${player.email} Resigned`,
    );
    this.isGameOver = true;
  }

  handleWebStream(socket: WebSocket, data: unknown): void {
    const [, opponent] = this.getPlayers(socket);
    this.messenger.forwardStream(opponent, data);
  }
}

export default GameService;
