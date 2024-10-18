import { createContext} from "react";

interface ContextType{
    color : string,
    setColor : (newColor:string) => void
    isWinner : boolean,
    setIsWinner : (newVal:boolean) => void
}

export const GameContext = createContext<ContextType | undefined>(undefined);