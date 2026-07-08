import { RequestHandler } from "express";
import {
  AddMoveRequest,
  AddMoveResponse,
  CreateGameRequest,
  CreateGameResponse,
  GameOverRequest,
  GameOverResponse,
} from "@chess.io/shared-types";
import { Types } from "mongoose";

import User from "../models/user";
import Game, { IGame } from "../models/game";
import Move, { IMove } from "../models/move";

import { gamesCreated, gamesFinished, movesSaved } from "../metrics/game";

import { monitorMongo } from "../metrics/helpers";

export const createGameHandler: RequestHandler<
  {},
  CreateGameResponse,
  CreateGameRequest
> = async (req, res) => {
  try {
    const { player1, player2, gameId } = req.body;

    const user1 = await monitorMongo("users", "findOne", () =>
      User.findOne({ email: player1 }),
    );

    const user2 = await monitorMongo("users", "findOne", () =>
      User.findOne({ email: player2 }),
    );

    if (!user1 || !user2) {
      res.status(404).json({
        success: false,
        message: "Players not found, ask them to sign up",
      });
      return;
    }

    const game = new Game({
      _id: gameId,
      player1: user1._id,
      player2: user2._id,
    });

    await monitorMongo("games", "save", () => game.save());

    const storedGameId = game._id;

    user1.games.push(storedGameId);
    user2.games.push(storedGameId);

    await monitorMongo("users", "save", () => user1.save());

    await monitorMongo("users", "save", () => user2.save());

    gamesCreated.inc();

    res.status(201).json({
      success: true,
      message: "New game created successfully",
      gameId: storedGameId,
    });
  } catch (error) {
    console.error("Error while creating game:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error while creating game",
    });
  }
};

export const addMoveHandler: RequestHandler<
  {},
  AddMoveResponse,
  AddMoveRequest
> = async (req, res) => {
  try {
    const { from, to, promotion, gameId } = req.body;

    const game = await monitorMongo("games", "findById", () =>
      Game.findById(gameId),
    );

    if (!game) {
      res.status(404).json({
        success: false,
        message: "Game not found",
      });
      return;
    }

    const move = new Move({
      from,
      to,
      promotion,
    });

    await monitorMongo("moves", "save", () => move.save());

    const moveId = move._id as Types.ObjectId & IMove;

    game.moves.push(moveId);

    await monitorMongo("games", "save", () => game.save());

    movesSaved.inc();

    res.status(200).json({
      success: true,
      message: "Move added to the game",
    });
  } catch (error) {
    console.error("Server Error:", error);

    res.status(500).json({
      success: false,
      message: "Error while adding the move",
    });
  }
};

export const gameOverHandler: RequestHandler<
  {},
  GameOverResponse,
  GameOverRequest
> = async (req, res) => {
  try {
    const { gameId, email, reason } = req.body;

    const game = await monitorMongo("games", "findById", () =>
      Game.findById(gameId),
    );

    if (!game) {
      res.status(404).json({
        success: false,
        message: "Game not found",
      });
      return;
    }

    const winner = await monitorMongo("users", "findOne", () =>
      User.findOne({ email }),
    );

    if (!winner) {
      res.status(404).json({
        success: false,
        message: "Winner not found",
      });
      return;
    }

    const loserId = winner._id.equals(game.player1.toString())
      ? game.player2
      : game.player1;

    const loser = await monitorMongo("users", "findById", () =>
      User.findById(loserId),
    );

    if (!loser) {
      res.status(404).json({
        success: false,
        message: "Opponent not found",
      });
      return;
    }

    game.winner = winner._id;
    game.isGameOver = true;
    game.reason = reason;

    winner.gamesWon = winner.gamesWon.valueOf() + 1;
    winner.rating = winner.rating.valueOf() + 10;

    loser.rating = Math.max(0, loser.rating.valueOf() - 10);

    await monitorMongo("games", "save", () => game.save());

    await monitorMongo("users", "save", () => winner.save());

    await monitorMongo("users", "save", () => loser.save());

    gamesFinished.inc();

    res.status(200).json({
      success: true,
      message: "Game status updated",
    });
  } catch (error) {
    console.error("Server Error while updating game:", error);

    res.status(500).json({
      success: false,
      message: "Error while updating game",
    });
  }
};
