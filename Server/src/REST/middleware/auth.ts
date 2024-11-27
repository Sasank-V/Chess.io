import { Request, Response, NextFunction } from 'express';
import jwt, { decode, JwtPayload } from 'jsonwebtoken';

interface AuthRequest extends Request {
    user?: any; // Replace 'any' with your user type
}

export const verifyJWT = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies.token || req.header('Authorization')?.replace('Bearer ', '');
        if (!token){
            res.status(400).json({
                success:false,
                message:"No JWT in authorization header",
            })
            return;
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET!);
        console.log("JWT Decoded: ",decoded);
        req.body.jwt = decoded;
        next();
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Internal Server Error while verifying JWT'
        });
    }
};