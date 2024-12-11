import { createContext} from "react";

interface ContextType{
    color : string,
    setColor : (newColor:string) => void
    isWinner : boolean,
    setIsWinner : (newVal:boolean) => void
    reason: string,
    setReason: (newReason:string) => void,
    hasSocket:boolean,
    setHasSocket:(newVal:boolean) => void;
    oppName:string,
    setOppName : (val:string) => void;
}

export const GameContext = createContext<ContextType | undefined>(undefined);