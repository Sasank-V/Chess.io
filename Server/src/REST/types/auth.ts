export interface AuthRequestBody {
    username: string;
    email: string;
    photo:string;
}

export interface AuthResponse {
    success: boolean;
    message: string;
}

export interface LoginResponse{
    success:boolean,
    message:string,
    data?: {
        accessToken?:string,
        username?:string,
        expiresAt?:Number,
        photo?:string,
    }
}