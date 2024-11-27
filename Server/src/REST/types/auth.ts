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

export interface OTPRequestBody {
    namemail:string
}

export interface OTPResponse {
    success:boolean,
    message:string,
    data?:{
        email?:string,
        otp?:string
    }
}

export interface UpdatePassRequestBody {
    email:string,
    password:string, 
}

export interface ValidateOTPRequestBody {
    email:string,
    otp:string,
}