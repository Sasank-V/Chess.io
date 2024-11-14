import {useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useSocket } from "../hooks/useSocket";
import { GameContext } from "../context/context";
import { INIT_GAME } from "../components/Common/Messages";


export default function WaitingPage() {
  const socket = useSocket();
  const navigate = useNavigate();

  // Handle possible undefined context
  const gameContext = useContext(GameContext);
  if (!gameContext) {
    throw new Error("WaitingPage must be used within a GameContextProvider");
  }
  
  const setColor = gameContext.setColor;
  const peices = ['♔', '♕', '♖', '♗', '♘', '♙'];


  useEffect(() => {
    if(!socket) return;
    socket?.send(JSON.stringify({
      type : INIT_GAME
    }));
    const handleMessage = (event: MessageEvent) => {
      const message = JSON.parse(event.data);
      if (message.type === INIT_GAME) {
        setColor(message.payload.color);
        navigate("/play");
      }
    };
    socket.onmessage = handleMessage;
    return () => {
      socket.onmessage = null;
    }

  }, [socket,setColor]); 

  useGSAP(() => {
      // Animate chess pieces while waiting
      gsap.to(".chess-piece", {
        y: -20,
        stagger: 0.1,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut"
      });
  }, []);

  return (
    <div className="min-h-screen flex-center flex-col background text-white ">

      <div className="relative w-64 h-64">
        {peices.map((piece, index) => (
          <div
            key={index}
            className="chess-piece absolute text-6xl "
            style={{
              top: `${Math.sin(index / 3 * Math.PI) * 95 + 95}px`,
              left: `${Math.cos(index / 3 * Math.PI) * 95 + 95}px`,
            }}
          >
            {piece}
          </div>
        ))}
      </div>
        <h2 className="waiting-text mt-8 text-2xl font-bold w-full text-center">Please wait while we find your opponent</h2>
    </div>
  );
}
