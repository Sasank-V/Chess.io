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
        const payload = {
            "username" : user.username,
            "id":user._id,
        }
        const accessToken = jwt.sign(payload, process.env.JWTSECRET_KEY as Secret, { expiresIn: process.env.ACCESS_TOKEN_EXPIRY });
        const refreshToken = jwt.sign(payload, process.env.JWTSECRET_KEY as Secret, { expiresIn: process.env.REFRESH_TOKEN_EXPIRY });

        user.refreshToken = refreshToken;
        await user.save();

        res.cookie("jwt",refreshToken,cookieOptions as CookieOptions);

        res.status(200).send({
            success:true,
            message:"User logged in successfully",
            data:{
                accessToken:accessToken,
                username:user.username,
                expiresAt: Date.now() + (60 * 60 * 1000),
                photo:user.picture,
            }
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

const cookieOptions = {
    httpOnly:true,
    secure:process.env.NODE_ENV === 'production',
    sameSite:process.env.NODE_ENV === 'production' ? "none" : "strict",
    maxAge:24 * 60 * 60 * 1000
};


export const logoutHandler:RequestHandler<{},AuthResponse> = async (req,res) =>{
    try{
        const cookies = req.cookies;
        if(!cookies.jwt){
                res.status(404).json({
                success:false,
                message:"JWT Not found in cookie"
            });
            return;
        }
        const refreshToken = cookies.jwt;
        const user = await User.findOne({refreshToken:refreshToken});
        if(!user){
            res.clearCookie("jwt",{httpOnly:true});
            res.status(404).json({
                success:false,
                message:"User with that refreshToken not found"
            });
            return;
        }
        await User.findByIdAndUpdate(user._id,{refreshToken:""});
        res.clearCookie("jwt",{httpOnly:true});
        res.status(200).json({
            success:true,
            message:"User logged out successfully"
        });
    }catch(error){
        const err = error as Error;
        console.log("Logout Error: " , err);
        res.status(500).json({
            success:false,
            message:"Internal Server Error during logout"
        })
    }
}

export const refreshHandler: RequestHandler<{},LoginResponse> = async (req,res) => {
    try {
        const refreshToken = req.cookies.jwt;
        if(!refreshToken){
            res.status(404).json({
                success:false,
                message:"JWT Not found in cookie"
            });
            return;
        }
        const user = await User.findOne({refreshToken:refreshToken});
        if(!user){
            res.status(404).send({
                success:false,
                message:"User not found with refreshToken provided"
            });
            return;
        }

        jwt.verify(refreshToken,process.env.JWTSECRET_KEY as Secret,(err:JsonWebTokenError|null,data:any)=>{
            if(err || !data || user.username !== data.username){
                console.log(err,data);
                res.status(403).json({
                    success: false,
                    message: "Error occured while verifying jwt"
                });
                return;
            }
            const payload = {
                "username" : user.username,
                "id":user._id
            }
            const accessToken = jwt.sign(payload,process.env.JWTSECRET_KEY as Secret,{expiresIn:process.env.ACCESS_TOKEN_EXPIRY});
            res.status(200).json({
                success:true,
                message:"Access Token refreshed successfully",
                data:{
                    accessToken:accessToken,
                    expiresAt:Date.now() + 60 * 60 * 1000,
                }
            })
        });

    } catch (error) {
        console.log("Refresh Error: "  ,error);
        res.status(500).json({
            success:false,
            message:"Internal Server Error while Refreshing JWT"
        })
    }
}
