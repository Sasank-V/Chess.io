import { createContext} from "react";

interface ContextType{
    username : string,
    setUsername : (val:string) => void
    accessToken : string,
    setAccessToken:(val:string) => void,
    expiry : number,
    setExpiry : (val:number) => void
}

export const UserContext = createContext<ContextType | undefined>(undefined);