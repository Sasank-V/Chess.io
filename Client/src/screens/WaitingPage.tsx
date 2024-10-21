import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useSocket } from "../hooks/useSocket";
import { GameContext } from "../context/context";
import Button from "../components/Button";
import { INIT_GAME } from "../components/Messages";


export default function WaitingPage() {
  const socket = useSocket();
  const [waiting, setWaiting] = useState<boolean>(true);
  
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
        setWaiting(false);
        setColor(message.payload.color);
      }
    };
    socket.onmessage = handleMessage;
    return () => {
      socket.onmessage = null;
    }

  }, [socket,setColor]); 

  useGSAP(() => {
    if (waiting) {
      // Animate chess pieces while waiting
      gsap.to(".chess-piece", {
        y: -20,
        stagger: 0.1,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut"
      });
    } else {
      // Animate when opponent is found
      gsap.to(".chess-piece", { scale: 0, stagger: 0.1, ease: "back.in" });
      gsap.fromTo(".found-text", 
        { opacity: 0, y: 50 },
        { opacity: 1, y: -20, duration: 0.5, delay: 0.5 }
      );
      gsap.fromTo(".join-button", 
        { scale: 0 },
        { scale: 1, duration: 0.5, delay: 0.8, ease: "back.out" }
      );
      gsap.to(".horse",{
        scale: 1.3,
        duration: 1,
        delay:0.4,
        ease:"power1.inOut"
      })
    }
  }, [waiting]);

  return (
    <div className="min-h-screen background flex flex-col items-center justify-center text-white">
      <div className="relative w-64 h-64">
        {!waiting ? 
        <div className="text-[150px] flex-center horse">
          {peices[Math.floor(Math.random()*6)]}
        </div> :
        peices.map((piece, index) => (
          <div
            key={index}
            className="chess-piece absolute text-6xl"
            style={{
              top: `${Math.sin(index / 3 * Math.PI) * 80 + 80}px`,
              left: `${Math.cos(index / 3 * Math.PI) * 80 + 80}px`,
            }}
          >
            {piece}
          </div>
        ))}
      </div>
      {waiting ? (
        <h2 className="waiting-text mt-8 text-2xl font-bold">Please wait while we find your opponent</h2>
      ) : (
        <div className="text-center">
          <h2 className="found-text text-3xl font-bold mb-6">
            Opponent Found!
            </h2>
          <Link to="/play" className="join-button">
            <Button text='Join Game'/>
          </Link>
        </div>
      )}
    </div>
  );
}
