import { RequestHandler } from "express";
import User, { IUser } from "../models/user";
import { getWelcomeMailOptions, sendMail } from "../utils/mailConfig";
import { LoginResponse, AuthRequestBody } from "@chess.io/shared-types";

import { failedLogins, googleLogins } from "../metrics/auth";
import { usersRegistered } from "../metrics/user";
import { monitorMongo } from "../metrics/helpers";

export const loginHandler: RequestHandler<
  {},
  LoginResponse,
  AuthRequestBody
> = async (req, res) => {
  try {
    console.log("Request Body:", req.body);

    const { username, email, photo } = req.body;

    let user = (await monitorMongo("users", "findOne", () =>
      User.findOne({ email }),
    )) as IUser | null;

    if (!user) {
      user = new User({
        username,
        email,
        picture: photo,
      });

      await monitorMongo("users", "save", () => user!.save());

      usersRegistered.inc();

      const welcomeMailOptions = getWelcomeMailOptions(
        user.username,
        user.email,
      );

      sendMail(welcomeMailOptions);
    }

    googleLogins.inc();

    res.status(200).json({
      success: true,
      message: "User logged in successfully",
    });
  } catch (error) {
    console.error("Login Error:", error);

    failedLogins.inc();

    res.status(500).json({
      success: false,
      message: "Internal server error during user login",
    });
  }
};
