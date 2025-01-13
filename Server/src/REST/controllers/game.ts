import { RequestHandler } from "express";
import {
  AddMoveRequest,
  AddMoveResponse,
  CreateGameRequest,
  CreateGameResponse,
  GameOverRequest,
  GameOverResponse,
} from "../types/game";
import User, { IUser } from "../models/user";
import Game from "../models/game";
import { Schema, Types } from "mongoose";
import Move, { IMove } from "../models/move";
import { IGame } from "../models/game";

export const createGameHandler: RequestHandler<
  {},
  CreateGameResponse,
  CreateGameRequest
> = async (req, res) => {
  try {
    const { player1, player2 } = req.body;
    const user1 = await User.findOne({ username: player1 });
    const user2 = await User.findOne({ username: player2 });
    if (!user1 || !user2) {
      res.status(404).json({
        success: false,
        message: "Players not found , Ask them to signup",
      });
      return;
    }
    const game = new Game({ player1: user1._id, player2: user2._id });
    await game.save();

    const gameId = game._id as Types.ObjectId & IGame;
    user1.games.push(gameId);
    user2.games.push(gameId);
    await user1.save();
    await user2.save();

    res.status(201).json({
      success: true,
      message: "New Game was created successfully",
      gameId: game._id.toString(),
    });
    return;
  } catch (error) {
    console.log("Error while creating game: ", error);
    res.status(500).json({
      success: false,
      message: "Internal Server error while creating game",
    });
    return;
  }
};

export const addMoveHandler: RequestHandler<
  {},
  AddMoveResponse,
  AddMoveRequest
> = async (req, res) => {
  try {
    const { from, to, promotion, gameId } = req.body;
    const game = await Game.findById(gameId);
    if (!game) {
      res.status(404).json({
        success: false,
        message: "Game not found with the game ID",
      });
      return;
    }
    const move = new Move({ from, to, promotion });
    await move.save();
    const moveId = move._id as Types.ObjectId & IMove;
    game.moves.push(moveId);
    await game.save();

    res.status(204).json({
      success: true,
      message: "Move added to the game",
    });
  } catch (error) {
    console.log("Server Error: ", error);
    res.status(500).json({
      success: false,
      message: "Error while adding the move",
    });
    return;
  }
};

export const gameOverHandler: RequestHandler<
  {},
  GameOverResponse,
  GameOverRequest
> = async (req, res) => {
  try {
    const { gameId, email, reason } = req.body;
    const game = await Game.findById(gameId);
    if (!game) {
      res.status(404).json({
        success: false,
        message: "Game not found with game ID",
      });
      return;
    }
    const winner = await User.findOne({ email });
    if (!winner) {
      res.status(404).json({
        success: false,
        message: "User not found with the username",
      });
      return;
    }
    const loser_id =
      winner._id.toString() === game.player1.toString()
        ? game.player2
        : game.player1;
    const loser = await User.findById(loser_id);
    if (!loser) {
      res.status(404).json({
        success: false,
        message: "Opponent User not found with the username",
      });
      return;
    }
    game.winner = winner._id;
    game.isGameOver = true;
    game.reason = reason;
    winner.gamesWon = winner.gamesWon.valueOf() + 1;
    winner.rating = winner.rating.valueOf() + 10;
    loser.rating = Math.max(0, loser.rating.valueOf() - 10);
    await game.save();
    await winner.save();
    await loser.save();
    res.status(200).json({
      success: true,
      message: "Game Status Updated",
    });
  } catch (error) {
    console.log("Server Error on Updating Game over: ", error);
    res.status(500).json({
      success: false,
      message: "Error while updating game over",
    });
    return;
  }
};
