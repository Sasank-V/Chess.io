import { axiosC } from "../AxiosConfig";
import { LoginResponse } from "../types/auth";


export const refresh = async () => {
    try {
        const response = await axiosC.get<LoginResponse>("/auth/refresh");
        const res = response.data;
        return res;
    } catch (error) {
        console.log("Error during refreshing jwt: " ,error);
    }
}