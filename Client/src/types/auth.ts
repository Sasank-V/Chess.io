export type LoginResponse = {
    success: boolean;
    message: string;
    data: {
      accessToken: string;
      username: string;
      expiresAt: number;
      photo:string;
    };
};

export type SignUpResponse = {
    success:boolean,
    message:string,
    data:{
        accessToken:string,
        username:string,
        expiresAt:number
    }
};

export interface OTPResponse {
    success:boolean,
    message:string,
    data?:{
        email:string,
    }
}

export interface AuthResponse {
    success: boolean;
    message: string;
}