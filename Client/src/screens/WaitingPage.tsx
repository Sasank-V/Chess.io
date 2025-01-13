import { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useSocket } from "../hooks/useSocket";
import { GameContext } from "../context/gameContext";
import { INIT_GAME, PLAYER_RESIGN } from "../components/Common/Messages";
import { UserContext } from "../context/userContext";
import Button from "../components/Common/Button";

export default function WaitingPage() {
  const socket = useSocket();
  const navigate = useNavigate();

  // Handle possible undefined context
  const gameContext = useContext(GameContext);
  if (!gameContext) {
    throw new Error("WaitingPage must be used within a GameContextProvider");
  }

  const userContext = useContext(UserContext);
  if (!userContext) {
    throw new Error("Waiting must be used with UserContextProvider");
  }
  const { isLoggedIn, username, email } = userContext;

  const { setColor, setHasSocket, setOppName } = gameContext;
  const peices = ["♔", "♕", "♖", "♗", "♘", "♙"];

  useEffect(() => {
    if (!socket) return;
    if (isLoggedIn && username) {
      socket?.send(
        JSON.stringify({
          type: INIT_GAME,
          username,
          email,
        })
      );
    }
    const handleMessage = (event: MessageEvent) => {
      const message = JSON.parse(event.data);
      if (message.type === INIT_GAME) {
        // console.log(message);
        setOppName(message.payload.oppName);
        setColor(message.payload.color);
        navigate("/play");
      }
    };
    socket.onmessage = handleMessage;
    return () => {
      socket.onmessage = null;
    };
  }, [socket, username, isLoggedIn]);

  useGSAP(() => {
    // Animate chess pieces while waiting
    gsap.to(".chess-piece", {
      y: -20,
      stagger: 0.1,
      repeat: -1,
      yoyo: true,
      ease: "power1.inOut",
    });
  }, []);

  const cancelWait = () => {
    socket?.send(
      JSON.stringify({
        type: PLAYER_RESIGN,
      })
    );
    socket?.close();
    setHasSocket(false);
    navigate("/");
  };

  return (
    <div className="min-h-screen flex-center flex-col background text-white ">
      <div className="relative w-64 h-64">
        {peices.map((piece, index) => (
          <div
            key={index}
            className="chess-piece absolute text-6xl "
            style={{
              top: `${Math.sin((index / 3) * Math.PI) * 95 + 95}px`,
              left: `${Math.cos((index / 3) * Math.PI) * 95 + 95}px`,
            }}
          >
            {piece}
          </div>
        ))}
      </div>
      <h2 className="waiting-text mt-8 text-2xl font-bold w-full text-center mb-10">
        Please wait while we find your opponent
      </h2>
      <div onClick={cancelWait}>
        <Button text="Cancel" />
      </div>
    </div>
  );
}
