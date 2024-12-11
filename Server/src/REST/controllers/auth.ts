import { CookieOptions, RequestHandler } from "express";
import User, { IUser } from "../models/user";
import { AuthResponse, LoginResponse, AuthRequestBody, OTPRequestBody, OTPResponse, UpdatePassRequestBody, ValidateOTPRequestBody } from '../types/auth';
import jwt, { JsonWebTokenError, Secret } from 'jsonwebtoken';
import { getOTPMailOptions, getWelcomeMailOptions, sendMail} from "../utils/mailConfig";
import { SHA256 } from 'crypto-js';

// Request Format
// {username: "", password: "", email: ""}
export const signupHandler: RequestHandler<{}, AuthResponse, AuthRequestBody> = async (req, res) => {
    try {
        const { username, password, email,photo} = req.body;
        const user = await User.findOne({ email: email }) as IUser | null;
        if (user) {
            res.status(409).json({
                success: false,
                message: "User already exists"
            });
            return;
        }
        const newUser = new User({
            username,
            password,
            email,
            picture:photo,
        });
        await newUser.save();
        const welcomMailOptions = getWelcomeMailOptions(newUser.username,newUser.email);
        sendMail(welcomMailOptions);
        res.status(200).json({
            success: true,
            message: "User registered successfully"
        });
    } catch (error) {
        const err = error as Error;
        console.log("Signup Error:" , err);
        res.status(500).json({
            success: false,
            message: "Internal server error during user signup"
        });
    }
};

const cookieOptions = {
    httpOnly:true,
    secure:process.env.NODE_ENV === 'production',
    sameSite:process.env.NODE_ENV === 'production' ? "none" : "strict",
    maxAge:24 * 60 * 60 * 1000
};

//Request Format
//{"username" : "" , "email": "" , password: ""}
export const loginHandler:RequestHandler<{},LoginResponse,AuthRequestBody> = async (req,res) =>{
    try {
        const { username, password, email } = req.body;
        const user = await User.findOne({$or:[{username:username},{email:email}]});
        if(!user){
            res.status(404).json({
                success:false,
                message:"User doesn't exist"
            })
            return;
        }
        if(password !== user.password){
            res.status(401).json({
                success:false,
                message:"Incorrect Password"
            });
            return;
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
        })

    } catch (error) {
        const err = error as Error;
        console.log("Login Error: " ,err);
        res.status(500).json({
            success:false,
            message:"Internal server error during user login"
        })
    }
}

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

export const sendOTPHandler: RequestHandler<{},OTPResponse,OTPRequestBody> = async (req,res) => {
    try {
        const {namemail} = req.body;
        const user = await User.findOne({$or:[{username:namemail},{email:namemail}]});
        if(!user){
            res.status(404).json({
                success:false,
                message:"User not found"
            });
            return;
        }
        const otp:string = (Math.ceil(Math.random()*1000000) + 1) + "";
        const hashedOTP = SHA256(otp).toString();
        user.OTP = hashedOTP;
        await user.save();
        
        const OTPMailOptions = getOTPMailOptions(otp,user.email);
        sendMail(OTPMailOptions);
        
        res.status(200).json({
            success:true,
            message:"OTP Sent to the mail successfully",
            data:{
                email:user.email,
            }
        });

    } catch (error) {
        console.log("Error while sending OTP:",error);
        res.status(500).json({
            success:false,
            message:"Internal Server Error while sending OTP"
        });
    }
}

export const validateOTPHandler: RequestHandler<{},AuthResponse,ValidateOTPRequestBody> = async (req,res)=>{
    try {
        const {email,otp} = req.body;
        const user = await User.findOne({email:email});
        if(!user){
            res.status(404).json({
                success:false,
                message:"User not found :(" 
             });
             return;
        }
        const hashedOTP = SHA256(otp).toString();
        if(hashedOTP !== user.OTP){
            res.status(400).json({
                success:false,
                message:"Incorrect OTP"
            });
            return;
        }

        user.OTP = "";
        await user.save();

        res.status(200).json({
            success:true,
            message:"OTP Validated successfully"
        })

    } catch (error) {
        console.log("Error while validating OTP: ", error);
        res.status(500).json({
            success:false,
            message:"Internal server error while validating OTP"
        })
    }
}

export const updatePassHandler: RequestHandler<{},AuthResponse,UpdatePassRequestBody> = async (req,res) => {
    try {
        const {email,password} = req.body;
        const user = await User.findOne({email:email});
        if(!user){
            res.status(404).json({
               success:false,
               message:"User not found :(" 
            });
            return;
        }

        if(user.OTP){
            res.status(400).send({
                success:false,
                message:"OTP isn't validated yet"
            })
        }

        user.password = password;
        await user.save();

        res.status(200).json({
            success:true,
            message:"Password Updated successfully"
        })

    } catch (error) {
        console.log("Internal Error while updating password: ", error);
        res.status(500).json({
            success:false,
            message:"Internal Server Error while updating passwords"
        })
    }   
}
