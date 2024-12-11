import { RequestHandler } from "express";
import { GetAllResponse, GetUserProfileResponse } from "../types/user";
import User from "../models/user";

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

export const getUserProfileHandler: RequestHandler<{},GetUserProfileResponse> = async (req,res) => {
    try {
        console.log(req.body.jwt);
        res.send({
            sucess:true,
            message:"Hello",
        }); 
    } catch (error) {
        console.log("Server Error: While Getting user profile : ",error);
        res.status(500).json({
            sucess:false,
            message:"Error while getting user profile",
        });
    }
}