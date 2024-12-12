import { CookieOptions, RequestHandler } from "express";
import User, { IUser } from "../models/user";
import { AuthResponse, LoginResponse, AuthRequestBody} from '../types/auth';
import jwt, { JsonWebTokenError, Secret } from 'jsonwebtoken';
import { getOTPMailOptions, getWelcomeMailOptions, sendMail} from "../utils/mailConfig";
import { SHA256 } from 'crypto-js';

export const loginHandler: RequestHandler<{}, LoginResponse, AuthRequestBody> = async (req, res) => {
    try {
        const {username, email,photo} = req.body;
        let user = await User.findOne({ email: email }) as IUser | null;
        if (!user){
            user = new User({
                username,
                email,
                picture:photo
            });
            await user.save();
            const welcomMailOptions = getWelcomeMailOptions(user.username,user.email);
            sendMail(welcomMailOptions);
        }
        res.status(200).send({
            success:true,
            message:"User logged in successfully",
        });
    } catch (error) {
        const err = error as Error;
        console.log("Login Error:" , err);
        res.status(500).json({
            success: false,
            message: "Internal server error during user login"
        });
    }
};

