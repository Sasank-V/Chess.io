import { createContext} from "react";

interface ContextType{
    username : string,
    setUsername : (val:string) => void
    accessToken : string,
    setAccessToken:(val:string) => void,
    expiry : number,
    setExpiry : (val:number) => void
    isLoggedIn : boolean,
    setIsLoggedIn : (val:boolean) => void,
    photo:string,
    setPhoto:(val:string)=>void,
}

export const UserContext = createContext<ContextType | undefined>(undefined);