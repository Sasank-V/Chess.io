import { RequestHandler } from "express";
import { GetUserProfileResponse } from "@chess.io/shared-types";

import User from "../models/user";
import Game from "../models/game";
import Move from "../models/move";

import { profileRequests } from "../metrics/user";
import { replayRequests } from "../metrics/game";
import { monitorMongo } from "../metrics/helpers";

export type GetUserRequestBody = {
  email: string;
};

export const getUserProfileHandler: RequestHandler<
  {},
  GetUserProfileResponse,
  GetUserRequestBody
> = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await monitorMongo("users", "findOne", () =>
      User.findOne({ email }),
    );

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    const gamesData = await Promise.all(
      user.games.map(async (id) => {
        const game = await monitorMongo("games", "findById", () =>
          Game.findById(id),
        );

        if (!game) {
          return {
            white: "-",
            black: "-",
            total_moves: 0,
            reason: "-",
            won: false,
            id: "",
          };
        }

        const player1 = await monitorMongo("users", "findById", () =>
          User.findById(game.player1),
        );

        const player2 = await monitorMongo("users", "findById", () =>
          User.findById(game.player2),
        );

        if (!player1 || !player2) {
          return {
            white: "-",
            black: "-",
            total_moves: 0,
            reason: "-",
            won: false,
            id: "",
          };
        }

        return {
          white: player1.username,
          black: player2.username,
          total_moves: game.moves.length,
          won: game.winner ? game.winner.equals(user._id) : false,
          reason: game.reason.toString() ?? "",
          id: game._id.toString(),
        };
      }),
    );

    profileRequests.inc();

    res.send({
      success: true,
      message: "User Profile Sent",
      data: {
        gamesPlayed: user.games.length,
        gamesWon: user.gamesWon.valueOf(),
        photo: user.picture,
        rating: user.rating,
        username: user.username,
        games: gamesData,
      },
    });
  } catch (error) {
    console.error("Server Error while getting user profile:", error);

    res.status(500).json({
      success: false,
      message: "Error while getting user profile",
    });
  }
};

export type GetGameInfoReponse = {
  success: boolean;
  message: string;
  data?: {
    id: string;
    player1: string;
    player2: string;
    moves: {
      from: string;
      to: string;
      promotion: string;
    }[];
    winner: string;
    reason: string;
  };
};

interface GetGameParams {
  id: string;
}

export const getGameInfoHandler: RequestHandler<
  GetGameParams,
  GetGameInfoReponse,
  {}
> = async (req, res) => {
  try {
    const { id } = req.params;

    const game = await monitorMongo("games", "findById", () =>
      Game.findById(id),
    );

    if (!game) {
      res.status(404).json({
        success: false,
        message: "Game not found",
      });
      return;
    }

    const player1 = await monitorMongo("users", "findById", () =>
      User.findById(game.player1),
    );

    const player2 = await monitorMongo("users", "findById", () =>
      User.findById(game.player2),
    );

    if (!player1 || !player2) {
      res.status(404).json({
        success: false,
        message: "Players not found",
      });
      return;
    }

    const moves = await Promise.all(
      game.moves.map(async (mid) => {
        const move = await monitorMongo("moves", "findById", () =>
          Move.findById(mid),
        );

        if (!move) {
          return {
            from: "",
            to: "",
            promotion: "",
          };
        }

        return {
          from: move.from,
          to: move.to,
          promotion: move.promotion,
        };
      }),
    );

    const winner = game.winner
      ? game.winner.equals(game.player1.toString())
        ? player1.username
        : player2.username
      : "";

    replayRequests.inc();

    res.send({
      success: true,
      message: "Game Details Sent",
      data: {
        id,
        player1: player1.username,
        player2: player2.username,
        winner,
        moves,
        reason: game.reason.toString(),
      },
    });
  } catch (error) {
    console.error("Server Error while getting game info:", error);

    res.status(500).json({
      success: false,
      message: "Error while getting game info",
    });
  }
};
