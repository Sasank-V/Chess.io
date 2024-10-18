import { useEffect, useState } from "react"

const SOCKET_URL = "ws://localhost:8080";

let ws:WebSocket|null = null;

export const useSocket = () => {
    const [socket,setSocket] = useState<WebSocket|null>(null);
    useEffect(()=>{
        if(!ws){
            ws = new WebSocket(SOCKET_URL);
            ws.onopen = () => {
                setSocket(ws);
            }
            ws.onclose = () => {
                setSocket(null);
            }
        }else{
            setSocket(ws);
        }
        return () => {
            if(socket?.readyState == 1){
                console.log("I am closing");
                socket.close();
            }
        }

    },[]);
    return socket;
}