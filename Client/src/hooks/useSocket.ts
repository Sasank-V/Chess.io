import { useEffect, useState } from "react"



let ws:WebSocket|null = null;

export const useSocket = () => {
    const [socket,setSocket] = useState<WebSocket|null>(null);
    useEffect(()=>{
        if(!ws){
            ws = new WebSocket(import.meta.env.VITE_SOCKET_URL);
            console.log("Socket created");
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