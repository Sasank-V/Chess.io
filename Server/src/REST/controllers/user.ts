import { RequestHandler } from "express";
import { GetAllResponse, GetUserProfileResponse } from "../types/user";
import User from "../models/user";
import Game, { IGame } from "../models/game";
import { Player } from "../../GameFiles/Types/GameTypes";
import mongoose from "mongoose";
import Move, { IMove } from "../models/move";

export type GetUserRequestBody = {
  email: string;
};

// export const getAllUsersHandler:RequestHandler<{},GetAllResponse> = async (req,res)=>{
//     try {
//         const users = await User.find({});
//         const data = users.map((user)=>({
//             name:user.username,
//             id:user._id.toString(),
//             gamesPlayed: user.games.length,
//             rating:user.rating,
//         }));
//         res.status(204).json({
//             success:true,
//             message:"All users sent",
//             users:data,
//         });
//         return;
//     } catch (error) {
//         console.log("Server errror : While getting all users: ",error);
//         res.status(500).json({
//             success:false,
//             message:"Server error while fetching all users",
//             users:[],
//         })
//     }
// }

export const getUserProfileHandler: RequestHandler<
  {},
  GetUserProfileResponse,
  GetUserRequestBody
> = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }
    // console.log(user);
    const games_data = await Promise.all(
      user.games.map(async (id) => {
        const game = await Game.findById(id);
        const player1 = await User.findById(game?.player1);
        const player2 = await User.findById(game?.player2);
        if (!player1 || !player2 || !game)
          return {
            white: "-",
            black: "-",
            total_moves: 0,
            reason: "-",
            won: false,
            id: "",
          };
        // console.log(game.winner, user._id);
        return {
          white: player1.username,
          black: player2.username,
          total_moves: game.moves.length,
          won: game.winner.toString() === user._id.toString(),
          reason: game.reason.toString(),
          id: game._id.toString(),
        };
      })
    );
    res.send({
      success: true,
      message: "User Profile Sent",
      data: {
        gamesPlayed: user.games.length,
        gamesWon: user.gamesWon.valueOf(),
        photo: user.picture,
        rating: user.rating,
        username: user.username,
        games: games_data,
      },
    });
  } catch (error) {
    console.log("Server Error: While Getting user profile : ", error);
    res.status(500).json({
      success: false,
      message: "Error while getting user profile",
    });
  }
};

export type GetGameInfoReponse = {
  success: Boolean;
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
    const game = await Game.findById(id);
    if (!game) {
      res.status(404).json({
        success: false,
        message: "Game not found",
      });
      return;
    }
    let game_data = {
      id: game._id,
    };
    const player1 = await User.findById(game.player1);
    const player2 = await User.findById(game.player2);
    if (!player1 || !player2) {
      res.status(404).json({
        success: false,
        message: "Players Not found",
      });
      return;
    }
    const moves = await Promise.all(
      game.moves.map(async (mid) => {
        const move = await Move.findById(mid);
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
      })
    );
    const winner =
      game.winner.toString() === game.player1.toString()
        ? player1.username
        : player2.username;
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
    console.log("Server Error: While Getting game info : ", error);
    res.status(500).json({
      success: false,
      message: "Error while getting game info",
    });
  }
};
