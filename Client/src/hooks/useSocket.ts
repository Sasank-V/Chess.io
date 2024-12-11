import { useContext, useEffect, useState } from "react"
import { GameContext } from "../context/gameContext";



let ws:WebSocket|null = null;

export const useSocket = () => {
    const [socket,setSocket] = useState<WebSocket|null>(null);
    const gamecontext = useContext(GameContext);
    if(!gamecontext) throw new Error("Game Context undefine in useSocket");
    const {hasSocket,setHasSocket,reason} = gamecontext;
    useEffect(()=>{
        if(!hasSocket && !reason){
            ws = new WebSocket(import.meta.env.VITE_SOCKET_URL);
            ws.onopen = () => {
                setSocket(ws);
                setHasSocket(true);
            }
            ws.onclose = () => {
                setSocket(null);
                setHasSocket(false);
            }
        }else{
            setSocket(ws);
        }
        return () => {
            if(socket?.readyState == 1){
                socket.close();
                setSocket(null);
            }
        }
    },[]);
    return socket;
}