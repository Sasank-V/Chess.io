// import { Request, Response, NextFunction } from 'express';
// import jwt, { decode, JwtPayload } from 'jsonwebtoken';

// interface AuthRequest extends Request {
//     user?: any; // Replace 'any' with your user type
// }

// export const verifyJWT = async (req: AuthRequest, res: Response, next: NextFunction) => {
//     try {
//         const token = req.cookies.jwt;
//         if (!token){
//             res.status(400).json({
//                 success:false,
//                 message:"No JWT in authorization header",
//             })
//             return;
//         }
//         const decoded = jwt.verify(token, process.env.JWTSECRET_KEY!);
//         console.log("JWT Decoded: ",decoded);
//         req.body.jwt = decoded;
//         next();
//     } catch (err) {
//         console.log("Server Error:",err);
//         res.status(500).json({
//             success: false,
//             message: 'Internal Server Error while verifying JWT'
//         });
//     }
// };