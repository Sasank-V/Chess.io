export interface AuthRequestBody {
    username: string;
    password: string;
    email: string;
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
    }
}