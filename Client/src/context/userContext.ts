import { createContext} from "react";

interface ContextType{
    username : string,
    setUsername : (val:string) => void
    isLoggedIn : boolean,
    setIsLoggedIn : (val:boolean) => void,
    photo:string,
    setPhoto:(val:string)=>void,
}

export const UserContext = createContext<ContextType | undefined>(undefined);